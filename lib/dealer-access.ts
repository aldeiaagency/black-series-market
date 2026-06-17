import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'
import type { OrgRole } from '@/lib/permissions'

/**
 * Resolución central de "qué showroom opera este usuario y con qué rol".
 *
 * Antes, cada página del dashboard hacía `dealers.eq('profile_id', user.id)`, lo que
 * asumía que el usuario logueado era SIEMPRE el dueño. Eso impedía que los miembros del
 * equipo (organization_members) accedieran. Este helper resuelve ambos casos:
 *
 *  - Dueño directo: existe un dealer cuyo `profile_id` es el usuario → rol 'owner'.
 *  - Miembro del equipo: el usuario está en `organization_members` de una organización
 *    cuyo `dealer_id` apunta a un dealer → rol = el de la membresía.
 *
 * Usa el admin client (service role) a propósito: el control de acceso lo hace este
 * helper + la capa de permisos por rol, no las RLS (que siguen atadas al owner). Así no
 * tocamos las políticas de producción ni arriesgamos el acceso de los dueños actuales.
 */

export interface DealerAccess {
  dealerId: string
  orgId:    string | null
  role:     OrgRole
}

export async function getDealerAccess(userId: string): Promise<DealerAccess | null> {
  const admin = createAdminClient()

  // 1. ¿Es dueño directo de un dealer?
  const { data: ownDealer } = await admin
    .from('dealers')
    .select('id')
    .eq('profile_id', userId)
    .maybeSingle()

  if (ownDealer) {
    const { data: org } = await admin
      .from('organizations')
      .select('id')
      .eq('dealer_id', ownDealer.id)
      .maybeSingle()
    return { dealerId: ownDealer.id, orgId: org?.id ?? null, role: 'owner' }
  }

  // 2. ¿Es miembro de alguna organización? (membresía más antigua primero)
  const { data: member } = await admin
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!member) return null

  const { data: org } = await admin
    .from('organizations')
    .select('id, dealer_id')
    .eq('id', member.organization_id)
    .maybeSingle()

  if (!org?.dealer_id) return null

  return { dealerId: org.dealer_id, orgId: org.id, role: member.role as OrgRole }
}
