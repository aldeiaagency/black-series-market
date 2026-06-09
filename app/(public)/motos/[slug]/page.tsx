import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VehicleDetailContent from '@/components/marketplace/VehicleDetailContent'
import { FUEL_LABELS, TRANSMISSION_LABELS } from '@/lib/utils'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('vehicles')
    .select('brand_name, model_name, year, version, images, mileage_km, fuel_type, power_hp, displacement_cc, location_province, price, price_on_request')
    .eq('slug', slug)
    .single()
  if (!data) return {}
  const title = `${data.brand_name} ${data.model_name} ${data.year}${data.version ? ' ' + data.version : ''}`
  const parts = [
    title,
    data.mileage_km != null ? `${data.mileage_km.toLocaleString('es-ES')} km` : null,
    data.displacement_cc ? `${data.displacement_cc} cc` : null,
    data.power_hp ? `${data.power_hp} CV` : null,
    data.location_province || null,
    data.price && !data.price_on_request ? `${data.price.toLocaleString('es-ES')} €` : null,
  ].filter(Boolean)
  const description = `${parts.join(' · ')} — Vendedor profesional verificado en Black Label Market.`
  const image = data.images?.[0]?.url
  return {
    title,
    description,
    alternates: { canonical: `/motos/${slug}` },
    openGraph: { title, description, type: 'website', images: image ? [image] : [] },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : [] },
  }
}

export default async function MotoDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(*)')
    .eq('slug', slug)
    .eq('vehicle_type', 'motorcycle')
    .single()

  // draft/pending_review/expired → 404; sold/paused → visible with adapted CTAs
  if (!vehicle || ['draft', 'pending_review', 'expired'].includes(vehicle.status)) notFound()

  // Track view (non-blocking)
  supabase.from('analytics_events').insert({
    vehicle_id: vehicle.id,
    dealer_id: vehicle.dealer_id,
    event_type: 'vehicle_view',
  }).then(() => {})

  supabase.from('vehicles').update({ views: vehicle.views + 1 }).eq('id', vehicle.id).then(() => {})

  let simQuery = supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified)')
    .eq('status', 'active')
    .eq('vehicle_type', 'motorcycle')
    .eq('brand_name', vehicle.brand_name)
    .neq('id', vehicle.id)
  if (vehicle.price) {
    simQuery = simQuery
      .gte('price', Math.round(vehicle.price * 0.6))
      .lte('price', Math.round(vehicle.price * 1.4))
  }
  const { data: similarVehicles } = await simQuery.limit(3)

  const { data: dealerVehicles } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified)')
    .eq('status', 'active')
    .eq('dealer_id', vehicle.dealer_id)
    .eq('vehicle_type', 'motorcycle')
    .neq('id', vehicle.id)
    .limit(3)

  const fullName = `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year}${vehicle.version ? ' ' + vehicle.version : ''}`
  const canonicalUrl = `${SITE_URL}/motos/${vehicle.slug}`
  const dealerUrl = vehicle.dealer?.slug ? `${SITE_URL}/dealers/${vehicle.dealer.slug}` : undefined
  const itemCondition = vehicle.condition_type === 'new'
    ? 'https://schema.org/NewCondition'
    : 'https://schema.org/UsedCondition'
  const descParts = [
    fullName,
    vehicle.mileage_km != null ? `${vehicle.mileage_km.toLocaleString('es-ES')} km` : null,
    vehicle.displacement_cc ? `${vehicle.displacement_cc} cc` : null,
    vehicle.power_hp ? `${vehicle.power_hp} CV` : null,
    vehicle.location_province || vehicle.dealer?.location_city || null,
  ].filter(Boolean)
  const schemaDescription = vehicle.description || `${descParts.join(' · ')} — Vendedor profesional verificado en Black Label Market.`

  const engine = (vehicle.power_hp || vehicle.displacement_cc)
    ? {
        vehicleEngine: {
          '@type': 'EngineSpecification',
          ...(vehicle.power_hp && { enginePower: { '@type': 'QuantitativeValue', value: vehicle.power_hp, unitCode: 'BHP' } }),
          ...(vehicle.displacement_cc && { engineDisplacement: { '@type': 'QuantitativeValue', value: vehicle.displacement_cc, unitCode: 'CMQ' } }),
        },
      }
    : {}

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Motos', item: `${SITE_URL}/motos` },
      { '@type': 'ListItem', position: 3, name: vehicle.brand_name, item: `${SITE_URL}/motos?marca=${vehicle.brand_name?.toLowerCase().replace(/\s+/g, '-') ?? ''}` },
      { '@type': 'ListItem', position: 4, name: fullName },
    ],
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Motorcycle',
    name: fullName,
    description: schemaDescription,
    url: canonicalUrl,
    image: vehicle.images?.map((i: any) => i.url) || [],
    brand: { '@type': 'Brand', name: vehicle.brand_name },
    model: vehicle.model_name,
    vehicleModelDate: String(vehicle.year),
    itemCondition,
    ...(vehicle.vin && { vehicleIdentificationNumber: vehicle.vin }),
    ...(vehicle.color_exterior && { color: vehicle.color_exterior }),
    ...(vehicle.fuel_type && { fuelType: FUEL_LABELS[vehicle.fuel_type as keyof typeof FUEL_LABELS] ?? vehicle.fuel_type }),
    ...(vehicle.transmission && { vehicleTransmission: TRANSMISSION_LABELS[vehicle.transmission as keyof typeof TRANSMISSION_LABELS] ?? vehicle.transmission }),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage_km, unitCode: 'KMT' },
    ...engine,
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: vehicle.currency || 'EUR',
      ...(!vehicle.price_on_request && vehicle.price
        ? { price: vehicle.price, priceValidUntil: new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10) }
        : {}),
      itemCondition,
      availability: vehicle.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      seller: { '@type': 'AutoDealer', name: vehicle.dealer?.name, ...(dealerUrl && { url: dealerUrl }) },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <VehicleDetailContent
        vehicle={vehicle}
        similarVehicles={similarVehicles || []}
        dealerVehicles={dealerVehicles || []}
        backHref="/motos"
        backLabel="Motos"
      />
    </>
  )
}
