import Link from 'next/link'
import { Check, Minus, Info } from 'lucide-react'
import type { Metadata } from 'next'
import { checkEliteAvailability } from '@/lib/elite-capacity'
import {
  PLANS,
  PLAN_FEATURES,
  ELITE_LIMIT_NOTE,
  type PlanFeatureRow,
} from '@/lib/plans-config'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

// Fuente única para el FAQPage JSON-LD y el bloque visible de abajo — así no pueden divergir
// (hallazgo de auditoría: esta página tenía las preguntas visibles pero sin marcado FAQPage).
const FAQ_ITEMS = [
  {
    q: '¿Hay comisión por venta?',
    a: 'No. Pagas solo la suscripción mensual. No cobramos comisión cuando vendes un vehículo.',
  },
  {
    q: '¿Puedo cambiar de plan?',
    a: 'Sí. Un upgrade es inmediato. Un downgrade se aplica al final del periodo de facturación. Tus datos y vehículos nunca se borran.',
  },
  {
    q: '¿Qué pasa si cancelo?',
    a: 'Accedes hasta el fin del periodo pagado. Después tu perfil deja de ser público y el inventario queda archivado, no eliminado.',
  },
  {
    q: '¿El pago garantiza la publicación?',
    a: 'No. El acceso a Black Label Market requiere pasar nuestro proceso de admisión de calidad y reputación — por eso todos los showrooms publicados aparecen como verificados. Los vehículos deben pertenecer a nuestro catálogo de marcas y modelos seleccionados.',
  },
  {
    q: '¿Los precios incluyen IVA?',
    a: 'No. Todos los precios mostrados son sin IVA; se añade en el momento del pago.',
  },
  {
    q: '¿Qué es un boost?',
    a: 'Un boost posiciona uno de tus vehículos en primer lugar de los resultados de búsqueda durante 7 días, dándole visibilidad extra frente al resto del inventario. Cada plan incluye un número de boosts al mes; si necesitas más, puedes comprarlos desde tu panel.',
  },
] as const

export const metadata: Metadata = {
  title: 'Precios y planes para profesionales — Black Label Market',
  description:
    'Essential 197 €/mes · Professional 449 €/mes · Elite 899 €/mes. Sin comisiones por venta. Sin permanencia. Precios para concesionarios y especialistas premium.',
  alternates: { canonical: '/profesionales/precios' },
  openGraph: {
    title: 'Precios y planes — Black Label Market',
    description: 'Planes para concesionarios y especialistas premium en España. Sin comisión por venta.',
    url: `${SITE_URL}/profesionales/precios`,
    type: 'website',
  },
}

