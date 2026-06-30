'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import type { Weekday, TimeRange } from '@/lib/booking'

export interface CalendarConfigInput {
  enabled: boolean
  slot_minutes: number
  min_hours_notice: number
  max_days_ahead: number
  weekly: Partial<Record<Weekday, TimeRange[]>>
  mode: 'in_person' | 'video' | 'both'
  location_text: string
  instructions: string
}

export async function saveCalendarConfig(input: CalendarConfigInput): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getDealerAccess(user.id)
  if (!access) return { ok: false, error: 'no_access' }

  const admin = createAdminClient()

  // Gate por plan (Elite/Grupo).
  const { data: dealer } = await admin.from('dealers').select('subscription_plan').eq('id', access.dealerId).single()
  const plan = dealer?.subscription_plan
  if (plan !== 'elite' && plan !== 'grupo') return { ok: false, error: 'not_entitled' }

  const clampInt = (v: number, min: number, max: number, dflt: number) => {
    const n = Math.round(Number(v))
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : dflt
  }

  const availability_rules = {
    timezone: 'Europe/Madrid',
    slot_minutes: clampInt(input.slot_minutes, 15, 240, 45),
    buffer_minutes: 0,
    max_days_ahead: clampInt(input.max_days_ahead, 1, 60, 14),
    min_hours_notice: clampInt(input.min_hours_notice, 0, 168, 24),
    weekly: input.weekly || {},
    blackout_dates: [],
  }
  const booking_settings = {
    mode: ['in_person', 'video', 'both'].includes(input.mode) ? input.mode : 'in_person',
    location_text: (input.location_text || '').trim() || null,
    instructions: (input.instructions || '').trim() || null,
  }
  const status = input.enabled ? 'connected' : 'disconnected'

  const { data: existing } = await admin
    .from('showroom_calendar_connections')
    .select('id')
    .eq('dealer_id', access.dealerId)
    .maybeSingle()

  if (existing) {
    const { error } = await admin
      .from('showroom_calendar_connections')
      .update({ provider: 'manual', status, availability_rules, booking_settings, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) return { ok: false, error: 'save_failed' }
  } else {
    const { error } = await admin
      .from('showroom_calendar_connections')
      .insert({ dealer_id: access.dealerId, provider: 'manual', status, availability_rules, booking_settings, connected_at: input.enabled ? new Date().toISOString() : null })
    if (error) return { ok: false, error: 'save_failed' }
  }

  revalidatePath('/dashboard/citas')
  return { ok: true }
}
