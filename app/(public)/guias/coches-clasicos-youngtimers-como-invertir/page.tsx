import Link from 'next/link'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Coches clásicos y youngtimers como inversión — Guía práctica',
  description: 'Guía para invertir en coches clásicos y youngtimers: qué factores determinan la valorización, cómo evaluar una unidad, documentación imprescindible y errores que evitar en España.',
  alternates: { canonical: '/guias/coches-clasicos-youngtimers-como-invertir' },
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${SITE_URL}/guias/coches-clasicos-youngtimers-como-invertir#article`,
  headline: 'Coches clásicos y youngtimers como inversión: guía práctica',
  description: 'Guía para invertir en coches clásicos y youngtimers: factores de valorización, evaluación de unidades, documentación y errores comunes en España.',
  url: `${SITE_URL}/guias/coches-clasicos-youngtimers-como-invertir`,
  inLanguage: 'es-ES',
  publisher: { '@type': 'Organization', name: 'Black Label Market', url: SITE_URL, '@id': `${SITE_URL}/#organization` },
  author: { '@type': 'Organization', name: 'Black Label Market', url: SITE_URL, '@id': `${SITE_URL}/#organization` },
  datePublished: '2026-06-09',
  dateModified: '2026-06-09',
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Guías' },
    { '@type': 'ListItem', position: 3, name: 'Coches clásicos como inversión' },
  ],
}

