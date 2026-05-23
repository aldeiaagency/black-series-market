import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VehicleDetailContent from '@/components/marketplace/VehicleDetailContent'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('vehicles')
    .select('brand_name, model_name, year, version, images')
    .eq('slug', slug)
    .single()
  if (!data) return {}
  const title = `${data.brand_name} ${data.model_name} ${data.year}${data.version ? ' ' + data.version : ''}`
  return {
    title,
    description: `${title} en venta en Black Label Market. Moto premium publicada por dealer seleccionado.`,
    openGraph: {
      title,
      images: data.images?.[0]?.url ? [data.images[0].url] : [],
    },
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

  if (!vehicle || vehicle.status !== 'active') notFound()

  supabase.from('analytics_events').insert({
    vehicle_id: vehicle.id,
    dealer_id: vehicle.dealer_id,
    event_type: 'view',
  }).then(() => {})

  supabase.from('vehicles').update({ views: vehicle.views + 1 }).eq('id', vehicle.id).then(() => {})

  const { data: relatedVehicles } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url)')
    .eq('status', 'active')
    .eq('dealer_id', vehicle.dealer_id)
    .eq('vehicle_type', 'motorcycle')
    .neq('id', vehicle.id)
    .limit(3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year}${vehicle.version ? ' ' + vehicle.version : ''}`,
    description: vehicle.description || `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year} en venta en Black Label Market.`,
    image: vehicle.images?.map((i: any) => i.url) || [],
    brand: { '@type': 'Brand', name: vehicle.brand_name },
    offers: {
      '@type': 'Offer',
      priceCurrency: vehicle.currency || 'EUR',
      price: vehicle.price_on_request ? undefined : vehicle.price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'AutoDealer', name: vehicle.dealer?.name },
    },
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage_km, unitCode: 'KMT' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VehicleDetailContent
        vehicle={vehicle}
        relatedVehicles={relatedVehicles || []}
        backHref="/motos"
        backLabel="Motos"
      />
    </>
  )
}
