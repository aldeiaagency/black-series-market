import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getOrganizationIdForUser, getEntitlements } from '@/lib/entitlements'
import { getDealerBookingContext } from '@/lib/assistant-booking'
import { createHmac } from 'crypto'
import { getClientIp, hashIdentifier, isIpEventRateLimited } from '@/lib/rate-limit'

const WEBHOOK_SECRET  = process.env.ASSISTANT_WEBHOOK_SECRET ?? ''
const TIMEOUT_MS      = 5000
// Arrancar una sesión nueva es más "caro" de sospechar que un mensaje suelto dentro de una
// ya abierta — 20/10min por IP es holgado para un visitante mirando varias fichas seguidas.
const SESSION_IP_LIMIT = 20
const SESSION_IP_WINDOW_MS = 10 * 60 * 1000

const ACQUISITION_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'referrer', 'landing_path', 'entry_point', 'cep',
] as const

function sanitizeAcquisition(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const source = value as Record<string, unknown>
  const result: Record<string, string> = {}
  for (const key of ACQUISITION_KEYS) {
    if (typeof source[key] !== 'string') continue
    const max = key === 'referrer' || key === 'landing_path' ? 1000 : 200
    const cleaned = source[key].trim().slice(0, max)
    if (cleaned) result[key] = cleaned
  }
  return result
}
// Must be a factory, not a shared instance: a NextResponse body is a one-shot
// stream. Reusing a single module-level response makes every fallback after the
// first return an empty body (content-length 0).
const classic = () => NextResponse.json({ mode: 'classic' })

export async function POST(req: NextRequest) {
  let body: { vehicle_id?: string; language?: string; acquisition_context?: unknown }
  try { body = await req.json() } catch { return classic() }

  const vehicleId = body.vehicle_id
  if (!vehicleId) return classic()

  const admin = createAdminClient()

  const clientIp = getClientIp(req)
  const ipHash = clientIp ? hashIdentifier(clientIp) : null
  if (await isIpEventRateLimited(admin, 'assistant_session', ipHash, SESSION_IP_LIMIT, SESSION_IP_WINDOW_MS)) {
    return classic()
  }

  // Fetch vehicle + dealer (public fields only)
  const { data: vehicle } = await admin
    .from('vehicles')
    .select('id, brand_name, model_name, year, version, price, price_on_request, fuel_type, mileage_km, power_hp, condition_type, description, equipment, registration_country, num_owners, has_service_history, has_carfax, itv_valid_until, location_province, dealer_id, dealer:dealers!inner(id, profile_id, name, description, location_city, whatsapp, slug, profile_status)')
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

  // Best-effort: guarda la atribución de origen contra este session_id para que el
  // webhook de resultado (assistant-result) pueda recuperarla al crear el lead — el
  // asistente corre server-to-server y no tiene acceso al sessionStorage del navegador.
  admin.from('analytics_events').insert({
    event_type: 'assistant_started',
    vehicle_id: vehicleId,
    dealer_id:  dealer.id,
    session_id: sessionId,
    metadata:   { acquisition_context: sanitizeAcquisition(body.acquisition_context) },
  }).then(() => {}, () => {})
  const language = body.language || (cfg.languages as string[])?.[0] || 'es'

  const payload = {
    session_id: sessionId,
    // WF7 validates a top-level dealer_id (same contract as /api/assistant/message).
    // Without it the workflow responds 400 and the widget falls back to the classic form.
    dealer_id:  dealer.id,
    event:      'session_start',
    language,
    vehicle: {
      id:                    vehicle.id,
      title:                 vehicleTitle,
      brand:                 vehicle.brand_name,
      model:                 vehicle.model_name,
      year:                  vehicle.year,
      price:                 vehicle.price_on_request ? null : vehicle.price,
      price_on_request:      vehicle.price_on_request ?? false,
      fuel_type:             vehicle.fuel_type ?? null,
      mileage_km:            vehicle.mileage_km ?? null,
      power_hp:              vehicle.power_hp ?? null,
      // Mismos campos que ya se muestran en la ficha pública (VehicleDetailContent) — el
      // asistente no debe saber menos que lo que el comprador ya está viendo en pantalla.
      condition:             vehicle.condition_type ?? null,
      description:           vehicle.description ?? null,
      equipment:             Array.isArray(vehicle.equipment) ? vehicle.equipment : null,
      registration_country:  vehicle.registration_country ?? null,
      location_province:     vehicle.location_province ?? null,
      num_owners:            vehicle.num_owners ?? null,
      has_service_history:   vehicle.has_service_history ?? null,
      has_carfax:            vehicle.has_carfax ?? null,
      itv_valid_until:       vehicle.itv_valid_until ?? null,
    },
    showroom: {
      id:          dealer.id,
      name:        dealer.name,
      city:        dealer.location_city ?? null,
      whatsapp:    (cfg.whatsapp_number as string) || (dealer.whatsapp as string) || null,
      profile_url: `/dealers/${dealer.slug}`,
      description: (dealer.description as string) || null,
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
