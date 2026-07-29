import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Pausa, de forma atómica, el inventario que exceda el nuevo límite.
 *
 * La RPC conserva activos los anuncios más recientes y pausa primero los más
 * antiguos. Nunca borra vehículos y devuelve cuántos registros cambió.
 */
export async function pauseExcessActiveVehicles(
  admin: AdminClient,
  dealerId: string,
  newLimit: number,
): Promise<number> {
  const { data, error } = await admin.rpc('pause_excess_active_vehicles', {
    p_dealer_id: dealerId,
    p_new_limit: newLimit,
  })

  if (error) {
    throw new Error(`No se pudo pausar el inventario excedente: ${error.message}`)
  }

  return typeof data === 'number' ? data : Number(data ?? 0)
}

