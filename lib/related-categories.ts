import type { SupabaseClient } from '@supabase/supabase-js'

// Enlazado cruzado entre categorías ("Sigue explorando"). Mapa revisado con Codex
// (2026-08-31): puente cronológico (clasicos↔deportivos vía youngtimer), banda de
// posicionamiento (lujo↔suv↔especiales) y cruce coches↔motos. Ningún competidor
// analizado cruza así (organizan por marca, no por categoría de uso) — es propuesta
// razonada, no patrón copiado. "custom→trail" del borrador inicial se descartó por no
// tener afinidad real de comprador; se sustituyó por clasicas/entusiastas.

export interface CategoryLink {
  label: string
  href: string
}

export const CAR_CATEGORY_RELATIONS: Record<string, CategoryLink[]> = {
  berlinas: [
    { label: 'SUV premium', href: '/coches/suv' },
    { label: 'Lujo y alta gama', href: '/coches/lujo' },
  ],
  clasicos: [
    { label: 'Unidades especiales', href: '/coches/especiales' },
    { label: 'Deportivos y superdeportivos', href: '/coches/deportivos' },
    { label: 'Motos clásicas y youngtimers', href: '/motos/clasicas' },
  ],
  deportivos: [
    { label: 'Lujo y alta gama', href: '/coches/lujo' },
    { label: 'Clásicos y youngtimers', href: '/coches/clasicos' },
    { label: 'Motos deportivas', href: '/motos/deportivas' },
  ],
  especiales: [
    { label: 'Clásicos y youngtimers', href: '/coches/clasicos' },
    { label: 'Deportivos y superdeportivos', href: '/coches/deportivos' },
    { label: 'Lujo y alta gama', href: '/coches/lujo' },
  ],
  lujo: [
    { label: 'SUV premium', href: '/coches/suv' },
    { label: 'Unidades especiales', href: '/coches/especiales' },
    { label: 'Deportivos y superdeportivos', href: '/coches/deportivos' },
  ],
  suv: [
    { label: 'Lujo y alta gama', href: '/coches/lujo' },
    { label: 'Berlinas, compactos y familiares', href: '/coches/berlinas' },
  ],
}

export const MOTO_CATEGORY_RELATIONS: Record<string, CategoryLink[]> = {
  naked: [
    { label: 'Motos deportivas', href: '/motos/deportivas' },
    { label: 'Entusiastas', href: '/motos/entusiastas' },
  ],
  scooter: [
    { label: 'Touring y sport touring', href: '/motos/touring' },
    { label: 'Naked', href: '/motos/naked' },
  ],
  'ediciones-especiales': [
    { label: 'Entusiastas', href: '/motos/entusiastas' },
    { label: 'Clásicas y youngtimers', href: '/motos/clasicas' },
    { label: 'Motos deportivas', href: '/motos/deportivas' },
  ],
  trail: [
    { label: 'Touring y sport touring', href: '/motos/touring' },
    { label: 'Naked', href: '/motos/naked' },
  ],
  entusiastas: [
    { label: 'Ediciones especiales', href: '/motos/ediciones-especiales' },
    { label: 'Clásicas y youngtimers', href: '/motos/clasicas' },
    { label: 'Coches clásicos y youngtimers', href: '/coches/clasicos' },
  ],
  deportivas: [
    { label: 'Naked', href: '/motos/naked' },
    { label: 'Ediciones especiales', href: '/motos/ediciones-especiales' },
    { label: 'Coches deportivos y superdeportivos', href: '/coches/deportivos' },
  ],
  touring: [
    { label: 'Trail y maxitrail', href: '/motos/trail' },
    { label: 'Scooters premium', href: '/motos/scooter' },
  ],
  clasicas: [
    { label: 'Entusiastas', href: '/motos/entusiastas' },
    { label: 'Ediciones especiales', href: '/motos/ediciones-especiales' },
    { label: 'Coches clásicos y youngtimers', href: '/coches/clasicos' },
  ],
  custom: [
    { label: 'Clásicas y youngtimers', href: '/motos/clasicas' },
    { label: 'Entusiastas', href: '/motos/entusiastas' },
    { label: 'Ediciones especiales', href: '/motos/ediciones-especiales' },
  ],
}

// ─── Marcas con stock real en la categoría ─────────────────────────────────────
// Enlaza a /coches?categoria=X&marca=Y cuando la categoría de ruta corresponde a UN
// solo valor real de categoría (14 de las 15 landings). El filtro `categoria` de
// applyVehicleFilters solo admite un valor exacto (.eq) — "deportivos" es la única
// que agrupa dos valores reales (deportivos + superdeportivos): ahí un enlace con
// categoria= infrarrepresentaría el resultado, así que se omite y el enlace queda
// solo por marca (más amplio pero nunca incompleto).

export interface CategoryBrandStock {
  name: string
  slug: string
  count: number
  href: string
}

const MAX_BRAND_CHIPS = 6

export async function getCategoryBrandStock(
  supabase: SupabaseClient,
  vehicleType: 'car' | 'motorcycle',
  categoryValues: string[],
  basePath: '/coches' | '/motos',
): Promise<CategoryBrandStock[]> {
  const { data } = await supabase
    .from('vehicles')
    .select('brand_name, dealer:dealers!inner(profile_status)')
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('vehicle_type', vehicleType)
    .in('category', categoryValues)

  const counts = new Map<string, number>()
  for (const v of (data ?? []) as { brand_name: string }[]) {
    counts.set(v.brand_name, (counts.get(v.brand_name) ?? 0) + 1)
  }

  const categoriaParam = categoryValues.length === 1 ? `categoria=${categoryValues[0]}&` : ''

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_BRAND_CHIPS)
    .map(([name, count]) => {
      const brandSlug = name.toLowerCase().replace(/\s+/g, '-')
      return { name, slug: brandSlug, count, href: `${basePath}?${categoriaParam}marca=${brandSlug}` }
    })
}
