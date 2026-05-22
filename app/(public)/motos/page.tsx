import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import VehicleFilters from '@/components/marketplace/VehicleFilters'
import SortSelector from '@/components/marketplace/SortSelector'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

async function MotoList({ params }: { params: Record<string, string> }) {
  const supabase = await createClient()
  let query = supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url)', { count: 'exact' })
    .eq('status', 'active')
    .eq('vehicle_type', 'motorcycle')

  if (params.categoria) query = query.eq('category', params.categoria)
  if (params.marca)     query = query.ilike('brand_name', `%${params.marca.replace(/-/g, ' ')}%`)
  if (params.modelo)    query = query.ilike('model_name', `%${params.modelo}%`)
  if (params.version)   query = query.ilike('version', `%${params.version}%`)
  if (params.anioMin)   query = query.gte('year', parseInt(params.anioMin))
  if (params.anioMax)   query = query.lte('year', parseInt(params.anioMax))
  if (params.precioMin) query = query.gte('price', parseInt(params.precioMin))
  if (params.precioMax) query = query.lte('price', parseInt(params.precioMax))
  if (params.cvMin)     query = query.gte('power_hp', parseInt(params.cvMin))
  if (params.cvMax)     query = query.lte('power_hp', parseInt(params.cvMax))
  if (params.kmMax)     query = query.lte('mileage_km', parseInt(params.kmMax))
  if (params.estilo)    query = query.eq('body_type', params.estilo)
  if (params.cc) {
    const [ccMin, ccMax] = params.cc.split('-').map(Number)
    query = query.gte('displacement_cc', ccMin).lte('displacement_cc', ccMax)
  }
  if (params.search)    query = query.or(`brand_name.ilike.%${params.search}%,model_name.ilike.%${params.search}%`)

  const sort = params.sort || 'featured'
  if (sort === 'price_asc')   query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (sort === 'mileage_asc') query = query.order('mileage_km', { ascending: true })
  else if (sort === 'newest') query = query.order('published_at', { ascending: false })
  else query = query.order('is_featured', { ascending: false }).order('published_at', { ascending: false })

  const { data: vehicles, count } = await query.limit(24)

  if (!vehicles?.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
        <h3 className="font-display text-xl mb-2">Sin resultados</h3>
        <p className="text-sm text-bsm-text-muted">Prueba a ampliar los criterios de búsqueda.</p>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
      </div>
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
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h1 className="section-title">Motos</h1>
          <Suspense fallback={null}><SortSelector /></Suspense>
        </div>
      </div>

      <div className="flex gap-12">
        <Suspense fallback={null}>
          <VehicleFilters vehicleType="motorcycle" totalCount={count || 0} />
        </Suspense>
        <Suspense fallback={<div className="flex-1" />}>
          <MotoList params={params} />
        </Suspense>
      </div>
    </div>
  )
}
