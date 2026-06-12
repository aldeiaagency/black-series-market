import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Precios y planes — Black Label Market',
  description: 'Planes de publicación para concesionarios y especialistas premium. Sin comisiones por venta. Essential 149 €/mes, Professional 349 €/mes, Elite 699 €/mes.',
  alternates: { canonical: '/precios' },
  openGraph: {
    title: 'Precios y planes — Black Label Market',
    description: 'Planes para publicar en el marketplace premium. Essential 149 €, Professional 349 €, Elite 699 €/mes. Sin comisiones por venta.',
    url: 'https://blacklabelmarket.es/precios',
    siteName: 'Black Label Market',
    type: 'website',
  },
}

const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    price: 149,
    slots: 10,
    description: 'Para concesionarios que empiezan en el marketplace',
    features: [
      'Hasta 10 vehículos activos',
      'Perfil de concesionario básico',
      'Gestión de leads centralizada',
      'Analíticas básicas (30 días)',
      'Soporte por email',
    ],
    cta: 'Empezar con Essential',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 349,
    slots: 30,
    popular: true,
    description: 'El más elegido por concesionarios con inventario activo y criterio editorial',
    features: [
      'Hasta 30 vehículos activos',
      'Perfil destacado en resultados de búsqueda',
      'Badge verificado en el marketplace',
      'Analíticas avanzadas',
      'Espacios destacados en portada',
      'Soporte prioritario',
    ],
    cta: 'Empezar con Professional',
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 699,
    slots: 9999,
    description: 'Para los referentes del mercado premium',
    features: [
      'Vehículos ilimitados',
      'Aparición permanente en portada',
      'Showroom Destacado en el marketplace',
      'Analíticas avanzadas de rendimiento y evolución temporal',
      'Account manager dedicado',
      'Acceso a eventos exclusivos Black Series',
    ],
    cta: 'Empezar con Elite',
  },
]

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/precios`,
  name: 'Precios y planes — Black Label Market',
  description: 'Planes de publicación para concesionarios y especialistas premium. Sin comisiones por venta.',
  url: `${SITE_URL}/precios`,
  inLanguage: 'es-ES',
  isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Precios y planes' },
    ],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Hay comisión por venta?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Pagas solo la suscripción mensual. No cobramos comisión cuando vendes un vehículo.' },
    },
    {
      '@type': 'Question',
      name: '¿Puedo cambiar de plan en cualquier momento?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí. Puedes subir o bajar de plan desde tu panel. El cambio se aplica en el siguiente ciclo de facturación.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si cancelo?',
      acceptedAnswer: { '@type': 'Answer', text: 'Tus vehículos se marcarán como inactivos al finalizar el periodo pagado. Sin penalizaciones.' },
    },
    {
      '@type': 'Question',
      name: '¿Los vehículos se publican automáticamente?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Todos los vehículos pasan revisión editorial antes de publicarse (habitualmente en menos de 24 horas laborables).' },
    },
    {
      '@type': 'Question',
      name: '¿Puedo subir fotos en alta resolución?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí. Recomendamos entre 20 y 60 fotografías por vehículo. Hasta 10 MB por imagen, formatos JPG, PNG y WebP.' },
    },
  ],
}

export default function PreciosPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-32 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Planes para concesionarios</span>
          <div className="h-px w-8 bg-gold" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-4">
          Publica tu inventario premium
        </h1>
        <p className="text-bsm-text-secondary max-w-xl mx-auto">
          Sin comisiones por venta. Sin permanencia. Cancela cuando quieras.
          Publica los vehículos, gestiona tus leads y construye tu marca.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-surface border flex flex-col p-8 ${
              plan.popular ? 'border-gold/40' : 'border-bsm-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="badge-gold text-[10px] px-4 py-1.5">Más popular</span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="font-medium text-bsm-text-primary text-xl mb-2">{plan.name}</h2>
              <p className="text-xs text-bsm-text-muted mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-light text-bsm-text-primary">{plan.price}€</span>
                <span className="text-bsm-text-muted">/mes</span>
              </div>
              <p className="text-xs text-bsm-text-muted mt-1">
                {plan.slots === 9999 ? 'Vehículos ilimitados' : `Hasta ${plan.slots} vehículos activos`}
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm text-bsm-text-secondary">
                  <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  {feat}
                </li>
              ))}
            </ul>

            <Link
              href="/registro"
              className={`w-full justify-center ${plan.popular ? 'btn-gold' : 'btn-outline'}`}
            >
              {plan.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {/* Boost puntual */}
      <div className="bg-surface border border-bsm-border p-8 text-center mb-12">
        <h3 className="font-display text-2xl font-light mb-2">Destacado puntual</h3>
        <p className="text-bsm-text-muted mb-4 max-w-lg mx-auto">
          ¿Quieres impulsar un vehículo específico sin cambiar de plan?
          El destacado puntual posiciona tu vehículo en primer lugar durante 7 días.
        </p>
        <div className="font-display text-3xl font-light text-gold mb-4">49€ / 7 días</div>
        <p className="text-xs text-bsm-text-muted">Disponible desde el panel de tu concesionario.</p>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-2xl font-light text-center mb-8">Preguntas frecuentes</h2>
        {[
          { q: '¿Hay comisión por venta?', a: 'No. Pagas solo la suscripción mensual. No cobramos comisión cuando vendes un vehículo.' },
          { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí. Puedes subir o bajar de plan desde tu panel. El cambio se aplica en el siguiente ciclo de facturación.' },
          { q: '¿Qué pasa si cancelo?', a: 'Tus vehículos se marcarán como inactivos al finalizar el periodo pagado. Sin penalizaciones.' },
          { q: '¿Los vehículos se publican automáticamente?', a: 'No. Todos los vehículos pasan revisión editorial antes de publicarse (habitualmente en menos de 24 horas laborables).' },
          { q: '¿Puedo subir fotos en alta resolución?', a: 'Sí. Recomendamos entre 20 y 60 fotografías por vehículo. Hasta 10MB por imagen, formatos JPG, PNG y WebP.' },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-bsm-border py-5">
            <h3 className="font-medium text-bsm-text-primary mb-2">{q}</h3>
            <p className="text-sm text-bsm-text-secondary">{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
