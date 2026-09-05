import Link from 'next/link'
import type { Metadata } from 'next'
import { GuideAuthorBox, GuideFaq, GuideHeroImage, GuideToc, type FaqItem, type TocItem } from '../_components/GuideSeoBlocks'
import { JsonLd } from '@/components/seo/JsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'
const PAGE_PATH = '/guias/como-vender-coche-premium-profesionales'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const HERO_IMAGE = '/images/guides/vender-coche-premium-profesionales.webp'
const HERO_IMAGE_URL = `${SITE_URL}${HERO_IMAGE}`
const PUBLISHED_DATE = '2026-06-09'
const MODIFIED_DATE = '2026-06-16'
const HERO_ALT = 'Showroom profesional de vehículos premium en Black Label Market'

export const metadata: Metadata = {
  title: 'Cómo vender un coche premium o de lujo con los compradores correctos',
  description: 'Guía para profesionales del sector: cómo vender coches de alta gama, lujo y colección en España. Qué quieren ver los compradores, cómo presentar el vehículo y dónde publicar para llegar al comprador adecuado.',
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: 'Cómo vender un coche premium o de lujo con compradores cualificados',
    description: 'Guía para dealers y compraventas: cómo presentar stock premium, justificar precio, documentar el vehículo y publicar en canales especializados.',
    type: 'article',
    url: PAGE_PATH,
    images: [{ url: HERO_IMAGE, width: 1200, height: 675, alt: HERO_ALT }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cómo vender un coche premium o de lujo',
    description: 'Estrategia para profesionales: presentación, precio, documentación, confianza y canales para stock premium.',
    images: [HERO_IMAGE],
  },
}

const faqItems: FaqItem[] = [
  {
    question: '¿Dónde conviene publicar un coche premium si soy profesional?',
    answer: 'Conviene publicar en canales donde el comprador ya esté filtrado por intención, presupuesto e interés real en vehículos premium. Un marketplace especializado evita mezclar stock de alta gama con anuncios masivos y mejora la calidad de las consultas.',
  },
  {
    question: '¿Qué información debe incluir un anuncio profesional de coche de lujo?',
    answer: 'Debe incluir precio, kilometraje, versión, configuración, historial de mantenimiento, estado de neumáticos y frenos, fotografías completas, ubicación del dealer, garantía disponible y documentación relevante. Cuanta más trazabilidad, menor fricción comercial.',
  },
  {
    question: '¿Es mejor mostrar el precio o poner precio bajo consulta?',
    answer: 'En la mayoría de casos, mostrar precio aumenta la confianza y filtra compradores no alineados con el presupuesto. El precio bajo consulta puede tener sentido en unidades extraordinariamente raras, pero en stock premium habitual suele reducir transparencia.',
  },
  {
    question: '¿Qué diferencia a Black Label Market de un portal generalista?',
    answer: 'Black Label Market está orientado a coches y motos premium, dealers verificados, presentación cuidada y compradores con intención más cualificada. El objetivo no es maximizar volumen de contactos, sino mejorar la calidad comercial del contacto.',
  },
]

const tocItems: TocItem[] = [
  { href: '#plataformas-generalistas', label: 'Problema de los portales generalistas' },
  { href: '#comprador-cualificado', label: 'Qué quiere ver el comprador' },
  { href: '#precio-premium', label: 'Precio y estrategia comercial' },
  { href: '#documentacion-valor', label: 'Documentación que aporta valor' },
  { href: '#perfil-vendedor', label: 'Confianza del vendedor' },
  { href: '#tiempo-venta', label: 'Plazos de venta' },
  { href: '#faq', label: 'Preguntas frecuentes' },
]

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${SITE_URL}/guias/como-vender-coche-premium-profesionales#article`,
  headline: 'Cómo vender un coche premium o de lujo con los compradores correctos',
  description: 'Guía para profesionales: cómo vender coches de alta gama, lujo y colección en España con compradores cualificados.',
  url: PAGE_URL,
  inLanguage: 'es-ES',
  image: {
    '@type': 'ImageObject',
    url: HERO_IMAGE_URL,
    width: 1200,
    height: 675,
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
  datePublished: PUBLISHED_DATE,
  dateModified: MODIFIED_DATE,
  publisher: {
    '@type': 'Organization',
    name: 'Black Label Market',
    url: SITE_URL,
    '@id': `${SITE_URL}/#organization`,
  },
  author: {
    '@type': 'Organization',
    name: 'Black Label Market',
    url: SITE_URL,
    '@id': `${SITE_URL}/#organization`,
  },
  isPartOf: { '@id': `${SITE_URL}/#website` },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Guías', item: `${SITE_URL}/guias` },
    { '@type': 'ListItem', position: 3, name: 'Cómo vender un coche premium' },
  ],
}

