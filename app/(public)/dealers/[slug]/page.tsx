import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Globe, Instagram, Star, Car, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('dealers').select('name').eq('slug', slug).single()
  return { title: data?.name || 'Concesionario' }
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
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })

  const vehicleCount = vehicles?.length || 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: dealer.name,
    description: dealer.description || `Concesionario de vehículos premium en ${dealer.location_city || 'España'}.`,
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
      <div className="relative h-64 md:h-80 bg-surface-elevated overflow-hidden">
        {dealer.cover_url ? (
          <Image src={dealer.cover_url} alt={dealer.name} fill className="object-cover opacity-70" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-obsidian-50 to-obsidian" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Dealer info */}
        <div className="relative -mt-16 mb-12">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Logo */}
            <div className="w-24 h-24 bg-surface border border-bsm-border flex items-center justify-center flex-shrink-0">
              {dealer.logo_url ? (
                <Image src={dealer.logo_url} alt={dealer.name} width={96} height={96} className="object-contain p-2" />
              ) : (
                <span className="font-display text-3xl text-gold">{dealer.name[0]}</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-light text-bsm-text-primary">{dealer.name}</h1>
                {dealer.is_verified && <span className="badge-gold text-[10px]">Verificado</span>}
                {dealer.subscription_plan === 'elite' && (
                  <span className="badge text-[10px] text-gold border border-gold/30">Elite</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-bsm-text-secondary">
                {dealer.location_city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {[dealer.location_city, dealer.location_region].filter(Boolean).join(', ')}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Car className="w-4 h-4" />
                  {vehicleCount} vehículos
                </span>
                {dealer.years_in_business && (
                  <span>{dealer.years_in_business} años en el sector</span>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-wrap gap-3">
              {dealer.phone && (
                <a href={`tel:${dealer.phone}`} className="btn-outline px-5 py-2.5 text-sm">
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
              )}
              {dealer.website && (
                <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <Globe className="w-4 h-4" />
                  Web
                </a>
              )}
              {dealer.instagram && (
                <a href={`https://instagram.com/${dealer.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {dealer.description && (
            <p className="mt-6 text-bsm-text-secondary text-sm leading-relaxed max-w-2xl">
              {dealer.description}
            </p>
          )}
        </div>

        {/* Vehicles */}
        <div className="pb-20">
          <h2 className="font-display text-2xl font-light mb-8 pb-4 border-b border-bsm-border">
            Inventario actual
            <span className="font-sans text-sm font-normal text-bsm-text-muted ml-3">
              ({vehicleCount} vehículos)
            </span>
          </h2>

          {vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((v: any) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          ) : (
            <p className="text-bsm-text-muted text-center py-16">
              Este concesionario no tiene vehículos activos en este momento.
            </p>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
