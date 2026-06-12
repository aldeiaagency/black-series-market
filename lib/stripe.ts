import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Price IDs por plan y ciclo (configurados en env)
export const PLAN_PRICES: Record<string, Record<string, string>> = {
  essential: {
    monthly:  process.env.STRIPE_PRICE_ESSENTIAL_MONTHLY!,
    annual:   process.env.STRIPE_PRICE_ESSENTIAL_ANNUAL!,
    founding: process.env.STRIPE_PRICE_ESSENTIAL_FOUNDING!,
  },
  professional: {
    monthly:  process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY!,
    annual:   process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL!,
    founding: process.env.STRIPE_PRICE_PROFESSIONAL_FOUNDING!,
  },
  elite: {
    monthly:  process.env.STRIPE_PRICE_ELITE_MONTHLY!,
    annual:   process.env.STRIPE_PRICE_ELITE_ANNUAL!,
    founding: process.env.STRIPE_PRICE_ELITE_FOUNDING!,
  },
}

// Legacy alias (backward compat with existing checkout route)
export const PLAN_PRICES_LEGACY: Record<string, string> = {
  essential:    process.env.STRIPE_PRICE_ESSENTIAL_MONTHLY   || process.env.STRIPE_PRICE_ESSENTIAL!,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY|| process.env.STRIPE_PRICE_PROFESSIONAL!,
  elite:        process.env.STRIPE_PRICE_ELITE_MONTHLY       || process.env.STRIPE_PRICE_ELITE!,
}

export interface CheckoutOptions {
  customerId: string
  priceId: string
  organizationId: string
  dealerId: string
  plan: string
  billingCycle: 'monthly' | 'annual'
  isFounding?: boolean
}

export async function createCheckoutSession(options: CheckoutOptions | string, priceId?: string, dealerId?: string, plan?: string) {
  // Overloaded: new API (CheckoutOptions) or legacy (customerId, priceId, dealerId, plan)
  if (typeof options === 'object') {
    const { customerId, priceId: pid, organizationId, dealerId: did, plan: p, billingCycle, isFounding } = options

    return stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: pid, quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?success=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/profesionales/precios?canceled=true`,
      metadata: {
        organization_id: organizationId,
        dealer_id: did,
        plan: p,
        billing_cycle: billingCycle,
        is_founding: isFounding ? 'true' : 'false',
      },
    })
  }

  // Legacy call signature
  return stripe.checkout.sessions.create({
    customer: options,
    payment_method_types: ['card'],
    line_items: [{ price: priceId!, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?success=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?canceled=true`,
    metadata: { dealer_id: dealerId!, plan: plan! },
  })
}

export async function createPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/facturacion`,
  })
}
