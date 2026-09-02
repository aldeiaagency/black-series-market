import { createPublicClient } from '@/lib/supabase/server'

// ISR: catálogo público → cache CDN, revalida cada 5 min.
export const revalidate = 300
import VehicleCard from '@/components/marketplace/VehicleCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCategoryStats, buildCategoryFaqItems, MOTO_CATEGORY_FAQ } from '@/lib/category-faq'
import { getCategoryBrandStock, MOTO_CATEGORY_RELATIONS } from '@/lib/related-categories'
import { esGroupThousands } from '@/lib/utils'
import FaqSection from '@/components/marketplace/FaqSection'
import RelatedCategories from '@/components/marketplace/RelatedCategories'
import { JsonLd } from '@/components/seo/JsonLd'
import { VEHICLE_PUBLIC_COLUMNS } from '@/lib/public-columns'

const CATEGORY_VALUES = ['entusiastas']
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createPublicClient()
  const { count } = await supabase
    .from('vehicles')
    .select('id, dealer:dealers!inner(profile_status)', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('vehicle_type', 'motorcycle')
    .eq('category', 'entusiastas')
  return {
    title: 'Motos para entusiastas en venta en España',
    description: 'Honda CB1000R, Triumph Street Triple, Kawasaki Z900RS, Yamaha MT-09... Motos de carácter para conductores apasionados, con vendedores verificados e historial documentado en España.',
    alternates: { canonical: '/motos/entusiastas' },
    ...(count === 0 ? { robots: { index: false } } : {}),
  }
}

export default async function MotosEntusiastasPage() {
  const supabase = createPublicClient()
  const { data: vehicles, count } = await supabase
    .from('vehicles')
    .select((`${VEHICLE_PUBLIC_COLUMNS}, dealer:dealers!inner(name, slug, location_city, logo_url, is_verified)`) as string, { count: 'exact' })
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('vehicle_type', 'motorcycle')
    .eq('category', 'entusiastas')
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(48)
    .returns<any[]>()

  const [stats, brandStock] = await Promise.all([
    getCategoryStats(supabase, 'motorcycle', CATEGORY_VALUES),
    getCategoryBrandStock(supabase, 'motorcycle', CATEGORY_VALUES, '/motos'),
  ])
  const faqItems = buildCategoryFaqItems(MOTO_CATEGORY_FAQ.entusiastas, stats, esGroupThousands)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Motos para entusiastas en venta en España',
    url: `${SITE_URL}/motos/entusiastas`,
    itemListElement: (vehicles || []).map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/motos/${v.slug}`,
      name: `${v.brand_name} ${v.model_name} ${v.year}`,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Motos', item: `${SITE_URL}/motos` },
      { '@type': 'ListItem', position: 3, name: 'Entusiastas' },
    ],
  }

  return (
    <>
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mb-10">
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li><Link href="/motos" className="hover:text-gold transition-colors">Motos</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary" aria-current="page">Entusiastas</li>
          </ol>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <h1 className="section-title mb-3">Motos para entusiastas</h1>
        <p className="text-sm text-bsm-text-muted max-w-2xl">
          Honda CB1000R, Triumph Street Triple, Kawasaki Z900RS, Yamaha MT-09... Motos de carácter definido para conductores que disfrutan de verdad. Presentación cuidada, historial documentado y vendedores que conocen el producto.
        </p>
      </div>

      {vehicles && vehicles.length > 0 ? (
        <>
          <p className="text-sm text-bsm-text-muted mb-6">{count} moto{count !== 1 ? 's' : ''} disponible{count !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          <div className="pt-8 border-t border-bsm-border flex flex-wrap items-center justify-between gap-4">
            <Link href="/motos?categoria=entusiastas" className="text-sm text-gold hover:text-gold-light transition-colors">
              Ver todas las motos entusiastas con filtros →
            </Link>
            <Link href="/guias/motos-premium-segunda-mano" className="text-sm text-bsm-text-muted hover:text-gold transition-colors">
              Guía de compra →
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-bsm-border bg-surface">
          <h2 className="font-display text-xl mb-2 text-bsm-text-primary">Sin unidades disponibles en este momento</h2>
          <p className="text-sm text-bsm-text-muted max-w-xs mb-6">
            Aún no hay motos publicadas en esta categoría. Explora el catálogo general o solicita una búsqueda a la carta.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/motos" className="btn-outline text-sm px-4">Explorar todas las motos</Link>
            <Link href="/vehiculos-a-la-carta" className="btn-gold text-sm px-4">Solicitar a la carta</Link>
          </div>
        </div>
      )}
    </div>
    <FaqSection items={faqItems} heading="Preguntas frecuentes sobre motos para entusiastas" eyebrow="Entusiastas" />
    <RelatedCategories categories={MOTO_CATEGORY_RELATIONS.entusiastas} brands={brandStock} />
    </>
  )
}
