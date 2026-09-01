import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlanSlug = 'essential' | 'professional' | 'elite' | 'grupo'

export type FeatureStatus = 'operative' | 'partial' | 'future'

export interface PlanFeature {
  included: boolean
  status: FeatureStatus
  displayLabel?: string | null
}

export interface PlanLimits {
  maxActiveVehicles: number
  maxUsers: number
  maxLocations: number
  includedBoostsMonth: number
  analyticsRetentionDays: number
  maxExtraVehicleBlocks: number | null
  extraVehicleSlots: number  // from active subscription_addons
}

export interface UsageSnapshot {
  activeVehicles: number
  users: number
  locations: number
  boostsUsedThisCycle: number
}

export interface Entitlements {
  plan: PlanSlug
  subscriptionStatus: string
  limits: PlanLimits
  features: Record<string, PlanFeature>
  usage: UsageSnapshot
}

// ─── Main resolver ────────────────────────────────────────────────────────────

export async function getEntitlements(
  organizationId: string,
  _locationId?: string
): Promise<Entitlements | null> {
  const admin = createAdminClient()

  // 0. Resolve org → dealer_id (usage on dealer-scoped tables like vehicles needs the
  //    dealer id, NOT the org id) and the legacy plan as fallback.
  const { data: org } = await admin
    .from('organizations')
    .select('dealer_id')
    .eq('id', organizationId)
    .single()

  const dealerId = org?.dealer_id ?? null

  let legacyPlanSlug: string | null = null
  if (dealerId) {
    const { data: dealer } = await admin
      .from('dealers')
      .select('subscription_plan')
      .eq('id', dealerId)
      .single()
    legacyPlanSlug = dealer?.subscription_plan ?? null
  }

  // 1. Active subscription (new system). May not exist for legacy/manual dealers.
  const { data: sub } = await admin
    .from('subscriptions')
    .select('id, status')
    .eq('organization_id', organizationId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 2. Determine effective plan: subscription wins; otherwise fall back to dealers.subscription_plan.
  let planSlug: string | null = null
  if (sub) {
    const { data: subPlan } = await admin
      .from('subscriptions')
      .select('plan:plans(slug)')
      .eq('id', sub.id)
      .single()
    planSlug = (subPlan?.plan as unknown as { slug: string } | null)?.slug ?? null
  }
  if (!planSlug) planSlug = legacyPlanSlug

  if (!planSlug) return null

  // 3. Load plan config (limits + features) from the single source of truth.
  const { data: plan } = await admin
    .from('plans')
    .select('slug, plan_limits(key, value_number), plan_features(feature_key, included, availability_status, display_label)')
    .eq('slug', planSlug)
    .single()

  if (!plan) return null

  const planRow = plan as unknown as {
    slug: string
    plan_limits: { key: string; value_number: number | null }[]
    plan_features: { feature_key: string; included: boolean; availability_status: string; display_label: string | null }[]
  }

  // 4. Build limits from DB
  const limitsMap: Record<string, number | null> = {}
  for (const l of planRow.plan_limits) {
    limitsMap[l.key] = l.value_number
  }

  // 5. Active vehicle-block addons. Prefer paid addon_orders created by Stripe Checkout;
  // keep subscription_addons as backward-compatible input for older/manual rows.
  let extraVehicleSlots = 0
  const countedAddonSubscriptions = new Set<string>()
  if (sub) {
    const { data: subAddons } = await admin
      .from('subscription_addons')
      .select('quantity, stripe_subscription_id, addon:addons(slug, rules)')
      .eq('subscription_id', sub.id)
      .eq('status', 'active')

    for (const sa of subAddons ?? []) {
      const addon = sa.addon as unknown as { slug: string; rules: { slots?: number } } | null
      if (!addon) continue
      const slots = addon.rules?.slots ?? 0
      if (addon.slug === 'block_10_vehicles' || addon.slug === 'block_25_vehicles') {
        extraVehicleSlots += slots * sa.quantity
        if (sa.stripe_subscription_id) countedAddonSubscriptions.add(sa.stripe_subscription_id)
      }
    }
  }

  const { data: paidAddonOrders } = await admin
    .from('addon_orders')
    .select('quantity, stripe_subscription_id, addon:addons(slug, rules)')
    .eq('organization_id', organizationId)
    .eq('status', 'active')

  for (const order of paidAddonOrders ?? []) {
    if (order.stripe_subscription_id && countedAddonSubscriptions.has(order.stripe_subscription_id)) continue
    const addon = order.addon as unknown as { slug: string; rules: { slots?: number } } | null
    if (!addon) continue
    const slots = addon.rules?.slots ?? 0
    if (addon.slug === 'block_10_vehicles' || addon.slug === 'block_25_vehicles') {
      extraVehicleSlots += slots * order.quantity
    }
  }

  const limits: PlanLimits = {
    maxActiveVehicles:    (limitsMap['max_active_vehicles']    ?? 15) + extraVehicleSlots,
    maxUsers:             limitsMap['max_users']                ?? 1,
    maxLocations:         limitsMap['max_locations']            ?? 1,
    includedBoostsMonth:  limitsMap['included_boosts_month']   ?? 0,
    analyticsRetentionDays: limitsMap['analytics_retention_days'] ?? 30,
    maxExtraVehicleBlocks: limitsMap['max_extra_vehicle_blocks'] ?? null,
    extraVehicleSlots,
  }

  // 6. Build features map
  const features: Record<string, PlanFeature> = {}
  for (const f of planRow.plan_features) {
    features[f.feature_key] = {
      included: f.included,
      status: f.availability_status as FeatureStatus,
      displayLabel: f.display_label,
    }
  }


  const nowIso = new Date().toISOString()

  const { data: featureOverrides } = await admin
    .from('organization_feature_overrides')
    .select('feature_key, included, availability_status, display_label')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .or(`ends_at.is.null,ends_at.gt.${nowIso}`)

  for (const override of featureOverrides ?? []) {
    features[override.feature_key] = {
      included: override.included,
      status: override.availability_status as FeatureStatus,
      displayLabel: override.display_label,
    }
  }

  // 7. Usage snapshot (vehicles are dealer-scoped → use dealerId; the rest is org-scoped)
  const [vehicleCount, memberCount, locationCount, boostUsed] = await Promise.all([
    dealerId
      ? admin
          .from('vehicles')
          .select('id', { count: 'exact', head: true })
          .eq('dealer_id', dealerId)
          .eq('status', 'active')
      : Promise.resolve({ count: 0 }),
    admin
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    admin
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    // Boosts used in current billing cycle (~last 32 days)
    admin
      .from('boost_activations')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const usage: UsageSnapshot = {
    activeVehicles:    vehicleCount.count ?? 0,
    users:             memberCount.count  ?? 0,
    locations:         locationCount.count ?? 0,
    boostsUsedThisCycle: boostUsed.count  ?? 0,
  }

  return {
    plan: planRow.slug as PlanSlug,
    subscriptionStatus: sub?.status ?? 'active',
    limits,
    features,
    usage,
  }
}

// ─── can() — Authorization sugar ─────────────────────────────────────────────

type Action =
  | 'activate_vehicle'
  | 'import_csv'
  | 'use_pipeline'
  | 'view_analytics_advanced'
  | 'view_analytics_elite'
  | 'use_lead_scoring'
  | 'use_hot_lead_alerts'
  | 'use_calendar_integration'
  | 'use_appointment_booking'
  | 'invite_user'
  | 'activate_boost'
  | 'showroom_featured'
  | 'view_carta_general'
  | 'add_location'

export async function can(
  organizationId: string,
  action: Action,
  _context?: Record<string, unknown>
): Promise<boolean> {
  const ent = await getEntitlements(organizationId)
  if (!ent) return false

  switch (action) {
    case 'activate_vehicle':
      return ent.usage.activeVehicles < ent.limits.maxActiveVehicles

    case 'import_csv':
      // Gating = included por plan. El status es informativo (ver docs/pendientes-configuracion-externa.md).
      return ent.features['csv_recurring']?.included ?? false

    case 'use_pipeline':
      return (ent.features['pipeline']?.included) ?? false

    case 'view_analytics_advanced':
      return (ent.features['analytics_advanced']?.included) ?? false

    case 'view_analytics_elite':
      return (ent.features['analytics_extended_compare']?.included) ?? false

    case 'use_lead_scoring': {
      const feature = ent.features['lead_scoring']
      return feature?.included === true && feature.status === 'operative'
    }

    case 'use_hot_lead_alerts': {
      const feature = ent.features['hot_lead_alerts']
      return feature?.included === true && feature.status === 'operative'
    }

    case 'use_calendar_integration': {
      const feature = ent.features['calendar_integration']
      return feature?.included === true && feature.status === 'operative'
    }

    case 'use_appointment_booking': {
      const feature = ent.features['appointment_booking']
      return feature?.included === true && feature.status === 'operative'
    }

    case 'invite_user':
      return ent.usage.users < ent.limits.maxUsers

    case 'activate_boost': {
      const cycleBoosts = ent.limits.includedBoostsMonth
      const used = ent.usage.boostsUsedThisCycle
      return used < cycleBoosts
    }

    case 'showroom_featured':
      return (ent.features['showroom_featured']?.included) ?? false

    case 'view_carta_general':
      return ent.features['vehicles_on_request']?.displayLabel === 'general_board'

    case 'add_location':
      return ent.usage.locations < ent.limits.maxLocations

    default:
      return false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the organization_id for a given user_id.
 * Uses the primary membership (owner > admin > others).
 */
export async function getOrganizationIdForUser(userId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  return data?.organization_id ?? null
}
