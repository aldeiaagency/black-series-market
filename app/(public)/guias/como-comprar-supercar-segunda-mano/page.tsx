import Link from 'next/link'
import type { Metadata } from 'next'
import { GuideAuthorBox, GuideFaq, GuideHeroImage, GuideToc, type FaqItem, type TocItem } from '../_components/GuideSeoBlocks'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'
const PAGE_PATH = '/guias/como-comprar-supercar-segunda-mano'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const HERO_IMAGE = '/images/guides/comprar-supercar-segunda-mano.webp'
const HERO_IMAGE_URL = `${SITE_URL}${HERO_IMAGE}`
const PUBLISHED_DATE = '2026-06-09'
const MODIFIED_DATE = '2026-06-16'
const HERO_ALT = 'Porsche GT3 RS y Ducati premium en un entorno editorial de Black Label Market'

export const metadata: Metadata = {
  title: 'Cómo comprar un supercar de segunda mano en España',
  description: 'Guía completa para comprar un supercar, deportivo de alta gama o coche de colección de segunda mano en España: qué verificar, dónde buscar, cómo valorar el precio y qué errores evitar.',
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: 'Cómo comprar un supercar de segunda mano en España',
    description: 'Checklist experto para comprar Ferrari, Porsche GT, McLaren o Lamborghini usados: historial, inspección, precio, importación y vendedor fiable.',
    type: 'article',
    url: PAGE_PATH,
    images: [{ url: HERO_IMAGE, width: 1200, height: 675, alt: HERO_ALT }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cómo comprar un supercar de segunda mano en España',
    description: 'Qué revisar antes de comprar un supercar usado: historial, inspección, precio, importación y vendedor.',
    images: [HERO_IMAGE],
  },
}

const faqItems: FaqItem[] = [
  {
    question: '¿Qué documentación debo pedir antes de comprar un supercar usado?',
    answer: 'Debes pedir permiso de circulación, ficha técnica, historial de ITV, libro de mantenimiento, facturas de revisiones, informes de daños o siniestros y, si es importado, COC y documentación de matriculación. En deportivos de alto valor, la ausencia de historial completo debe reflejarse en el precio.',
  },
  {
    question: '¿Merece la pena hacer una inspección pre-compra independiente?',
    answer: 'Sí. En un supercar, una inspección pre-compra por un especialista independiente ayuda a detectar desgaste oculto, reparaciones mal documentadas, uso intensivo en circuito o mantenimiento pendiente. Su coste suele ser pequeño frente al riesgo económico de una mala compra.',
  },
  {
    question: '¿Es mejor comprar a un particular o a un especialista verificado?',
    answer: 'Un particular puede ofrecer una buena unidad, pero un especialista verificado aporta trazabilidad, experiencia en el modelo, documentación ordenada y una relación comercial más transparente. En vehículos premium, la confianza del vendedor forma parte del valor real de la operación.',
  },
  {
    question: '¿Qué marcas entran normalmente en la categoría supercar?',
    answer: 'En el mercado español suelen considerarse supercars los modelos de Ferrari, Lamborghini, McLaren, Porsche GT, Bugatti, Koenigsegg, Pagani y algunas versiones AMG, Audi RS o BMW M muy prestacionales. La clave no es solo la marca, sino prestaciones, rareza, precio y demanda.',
  },
]

const tocItems: TocItem[] = [
  { href: '#definicion-supercar', label: 'Qué define a un supercar' },
  { href: '#errores-compra', label: 'Errores habituales' },
  { href: '#checklist-oferta', label: 'Checklist antes de ofertar' },
  { href: '#importacion-europa', label: 'Importación europea' },
  { href: '#valorar-precio', label: 'Cómo valorar el precio' },
  { href: '#vendedor-fiable', label: 'Vendedor y confianza' },
  { href: '#faq', label: 'Preguntas frecuentes' },
]

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${SITE_URL}/guias/como-comprar-supercar-segunda-mano#article`,
  headline: 'Cómo comprar un supercar de segunda mano en España',
  description: 'Guía completa para comprar un supercar, deportivo de alta gama o coche de colección de segunda mano en España.',
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
    { '@type': 'ListItem', position: 3, name: 'Cómo comprar un supercar de segunda mano' },
  ],
}

