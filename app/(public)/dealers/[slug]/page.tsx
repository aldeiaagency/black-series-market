import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Globe, Instagram, Car, Bike, CheckCircle, BadgeCheck, ChevronRight, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tipo?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('dealers').select('name, description, location_city').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: `${data.name} — Showroom seleccionado`,
    description: data.description || `Showroom de ${data.name} en Black Label Market. Vehículos premium seleccionados.`,
  }
}

const SPECIALTIES_LABELS: Record<string, string> = {
  sport:       'Deportivos',
  classic:     'Clásicos y youngtimers',
  premium:     'Premium moderno',
  motorcycle:  'Motos premium',
  import:      'Importación',
  suv:         'Luxury SUVs',
  supercar:    'Supercars',
  custom:      'Custom bikes',
}

export default async function DealerPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { tipo } = await searchParams
  const supabase = await createClient()

  const { data: dealer } = await supabase
    .from('dealers')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!dealer) notFound()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified, subscription_plan)')
    .eq('dealer_id', dealer.id)
    .in('status', ['active', 'paused', 'sold'])
    .order('status', { ascending: true })
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })

  const activeVehicles = vehicles?.filter((v: any) => v.status === 'active') || []
  const otherVehicles  = vehicles?.filter((v: any) => v.status !== 'active')  || []
  const cars  = activeVehicles.filter((v: any) => v.vehicle_type === 'car')
  const motos = activeVehicles.filter((v: any) => v.vehicle_type === 'motorcycle')
  const totalActive = activeVehicles.length

  // Filter inventory by tipo param (car / motorcycle / all or undefined)
  const displayVehicles =
    tipo === 'car'        ? cars  :
    tipo === 'motorcycle' ? motos :
    activeVehicles

  // Brands derived from actual inventory (deduplicated)
  const uniqueBrands = Array.from(
    new Set((vehicles || []).map((v: any) => v.brand_name).filter(Boolean))
  ) as string[]

  const specialties = dealer.certifications?.filter((c: string) => c in SPECIALTIES_LABELS) || []

  const FALLBACK_DESCRIPTION =
    'Profesional seleccionado por Black Label por su enfoque en unidades con valor, presentación cuidada y stock de interés para compradores exigentes.'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: dealer.name,
    description: dealer.description || `Showroom seleccionado por Black Label Market en ${dealer.location_city || 'España'}.`,
    image: dealer.logo_url || undefined,
    url: dealer.website || undefined,
    telephone: dealer.phone || undefined,
    address: dealer.address ? {
      '@type': 'PostalAddress',
      streetAddress: dealer.address,
      addressLocality: dealer.location_city || '',
      addressRegion: dealer.location_region || '',
      addressCountry: 'ES',
    } : undefined,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pt-20">

        {/* Cover */}
        <div className="relative h-56 md:h-72 bg-[#0E0E0E] overflow-hidden">
          {dealer.cover_url ? (
            <Image src={dealer.cover_url} alt={dealer.name} fill className="object-cover opacity-60" priority />
          ) : (
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-[#0A0A0A] to-[#080808]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,166,75,0.04)_0%,transparent_70%)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/20 to-transparent" />

          {/* Back link */}
          <div className="absolute top-6 left-6 lg:left-12">
            <Link
              href="/dealers"
              className="flex items-center gap-1.5 text-xs text-[#808080] hover:text-[#C9C9C9] transition-colors"
            >
              ← Concesionarios
            </Link>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">

          {/* Dealer identity */}
          <div className="relative -mt-14 mb-12">
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">

              {/* Logo */}
              <div className="w-24 h-24 bg-[#111111] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                {dealer.logo_url ? (
                  <Image src={dealer.logo_url} alt={dealer.name} width={96} height={96} className="object-contain p-3" />
                ) : (
                  <span className="font-display text-3xl text-gold font-light">{dealer.name[0]}</span>
                )}
              </div>

              <div className="flex-1">
                {/* Label */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px w-5 bg-gold" />
                  <span className="text-[10px] text-gold tracking-[0.2em] uppercase">Profesional seleccionado por Black Label</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl md:text-4xl font-light text-bsm-text-primary">{dealer.name}</h1>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-[10px] tracking-[0.1em] uppercase font-medium">Verificado</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 text-sm text-bsm-text-secondary">
                  {dealer.location_city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#737373]" />
                      {[dealer.location_city, dealer.location_region].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {totalActive > 0 && (
                    <span className="flex items-center gap-1.5">
                      {cars.length > 0 && <Car className="w-4 h-4 text-[#737373]" />}
                      {motos.length > 0 && <Bike className="w-4 h-4 text-[#737373]" />}
                      {totalActive} unidad{totalActive !== 1 ? 'es' : ''} activa{totalActive !== 1 ? 's' : ''}
                    </span>
                  )}
                  {dealer.years_in_business && (
                    <span className="text-[#808080]">{dealer.years_in_business} años en el sector</span>
                  )}
                </div>
              </div>

              {/* Contact CTAs */}
              <div className="flex flex-wrap gap-3">
                {dealer.whatsapp && (
                  <a
                    href={`https://wa.me/${dealer.whatsapp.replace(/\D/g, '')}?text=Hola, me interesa conocer vuestro inventario en Black Label Market`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium tracking-wide text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors duration-200"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
                {dealer.phone && (
                  <a href={`tel:${dealer.phone}`} className="btn-outline px-5 py-2.5 text-sm">
                    <Phone className="w-4 h-4" />
                    Llamar
                  </a>
                )}
                {dealer.website && (
                  <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="btn-ghost px-4 py-2.5">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {dealer.instagram && (
                  <a
                    href={`https://instagram.com/${dealer.instagram.replace('@', '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-ghost px-4 py-2.5"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Description + specialties + brands */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5">
                {/* About */}
                <div>
                  <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-2">Sobre el showroom</p>
                  <p className="text-bsm-text-secondary text-sm leading-relaxed">
                    {dealer.description || FALLBACK_DESCRIPTION}
                  </p>
                </div>

                {/* Brands derived from inventory */}
                {uniqueBrands.length > 0 && (
                  <div>
                    <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-2">Marcas en inventario</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {uniqueBrands.map((brand) => (
                        <span key={brand} className="text-xs text-[#8A8A8A] tracking-wide">
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {specialties.length > 0 && (
                <div>
                  <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-3">Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((s: string) => (
                      <span key={s} className="px-3 py-1 text-xs border border-[#2A2A2A] text-[#9A9A9A]">
                        {SPECIALTIES_LABELS[s] || s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="pb-8">

            {/* Inventory header + tab filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-light mb-1">Inventario actual</h2>
                <p className="text-sm text-bsm-text-muted">
                  {totalActive} unidad{totalActive !== 1 ? 'es' : ''} disponible{totalActive !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Tab filter — only when both types present */}
              {cars.length > 0 && motos.length > 0 && (
                <div className="flex border border-bsm-border">
                  <a
                    href={`/dealers/${slug}`}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors
                      ${!tipo || tipo === 'all'
                        ? 'bg-gold/10 text-gold border-r border-bsm-border'
                        : 'text-bsm-text-muted hover:text-bsm-text-primary border-r border-bsm-border'}`}
                  >
                    Todos
                    <span className="text-xs opacity-60">({totalActive})</span>
                  </a>
                  <a
                    href={`/dealers/${slug}?tipo=car`}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors
                      ${tipo === 'car'
                        ? 'bg-gold/10 text-gold border-r border-bsm-border'
                        : 'text-bsm-text-muted hover:text-bsm-text-primary border-r border-bsm-border'}`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    Coches
                    <span className="text-xs opacity-60">({cars.length})</span>
                  </a>
                  <a
                    href={`/dealers/${slug}?tipo=motorcycle`}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors
                      ${tipo === 'motorcycle'
                        ? 'bg-gold/10 text-gold'
                        : 'text-bsm-text-muted hover:text-bsm-text-primary'}`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    Motos
                    <span className="text-xs opacity-60">({motos.length})</span>
                  </a>
                </div>
              )}
            </div>

            {displayVehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {displayVehicles.map((v: any) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            ) : (
              <p className="text-bsm-text-muted text-center py-16 border border-bsm-border bg-surface">
                Este showroom no tiene vehículos activos en este momento.
              </p>
            )}

            {/* Sold / reserved section */}
            {otherVehicles.length > 0 && (
              <div className="mb-12">
                <h3 className="font-display text-lg font-light text-bsm-text-muted mb-6 pb-3 border-b border-[#1A1A1A]">
                  Vendidos / Reservados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {otherVehicles.map((v: any) => (
                    <VehicleCard key={v.id} vehicle={v} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* "Qué significa dealer seleccionado" */}
          <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-8 mb-20">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <BadgeCheck className="w-5 h-5 text-gold" />
                <h3 className="font-display text-xl font-light text-bsm-text-primary">
                  Qué significa estar seleccionado
                </h3>
              </div>
              <p className="text-sm text-bsm-text-secondary leading-relaxed mb-4">
                Black Label prioriza concesionarios, especialistas y operadores que trabajan unidades con criterio,
                presentación cuidada y disponibilidad real. La selección no sustituye la revisión independiente
                del vehículo, pero ayuda a reducir ruido y mejorar la calidad del contacto.
              </p>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#8A8A8A] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#737373] leading-relaxed">
                  La presencia en Black Label Market no implica garantía legal total, verificación documental
                  completa ni ausencia de fraude. Recomendamos siempre realizar una inspección independiente
                  antes de formalizar cualquier operación.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#141414]">
              <Link
                href="/como-funciona"
                className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors"
              >
                Cómo funciona Black Label Market
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
