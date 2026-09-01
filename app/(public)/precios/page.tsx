import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Precios y planes — Black Label Market',
  description: 'Planes de publicación para showrooms y especialistas premium. Sin comisiones por venta. Essential 197 €/mes, Professional 449 €/mes, Elite 899 €/mes.',
  alternates: { canonical: '/precios' },
  openGraph: {
    title: 'Precios y planes — Black Label Market',
    description: 'Planes para publicar en el marketplace premium. Essential 197 €, Professional 449 €, Elite 899 €/mes. Sin comisiones por venta.',
    url: 'https://blacklabelmarket.es/precios',
    siteName: 'Black Label Market',
    type: 'website',
  },
}

const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    price: 197,
    slots: 15,
    description: 'Presencia premium para empezar en el marketplace',
    features: [
      'Hasta 15 vehículos publicados',
      'Perfil verificado',
      'Alta Premium incluida',
      'Bandeja de oportunidades',
      'Analítica básica 30 días',
    ],
    cta: 'Empezar con Essential',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 449,
    slots: 50,
    popular: true,
    description: 'El más elegido por concesionarios con inventario activo y criterio editorial',
    features: [
      'Hasta 50 vehículos publicados',
      '3 usuarios',
      'Carga manual + CSV recurrente',
      'Pipeline de oportunidades',
      'Analítica avanzada 180 días',
      'Agente de cualificación',
      '1 boost mensual',
    ],
    cta: 'Empezar con Professional',
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 899,
    slots: 100,
    description: 'Para los referentes del mercado premium',
    features: [
      'Hasta 100 vehículos publicados',
      '10 usuarios',
      'Stock automatizado incluido',
      'Showroom Destacado en el marketplace',
      'Analítica Elite 365 días',
      'Ventana exclusiva 24 h en vehículos a la carta',
      '3 boosts mensuales',
    ],
    cta: 'Empezar con Elite',
  },
]

const GRUPO = {
  name: 'Grupo',
  description: 'Para grupos con varias sedes — cada sede con las condiciones de Elite.',
  priceFrom: '1.348,50',
  features: [
    'Cuenta matriz Elite + 50% del precio base por cada sede adicional',
    'Cada sede con las condiciones de Elite: 100 vehículos, 10 usuarios, 3 boosts, stock automatizado',
    'Vista consolidada de todas las sedes para la dirección del grupo',
    'A partir de 4 sedes, condiciones a medida',
  ],
}

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
      name: '¿Puedo subir fotos en alta resolución?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sí. Recomendamos entre 20 y 60 fotografías por vehículo. Hasta 10 MB por imagen, formatos JPG, PNG y WebP.' },
    },
  ],
}

export default function PreciosPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-32 pb-20">
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />
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
                {`Hasta ${plan.slots} vehículos publicados`}
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

      {/* Grupo — varias sedes, condiciones a medida a partir de 4 */}
      <div className="bg-surface border border-bsm-border p-8 mb-16">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="md:flex-1">
            <h2 className="font-medium text-bsm-text-primary text-xl mb-2">{GRUPO.name}</h2>
            <p className="text-xs text-bsm-text-muted mb-4">{GRUPO.description}</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xs text-bsm-text-muted">Desde</span>
              <span className="font-display text-4xl font-light text-bsm-text-primary">{GRUPO.priceFrom}€</span>
              <span className="text-bsm-text-muted">/mes</span>
            </div>
            <ul className="space-y-2.5">
              {GRUPO.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm text-bsm-text-secondary">
                  <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:w-56 flex-shrink-0">
            <Link
              href="/profesionales/solicitar-acceso?plan=grupo"
              className="btn-outline w-full justify-center"
            >
              Contactar con ventas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
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
