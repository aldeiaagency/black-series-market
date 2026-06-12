import 'server-only'
import { getOrganizationIdForUser, getEntitlements } from './entitlements'
import type { ContactMode } from '@/components/marketplace/VehicleDetailContent'

/**
 * Resolves the contact block mode for a vehicle listing.
 * Returns 'classic' unless the dealer's plan has lead_qualification_assistant
 * enabled and operative (feature flag off by default — 'future' status).
 * Any error → 'classic' (fail-safe).
 */
export async function resolveContactMode(dealerProfileId: string): Promise<ContactMode> {
  try {
    const orgId = await getOrganizationIdForUser(dealerProfileId)
    if (!orgId) return 'classic'
    const ent  = await getEntitlements(orgId)
    const feat = ent?.features['lead_qualification_assistant']
    if (feat?.included && feat.status === 'operative') return 'assistant'
    return 'classic'
  } catch {
    return 'classic'
  }
}
