'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getOrganizationIdForUser, can } from '@/lib/entitlements'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'

export type UpdateStatusResult = { ok: true } | { ok: false; error: string }

export async function updateVehicleStatus(
  vehicleId: string,
  status: 'active' | 'paused' | 'sold',
): Promise<UpdateStatusResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }

  // Auditoría de seguridad 2026-09-02 (P0.2): antes leía `dealers.profile_id` directo, columna
  // que deja de ser accesible por `authenticated` (allowlist pública). getDealerAccess resuelve
  // con service role — mejora colateral: ahora también funciona para miembros del equipo, no
  // solo el dueño directo.
  const access = await getDealerAccess(user.id)
  if (!access) return { ok: false, error: 'Perfil de concesionario no encontrado' }
  // getDealerAccess también resuelve miembros del equipo, no solo el dueño — hay que volver a
  // comprobar el permiso de inventario explícitamente (antes lo garantizaba implícitamente ser
  // el dueño directo).
  if (!getPermissions(access.role).canEditInventory) {
    return { ok: false, error: 'No tienes permisos para gestionar el inventario.' }
  }
  const dealer = { id: access.dealerId }

  // Pre-chequeo de plan al activar (mensaje limpio). El trigger en BD es la barrera real.
  if (status === 'active') {
    const orgId = await getOrganizationIdForUser(user.id)
    const allowed = orgId ? await can(orgId, 'activate_vehicle') : true
    if (!allowed) {
      return {
        ok: false,
        error: 'Has alcanzado el límite de vehículos publicados de tu plan. Pausa otro vehículo, amplía con un bloque de inventario o sube de plan.',
      }
    }
  }

  const { error } = await supabase
    .from('vehicles')
    .update({ status })
    .eq('id', vehicleId)
    .eq('dealer_id', dealer.id)

  if (error) {
    // El trigger de BD usa el prefijo VEHICLE_LIMIT_REACHED.
    if (error.message.includes('VEHICLE_LIMIT_REACHED')) {
      return {
        ok: false,
        error: 'Has alcanzado el límite de vehículos publicados de tu plan. Pausa otro vehículo, amplía con un bloque de inventario o sube de plan.',
      }
    }
    return { ok: false, error: 'No se pudo actualizar el estado del vehículo.' }
  }

  revalidatePath('/dashboard/inventario')
  return { ok: true }
}
