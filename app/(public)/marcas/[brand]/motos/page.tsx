import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/server'

// ISR: catálogo público → cache CDN, revalida cada 5 min.
export const revalidate = 300
import VehicleCard from '@/components/marketplace/VehicleCard'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

interface PageProps {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params
  const supabase = createPublicClient()
  const { data } = await supabase.from('brands').select('name').eq('slug', brand).single()
  if (!data) return {}
  const { count } = await supabase
    .from('vehicles')
    .select('id, dealer:dealers!inner(profile_status)', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .ilike('brand_name', data.name)
    .eq('vehicle_type', 'motorcycle')
  return {
    title: `Motos ${data.name} en venta en España`,
    description: `Motos ${data.name} de segunda mano en España. Especialistas y concesionarios verificados, con historial documentado y presentación de calidad.`,
    alternates: { canonical: `/marcas/${brand}/motos` },
    ...(count === 0 ? { robots: { index: false } } : {}),
  }
}

export default async function BrandMotosPage({ params }: PageProps) {
  const { brand } = await params
  const supabase = createPublicClient()

  const { data: brandData } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', brand)
    .single()

  if (!brandData) notFound()

  const { data: vehicles, count } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers!inner(name, slug, location_city, logo_url, is_verified, subscription_plan)', { count: 'exact' })
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .ilike('brand_name', brandData.name)
    .eq('vehicle_type', 'motorcycle')
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(48)

  const itemListJsonLd = vehicles?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Motos ${brandData.name} en venta en España`,
        url: `${SITE_URL}/marcas/${brand}/motos`,
        itemListElement: vehicles.map((v, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/motos/${v.slug}`,
          name: `${v.brand_name} ${v.model_name} ${v.year}`,
        })),
      }
    : null

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Marcas', item: `${SITE_URL}/marcas` },
      { '@type': 'ListItem', position: 3, name: brandData.name, item: `${SITE_URL}/marcas/${brand}` },
      { '@type': 'ListItem', position: 4, name: 'Motos' },
    ],
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      {itemListJsonLd && (
        <JsonLd data={itemListJsonLd} />
      )}
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mb-10">
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li><Link href="/marcas" className="hover:text-gold transition-colors">Marcas</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li><Link href={`/marcas/${brand}`} className="hover:text-gold transition-colors">{brandData.name}</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary" aria-current="page">Motos</li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
          {brandData.logo_url && (
            <div className="w-16 h-16 bg-white rounded-sm flex items-center justify-center p-2 flex-shrink-0">
              <Image src={brandData.logo_url} alt={brandData.name} width={64} height={64} className="w-full h-full object-contain" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-gold" />
              <span className="text-xs text-gold tracking-widest uppercase">Marketplace · Motos</span>
            </div>
            <h1 className="section-title">Motos {brandData.name} en venta</h1>
          </div>
        </div>

        <div className="flex gap-3 text-sm">
          <Link href={`/marcas/${brand}`} className="text-bsm-text-muted hover:text-gold transition-colors">
            Todos los {brandData.name}
          </Link>
          <span className="text-[#3A3A3A]">·</span>
          <Link href={`/marcas/${brand}/coches`} className="text-bsm-text-muted hover:text-gold transition-colors">
            Coches
          </Link>
          <span className="text-[#3A3A3A]">·</span>
          <span className="text-gold">Motos</span>
        </div>
      </div>

      {vehicles && vehicles.length > 0 ? (
        <>
          <p className="text-sm text-bsm-text-muted mb-6">{count} moto{count !== 1 ? 's' : ''} disponible{count !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          <div className="pt-8 border-t border-bsm-border">
            <Link href={`/marcas/${brand}`} className="text-sm text-gold hover:text-gold-light transition-colors">
              Ver todos los vehículos {brandData.name} →
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-bsm-border bg-surface">
          <h2 className="font-display text-xl mb-2 text-bsm-text-primary">Sin motos {brandData.name} disponibles</h2>
          <p className="text-sm text-bsm-text-muted max-w-xs mb-6">
            No hay motos de esta marca en este momento. Explora todos los {brandData.name} o solicita una búsqueda a la carta.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/marcas/${brand}`} className="btn-outline text-sm px-4">Ver todos los {brandData.name}</Link>
            <Link href="/vehiculos-a-la-carta" className="btn-gold text-sm px-4">Solicitar a la carta</Link>
          </div>
        </div>
      )}
    </div>
  )
}
