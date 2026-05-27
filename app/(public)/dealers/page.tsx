import { createClient } from '@/lib/supabase/server'
import DealerCard from '@/components/marketplace/DealerCard'
import { MapPin } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ ciudad?: string }>
}

const CITIES = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga',
  'Zaragoza', 'Marbella', 'San Sebastián', 'Palma', 'Alicante',
  'Valladolid', 'Girona', 'Murcia', 'Vigo', 'Ibiza',
]

export default async function DealersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('dealers')
    .select(`
      *,
      vehicles(status)
    `)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('subscription_plan', { ascending: false })

  if (params.ciudad) query = query.ilike('location_city', `%${params.ciudad}%`)

  const { data: rawDealers } = await query

  // Count only active vehicles per dealer
  const dealers = rawDealers?.map((d: any) => ({
    ...d,
    vehicle_count: d.vehicles?.filter((v: any) => v.status === 'active').length ?? 0,
  }))

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Red de concesionarios</span>
        </div>
        <h1 className="section-title mb-2">Showrooms seleccionados</h1>
        <p className="text-bsm-text-muted text-sm">
          {dealers?.length || 0} concesionarios y especialistas en el marketplace
        </p>
      </div>

      {/* City filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/dealers"
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border transition-colors
            ${!params.ciudad ? 'border-gold text-gold bg-gold/5' : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
        >
          <MapPin className="w-3 h-3" />
          Todos
        </a>
        {CITIES.map((city) => (
          <a
            key={city}
            href={`/dealers?ciudad=${city}`}
            className={`text-xs px-3 py-1.5 border transition-colors
              ${params.ciudad === city ? 'border-gold text-gold bg-gold/5' : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
          >
            {city}
          </a>
        ))}
      </div>

      {/* Featured dealers */}
      {dealers?.some((d: any) => d.is_featured) && (
        <div className="mb-12">
          <h2 className="font-display text-xl font-light mb-6 pb-3 border-b border-bsm-border">
            Showrooms destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dealers
              .filter((d: any) => d.is_featured)
              .map((d: any) => <DealerCard key={d.id} dealer={d} variant="featured" />)}
          </div>
        </div>
      )}

      {/* All non-featured dealers */}
      {dealers?.some((d: any) => !d.is_featured) && (
        <div>
          <h2 className="font-display text-xl font-light mb-6 pb-3 border-b border-bsm-border">
            Todos los concesionarios
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dealers
              .filter((d: any) => !d.is_featured)
              .map((d: any) => <DealerCard key={d.id} dealer={d} />)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!dealers || dealers.length === 0) && (
        <div className="text-center py-16 text-bsm-text-muted border border-bsm-border bg-surface">
          No hay concesionarios{params.ciudad ? ` en ${params.ciudad}` : ''} disponibles.
        </div>
      )}

      {/* CTA join */}
      <div className="mt-16 bg-surface border border-bsm-border p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <h3 className="font-display text-2xl font-light mb-2">¿Eres concesionario?</h3>
          <p className="text-sm text-bsm-text-muted max-w-md">
            Publica tu inventario en Black Label Market y da visibilidad a tus unidades
            ante compradores con criterio e intención real.
          </p>
        </div>
        <a href="/registro" className="btn-gold flex-shrink-0 px-10 py-4">
          Solicitar acceso
        </a>
      </div>
    </div>
  )
}
