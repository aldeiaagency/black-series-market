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
import { VEHICLE_PUBLIC_COLUMNS } from '@/lib/public-columns'

const CATEGORY_VALUES = ['lujo_alta_gama']
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createPublicClient()
  const { count } = await supabase
    .from('vehicles')
    .select('id, dealer:dealers!inner(profile_status)', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('vehicle_type', 'car')
    .eq('category', 'lujo_alta_gama')
  return {
    title: 'Coches de lujo y alta gama en venta en España',
    description: 'Rolls-Royce, Bentley, Mercedes Clase S, BMW Serie 7, Maserati Quattroporte... La selección de coches de lujo más exclusiva de España, con los mejores concesionarios verificados.',
    alternates: { canonical: '/coches/lujo' },
    ...(count === 0 ? { robots: { index: false } } : {}),
  }
}

export default async function CochesLujoPage() {
  const supabase = createPublicClient()
  const { data: vehicles, count } = await supabase
    .from('vehicles')
    .select((`${VEHICLE_PUBLIC_COLUMNS}, dealer:dealers!inner(name, slug, location_city, logo_url, is_verified)`) as string, { count: 'exact' })
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('vehicle_type', 'car')
    .eq('category', 'lujo_alta_gama')
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(48)
    .returns<any[]>()

  const [stats, brandStock] = await Promise.all([
    getCategoryStats(supabase, 'car', CATEGORY_VALUES),
    getCategoryBrandStock(supabase, 'car', CATEGORY_VALUES, '/coches'),
  ])
  const faqItems = buildCategoryFaqItems(CAR_CATEGORY_FAQ.lujo, stats, esGroupThousands)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Coches de lujo en venta en España',
    url: `${SITE_URL}/coches/lujo`,
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
      { '@type': 'ListItem', position: 3, name: 'Lujo y alta gama' },
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
            <li className="text-bsm-text-secondary" aria-current="page">Lujo y alta gama</li>
          </ol>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <h1 className="section-title mb-3">Coches de lujo y alta gama</h1>
        <p className="text-sm text-bsm-text-muted max-w-2xl">
          Rolls-Royce, Bentley, Mercedes Clase S, BMW Serie 7, Maserati Quattroporte... Coches de lujo y alta gama de los mejores concesionarios especializados de España, con historial documentado y presentación impecable.
        </p>
      </div>

      {vehicles && vehicles.length > 0 ? (
        <>
          <p className="text-sm text-bsm-text-muted mb-6">{count} unidad{count !== 1 ? 'es' : ''} disponible{count !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          <div className="pt-8 border-t border-bsm-border">
            <Link href="/coches?categoria=lujo_alta_gama" className="text-sm text-gold hover:text-gold-light transition-colors">
              Ver todos los coches de lujo con filtros →
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-bsm-border bg-surface">
          <h2 className="font-display text-xl mb-2 text-bsm-text-primary">Sin unidades disponibles en este momento</h2>
          <p className="text-sm text-bsm-text-muted max-w-xs mb-6">
            Aún no hay coches de lujo publicados. Explora el catálogo general o solicita una búsqueda a la carta.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/coches" className="btn-outline text-sm px-4">Explorar todos los coches</Link>
            <Link href="/vehiculos-a-la-carta" className="btn-gold text-sm px-4">Solicitar a la carta</Link>
          </div>
        </div>
      )}
    </div>
    <FaqSection items={faqItems} heading="Preguntas frecuentes sobre coches de lujo y alta gama" eyebrow="Lujo y alta gama" />
    <RelatedCategories categories={CAR_CATEGORY_RELATIONS.lujo} brands={brandStock} />
    </>
  )
}
