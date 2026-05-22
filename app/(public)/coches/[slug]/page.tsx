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
    description: `${title} en venta en Black Series Market. Vehículo premium verificado por concesionario oficial.`,
    openGraph: {
      title,
      images: data.images?.[0]?.url ? [data.images[0].url] : [],
    },
  }
}

export default async function CocheDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(*)')
    .eq('slug', slug)
    .eq('vehicle_type', 'car')
    .single()

  if (!vehicle || vehicle.status !== 'active') notFound()

  // Track view (non-blocking)
  supabase.from('analytics_events').insert({
    vehicle_id: vehicle.id,
    dealer_id: vehicle.dealer_id,
    event_type: 'view',
  }).then(() => {})

  // Increment view counter
  supabase.from('vehicles').update({ views: vehicle.views + 1 }).eq('id', vehicle.id).then(() => {})

  const { data: relatedVehicles } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url)')
    .eq('status', 'active')
    .eq('dealer_id', vehicle.dealer_id)
    .eq('vehicle_type', 'car')
    .neq('id', vehicle.id)
    .limit(3)

  return (
    <VehicleDetailContent
      vehicle={vehicle}
      relatedVehicles={relatedVehicles || []}
      backHref="/coches"
      backLabel="Coches"
    />
  )
}
