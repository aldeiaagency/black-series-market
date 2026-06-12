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
  isFounding: boolean
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

  // 1. Fetch active subscription
  const { data: sub } = await admin
    .from('subscriptions')
    .select(`
      id, status, is_founding, billing_cycle,
      plan:plans(slug, plan_limits(key, value_number), plan_features(feature_key, included, availability_status, display_label))
    `)
    .eq('organization_id', organizationId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!sub || !sub.plan) return null

  const plan = sub.plan as unknown as {
    slug: string
    plan_limits: { key: string; value_number: number | null }[]
    plan_features: { feature_key: string; included: boolean; availability_status: string; display_label: string | null }[]
  }

  // 2. Build limits from DB
  const limitsMap: Record<string, number | null> = {}
  for (const l of plan.plan_limits) {
    limitsMap[l.key] = l.value_number
  }

  // 3. Fetch active vehicle-block addons for this subscription
  const { data: subAddons } = await admin
    .from('subscription_addons')
    .select('quantity, addon:addons(slug, rules)')
    .eq('subscription_id', sub.id)
    .eq('status', 'active')

  let extraVehicleSlots = 0
  for (const sa of subAddons ?? []) {
    const addon = sa.addon as unknown as { slug: string; rules: { slots?: number } } | null
    if (!addon) continue
    const slots = addon.rules?.slots ?? 0
    if (addon.slug === 'block_10_vehicles' || addon.slug === 'block_25_vehicles') {
      extraVehicleSlots += slots * sa.quantity
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

  // 4. Build features map
  const features: Record<string, PlanFeature> = {}
  for (const f of plan.plan_features) {
    features[f.feature_key] = {
      included: f.included,
      status: f.availability_status as FeatureStatus,
      displayLabel: f.display_label,
    }
  }

  // 5. Usage snapshot
  const [vehicleCount, memberCount, locationCount, boostUsed] = await Promise.all([
    admin
      .from('vehicles')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', organizationId)   // NOTE: adjust join once org↔dealer mapping is complete
      .eq('status', 'active'),
    admin
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    admin
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    // Boosts used in current billing cycle
    admin
      .from('boost_activations')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', sub.plan ? new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString() : '1970-01-01'),
  ])

  const usage: UsageSnapshot = {
    activeVehicles:    vehicleCount.count ?? 0,
    users:             memberCount.count  ?? 0,
    locations:         locationCount.count ?? 0,
    boostsUsedThisCycle: boostUsed.count  ?? 0,
  }

  return {
    plan: plan.slug as PlanSlug,
    isFounding: sub.is_founding,
    subscriptionStatus: sub.status,
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
      return (ent.features['csv_recurring']?.included && ent.features['csv_recurring']?.status === 'operative') ?? false

    case 'use_pipeline':
      return (ent.features['pipeline']?.included) ?? false

    case 'view_analytics_advanced':
      return (ent.features['analytics_advanced']?.included) ?? false

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
