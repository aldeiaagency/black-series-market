import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getOrganizationIdForUser, getEntitlements } from '@/lib/entitlements'
import { createHmac } from 'crypto'

const WEBHOOK_SECRET  = process.env.ASSISTANT_WEBHOOK_SECRET ?? ''
const TIMEOUT_MS      = 5000
const CLASSIC         = NextResponse.json({ mode: 'classic' })

export async function POST(req: NextRequest) {
  let body: { vehicle_id?: string; language?: string }
  try { body = await req.json() } catch { return CLASSIC }

  const vehicleId = body.vehicle_id
  if (!vehicleId) return CLASSIC

  const admin = createAdminClient()

  // Fetch vehicle + dealer (public fields only)
  const { data: vehicle } = await admin
    .from('vehicles')
    .select('id, brand_name, model_name, year, version, price, price_on_request, fuel_type, mileage_km, power_hp, dealer_id, dealer:dealers(id, profile_id, name, location_city, whatsapp, slug)')
    .eq('id', vehicleId)
    .eq('status', 'active')
    .single()

  if (!vehicle?.dealer) return CLASSIC
  const dealer = vehicle.dealer as Record<string, any>

  // Check entitlement server-side
  try {
    const orgId = await getOrganizationIdForUser(dealer.profile_id as string)
    if (!orgId) return CLASSIC
    const ent = await getEntitlements(orgId)
    const feat = ent?.features['lead_qualification_assistant']
    if (!feat?.included || feat.status !== 'operative') return CLASSIC
  } catch {
    return CLASSIC
  }

  // Check per-showroom assistant config
  const { data: cfg } = await admin
    .from('showroom_assistant_config')
    .select('webhook_url, enabled, whatsapp_number, languages')
    .eq('dealer_id', dealer.id)
    .single()

  if (!cfg?.enabled || !cfg.webhook_url) return CLASSIC

  // Build context payload (only public vehicle data)
  const sessionId   = crypto.randomUUID()
  const vehicleTitle = [vehicle.brand_name, vehicle.model_name, vehicle.year, vehicle.version]
    .filter(Boolean).join(' ')
  const language = body.language || (cfg.languages as string[])?.[0] || 'es'

  const payload = {
    session_id: sessionId,
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

    if (!ext.ok) return CLASSIC

    const extData = await ext.json()
    return NextResponse.json({
      mode:            'assistant',
      session_id:      sessionId,
      dealer_id:       dealer.id,
      opening_message: extData.message ?? extData.opening_message ?? null,
      dealer_whatsapp: (cfg.whatsapp_number as string) || (dealer.whatsapp as string) || null,
    })
  } catch {
    return CLASSIC
  }
}
