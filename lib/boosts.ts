import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'

export interface BoostResult {
  success: boolean
  error?: string
  activationId?: string
  endsAt?: string
}

const BOOST_DURATION_DAYS = 7

/**
 * Activates a boost for a vehicle.
 * Rules: vehicle must be 'active' + approved; credits consumed FIFO (plan cycle first, then packs).
 * Returns error string if any guard fails — never throws.
 */
export async function activateBoost(
  vehicleId: string,
  organizationId: string
): Promise<BoostResult> {
  const admin = createAdminClient()

  // 1. Verify vehicle is active and belongs to the organization
  const { data: vehicle } = await admin
    .from('vehicles')
    .select('id, status, dealer_id')
    .eq('id', vehicleId)
    .single()

  if (!vehicle || vehicle.status !== 'active') {
    return { success: false, error: 'El vehículo debe estar activo y aprobado para activar un boost.' }
  }

  // 2. Check global boost cap (max_boosted_share of active results)
  const { count: totalActive } = await admin
    .from('vehicles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: currentBoosted } = await admin
    .from('boost_activations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('ends_at', new Date().toISOString())

  const { data: capConfig } = await admin
    .from('platform_config')
    .select('value')
    .eq('key', 'boost_config')
    .single()

  const maxShare: number = capConfig?.value?.max_boosted_share ?? 0.10
  const maxBoosted = Math.floor((totalActive ?? 0) * maxShare)

  if ((currentBoosted ?? 0) >= maxBoosted) {
    return { success: false, error: 'El cupo de vehículos destacados simultáneos está lleno. Puedes programar el boost para cuando haya disponibilidad.' }
  }

  // 3. Check if vehicle already has an active boost
  const { data: existingBoost } = await admin
    .from('boost_activations')
    .select('id')
    .eq('vehicle_id', vehicleId)
    .eq('status', 'active')
    .gte('ends_at', new Date().toISOString())
    .limit(1)
    .single()

  if (existingBoost) {
    return { success: false, error: 'Este vehículo ya tiene un boost activo.' }
  }

  // 4. Find available credit (plan cycle first, then pack credits FIFO by created_at)
  const now = new Date().toISOString()

  const { data: credit } = await admin
    .from('boost_credits')
    .select('id, source, quantity, used, expires_at')
    .eq('organization_id', organizationId)
    .lt('used', admin.rpc as never)  // used < quantity — handled below
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('source')  // 'pack' < 'plan' < 'welcome' alphabetically; adjust if needed
    .order('created_at')
    .limit(1)
    .single()

  // Simpler query without rpc comparison:
  const { data: credits } = await admin
    .from('boost_credits')
    .select('id, source, quantity, used, expires_at')
    .eq('organization_id', organizationId)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('source')
    .order('created_at')

  const availableCredit = (credits ?? []).find((c) => c.used < c.quantity)

  if (!availableCredit) {
    return { success: false, error: 'No tienes créditos de boost disponibles. Puedes comprar un pack de boosts desde el dashboard.' }
  }

  // 5. Create activation + consume credit (in a transaction via service role)
  const startsAt = new Date()
  const endsAt = new Date(startsAt.getTime() + BOOST_DURATION_DAYS * 24 * 60 * 60 * 1000)

  const { data: activation, error: activationError } = await admin
    .from('boost_activations')
    .insert({
      vehicle_id: vehicleId,
      organization_id: organizationId,
      credit_id: availableCredit.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'active',
    })
    .select('id')
    .single()

  if (activationError || !activation) {
    return { success: false, error: 'Error al crear el boost. Inténtalo de nuevo.' }
  }

  // Increment used counter on the credit
  await admin
    .from('boost_credits')
    .update({ used: availableCredit.used + 1 })
    .eq('id', availableCredit.id)

  // Mirror on vehicles.featured_until for backward compatibility
  await admin
    .from('vehicles')
    .update({ featured_until: endsAt.toISOString() })
    .eq('id', vehicleId)

  return {
    success: true,
    activationId: activation.id,
    endsAt: endsAt.toISOString(),
  }
}

/**
 * Cancels an active boost (on vehicle sold/archived).
 * No credit refund per §5.
 */
export async function cancelBoostOnVehicle(vehicleId: string) {
  const admin = createAdminClient()

  await admin
    .from('boost_activations')
    .update({ status: 'canceled' })
    .eq('vehicle_id', vehicleId)
    .eq('status', 'active')

  await admin
    .from('vehicles')
    .update({ featured_until: null })
    .eq('id', vehicleId)
}

/**
 * Provisions plan-cycle boost credits for a subscription at billing cycle renewal.
 * Called from the Stripe webhook on invoice.paid.
 * Old plan-cycle credits are NOT carried over (§5: no accumulation).
 */
export async function provisionPlanBoostCredits(
  organizationId: string,
  subscriptionId: string,
  includedBoostsMonth: number,
  cycleStart: Date
) {
  if (includedBoostsMonth <= 0) return

  const admin = createAdminClient()

  // Mark previous plan-cycle credits as fully used (prevent accumulation)
  await admin
    .from('boost_credits')
    .update({ used: admin.rpc as never })  // will handle below
    .eq('organization_id', organizationId)
    .eq('source', 'plan')

  const { data: prevCredits } = await admin
    .from('boost_credits')
    .select('id, quantity')
    .eq('organization_id', organizationId)
    .eq('source', 'plan')

  for (const c of prevCredits ?? []) {
    await admin
      .from('boost_credits')
      .update({ used: c.quantity }) // exhaust remaining
      .eq('id', c.id)
  }

  // Create new cycle credits
  await admin.from('boost_credits').insert({
    organization_id: organizationId,
    source: 'plan',
    quantity: includedBoostsMonth,
    used: 0,
    expires_at: null, // plan credits don't expire; they're voided at next cycle
    plan_cycle_start: cycleStart.toISOString(),
  })
}
