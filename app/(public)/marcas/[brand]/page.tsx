import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'


const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

const BRAND_EDITORIAL: Record<string, string> = {
  ferrari:
    'Ferrari representa el punto más alto de la ingeniería deportiva italiana. Cada Ferrari en el mercado de segunda mano es una pieza de historia del motor: rendimiento sin concesiones, líneas que no pasan de moda y un valor que el tiempo tiende a respetar. Los Ferrari publicados en Black Label Market provienen de especialistas que conocen cada modelo a fondo, con historial verificado y documentación en orden.',
  porsche:
    'Pocos fabricantes logran combinar usabilidad diaria con prestaciones puras como Porsche. El 911, el Cayman, el Taycan o el Panamera son referencias absolutas en sus segmentos. Los Porsche publicados aquí provienen de profesionales especializados: kilometraje verificado, mantenimientos al día y configuraciones originales documentadas.',
  lamborghini:
    'Lamborghini es emoción en estado puro: diseño extremo, sonido inconfundible y una exclusividad que se cotiza. Un Lamborghini bien documentado y con historial trazable es uno de los activos más demandados del mercado premium. Los vendedores especializados en Black Label Market aportan la confianza necesaria para este tipo de operación.',
  bmw:
    'La gama M de BMW y los modelos más exclusivos de BMW Motorrad son referentes para quienes buscan prestaciones reales con refinamiento diario. Los vehículos BMW publicados en Black Label Market son seleccionados por profesionales con inventario especializado, historial documentado y exigencia en la presentación.',
  ducati:
    'Ducati es sinónimo de pasión, precisión y carácter italiano. Desde la Panigale V4 hasta la Scrambler, cada modelo tiene una personalidad definida y un seguimiento de culto. En Black Label Market encontrarás Ducati de especialistas que entienden el producto: motos con historial claro, mantenimiento oficial y presentación a la altura.',
  mclaren:
    'McLaren lleva la tecnología de la Fórmula 1 a la carretera. Sus modelos —720S, Artura, Senna, P1— son máquinas de referencia absoluta en el segmento superdeportivo. Encontrar un McLaren con historial documentado y en manos de un especialista de confianza es exactamente lo que hace Black Label Market.',
  'rolls-royce':
    'Rolls-Royce define el lujo sin compromiso. Cada unidad es prácticamente única: materiales de primera calidad, personalización a medida y una presencia en carretera inigualable. Los Rolls-Royce disponibles en Black Label Market son ofrecidos por los pocos especialistas que manejan este tipo de producto con el cuidado que merece.',
  bentley:
    'Bentley combina artesanía british con prestaciones deportivas reales. El Continental GT, el Bentayga o el Flying Spur son elecciones de quienes no quieren elegir entre lujo y dinámicas. Los vendedores especializados en Black Label Market son los únicos en los que merece confiar para este tipo de adquisición.',
  'mercedes-benz':
    'Mercedes-Benz define el estándar de lo que significa el lujo alemán en movimiento. Desde el SL clásico hasta el AMG GT, la Clase S o el G63, cada modelo combina ingeniería de vanguardia con un refinamiento que ningún otro fabricante iguala en volumen. Los vehículos Mercedes-Benz publicados en Black Label Market son seleccionados por profesionales con historial documentado, mantenimiento en red oficial y configuraciones de alto equipamiento.',
  audi:
    'Audi lleva décadas estableciendo referencias en tecnología, diseño y tracción quattro. La gama RS, el A8 o el e-tron GT son ejemplos de un fabricante que no necesita elevar el tono para ser premium. Los vehículos Audi publicados en Black Label Market son seleccionados por concesionarios especializados con historial verificado y presentación a la altura de la marca.',
  bugatti:
    'Bugatti produce los hipercars más exclusivos del mundo. Cada Veyron, Chiron o Divo es una obra de ingeniería sin parangón: más de 1.000 CV, producción medida en decenas de unidades y un proceso de fabricación artesanal en Molsheim. Una operación Bugatti exige el máximo rigor en documentación, trazabilidad y especialización: exactamente lo que ofrecen los vendedores de Black Label Market.',
  triumph:
    'Triumph es la esencia de la moto británica de carácter: desde la Speed Triple hasta la Bonneville o la Tiger 900, cada modelo tiene una identidad definida y un legado de décadas. Los Triumph publicados en Black Label Market provienen de especialistas con inventario bien seleccionado, mantenimiento documentado y conocimiento real del producto.',
  'harley-davidson':
    'Harley-Davidson no es solo una moto, es una cultura de conducción. Desde el Sportster hasta el Road King o el Fat Bob, cada modelo carga con décadas de historia y una comunidad que valora la autenticidad por encima de todo. Los Harley-Davidson publicados en Black Label Market son ofrecidos por especialistas que entienden el valor de una moto bien mantenida, documentada y en su configuración original.',
  'mv-agusta':
    'MV Agusta produce algunas de las motos más hermosas del mundo. La Brutale, la F4, la Superveloce... piezas de orfebrería sobre dos ruedas que combinan rendimiento superlativo con un diseño inimitable. Encontrar una MV Agusta con historial claro y en manos de un especialista de confianza es el tipo de operación que hace Black Label Market.',
}

interface PageProps {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('brands').select('name').eq('slug', brand).single()
  if (!data) return {}
  return {
    title: `${data.name} en venta en España`,
    description: `Vehículos ${data.name} disponibles en Black Label Market: coches y motos premium con vendedores verificados.`,
    alternates: { canonical: `/marcas/${brand}` },
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Marcas', item: `${SITE_URL}/marcas` },
      { '@type': 'ListItem', position: 3, name: brandData.name },
    ],
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
      </div>

      {/* Editorial — solo para marcas top con contenido definido */}
      {(() => {
        const editorial = BRAND_EDITORIAL[brandData.slug] || (brandData as any).description
        return editorial ? (
          <div className="mb-12 max-w-2xl">
            <p className="text-sm text-bsm-text-secondary leading-relaxed">{editorial}</p>
          </div>
        ) : null
      })()}

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
