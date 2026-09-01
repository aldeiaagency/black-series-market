import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/server'

// ISR: catálogo público → cache CDN, revalida cada 5 min.
export const revalidate = 300
import VehicleCard from '@/components/marketplace/VehicleCard'
import VehicleFilters from '@/components/marketplace/VehicleFilters'
import SortSelector from '@/components/marketplace/SortSelector'
import ActiveFiltersBar from '@/components/marketplace/ActiveFiltersBar'
import SearchAlertCTA from '@/components/marketplace/SearchAlertCTA'
import CreateAlertButton from '@/components/marketplace/CreateAlertButton'
import { applyVehicleFilters } from '@/lib/vehicle-query'
import Pagination from '@/components/marketplace/Pagination'
import FaqSection, { type FaqItem } from '@/components/marketplace/FaqSection'
import { JsonLd } from '@/components/seo/JsonLd'

// FAQ de la landing de motos (solo en la vista sin filtros). Respuestas factuales basadas en
// los datos reales de la ficha (carnet, electrónica, financiación, cobertura).
const MOTOS_FAQ: FaqItem[] = [
  {
    q: '¿Qué tipo de motos encuentro en Black Label Market?',
    a: 'Motos premium y de interés: superbikes y deportivas, nakeds e hypernakeds, trail y maxitrail, custom y cruiser, clásicas y neo-retro, sport touring, maxiscooters premium y ediciones especiales o de colección. Todas de concesionarios y especialistas verificados en España.',
  },
  {
    q: '¿Qué carnet necesito para cada moto?',
    a: 'Cuando aplica, la ficha indica el carnet requerido (AM, A1, A2 o A). Así puedes filtrar y ver de un vistazo qué motos puedes conducir según tu permiso. Ante cualquier duda sobre convalidaciones o restricciones, confírmalo con el vendedor.',
  },
  {
    q: '¿Puedo ver el equipamiento electrónico y las ayudas a la conducción?',
    a: 'Sí. La ficha detalla el equipamiento electrónico relevante: ABS, control de tracción, modos de conducción, suspensión electrónica y si incluye maletas, entre otros. Es la información clave para comparar motos de gama alta.',
  },
  {
    q: '¿Hay financiación o entrega de mi moto como parte de pago?',
    a: 'Depende de cada profesional. En la ficha se indica si el vendedor ofrece financiación y si acepta tu moto como parte de pago. Lo gestiona el propio profesional; Black Label no gestiona financiación directamente.',
  },
  {
    q: '¿Puedo comprar la moto desde cualquier provincia de España?',
    a: 'Sí. El catálogo es nacional y puedes filtrar por provincia. Algunos profesionales ofrecen transporte del vehículo a otras zonas de España; cuando es así, se indica en la ficha.',
  },
]

const SORT_MAP: Record<string, { col: string; asc: boolean }[]> = {
  featured:     [{ col: 'is_featured', asc: false }, { col: 'published_at', asc: false }],
  newest:       [{ col: 'published_at', asc: false }],
  oldest:       [{ col: 'published_at', asc: true }],
  price_asc:    [{ col: 'price', asc: true }],
  price_desc:   [{ col: 'price', asc: false }],
  mileage_asc:  [{ col: 'mileage_km', asc: true }],
  mileage_desc: [{ col: 'mileage_km', asc: false }],
  year_desc:    [{ col: 'year', asc: false }],
  year_asc:     [{ col: 'year', asc: true }],
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string>> }): Promise<Metadata> {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  return {
    title: 'Motos premium en venta',
    description: 'Motos premium, deportivas, clásicas y unidades especiales en venta en España. Concesionarios y especialistas verificados.',
    alternates: { canonical: page > 1 ? `/motos?page=${page}` : '/motos' },
  }
}

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

