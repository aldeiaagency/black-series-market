import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const { data: dealer } = await supabase
      .from('dealers')
      .select('stripe_customer_id')
      .eq('profile_id', user.id)
      .single()

    if (!dealer?.stripe_customer_id) {
      return NextResponse.redirect(new URL('/dashboard/suscripcion', request.url))
    }

    const session = await createPortalSession(dealer.stripe_customer_id)
    return NextResponse.redirect(session.url, 303)
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
