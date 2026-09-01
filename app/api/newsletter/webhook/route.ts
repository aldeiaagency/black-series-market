import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { NEWSLETTER_TOPIC_LIST_IDS } from '@/lib/newsletter'

const BLM_LIST_IDS = new Set(Object.values(NEWSLETTER_TOPIC_LIST_IDS))

// Brevo no documenta firma HMAC para webhooks de marketing — la autenticación es un
// secreto compartido en cabecera, configurado al crear el webhook (soporta cabeceras
// personalizadas). Comparación en tiempo constante, mismo rigor que assistant-result.
function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.NEWSLETTER_WEBHOOK_SECRET
  if (!expected) return false // fail-closed: sin secreto configurado, no se acepta nada
  const provided = req.headers.get('x-blm-webhook-secret') ?? ''
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function hashEmail(email: string): string | null {
  const salt = process.env.NEWSLETTER_HASH_SALT
  if (!salt) return null
  return createHash('sha256').update(`${salt}:${email.trim().toLowerCase()}`).digest('hex')
}

// La documentación de Brevo es inconsistente entre páginas (camelCase al configurar el
// webhook, snake_case en ejemplos de payload real, y al menos una variante "soft_bounced"
// distinta de "soft_bounce") — se aceptan todas las formas vistas, no se elige una sola.
const CONFIRMED_EVENTS = new Set(['list_addition', 'listAddition'])
const UNSUBSCRIBED_EVENTS = new Set(['unsubscribe', 'unsubscribed'])
const HARD_BOUNCE_EVENTS = new Set(['hard_bounce', 'hardBounce'])
const SOFT_BOUNCE_EVENTS = new Set(['soft_bounce', 'softBounce', 'soft_bounced'])
const SPAM_EVENTS = new Set(['spam'])
const DELETED_EVENTS = new Set(['contact_deleted', 'contactDeleted'])

// Brevo documenta `ts` como unix timestamp inequívoco junto a `date`/`date_event` en
// texto plano sin zona horaria explícita (su documentación dice CET/CEST, pero no es
// fiable parsear eso a ciegas) — se usa solo `ts`; si no viene, se cae a la hora de
// recepción del webhook en vez de adivinar una zona horaria.
function parseEventTimestamp(body: Record<string, unknown>): string {
  if (typeof body.ts === 'number') return new Date(body.ts * 1000).toISOString()
  return new Date().toISOString()
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const event = typeof body.event === 'string' ? body.event : ''
  const email = typeof body.email === 'string' ? body.email : ''

  if (!email) {
    // Responder 200 igualmente — Brevo reintenta si no, y un payload sin email
    // no es un evento que podamos procesar ni un fallo nuestro.
    return NextResponse.json({ ok: true, skipped: 'no_email' })
  }

  const emailHash = hashEmail(email)
  if (!emailHash) {
    return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 503 })
  }

  // El payload de list_addition/unsubscribe trae `list_id` (array) — se exige que
  // intersecte con las listas reales de BLM, para no reaccionar a eventos de otras
  // listas que puedan existir algún día en la misma cuenta de Brevo.
  const rawListIds = Array.isArray(body.list_id) ? body.list_id : []
  const touchesBlmList = rawListIds.some((id) => BLM_LIST_IDS.has(Number(id)))

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('newsletter_subscriptions')
    .select('id, status, confirmed_at, unsubscribed_at')
    .eq('email_hash', emailHash)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ ok: true, skipped: 'unknown_email' })
  }

  const eventAt = parseEventTimestamp(body)
  const patch: Record<string, unknown> = { last_webhook_event: event }
  let status: string | null = null

  if (CONFIRMED_EVENTS.has(event) && touchesBlmList) {
    status = 'confirmed'
    patch.status = status
    // Idempotente ante reintentos de Brevo: no se pisa una confirmación ya registrada.
    if (!existing.confirmed_at) patch.confirmed_at = eventAt
  } else if (UNSUBSCRIBED_EVENTS.has(event) && touchesBlmList) {
    status = 'unsubscribed'
    patch.status = status
    if (!existing.unsubscribed_at) patch.unsubscribed_at = eventAt
  } else if (HARD_BOUNCE_EVENTS.has(event) || SOFT_BOUNCE_EVENTS.has(event)) {
    status = 'bounced'
    patch.status = status
  } else if (SPAM_EVENTS.has(event)) {
    status = 'spam'
    patch.status = status
  } else if (DELETED_EVENTS.has(event)) {
    status = 'deleted'
    patch.status = status
  }
  // Otros eventos (opened/click/delivered, o list_addition/unsubscribe de una lista
  // ajena a BLM): se guarda last_webhook_event, sin tocar status.

  const { error } = await admin
    .from('newsletter_subscriptions')
    .update(patch)
    .eq('id', existing.id)

  if (error) {
    return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status })
}
