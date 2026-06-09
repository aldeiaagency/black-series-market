import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import Link from 'next/link'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('vehicle_type', 'motorcycle')
    .eq('category', 'touring_adventure')
  return {
    title: 'Motos touring y adventure en venta en España',
    description: 'BMW R1250 GS, Ducati Multistrada V4, KTM 1290 Super Adventure, Triumph Tiger 1200... Motos touring, gran turismo y adventure de larga distancia de especialistas verificados.',
    alternates: { canonical: '/motos/touring' },
    ...(count === 0 ? { robots: { index: false } } : {}),
  }
}

export default async function MotosTouringPage() {
  const supabase = await createClient()
  const { data: vehicles, count } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified, subscription_plan)', { count: 'exact' })
    .eq('status', 'active')
    .eq('vehicle_type', 'motorcycle')
    .eq('category', 'touring_adventure')
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(48)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Motos touring y adventure en venta en España',
    url: `${SITE_URL}/motos/touring`,
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
      { '@type': 'ListItem', position: 3, name: 'Touring y adventure' },
    ],
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mb-10">
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li><Link href="/motos" className="hover:text-gold transition-colors">Motos</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary" aria-current="page">Touring y adventure</li>
          </ol>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <h1 className="section-title mb-3">Motos touring y adventure</h1>
        <p className="text-sm text-bsm-text-muted max-w-2xl">
          BMW R1250 GS Adventure, Ducati Multistrada V4 S, KTM 1290 Super Adventure, Triumph Tiger 1200... Para quienes la distancia es parte del placer. Motos de gran turismo y adventure con equipamiento completo y revisiones al día.
        </p>
      </div>

      {vehicles && vehicles.length > 0 ? (
        <>
          <p className="text-sm text-bsm-text-muted mb-6">{count} moto{count !== 1 ? 's' : ''} disponible{count !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          <div className="pt-8 border-t border-bsm-border">
            <Link href="/motos?categoria=touring_adventure" className="text-sm text-gold hover:text-gold-light transition-colors">
              Ver todas las motos touring con filtros →
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-bsm-border bg-surface">
          <h2 className="font-display text-xl mb-2 text-bsm-text-primary">Sin unidades disponibles en este momento</h2>
          <p className="text-sm text-bsm-text-muted max-w-xs mb-6">
            Aún no hay motos touring o adventure publicadas. Explora el catálogo general o solicita una búsqueda a la carta.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/motos" className="btn-outline text-sm px-4">Explorar todas las motos</Link>
            <Link href="/vehiculos-a-la-carta" className="btn-gold text-sm px-4">Solicitar a la carta</Link>
          </div>
        </div>
      )}
    </div>
  )
}