function FeatureRow({ row }: { row: PlanFeatureRow }) {
  return (
    <li className="py-2.5 border-b border-bsm-border/40 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <span className={`text-sm inline-flex items-center gap-1.5 ${row.kind === 'excluded' ? 'text-bsm-text-muted' : 'text-bsm-text-secondary'}`}>
          {row.label}
          {row.info && (
            <span title={row.info} className="inline-flex text-gold/60 hover:text-gold cursor-help">
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </span>
        <span className="flex-shrink-0 pt-0.5">
          {row.kind === 'value' && (
            <span className="text-sm text-bsm-text-primary font-medium whitespace-nowrap">{row.value}</span>
          )}
          {row.kind === 'included' && <Check className="w-4 h-4 text-gold" />}
          {row.kind === 'excluded' && <Minus className="w-4 h-4 text-bsm-text-muted" />}
          {row.kind === 'destacado' && (
            <span className="inline-flex items-center gap-1 text-[10px] text-gold tracking-widest uppercase border border-gold/30 px-1.5 py-0.5 whitespace-nowrap">
              <Check className="w-3 h-3" /> Destacado
            </span>
          )}
        </span>
      </div>
    </li>
  )
}

export default async function PreciosPage() {
  const eliteCap = await checkEliteAvailability()

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/profesionales/precios`,
    name: 'Precios y planes para profesionales — Black Label Market',
    url: `${SITE_URL}/profesionales/precios`,
    inLanguage: 'es-ES',
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-32 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Header */}
      <div className="text-center mb-16">
        <nav aria-label="breadcrumb" className="mb-6 flex justify-center">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li><Link href="/para-profesionales" className="hover:text-gold transition-colors">Para profesionales</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary">Precios</li>
          </ol>
        </nav>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Planes para concesionarios</span>
          <div className="h-px w-8 bg-gold" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-4">
          Tu inventario premium, donde merece estar
        </h1>
        <p className="text-bsm-text-secondary max-w-xl mx-auto text-sm leading-relaxed">
          Sin comisiones por venta. Sin permanencia.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {PLANS.map((plan) => {
          const isElite = plan.limited
          const isPopular = plan.popular

          return (
            <div
              key={plan.slug}
              className={`relative bg-surface border flex flex-col p-8 ${
                isPopular ? 'border-gold/40' : 'border-bsm-border'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="badge-gold text-[10px] px-4 py-1.5">Más popular</span>
                </div>
              )}
              {isElite && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="badge-gold text-[10px] px-4 py-1.5">Plazas limitadas</span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="font-medium text-bsm-text-primary text-xl mb-1">{plan.name}</h2>
                <p className="text-xs text-bsm-text-muted mb-4">{plan.tagline}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-5xl font-light text-bsm-text-primary">{plan.monthlyPrice}€</span>
                  <span className="text-bsm-text-muted text-sm">/mes</span>
                </div>
                <p className="text-xs text-bsm-text-muted">+ IVA</p>
                {isElite && (
                  <p className="text-[11px] text-bsm-text-muted mt-2 leading-relaxed border-t border-bsm-border pt-2">
                    {ELITE_LIMIT_NOTE}
                  </p>
                )}
              </div>

              {/* Ficha completa del plan */}
              <ul className="flex-1 mb-8">
                {PLAN_FEATURES[plan.slug].map((row) => (
                  <FeatureRow key={row.label} row={row} />
                ))}
              </ul>

              {isElite ? (
                <Link
                  href={eliteCap.ctaHref}
                  className={`w-full justify-center text-center ${eliteCap.status === 'closed' ? 'btn-outline opacity-60 pointer-events-none' : 'btn-gold'}`}
                >
                  {eliteCap.ctaLabel}
                </Link>
              ) : (
                <Link
                  href={`/profesionales/solicitar-acceso?plan=${plan.slug}`}
                  className={`w-full justify-center text-center ${isPopular ? 'btn-gold' : 'btn-outline'}`}
                >
                  Solicitar {plan.name}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Multi-sede */}
      <div className="border border-bsm-border bg-surface p-8 mb-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs text-gold tracking-widest uppercase mb-1">Varias sedes</p>
          <h3 className="font-display text-2xl font-light mb-2">¿Operas más de una sede?</h3>
          <p className="text-sm text-bsm-text-secondary max-w-lg">
            Cuenta matriz Elite + 50% del precio base por cada sede adicional, con las condiciones de
            Elite en cada una (100 vehículos, 10 usuarios, 3 boosts, stock automatizado) y visión
            consolidada para la dirección del grupo. <strong className="text-bsm-text-primary">Desde 1.348,50 €/mes</strong> (2 sedes) —
            a partir de 4 sedes, condiciones a medida.
          </p>
        </div>
        <Link href="/profesionales/solicitar-acceso?plan=grupo" className="btn-outline px-6 whitespace-nowrap flex-shrink-0">
          Contactar →
        </Link>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-2xl font-light text-center mb-8">Preguntas frecuentes</h2>
        {FAQ_ITEMS.map(({ q, a }) => (
          <div key={q} className="border-b border-bsm-border py-5">
            <h3 className="font-medium text-bsm-text-primary mb-2">{q}</h3>
            <p className="text-sm text-bsm-text-secondary">{a}</p>
          </div>
        ))}
      </div>

      {/* CTA final */}
      <div className="mt-16 text-center">
        <p className="text-sm text-bsm-text-muted mb-4">¿Tienes dudas antes de solicitar acceso?</p>
        <Link href="mailto:hola@blacklabelmarket.es" className="text-gold hover:text-gold-light transition-colors text-sm">
          hola@blacklabelmarket.es →
        </Link>
      </div>
    </div>
  )
}
