import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getOrganizationIdForUser, getEntitlements } from '@/lib/entitlements'
import { getDealerBookingContext } from '@/lib/assistant-booking'
import { createHmac } from 'crypto'

const WEBHOOK_SECRET  = process.env.ASSISTANT_WEBHOOK_SECRET ?? ''
const TIMEOUT_MS      = 5000
// Must be a factory, not a shared instance: a NextResponse body is a one-shot
// stream. Reusing a single module-level response makes every fallback after the
// first return an empty body (content-length 0).
const classic = () => NextResponse.json({ mode: 'classic' })

export async function POST(req: NextRequest) {
  let body: { vehicle_id?: string; language?: string }
  try { body = await req.json() } catch { return classic() }

  const vehicleId = body.vehicle_id
  if (!vehicleId) return classic()

  const admin = createAdminClient()

  // Fetch vehicle + dealer (public fields only)
  const { data: vehicle } = await admin
    .from('vehicles')
    .select('id, brand_name, model_name, year, version, price, price_on_request, fuel_type, mileage_km, power_hp, dealer_id, dealer:dealers!inner(id, profile_id, name, location_city, whatsapp, slug, profile_status)')
    .eq('id', vehicleId)
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .single()

  if (!vehicle?.dealer) return classic()
  const dealer = vehicle.dealer as Record<string, any>

  // Check entitlement server-side
  try {
    const orgId = await getOrganizationIdForUser(dealer.profile_id as string)
    if (!orgId) return classic()
    const ent = await getEntitlements(orgId)
    const feat = ent?.features['lead_qualification_assistant']
    if (!feat?.included || feat.status !== 'operative') return classic()
  } catch {
    return classic()
  }

  // Check per-showroom assistant config
  const { data: cfg } = await admin
    .from('showroom_assistant_config')
    .select('webhook_url, enabled, whatsapp_number, languages, context')
    .eq('dealer_id', dealer.id)
    .single()

  if (!cfg?.enabled || !cfg.webhook_url) return classic()

  const cfgContext = cfg.context as Record<string, any> | null | undefined
  const setupRoomRaw = cfgContext && typeof cfgContext === 'object' && !Array.isArray(cfgContext)
    ? cfgContext.setup_room
    : null
  const setupRoom = setupRoomRaw && typeof setupRoomRaw === 'object' && !Array.isArray(setupRoomRaw)
    ? setupRoomRaw as Record<string, any>
    : {}
  const financingRaw = setupRoom.financing
  const financing = financingRaw && typeof financingRaw === 'object' && !Array.isArray(financingRaw)
    ? financingRaw as Record<string, any>
    : {}
  const services = Array.isArray(setupRoom.services)
    ? setupRoom.services.filter((service): service is string => typeof service === 'string')
    : []

  // ¿El showroom puede reservar cita? (Elite/Grupo con entitlement + calendario configurado)
  let bookingEnabled = false
  try { bookingEnabled = (await getDealerBookingContext(dealer.id as string)).enabled } catch {}

  // Build context payload (only public vehicle data)
  const sessionId   = crypto.randomUUID()
  const vehicleTitle = [vehicle.brand_name, vehicle.model_name, vehicle.year, vehicle.version]
    .filter(Boolean).join(' ')
  const language = body.language || (cfg.languages as string[])?.[0] || 'es'

  const payload = {
    session_id: sessionId,
    // WF7 validates a top-level dealer_id (same contract as /api/assistant/message).
    // Without it the workflow responds 400 and the widget falls back to the classic form.
    dealer_id:  dealer.id,
    event:      'session_start',
    language,
    vehicle: {
      id:               vehicle.id,
      title:            vehicleTitle,
      brand:            vehicle.brand_name,
      model:            vehicle.model_name,
      year:             vehicle.year,
      price:            vehicle.price_on_request ? null : vehicle.price,
      price_on_request: vehicle.price_on_request ?? false,
      fuel_type:        vehicle.fuel_type ?? null,
      mileage_km:       vehicle.mileage_km ?? null,
      power_hp:         vehicle.power_hp ?? null,
    },
    showroom: {
      id:          dealer.id,
      name:        dealer.name,
      city:        dealer.location_city ?? null,
      whatsapp:    (cfg.whatsapp_number as string) || (dealer.whatsapp as string) || null,
      profile_url: `/dealers/${dealer.slug}`,
      financing_available: financing.available === true,
      financing_conditions: typeof financing.conditions === 'string' ? financing.conditions : null,
      attention_hours:      typeof setupRoom.attention_hours === 'string' ? setupRoom.attention_hours : null,
      negotiation_style:    typeof setupRoom.negotiation_style === 'string' ? setupRoom.negotiation_style : null,
      services,
    },
  }

  // Sign and forward to external webhook
  try {
    const body_str = JSON.stringify(payload)
    const sig      = createHmac('sha256', WEBHOOK_SECRET).update(body_str).digest('hex')

    const ctrl  = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

    const ext = await fetch(cfg.webhook_url as string, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-BSM-Signature': sig },
      body:    body_str,
      signal:  ctrl.signal,
    })
    clearTimeout(timer)

    if (!ext.ok) return classic()

    const extData = await ext.json()
    return NextResponse.json({
      mode:            'assistant',
      session_id:      sessionId,
      dealer_id:       dealer.id,
      opening_message: extData.message ?? extData.opening_message ?? null,
      dealer_whatsapp: (cfg.whatsapp_number as string) || (dealer.whatsapp as string) || null,
      booking_enabled: bookingEnabled,
    })
  } catch {
    return classic()
  }
}
