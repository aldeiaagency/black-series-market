import type { SupabaseClient } from '@supabase/supabase-js'
import type { FaqItem } from '@/components/marketplace/FaqSection'
import { BRAND_EDITORIAL } from '@/lib/brand-editorial'

// FAQ de marca. Revisado con Codex (2026-08-31): las 2 preguntas fijas usan siempre
// "vehículo" (nunca "coche/moto") para no depender de concordancia de género, y evitan
// prometer stock o datos concretos del showroom que puedan no existir para todas las
// marcas/dealers — de ahí "cuando esa información está disponible" y "explorar el
// catálogo... en cada momento" en vez de afirmar que hay unidades ahora mismo.
// No se reutiliza el párrafo de BRAND_EDITORIAL como respuesta: ya se muestra visible
// aparte en la misma página: repetirlo en el acordeón sería contenido duplicado.
// Gate: solo marcas con editorial ya escrito (evita FAQ en páginas de contenido fino).

// Mismo criterio de dos umbrales que category-faq.ts: con 3-4 unidades una media ya
// es publicable como rango, pero como media es poco representativa (más aún aquí,
// donde una marca puede mezclar coches y motos de bandas de precio muy distintas).
const MIN_UNITS_FOR_RANGE = 3
const MIN_UNITS_FOR_AVG = 5

export interface BrandPriceStats {
  count: number
  avgPrice: number | null
  minPrice: number | null
  maxPrice: number | null
}

export async function getBrandPriceStats(
  supabase: SupabaseClient,
  brandName: string,
): Promise<BrandPriceStats> {
  const { data } = await supabase
    .from('vehicles')
    .select('price, price_on_request, dealer:dealers!inner(profile_status)')
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .ilike('brand_name', brandName)

  const priced = (data ?? []).filter((v: any) => !v.price_on_request && v.price != null)
  if (priced.length === 0) return { count: 0, avgPrice: null, minPrice: null, maxPrice: null }
  const prices = priced.map((v: any) => v.price as number)
  return {
    count: priced.length,
    avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  }
}

export function buildBrandFaqItems(
  brandSlug: string,
  brandName: string,
  stats: BrandPriceStats,
  esGroupThousands: (n: number) => string,
): FaqItem[] {
  if (!(brandSlug in BRAND_EDITORIAL)) return []

  const items: FaqItem[] = []

  if (stats.count >= MIN_UNITS_FOR_RANGE) {
    items.push({
      q: `¿Qué rango de precios tiene un vehículo ${brandName} en Black Label Market ahora mismo?`,
      a: `Entre ${esGroupThousands(stats.minPrice!)} € y ${esGroupThousands(stats.maxPrice!)} €, entre los ${stats.count} ${brandName} con precio publicado disponibles ahora mismo en Black Label Market.`,
    })
  }
  if (stats.count >= MIN_UNITS_FOR_AVG) {
    items.push({
      q: `¿Cuál es el precio medio de un vehículo ${brandName} en Black Label Market ahora mismo?`,
      a: `El precio medio de los ${stats.count} ${brandName} con precio publicado ahora mismo en Black Label Market es de ${esGroupThousands(stats.avgPrice!)} €. Esto describe el inventario disponible en este momento, no una media de mercado.`,
    })
  }

  items.push({
    q: `¿Los concesionarios que venden ${brandName} en Black Label Market están verificados?`,
    a: `Sí. Todos los vendedores de Black Label Market son concesionarios, compraventas o especialistas profesionales verificados antes de publicar — no se admiten particulares. En la ficha de cada showroom puedes consultar su ubicación, años de actividad y especialidades cuando esa información está disponible.`,
  })

  items.push({
    q: `¿Dónde comprar un vehículo ${brandName} verificado en España?`,
    a: `En Black Label Market puedes explorar el catálogo de ${brandName} disponible en cada momento, filtrar por precio, año, kilometraje y ubicación, y contactar directamente con el concesionario o especialista que publique cada unidad. Las fichas indican si hay historial de mantenimiento disponible para ayudarte a decidir antes de contactar.`,
  })

  return items
}
