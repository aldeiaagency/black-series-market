import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createHmac, timingSafeEqual } from 'crypto'

const APPT_SECRET = process.env.APPOINTMENT_RESULT_SECRET ?? ''

function verifyHmac(payload: string, header: string): boolean {
  try {
    const sig = header.replace(/^sha256=/, '')
    const exp = createHmac('sha256', APPT_SECRET).update(payload).digest('hex')
    const a   = Buffer.from(exp, 'hex')
    const b   = Buffer.from(sig, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch { return false }
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const sig = req.headers.get('x-bsm-signature') ?? ''

  if (APPT_SECRET && !verifyHmac(raw, sig)) {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 })
  }

  let body: {
    lead_id?: string; dealer_id?: string; vehicle_id?: string
    starts_at?: string; preferred_time_text?: string; calendar_event_ref?: string
    provider?: 'google_calendar' | 'outlook_calendar'
    external_event_id?: string
    meeting_url?: string
    location_text?: string
    workflow_ref?: string
    metadata?: Record<string, unknown>
    fallback?: boolean
  }
  try { body = JSON.parse(raw) } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const {
    lead_id,
    dealer_id,
    vehicle_id,
    starts_at,
    preferred_time_text,
    calendar_event_ref,
    provider,
    external_event_id,
    meeting_url,
    location_text,
    workflow_ref,
    metadata,
    fallback,
  } = body
  if (!lead_id || !dealer_id) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: appt, error } = await admin
    .from('appointments')
    .insert({
      lead_id,
      vehicle_id:          vehicle_id ?? null,
      dealer_id,
      starts_at:           starts_at ?? null,
      status:              fallback ? 'proposed' : 'confirmed',
      preferred_time_text: preferred_time_text ?? null,
      calendar_event_ref:  calendar_event_ref ?? null,
      provider:            provider ?? null,
      external_event_id:   external_event_id ?? calendar_event_ref ?? null,
      meeting_url:         meeting_url ?? null,
      location_text:       location_text ?? null,
      workflow_ref:        workflow_ref ?? null,
      metadata:            metadata ?? {},
    })
    .select('id')
    .single()

  if (error || !appt) {
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 500 })
  }

  await Promise.all([
    admin.from('leads').update({ status: 'appointment' }).eq('id', lead_id),
    admin.from('lead_events').insert({
      lead_id,
      dealer_id,
      type:    fallback ? 'appointment_proposed' : 'appointment_confirmed',
      payload: {
        appointment_id: appt.id,
        starts_at: starts_at ?? null,
        fallback: !!fallback,
        provider: provider ?? null,
        external_event_id: external_event_id ?? calendar_event_ref ?? null,
        workflow_ref: workflow_ref ?? null,
      },
    }),
  ])

  return NextResponse.json({ ok: true, id: appt.id })
}
