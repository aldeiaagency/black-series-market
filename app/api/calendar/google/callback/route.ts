import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens, fetchPrimaryCalendar, encryptToken, verifyOAuthState, GOOGLE_OAUTH_NONCE_COOKIE, GOOGLE_OAUTH_COOKIE_OPTIONS } from '@/lib/google-calendar'

function finishOAuth(target: URL) {
  const response = NextResponse.redirect(target)
  response.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, '', { ...GOOGLE_OAUTH_COOKIE_OPTIONS, maxAge: 0 })
  return response
}

/**
 * GET /api/calendar/google/callback — intercambia el `code` de Google, guarda la
 * conexión cifrada y redirige al origen: /dashboard/citas o sala tokenizada.
 * El `state` firmado transporta dealerId, returnTo y el nonce ligado a la cookie del navegador.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const errorParam = req.nextUrl.searchParams.get('error')
  let redirectTo = new URL('/dashboard/citas', req.url)

  const verified = state ? verifyOAuthState(state) : null
  const browserNonce = req.cookies.get(GOOGLE_OAUTH_NONCE_COOKIE)?.value
  if (!verified || !browserNonce || verified.nonce !== browserNonce) {
    redirectTo.searchParams.set('calendar_error', 'invalid_state')
    return finishOAuth(redirectTo)
  }
  if (verified.returnTo) redirectTo = new URL(verified.returnTo, req.url)

  if (errorParam) {
    redirectTo.searchParams.set('calendar_error', 'denied')
    return finishOAuth(redirectTo)
  }
  if (!code || !state) {
    redirectTo.searchParams.set('calendar_error', 'invalid_request')
    return finishOAuth(redirectTo)
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
  const tokens = await exchangeCodeForTokens(code, redirectUri)
  if (!tokens?.access_token || !tokens.refresh_token) {
    redirectTo.searchParams.set('calendar_error', 'token_exchange_failed')
    return finishOAuth(redirectTo)
  }

  const calendar = await fetchPrimaryCalendar(tokens.access_token)
  if (!calendar) {
    redirectTo.searchParams.set('calendar_error', 'calendar_fetch_failed')
    return finishOAuth(redirectTo)
  }

  const admin = createAdminClient()
  const row = {
    dealer_id: verified.dealerId,
    provider: 'google_calendar' as const,
    status: 'connected' as const,
    external_account_email: calendar.id,
    calendar_ref: calendar.id,
    access_token: encryptToken(tokens.access_token),
    refresh_token: encryptToken(tokens.refresh_token),
    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    scope: tokens.scope,
    connected_at: new Date().toISOString(),
    disconnected_at: null,
    error_message: null,
  }

  const { data: existing } = await admin
    .from('showroom_calendar_connections')
    .select('id')
    .eq('dealer_id', verified.dealerId)
    .eq('provider', 'google_calendar')
    .maybeSingle()

  const { error } = existing
    ? await admin.from('showroom_calendar_connections').update(row).eq('id', existing.id)
    : await admin.from('showroom_calendar_connections').insert(row)

  if (error) {
    redirectTo.searchParams.set('calendar_error', 'save_failed')
    return finishOAuth(redirectTo)
  }

  redirectTo.searchParams.set('calendar_connected', '1')
  return finishOAuth(redirectTo)
}
