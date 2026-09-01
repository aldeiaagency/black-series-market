import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createHmac } from 'crypto'
import { getClientIp, hashIdentifier, isIpEventRateLimited } from '@/lib/rate-limit'

const WEBHOOK_SECRET = process.env.ASSISTANT_WEBHOOK_SECRET ?? ''
const TIMEOUT_MS     = 5000
// Una conversación real manda varios mensajes seguidos; 60/10min por IP deja margen holgado
// a una sesión activa normal y corta un flood que agotaría presupuesto de OpenAI vía n8n.
const MESSAGE_IP_LIMIT = 60
const MESSAGE_IP_WINDOW_MS = 10 * 60 * 1000
// Factory, not a shared instance: a NextResponse body is consumed once, so a
// single module-level response returns an empty body on every reuse.
const degradation = () => NextResponse.json({ type: 'degradation', fallback: true })

export async function POST(req: NextRequest) {
  let body: { session_id?: string; dealer_id?: string; message?: string; event?: string }
  try { body = await req.json() } catch { return degradation() }

  const { session_id, dealer_id, message, event } = body
  if (!session_id || !dealer_id) return degradation()

  // Sanitize input — no PII in outgoing logs, reject oversized messages
  const sanitized = (message ?? '').slice(0, 2000).replace(/<[^>]*>/g, '')

  const admin = createAdminClient()

  const clientIp = getClientIp(req)
  const ipHash = clientIp ? hashIdentifier(clientIp) : null
  if (await isIpEventRateLimited(admin, 'assistant_message', ipHash, MESSAGE_IP_LIMIT, MESSAGE_IP_WINDOW_MS)) {
    return NextResponse.json({ type: 'degradation', fallback: true, reason: 'rate_limited' }, { status: 429 })
  }

  const { data: cfg } = await admin
    .from('showroom_assistant_config')
    .select('webhook_url, enabled')
    .eq('dealer_id', dealer_id)
    .single()

  if (!cfg?.enabled || !cfg.webhook_url) return degradation()

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

    if (!ext.ok) return degradation()
    const data = await ext.json()
    return NextResponse.json(data)
  } catch {
    return degradation()
  }
}
