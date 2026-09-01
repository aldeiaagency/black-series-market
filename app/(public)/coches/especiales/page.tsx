import { createPublicClient } from '@/lib/supabase/server'

// ISR: catálogo público → cache CDN, revalida cada 5 min.
export const revalidate = 300
import VehicleCard from '@/components/marketplace/VehicleCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCategoryStats, buildCategoryFaqItems, CAR_CATEGORY_FAQ } from '@/lib/category-faq'
import { getCategoryBrandStock, CAR_CATEGORY_RELATIONS } from '@/lib/related-categories'
import { esGroupThousands } from '@/lib/utils'
import FaqSection from '@/components/marketplace/FaqSection'
import RelatedCategories from '@/components/marketplace/RelatedCategories'
import { JsonLd } from '@/components/seo/JsonLd'

const CATEGORY_VALUES = ['unidades_especiales']
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createPublicClient()
  const { count } = await supabase
    .from('vehicles')
    .select('id, dealer:dealers!inner(profile_status)', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('vehicle_type', 'car')
    .eq('category', 'unidades_especiales')
  return {
    title: 'Coches de edición especial y unidades únicas en venta en España',
    description: 'Ferrari LaFerrari, Porsche GT2 RS, McLaren Senna, Bugatti Chiron... Ediciones limitadas, series especiales y unidades de producción exclusiva de especialistas verificados en España.',
    alternates: { canonical: '/coches/especiales' },
    ...(count === 0 ? { robots: { index: false } } : {}),
  }
}

export default async function CochesEspecialesPage() {
  const supabase = createPublicClient()
  const { data: vehicles, count } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers!inner(name, slug, location_city, logo_url, is_verified, subscription_plan)', { count: 'exact' })
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('vehicle_type', 'car')
    .eq('category', 'unidades_especiales')
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(48)

  const [stats, brandStock] = await Promise.all([
    getCategoryStats(supabase, 'car', CATEGORY_VALUES),
    getCategoryBrandStock(supabase, 'car', CATEGORY_VALUES, '/coches'),
  ])
  const faqItems = buildCategoryFaqItems(CAR_CATEGORY_FAQ.especiales, stats, esGroupThousands)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Coches de edición especial en venta en España',
    url: `${SITE_URL}/coches/especiales`,
    itemListElement: (vehicles || []).map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/coches/${v.slug}`,
      name: `${v.brand_name} ${v.model_name} ${v.year}`,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Coches', item: `${SITE_URL}/coches` },
      { '@type': 'ListItem', position: 3, name: 'Unidades especiales' },
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
            <li><Link href="/coches" className="hover:text-gold transition-colors">Coches</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary" aria-current="page">Unidades especiales</li>
          </ol>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <h1 className="section-title mb-3">Coches de edición especial y unidades únicas</h1>
        <p className="text-sm text-bsm-text-muted max-w-2xl">
          Ferrari LaFerrari, Porsche GT2 RS Weissach, McLaren Senna, Bugatti Chiron... Ediciones limitadas, series especiales y unidades de producción exclusiva. Piezas que no vuelven a aparecer con facilidad, en manos de especialistas que conocen su valor y su historial.
        </p>
      </div>

      {vehicles && vehicles.length > 0 ? (
        <>
          <p className="text-sm text-bsm-text-muted mb-6">{count} unidad{count !== 1 ? 'es' : ''} disponible{count !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          <div className="pt-8 border-t border-bsm-border flex flex-wrap items-center justify-between gap-4">
            <Link href="/coches?categoria=unidades_especiales" className="text-sm text-gold hover:text-gold-light transition-colors">
              Ver todas las unidades especiales con filtros →
            </Link>
            <Link href="/vehiculos-a-la-carta" className="text-sm text-bsm-text-muted hover:text-gold transition-colors">
              Solicitar búsqueda personalizada →
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-bsm-border bg-surface">
          <h2 className="font-display text-xl mb-2 text-bsm-text-primary">Sin unidades disponibles en este momento</h2>
          <p className="text-sm text-bsm-text-muted max-w-xs mb-6">
            Las unidades especiales son escasas por definición. Si tienes una en mente, deja tu solicitud y te avisamos.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/coches" className="btn-outline text-sm px-4">Explorar todos los coches</Link>
            <Link href="/vehiculos-a-la-carta" className="btn-gold text-sm px-4">Solicitar a la carta</Link>
          </div>
        </div>
      )}
    </div>
    <FaqSection items={faqItems} heading="Preguntas frecuentes sobre unidades especiales" eyebrow="Unidades especiales" />
    <RelatedCategories categories={CAR_CATEGORY_RELATIONS.especiales} brands={brandStock} />
    </>
  )
}
