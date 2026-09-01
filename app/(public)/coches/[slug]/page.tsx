import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/server'
import VehicleDetailContent from '@/components/marketplace/VehicleDetailContent'
import ViewTracker from '@/components/marketplace/ViewTracker'
import { resolveContactMode } from '@/lib/contact-mode'
import { FUEL_LABELS, TRANSMISSION_LABELS, DRIVE_LABELS, esGroupThousands } from '@/lib/utils'
import { findCarCategorySlug, findCarCategoryLabel } from '@/lib/vehicle-categories'
import type { Metadata } from 'next'

// ISR: la ficha ya no escribe en el render (el tracking va por beacon) → cacheable en CDN.
export const revalidate = 300

// Prerenderiza los coches activos (ISR). Los nuevos se generan on-demand y se cachean.
export async function generateStaticParams() {
  const { data } = await createPublicClient()
    .from('vehicles').select('slug, dealer:dealers!inner(profile_status)').eq('status', 'active').eq('vehicle_type', 'car').eq('dealer.profile_status', 'published').limit(1000)
  return (data ?? []).map((v: { slug: string }) => ({ slug: v.slug }))
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('vehicles')
    .select('brand_name, model_name, year, version, images, mileage_km, fuel_type, power_hp, location_province, price, price_on_request, dealer:dealers!inner(profile_status)')
    .eq('slug', slug)
    .in('status', ['active', 'paused', 'sold'])
    .eq('dealer.profile_status', 'published')
    .single()
  if (!data) return {}
  const title = `${data.brand_name} ${data.model_name} ${data.year}${data.version ? ' ' + data.version : ''}`
  const parts = [
    title,
    data.mileage_km != null ? `${esGroupThousands(data.mileage_km)} km` : null,
    data.fuel_type ? (FUEL_LABELS[data.fuel_type as keyof typeof FUEL_LABELS] ?? data.fuel_type) : null,
    data.power_hp ? `${data.power_hp} CV` : null,
    data.location_province || null,
    data.price && !data.price_on_request ? `${esGroupThousands(data.price)} €` : null,
  ].filter(Boolean)
  const description = `${parts.join(' · ')} — Vendedor profesional verificado en Black Label Market.`
  const firstImage = data.images?.[0]
  const canonicalUrl = `${SITE_URL}/coches/${slug}`
  // Sin width/height: VehicleImage (lib/types.ts) no captura dimensiones al subir la
  // foto (son variables, las decide cada concesionario) — declarar unas inventadas
  // violaría la regla del proyecto de no fabricar datos. og:url y alt sí son reales.
  const ogImages = firstImage ? [{ url: firstImage.url, alt: firstImage.alt || title }] : []
  return {
    title,
    description,
    alternates: { canonical: `/coches/${slug}` },
    openGraph: { title, description, type: 'website', url: canonicalUrl, images: ogImages },
    twitter: { card: 'summary_large_image', title, description, images: ogImages.map((i) => i.url) },
  }
}