export default function GuiaVenderPremiumPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 lg:px-8 pt-28 pb-24">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      <nav aria-label="breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
          <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li className="text-bsm-text-muted">Guías</li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li className="text-bsm-text-secondary" aria-current="page">Vender un coche premium</li>
        </ol>
      </nav>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-px w-8 bg-gold" />
        <span className="text-xs text-gold tracking-widest uppercase">Guía para profesionales</span>
      </div>

      <h1 className="font-display text-3xl lg:text-4xl font-light text-bsm-text-primary mb-4 leading-tight">
        Cómo vender un coche premium o de lujo con los compradores correctos
      </h1>
      <p className="text-bsm-text-muted text-sm mb-12">
        Por el equipo editorial de Black Label Market · Actualizado en junio de 2026
      </p>

      <GuideHeroImage src={HERO_IMAGE} alt={HERO_ALT} />
      <GuideToc items={tocItems} />

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-bsm-text-secondary leading-relaxed">

        <p>
          Vender un <Link href="/marcas/ferrari">Ferrari</Link>, un <Link href="/marcas/bentley">Bentley</Link>, un <Link href="/marcas/porsche">Porsche GT</Link> o una <Link href="/marcas/ducati">Ducati</Link> Panigale V4 en España no es difícil si llegas al comprador adecuado. El problema es que los canales habituales —portales generalistas, redes sociales, grupos de Facebook— mezclan tu stock con todo el mercado y no filtran a nadie. El resultado: muchas consultas, pocos compradores reales y negociaciones desde el precio mínimo. Esta guía explica cómo evitarlo.
        </p>

        <section id="plataformas-generalistas">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">El problema de publicar un premium en plataformas generalistas</h2>
          <p>
            Los grandes portales de coches están optimizados para el mercado de volumen. Sus filtros, su estructura de precios y su algoritmo de posicionamiento están pensados para Volkswagen Golfs y Seat Leóns, no para Ferrari 488 o Rolls-Royce Ghost. Un supercar publicado en una plataforma masiva queda enterrado entre decenas de miles de anuncios y recibe consultas de personas que en muchos casos no tienen capacidad real de compra.
          </p>
          <p>
            Esto tiene un coste concreto: tiempo dedicado a filtrar consultas no cualificadas, presión sobre el precio de parte de compradores que buscan &quot;oportunidades&quot; y un posicionamiento de marca que no refleja la calidad de tu stock ni de tu negocio.
          </p>
        </section>

        <section id="comprador-cualificado">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Qué quiere ver un comprador cualificado</h2>
          <p>
            El comprador de un vehículo premium de segunda mano tiene expectativas muy diferentes a las del comprador medio. Ha investigado el modelo, conoce su valor de mercado y sabe exactamente qué preguntas hacer. Lo que busca en un anuncio:
          </p>
          <ul className="list-none space-y-3">
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Precio visible</strong>: los anuncios sin precio generan desconfianza. El comprador serio prefiere conocer el precio y decidir si es adecuado para su presupuesto antes de contactar.</span></li>
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Fotografía de calidad real</strong>: no 4 fotos de móvil. El comprador necesita ver la carrocería completa, los interiores, los detalles de desgaste y el estado del motor. Fotografía profesional con buena iluminación reduce el tiempo hasta el cierre.</span></li>
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Ficha técnica completa</strong>: año, kilometraje, configuración de fábrica (código de opciones si es posible), color exterior e interior, transmisión, potencia real. Cuanta más información, menos fricciones en la negociación.</span></li>
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Historial documentado</strong>: libro de mantenimiento, revisiones, ITV en regla. Mencionar explícitamente &quot;full service history&quot; o &quot;historial completo&quot; filtra compradores y justifica el precio.</span></li>
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Identidad del vendedor</strong>: nombre del concesionario o especialista, ubicación, teléfono de contacto. El anonimato genera desconfianza proporcional al precio del vehículo.</span></li>
          </ul>
        </section>

        <section id="precio-premium">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Precio: cuándo mantener, cuándo ajustar</h2>
          <p>
            Un error frecuente en el segmento premium es aplicar la lógica del mercado masivo al precio: bajar rápido para acelerar la venta. En este segmento, una rebaja prematura puede generar el efecto contrario: el comprador interpreta que hay algo mal en el vehículo.
          </p>
          <p>
            Los parámetros correctos: comparar con transacciones reales de modelos similares en los últimos 3-6 meses (no con los precios pedidos, sino con los precios de cierre). Portales especializados europeos, resultados de subastas recientes y referencias de otros profesionales del sector son las fuentes más fiables.
          </p>
          <p>
            Si el vehículo lleva más de 90 días sin moverse, la revisión debe incluir la presentación y la plataforma de publicación antes que el precio. En muchos casos, el problema no es el precio: es que el anuncio no está llegando a los compradores adecuados.
          </p>
        </section>

        <section id="documentacion-valor">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">La documentación que multiplica el valor</h2>
          <p>
            En el mercado de alta gama, la documentación no es un accesorio: es parte del valor del vehículo. Un Ferrari 348 con todos los libros originales, facturas de revisiones y historial de propietarios vale significativamente más que uno sin documentación, aunque ambos estén en el mismo estado mecánico.
          </p>
          <p>
            Documentos que generan confianza y justifican precio: libro de mantenimiento completo (preferiblemente con sellos del concesionario oficial), facturas de revisiones y reparaciones, manual del propietario original, COC (Certificate of Conformity) en importaciones europeas, y opcionalmente, informe de tasación de una empresa reconocida.
          </p>
          <p>
            Para vehículos de colección: certificados de autenticidad del fabricante, resultados de concours si aplica, y documentación de números matching son activos de valor real.
          </p>
        </section>

        <section id="perfil-vendedor">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">El perfil de vendedor que genera confianza</h2>
          <p>
            En el mercado premium, el comprador no evalúa solo el coche: evalúa al vendedor. Una ficha de concesionario completa, con dirección física, teléfono directo, descripción del negocio y otros vehículos en stock, genera una credibilidad que un anuncio anónimo no puede replicar.
          </p>
          <p>
            Responder rápido, aportar información adicional sin que la pidan y facilitar una inspección pre-compra independiente son señales de confianza que aceleran el cierre. Los compradores de alta gama están acostumbrados a tratar con profesionales y evalúan la experiencia de compra como parte del proceso.
          </p>
        </section>

        <section id="tiempo-venta">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Cuánto tiempo tarda en venderse un premium bien publicado</h2>
          <p>
            En el segmento premium bien presentado, los plazos medios son: deportivos y supercars recientes (3-7 años), entre 30 y 90 días; coches de lujo clásicos (Bentley, Rolls-Royce), 60-180 días; vehículos de colección o muy exclusivos, variable dependiendo del modelo y la demanda internacional.
          </p>
          <p>
            Los plazos se acortan con una presentación visual de calidad, precio competitivo respecto al mercado europeo, documentación completa y visibilidad en los canales correctos. En plataformas generalistas, los mismos vehículos pueden llevar meses sin moverse simplemente porque el tráfico no es el adecuado.
          </p>
        </section>

        <GuideFaq items={faqItems} />
        <GuideAuthorBox />

        <div className="pt-10 border-t border-bsm-border">
          <p className="text-sm text-bsm-text-muted mb-5">
            ¿Tienes stock premium que publicar? Descubre cómo funciona Black Label Market para profesionales.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/para-profesionales" className="btn-gold text-sm px-5">
              Cómo funciona el acceso profesional
            </Link>
            <Link href="/profesionales/planes" className="btn-outline text-sm px-5">
              Comparar planes
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
