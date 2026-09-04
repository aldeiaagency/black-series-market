import 'server-only'
import type { createAdminClient } from '@/lib/supabase/server'
import type { VehicleIntakeRow } from './types'

type Admin = ReturnType<typeof createAdminClient>

export function normalizeVin(vin?: string | null): string | null {
  if (!vin) return null
  const clean = vin.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  // Un VIN real tiene 17 caracteres; por debajo de eso es casi seguro basura de feed
  // (ceros, "N/D", etc.) — mejor no usarlo como clave que arriesgarnos a fusionar
  // vehículos distintos por un valor inválido.
  return clean.length >= 11 ? clean : null
}

/**
 * Busca un vehículo existente del mismo dealer para decidir INSERT vs UPDATE en
 * sync de feed/DMS. Orden de preferencia (decisión 2026-09-04, sin feed real que
 * confirme qué identificador ofrece cada DMS — se revisa según lo que se vea en el
 * primer feed real que se conecte):
 *   1. VIN normalizado — el único identificador realmente único de un vehículo.
 *   2. external_ref — id de anuncio propio del feed, si lo trae.
 *   3. Aproximación por marca+modelo+año+km — nunca perfecta, pero evita duplicar
 *      el catálogo completo en cada corrida cuando no hay mejor dato.
 * VIN y external_ref SÍ incluyen vehículos `sold` en la búsqueda (el índice único de
 * la 110 tampoco los excluye — dos filas con el mismo VIN no pueden coexistir, venta
 * cerrada o no). Es intakeVehiclesBulk() quien decide, ya con el status real en mano,
 * no reabrir una venta cerrada. Solo la aproximación difusa (sin identificador fiable)
 * excluye `sold`: emparejar por similitud contra una unidad ya vendida es más arriesgado
 * que contra una activa.
 */
export async function findExistingVehicle(
  admin: Admin,
  dealerId: string,
  row: VehicleIntakeRow,
): Promise<{ id: string; status: string } | null> {
  const vin = normalizeVin(row.vin)
  if (vin) {
    const { data } = await admin
      .from('vehicles')
      .select('id, status')
      .eq('dealer_id', dealerId)
      .eq('vin_normalized', vin)
      .maybeSingle()
    if (data) return data
  }

  if (row.external_ref) {
    const { data } = await admin
      .from('vehicles')
      .select('id, status')
      .eq('dealer_id', dealerId)
      .eq('external_ref', row.external_ref)
      .maybeSingle()
    if (data) return data
  }

  if (row.brand_name && row.model_name && row.year && row.mileage_km !== undefined) {
    const { data } = await admin
      .from('vehicles')
      .select('id, status')
      .eq('dealer_id', dealerId)
      .eq('brand_name', row.brand_name)
      .eq('model_name', row.model_name)
      .eq('year', row.year)
      .eq('mileage_km', row.mileage_km)
      .neq('status', 'sold')
      .maybeSingle()
    if (data) return data
  }

  return null
}
