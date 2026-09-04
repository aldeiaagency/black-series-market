import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    // Corrección 2026-09-04: la migración 107 (P0.2) revocó la lectura directa de
    // dealers.profile_id Y de stripe_customer_id para 'authenticated' — este .eq('profile_id', ...)
    // llevaba desde el 2026-09-02 sin devolver nunca fila, bloqueando el acceso al portal de
    // facturación de cualquier dealer. La RPC confirma de quién es el dealer (auth.uid() interno,
    // SECURITY DEFINER); el admin client lee stripe_customer_id ya con esa propiedad verificada.
    const { data: dealerRows } = await supabase.rpc('get_own_dealer_summary')
    const dealerId = dealerRows?.[0]?.id ?? null
    if (!dealerId) return NextResponse.redirect(new URL('/dashboard/suscripcion', request.url))

    const admin = createAdminClient()
    const { data: dealer } = await admin
      .from('dealers')
      .select('stripe_customer_id')
      .eq('id', dealerId)
      .single()

    if (!dealer?.stripe_customer_id) {
      return NextResponse.redirect(new URL('/dashboard/suscripcion', request.url))
    }

    const session = await createPortalSession(dealer.stripe_customer_id)
    return NextResponse.redirect(session.url, 303)
  } catch (error) {
    return NextResponse.json({ error: 'Error al acceder al portal de facturación. Inténtalo de nuevo.' }, { status: 500 })
  }
}
