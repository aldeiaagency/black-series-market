import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLAN_PRICES, createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const plan = formData.get('plan') as string

    if (!PLAN_PRICES[plan]) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const { data: dealer } = await supabase
      .from('dealers')
      .select('id, stripe_customer_id, email')
      .eq('profile_id', user.id)
      .single()

    if (!dealer) return NextResponse.redirect(new URL('/registro', request.url))

    let customerId = dealer.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dealer.email || user.email,
        metadata: { dealer_id: dealer.id, user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('dealers').update({ stripe_customer_id: customerId }).eq('id', dealer.id)
    }

    const session = await createCheckoutSession(customerId, PLAN_PRICES[plan], dealer.id, plan)
    return NextResponse.redirect(session.url!, 303)
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 })
  }
}
