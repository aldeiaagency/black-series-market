import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { notifyN8n } from '@/lib/integrations/n8n'

const RESULT_SECRET = process.env.ASSISTANT_RESULT_SECRET ?? ''

function verifyHmac(payload: string, header: string): boolean {
  try {
    const sig  = header.replace(/^sha256=/, '')
    const exp  = createHmac('sha256', RESULT_SECRET).update(payload).digest('hex')
    const a    = Buffer.from(exp,  'hex')
    const b    = Buffer.from(sig,  'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch { return false }
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const sig = req.headers.get('x-bsm-signature') ?? ''

  if (RESULT_SECRET && !verifyHmac(raw, sig)) {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 })
  }

  let body: {
    session_id?:  string
    dealer_id?:   string
    vehicle_id?:  string
    result_type?: 'completed' | 'abandoned' | 'whatsapp_handoff'
    qualification?: {
      intent?: string; budget_range?: string; timeline?: string
      financing?: string; trade_in?: string
      score?: 'hot' | 'warm' | 'cold'; summary?: string; next_action?: string
      score_reason?: string; score_confidence?: number; next_follow_up_at?: string
    }
    contact?: { name?: string; email?: string; phone?: string }
    language?: string
    events?: Array<{ type: string; created_at?: string; payload?: Record<string, unknown> }>
  }
  try { body = JSON.parse(raw) } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const { session_id, dealer_id, vehicle_id, result_type, qualification, contact, language, events } = body

  if (!session_id || !dealer_id) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }
  if (!contact?.name || (!contact?.email && !contact?.phone)) {
    return NextResponse.json({ ok: false, error: 'no_contact_data' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Idempotency: session_id in qualification JSONB
  const { data: existing } = await admin
    .from('leads')
    .select('id')
    .eq('dealer_id', dealer_id)
    .contains('qualification', { session_id })
    .maybeSingle()

  if (existing) return NextResponse.json({ ok: true, id: existing.id, idempotent: true })

  const qualData = {
    session_id,
    ...(qualification ?? {}),
    qualification_partial: result_type !== 'completed',
    language: language || 'es',
  }

  const { data: lead, error } = await admin
    .from('leads')
    .insert({
      dealer_id,
      vehicle_id:     vehicle_id ?? null,
      buyer_name:     contact.name!,
      buyer_email:    contact.email ?? '',
      buyer_phone:    contact.phone ?? null,
      message:        qualification?.summary ?? 'Contacto via asistente de cualificación',
      source_channel: result_type === 'whatsapp_handoff' ? 'whatsapp_click' : 'ficha_assistant',
      qualification:  qualData,
      lead_score:     qualification?.score ?? null,
      score_reason:   qualification?.score_reason ?? null,
      score_confidence: typeof qualification?.score_confidence === 'number' ? qualification.score_confidence : null,
      recommended_next_action: qualification?.next_action ?? null,
      scored_at:      qualification?.score ? new Date().toISOString() : null,
      next_follow_up_at: qualification?.next_follow_up_at ?? null,
      status:         'new',
    })
    .select('id')
    .single()

  if (error || !lead) {
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 500 })
  }

  // Insert events (retroactive from conversation + result)
  const eventRows = [
    ...(events ?? []).map((e) => ({
      lead_id:    lead.id,
      dealer_id,
      type:       e.type,
      payload:    e.payload ?? {},
      created_at: e.created_at ?? new Date().toISOString(),
    })),
    {
      lead_id:    lead.id,
      dealer_id,
      type:       result_type === 'completed'        ? 'assistant_completed'
                : result_type === 'abandoned'         ? 'assistant_abandoned'
                : 'whatsapp_handoff',
      payload:    { score: qualification?.score, summary: qualification?.summary },
      created_at: new Date().toISOString(),
    },
    ...(qualification?.score ? [{
      lead_id:    lead.id,
      dealer_id,
      type:       'lead_scored',
      payload:    {
        score:       qualification.score,
        reason:      qualification.score_reason ?? null,
        confidence:  qualification.score_confidence ?? null,
        next_action: qualification.next_action ?? null,
      },
      created_at: new Date().toISOString(),
    }] : []),
  ]

  await admin.from('lead_events').insert(eventRows)

  notifyN8n('lead.created', {
    entityType: 'lead', entityId: lead.id, dealerId: dealer_id, vehicleId: vehicle_id ?? null,
    payload: { contact, source: 'assistant', result_type, qualification: qualData },
  }).catch(() => {})

  return NextResponse.json({ ok: true, id: lead.id })
}