export default function GuiaClasicosPage() {
  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-12 pt-28 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mb-12">
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary">Guías</li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary" aria-current="page">Coches clásicos como inversión</li>
          </ol>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Guía de inversión</span>
        </div>
        <h1 className="section-title mb-4">Coches clásicos y youngtimers como inversión</h1>
        <p className="text-sm text-bsm-text-muted">Por el equipo editorial de Black Label Market · Junio 2026</p>
      </div>

      <div className="space-y-10 text-bsm-text-secondary leading-relaxed">

        <section>
          <p className="text-base leading-relaxed mb-4">
            Los coches clásicos y youngtimers se han convertido en una clase de activo reconocida por inversores privados, family offices y gestores de patrimonio en todo el mundo. A diferencia de otras inversiones alternativas, un clásico bien elegido combina potencial de revalorización con un disfrute real y tangible. Pero como todo activo especializado, el mercado tiene sus propias reglas y sus propios riesgos.
          </p>
          <p className="text-sm leading-relaxed">
            Esta guía recoge los criterios que distinguen una buena operación de una decisión costosa en el mercado de coches clásicos y youngtimers en España.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">1. Clásico vs. youngtimer: diferencias y oportunidades</h2>
          <p className="text-sm leading-relaxed mb-4">
            En España, un vehículo adquiere la consideración oficial de vehículo histórico a partir de los 30 años de antigüedad. Sin embargo, el mercado reconoce dos segmentos distintos con dinámicas de valorización diferentes:
          </p>
          <ul className="space-y-3 text-sm list-none pl-0 mb-4">
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Clásicos puros</strong>: más de 30-40 años, protección fiscal como vehículo histórico, valor consolidado. Ferrari 308, Porsche 911 Carrera 3.2, Mercedes 300 SL. El mercado es más maduro y los precios más estables.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Youngtimers</strong>: entre 15 y 30 años, sin protección fiscal todavía pero con interés de colección creciente. BMW E30 M3, Porsche 993, Honda NSX, Lancia Delta Integrale. Son el segmento de mayor crecimiento relativo en los últimos años: precios accesibles hoy con alta probabilidad de revalorización.</span>
            </li>
          </ul>
          <p className="text-sm leading-relaxed">
            La diferencia no es solo de precio: es de liquidez, de mercado comprador y de perfil de riesgo. Los youngtimers tienen un mercado más joven y activo digitalmente; los clásicos puros se mueven más en subastas y redes especializadas.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">2. Qué factores determinan la valorización</h2>
          <p className="text-sm leading-relaxed mb-4">
            No todos los coches clásicos se revalorizan. Los factores que más influyen en el comportamiento del precio a medio y largo plazo son:
          </p>
          <ul className="space-y-3 text-sm list-none pl-0">
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Escasez y demanda cultural</strong>: los modelos que marcan una generación tienen una base de compradores que crece a medida que ese grupo etario alcanza capacidad de compra. El Porsche 993 es el ejemplo más claro de esta dinámica.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Matching numbers</strong>: que el motor, chasis y carrocería lleven los números de serie originales de fábrica es el criterio técnico más valorado en la tasación de clásicos. Un vehículo con motor sustituto puede valer entre un 30 y un 50 % menos.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Historial documentado</strong>: un clásico con historial de propietarios trazable, revisiones documentadas y, si es posible, factura de primer propietario, tiene una prima de mercado significativa.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Color y opcionales originales</strong>: en el mundo de los clásicos las combinaciones originales de color exterior, interior y opcionales tienen más valor que los repaints o los cambios de especificación. Documentar la configuración de fábrica con la tarjeta Kardex (Porsche) o similar es un activo en la venta.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Estado de conservación</strong>: en general, un clásico sin restaurar pero en buen estado original (patina auténtica) vale más que uno restaurado sin documentación del proceso. Las restauraciones de alta calidad, acreditadas y con facturación completa, son una excepción.</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">3. Cómo evaluar una unidad antes de comprar</h2>
          <p className="text-sm leading-relaxed mb-4">
            La evaluación de un clásico es más compleja que la de un vehículo moderno. Estos son los pasos fundamentales:
          </p>

          <h3 className="font-semibold text-bsm-text-primary text-sm mb-2">Inspección técnica especializada</h3>
          <p className="text-sm leading-relaxed mb-4">
            Encargar una inspección a un especialista en la marca concreta es una inversión habitual en operaciones de clásicos por encima de 30.000 euros. El coste de una inspección experta (entre 200 y 500 euros dependiendo del modelo) es insignificante comparado con el riesgo de descubrir problemas estructurales o mecánicos después de la compra.
          </p>

          <h3 className="font-semibold text-bsm-text-primary text-sm mb-2">Verificación del número de bastidor</h3>
          <p className="text-sm leading-relaxed mb-4">
            Contrastar el número de bastidor con los registros del fabricante (cuando sea posible) y con la documentación del vehículo es el primer paso para detectar posibles irregularidades. Algunos fabricantes como Porsche, Ferrari o BMW ofrecen servicios de certificación histórica.
          </p>

          <h3 className="font-semibold text-bsm-text-primary text-sm mb-2">Historial de propietarios</h3>
          <p className="text-sm leading-relaxed">
            Cuantos menos propietarios y más documentados, mejor. Un clásico con un solo propietario desde nuevo, con toda la documentación original, puede alcanzar una prima de hasta el 30 % sobre unidades equivalentes con historial fragmentado.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">4. El mercado español en contexto europeo</h2>
          <p className="text-sm leading-relaxed mb-4">
            España tiene un mercado de clásicos relativamente activo, pero todavía por debajo de Alemania, Francia o el Reino Unido en volumen y sofisticación. Esto genera oportunidades: hay vehículos bien conservados que no han pasado por el filtro de los mercados más maduros y cuyos propietarios no conocen el valor real que tendrían en una subasta internacional.
          </p>
          <p className="text-sm leading-relaxed mb-4">
            Las referencias de precio más fiables para el mercado europeo son las realizadas en subastas reconocidas: RM Sotheby&apos;s, Gooding &amp; Company, Artcurial, Bonhams y H&amp;H Classics. Seguir sus resultados públicos permite calibrar el valor real de lo que el mercado privado ofrece.
          </p>
          <p className="text-sm leading-relaxed">
            La fiscalidad española trata los vehículos históricos de forma favorable en términos de impuesto de circulación, pero la tributación de la ganancia patrimonial en la venta sigue las reglas generales del IRPF. Consultar con un asesor fiscal especializado es recomendable en operaciones de cierta entidad.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-light text-bsm-text-primary mb-4">5. Errores habituales del comprador de clásicos</h2>
          <ul className="space-y-3 text-sm list-none pl-0">
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Comprar por emoción sin verificar</strong>: los clásicos generan un apego emocional que puede nublar el análisis racional. La inspección técnica y documental es obligatoria independientemente del entusiasmo del comprador.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Subestimar los costes de mantenimiento</strong>: un clásico puede tener un precio de compra razonable y unos costes de mantenimiento elevados. Las piezas de algunos modelos son escasas y caras; el trabajo de taller especializado no es barato.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">No verificar la legalidad de modificaciones</strong>: una modificación no homologada puede generar problemas en la ITV histórica, en el seguro y en la eventual venta.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">Restaurar sin documentar</strong>: una restauración de alta calidad aumenta el valor; una restauración sin documentación fotográfica, facturas y especificación de materiales puede generar dudas en compradores futuros y reducir la prima de mercado.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold flex-shrink-0">◈</span>
              <span><strong className="text-bsm-text-primary">No asegurar a valor acordado</strong>: el seguro de un clásico debe reflejar su valor de mercado real, no su valor venal. Los seguros de vehículos históricos con valor acordado son específicos para este tipo de activo.</span>
            </li>
          </ul>
        </section>

      </div>

      <div className="mt-16 pt-10 border-t border-bsm-border space-y-8">
        <div>
          <p className="text-sm text-bsm-text-muted mb-4">Explora el catálogo de coches clásicos disponibles en Black Label Market.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/coches/clasicos" className="text-sm text-gold hover:text-gold-light transition-colors">
              Coches clásicos y youngtimers →
            </Link>
            <Link href="/vehiculos-a-la-carta" className="text-sm text-bsm-text-muted hover:text-gold transition-colors">
              Solicitar clásico a la carta →
            </Link>
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
