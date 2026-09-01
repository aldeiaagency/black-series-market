import Link from 'next/link'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Glosario del mercado de vehículos premium',
  description: 'Definiciones esenciales del mercado de coches y motos de lujo y colección: youngtimer, GT, VIN, matching numbers, concours, restomod, barn find y más términos clave.',
  alternates: { canonical: '/glosario' },
}

const TERMS: { term: string; definition: string }[] = [
  {
    term: 'Youngtimer',
    definition: 'Vehículo fabricado entre los años 70 y 90 que aún no tiene la consideración oficial de clásico (generalmente +30 años) pero ya despierta interés de colección por su diseño o relevancia histórica. Son el segmento de mayor crecimiento en valor de los últimos años.',
  },
  {
    term: 'GT (Gran Turismo)',
    definition: 'Categoría de vehículo diseñado para cubrir largas distancias a alta velocidad combinando potencia y confort. Históricamente asociado a carrocerías coupé 2+2. Ejemplos: Ferrari 456 GT, Bentley Continental GT, BMW M8 Gran Coupé.',
  },
  {
    term: 'VIN (Vehicle Identification Number)',
    definition: 'Código alfanumérico de 17 caracteres que identifica unívocamente cada vehículo fabricado. Permite consultar el historial, los propietarios anteriores y los accidentes registrados en las bases de datos disponibles en cada mercado — su cobertura varía según el país y no todos ofrecen acceso público.',
  },
  {
    term: 'Matching numbers',
    definition: 'Condición en la que los números de serie del motor, chasis y carrocería de un vehículo clásico son los originales de fábrica y coinciden con la documentación. Es el criterio más valorado en tasación de coches históricos.',
  },
  {
    term: 'Concours d\'Élégance',
    definition: 'Concurso de elegancia en el que los vehículos se presentan en condición de museo, puntuados por la fidelidad a la configuración original. El más prestigioso es el de Pebble Beach (California). Ganar o clasificar en un concours certifica la calidad de la restauración.',
  },
  {
    term: 'Restomod',
    definition: 'Vehículo clásico con la carrocería y estética originales pero mecánica, suspensión o interiores modernizados. Combina el atractivo visual del clásico con la fiabilidad contemporánea. Diferente a una restauración pura, que conserva todo lo original.',
  },
  {
    term: 'Barn find',
    definition: 'Vehículo de colección descubierto después de años de almacenamiento en un garaje o granero, generalmente en estado original sin restaurar. Su valor reside en la pátina auténtica y la historia intacta. A menudo los barnfinds son más cotizados que piezas restauradas.',
  },
  {
    term: 'Homologación',
    definition: 'Proceso por el cual un fabricante produce un número mínimo de unidades de un vehículo de competición para que sea elegible en un campeonato de motor. Las versiones de homologación (Evo, RS, Works) son generalmente las más buscadas en el mercado clásico.',
  },
  {
    term: 'Book value',
    definition: 'Valor de referencia de un vehículo según guías de tasación reconocidas (Eurotax, Schwacke, Classic Analytics). Sirve como punto de partida en negociaciones y seguros, pero el mercado real puede diferir significativamente en piezas de alta demanda.',
  },
  {
    term: 'COC (Certificate of Conformity)',
    definition: 'Certificado de conformidad europeo emitido por el fabricante que acredita que el vehículo cumple con la legislación europea vigente en el momento de su fabricación. Imprescindible para matricular un vehículo de importación en la Unión Europea.',
  },
  {
    term: 'ITV histórica',
    definition: 'Inspección Técnica de Vehículos para coches con más de 30 años. En España, los vehículos históricos superan la ITV con criterios adaptados a su época de fabricación y tienen una periodicidad diferente a los vehículos convencionales.',
  },
  {
    term: 'Numbers matching',
    definition: 'Ver "Matching numbers". Término equivalente de uso anglosajón habitual en subastas y fichas de vehículos clásicos.',
  },
  {
    term: 'Track day spec',
    definition: 'Configuración de un vehículo deportivo preparado para uso en circuito: suspensión más dura, neumáticos slick o semislick, jaula de seguridad, arneses de competición. Reduce el valor en el mercado de calle pero lo incrementa en el mercado especializado de pista.',
  },
  {
    term: 'Patina',
    definition: 'Apariencia de envejecimiento natural de un vehículo clásico que refleja su historia de uso auténtico: oxidaciones controladas, desgaste de interiores, pintura original con imperfecciones. En el mercado clásico la pátina auténtica puede ser más valiosa que una restauración nueva.',
  },
  {
    term: 'PPF (Paint Protection Film)',
    definition: 'Película de protección de pintura de poliuretano que se aplica sobre la carrocería para protegerla de impactos, arañazos y rayos UV. Estándar en vehículos de alta gama nuevos. Su presencia o ausencia afecta al estado de conservación valorable en la tasación.',
  },
  {
    term: 'Full service history',
    definition: 'Historial de mantenimiento completo con todas las revisiones documentadas desde el primer día. En el segmento premium es un requisito básico; la ausencia de historial descuenta valor de forma significativa en la negociación.',
  },
  {
    term: 'Reserve price',
    definition: 'Precio mínimo confidencial fijado por el vendedor en una subasta por debajo del cual no está obligado a vender aunque se alcance en la puja. Diferente al precio de salida. Cuando el martillo cae "sin reserva" el mejor postor se lleva el vehículo sin condiciones.',
  },
  {
    term: 'Air-cooled',
    definition: 'Motor refrigerado por aire, sin circuito de agua. Asociado especialmente a Porsche (911 hasta 1998), Volkswagen clásico y algunas motos Ducati y BMW de época. Los modelos air-cooled tienen un estatus especial en el mercado de colección por su sonido y comportamiento únicos.',
  },
]

const definedTermSetJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  '@id': `${SITE_URL}/glosario#termset`,
  name: 'Glosario del mercado de vehículos premium y de colección',
  url: `${SITE_URL}/glosario`,
  inLanguage: 'es-ES',
  description: 'Definiciones esenciales del mercado de coches y motos de lujo y colección en España.',
  hasDefinedTerm: TERMS.map((t) => ({
    '@type': 'DefinedTerm',
    name: t.term,
    description: t.definition,
    inDefinedTermSet: `${SITE_URL}/glosario#termset`,
    url: `${SITE_URL}/glosario#${t.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Glosario' },
  ],
}

export default function GlosarioPage() {
  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-12 pt-28 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mb-14">
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary" aria-current="page">Glosario</li>
          </ol>
        </nav>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Guía de referencia</span>
        </div>
        <h1 className="section-title mb-4">Glosario del mercado premium</h1>
        <p className="text-sm text-bsm-text-muted max-w-xl">
          Términos clave para entender el mercado de vehículos de lujo y colección: desde la nomenclatura de subasta hasta los criterios de tasación que marcan la diferencia entre una compra y una inversión.
        </p>
      </div>

      <div className="space-y-0 divide-y divide-bsm-border border border-bsm-border">
        {TERMS.map((t) => (
          <div
            key={t.term}
            id={t.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}
            className="px-6 py-6 hover:bg-surface transition-colors"
          >
            <dt className="font-semibold text-bsm-text-primary mb-2">{t.term}</dt>
            <dd className="text-sm text-bsm-text-secondary leading-relaxed">{t.definition}</dd>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-10 border-t border-bsm-border space-y-10">

        {/* Catalog CTAs */}
        <div>
          <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-5">
            Explorar el catálogo
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/coches/clasicos"
              className="inline-flex items-center gap-2 border border-gold/40 bg-surface px-4 py-2.5 text-sm text-gold hover:border-gold hover:bg-gold/5 transition-all"
            >
              Coches clásicos y youngtimers <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/coches/deportivos"
              className="inline-flex items-center gap-2 border border-bsm-border bg-surface px-4 py-2.5 text-sm text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-all"
            >
              Deportivos y superdeportivos <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/vehiculos-a-la-carta"
              className="inline-flex items-center gap-2 border border-bsm-border bg-surface px-4 py-2.5 text-sm text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-all"
            >
              Solicitar vehículo a la carta <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Related guides */}
        <div>
          <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-5">
            Guías relacionadas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { href: '/guias/como-comprar-supercar-segunda-mano',        label: 'Cómo comprar un supercar de segunda mano' },
              { href: '/guias/como-vender-coche-premium-profesionales',   label: 'Cómo vender un coche premium' },
              { href: '/guias/motos-premium-segunda-mano',                label: 'Cómo comprar una moto premium de segunda mano' },
              { href: '/guias/coches-clasicos-youngtimers-como-invertir', label: 'Coches clásicos y youngtimers como inversión' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between gap-4 border border-bsm-border bg-surface px-4 py-3.5 hover:border-gold/30 hover:bg-gold/3 transition-all"
              >
                <span className="text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors">
                  {label}
                </span>
                <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-sm" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
