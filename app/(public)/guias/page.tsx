import Link from 'next/link'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Guías de compra y venta de vehículos premium — Black Label Market',
  description: 'Guías prácticas para comprar y vender coches y motos premium en España: supercars de segunda mano, motos premium, coches clásicos como inversión, venta profesional.',
  alternates: { canonical: '/guias' },
}

const GUIDES = [
  {
    href: '/guias/como-comprar-supercar-segunda-mano',
    title: 'Cómo comprar un supercar de segunda mano',
    desc: 'Inspección, historial, documentación y price discovery para Ferrari, Lamborghini, McLaren y similares. Guía completa para compradores exigentes.',
    tag: 'Compradores · Supercars',
  },
  {
    href: '/guias/motos-premium-segunda-mano',
    title: 'Cómo comprar una moto premium de segunda mano',
    desc: 'Qué verificar, qué documentación exigir y cómo valorar el precio en deportivas, naked, touring, custom y clásicas de moto.',
    tag: 'Compradores · Motos',
  },
  {
    href: '/guias/coches-clasicos-youngtimers-como-invertir',
    title: 'Coches clásicos y youngtimers como inversión',
    desc: 'Qué hace que un clásico se valorice, cómo evaluar una unidad, documentación imprescindible y errores que evitar en el mercado de clásicos en España.',
    tag: 'Inversión · Clásicos',
  },
  {
    href: '/guias/como-vender-coche-premium-profesionales',
    title: 'Cómo vender un coche premium: guía para profesionales',
    desc: 'Estrategia, documentación, precio correcto y canales para dealers, compraventas y especialistas que quieren maximizar el valor de su stock.',
    tag: 'Profesionales · Venta',
  },
]

const collectionPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/guias#page`,
  name: 'Guías del mercado de vehículos premium — Black Label Market',
  description: 'Guías prácticas para comprar y vender coches y motos premium en España.',
  url: `${SITE_URL}/guias`,
  inLanguage: 'es-ES',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  hasPart: GUIDES.map((g) => ({
    '@type': 'Article',
    name: g.title,
    url: `${SITE_URL}${g.href}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Guías' },
  ],
}

export default function GuiasPage() {
  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-12 pt-28 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mb-14">
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary" aria-current="page">Guías</li>
          </ol>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Contenido editorial</span>
        </div>
        <h1 className="section-title mb-4">Guías del mercado premium</h1>
        <p className="text-sm text-bsm-text-muted max-w-xl">
          Recursos prácticos para compradores y profesionales del mercado de vehículos premium y de colección en España.
        </p>
      </div>

      <div className="space-y-0 divide-y divide-bsm-border border border-bsm-border">
        {GUIDES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="group px-6 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface transition-colors"
          >
            <div className="flex-1">
              <p className="text-[10px] text-gold tracking-widest uppercase mb-2">{g.tag}</p>
              <h2 className="text-sm font-semibold text-bsm-text-primary group-hover:text-gold transition-colors mb-1.5">
                {g.title}
              </h2>
              <p className="text-xs text-bsm-text-muted leading-relaxed max-w-xl">{g.desc}</p>
            </div>
            <span className="text-gold text-sm flex-shrink-0 group-hover:text-gold-light transition-colors">→</span>
          </Link>
        ))}
      </div>

      <div className="mt-14 pt-10 border-t border-bsm-border">
        <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-5">
          Explorar el catálogo
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/coches"
            className="inline-flex items-center gap-2 border border-gold/40 bg-surface px-4 py-2.5 text-sm text-gold hover:border-gold hover:bg-gold/5 transition-all"
          >
            Explorar coches <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/motos"
            className="inline-flex items-center gap-2 border border-bsm-border bg-surface px-4 py-2.5 text-sm text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-all"
          >
            Explorar motos <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/vehiculos-a-la-carta"
            className="inline-flex items-center gap-2 border border-bsm-border bg-surface px-4 py-2.5 text-sm text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-all"
          >
            Solicitar a la carta <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/glosario"
            className="inline-flex items-center gap-2 border border-bsm-border bg-surface px-4 py-2.5 text-sm text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-all"
          >
            Glosario del sector <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
