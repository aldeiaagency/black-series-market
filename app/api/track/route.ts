import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { isAnalyticsEventType } from '@/lib/analytics/events'
import { CONSENT_VERSION } from '@/lib/cookies/consent'
import { getClientIp, hashIdentifier } from '@/lib/rate-limit'

// Límite por IP, no un circuit breaker global — este endpoint recibe eventos legítimos
// en casi cada interacción (vista, filtro, favorito) de cualquier visitante activo real,
// así que bloquear por volumen agregado castigaría tráfico normal. 300/5min (~1/seg de
// media) es holgado para una sesión de navegación activa real y corta cualquier flood.
const TRACK_IP_LIMIT = 300
const TRACK_IP_WINDOW_MS = 5 * 60 * 1000

async function isTrackRateLimited(
  admin: ReturnType<typeof createAdminClient>,
  ipHash: string | null,
): Promise<boolean> {
  if (!ipHash) return false
  const since = new Date(Date.now() - TRACK_IP_WINDOW_MS).toISOString()
  const { count, error } = await admin
    .from('analytics_events')
    .select('id', { count: 'exact', head: true })
    .eq('metadata->>ip_hash', ipHash)
    .gte('created_at', since)
  if (error) return false // ante fallo del contador, no bloquear (fail-open del rate limit, no de la seguridad)
  return (count ?? 0) >= TRACK_IP_LIMIT
}

const ACQUISITION_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'referrer', 'landing_path', 'entry_point', 'cep',
] as const

function optionalId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed && trimmed.length <= 100 ? trimmed : null
}

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

function sanitizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  try {
    const serialized = JSON.stringify(value)
    if (serialized.length > 8000) return {}
    return JSON.parse(serialized) as Record<string, unknown>
  } catch {
    return {}
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body?.consent?.analytics !== true || body?.consent?.version !== CONSENT_VERSION) {
      return NextResponse.json({ ok: true, tracked: false, reason: 'consent_required' })
    }
    if (!isAnalyticsEventType(body.event_type)) {
      return NextResponse.json({ ok: false, error: 'invalid_event' }, { status: 400 })
    }

    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch {}

    const admin = createAdminClient()
    const clientIp = getClientIp(req)
    const ipHash = clientIp ? hashIdentifier(clientIp) : null

    if (await isTrackRateLimited(admin, ipHash)) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
    }

    const metadata = sanitizeMetadata(body.metadata)
    const acquisition = sanitizeAcquisition(body.acquisition_context)
    const mergedMetadata = Object.keys(acquisition).length > 0
      ? { ...metadata, acquisition_context: acquisition }
      : metadata
    const { error } = await admin.from('analytics_events').insert({
      event_type: body.event_type,
      vehicle_id: optionalId(body.vehicle_id),
      dealer_id: optionalId(body.dealer_id),
      user_id: userId,
      session_id: optionalId(body.session_id),
      metadata: ipHash ? { ...mergedMetadata, ip_hash: ipHash } : mergedMetadata,
    })

    if (error) {
      return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 500 })
    }

    // Consent covers both the event row and its denormalised view counter.
    if (body.event_type === 'vehicle_view' && body.vehicle_id) {
      await admin.rpc('increment_vehicle_views', { p_id: String(body.vehicle_id) })
    }

    return NextResponse.json({ ok: true, tracked: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
}
