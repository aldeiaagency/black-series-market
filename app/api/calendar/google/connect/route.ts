import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { signOAuthState } from '@/lib/google-calendar'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
].join(' ')

/**
 * GET /api/calendar/google/connect — inicia el OAuth de Google Calendar (Fase A).
 * Gate Elite/Grupo, igual que saveCalendarConfig. `prompt=consent` fuerza que Google
 * devuelva siempre un refresh_token, también en reconexiones.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  if (!clientId) return NextResponse.redirect(new URL('/dashboard/citas?calendar_error=not_configured', req.url))

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const access = await getDealerAccess(user.id)
  if (!access) return NextResponse.redirect(new URL('/registro', req.url))

  const admin = createAdminClient()
  const { data: dealer } = await admin.from('dealers').select('subscription_plan').eq('id', access.dealerId).single()
  if (dealer?.subscription_plan !== 'elite' && dealer?.subscription_plan !== 'grupo') {
    return NextResponse.redirect(new URL('/dashboard/suscripcion', req.url))
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
  const state = signOAuthState(access.dealerId)

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
