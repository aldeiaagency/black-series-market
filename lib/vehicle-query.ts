import type { SupabaseClient } from '@supabase/supabase-js'
import { getProvinciasByComunidad } from '@/lib/utils'
import { resolveBrandNameFromSlug } from '@/lib/brands'

export type VehicleQueryType = 'car' | 'motorcycle'

/**
 * Applies the public listing filters to a `vehicles` query.
 *
 * Single source of truth shared by the listing pages (/coches, /motos) and the live
 * count endpoint (/api/vehicles/count) so the "Ver N" counter in the filter drawer
 * always matches exactly what the grid will show. Returns the query with filters
 * applied — the caller is responsible for ordering, range and selection.
 */
// NOTE: the result is wrapped in `{ query }`. Supabase query builders are themselves
// PromiseLike, so returning the builder directly from an async function would make
// `await applyVehicleFilters(...)` unwrap (execute) the query. Wrapping avoids that.
export async function applyVehicleFilters(
  supabase: SupabaseClient,
  baseQuery: any,
  params: Record<string, string>,
  vehicleType: VehicleQueryType,
): Promise<{ query: any; resolvedBrandName: string | null }> {
  let query: any = baseQuery
  let resolvedBrandName: string | null = null

  if (params.categoria) query = query.eq('category', params.categoria)

  if (params.marca) {
    // Resolve slug → canonical brand name (handles hyphenated brands like Mercedes-Benz).
    // Exposed to the caller too — reused to pre-fill "brand" when offering a search alert
    // on zero results, so it matches the exact spelling wf6's matcher compares against.
    resolvedBrandName = await resolveBrandNameFromSlug(supabase, params.marca)
    query = resolvedBrandName
      ? query.ilike('brand_name', resolvedBrandName)
      : query.ilike('brand_name', `%${params.marca.replace(/-/g, ' ')}%`)
  }

  if (params.modelo)        query = query.ilike('model_name', `%${params.modelo}%`)
  if (params.version)       query = query.ilike('version', `%${params.version}%`)
  if (params.anioMin)       query = query.gte('year', parseInt(params.anioMin))
  if (params.anioMax)       query = query.lte('year', parseInt(params.anioMax))
  if (params.precioMin)     query = query.gte('price', parseInt(params.precioMin))
  if (params.precioMax)     query = query.lte('price', parseInt(params.precioMax))
  if (params.cvMin)         query = query.gte('power_hp', parseInt(params.cvMin))
  if (params.cvMax)         query = query.lte('power_hp', parseInt(params.cvMax))
  if (params.kmMin)         query = query.gte('mileage_km', parseInt(params.kmMin))
  if (params.kmMax)         query = query.lte('mileage_km', parseInt(params.kmMax))
  if (params.combustible)   query = query.eq('fuel_type', params.combustible)
  if (params.cambio)        query = query.eq('transmission', params.cambio)
  if (params.colorExterior) query = query.ilike('color_exterior', `%${params.colorExterior}%`)

  if (params.provincia) {
    query = query.eq('location_province', params.provincia)
  } else if (params.comunidad) {
    const ps = getProvinciasByComunidad(params.comunidad)
    if (ps.length) query = query.in('location_province', ps)
  }

  if (params.showroom)              query = query.eq('dealer_id', params.showroom)
  if (params.condicion)             query = query.eq('condition_type', params.condicion)
  if (params.ivaDeducible === 'si') query = query.eq('iva_deducible', true)
  if (params.destacados === 'true') {
    query = query
      .eq('is_featured', true)
      .gt('featured_until', new Date().toISOString())
  }
  if (params.garantia === 'si')     query = query.eq('has_warranty', true)
  if (params.financiacion === 'si') query = query.eq('financing_available', true)
  if (params.equipamiento)          query = query.contains('equipment', [params.equipamiento])
  if (params.historial === 'si')    query = query.eq('has_service_history', true)

  if (vehicleType === 'car') {
    if (params.tipo)        query = query.eq('body_type', params.tipo)
    if (params.traccion)    query = query.eq('drive_type', params.traccion)
    if (params.etiquetaDgt) query = query.eq('dgt_label', params.etiquetaDgt)
  } else {
    if (params.estilo)      query = query.eq('body_type', params.estilo)
    if (params.carnet)      query = query.eq('license_type', params.carnet)
    if (params.cc) {
      const [ccMin, ccMax] = params.cc.split('-').map(Number)
      if (Number.isFinite(ccMin)) query = query.gte('displacement_cc', ccMin)
      if (Number.isFinite(ccMax)) query = query.lte('displacement_cc', ccMax)
    }
  }

  if (params.search) {
    // Saneado: quitar caracteres que romperían/inyectarían el filtro .or() de PostgREST
    // (comas, paréntesis, comodines) y acotar longitud.
    const s = params.search.replace(/[,()*%\\]/g, ' ').trim().slice(0, 60)
    if (s) {
      // Indexa marca, modelo, versión/acabado Y título → "GT3", "Weissach", "Black Series" encuentran.
      query = query.or(
        `brand_name.ilike.%${s}%,model_name.ilike.%${s}%,version.ilike.%${s}%,title.ilike.%${s}%`
      )
    }
  }

  return { query, resolvedBrandName }
}
