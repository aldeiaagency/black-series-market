import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'
import { getOrganizationIdForUser, can } from '@/lib/entitlements'
import { normalizeRules, normalizeSettings, type AvailabilityRules, type BookingSettings } from '@/lib/booking'

export interface BookingContext {
  enabled: boolean
  reason?: 'no_dealer' | 'no_org' | 'not_entitled' | 'not_connected'
  dealer?: { id: string; name: string; profile_id: string }
  rules?: AvailabilityRules
  settings?: BookingSettings
}

/**
 * Resuelve si un showroom puede reservar citas por el agente (Fase B):
 * 1) tiene el entitlement `appointment_booking` operativo (Elite/Grupo), y
 * 2) tiene una conexión de calendario `connected` con reglas de disponibilidad.
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

  const { data: conn } = await admin
    .from('showroom_calendar_connections')
    .select('status, availability_rules, booking_settings')
    .eq('dealer_id', dealerId)
    .single()
  if (!conn || conn.status !== 'connected') return { enabled: false, reason: 'not_connected' }

  return {
    enabled: true,
    dealer: { id: dealer.id as string, name: dealer.name as string, profile_id: dealer.profile_id as string },
    rules: normalizeRules(conn.availability_rules),
    settings: normalizeSettings(conn.booking_settings),
  }
}

/** Citas futuras ya ocupadas (proposed/confirmed) de un showroom, en ISO. */
export async function getBookedStarts(dealerId: string): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('appointments')
    .select('starts_at')
    .eq('dealer_id', dealerId)
    .in('status', ['proposed', 'confirmed'])
    .gte('starts_at', new Date().toISOString())
  return (data || []).map(r => r.starts_at as string).filter(Boolean)
}
