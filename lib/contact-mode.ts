import 'server-only'
import { getOrganizationIdForDealer, getEntitlements } from './entitlements'
import type { ContactMode } from '@/components/marketplace/VehicleDetailContent'

/**
 * Resolves the contact block mode for a vehicle listing.
 *
 * - 'assistant'         → la feature está incluida en el plan Y operativa (IA conectada
 *                         + webhook del showroom). El widget habla con el backend real.
 * - 'assistant_preview' → la feature está incluida pero todavía en estado 'future' (la IA
 *                         no está conectada). Mostramos la UI del agente con un guion local
 *                         para poder validar visualmente cómo queda por plan, sin backend.
 * - 'classic'           → el plan no incluye el agente (Essential) o hay cualquier error.
 *
 * Cuando se conecte la IA y la feature pase a 'operative', el modo real toma el relevo
 * automáticamente, sin tocar más código.
 */
export async function resolveContactMode(dealerId: string): Promise<ContactMode> {
  try {
    const orgId = await getOrganizationIdForDealer(dealerId)
    if (!orgId) return 'classic'
    const ent  = await getEntitlements(orgId)
    const feat = ent?.features['lead_qualification_assistant']
    if (!feat?.included) return 'classic'
    return feat.status === 'operative' ? 'assistant' : 'assistant_preview'
  } catch {
    return 'classic'
  }
}
