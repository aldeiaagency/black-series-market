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
  organizationId: string,
  opts: { bypassCap?: boolean } = {}
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

  // 2. Cupo global de destacados (max_boosted_share de los resultados activos).
  // Los boosts PAGADOS (checkout) lo omiten (bypassCap): el cliente pagó, no se le rechaza;
  // el cupo existe para limitar los destacados gratis de crédito de plan.
  if (!opts.bypassCap) {
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

  // 4. Elegir crédito disponible (primero el del ciclo de plan, luego packs FIFO por created_at).
  const now = new Date().toISOString()

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

  // 5. Consumo atómico del crédito ANTES de crear la activación. El guard `used < quantity`
  // vive en la BD (RPC consume_boost_credit), así que dos boosts concurrentes no pueden gastar
  // el mismo crédito (elimina el boost gratis por carrera del read-modify-write anterior).
  const { data: consumed, error: consumeError } = await admin
    .rpc('consume_boost_credit', { p_credit_id: availableCredit.id })

  if (consumeError || !consumed) {
    return { success: false, error: 'No tienes créditos de boost disponibles. Puedes comprar un pack de boosts desde el dashboard.' }
  }

  // 6. Crear la activación. Si falla, se reembolsa el crédito consumido (compensación).
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
    await admin.rpc('refund_boost_credit', { p_credit_id: availableCredit.id })
    return { success: false, error: 'Error al crear el boost. Inténtalo de nuevo.' }
  }

  // 7. Reflejar el destacado en la fila del vehículo. is_featured=true habilita el badge
  // "Destacado" y el ranking en el catálogo, que exige is_featured AND featured_until>now
  // (VehicleCard.showFeatured y el .order de GET /api/vehicles). Sin esto el boost pagado
  // no destacaba. El sweep de expiración (cron expire-boosts) lo revierte al vencer.
  await admin
    .from('vehicles')
    .update({ is_featured: true, featured_until: endsAt.toISOString() })
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
    .update({ is_featured: false, featured_until: null })
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

  // Agota los créditos de ciclo de plan anteriores (no se acumulan entre ciclos, §5).
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
