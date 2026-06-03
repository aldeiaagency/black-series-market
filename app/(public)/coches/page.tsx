import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import VehicleFilters from '@/components/marketplace/VehicleFilters'
import SortSelector from '@/components/marketplace/SortSelector'
import ActiveFiltersBar from '@/components/marketplace/ActiveFiltersBar'
import SearchAlertCTA from '@/components/marketplace/SearchAlertCTA'
import CreateAlertButton from '@/components/marketplace/CreateAlertButton'
import { getProvinciasByComunidad } from '@/lib/utils'
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

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

async function VehicleList({ params }: { params: Record<string, string> }) {
  const supabase = await createClient()
  let query = supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified, subscription_plan)', { count: 'exact' })
    .eq('status', 'active')
    .eq('vehicle_type', 'car')

  if (params.categoria)          query = query.eq('category', params.categoria)
  if (params.marca)              query = query.ilike('brand_name', `%${params.marca.replace(/-/g, ' ')}%`)
  if (params.modelo)             query = query.ilike('model_name', `%${params.modelo}%`)
  if (params.version)            query = query.ilike('version', `%${params.version}%`)
  if (params.anioMin)            query = query.gte('year', parseInt(params.anioMin))
  if (params.anioMax)            query = query.lte('year', parseInt(params.anioMax))
  if (params.precioMin)          query = query.gte('price', parseInt(params.precioMin))
  if (params.precioMax)          query = query.lte('price', parseInt(params.precioMax))
  if (params.cvMin)              query = query.gte('power_hp', parseInt(params.cvMin))
  if (params.cvMax)              query = query.lte('power_hp', parseInt(params.cvMax))
  if (params.kmMin)              query = query.gte('mileage_km', parseInt(params.kmMin))
  if (params.kmMax)              query = query.lte('mileage_km', parseInt(params.kmMax))
  if (params.tipo)               query = query.eq('body_type', params.tipo)
  if (params.combustible)        query = query.eq('fuel_type', params.combustible)
  if (params.cambio)             query = query.eq('transmission', params.cambio)
  if (params.colorExterior)      query = query.ilike('color_exterior', `%${params.colorExterior}%`)
  if (params.provincia) {
    query = query.eq('location_province', params.provincia)
  } else if (params.comunidad) {
    const ps = getProvinciasByComunidad(params.comunidad)
    if (ps.length) query = query.in('location_province', ps)
  }
  if (params.showroom)           query = query.eq('dealer_id', params.showroom)
  if (params.condicion)          query = query.eq('condition_type', params.condicion)
  if (params.traccion)           query = query.eq('drive_type', params.traccion)
  if (params.etiquetaDgt)        query = query.eq('dgt_label', params.etiquetaDgt)
  if (params.equipamiento)       query = query.contains('equipment', [params.equipamiento])
  if (params.historial === 'si') query = query.eq('has_service_history', true)
  if (params.ivaDeducible === 'si') query = query.eq('iva_deducible', true)
  if (params.destacados === 'true') query = query.eq('is_featured', true)
  if (params.garantia === 'si')     query = query.eq('has_warranty', true)
  if (params.financiacion === 'si') query = query.eq('financing_available', true)
  if (params.search)             query = query.or(
    `brand_name.ilike.%${params.search}%,model_name.ilike.%${params.search}%`
  )

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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
  const supabase = await createClient()
  const { count } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('vehicle_type', 'car')

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-5">
          <h1 className="section-title">Coches premium</h1>
          <Suspense fallback={null}>
            <SortSelector />
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <ActiveFiltersBar />
        </Suspense>
      </div>

      <div className="flex gap-12">
        <Suspense fallback={null}>
          <VehicleFilters vehicleType="car" totalCount={count || 0} />
        </Suspense>
        <Suspense fallback={<GridSkeleton />}>
          <VehicleList params={params} />
        </Suspense>
      </div>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
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
