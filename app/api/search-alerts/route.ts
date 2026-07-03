import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notifyN8n } from '@/lib/integrations/n8n'
import { isCountRateLimited } from '@/lib/rate-limit'

/**
 * POST /api/search-alerts
 * Persists a search alert server-side (table: search_alerts) for BOTH anonymous and
 * logged-in users, and emits a `search_alert.created` event for n8n. Anonymous alerts
 * were previously stored only in localStorage and lost.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const email = String(body.email || '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Rate limit por email (evita spam de alertas + email relay vía n8n).
  if (await isCountRateLimited(admin, 'search_alerts', 'email', email, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  // Optional session — tie the alert to the user when logged in so it shows in /cuenta/alertas.
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {}

  const vehicleType = ['car', 'motorcycle', 'any'].includes(body.vehicle_type) ? body.vehicle_type : 'any'
  const yearMin = body.year_min ? parseInt(String(body.year_min), 10) : null

  const record = {
    user_id:      userId,
    email,
    phone:        body.phone ? String(body.phone).trim() : null,
    vehicle_type: vehicleType,
    brand:        body.brand ? String(body.brand).trim() : null,
    model:        body.model ? String(body.model).trim() : null,
    budget_max:   body.budget_max ? String(body.budget_max).trim() : null,
    year_min:     Number.isFinite(yearMin) ? yearMin : null,
    km_max:       body.km_max ? String(body.km_max).trim() : null,
    location:     body.location ? String(body.location).trim() : null,
    timeline:     body.timeline ? String(body.timeline).trim() : null,
    is_active:    true,
    source:       userId ? 'web_account' : 'web_anonymous',
  }

  const { data, error } = await admin
    .from('search_alerts')
    .insert(record)
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 500 })
  }

  await notifyN8n('search_alert.created', {
    entityType: 'search_alert',
    entityId: data.id,
    payload: {
      vehicle_type: vehicleType,
      brand: record.brand,
      model: record.model,
      budget_max: record.budget_max,
      location: record.location,
      anonymous: !userId,
      contact: { email, phone: record.phone },
    },
  })

  return NextResponse.json({ ok: true, id: data.id })
}
