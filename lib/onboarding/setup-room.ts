import 'server-only'
import { createHash, randomBytes } from 'crypto'
import type { createAdminClient } from '@/lib/supabase/server'

export const SETUP_TOKEN_DAYS = 14
export const SETUP_TOKEN_BYTES = 32

type Admin = ReturnType<typeof createAdminClient>

export interface SetupTokenRow {
  id: string
  dealer_id: string
  token_hash: string
  expires_at: string
  used_at: string | null
}

export interface SetupDealerRow {
  id: string
  profile_id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  location_city: string | null
  location_region: string | null
  address: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  linkedin_url: string | null
  years_in_business: number | null
  certifications: string[] | null
  services: string[] | null
  subscription_plan: string | null
  profile_status: string | null
  profile?: { email: string | null; full_name?: string | null } | null
}

export interface SetupApplicationRow {
  id: string
  full_name: string | null
  email: string | null
  dealer_name: string | null
  location_city: string | null
  location_region: string | null
  phone: string | null
  whatsapp: string | null
  website: string | null
  address: string | null
  profile_description: string | null
  instagram_url: string | null
  facebook_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  linkedin_url: string | null
  years_in_business: number | null
  specialties: string[] | null
  services: string[] | null
  created_at: string
}

export interface SetupRoomData {
  token: SetupTokenRow
  dealer: SetupDealerRow
  application: SetupApplicationRow | null
  assistantConfig: {
    context: Record<string, unknown>
    whatsapp_number: string | null
  } | null
  google: {
    configured: boolean
    status: string | null
    email: string | null
  }
}

export type SetupTokenValidation =
  | { ok: true; token: SetupTokenRow; dealerId: string }
  | { ok: false; reason: 'missing' | 'used' | 'expired' }

export function hashSetupToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('base64url')
}

export function generateSetupToken() {
  const token = randomBytes(SETUP_TOKEN_BYTES).toString('base64url')
  return { token, tokenHash: hashSetupToken(token) }
}

export function setupTokenExpiresAt(days = SETUP_TOKEN_DAYS) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

export function planNeedsAssistant(plan?: string | null) {
  return plan === 'professional' || plan === 'elite'
}

export function planAllowsGoogleCalendar(plan?: string | null) {
  return plan === 'elite' || plan === 'grupo'
}

export async function validateSetupToken(admin: Admin, rawToken: string): Promise<SetupTokenValidation> {
  if (!rawToken?.trim()) return { ok: false, reason: 'missing' }

  const tokenHash = hashSetupToken(rawToken.trim())
  const { data } = await admin
    .from('dealer_setup_tokens')
    .select('id, dealer_id, token_hash, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (!data) return { ok: false, reason: 'missing' }
  const token = data as SetupTokenRow
  if (token.used_at) return { ok: false, reason: 'used' }
  if (new Date(token.expires_at).getTime() <= Date.now()) return { ok: false, reason: 'expired' }

  return { ok: true, token, dealerId: token.dealer_id }
}

export async function loadSetupRoom(admin: Admin, rawToken: string): Promise<SetupRoomData | null> {
  const validation = await validateSetupToken(admin, rawToken)
  if (!validation.ok) return null

  const [{ data: dealer }, { data: application }, { data: assistantConfig }, { data: googleConnection }] = await Promise.all([
    admin
      .from('dealers')
      .select('id, profile_id, slug, name, description, logo_url, cover_url, location_city, location_region, address, phone, whatsapp, email, website, instagram, facebook_url, youtube_url, tiktok_url, linkedin_url, years_in_business, certifications, services, subscription_plan, profile_status, profile:profiles(email, full_name)')
      .eq('id', validation.dealerId)
      .maybeSingle(),
    admin
      .from('showroom_applications')
      .select('id, full_name, email, dealer_name, location_city, location_region, phone, whatsapp, website, address, profile_description, instagram_url, facebook_url, youtube_url, tiktok_url, linkedin_url, years_in_business, specialties, services, created_at')
      .eq('dealer_id', validation.dealerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('showroom_assistant_config')
      .select('context, whatsapp_number')
      .eq('dealer_id', validation.dealerId)
      .maybeSingle(),
    admin
      .from('showroom_calendar_connections')
      .select('status, external_account_email')
      .eq('dealer_id', validation.dealerId)
      .eq('provider', 'google_calendar')
      .maybeSingle(),
  ])

  if (!dealer) return null

  const dealerRow = dealer as unknown as SetupDealerRow & { profile?: SetupDealerRow['profile'] | SetupDealerRow['profile'][] }
  if (Array.isArray(dealerRow.profile)) dealerRow.profile = dealerRow.profile[0] ?? null

  return {
    token: validation.token,
    dealer: dealerRow as SetupDealerRow,
    application: (application as SetupApplicationRow | null) ?? null,
    assistantConfig: assistantConfig
      ? {
          context: (assistantConfig.context && typeof assistantConfig.context === 'object' ? assistantConfig.context : {}) as Record<string, unknown>,
          whatsapp_number: assistantConfig.whatsapp_number ?? null,
        }
      : null,
    google: {
      configured: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID),
      status: googleConnection?.status ?? null,
      email: googleConnection?.external_account_email ?? null,
    },
  }
}

export function sanitizeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

export function normalizeText(value: unknown, max = 1000): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text) return null
  return text.slice(0, max)
}

export function normalizeStringArray(value: unknown, allowed: readonly string[]): string[] {
  if (!Array.isArray(value)) return []
  const allowedSet = new Set(allowed)
  return value.map((item) => String(item)).filter((item) => allowedSet.has(item))
}

export function passwordSetupUrl(
  appUrl: string,
  properties: { hashed_token: string; verification_type: string },
) {
  const params = new URLSearchParams({
    token_hash: properties.hashed_token,
    type: properties.verification_type,
    next: '/reset-password',
  })
  return `${appUrl}/auth/confirm?${params.toString()}`
}

