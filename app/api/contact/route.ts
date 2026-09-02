import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { notifyContactFormSubmitted } from '@/lib/integrations/n8n'
import { isIpEventRateLimited, getClientIp, hashIdentifier } from '@/lib/rate-limit'

const SUBJECT_VALUES = ['suscripcion', 'soporte', 'editorial', 'facturacion', 'otro'] as const

const schema = z.object({
  name:    z.string().trim().min(2).max(120),
  email:   z.string().trim().email().max(180),
  subject: z.enum(SUBJECT_VALUES),
  message: z.string().trim().min(5).max(2000),
}).strict()

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  }

  const admin = createAdminClient()
  const ipHash = getClientIp(req) ? hashIdentifier(getClientIp(req)!) : null

  // Sin tabla propia (el mensaje solo viaja al outbox + n8n), así que el límite se apoya en
  // analytics_events por IP — mismo mecanismo ya usado en /api/assistant/* (SEC-10).
  if (await isIpEventRateLimited(admin, 'contact_form_submit', ipHash, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  await notifyContactFormSubmitted(parsed.data).catch(() => {})

  return NextResponse.json({ ok: true })
}
