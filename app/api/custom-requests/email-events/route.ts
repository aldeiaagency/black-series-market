import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const emailEventSchema = z.object({
  request_id: z.string().uuid(),
  recipient_email: z.string().email().optional(),
  email_type: z.enum(['buyer_confirmation', 'buyer_follow_up', 'buyer_match', 'other']).default('buyer_confirmation'),
  subject: z.string().trim().max(180).optional(),
  provider_message_id: z.string().trim().max(180).optional(),
  sent_at: z.string().datetime().optional(),
}).strict()

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

export async function POST(req: NextRequest) {
  const token = process.env.CUSTOM_REQUESTS_INTERNAL_TOKEN
  const auth = req.headers.get('authorization')

  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = emailEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  }

  const input = parsed.data
  const admin = createAdminClient()
  const { data: request, error: readError } = await admin
    .from('custom_requests')
    .select('id, email, status, metadata')
    .eq('id', input.request_id)
    .single()

  if (readError || !request) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  if (input.recipient_email && input.recipient_email.toLowerCase() !== String(request.email).toLowerCase()) {
    return NextResponse.json({ ok: false, error: 'recipient_mismatch' }, { status: 400 })
  }

  const metadata = asRecord(request.metadata)
  const previousCount = Number(metadata.buyer_email_count ?? 0)
  const buyerEmailCount = Number.isFinite(previousCount) ? previousCount + 1 : 1
  const previousEvents = Array.isArray(metadata.buyer_email_events)
    ? metadata.buyer_email_events.slice(-9)
    : []

  const buyerEmailEvents = [
    ...previousEvents,
    {
      type: input.email_type,
      subject: input.subject ?? null,
      provider_message_id: input.provider_message_id ?? null,
      sent_at: input.sent_at ?? new Date().toISOString(),
    },
  ]

  const nextStatus = buyerEmailCount >= 3 && ['new', 'in_review'].includes(request.status)
    ? 'contacted'
    : request.status

  const { error: updateError } = await admin
    .from('custom_requests')
    .update({
      status: nextStatus,
      metadata: {
        ...metadata,
        buyer_email_count: buyerEmailCount,
        buyer_email_events: buyerEmailEvents,
        last_buyer_email_at: buyerEmailEvents[buyerEmailEvents.length - 1].sent_at,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', request.id)

  if (updateError) {
    return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    request_id: request.id,
    buyer_email_count: buyerEmailCount,
    status: nextStatus,
    status_changed: nextStatus !== request.status,
  })
}
