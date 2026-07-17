import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'
import { getOrganizationIdForUser, can } from '@/lib/entitlements'
import { normalizeRules, normalizeSettings, type AvailabilityRules, type BookingSettings, type BusyRange } from '@/lib/booking'
import { getFreeBusy } from '@/lib/google-calendar'

export interface BookingContext {
  enabled: boolean
  reason?: 'no_dealer' | 'no_org' | 'not_entitled' | 'not_connected'
  dealer?: { id: string; name: string; profile_id: string }
  rules?: AvailabilityRules
  settings?: BookingSettings
  /** Qué conexión sostiene el `enabled`. 'google_calendar' activa el cruce contra freeBusy real y la creación de eventos. */
  provider?: 'manual' | 'google_calendar'
}

/**
 * Resuelve si un showroom puede reservar citas por el agente (Fase B/A):
 * 1) tiene el entitlement `appointment_booking` operativo (Elite/Grupo), y
 * 2) tiene al menos una conexión de calendario `connected` — un dealer puede
 *    tener dos filas a la vez (`manual` y `google_calendar`, UNIQUE(dealer_id, provider));
 *    se prioriza `google_calendar` conectada, si no existe se usa `manual`.
 * El horario semanal (rules/settings) siempre sale de la fila `manual` — es la única
 * plantilla de ventanas declarada; Google solo aporta huecos realmente ocupados
 * encima de esa plantilla (ver getFreeBusy en las rutas que calculan huecos).
 * Es la única fuente de verdad del gating de reserva (la usan los dos endpoints).
 */
export async function getDealerBookingContext(dealerId: string): Promise<BookingContext> {
  const admin = createAdminClient()

  const { data: dealer } = await admin
    .from('dealers')
    .select('id, name, profile_id')
    .eq('id', dealerId)
    .single()
  if (!dealer?.profile_id) return { enabled: false, reason: 'no_dealer' }

  const orgId = await getOrganizationIdForUser(dealer.profile_id as string)
  if (!orgId) return { enabled: false, reason: 'no_org' }

  const allowed = await can(orgId, 'use_appointment_booking')
  if (!allowed) return { enabled: false, reason: 'not_entitled' }

  const { data: conns } = await admin
    .from('showroom_calendar_connections')
    .select('provider, status, availability_rules, booking_settings')
    .eq('dealer_id', dealerId)
    .in('provider', ['manual', 'google_calendar'])
  const manualRow = conns?.find(c => c.provider === 'manual')
  const googleRow = conns?.find(c => c.provider === 'google_calendar' && c.status === 'connected')
  const connected = !!googleRow || manualRow?.status === 'connected'
  if (!connected) return { enabled: false, reason: 'not_connected' }

  return {
    enabled: true,
    dealer: { id: dealer.id as string, name: dealer.name as string, profile_id: dealer.profile_id as string },
    rules: normalizeRules(manualRow?.availability_rules),
    settings: normalizeSettings(manualRow?.booking_settings),
    provider: googleRow ? 'google_calendar' : 'manual',
  }
}

/** Citas futuras ya ocupadas (proposed/confirmed) de un showroom, como rangos [start, start+slotMinutes). */
export async function getBookedRanges(dealerId: string, slotMinutes: number): Promise<BusyRange[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('appointments')
    .select('starts_at')
    .eq('dealer_id', dealerId)
    .in('status', ['proposed', 'confirmed'])
    .gte('starts_at', new Date().toISOString())
  return (data || [])
    .map(r => r.starts_at as string)
    .filter(Boolean)
    .map(startIso => ({ start: startIso, end: new Date(new Date(startIso).getTime() + slotMinutes * 60_000).toISOString() }))
}

/**
 * Todos los rangos ocupados a excluir al calcular huecos: citas internas siempre,
 * más el freeBusy real de Google si `ctx.provider === 'google_calendar'` (un fallo
 * de Google ya degrada a [] dentro de getFreeBusy — nunca rompe este cálculo).
 */
export async function getBusyRanges(dealerId: string, ctx: Pick<BookingContext, 'rules' | 'provider'>): Promise<BusyRange[]> {
  if (!ctx.rules) return []
  const internal = await getBookedRanges(dealerId, ctx.rules.slot_minutes)
  if (ctx.provider !== 'google_calendar') return internal
  const admin = createAdminClient()
  const now = new Date()
  const horizon = new Date(now.getTime() + ctx.rules.max_days_ahead * 86400_000)
  const google = await getFreeBusy(admin, dealerId, now.toISOString(), horizon.toISOString())
  return [...internal, ...google]
}
