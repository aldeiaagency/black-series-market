import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { isGlobalRateLimited } from '@/lib/rate-limit'
import {
  NEWSLETTER_ACTIVE_TOPICS,
  NEWSLETTER_CONSENT_TEXT,
  NEWSLETTER_CONSENT_VERSION,
  NEWSLETTER_TOPIC_LIST_IDS,
} from '@/lib/newsletter'

// Cooldown por email real (no un rate-limit por conteo de filas — email_hash es único,
// así que solo puede haber 0 o 1 fila por email; el freno de verdad es este cooldown
// sobre el último envío CONFIRMADO a Brevo, no sobre el último intento).
const RESEND_COOLDOWN_MS = 15 * 60 * 1000
const GLOBAL_LIMIT_PER_HOUR = 100
// Suelo mínimo de respuesta: el caso "ya confirmado" solo hace un SELECT y podría
// responder antes que el caso "nuevo" (llamada a Brevo) — un timing observable
// revelaría igualmente si el email ya estaba registrado.
const MIN_RESPONSE_MS = 400

const ACQUISITION_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'referrer', 'landing_path', 'entry_point', 'cep',
] as const

function sanitizeAcquisition(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const source = value as Record<string, unknown>
  const result: Record<string, string> = {}
  for (const key of ACQUISITION_KEYS) {
    if (typeof source[key] !== 'string') continue
    const max = key === 'referrer' || key === 'landing_path' ? 1000 : 200
    const cleaned = source[key].trim().slice(0, max)
    if (cleaned) result[key] = cleaned
  }
  return result
}

function hashEmail(email: string): string | null {
  const salt = process.env.NEWSLETTER_HASH_SALT
  if (!salt) return null // fail-closed: sin salt propio no se procesa nada
  return createHash('sha256').update(`${salt}:${email.trim().toLowerCase()}`).digest('hex')
}

