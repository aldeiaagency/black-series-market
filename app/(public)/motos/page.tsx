import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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

export const metadata: Metadata = {
  title: 'Motos premium en venta',
  description: 'Motos premium, deportivas, clásicas y unidades especiales en venta en España. Concesionarios y especialistas verificados.',
  alternates: { canonical: '/motos' },
}

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

async function MotoList({ params }: { params: Record<string, string> }) {
  const supabase = await createClient()
  let query = supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified, subscription_plan)', { count: 'exact' })
    .eq('status', 'active')
    .eq('vehicle_type', 'motorcycle')

  query = (await applyVehicleFilters(supabase, query, params, 'motorcycle')).query

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
          <h3 className="font-display text-xl mb-2 text-bsm-text-primary">No hay motos con esos criterios</h3>
          <p className="text-sm text-bsm-text-muted max-w-xs mb-6">
            Ajusta los filtros o dinos qué estás buscando y lo tendremos en cuenta si aparece una unidad compatible.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/motos" className="btn-outline text-sm px-4">Limpiar filtros</Link>
            <Link href="/vehiculos-a-la-carta" className="btn-gold text-sm px-4">Solicitar vehículo a la carta</Link>
            <CreateAlertButton
              vehicleType="motorcycle"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-bsm-border text-bsm-text-muted hover:border-gold/40 hover:text-gold transition-colors"
            />
          </div>
        </div>
        <SearchAlertCTA vehicleType="motorcycle" />
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
  const supabase = await createClient()
  const { count } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('vehicle_type', 'motorcycle')

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-5">
          <h1 className="section-title">Motos premium</h1>
          <Suspense fallback={null}><SortSelector /></Suspense>
        </div>
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
  )
}
