import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLAN_PRICES: Record<string, string> = {
  essential: process.env.STRIPE_PRICE_ESSENTIAL!,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
  elite: process.env.STRIPE_PRICE_ELITE!,
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  dealerId: string,
  plan: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?canceled=true`,
    metadata: { dealer_id: dealerId, plan },
  })
}

export async function createPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion`,
  })
}
