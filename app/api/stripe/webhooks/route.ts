import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

const PLAN_SLOTS: Record<string, number> = {
  essential: 10,
  professional: 30,
  elite: 9999,
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { dealer_id: dealerId, plan, type, vehicle_id: vehicleId } = session.metadata || {}

    if (type === 'boost' && vehicleId) {
      const featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      await supabase.from('vehicles').update({
        is_featured: true,
        featured_until: featuredUntil,
      }).eq('id', vehicleId)
    } else if (dealerId && plan) {
      await supabase.from('dealers').update({
        subscription_plan: plan,
        stripe_subscription_id: session.subscription as string,
        status: 'active',
        vehicle_slots: PLAN_SLOTS[plan] || 10,
        subscription_start_at: new Date().toISOString(),
        subscription_end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq('id', dealerId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await supabase.from('dealers').update({
      subscription_plan: null,
      stripe_subscription_id: null,
      status: 'trial',
      vehicle_slots: 5,
    }).eq('stripe_subscription_id', subscription.id)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    if (invoice.subscription) {
      await supabase.from('dealers').update({ status: 'suspended' })
        .eq('stripe_subscription_id', invoice.subscription as string)
    }
  }

  return NextResponse.json({ received: true })
}
