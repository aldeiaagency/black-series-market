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
    .eq('category', 'scooter_premium')
  return {
    title: 'Scooters premium en venta en España',
    description: 'Vespa GTS 300, BMW C 400 GT, Aprilia SRV 850, Yamaha XMAX 400... Scooters premium con acabados de alta gama, de especialistas verificados con historial documentado en España.',
    alternates: { canonical: '/motos/scooter' },
    ...(count === 0 ? { robots: { index: false } } : {}),
  }
}

export default async function MotosScooterPage() {
  const supabase = await createClient()
  const { data: vehicles, count } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified, subscription_plan)', { count: 'exact' })
    .eq('status', 'active')
    .eq('vehicle_type', 'motorcycle')
    .eq('category', 'scooter_premium')
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(48)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Scooters premium en venta en España',
    url: `${SITE_URL}/motos/scooter`,
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
      { '@type': 'ListItem', position: 3, name: 'Scooter premium' },
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
            <li className="text-bsm-text-secondary" aria-current="page">Scooter premium</li>
          </ol>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Marketplace</span>
        </div>
        <h1 className="section-title mb-3">Scooters premium</h1>
        <p className="text-sm text-bsm-text-muted max-w-2xl">
          Vespa GTS 300, BMW C 400 GT, Aprilia SRV 850... Scooters de alta gama con acabados y prestaciones que van más allá de la movilidad urbana. Vendedores verificados y ficha técnica completa en cada unidad.
        </p>
      </div>

      {vehicles && vehicles.length > 0 ? (
        <>
          <p className="text-sm text-bsm-text-muted mb-6">{count} moto{count !== 1 ? 's' : ''} disponible{count !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          <div className="pt-8 border-t border-bsm-border">
            <Link href="/motos?categoria=scooter_premium" className="text-sm text-gold hover:text-gold-light transition-colors">
              Ver todos los scooters con filtros →
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-bsm-border bg-surface">
          <h2 className="font-display text-xl mb-2 text-bsm-text-primary">Sin unidades disponibles en este momento</h2>
          <p className="text-sm text-bsm-text-muted max-w-xs mb-6">
            Aún no hay scooters premium publicados. Explora el catálogo general o solicita una búsqueda a la carta.
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
