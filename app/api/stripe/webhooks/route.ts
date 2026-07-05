import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { provisionPlanBoostCredits, activateBoost } from '@/lib/boosts'
import { incrementEliteCounter } from '@/lib/elite-capacity'
import type Stripe from 'stripe'

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
    // marcado como procesado (así solo quedan los procesados con éxito y un reintento podría
    // reprocesarlo). Se devuelve 200 igualmente (diseño: no provocar tormenta de reintentos).
    await admin.from('processed_stripe_events').delete().eq('event_id', event.id)
    return NextResponse.json({ received: true, error: 'handler_error' })
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
    await admin
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

    // Materialize is_featured for Elite
    if (planSlug === 'elite') {
      await admin
        .from('organizations')
        .update({ is_featured: true, featured_since: new Date().toISOString() })
        .eq('id', organizationId)

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
  const PLAN_SLOTS: Record<string, number> = { essential: 15, professional: 50, elite: 100 }
  if (dealerId) {
    await admin.from('dealers').update({
      subscription_plan: planSlug as 'essential' | 'professional' | 'elite',
      stripe_subscription_id: session.subscription as string,
      stripe_customer_id: session.customer as string,
      status: 'active',
      vehicle_slots: PLAN_SLOTS[planSlug] ?? 15,
      subscription_start_at: new Date().toISOString(),
      subscription_end_at: new Date(
        Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
    }).eq('id', dealerId)

    // Auto-configure AI assistant for Professional and Elite plans
    if (planSlug === 'professional' || planSlug === 'elite') {
      const assistantWebhookUrl = process.env.N8N_ASSISTANT_WEBHOOK_URL
        ?? 'https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/assistant'
      await admin
        .from('showroom_assistant_config')
        .upsert({ dealer_id: dealerId, webhook_url: assistantWebhookUrl, enabled: true }, { onConflict: 'dealer_id' })
    }
  }
}

async function handleSubscriptionUpdated(
  admin: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription
) {
  const status = mapStripeStatus(sub.status)

  // Update new subscriptions table
  await admin
    .from('subscriptions')
    .update({
      status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', sub.id)

  // Legacy dealers sync
  await admin
    .from('dealers')
    .update({ status: status === 'active' ? 'active' : 'suspended' })
    .eq('stripe_subscription_id', sub.id)
}

async function handleSubscriptionDeleted(
  admin: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription
) {
  // Mark subscription as canceled
  await admin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', sub.id)

  // Revoke is_featured on organization
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

    // §5: downgrade cancels — archive vehicles that exceed plan (set to paused)
    // Handled by a DB trigger / cron in production; here we log intent
    await admin.from('audit_log').insert({
      organization_id: subscription.organization_id,
      action: 'subscription_canceled',
      entity_type: 'subscription',
      entity_id: sub.id,
      metadata: { stripe_subscription_id: sub.id },
    })
  }

  // Legacy
  await admin.from('dealers').update({
    subscription_plan: null,
    stripe_subscription_id: null,
    status: 'trial',
    vehicle_slots: 5,
    is_featured: false,
  }).eq('stripe_subscription_id', sub.id)
}

async function handleInvoicePaid(
  admin: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
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
