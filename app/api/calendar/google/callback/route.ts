import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens, fetchPrimaryCalendar, encryptToken, verifyOAuthState } from '@/lib/google-calendar'

/**
 * GET /api/calendar/google/callback — intercambia el `code` de Google, guarda la
 * conexión cifrada y redirige al origen: /dashboard/citas o sala tokenizada.
 * El `state` firmado (HMAC) transporta dealerId y returnTo opcional; no depende de sesión.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const errorParam = req.nextUrl.searchParams.get('error')
  let redirectTo = new URL('/dashboard/citas', req.url)

  if (state) {
    const preVerified = verifyOAuthState(state)
    if (preVerified?.returnTo) redirectTo = new URL(preVerified.returnTo, req.url)
  }

  if (errorParam) {
    redirectTo.searchParams.set('calendar_error', 'denied')
    return NextResponse.redirect(redirectTo)
  }
  if (!code || !state) {
    redirectTo.searchParams.set('calendar_error', 'invalid_request')
    return NextResponse.redirect(redirectTo)
  }

  const verified = verifyOAuthState(state)
  if (!verified) {
    redirectTo.searchParams.set('calendar_error', 'invalid_state')
    return NextResponse.redirect(redirectTo)
  }
  if (verified.returnTo) redirectTo = new URL(verified.returnTo, req.url)

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
  const tokens = await exchangeCodeForTokens(code, redirectUri)
  if (!tokens?.access_token || !tokens.refresh_token) {
    redirectTo.searchParams.set('calendar_error', 'token_exchange_failed')
    return NextResponse.redirect(redirectTo)
  }

  const calendar = await fetchPrimaryCalendar(tokens.access_token)
  if (!calendar) {
    redirectTo.searchParams.set('calendar_error', 'calendar_fetch_failed')
    return NextResponse.redirect(redirectTo)
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
    return NextResponse.redirect(redirectTo)
  }

  redirectTo.searchParams.set('calendar_connected', '1')
  return NextResponse.redirect(redirectTo)
}
