import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/server'

// ISR: catálogo público → cache CDN, revalida cada 5 min.
export const revalidate = 300
import DealerCard from '@/components/marketplace/DealerCard'
import { MapPin, Car, Bike, CheckCircle } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { DEALER_PUBLIC_COLUMNS } from '@/lib/public-columns'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Concesionarios y especialistas premium verificados | Black Label Market',
  description: 'Concesionarios, compraventas y especialistas premium verificados en España. Coches deportivos, supercars, clásicos y motos premium de profesionales seleccionados por Black Label Market.',
  alternates: { canonical: '/dealers' },
  openGraph: {
    title: 'Concesionarios y especialistas verificados | Black Label Market',
    description: 'Concesionarios, compraventas y especialistas premium verificados en España. Profesionales seleccionados por Black Label Market.',
    url: 'https://blacklabelmarket.es/dealers',
    siteName: 'Black Label Market',
    type: 'website',
  },
}

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
  const supabase = createPublicClient()

  // 1. Comunidades únicas de dealers activos/trial (dinámico, no hardcoded)
  const { data: zoneData } = await supabase
    .from('dealers')
    .select('location_region')
    .in('status', ['trial', 'active'])
    .eq('profile_status', 'published')
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
    .select((`${DEALER_PUBLIC_COLUMNS}, vehicles(status, vehicle_type)`) as string)
    .in('status', ['trial', 'active'])
    .eq('profile_status', 'published')
    // Auditoría de seguridad 2026-09-02 (P0.2): quitado el desempate por subscription_plan —
    // esa columna deja de ser pública. is_featured ya cubre la prioridad de Elite.
    .order('is_featured', { ascending: false })
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
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    '@id': `${SITE_URL}/dealers`,
    name: 'Concesionarios y especialistas premium verificados en España',
    description: 'Red de profesionales verificados por Black Label Market: concesionarios, compraventas y especialistas en coches y motos premium.',
    url: `${SITE_URL}/dealers`,
    inLanguage: 'es-ES',
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Showrooms verificados' },
    ],
  }

  const featured    = dealers.filter((d) => d.is_featured)
  const nonFeatured = dealers.filter((d) => !d.is_featured)

  const tipoLabel = params.tipo === 'coches' ? 'coches' : params.tipo === 'motos' ? 'motos' : null
  const zonaLabel = params.zona ?? null

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

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

      {/* Editorial — confianza / qué showrooms publican */}
      <div className="mb-8 max-w-2xl">
        <p className="text-sm text-bsm-text-secondary leading-relaxed">
          En Black Label Market no publica cualquiera. Cada showroom —concesionario, compraventa o especialista— pasa por un proceso de verificación antes de poder publicar: revisamos su reputación, su trayectoria y su presencia online para asegurarnos de que está a la altura de los vehículos que ofrece. El resultado es una red de profesionales seleccionados en la que el comprador puede confiar desde el primer contacto, y un entorno donde un deportivo, un clásico o una moto premium se presentan junto a vendedores de su mismo nivel.
        </p>
      </div>

      {/* Proceso de verificación — 3 pasos */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-bsm-border mb-12">
        {[
          { n: '01', title: 'Solicitud de acceso',     desc: 'Reservado a profesionales del sector: concesionarios, compraventas y especialistas.' },
          { n: '02', title: 'Revisión de reputación',  desc: 'Analizamos su trayectoria, presencia online y nivel de servicio antes de aceptarlo.' },
          { n: '03', title: 'Aceptación y estándar',   desc: 'Solo se publica cumpliendo un estándar de presentación a la altura del vehículo.' },
        ].map((s, i) => (
          <div key={s.n} className={`p-6 ${i > 0 ? 'border-t md:border-t-0 md:border-l border-bsm-border' : ''}`}>
            <div className="font-display text-xs text-gold/50 mb-3 tracking-[0.2em]">{s.n}</div>
            <h3 className="text-[13px] font-medium text-bsm-text-primary mb-2 tracking-wide">{s.title}</h3>
            <p className="text-[12px] text-bsm-text-muted leading-relaxed">{s.desc}</p>
          </div>
        ))}
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
            Black Label Market trabaja con showrooms seleccionados. Conoce cómo funciona el
            acceso y, si encajas, publica tu inventario para compradores cualificados.
          </p>
        </div>
        <a href="/para-profesionales" className="btn-gold flex-shrink-0 px-10 py-4">
          Cómo funciona el acceso
        </a>
      </div>
    </div>
  )
}
