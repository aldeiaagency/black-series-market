import 'server-only'
import { randomBytes, randomUUID, createCipheriv, createDecipheriv, createHmac, timingSafeEqual } from 'crypto'
import type { createAdminClient } from '@/lib/supabase/server'

// Integración real con Google Calendar (Fase A). Sin librería googleapis — solo 3 llamadas REST
// (token exchange/refresh, freebusy.query, events.insert), consistente con el resto de este repo
// (fetch manual + AbortController, sin SDKs pesados salvo Stripe).
//
// Cifrado de tokens: AES-256-GCM en la capa de aplicación (Node crypto nativo), clave en
// GOOGLE_TOKEN_ENCRYPTION_KEY (mismo modelo de custodia que cualquier otro secreto del proyecto:
// variable de entorno de Vercel). Protege un volcado de la base de datos; no protege un entorno
// de Vercel comprometido — igual que el resto de secretos de esta app.

type Admin = ReturnType<typeof createAdminClient>

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke'
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const REQUEST_TIMEOUT_MS = 10_000
const ENCRYPTION_ALGO = 'aes-256-gcm'

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

// ── Cifrado ──────────────────────────────────────────────────────────────────

function encryptionKey(): Buffer {
  const raw = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY
  if (!raw) throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY no configurada')
  return Buffer.from(raw, 'hex') // openssl rand -hex 32 → 32 bytes
}

export function encryptToken(plainText: string): string {
  const key = encryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ENCRYPTION_ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':')
}

export function decryptToken(encoded: string): string {
  const key = encryptionKey()
  const [ivB64, tagB64, dataB64] = encoded.split(':')
  const decipher = createDecipheriv(ENCRYPTION_ALGO, key, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()])
  return decrypted.toString('utf8')
}

// ── OAuth: intercambio inicial y revocación (usados por las rutas connect/callback) ───────────

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleTokenResponse | null> {
  const res = await fetchWithTimeout(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) return null
  return res.json()
}

export async function fetchPrimaryCalendar(accessToken: string): Promise<{ id: string } | null> {
  const res = await fetchWithTimeout(`${GOOGLE_CALENDAR_API}/calendars/primary`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return { id: data.id as string } // el id del calendario primario ES el email de la cuenta
}

export async function revokeGoogleToken(token: string): Promise<void> {
  await fetchWithTimeout(`${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(token)}`, { method: 'POST' }).catch(() => {})
}

// ── Firma del `state` de OAuth (CSRF + transporte del dealerId) ────────────────

export function signOAuthState(dealerId: string): string {
  const secret = process.env.GOOGLE_OAUTH_STATE_SECRET
  if (!secret) throw new Error('GOOGLE_OAUTH_STATE_SECRET no configurada')
  const payloadB64 = Buffer.from(JSON.stringify({ dealerId, ts: Date.now() })).toString('base64url')
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url')
  return `${payloadB64}.${sig}`
}

export function verifyOAuthState(state: string, maxAgeMs = 10 * 60_000): { dealerId: string } | null {
  const secret = process.env.GOOGLE_OAUTH_STATE_SECRET
  if (!secret) return null
  const [payloadB64, sig] = state.split('.')
  if (!payloadB64 || !sig) return null
  const expected = createHmac('sha256', secret).update(payloadB64).digest('base64url')
  const sigBuf = Buffer.from(sig, 'base64url')
  const expBuf = Buffer.from(expected, 'base64url')
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as { dealerId: string; ts: number }
    if (!payload.dealerId || Date.now() - payload.ts > maxAgeMs) return null
    return { dealerId: payload.dealerId }
  } catch {
    return null
  }
}

// ── Conexión activa por dealer ──────────────────────────────────────────────

interface ConnectionRow {
  id: string
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  calendar_ref: string | null
}

async function loadConnectedRow(admin: Admin, dealerId: string): Promise<ConnectionRow | null> {
  const { data } = await admin
    .from('showroom_calendar_connections')
    .select('id, access_token, refresh_token, token_expires_at, calendar_ref')
    .eq('dealer_id', dealerId)
    .eq('provider', 'google_calendar')
    .eq('status', 'connected')
    .maybeSingle()
  return data
}

async function refreshAccessToken(admin: Admin, conn: ConnectionRow): Promise<string | null> {
  if (!conn.refresh_token) return null
  const res = await fetchWithTimeout(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? '',
      refresh_token: decryptToken(conn.refresh_token),
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as { error?: string }))
    if (body.error === 'invalid_grant') {
      await admin.from('showroom_calendar_connections').update({
        status: 'error',
        error_message: 'La conexión con Google Calendar ha caducado o fue revocada. Reconéctala.',
      }).eq('id', conn.id)
    }
    return null
  }
  const data: GoogleTokenResponse = await res.json()
  await admin.from('showroom_calendar_connections').update({
    access_token: encryptToken(data.access_token),
    token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    last_synced_at: new Date().toISOString(),
  }).eq('id', conn.id)
  return data.access_token
}

/** Devuelve un access_token válido, refrescándolo si hace falta. `null` si no hay conexión o falló. */
export async function getValidAccessToken(admin: Admin, dealerId: string): Promise<string | null> {
  const conn = await loadConnectedRow(admin, dealerId)
  if (!conn) return null
  const expiresAtMs = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0
  const needsRefresh = !conn.access_token || expiresAtMs - Date.now() < 5 * 60_000
  if (!needsRefresh) return decryptToken(conn.access_token as string)
  return refreshAccessToken(admin, conn)
}

export interface BusyRange { start: string; end: string }

/** Rangos ocupados reales del calendario del dealer. Array vacío (nunca lanza) si algo falla. */
export async function getFreeBusy(admin: Admin, dealerId: string, timeMin: string, timeMax: string): Promise<BusyRange[]> {
  try {
    const conn = await loadConnectedRow(admin, dealerId)
    if (!conn?.calendar_ref) return []
    const token = await getValidAccessToken(admin, dealerId)
    if (!token) return []
    const res = await fetchWithTimeout(`${GOOGLE_CALENDAR_API}/freeBusy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeMin, timeMax, items: [{ id: conn.calendar_ref }] }),
    })
    if (!res.ok) return []
    const data = await res.json()
    const busy = data.calendars?.[conn.calendar_ref]?.busy ?? []
    return busy.map((b: { start: string; end: string }) => ({ start: b.start, end: b.end }))
  } catch {
    return []
  }
}

export interface CreateEventInput {
  summary: string
  description?: string
  startIso: string
  endIso: string
  attendeeEmail: string
  attendeeName: string
}
export interface CreateEventResult { id: string; meetingUrl: string | null; htmlLink: string }

/** Crea el evento real en el calendario del dealer. `null` (nunca lanza) si algo falla. */
export async function createEvent(admin: Admin, dealerId: string, input: CreateEventInput): Promise<CreateEventResult | null> {
  try {
    const conn = await loadConnectedRow(admin, dealerId)
    if (!conn?.calendar_ref) return null
    const token = await getValidAccessToken(admin, dealerId)
    if (!token) return null

    const url = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(conn.calendar_ref)}/events?conferenceDataVersion=1&sendUpdates=all`
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startIso },
        end: { dateTime: input.endIso },
        attendees: [{ email: input.attendeeEmail, displayName: input.attendeeName }],
        conferenceData: { createRequest: { requestId: randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const meetingUrl: string | null =
      data.hangoutLink ??
      data.conferenceData?.entryPoints?.find((e: { entryPointType: string }) => e.entryPointType === 'video')?.uri ??
      null
    return { id: data.id, meetingUrl, htmlLink: data.htmlLink }
  } catch {
    return null
  }
}
