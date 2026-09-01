import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'
import { getEntitlements } from '@/lib/entitlements'
import { getPaidAddon } from '@/lib/addons'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const addonSlug = formData.get('addon') as string | null
    const addon = getPaidAddon(addonSlug)

    if (!addon) {
      return NextResponse.json({ error: 'Complemento invalido' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const access = await getDealerAccess(user.id)
    if (!access) return NextResponse.redirect(new URL('/registro', request.url))
    if (!getPermissions(access.role).canManageSubscription) {
      return NextResponse.json({ error: 'No tienes permisos para gestionar la suscripcion.' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data: dealer } = await admin
      .from('dealers')
      .select('id, name, email, stripe_customer_id, subscription_plan')
      .eq('id', access.dealerId)
      .single()

    if (!dealer || !access.orgId) return NextResponse.redirect(new URL('/registro', request.url))

    const ent = await getEntitlements(access.orgId)
    const plan = ent?.plan ?? dealer.subscription_plan
    if (!plan || !(addon.appliesTo as readonly string[]).includes(plan)) {
      return NextResponse.json({ error: 'Este complemento no esta disponible para tu plan actual.' }, { status: 403 })
    }

    const { data: addonRow } = await admin
      .from('addons')
      .select('id')
      .eq('slug', addon.dbSlug)
      .eq('status', 'active')
      .maybeSingle()

    if (!addonRow) {
      return NextResponse.json({ error: 'Complemento no configurado en la base de datos.' }, { status: 500 })
    }

    let customerId = dealer.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dealer.email || user.email,
        metadata: { dealer_id: dealer.id, user_id: user.id, organization_id: access.orgId },
      })
      customerId = customer.id
      await admin.from('dealers').update({ stripe_customer_id: customerId }).eq('id', dealer.id)
    }

    const metadata = {
      type: 'addon',
      addon_slug: addon.uiSlug,
      addon_db_slug: addon.dbSlug,
      organization_id: access.orgId,
      dealer_id: dealer.id,
      addon_id: addonRow.id,
      activation_mode: addon.activationMode,
      manual_activation_type: addon.manualActivationType ?? '',
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: addon.checkoutMode,
      line_items: [{
        price_data: {
          currency: addon.currency,
          unit_amount: addon.amountCents,
          recurring: addon.checkoutMode === 'subscription' ? { interval: 'month' } : undefined,
          product_data: {
            name: addon.name,
            description: addon.description,
            metadata: {
              addon_slug: addon.uiSlug,
              addon_db_slug: addon.dbSlug,
            },
          },
        },
        quantity: 1,
      }],
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?addon=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?addon=canceled#complementos`,
      metadata,
      subscription_data: addon.checkoutMode === 'subscription' ? { metadata } : undefined,
      payment_intent_data: addon.checkoutMode === 'payment' ? { metadata } : undefined,
    })

    return NextResponse.redirect(session.url!, 303)
  } catch (error) {
    console.error('Stripe addon checkout error:', error)
    return NextResponse.json({ error: 'Error al crear sesion de pago del complemento' }, { status: 500 })
  }
}
