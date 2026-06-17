'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getOrganizationIdForUser, can } from '@/lib/entitlements'

export type UpdateStatusResult = { ok: true } | { ok: false; error: string }

export async function updateVehicleStatus(
  vehicleId: string,
  status: 'active' | 'paused' | 'sold',
): Promise<UpdateStatusResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) return { ok: false, error: 'Perfil de concesionario no encontrado' }

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
