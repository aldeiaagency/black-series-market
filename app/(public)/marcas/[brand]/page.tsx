import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('brands').select('name').eq('slug', brand).single()
  if (!data) return {}
  return {
    title: `${data.name} en venta`,
    description: `Explora todos los vehículos ${data.name} disponibles en Black Label Market. Selección curada de coches y motos premium.`,
  }
}

export default async function BrandPage({ params }: PageProps) {
  const { brand } = await params
  const supabase = await createClient()

  const { data: brandData } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', brand)
    .single()

  if (!brandData) notFound()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url)')
    .eq('status', 'active')
    .ilike('brand_name', brandData.name)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })

  const cars   = vehicles?.filter((v: any) => v.vehicle_type === 'car') || []
  const motos  = vehicles?.filter((v: any) => v.vehicle_type === 'motorcycle') || []

  // Type-aware CTA for the empty state: moto-only brands → /motos, car-only → /coches,
  // mixed/unknown brands → the brands index. Derived from the brand's models so it is
  // correct even when there is currently no active stock.
  let emptyCta = { href: '/marcas', label: 'explora otras marcas' }
  if (!vehicles?.length) {
    const { data: brandModels } = await supabase
      .from('models')
      .select('vehicle_type')
      .eq('brand_id', brandData.id)
    const hasCar  = brandModels?.some((m: any) => m.vehicle_type === 'car')
    const hasMoto = brandModels?.some((m: any) => m.vehicle_type === 'motorcycle')
    if (hasMoto && !hasCar)      emptyCta = { href: '/motos',  label: 'explora motos disponibles' }
    else if (hasCar && !hasMoto) emptyCta = { href: '/coches', label: 'explora coches disponibles' }
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      {/* Header */}
      <div className="mb-12">
        <Link href="/marcas" className="flex items-center gap-1.5 text-sm text-bsm-text-muted hover:text-gold transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Todas las marcas
        </Link>

        <div className="flex flex-col md:flex-row md:items-end gap-6">
          {brandData.logo_url && (
            <div className="w-24 h-24 bg-white rounded-sm flex items-center justify-center p-3 flex-shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brandData.logo_url} alt={brandData.name} className="w-full h-full object-contain" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-gold" />
              <span className="text-xs text-gold tracking-widest uppercase">
                {brandData.country} · {brandData.founded_year ? `Desde ${brandData.founded_year}` : 'Marca premium'}
              </span>
            </div>
            <h1 className="section-title">{brandData.name}</h1>
            <p className="text-bsm-text-muted text-sm mt-2">
              {vehicles?.length || 0} vehículos disponibles en el marketplace
            </p>
          </div>
        </div>
      </div>

      {/* Cars */}
      {cars.length > 0 && (
        <div className="mb-14">
          {motos.length > 0 && (
            <h2 className="font-display text-2xl font-light mb-6 pb-4 border-b border-bsm-border">Coches</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      )}

      {/* Motos */}
      {motos.length > 0 && (
        <div>
          {cars.length > 0 && (
            <h2 className="font-display text-2xl font-light mb-6 pb-4 border-b border-bsm-border">Motos</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {motos.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      )}

      {!vehicles?.length && (
        <div className="text-center py-16">
          <p className="text-bsm-text-muted">No hay vehículos {brandData.name} disponibles en este momento.</p>
          <p className="text-sm text-bsm-text-muted mt-2">
            Vuelve pronto o{' '}
            <Link href={emptyCta.href} className="text-gold hover:text-gold-light">
              {emptyCta.label}
            </Link>.
          </p>
        </div>
      )}
    </div>
  )
}
