import Link from 'next/link'
import type { Metadata } from 'next'
import { GuideAuthorBox, GuideFaq, GuideHeroImage, GuideToc, type FaqItem, type TocItem } from '../_components/GuideSeoBlocks'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'
const PAGE_PATH = '/guias/motos-premium-segunda-mano'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const HERO_IMAGE = '/images/guides/comprar-moto-premium-segunda-mano.webp'
const HERO_IMAGE_URL = `${SITE_URL}${HERO_IMAGE}`
const PUBLISHED_DATE = '2026-06-09'
const MODIFIED_DATE = '2026-06-16'
const HERO_ALT = 'Moto Ducati premium junto a un deportivo Porsche en Black Label Market'

export const metadata: Metadata = {
  title: 'Cómo comprar una moto premium de segunda mano en España',
  description: 'Guía práctica para comprar motos premium de segunda mano: qué verificar, documentación imprescindible, precio justo, marcas clave y cómo encontrar especialistas de confianza en España.',
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: 'Cómo comprar una moto premium de segunda mano en España',
    description: 'Guía para comprar Ducati, BMW Motorrad, MV Agusta, Harley-Davidson o Triumph usadas con historial, precio justo y vendedor fiable.',
    type: 'article',
    url: PAGE_PATH,
    images: [{ url: HERO_IMAGE, width: 1200, height: 675, alt: HERO_ALT }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cómo comprar una moto premium de segunda mano en España',
    description: 'Qué verificar antes de comprar una moto premium usada: historial, documentación, kilometraje, precio y especialista.',
    images: [HERO_IMAGE],
  },
}

const faqItems: FaqItem[] = [
  {
    question: '¿Qué se considera una moto premium de segunda mano?',
    answer: 'Una moto premium de segunda mano suele ser una motocicleta de marca aspiracional, alto precio de origen, prestaciones elevadas, tecnología avanzada o interés de colección. Incluye deportivas, naked, touring, custom, trail premium y clásicas de marcas como Ducati, BMW Motorrad, MV Agusta, Triumph o Harley-Davidson.',
  },
  {
    question: '¿Cómo puedo saber si una moto premium ha tenido uso en circuito?',
    answer: 'Conviene revisar neumáticos, frenos, suspensiones, carenados, tornillería, protecciones, historial de mantenimiento y posibles facturas de preparación. El uso en circuito no invalida una compra, pero debe estar declarado, reflejado en el precio y revisado por un especialista.',
  },
  {
    question: '¿Qué documentación es imprescindible al comprar una moto usada de alta gama?',
    answer: 'Debes revisar permiso de circulación, ficha técnica, historial de ITV, libro de mantenimiento, facturas de taller, justificante de cargas y cualquier documentación de accesorios homologados. En motos premium, el historial completo puede justificar una prima de precio frente a unidades similares.',
  },
  {
    question: '¿Es recomendable comprar una moto premium a un profesional?',
    answer: 'Sí, especialmente si buscas trazabilidad, garantía comercial, documentación ordenada y una revisión previa más transparente. Un especialista verificado reduce la incertidumbre en modelos con costes de mantenimiento altos o historial difícil de interpretar.',
  },
]

const tocItems: TocItem[] = [
  { href: '#segmento-moto-premium', label: 'Qué cubre el segmento premium' },
  { href: '#verificaciones-compra', label: 'Qué verificar antes de comprar' },
  { href: '#documentacion-moto', label: 'Documentación imprescindible' },
  { href: '#valorar-precio-moto', label: 'Cómo valorar el precio' },
  { href: '#errores-moto-premium', label: 'Errores frecuentes' },
  { href: '#faq', label: 'Preguntas frecuentes' },
]

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${SITE_URL}/guias/motos-premium-segunda-mano#article`,
  headline: 'Cómo comprar una moto premium de segunda mano: guía completa',
  description: 'Guía práctica para comprar motos premium de segunda mano: qué verificar, documentación, precio justo y cómo encontrar especialistas de confianza en España.',
  url: PAGE_URL,
  inLanguage: 'es-ES',
  image: {
    '@type': 'ImageObject',
    url: HERO_IMAGE_URL,
    width: 1200,
    height: 675,
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
  publisher: { '@type': 'Organization', name: 'Black Label Market', url: SITE_URL, '@id': `${SITE_URL}/#organization` },
  author: { '@type': 'Organization', name: 'Black Label Market', url: SITE_URL, '@id': `${SITE_URL}/#organization` },
  datePublished: PUBLISHED_DATE,
  dateModified: MODIFIED_DATE,
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
    { '@type': 'ListItem', position: 2, name: 'Guías' },
    { '@type': 'ListItem', position: 3, name: 'Motos premium de segunda mano' },
  ],
}

