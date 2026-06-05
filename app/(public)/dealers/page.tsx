import { createClient } from '@/lib/supabase/server'
import DealerCard from '@/components/marketplace/DealerCard'
import { MapPin, Car, Bike, CheckCircle } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ tipo?: string; zona?: string }>
}

function buildUrl(current: { tipo?: string; zona?: string }, override: { tipo?: string; zona?: string }) {
  const merged = { ...current, ...override }
  const params = new URLSearchParams()
  if (merged.tipo) params.set('tipo', merged.tipo)
  if (merged.zona) params.set('zona', merged.zona)
  const qs = params.toString()
  return `/dealers${qs ? '?' + qs : ''}`
}

export default async function DealersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // 1. Comunidades únicas de dealers activos (dinámico, no hardcoded)
  const { data: zoneData } = await supabase
    .from('dealers')
    .select('location_region')
    .eq('status', 'active')
    .not('location_region', 'is', null)

  const zonesSet = new Set<string>()
  for (const d of zoneData ?? []) if (d.location_region) zonesSet.add(d.location_region)
  const zones: string[] = Array.from(zonesSet).sort()

  // 2. Filtro por tipo de vehículo — obtener dealer IDs válidos
  let dealerIdFilter: string[] | null = null
  if (params.tipo === 'coches' || params.tipo === 'motos') {
    const vehicleType = params.tipo === 'coches' ? 'car' : 'motorcycle'
    const { data: typedVehicles } = await supabase
      .from('vehicles')
      .select('dealer_id')
      .eq('status', 'active')
      .eq('vehicle_type', vehicleType)

    const idSet = new Set<string>()
    for (const v of typedVehicles ?? []) if (v.dealer_id) idSet.add(v.dealer_id)
    dealerIdFilter = Array.from(idSet)
  }

  // 3. Query principal — featured siempre primero por ORDER BY
  let query = supabase
    .from('dealers')
    .select('*, vehicles(status, vehicle_type)')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('subscription_plan', { ascending: false })
    .order('name', { ascending: true })

  if (params.zona) query = query.ilike('location_region', `%${params.zona}%`)

  if (dealerIdFilter !== null) {
    if (dealerIdFilter.length === 0) {
      // Ningún dealer tiene vehículos de ese tipo — resultado vacío garantizado
      const { data: rawDealers } = await query
      const dealers = (rawDealers ?? []).map((d: any) => ({ ...d, vehicle_count: 0 })).filter(() => false)
      return renderPage(dealers, [], params, zones)
    }
    query = query.in('id', dealerIdFilter)
  }

  const { data: rawDealers } = await query

  const dealers = (rawDealers ?? []).map((d: any) => ({
    ...d,
    vehicle_count: d.vehicles?.filter((v: any) => v.status === 'active').length ?? 0,
  }))

  return renderPage(dealers, dealerIdFilter, params, zones)
}

function renderPage(
  dealers: any[],
  _dealerIdFilter: string[] | null,
  params: { tipo?: string; zona?: string },
  zones: string[],
) {
  const featured    = dealers.filter((d) => d.is_featured)
  const nonFeatured = dealers.filter((d) => !d.is_featured)

  const tipoLabel = params.tipo === 'coches' ? 'coches' : params.tipo === 'motos' ? 'motos' : null
  const zonaLabel = params.zona ?? null

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Red de profesionales</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="section-title mb-0">Showrooms verificados</h1>
          <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
        </div>
        <p className="text-bsm-text-muted text-sm">
          {dealers.length} {dealers.length === 1 ? 'profesional' : 'profesionales'}
          {tipoLabel ? ` de ${tipoLabel}` : ''}
          {zonaLabel ? ` en ${zonaLabel}` : ''} en el marketplace
        </p>
      </div>

      {/* Filtros */}
      <div className="space-y-3 mb-10">

        {/* Tipo de vehículo */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: undefined, label: 'Todos', icon: null },
            { value: 'coches',  label: 'Coches', icon: Car },
            { value: 'motos',   label: 'Motos',  icon: Bike },
          ].map(({ value, label, icon: Icon }) => {
            const active = params.tipo === value || (!params.tipo && !value)
            return (
              <a
                key={label}
                href={buildUrl(params, { tipo: value, zona: params.zona })}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border transition-colors
                  ${active
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {label}
              </a>
            )
          })}
        </div>

        {/* Zona (comunidades dinámicas) */}
        {zones.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <a
              href={buildUrl(params, { zona: undefined })}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border transition-colors
                ${!params.zona
                  ? 'border-gold text-gold bg-gold/5'
                  : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
            >
              <MapPin className="w-3 h-3" />
              Toda España
            </a>
            {zones.map((zone) => (
              <a
                key={zone}
                href={buildUrl(params, { zona: zone })}
                className={`text-xs px-3 py-1.5 border transition-colors
                  ${params.zona === zone
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
              >
                {zone}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Destacados — siempre primero */}
      {featured.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-xl font-light mb-6 pb-3 border-b border-bsm-border">
            Showrooms destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((d: any) => (
              <DealerCard key={d.id} dealer={d} variant="featured" />
            ))}
          </div>
        </div>
      )}

      {/* Resto de profesionales */}
      {nonFeatured.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-light mb-6 pb-3 border-b border-bsm-border">
            {featured.length > 0 ? 'Más profesionales' : 'Profesionales seleccionados'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nonFeatured.map((d: any) => (
              <DealerCard key={d.id} dealer={d} />
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {dealers.length === 0 && (
        <div className="text-center py-16 text-bsm-text-muted border border-bsm-border bg-surface">
          No hay profesionales{tipoLabel ? ` de ${tipoLabel}` : ''}
          {zonaLabel ? ` en ${zonaLabel}` : ''} disponibles en este momento.
        </div>
      )}

      {/* CTA profesionales */}
      <div className="mt-16 bg-surface border border-bsm-border p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <h3 className="font-display text-2xl font-light mb-2">¿Eres profesional?</h3>
          <p className="text-sm text-bsm-text-muted max-w-md">
            Solicita acceso a Black Label y publica tu inventario a compradores
            cualificados y seleccionados especialmente para ti.
          </p>
        </div>
        <a href="/registro" className="btn-gold flex-shrink-0 px-10 py-4">
          Quiero publicar en Black Label
        </a>
      </div>
    </div>
  )
}
