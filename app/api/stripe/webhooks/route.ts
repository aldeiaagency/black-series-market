import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLAN_PRICES } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { provisionPlanBoostCredits, activateBoost } from '@/lib/boosts'
import { incrementEliteCounter } from '@/lib/elite-capacity'
import { provisionDealerAssistant, deactivateDealerAssistant } from '@/lib/integrations/n8n-assistant-provisioning'
import { pauseExcessActiveVehicles } from '@/lib/plan-transitions'
import { getPaidAddon, getPaidAddonByDbSlug } from '@/lib/addons'
import type Stripe from 'stripe'

const PLAN_SLOTS: Record<string, number> = {
  essential: 15,
  professional: 50,
  elite: 100,
}

interface StripePlanRow {
  id: string
  slug: string
  stripe_monthly_price_id: string | null
  stripe_annual_price_id: string | null
  plan_limits: { key: string; value_number: number | null }[]
}

async function resolvePlanFromStripePrice(
  admin: ReturnType<typeof createAdminClient>,
  priceId: string | null | undefined,
): Promise<StripePlanRow | null> {
  if (!priceId) return null

  const { data } = await admin
    .from('plans')
    .select('id, slug, stripe_monthly_price_id, stripe_annual_price_id, plan_limits(key, value_number)')
    .in('slug', ['essential', 'professional', 'elite'])

  const plans = (data ?? []) as unknown as StripePlanRow[]
  const byDatabase = plans.find(
    (plan) =>
      plan.stripe_monthly_price_id === priceId ||
      plan.stripe_annual_price_id === priceId,
  )
  if (byDatabase) return byDatabase

  // Fallback para entornos donde los Price IDs viven en Vercel pero todavía no
  // se han materializado en plans.stripe_*_price_id.
  const envSlug = Object.entries(PLAN_PRICES).find(([, cycles]) =>
    Object.values(cycles).includes(priceId),
  )?.[0]

  return plans.find((plan) => plan.slug === envSlug) ?? null
}

function activeVehicleLimit(plan: StripePlanRow | null): number | null {
  const value = plan?.plan_limits.find((limit) => limit.key === 'max_active_vehicles')?.value_number
  return value == null ? null : Number(value)
}