async function MotoList({ params }: { params: Record<string, string> }) {
  const supabase = createPublicClient()
  let query = supabase
    .from('vehicles')
    .select('*, dealer:dealers!inner(name, slug, location_city, logo_url, is_verified, subscription_plan)', { count: 'exact' })
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('vehicle_type', 'motorcycle')

  const filtered = await applyVehicleFilters(supabase, query, params, 'motorcycle')
  query = filtered.query

  const sorts = SORT_MAP[params.sort || 'featured'] || SORT_MAP.featured
  for (const s of sorts) query = query.order(s.col, { ascending: s.asc })

  const page  = Math.max(1, parseInt(params.page || '1'))
  const limit = 24
  const { data: rawVehicles, count } = await query.range((page - 1) * limit, page * limit - 1)

  const planRank = (plan: string | null | undefined) =>
    plan === 'elite' ? 2 : plan === 'professional' ? 1 : 0
  const vehicles = rawVehicles
    ? [...rawVehicles].sort((a: any, b: any) =>
        planRank(b.dealer?.subscription_plan) - planRank(a.dealer?.subscription_plan)
      )
    : rawVehicles

  if (!vehicles?.length) {
    // Hereda los filtros ya aplicados en la búsqueda — evita que el comprador tenga que
    // volver a teclear lo que ya había filtrado al crear la alerta desde cero-resultados.
    const alertInitialValues = {
      brand:      filtered.resolvedBrandName || undefined,
      model:      params.modelo || undefined,
      budget_max: params.precioMax || undefined,
      year_min:   params.anioMin || undefined,
      km_max:     params.kmMax || undefined,
      location:   params.provincia || params.comunidad || undefined,
    }
    return (
      <div className="flex-1 space-y-6">
        <div className="flex flex-col items-center justify-center py-16 text-center border border-bsm-border bg-surface">
          <h2 className="font-display text-xl mb-2 text-bsm-text-primary">No hay motos con esos criterios</h2>
          <p className="text-sm text-bsm-text-muted max-w-xs mb-6">
            Ajusta los filtros o dinos qué estás buscando y lo tendremos en cuenta si aparece una unidad compatible.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/motos" className="btn-outline text-sm px-4">Limpiar filtros</Link>
            <Link href="/vehiculos-a-la-carta" className="btn-gold text-sm px-4">Solicitar vehículo a la carta</Link>
            <CreateAlertButton
              vehicleType="motorcycle"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-bsm-border text-bsm-text-muted hover:border-gold/40 hover:text-gold transition-colors"
              initialValues={alertInitialValues}
            />
          </div>
        </div>
        <SearchAlertCTA vehicleType="motorcycle" initialValues={alertInitialValues} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {(count ?? 0) <= limit && (
        <p className="text-sm text-bsm-text-muted">
          {count} moto{count !== 1 ? 's' : ''} encontrada{count !== 1 ? 's' : ''}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
      </div>
      <Pagination
        page={page}
        totalCount={count ?? 0}
        limit={limit}
        params={params}
        basePath="/motos"
        label="motos"
      />
      <SearchAlertCTA vehicleType="motorcycle" compact />
    </div>
  )
}

export default async function MotosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createPublicClient()
  const [{ count }, { data: itemListVehicles }] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id, dealer:dealers!inner(profile_status)', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('dealer.profile_status', 'published')
      .eq('vehicle_type', 'motorcycle'),
    supabase
      .from('vehicles')
      .select('slug, brand_name, model_name, year, dealer:dealers!inner(profile_status)')
      .eq('status', 'active')
      .eq('dealer.profile_status', 'published')
      .eq('vehicle_type', 'motorcycle')
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(10),
  ])

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Motos premium en venta en España',
    url: `${SITE_URL}/motos`,
    itemListElement: (itemListVehicles || []).map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/motos/${v.slug}`,
      name: `${v.brand_name} ${v.model_name} ${v.year}`,
    })),
  }

  return (
    <>
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <JsonLd data={itemListJsonLd} />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-3">
          <h1 className="section-title">Motos premium</h1>
          <Suspense fallback={null}><SortSelector /></Suspense>
        </div>
        <p className="text-sm text-bsm-text-muted mb-5 max-w-2xl">
          Motos deportivas, clásicas, custom y premium en venta en España. Ducati, BMW Motorrad, MV Agusta, Harley-Davidson y mucho más, de especialistas verificados con stock actualizado.
        </p>
        {/* Filter bar — quick filters + 'Todos los filtros' drawer */}
        <Suspense fallback={null}>
          <VehicleFilters vehicleType="motorcycle" totalCount={count || 0} />
        </Suspense>
        <Suspense fallback={null}>
          <ActiveFiltersBar className="mt-4" />
        </Suspense>
      </div>

      <Suspense fallback={<div />}>
        <MotoList params={params} />
      </Suspense>
    </div>
    {Object.keys(params).length === 0 && (
      <FaqSection items={MOTOS_FAQ} heading="Preguntas frecuentes sobre comprar una moto premium" eyebrow="Comprar una moto" />
    )}
    </>
  )
}