function genericOk() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now()
  const respondGeneric = async () => {
    const elapsed = Date.now() - startedAt
    if (elapsed < MIN_RESPONSE_MS) {
      await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed))
    }
    return genericOk()
  }

  let body: {
    email?: unknown
    topics?: unknown
    acquisition_context?: unknown
    landing_path?: unknown
    consent_version?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  // Solo temas activos hoy, sin duplicados — que un tema tenga lista de Brevo asignada
  // no significa que ya se ofrezca. Nunca se rellena en servidor un tema que el usuario
  // no marcó explícitamente.
  const rawTopics = Array.isArray(body.topics) ? body.topics : []
  const topics = Array.from(new Set(rawTopics.filter((t): t is string => typeof t === 'string' && NEWSLETTER_ACTIVE_TOPICS.includes(t))))
  if (topics.length === 0 || topics.length !== new Set(rawTopics).size) {
    return NextResponse.json({ ok: false, error: 'invalid_topics' }, { status: 400 })
  }

  if (body.consent_version !== NEWSLETTER_CONSENT_VERSION) {
    return NextResponse.json({ ok: false, error: 'consent_version_mismatch' }, { status: 400 })
  }

  // Config de Brevo verificada ANTES de tocar la base — si falta, es un fallo de
  // servidor real, no un caso de negocio a fingir con un OK falso.
  const brevoKey = process.env.BREVO_API_KEY
  const templateIdRaw = process.env.BREVO_DOI_TEMPLATE_ID
  const templateId = templateIdRaw ? Number(templateIdRaw) : NaN
  if (!brevoKey || !Number.isInteger(templateId) || templateId <= 0) {
    return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 503 })
  }

  const emailHash = hashEmail(email)
  if (!emailHash) {
    return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 503 })
  }

  const admin = createAdminClient()

  // Circuit breaker global — protege el presupuesto de la API de Brevo frente a un flood.
  if (await isGlobalRateLimited(admin, 'newsletter_subscriptions', GLOBAL_LIMIT_PER_HOUR, 60 * 60 * 1000)) {
    return respondGeneric()
  }

  const listIds = topics.map((t) => NEWSLETTER_TOPIC_LIST_IDS[t])
  const acquisitionContext = sanitizeAcquisition(body.acquisition_context)
  const landingPath = typeof body.landing_path === 'string' ? body.landing_path.slice(0, 1000) : null

  const { data: existing, error: existingError } = await admin
    .from('newsletter_subscriptions')
    .select('id, status, requested_at')
    .eq('email_hash', emailHash)
    .maybeSingle()

  if (existingError) {
    // No seguir a Brevo si ni siquiera se puede leer el ledger — enviaría un DOI real
    // sin poder mantener la prueba de consentimiento.
    console.error('newsletter_ledger_lookup_failed', existingError.message)
    return NextResponse.json({ ok: false, error: 'server_unavailable' }, { status: 503 })
  }

  if (existing?.status === 'confirmed') {
    // Ya confirmado: no se reenvía nada, no se dice nada distinto.
    return respondGeneric()
  }

  if (existing && existing.status !== 'pending') {
    // unsubscribed/bounced/spam/deleted: no se reactiva por un submit nuevo,
    // requeriría revisión manual — misma respuesta que cualquier otro caso.
    return respondGeneric()
  }

  if (existing?.status === 'pending') {
    // El cooldown se mide sobre el último envío CONFIRMADO a Brevo (requested_at solo
    // avanza tras éxito, ver más abajo) — un intento previo fallido nunca bloquea el
    // siguiente, porque requested_at se queda en su valor anterior (o null).
    const lastRequested = existing.requested_at ? new Date(existing.requested_at).getTime() : 0
    if (Date.now() - lastRequested < RESEND_COOLDOWN_MS) {
      return respondGeneric()
    }
  }

  // Llamada a Brevo ANTES de escribir nada — si falla, la fila no se toca (o no se
  // crea), así que el siguiente intento no queda bloqueado por un cooldown falso.
  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        includeListIds: listIds,
        redirectionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'}/seleccion-mensual/confirmado?status=ok`,
        templateId,
        attributes: {
          UTM_SOURCE: acquisitionContext.utm_source ?? '',
          UTM_MEDIUM: acquisitionContext.utm_medium ?? '',
          UTM_CAMPAIGN: acquisitionContext.utm_campaign ?? '',
          UTM_CONTENT: acquisitionContext.utm_content ?? '',
          LANDING_PATH: landingPath ?? '',
          CONSENT_VERSION: NEWSLETTER_CONSENT_VERSION,
          SIGNUP_SOURCE: acquisitionContext.entry_point ?? 'other',
          SIGNUP_AT: new Date().toISOString(),
        },
      }),
    })
    if (!brevoRes.ok) {
      // Nunca se registra el cuerpo de la respuesta sin sanitizar (podría incluir el
      // email) — solo el status, suficiente para depurar.
      console.error('brevo_doi_failed', brevoRes.status)
      return NextResponse.json({ ok: false, error: 'provider_failed' }, { status: 502 })
    }
  } catch (err) {
    console.error('brevo_doi_network_error', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ ok: false, error: 'provider_failed' }, { status: 502 })
  }

  // Brevo confirmó — ahora sí se escribe el ledger.
  const nowIso = new Date().toISOString()
  if (existing) {
    const { error: updateError } = await admin
      .from('newsletter_subscriptions')
      .update({ requested_at: nowIso, topics, brevo_list_ids: listIds })
      .eq('id', existing.id)
    if (updateError) {
      // Brevo ya envió el DOI — no se le dice al usuario que falló, pero queda
      // registrado para reconciliar el ledger a mano.
      console.error('newsletter_ledger_update_failed', updateError.message)
    }
  } else {
    const { error: insertError } = await admin.from('newsletter_subscriptions').insert({
      email_hash: emailHash,
      topics,
      brevo_list_ids: listIds,
      consent_version: NEWSLETTER_CONSENT_VERSION,
      consent_snapshot: NEWSLETTER_CONSENT_TEXT,
      acquisition_context: acquisitionContext,
      landing_path: landingPath,
      status: 'pending',
      requested_at: nowIso,
    })
    if (insertError) {
      // Brevo ya envió el DOI en este punto — un fallo de persistencia aquí no debe
      // decirle al usuario que falló (el email real va a llegar). Se registra para
      // reconciliar a mano; la respuesta sigue siendo la genérica de éxito.
      console.error('newsletter_ledger_insert_failed', insertError.message)
    }
  }

  return respondGeneric()
}