export default function GuiaMotosPage() {
  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-12 pt-28 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="mb-12">
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary">Guías</li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary" aria-current="page">Motos premium de segunda mano</li>
          </ol>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Guía de compra</span>
        </div>
        <h1 className="section-title mb-4">Cómo comprar una moto premium de segunda mano</h1>
        <p className="text-sm text-bsm-text-muted">Por el equipo editorial de Black Label Market · Actualizado en junio de 2026</p>
      </div>

      <GuideHeroImage src={HERO_IMAGE} alt={HERO_ALT} />
      <GuideToc items={tocItems} />

      <div className="space-y-10 text-bsm-text-secondary leading-relaxed">

        <section id="segmento-moto-premium">
          <p className="text-base leading-relaxed mb-4">
            El mercado de motos premium de segunda mano tiene una lógica propia. No es solo una cuestión de precio: es cuestión de documentación, historial de mantenimiento, kilometraje real y el tipo de uso que la moto ha tenido. Una Ducati Panigale V4 que ha rodado en circuito y otra que ha circulado exclusivamente en carretera pueden tener el mismo precio anunciado y un valor real completamente diferente.
          </p>
          <p className="text-sm leading-relaxed">
            Esta guía reúne los criterios que los compradores más informados aplican antes de tomar una decisión en este mercado.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">1. El segmento de moto premium: qué cubre</h2>
          <p className="text-sm leading-relaxed mb-4">
            El término moto premium no tiene una definición oficial, pero en el mercado se entiende como cualquier motocicleta que combina precio de adquisición elevado, acabados superiores y, habitualmente, prestaciones o carácter por encima de la media. Incluye:
          </p>
          <ul className="space-y-3 text-sm list-none pl-0 mb-4">
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Deportivas</strong>: <Link href="/marcas/ducati" className="text-gold hover:text-gold-light transition-colors">Ducati</Link> Panigale V4, <Link href="/marcas/bmw-motorrad" className="text-gold hover:text-gold-light transition-colors">BMW Motorrad</Link> M1000RR, <Link href="/marcas/aprilia" className="text-gold hover:text-gold-light transition-colors">Aprilia</Link> RSV4, Honda CBR1000RR-R. Diseñadas para el máximo rendimiento en circuito o carretera.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Naked y street</strong>: Ducati Streetfighter V4, BMW S1000R, KTM 1290 Super Duke R. Prestaciones de supersport con uso urbano y de carretera.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Touring y adventure</strong>: BMW R1250GS, Ducati Multistrada V4, <Link href="/marcas/triumph" className="text-gold hover:text-gold-light transition-colors">Triumph</Link> Tiger 1200. Orientadas a grandes distancias con máximo confort y tecnología.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Custom y cruiser</strong>: <Link href="/marcas/harley-davidson" className="text-gold hover:text-gold-light transition-colors">Harley-Davidson</Link> Softail, <Link href="/marcas/indian" className="text-gold hover:text-gold-light transition-colors">Indian</Link> Chief, BMW R18. Carácter, presencia y un tipo de disfrute diferente al de la deportiva pura.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Clásicas y youngtimers</strong>: Ducati 900 SS, Triumph Bonneville vintage, Honda RC30. Piezas de colección con valor creciente en el mercado internacional.</span>
            </li>
          </ul>
          <p className="text-sm leading-relaxed">
            Cada segmento tiene sus propios criterios de valoración. Lo que importa en una clásica (matching numbers, pátina original) no es lo mismo que en una touring moderna (paquete tecnológico, historial de actualizaciones de firmware).
          </p>
        </section>

        <section id="verificaciones-compra">
          <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">2. Qué verificar antes de comprar</h2>
          <p className="text-sm leading-relaxed mb-6">
            La verificación antes de la compra es el paso que más diferencia a los compradores con experiencia de los que aprenden a su costa. Estos son los puntos críticos:
          </p>

          <h3 className="font-semibold text-bsm-text-primary text-sm mb-2">Historial de mantenimiento</h3>
          <p className="text-sm leading-relaxed mb-6">
            Una moto premium con historial de mantenimiento completo —libro de revisiones sellado, facturas de taller oficial o especialista, actualizaciones de firmware documentadas— vale entre un 10 y un 20 % más que la misma unidad sin documentación. El historial es la única forma objetiva de verificar que la moto ha sido tratada según las especificaciones del fabricante.
          </p>

          <h3 className="font-semibold text-bsm-text-primary text-sm mb-2">Uso en circuito</h3>
          <p className="text-sm leading-relaxed mb-6">
            Una deportiva usada en trackdays tiene un desgaste diferente al de una moto de carretera con el mismo kilometraje. Neumáticos, frenos, suspensión, motor y chasis trabajan en condiciones más extremas. No es automáticamente un problema, pero debe reflejarse en el precio y en una inspección más detallada.
          </p>

          <h3 className="font-semibold text-bsm-text-primary text-sm mb-2">Estado del bastidor y la carrocería</h3>
          <p className="text-sm leading-relaxed mb-6">
            Los golpes leves en carrocería pueden ser cosméticos. Los golpes en el bastidor, las horquillas o el basculante son otro nivel. Inspeccionar personalmente la moto o encargar una revisión técnica independiente es una inversión que puede evitar sorpresas costosas.
          </p>

          <h3 className="font-semibold text-bsm-text-primary text-sm mb-2">Kilómetros reales</h3>
          <p className="text-sm leading-relaxed">
            A diferencia de los coches, el manipulado de odómetros en motos es relativamente sencillo y más habitual de lo que parece. Contrastar el kilometraje con el historial de revisiones —las revisiones de las motos premium son por tiempo o por kilómetros— es la forma más fiable de detectar incoherencias.
          </p>
        </section>

        <section id="documentacion-moto">
          <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">3. Documentación imprescindible</h2>
          <p className="text-sm leading-relaxed mb-4">En una operación de compraventa de moto premium, la documentación básica es:</p>
          <ul className="space-y-3 text-sm list-none pl-0">
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Permiso de circulación</strong> a nombre del vendedor, actualizado. Si hay un cambio de titularidad previo sin documentar, el proceso de transferencia puede complicarse.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Ficha técnica</strong> que coincida con las especificaciones reales de la moto. Las modificaciones no declaradas pueden generar problemas en la ITV o en el seguro.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Historial de ITV</strong>: el registro de inspecciones es especialmente valioso para verificar el kilometraje declarado en cada visita.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Libro de revisiones</strong>: el documento más valioso para confirmar el mantenimiento oficial.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Facturas de reparaciones</strong>: permiten conocer qué piezas han sido cambiadas y por qué.</span>
            </li>
          </ul>
        </section>

        <section id="valorar-precio-moto">
          <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">4. Cómo valorar el precio</h2>
          <p className="text-sm leading-relaxed mb-4">
            El precio de una moto premium de segunda mano depende de múltiples factores que el precio anunciado no siempre refleja. Las guías de valoración como Eurotax o Schwacke son un punto de partida, pero en el segmento premium el mercado real puede diferir significativamente.
          </p>
          <p className="text-sm leading-relaxed mb-4">
            Los factores que más influyen en el precio real son: estado de conservación, historial completo o incompleto, equipamiento opcional instalado, color y acabados (algunos colores o versiones son más buscados que otros), y la reputación del vendedor.
          </p>
          <p className="text-sm leading-relaxed">
            Una moto de un especialista verificado, con garantía y documentación completa, puede valer un 10-15 % más que la misma unidad en una venta entre particulares. Esa diferencia refleja el riesgo que el comprador evita y la trazabilidad que obtiene.
          </p>
        </section>

        <section id="errores-moto-premium">
          <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">5. Errores más frecuentes al comprar una moto premium</h2>
          <ul className="space-y-3 text-sm list-none pl-0">
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Comprar sin ver la moto en persona</strong>: el estado real no es el de las fotos del anuncio. Las fotografías de producto suelen mostrar la moto en su mejor momento.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Ignorar el historial de mantenimiento</strong>: la ausencia de documentación no significa que no se haya mantenido, pero no hay forma de verificarlo.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">No verificar cargas y deudas</strong>: consultar si la moto tiene cargos pendientes asociados al vehículo evita problemas legales posteriores.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Dejarse llevar solo por el precio</strong>: en este segmento, el precio más bajo suele tener una razón. Investigar esa razón antes de comprar es la diferencia entre una buena operación y una mala inversión.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">No revisar el seguro</strong>: una moto premium necesita una cobertura que refleje su valor real. Revisar las condiciones antes de formalizar la compra es imprescindible.</span>
            </li>
          </ul>
        </section>

        <GuideFaq items={faqItems} />
        <GuideAuthorBox />

      </div>

      <div className="mt-16 pt-10 border-t border-bsm-border space-y-8">
        <div>
          <p className="text-sm text-bsm-text-muted mb-4">Explora el catálogo de motos premium disponibles en Black Label Market.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/motos/deportivas" className="text-sm text-gold hover:text-gold-light transition-colors">Motos deportivas →</Link>
            <Link href="/motos/naked" className="text-sm text-bsm-text-muted hover:text-gold transition-colors">Naked y street →</Link>
            <Link href="/motos/touring" className="text-sm text-bsm-text-muted hover:text-gold transition-colors">Touring y adventure →</Link>
            <Link href="/motos/custom" className="text-sm text-bsm-text-muted hover:text-gold transition-colors">Custom y cruiser →</Link>
            <Link href="/motos/clasicas" className="text-sm text-bsm-text-muted hover:text-gold transition-colors">Clásicas y youngtimers →</Link>
          </div>
        </div>
        <div>
          <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">Guías relacionadas</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/guias/como-comprar-supercar-segunda-mano" className="text-sm text-bsm-text-muted hover:text-gold transition-colors">
              Cómo comprar un supercar de segunda mano →
            </Link>
            <Link href="/glosario" className="text-sm text-bsm-text-muted hover:text-gold transition-colors">
              Glosario del mercado premium →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
