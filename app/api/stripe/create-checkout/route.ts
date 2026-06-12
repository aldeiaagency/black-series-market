import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { stripe, PLAN_PRICES, PLAN_PRICES_LEGACY, createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const plan = formData.get('plan') as string
    const billingCycle = (formData.get('billing_cycle') as 'monthly' | 'annual') ?? 'monthly'

    // Validate plan
    if (!PLAN_PRICES[plan] && !PLAN_PRICES_LEGACY[plan]) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const admin = createAdminClient()
    const { data: dealer } = await admin
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
      await admin.from('dealers').update({ stripe_customer_id: customerId }).eq('id', dealer.id)
    }

    // Resolve price ID: use cycle-specific price if available, fallback to legacy
    const priceId =
      PLAN_PRICES[plan]?.[billingCycle] ??
      PLAN_PRICES_LEGACY[plan]

    if (!priceId) {
      return NextResponse.json({ error: 'Precio no configurado para este plan y ciclo' }, { status: 400 })
    }

    const session = await createCheckoutSession(
      customerId,
      priceId,
      dealer.id,
      plan
    )

    return NextResponse.redirect(session.url!, 303)
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 })
  }
}
