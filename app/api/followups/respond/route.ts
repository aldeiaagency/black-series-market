import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VALID_RESPONSES = ['closed_won', 'still_deciding', 'not_interested'] as const

/**
 * GET /api/followups/respond?token=...&response=...
 * Enlace de un clic de los emails de seguimiento (P5 punto 3). Sin login — el token opaco
 * de `opportunity_followups.response_token` es la única credencial, validado en
 * `record_followup_response` (SECURITY DEFINER, solo service_role).
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const response = req.nextUrl.searchParams.get('response')

  if (!token || !VALID_RESPONSES.includes(response as typeof VALID_RESPONSES[number])) {
    return NextResponse.redirect(new URL('/seguimiento/gracias?ok=0', req.url))
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .rpc('record_followup_response', { p_token: token, p_response: response })
    .single<{ ok: boolean; already_responded: boolean }>()

  if (error || !data?.ok) {
    return NextResponse.redirect(new URL('/seguimiento/gracias?ok=0', req.url))
  }

  return NextResponse.redirect(new URL('/seguimiento/gracias?ok=1', req.url))
}
