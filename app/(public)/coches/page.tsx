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
    title: 'Coches premium en venta',
    description: 'Coches premium, deportivos, clásicos y unidades especiales en venta en España. Concesionarios y especialistas verificados.',
    alternates: { canonical: page > 1 ? `/coches?page=${page}` : '/coches' },
  }
}

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

async function VehicleList({ params }: { params: Record<string, string> }) {
  const supabase = createPublicClient()
  let query = supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified, subscription_plan)', { count: 'exact' })
    .eq('status', 'active')
    .eq('vehicle_type', 'car')

  query = (await applyVehicleFilters(supabase, query, params, 'car')).query

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
    return (
      <div className="flex-1 space-y-6">
        <div className="flex flex-col items-center justify-center py-16 text-center border border-bsm-border bg-surface">
          <h3 className="font-display text-xl mb-2 text-bsm-text-primary">No hay vehículos con esos criterios</h3>
          <p className="text-sm text-bsm-text-muted max-w-xs mb-6">
            Ajusta los filtros o dinos qué estás buscando y lo tendremos en cuenta si aparece una unidad compatible.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/coches" className="btn-outline text-sm px-4">Limpiar filtros</Link>
            <Link href="/vehiculos-a-la-carta" className="btn-gold text-sm px-4">Solicitar vehículo a la carta</Link>
            <CreateAlertButton
              vehicleType="car"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-bsm-border text-bsm-text-muted hover:border-gold/40 hover:text-gold transition-colors"
            />
          </div>
        </div>
        <SearchAlertCTA vehicleType="car" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8">
      {(count ?? 0) <= limit && (
        <p className="text-sm text-bsm-text-muted">
          {count} unidad{count !== 1 ? 'es' : ''} encontrada{count !== 1 ? 's' : ''}
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
        basePath="/coches"
        label="coches"
      />
      <SearchAlertCTA vehicleType="car" compact />
    </div>
  )
}

export default async function CochesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createPublicClient()
  const [{ count }, { data: itemListVehicles }] = await Promise.all([
    supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('vehicle_type', 'car'),
    supabase
      .from('vehicles')
      .select('slug, brand_name, model_name, year')
      .eq('status', 'active')
      .eq('vehicle_type', 'car')
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(10),
  ])

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Coches premium en venta en España',
    url: `${SITE_URL}/coches`,
    itemListElement: (itemListVehicles || []).map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/coches/${v.slug}`,
      name: `${v.brand_name} ${v.model_name} ${v.year}`,
    })),
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-3">
          <h1 className="section-title">Coches premium</h1>
          <Suspense fallback={null}>
            <SortSelector />
          </Suspense>
        </div>
        <p className="text-sm text-bsm-text-muted mb-5 max-w-2xl">
          Coches deportivos, GT, clásicos, superdeportivos y unidades especiales en venta en España. Solo concesionarios y especialistas verificados, con stock real y ficha completa.
        </p>
        {/* Filter bar — quick filters + 'Todos los filtros' drawer */}
        <Suspense fallback={null}>
          <VehicleFilters vehicleType="car" totalCount={count || 0} />
        </Suspense>
        <Suspense fallback={null}>
          <ActiveFiltersBar className="mt-4" />
        </Suspense>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <VehicleList params={params} />
      </Suspense>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-surface border border-bsm-border">
          <div className="aspect-[16/10] shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-3 w-20 bg-surface-elevated shimmer" />
            <div className="h-5 w-40 bg-surface-elevated shimmer" />
            <div className="h-3 w-32 bg-surface-elevated shimmer" />
          </div>
        </div>
      ))}
    </div>
  )
}
