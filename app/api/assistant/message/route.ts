import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createHmac } from 'crypto'

const WEBHOOK_SECRET = process.env.ASSISTANT_WEBHOOK_SECRET ?? ''
const TIMEOUT_MS     = 5000
const DEGRADATION    = NextResponse.json({ type: 'degradation', fallback: true })

export async function POST(req: NextRequest) {
  let body: { session_id?: string; dealer_id?: string; message?: string; event?: string }
  try { body = await req.json() } catch { return DEGRADATION }

  const { session_id, dealer_id, message, event } = body
  if (!session_id || !dealer_id) return DEGRADATION

  // Sanitize input — no PII in outgoing logs, reject oversized messages
  const sanitized = (message ?? '').slice(0, 2000).replace(/<[^>]*>/g, '')

  const admin = createAdminClient()
  const { data: cfg } = await admin
    .from('showroom_assistant_config')
    .select('webhook_url, enabled')
    .eq('dealer_id', dealer_id)
    .single()

  if (!cfg?.enabled || !cfg.webhook_url) return DEGRADATION

  const forward    = JSON.stringify({ session_id, dealer_id, message: sanitized, event: event || 'message' })
  const sig        = createHmac('sha256', WEBHOOK_SECRET).update(forward).digest('hex')

  try {
    const ctrl  = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

    const ext = await fetch(cfg.webhook_url as string, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-BSM-Signature': sig },
      body:    forward,
      signal:  ctrl.signal,
    })
    clearTimeout(timer)

    if (!ext.ok) return DEGRADATION
    const data = await ext.json()
    return NextResponse.json(data)
  } catch {
    return DEGRADATION
  }
}
