import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { signOAuthState } from '@/lib/google-calendar'
import { planAllowsGoogleCalendar, validateSetupToken } from '@/lib/onboarding/setup-room'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
].join(' ')

/**
 * GET /api/calendar/google/connect — inicia el OAuth de Google Calendar (Fase A).
 * Gate Elite/Grupo. Puede venir por sesión de dashboard o por setup_token de la
 * sala pública de configuración; el callback no depende de sesión.
 */
export async function GET(req: NextRequest) {
  const setupToken = req.nextUrl.searchParams.get('setup_token')
  const setupReturnTo = setupToken ? `/configurar/${encodeURIComponent(setupToken)}` : null
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  if (!clientId) {
    const target = setupReturnTo ? `${setupReturnTo}?calendar_error=not_configured` : '/dashboard/citas?calendar_error=not_configured'
    return NextResponse.redirect(new URL(target, req.url))
  }

  const admin = createAdminClient()
  let dealerId: string | null = null
  let failTarget = '/dashboard/citas'

  if (setupToken) {
    failTarget = setupReturnTo as string
    const validation = await validateSetupToken(admin, setupToken)
    if (!validation.ok) {
      return NextResponse.redirect(new URL(`${failTarget}?calendar_error=invalid_request`, req.url))
    }
    dealerId = validation.dealerId
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', req.url))

    const access = await getDealerAccess(user.id)
    if (!access) return NextResponse.redirect(new URL('/registro', req.url))
    dealerId = access.dealerId
  }

  const { data: dealer } = await admin.from('dealers').select('subscription_plan').eq('id', dealerId).single()
  if (!planAllowsGoogleCalendar(dealer?.subscription_plan)) {
    const target = setupReturnTo ? `${setupReturnTo}?calendar_error=not_entitled` : '/dashboard/suscripcion'
    return NextResponse.redirect(new URL(target, req.url))
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
  const state = signOAuthState(dealerId, setupReturnTo ? { returnTo: setupReturnTo } : undefined)

  const url = new URL(GOOGLE_AUTH_URL)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', SCOPES)
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('state', state)

  return NextResponse.redirect(url.toString())
}
