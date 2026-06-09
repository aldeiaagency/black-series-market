import Link from 'next/link'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Publica tu vehículo premium — Para profesionales | Black Label Market',
  description: 'Anuncia coches y motos de lujo en el marketplace más selectivo de España. Sin comisiones por venta, compradores cualificados, perfil de showroom completo y analítica de rendimiento.',
  alternates: { canonical: '/para-profesionales' },
}

const BENEFITS = [
  {
    icon: '◈',
    title: 'Sin comisión por venta',
    body: 'Paga solo la suscripción. No te cobramos nada cuando el cliente firma. Tu margen es tuyo.',
  },
  {
    icon: '◈',
    title: 'Compradores cualificados',
    body: 'Nuestro tráfico es específico: alguien que busca un Porsche 911 GT3 no llega aquí por accidente.',
  },
  {
    icon: '◈',
    title: 'Revisión editorial',
    body: 'Cada anuncio pasa por criterios de calidad. El contexto premium protege el valor de tu stock.',
  },
  {
    icon: '◈',
    title: 'Perfil de showroom completo',
    body: 'Página de marca propia, logo, descripción, ubicación y todos tus vehículos en un solo lugar.',
  },
  {
    icon: '◈',
    title: 'Analítica de rendimiento',
    body: 'Visitas por anuncio, leads recibidos, comparativas con tu sector. Información para tomar decisiones.',
  },
  {
    icon: '◈',
    title: 'Leads cualificados',
    body: 'Los interesados contactan directamente desde la ficha. Recibes el mensaje con el vehículo referenciado.',
  },
]

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/para-profesionales#webpage`,
  url: `${SITE_URL}/para-profesionales`,
  name: 'Para profesionales — Black Label Market',
  description: 'Publica coches y motos premium en el marketplace más selectivo de España. Sin comisiones, compradores cualificados, perfil de showroom y analítica.',
  inLanguage: 'es-ES',
  isPartOf: { '@id': `${SITE_URL}/#website` },
}

export default function ParaProfesionalesPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-28 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

      {/* Hero */}
      <div className="max-w-2xl mb-20">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Para profesionales</span>
        </div>
        <h1 className="section-title mb-5">
          Llega a compradores que saben exactamente lo que buscan
        </h1>
        <p className="text-bsm-text-secondary leading-relaxed mb-8">
          Black Label Market es el marketplace de referencia para vehículos premium y de colección en España. Nuestros usuarios no comparan por precio: comparan por especificaciones, historial y presentación. Si tu stock lo merece, este es tu sitio.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/precios" className="btn-gold px-6">
            Ver planes y precios
          </Link>
          <Link href="/registro" className="btn-outline px-6">
            Crear cuenta de showroom
          </Link>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="mb-20">
        <h2 className="font-display text-xl text-bsm-text-primary mb-8">
          Lo que incluye tu presencia en Black Label Market
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="border border-bsm-border bg-surface p-6">
              <span className="text-gold text-lg mb-3 block">{b.icon}</span>
              <h3 className="font-semibold text-bsm-text-primary mb-2 text-sm">{b.title}</h3>
              <p className="text-sm text-bsm-text-muted leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Criteria block */}
      <div className="border border-bsm-border bg-surface p-8 mb-20 max-w-2xl">
        <h2 className="font-display text-lg text-bsm-text-primary mb-4">Criterios de publicación</h2>
        <p className="text-sm text-bsm-text-secondary leading-relaxed mb-4">
          Trabajamos con concesionarios especializados, dealers independientes, coleccionistas particulares profesionales y preparadores que cumplan nuestros estándares de documentación y presentación.
        </p>
        <p className="text-sm text-bsm-text-secondary leading-relaxed mb-4">
          No es un marketplace de volumen. Cada vehículo publicado tiene ficha técnica completa, fotografía de calidad y precio visible. Los anuncios sin información suficiente no se aprueban.
        </p>
        <Link href="/legal/criterios-publicacion" className="text-sm text-gold hover:text-gold-light transition-colors">
          Leer los criterios completos →
        </Link>
      </div>

      {/* CTA final */}
      <div className="border-t border-bsm-border pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-bsm-text-primary font-semibold mb-1">¿Listo para empezar?</p>
          <p className="text-sm text-bsm-text-muted">Configura tu perfil de showroom en menos de 10 minutos.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/precios" className="btn-gold px-6 whitespace-nowrap">
            Ver planes
          </Link>
          <Link href="/registro" className="btn-outline px-6 whitespace-nowrap">
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}