export default async function CocheDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createPublicClient()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers!inner(*), brand:brands(slug)')
    .eq('slug', slug)
    .eq('vehicle_type', 'car')
    .in('status', ['active', 'paused', 'sold'])
    .eq('dealer.profile_status', 'published')
    .single()

  // draft/pending_review/expired → 404; sold/paused → visible with adapted CTAs
  if (!vehicle || ['draft', 'pending_review', 'expired'].includes(vehicle.status)) notFound()
  // Dealer suspendido o pendiente de aprobación: sus vehículos no deben quedar visibles.
  if (!vehicle.dealer || !['trial', 'active'].includes(vehicle.dealer.status)) notFound()

  // La vista se registra desde el cliente (ViewTracker → /api/track) para no escribir en el render.
  const contactMode = vehicle.dealer?.profile_id
    ? await resolveContactMode(vehicle.dealer.profile_id)
    : 'classic'

  let simQuery = supabase
    .from('vehicles')
    .select('*, dealer:dealers!inner(name, slug, location_city, logo_url, is_verified)')
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('vehicle_type', 'car')
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
    .select('*, dealer:dealers!inner(name, slug, location_city, logo_url, is_verified)')
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('dealer_id', vehicle.dealer_id)
    .eq('vehicle_type', 'car')
    .neq('id', vehicle.id)
    .limit(3)

  const fullName = `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year}${vehicle.version ? ' ' + vehicle.version : ''}`
  const canonicalUrl = `${SITE_URL}/coches/${vehicle.slug}`
  const dealerUrl = vehicle.dealer?.slug ? `${SITE_URL}/dealers/${vehicle.dealer.slug}` : undefined
  const itemCondition = vehicle.condition_type === 'new'
    ? 'https://schema.org/NewCondition'
    : 'https://schema.org/UsedCondition'
  const descParts = [
    fullName,
    vehicle.mileage_km != null ? `${esGroupThousands(vehicle.mileage_km)} km` : null,
    vehicle.fuel_type ? (FUEL_LABELS[vehicle.fuel_type as keyof typeof FUEL_LABELS] ?? vehicle.fuel_type) : null,
    vehicle.power_hp ? `${vehicle.power_hp} CV` : null,
    vehicle.location_province || vehicle.dealer?.location_city || null,
  ].filter(Boolean)
  const schemaDescription = vehicle.description || `${descParts.join(' · ')} — Vendedor profesional verificado en Black Label Market.`

  // Nivel de categoría + enlace de marca reales — antes: sin categoría, y la marca
  // enlazaba a un filtro por query (/coches?marca=...) en vez de a /marcas/[slug].
  // vehicle.brand viene de un join real contra `brands` (por brand_id) — si el dealer
  // introdujo un brand_name libre que no coincide con ninguna marca curada, brand.slug
  // es null y se omite ese nivel en vez de enlazar a una ruta inventada.
  const categorySlug = findCarCategorySlug(vehicle.category)
  const categoryLabel = findCarCategoryLabel(vehicle.category)
  const brandSlug = (vehicle as any).brand?.slug as string | undefined
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Coches', item: `${SITE_URL}/coches` },
    ...(categorySlug ? [{ '@type': 'ListItem', position: 3, name: categoryLabel, item: `${SITE_URL}/coches/${categorySlug}` }] : []),
    {
      '@type': 'ListItem',
      position: categorySlug ? 4 : 3,
      name: vehicle.brand_name,
      item: brandSlug ? `${SITE_URL}/marcas/${brandSlug}` : `${SITE_URL}/coches?marca=${vehicle.brand_name?.toLowerCase().replace(/\s+/g, '-') ?? ''}`,
    },
    { '@type': 'ListItem', position: categorySlug ? 5 : 4, name: fullName },
  ]
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: fullName,
    description: schemaDescription,
    url: canonicalUrl,
    ...(vehicle.updated_at && { dateModified: vehicle.updated_at }),
    image: vehicle.images?.map((i: any) => i.url) || [],
    brand: { '@type': 'Brand', name: vehicle.brand_name },
    model: vehicle.model_name,
    vehicleModelDate: String(vehicle.year),
    itemCondition,
    ...(vehicle.color_exterior && { color: vehicle.color_exterior }),
    ...(vehicle.fuel_type && { fuelType: FUEL_LABELS[vehicle.fuel_type as keyof typeof FUEL_LABELS] ?? vehicle.fuel_type }),
    ...(vehicle.body_type && { bodyType: vehicle.body_type }),
    ...(vehicle.transmission && { vehicleTransmission: TRANSMISSION_LABELS[vehicle.transmission as keyof typeof TRANSMISSION_LABELS] ?? vehicle.transmission }),
    ...(vehicle.drive_type && { driveWheelConfiguration: DRIVE_LABELS[vehicle.drive_type as keyof typeof DRIVE_LABELS] ?? vehicle.drive_type }),
    ...(vehicle.doors && { numberOfDoors: vehicle.doors }),
    ...(vehicle.seats && { vehicleSeatingCapacity: vehicle.seats }),
    ...(vehicle.mileage_km != null && { mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage_km, unitCode: 'KMT' } }),
    ...(vehicle.power_hp && { vehicleEngine: { '@type': 'EngineSpecification', enginePower: { '@type': 'QuantitativeValue', value: vehicle.power_hp, unitCode: 'BHP' } } }),
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
      <ViewTracker vehicleId={vehicle.id} dealerId={vehicle.dealer_id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <VehicleDetailContent
        vehicle={vehicle}
        similarVehicles={similarVehicles || []}
        dealerVehicles={dealerVehicles || []}
        backHref="/coches"
        backLabel="Coches"
        contactMode={contactMode}
      />
    </>
  )
}
