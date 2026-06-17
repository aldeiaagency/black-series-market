import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createHmac, timingSafeEqual } from 'crypto'

const ALERT_SECRET = process.env.HOT_LEAD_ALERT_SECRET ?? ''

function verifyHmac(payload: string, header: string): boolean {
  try {
    const sig = header.replace(/^sha256=/, '')
    const exp = createHmac('sha256', ALERT_SECRET).update(payload).digest('hex')
    const a = Buffer.from(exp, 'hex')
    const b = Buffer.from(sig, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const sig = req.headers.get('x-bsm-signature') ?? ''

  if (ALERT_SECRET && !verifyHmac(raw, sig)) {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 })
  }

  let body: {
    lead_id?: string
    dealer_id?: string
    type?: 'hot_lead_unattended' | 'appointment_due' | 'follow_up_due'
    severity?: 'low' | 'medium' | 'high'
    message?: string
    due_at?: string
    workflow_ref?: string
    payload?: Record<string, unknown>
  }

  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const {
    lead_id,
    dealer_id,
    type = 'hot_lead_unattended',
    severity = 'high',
    message,
    due_at,
    workflow_ref,
    payload,
  } = body

  if (!lead_id || !dealer_id) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: alert, error } = await admin
    .from('lead_alerts')
    .insert({
      lead_id,
      dealer_id,
      type,
      severity,
      message: message ?? null,
      due_at: due_at ?? null,
      workflow_ref: workflow_ref ?? null,
      payload: payload ?? {},
    })
    .select('id')
    .single()

  if (error || !alert) {
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 500 })
  }

  await admin.from('lead_events').insert({
    lead_id,
    dealer_id,
    type: 'hot_lead_alert_created',
    payload: {
      alert_id: alert.id,
      alert_type: type,
      severity,
      workflow_ref: workflow_ref ?? null,
    },
  })

  return NextResponse.json({ ok: true, id: alert.id })
}