// Idempotency: processed event IDs stored in platform_config key 'processed_stripe_events'
// For production, a dedicated events table is preferable; this is lightweight enough for current scale.

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Idempotencia: registra el evento antes de procesarlo. Stripe reintenta los webhooks;
  // sin esto, invoice.paid re-provisionaría créditos de boost y un checkout de boost podría
  // activarse dos veces. Un unique-violation (23505) significa "ya procesado" → 200 sin repetir.
  const { error: dupErr } = await admin
    .from('processed_stripe_events')
    .insert({ event_id: event.id, type: event.type })
  if (dupErr) {
    if (dupErr.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    // Otro error (p. ej. tabla inaccesible): log y seguimos (mejor procesar que perder el evento).
    console.error('[stripe-webhook] idempotency insert error:', dupErr.message)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(admin, event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(admin, event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(admin, event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(admin, event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(admin, event.data.object as Stripe.Invoice)
        break

      default:
        // Unhandled events are fine — just acknowledge
        break
    }
  } catch (err) {
    console.error(`[stripe-webhook] ${event.type} failed:`, err)
    // El procesamiento falló: quita el registro de idempotencia para no dejar el evento
    // marcado como procesado (así un reintento pueda reprocesarlo desde cero).
    await admin.from('processed_stripe_events').delete().eq('event_id', event.id)
    // Corrección 2026-09-02 (auditoría de seguridad, P0.5): antes se respondía 200 igual, lo que
    // significa que Stripe NUNCA reintentaba un evento que falló de verdad (pago cobrado, alta de
    // servicio a medias, sin segunda oportunidad). Se responde 500 para que Stripe reintente con
    // su backoff estándar — el hallazgo real de fondo (escrituras a Supabase no transaccionales
    // dentro de cada handler) sigue abierto y requiere una reescritura más profunda, fuera de
    // alcance de este fix puntual; ver docs/auditoria-seguridad-completa-2026-09-02.md P0.5.
    return NextResponse.json({ received: false, error: 'handler_error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  admin: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const meta = session.metadata || {}
  const organizationId = meta.organization_id
  const dealerId = meta.dealer_id
  const planSlug = meta.plan
  const billingCycle = (meta.billing_cycle as 'monthly' | 'annual') ?? 'monthly'
  const vehicleId = meta.vehicle_id  // boost purchase

  if (session.metadata?.type === 'addon') {
    await handleAddonCheckoutCompleted(admin, session)
    return
  }

  // ── Boost purchase ──
  if (session.metadata?.type === 'boost' && vehicleId && dealerId) {
    // Resolve the organization for this dealer
    const { data: org } = await admin
      .from('organizations')
      .select('id')
      .eq('dealer_id', dealerId)
      .single()

    if (org) {
      // Create a pack credit for this paid boost (quantity=1, no expiry)
      const { data: credit } = await admin
        .from('boost_credits')
        .insert({ organization_id: org.id, source: 'pack', quantity: 1, used: 0, expires_at: null })
        .select('id')
        .single()

      if (credit) {
        // Boost pagado: se salta el cupo (bypassCap). Así la vía normal crea la activación
        // trazable + consume el crédito + destaca. El fallback solo salta en casos límite
        // (vehículo no activo o ya destacado), donde el cliente pagó pero no cabe activación.
        const result = await activateBoost(vehicleId, org.id, { bypassCap: true })
        if (!result.success) {
          await admin.from('boost_credits').update({ used: 1 }).eq('id', credit.id)
          const featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          await admin.from('vehicles').update({ is_featured: true, featured_until: featuredUntil }).eq('id', vehicleId)
        }
        return
      }
    }

    // Fallback: no org found or credit insert failed
    const featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    await admin.from('vehicles').update({ is_featured: true, featured_until: featuredUntil }).eq('id', vehicleId)
    return
  }

  if (!planSlug) return

  // ── Look up plan ──
  const { data: plan } = await admin
    .from('plans')
    .select('id, slug')
    .eq('slug', planSlug)
    .single()

  if (!plan) return

  // ── Upsert subscription in new table (if organization_id present) ──
  if (organizationId) {
    // Corrección 2026-09-02 (P0.5): esta escritura activa el plan pagado — si falla en
    // silencio, el cliente paga y no recibe el servicio, y el evento queda marcado como
    // procesado sin que nadie se entere. Se comprueba el error y se lanza para que el catch
    // superior borre el registro de idempotencia y Stripe reintente el evento.
    const { error: subscriptionError } = await admin
      .from('subscriptions')
      .upsert({
        organization_id: organizationId,
        plan_id: plan.id,
        billing_cycle: billingCycle,
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_subscription_id' })
    if (subscriptionError) throw new Error(`subscriptions upsert failed: ${subscriptionError.message}`)

    // Materializa el destacado en organización y dealer. La página pública de
    // showrooms lee dealers.is_featured, por lo que ambas columnas deben viajar juntas.
    const isElite = planSlug === 'elite'
    await admin
      .from('organizations')
      .update({
        is_featured: isElite,
        featured_since: isElite ? new Date().toISOString() : null,
      })
      .eq('id', organizationId)

    if (isElite) {
      // Sube el contador de capacidad Elite de la provincia del showroom. Estaba importado
      // pero nunca se llamaba. Best-effort: incrementEliteCounter hace no-op si no hay regla
      // para esa provincia, así que un desajuste de formato no rompe el alta.
      if (dealerId) {
        const { data: d } = await admin
          .from('dealers')
          .select('location_region')
          .eq('id', dealerId)
          .maybeSingle()
        if (d?.location_region) await incrementEliteCounter(d.location_region)
      }
    }
  }

  // ── Legacy: sync dealers table ──
  if (dealerId) {
    // Esta es la escritura que de verdad activa el servicio para el dealer (status='active',
    // vehicle_slots, plan) — mismo criterio que el upsert de subscriptions de arriba (P0.5).
    const { error: dealerSyncError } = await admin.from('dealers').update({
      subscription_plan: planSlug as 'essential' | 'professional' | 'elite',
      stripe_subscription_id: session.subscription as string,
      stripe_customer_id: session.customer as string,
      status: 'active',
      vehicle_slots: PLAN_SLOTS[planSlug] ?? 15,
      is_featured: planSlug === 'elite',
      subscription_start_at: new Date().toISOString(),
      subscription_end_at: new Date(
        Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
    }).eq('id', dealerId)
    if (dealerSyncError) throw new Error(`dealers sync failed: ${dealerSyncError.message}`)

    // Auto-configure AI assistant (workflow dedicado por dealer) for Professional and Elite plans.
    // Mismo helper que approveApplication/setDealerPlan — ver lib/integrations/n8n-assistant-provisioning.ts.
    if (planSlug === 'professional' || planSlug === 'elite') {
      const { data: d } = await admin.from('dealers').select('name').eq('id', dealerId).maybeSingle()
      await provisionDealerAssistant(admin, { dealerId, dealerName: d?.name || 'Showroom' })
    }
  }
}

async function handleSubscriptionUpdated(
  admin: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription
) {
  if (await handleAddonSubscriptionUpdated(admin, sub)) return
  const status = mapStripeStatus(sub.status)
  const { data: currentSubscription } = await admin
    .from('subscriptions')
    .select('id, organization_id, plan_id')
    .eq('stripe_subscription_id', sub.id)
    .maybeSingle()

  const stripePriceId = sub.items.data[0]?.price?.id
  const newPlan = await resolvePlanFromStripePrice(admin, stripePriceId)

  let previousLimit: number | null = null
  if (currentSubscription?.plan_id) {
    const { data: previousLimitRow } = await admin
      .from('plan_limits')
      .select('value_number')
      .eq('plan_id', currentSubscription.plan_id)
      .eq('key', 'max_active_vehicles')
      .maybeSingle()
    previousLimit = previousLimitRow?.value_number == null
      ? null
      : Number(previousLimitRow.value_number)
  }

  // Update new subscriptions table
  await admin
    .from('subscriptions')
    .update({
      status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      ...(newPlan ? { plan_id: newPlan.id } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', sub.id)

  let dealerId: string | null = null
  if (currentSubscription?.organization_id) {
    const { data: org } = await admin
      .from('organizations')
      .select('dealer_id')
      .eq('id', currentSubscription.organization_id)
      .maybeSingle()
    dealerId = org?.dealer_id ?? null
  }

  const newLimit = activeVehicleLimit(newPlan)
  const isElite = newPlan?.slug === 'elite'
  const dealerUpdate = {
    status: status === 'active' ? 'active' as const : 'suspended' as const,
    ...(newPlan ? {
      subscription_plan: newPlan.slug as 'essential' | 'professional' | 'elite',
      vehicle_slots: newLimit ?? PLAN_SLOTS[newPlan.slug] ?? 15,
      is_featured: isElite,
    } : {}),
  }

  if (dealerId) {
    await admin.from('dealers').update(dealerUpdate).eq('id', dealerId)
  } else {
    const { data: dealer } = await admin
      .from('dealers')
      .update(dealerUpdate)
      .eq('stripe_subscription_id', sub.id)
      .select('id')
      .maybeSingle()
    dealerId = dealer?.id ?? null
  }

  if (newPlan && currentSubscription?.organization_id) {
    await admin
      .from('organizations')
      .update({
        is_featured: isElite,
        featured_since: isElite ? new Date().toISOString() : null,
      })
      .eq('id', currentSubscription.organization_id)
  }

  if (
    dealerId &&
    newLimit != null &&
    previousLimit != null &&
    newLimit < previousLimit
  ) {
    await pauseExcessActiveVehicles(admin, dealerId, newLimit)
  }

  // Resincroniza el asistente dedicado cuando el cambio de plan llega desde el portal de
  // facturación de Stripe (no desde setDealerPlan) — mismo helper que approveApplication/
  // handleCheckoutCompleted/setDealerPlan, ver lib/integrations/n8n-assistant-provisioning.ts.
  if (dealerId && newPlan) {
    if (newPlan.slug === 'professional' || newPlan.slug === 'elite') {
      const { data: d } = await admin.from('dealers').select('name').eq('id', dealerId).maybeSingle()
      await provisionDealerAssistant(admin, { dealerId, dealerName: d?.name || 'Showroom' })
    } else {
      await deactivateDealerAssistant(admin, dealerId)
    }
  }
}

async function handleSubscriptionDeleted(
  admin: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription
) {
  if (await handleAddonSubscriptionDeleted(admin, sub)) return
  // Mark subscription as canceled
  await admin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', sub.id)

  // Revoca el destacado materializado. La actualización legacy de abajo hace
  // lo mismo en dealers.is_featured.
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('organization_id')
    .eq('stripe_subscription_id', sub.id)
    .single()

  if (subscription?.organization_id) {
    await admin
      .from('organizations')
      .update({ is_featured: false })
      .eq('id', subscription.organization_id)

    await admin.from('audit_log').insert({
      organization_id: subscription.organization_id,
      action: 'subscription_canceled',
      entity_type: 'subscription',
      entity_id: sub.id,
      metadata: { stripe_subscription_id: sub.id },
    })
  }

  // Legacy
  const { data: canceledDealer } = await admin.from('dealers').update({
    subscription_plan: null,
    stripe_subscription_id: null,
    status: 'trial',
    vehicle_slots: 5,
    is_featured: false,
  }).eq('stripe_subscription_id', sub.id).select('id').maybeSingle()

  if (canceledDealer?.id) {
    await pauseExcessActiveVehicles(admin, canceledDealer.id, 5)
  }

  // Sale de professional/elite → desactiva su asistente dedicado (nunca lo borra).
  if (canceledDealer?.id) await deactivateDealerAssistant(admin, canceledDealer.id)
}

async function handleInvoicePaid(
  admin: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
  if (await handleAddonInvoicePaid(admin, invoice)) return
  if (!invoice.subscription) return

  const { data: sub } = await admin
    .from('subscriptions')
    .select('id, organization_id, plan_id, billing_cycle')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single()

  if (!sub) return

  // Update period dates
  const stripeInvoice = invoice as Stripe.Invoice & { lines: { data: Stripe.InvoiceLineItem[] } }
  const line = stripeInvoice.lines?.data?.[0]
  if (line?.period) {
    await admin
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date(line.period.start * 1000).toISOString(),
        current_period_end: new Date(line.period.end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id)
  }

  // Provision plan boost credits for new cycle
  const { data: plan } = await admin
    .from('plans')
    .select('id, plan_limits(key, value_number)')
    .eq('id', sub.plan_id)
    .single()

  const planWithLimits = plan as {
    id: string
    plan_limits: { key: string; value_number: number | null }[]
  } | null

  const includedBoosts = planWithLimits?.plan_limits?.find(
    (l) => l.key === 'included_boosts_month'
  )?.value_number ?? 0

  if (includedBoosts > 0) {
    await provisionPlanBoostCredits(
      sub.organization_id,
      sub.id,
      includedBoosts,
      new Date()
    )
  }
}

async function handlePaymentFailed(
  admin: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
  if (await handleAddonPaymentFailed(admin, invoice)) return
  if (!invoice.subscription) return

  await admin
    .from('subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', invoice.subscription as string)

  await admin
    .from('dealers')
    .update({ status: 'suspended' })
    .eq('stripe_subscription_id', invoice.subscription as string)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type AdminClient = ReturnType<typeof createAdminClient>

type AddonOrderRow = {
  id: string
  status: string
  organization_id: string
  dealer_id: string
  stripe_subscription_id: string | null
  addon: { slug: string; rules?: { slots?: number } } | { slug: string; rules?: { slots?: number } }[] | null
}

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function subscriptionPeriodFields(sub: Stripe.Subscription) {
  return {
    current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
  }
}

function invoicePeriodFields(invoice: Stripe.Invoice) {
  const line = (invoice as Stripe.Invoice & { lines: { data: Stripe.InvoiceLineItem[] } }).lines?.data?.[0]
  return {
    current_period_start: line?.period?.start ? new Date(line.period.start * 1000).toISOString() : null,
    current_period_end: line?.period?.end ? new Date(line.period.end * 1000).toISOString() : null,
  }
}

async function findAddonOrderBySubscription(admin: AdminClient, stripeSubscriptionId: string): Promise<AddonOrderRow | null> {
  const { data } = await admin
    .from('addon_orders')
    .select('id, status, organization_id, dealer_id, stripe_subscription_id, addon:addons(slug, rules)')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle()

  return (data as unknown as AddonOrderRow | null) ?? null
}

async function updateAddonSubscriptionMirror(
  admin: AdminClient,
  input: {
    organizationId: string
    addonDbSlug: string
    stripeSubscriptionId: string | null
    stripeCustomerId: string | null
    status: 'active' | 'pending' | 'canceled'
    periodStart?: string | null
    periodEnd?: string | null
    cancelAtPeriodEnd?: boolean
  },
) {
  if (!input.stripeSubscriptionId) return

  const [{ data: baseSub }, { data: addon }] = await Promise.all([
    admin
      .from('subscriptions')
      .select('id')
      .eq('organization_id', input.organizationId)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from('addons').select('id').eq('slug', input.addonDbSlug).maybeSingle(),
  ])

  if (!baseSub?.id || !addon?.id) return

  await admin.from('subscription_addons').upsert({
    subscription_id: baseSub.id,
    addon_id: addon.id,
    quantity: 1,
    status: input.status,
    stripe_subscription_id: input.stripeSubscriptionId,
    stripe_customer_id: input.stripeCustomerId,
    current_period_start: input.periodStart,
    current_period_end: input.periodEnd,
    cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'stripe_subscription_id' })
}

async function syncDealerVehicleSlots(
  admin: AdminClient,
  dealerId: string,
  organizationId: string,
  pauseOnDecrease = false,
) {
  const { data: dealer } = await admin
    .from('dealers')
    .select('subscription_plan, vehicle_slots')
    .eq('id', dealerId)
    .maybeSingle()

  const { data: sub } = await admin
    .from('subscriptions')
    .select('plan:plans(slug, plan_limits(key, value_number))')
    .eq('organization_id', organizationId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const plan = relationOne((sub?.plan as unknown as { slug: string; plan_limits: { key: string; value_number: number | null }[] } | null) ?? null)
  const planSlug = plan?.slug ?? dealer?.subscription_plan ?? 'essential'
  const baseLimit = Number(
    plan?.plan_limits?.find((limit) => limit.key === 'max_active_vehicles')?.value_number ??
    PLAN_SLOTS[planSlug] ??
    15,
  )

  const { data: activeOrders } = await admin
    .from('addon_orders')
    .select('quantity, addon:addons(slug, rules)')
    .eq('organization_id', organizationId)
    .eq('status', 'active')

  let extraSlots = 0
  for (const order of activeOrders ?? []) {
    const addon = relationOne(order.addon as unknown as { slug: string; rules?: { slots?: number } } | null)
    if (!addon || (addon.slug !== 'block_10_vehicles' && addon.slug !== 'block_25_vehicles')) continue
    extraSlots += (addon.rules?.slots ?? 0) * order.quantity
  }

  const nextLimit = baseLimit + extraSlots
  const previousLimit = Number(dealer?.vehicle_slots ?? baseLimit)
  await admin.from('dealers').update({ vehicle_slots: nextLimit }).eq('id', dealerId)

  if (pauseOnDecrease || nextLimit < previousLimit) {
    await pauseExcessActiveVehicles(admin, dealerId, nextLimit)
  }
}

async function revokeAddonEffects(admin: AdminClient, order: AddonOrderRow) {
  const addon = relationOne(order.addon)
  const config = getPaidAddonByDbSlug(addon?.slug)
  if (!config) return

  if (config.slots) {
    await syncDealerVehicleSlots(admin, order.dealer_id, order.organization_id, true)
  }

  if (config.manualActivationType === 'stock_sync') {
    await admin
      .from('organization_feature_overrides')
      .update({ status: 'canceled', ends_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('organization_id', order.organization_id)
      .eq('feature_key', 'feed_sync')
      .eq('source_addon_order_id', order.id)
      .eq('status', 'active')
  }
}

async function handleAddonCheckoutCompleted(admin: AdminClient, session: Stripe.Checkout.Session) {
  const meta = session.metadata || {}
  const addon = getPaidAddon(meta.addon_slug)
  const organizationId = meta.organization_id
  const dealerId = meta.dealer_id
  if (!addon || !organizationId || !dealerId) throw new Error('Invalid addon checkout metadata')

  const { data: existingOrder } = await admin
    .from('addon_orders')
    .select('id, status')
    .eq('checkout_session_id', session.id)
    .maybeSingle()

  if (existingOrder && ['pending_activation', 'active', 'delivered'].includes(existingOrder.status)) return

  const { data: addonRow } = await admin
    .from('addons')
    .select('id')
    .eq('slug', addon.dbSlug)
    .maybeSingle()
  if (!addonRow?.id) throw new Error(`Addon ${addon.dbSlug} is not configured`)

  const stripeSubscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id ?? null
  const stripePaymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id ?? null
  const stripeCustomerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id ?? null

  const baseOrder = {
    organization_id: organizationId,
    dealer_id: dealerId,
    addon_id: addonRow.id,
    checkout_session_id: session.id,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_payment_intent_id: stripePaymentIntentId,
    stripe_customer_id: stripeCustomerId,
    quantity: 1,
    amount_cents: addon.amountCents,
    currency: addon.currency,
    activation_mode: addon.activationMode,
    manual_activation_type: addon.manualActivationType ?? null,
    updated_at: new Date().toISOString(),
  }

  await admin.from('addon_orders').upsert({
    ...baseOrder,
    status: 'pending_payment',
  }, { onConflict: 'checkout_session_id' })

  if (addon.boostCredits) {
    const expiresAt = addon.boostCreditExpiryDays
      ? new Date(Date.now() + addon.boostCreditExpiryDays * 24 * 60 * 60 * 1000).toISOString()
      : null
    const { error: creditError } = await admin.from('boost_credits').insert({
      organization_id: organizationId,
      source: 'pack',
      quantity: addon.boostCredits,
      used: 0,
      expires_at: expiresAt,
      source_ref: session.id,
    })
    if (creditError && creditError.code !== '23505') throw creditError

    await admin.from('addon_orders').update({ status: 'active', updated_at: new Date().toISOString() }).eq('checkout_session_id', session.id)
    return
  }

  if (addon.slots) {
    await admin.from('addon_orders').update({ status: 'active', updated_at: new Date().toISOString() }).eq('checkout_session_id', session.id)
    await updateAddonSubscriptionMirror(admin, {
      organizationId,
      addonDbSlug: addon.dbSlug,
      stripeSubscriptionId,
      stripeCustomerId,
      status: 'active',
    })
    await syncDealerVehicleSlots(admin, dealerId, organizationId)
    return
  }

  await admin.from('addon_orders').update({
    status: 'pending_activation',
    updated_at: new Date().toISOString(),
  }).eq('checkout_session_id', session.id)

  await updateAddonSubscriptionMirror(admin, {
    organizationId,
    addonDbSlug: addon.dbSlug,
    stripeSubscriptionId,
    stripeCustomerId,
    status: 'pending',
  })
}

async function handleAddonSubscriptionUpdated(admin: AdminClient, sub: Stripe.Subscription): Promise<boolean> {
  const order = await findAddonOrderBySubscription(admin, sub.id)
  const config = order ? getPaidAddonByDbSlug(relationOne(order.addon)?.slug) : getPaidAddon(sub.metadata?.addon_slug)
  if (!order && sub.metadata?.type !== 'addon') return false
  if (!config) return true
  if (!order) return true

  const period = subscriptionPeriodFields(sub)
  const stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null
  const payable = sub.status === 'active' || sub.status === 'trialing'
  const failed = ['past_due', 'unpaid', 'incomplete', 'incomplete_expired'].includes(sub.status)

  if (payable) {
    const nextStatus = config.activationMode === 'automatic'
      ? 'active'
      : order.status === 'active'
        ? 'active'
        : 'pending_activation'

    await admin.from('addon_orders').update({
      status: nextStatus,
      stripe_customer_id: stripeCustomerId,
      ...period,
      updated_at: new Date().toISOString(),
    }).eq('id', order.id)

    await updateAddonSubscriptionMirror(admin, {
      organizationId: order.organization_id,
      addonDbSlug: config.dbSlug,
      stripeSubscriptionId: sub.id,
      stripeCustomerId,
      status: nextStatus === 'active' ? 'active' : 'pending',
      periodStart: period.current_period_start,
      periodEnd: period.current_period_end,
      cancelAtPeriodEnd: period.cancel_at_period_end,
    })

    if (config.slots) await syncDealerVehicleSlots(admin, order.dealer_id, order.organization_id)
    return true
  }

  if (failed || sub.status === 'canceled') {
    await admin.from('addon_orders').update({
      status: sub.status === 'canceled' ? 'canceled' : 'payment_failed',
      stripe_customer_id: stripeCustomerId,
      ...period,
      updated_at: new Date().toISOString(),
    }).eq('id', order.id)
    await updateAddonSubscriptionMirror(admin, {
      organizationId: order.organization_id,
      addonDbSlug: config.dbSlug,
      stripeSubscriptionId: sub.id,
      stripeCustomerId,
      status: 'canceled',
      periodStart: period.current_period_start,
      periodEnd: period.current_period_end,
      cancelAtPeriodEnd: period.cancel_at_period_end,
    })
    await revokeAddonEffects(admin, order)
  }

  return true
}

async function handleAddonSubscriptionDeleted(admin: AdminClient, sub: Stripe.Subscription): Promise<boolean> {
  const order = await findAddonOrderBySubscription(admin, sub.id)
  if (!order && sub.metadata?.type !== 'addon') return false
  if (!order) return true

  const config = getPaidAddonByDbSlug(relationOne(order.addon)?.slug)
  await admin.from('addon_orders').update({
    status: 'canceled',
    canceled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', order.id)

  if (config) {
    const stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null
    await updateAddonSubscriptionMirror(admin, {
      organizationId: order.organization_id,
      addonDbSlug: config.dbSlug,
      stripeSubscriptionId: sub.id,
      stripeCustomerId,
      status: 'canceled',
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    })
  }
  await revokeAddonEffects(admin, order)
  return true
}

async function handleAddonInvoicePaid(admin: AdminClient, invoice: Stripe.Invoice): Promise<boolean> {
  if (!invoice.subscription) return false
  const stripeSubscriptionId = invoice.subscription as string
  const order = await findAddonOrderBySubscription(admin, stripeSubscriptionId)
  if (!order) return false

  const config = getPaidAddonByDbSlug(relationOne(order.addon)?.slug)
  if (!config) return true

  const period = invoicePeriodFields(invoice)
  const stripeCustomerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null
  const nextStatus = config.activationMode === 'automatic'
    ? 'active'
    : order.status === 'active'
      ? 'active'
      : 'pending_activation'

  await admin.from('addon_orders').update({
    status: nextStatus,
    stripe_customer_id: stripeCustomerId,
    ...period,
    updated_at: new Date().toISOString(),
  }).eq('id', order.id)

  await updateAddonSubscriptionMirror(admin, {
    organizationId: order.organization_id,
    addonDbSlug: config.dbSlug,
    stripeSubscriptionId,
    stripeCustomerId,
    status: nextStatus === 'active' ? 'active' : 'pending',
    periodStart: period.current_period_start,
    periodEnd: period.current_period_end,
  })

  if (config.slots) await syncDealerVehicleSlots(admin, order.dealer_id, order.organization_id)
  return true
}

async function handleAddonPaymentFailed(admin: AdminClient, invoice: Stripe.Invoice): Promise<boolean> {
  if (!invoice.subscription) return false
  const stripeSubscriptionId = invoice.subscription as string
  const order = await findAddonOrderBySubscription(admin, stripeSubscriptionId)
  if (!order) return false

  const config = getPaidAddonByDbSlug(relationOne(order.addon)?.slug)
  await admin.from('addon_orders').update({
    status: 'payment_failed',
    updated_at: new Date().toISOString(),
  }).eq('id', order.id)

  if (config) {
    const stripeCustomerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null
    await updateAddonSubscriptionMirror(admin, {
      organizationId: order.organization_id,
      addonDbSlug: config.dbSlug,
      stripeSubscriptionId,
      stripeCustomerId,
      status: 'canceled',
    })
  }

  await revokeAddonEffects(admin, order)
  return true
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'paused' | 'incomplete' {
  const map: Record<string, 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'paused' | 'incomplete'> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    paused: 'paused',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
  }
  return map[status] ?? 'incomplete'
}
