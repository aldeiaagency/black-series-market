import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Globe, Instagram, Car, Bike, MessageCircle, BadgeCheck, ChevronRight, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('dealers').select('name, description, location_city').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: `${data.name} — Dealer seleccionado`,
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

export default async function DealerPage({ params }: PageProps) {
  const { slug } = await params
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
    .select('*, dealer:dealers(name, slug, location_city, logo_url)')
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

  const specialties = dealer.certifications?.filter((c: string) => c in SPECIALTIES_LABELS) || []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: dealer.name,
    description: dealer.description || `Dealer seleccionado por Black Label Market en ${dealer.location_city || 'España'}.`,
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
              className="flex items-center gap-1.5 text-xs text-[#575757] hover:text-[#C9C9C9] transition-colors"
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
                  <span className="text-[10px] text-gold tracking-[0.2em] uppercase">Dealer seleccionado por Black Label</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl md:text-4xl font-light text-bsm-text-primary">{dealer.name}</h1>
                  {dealer.is_verified && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase
                      text-[#C9C9C9] bg-[#0D0D0D] border border-[#2A2A2A]">
                      <BadgeCheck className="w-3 h-3 text-gold" />
                      Dealer revisado
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-5 text-sm text-bsm-text-secondary">
                  {dealer.location_city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#474747]" />
                      {[dealer.location_city, dealer.location_region].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {totalActive > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-[#474747]" />
                      {totalActive} vehículo{totalActive !== 1 ? 's' : ''} activos
                    </span>
                  )}
                  {dealer.years_in_business && (
                    <span className="text-[#575757]">{dealer.years_in_business} años en el sector</span>
                  )}
                </div>
              </div>

              {/* Contact CTAs */}
              <div className="flex flex-wrap gap-3">
                {dealer.whatsapp && (
                  <a
                    href={`https://wa.me/${dealer.whatsapp.replace(/\D/g, '')}?text=Hola, me interesa conocer vuestro inventario en Black Label Market`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-gold px-5 py-2.5 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
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

            {/* Description + specialties */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dealer.description && (
                <div className="md:col-span-2">
                  <p className="text-bsm-text-secondary text-sm leading-relaxed">{dealer.description}</p>
                </div>
              )}
              {specialties.length > 0 && (
                <div className={dealer.description ? '' : 'md:col-span-3'}>
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

            {/* Tab bar when both types */}
            {cars.length > 0 && motos.length > 0 && (
              <div className="flex gap-0 mb-8 border-b border-bsm-border">
                <div className="flex items-center gap-2 px-5 py-3 border-b-2 border-gold text-sm text-gold">
                  <Car className="w-4 h-4" />
                  Coches
                  <span className="text-xs text-bsm-text-muted ml-1">({cars.length})</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 text-sm text-bsm-text-muted">
                  <Bike className="w-4 h-4" />
                  Motos
                  <span className="text-xs ml-1">({motos.length})</span>
                </div>
              </div>
            )}

            <h2 className="font-display text-2xl font-light mb-2">
              Inventario activo
            </h2>
            <p className="text-sm text-bsm-text-muted mb-8">
              {totalActive} vehículo{totalActive !== 1 ? 's' : ''} publicado{totalActive !== 1 ? 's' : ''} en este momento
            </p>

            {activeVehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {activeVehicles.map((v: any) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            ) : (
              <p className="text-bsm-text-muted text-center py-16 border border-bsm-border bg-surface">
                Este dealer no tiene vehículos activos en este momento.
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
                  Qué significa dealer seleccionado
                </h3>
              </div>
              <p className="text-sm text-bsm-text-secondary leading-relaxed mb-4">
                Black Label prioriza concesionarios, especialistas y operadores que trabajan unidades con criterio,
                presentación cuidada y disponibilidad real. La selección no sustituye la revisión independiente
                del vehículo, pero ayuda a reducir ruido y mejorar la calidad del contacto.
              </p>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#3A3A3A] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#474747] leading-relaxed">
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
