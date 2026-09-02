import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/server'

// ISR: catálogo público → cache CDN, revalida cada 5 min.
export const revalidate = 300
import VehicleCard from '@/components/marketplace/VehicleCard'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { BRAND_EDITORIAL } from '@/lib/brand-editorial'
import { getBrandPriceStats, buildBrandFaqItems } from '@/lib/brand-faq'
import { esGroupThousands } from '@/lib/utils'
import FaqSection from '@/components/marketplace/FaqSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { VEHICLE_PUBLIC_COLUMNS } from '@/lib/public-columns'


const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

interface PageProps {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params
  const supabase = createPublicClient()
  const { data } = await supabase.from('brands').select('name, logo_url').eq('slug', brand).single()
  if (!data) return {}
  const title = `${data.name} en venta en España`
  const editorial = BRAND_EDITORIAL[brand]
  const description = editorial
    ? (editorial.length > 160 ? editorial.slice(0, 157).replace(/\s+\S*$/, '') + '…' : editorial)
    : `Vehículos ${data.name} disponibles en Black Label Market: coches y motos premium con vendedores verificados.`
  return {
    title,
    description,
    alternates: { canonical: `/marcas/${brand}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/marcas/${brand}`,
      ...(data.logo_url ? { images: [data.logo_url] } : {}),
    },
  }
}

export default async function BrandPage({ params }: PageProps) {
  const { brand } = await params
  const supabase = createPublicClient()

  const { data: brandData } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', brand)
    .single()

  if (!brandData) notFound()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select((`${VEHICLE_PUBLIC_COLUMNS}, dealer:dealers!inner(name, slug, location_city, logo_url)`) as string)
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Marcas', item: `${SITE_URL}/marcas` },
      { '@type': 'ListItem', position: 3, name: brandData.name },
    ],
  }

  const editorial = BRAND_EDITORIAL[brandData.slug] || (brandData as any).description || null

  const brandStats = await getBrandPriceStats(supabase, brandData.name)
  const faqItems = buildBrandFaqItems(brandData.slug, brandData.name, brandStats, esGroupThousands)

  const brandJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brandData.name,
    url: `${SITE_URL}/marcas/${brandData.slug}`,
    ...(brandData.logo_url && { logo: brandData.logo_url }),
    ...(editorial && { description: editorial }),
  }

  return (
    <>
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={brandJsonLd} />
      {/* Header */}
      <div className="mb-12">
        <nav aria-label="breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li><Link href="/marcas" className="hover:text-gold transition-colors">Marcas</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary" aria-current="page">{brandData.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end gap-6">
          {brandData.logo_url && (
            <div className="w-24 h-24 bg-white rounded-sm flex items-center justify-center p-3 flex-shrink-0 overflow-hidden">
              <Image src={brandData.logo_url} alt={brandData.name} width={96} height={96} className="w-full h-full object-contain" />
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

        {(cars.length > 0 || motos.length > 0) && (
          <div className="flex gap-3 text-sm mt-6">
            <span className="text-gold">Todos los {brandData.name}</span>
            {cars.length > 0 && (
              <>
                <span className="text-[#3A3A3A]">·</span>
                <Link href={`/marcas/${brand}/coches`} className="text-bsm-text-muted hover:text-gold transition-colors">
                  Coches
                </Link>
              </>
            )}
            {motos.length > 0 && (
              <>
                <span className="text-[#3A3A3A]">·</span>
                <Link href={`/marcas/${brand}/motos`} className="text-bsm-text-muted hover:text-gold transition-colors">
                  Motos
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Editorial — texto SEO único por marca */}
      {editorial && (
        <div className="mb-12 max-w-2xl">
          <p className="text-sm text-bsm-text-secondary leading-relaxed">{editorial}</p>
        </div>
      )}

      {/* Cars */}
      {cars.length > 0 && (
        <div className="mb-14">
          {motos.length > 0 && (
            <h2 className="font-display text-2xl font-light mb-6 pb-4 border-b border-bsm-border">Coches</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          {motos.length > 0 && (
            <div className="mt-6">
              <Link href={`/marcas/${brand}/coches`} className="text-sm text-gold hover:text-gold-light transition-colors">
                Ver todos los coches {brandData.name} →
              </Link>
            </div>
          )}
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
          {cars.length > 0 && (
            <div className="mt-6">
              <Link href={`/marcas/${brand}/motos`} className="text-sm text-gold hover:text-gold-light transition-colors">
                Ver todas las motos {brandData.name} →
              </Link>
            </div>
          )}
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
    <FaqSection items={faqItems} heading={`Preguntas frecuentes sobre ${brandData.name}`} eyebrow={brandData.name} />
    </>
  )
}