export default function GuiaCompraSupercarPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 lg:px-8 pt-28 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav aria-label="breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
          <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li className="text-bsm-text-muted">Guías</li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li className="text-bsm-text-secondary" aria-current="page">Comprar un supercar</li>
        </ol>
      </nav>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-px w-8 bg-gold" />
        <span className="text-xs text-gold tracking-widest uppercase">Guía de comprador</span>
      </div>

      <h1 className="font-display text-3xl lg:text-4xl font-light text-bsm-text-primary mb-4 leading-tight">
        Cómo comprar un supercar de segunda mano en España
      </h1>
      <p className="text-bsm-text-muted text-sm mb-12">
        Por el equipo editorial de Black Label Market · Actualizado en junio de 2026
      </p>

      <GuideHeroImage src={HERO_IMAGE} alt={HERO_ALT} />
      <GuideToc items={tocItems} />

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-bsm-text-secondary leading-relaxed">

        <p>
          Comprar un <Link href="/marcas/ferrari">Ferrari</Link>, un <Link href="/marcas/porsche">Porsche GT3</Link>, un <Link href="/marcas/mclaren">McLaren</Link> o un <Link href="/marcas/lamborghini">Lamborghini</Link> de segunda mano no es como comprar un coche convencional. Las reglas cambian: el vendedor importa tanto como el vehículo, la documentación puede doblar el valor, y pagar de más o de menos son dos errores igualmente costosos. Esta guía recoge lo que debes saber antes de hacer una oferta.
        </p>

        <section id="definicion-supercar">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Qué define a un supercar en el mercado actual</h2>
          <p>
            No existe una definición oficial, pero en la práctica el término agrupa coches con prestaciones por encima de 400 CV, aceleración de 0 a 100 km/h en menos de 4 segundos y un precio nuevo superior a los 150.000 €. Ferrari, Lamborghini, McLaren, Porsche (gama GT), <Link href="/marcas/bugatti">Bugatti</Link>, <Link href="/marcas/koenigsegg">Koenigsegg</Link> y algunos modelos de AMG, <Link href="/marcas/bmw">BMW M</Link> y <Link href="/marcas/audi">Audi RS</Link> entran en esta categoría.
          </p>
          <p>
            El mercado de segunda mano de este segmento tiene sus propias dinámicas: algunos modelos se aprecian con el tiempo (especialmente los de producción limitada y los air-cooled), otros pierden valor rápidamente los primeros años y después se estabilizan, y unos pocos pueden hundirse en valor si tienen historial de accidentes o mantenimiento deficiente.
          </p>
        </section>

        <section id="errores-compra">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Los errores más comunes al comprar un supercar</h2>
          <p>
            El primer error es comprar por imagen: un supercar puede tener un aspecto impecable y estar en pésimas condiciones mecánicas. La puesta a punto de estos vehículos es cara y compleja; una revisión completa en un taller oficial puede costar entre 3.000 y 15.000 € dependiendo del modelo y el tiempo que lleve sin pasar por el concesionario.
          </p>
          <p>
            El segundo error es no verificar el historial de ITV, revisiones y siniestros. En España, el historial de ITV es público y gratuito a través de la DGT. El informe Carfax o equivalente europeo para vehículos de importación es imprescindible. Un vehículo con un siniestro grave registrado puede perder entre el 20 y el 40 % de su valor respecto a uno sin incidencias.
          </p>
          <p>
            El tercer error es fiarse de vendedores no especializados. Un particular puede no conocer el historial real del vehículo, no tener la documentación completa o no estar en condiciones de garantizar la información que proporciona.
          </p>
        </section>

        <section id="checklist-oferta">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Qué debes comprobar antes de hacer una oferta</h2>
          <ul className="list-none space-y-3">
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Numbers matching</strong>: motor, chasis y carrocería deben corresponder a los documentos originales del fabricante. En coches de colección, este punto es crítico para la tasación.</span></li>
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Libro de mantenimiento completo</strong> (full service history): cada revisión en su fecha y kilometraje, preferiblemente con sello de taller oficial. La ausencia de varias revisiones es un descuento justificado en el precio.</span></li>
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Inspección pre-compra por especialista independiente</strong>: no el taller del vendedor. Para coches de más de 80.000 €, una inspección externa de 300-600 € puede ahorrarte decenas de miles.</span></li>
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Estado de neumáticos y frenos</strong>: en un deportivo de altas prestaciones, la sustitución de neumáticos (especialmente slick o semi-slick) puede costar 2.000-4.000 € el juego. Los frenos de carbono cerámicos, entre 8.000 y 20.000 €.</span></li>
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Historial de uso en pista</strong>: un coche sometido a sesiones de track day tiene un desgaste estructural diferente al de un vehículo de carretera. Pregunta directamente y contrasta con el estado de los componentes de desgaste.</span></li>
            <li className="flex gap-3"><span className="text-gold flex-shrink-0">—</span><span><strong className="text-bsm-text-primary font-medium">Configuración original vs modificaciones</strong>: las modificaciones no autorizadas por el fabricante pueden afectar a la garantía, al seguro y, sobre todo, al valor de reventa. Un vehículo de configuración original vale más.</span></li>
          </ul>
        </section>

        <section id="importacion-europa">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">La importación desde otros países europeos</h2>
          <p>
            Alemania, Bélgica y Reino Unido (pre-Brexit) han sido históricamente mercados con mayor oferta y, en algunos casos, precios más bajos para modelos de alta gama. La importación desde la UE no tiene aranceles, pero sí tiene implicaciones:
          </p>
          <p>
            El vehículo debe pasar una ITV de importación en España. Si viene de un país con diferente ciclo de homologación de emisiones (por ejemplo, el UK tiene ciclos distintos tras el Brexit), la matriculación puede complicarse. El COC (Certificate of Conformity) es el documento clave: sin él, la matriculación puede ser imposible o muy costosa.
          </p>
          <p>
            Los coches de importación de fuera de la UE tributan IVA y aranceles al entrar en España. Un Ferrari importado de Estados Unidos, por ejemplo, tendrá un recargo de aproximadamente el 10 % en aranceles más el 21 % de IVA sobre su valor en aduana.
          </p>
        </section>

        <section id="valorar-precio">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Cómo valorar el precio de un supercar usado</h2>
          <p>
            Las guías de tasación convencionales (Eurotax, Schwacke) son un punto de partida, pero el mercado real de supercars y coches de colección tiene sus propias referencias: los resultados de subastas internacionales (RM Sotheby&apos;s, Bonhams, Artcurial), los precios de portales especializados europeos y, sobre todo, las transacciones recientes de modelos comparables con especificaciones similares.
          </p>
          <p>
            Variables que suben el precio: colores factory raros, opciones de fábrica exclusivas (carbono, titanio, interiores personalizados), kilometraje bajo en un modelo moderno, historial completo en taller oficial, y certificados de procedencia o concours results.
          </p>
          <p>
            Variables que bajan el precio: kilometraje alto en modelos con mantenimiento caro, pinturas no originales, falta de historial, accidentes registrados, neumáticos o frenos al límite de vida útil, y modificaciones estéticas o mecánicas no reversibles.
          </p>
        </section>

        <section id="vendedor-fiable">
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-3">Por qué el vendedor importa tanto como el coche</h2>
          <p>
            En el mercado de vehículos premium, la confianza en el vendedor es inseparable del valor del producto. Un concesionario especializado que conoce cada modelo en profundidad, que puede verificar y documentar el historial y que tiene reputación que proteger, ofrece una garantía implícita que un anuncio anónimo en una plataforma generalista no puede dar.
          </p>
          <p>
            En Black Label Market trabajamos exclusivamente con concesionarios y especialistas verificados. Cada vendedor pasa por un proceso de revisión editorial antes de publicar, y cada anuncio debe cumplir estándares de documentación y presentación. No es volumen: es curación.
          </p>
        </section>

        <GuideFaq items={faqItems} />
        <GuideAuthorBox />

        <div className="pt-10 border-t border-bsm-border">
          <p className="text-sm text-bsm-text-muted mb-5">
            ¿Buscas un supercar o deportivo de alta gama en España con estas garantías?
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/coches/deportivos" className="btn-gold text-sm px-5">
              Ver deportivos y superdeportivos
            </Link>
            <Link href="/vehiculos-a-la-carta" className="btn-outline text-sm px-5">
              Solicitar un vehículo a la carta
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
