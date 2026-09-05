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
import { JsonLd } from '@/components/seo/JsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

// Fuente única para el FAQPage JSON-LD y el bloque visible de abajo — así no pueden divergir.
// Reescrito 2026-09-02: el precio deja de mostrarse en la web (se explica en la llamada de
// acceso); el resto del contenido y su schema se actualizan en consecuencia.
const FAQ_ITEMS = [
  {
    q: '¿Hay comisión por venta?',
    a: 'No. Pagas solo la suscripción mensual. No cobramos comisión cuando vendes un vehículo.',
  },
  {
    q: '¿La solicitud garantiza el acceso?',
    a: 'No directamente. Antes de admitir un showroom revisamos su reputación, su especialización y cómo presenta el stock — es lo que mantiene el market como una selección, no un clasificado. Si encajas, te invitamos a una llamada breve para resolver dudas y ver las condiciones.',
  },
  {
    q: '¿Cuándo conozco el precio y las condiciones?',
    a: 'En esa llamada, que agendas tú cuando te vaya bien. Ahí repasamos qué plan encaja con tu volumen y tu forma de trabajar, y te explicamos precio, facturación e IVA con calma, no en una tabla genérica.',
  },
  {
    q: '¿Puedo cambiar de plan más adelante?',
    a: 'Sí. Un cambio a un plan superior se aplica de inmediato; a uno inferior, al final del periodo en curso. Tu perfil y tu inventario no se tocan.',
  },
  {
    q: '¿Qué pasa si cancelo?',
    a: 'Mantienes acceso hasta el final del periodo pagado. Después, tu perfil deja de ser público y el inventario queda archivado, no eliminado.',
  },
  {
    q: '¿Qué es un boost?',
    a: 'Un boost posiciona uno de tus vehículos en primer lugar de los resultados de búsqueda durante 7 días, dándole visibilidad extra frente al resto del inventario. Cada plan incluye un número de boosts al mes; si necesitas más, puedes comprarlos desde tu panel.',
  },
] as const

export const metadata: Metadata = {
  title: 'Planes para profesionales — Black Label Market',
  description:
    'Compara Essential, Professional y Elite. Sin comisiones por venta. El acceso pasa por un proceso de admisión — precio y condiciones se explican en una llamada con el equipo.',
  alternates: { canonical: '/profesionales/planes' },
  openGraph: {
    title: 'Planes para profesionales — Black Label Market',
    description: 'Essential, Professional y Elite. Sin comisiones por venta. Acceso sujeto a admisión.',
    url: `${SITE_URL}/profesionales/planes`,
    type: 'website',
  },
}

const ELITE_STATUS_NOTE: Record<string, string | null> = {
  available: null,
  low_availability: 'Quedan pocas plazas Elite disponibles en tu zona ahora mismo.',
  waitlist: 'Elite tiene lista de espera activa en tu zona — te avisamos en cuanto se libere una plaza.',
  closed: 'Sin plazas Elite en tu zona por ahora.',
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

export default async function PlanesPage() {
  const eliteCap = await checkEliteAvailability()
  const eliteNote = ELITE_STATUS_NOTE[eliteCap.status]

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/profesionales/planes`,
    name: 'Planes para profesionales — Black Label Market',
    url: `${SITE_URL}/profesionales/planes`,
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
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />

      {/* Header */}
      <div className="text-center mb-16">
        <nav aria-label="breadcrumb" className="mb-6 flex justify-center">
          <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li><Link href="/profesionales" className="hover:text-gold transition-colors">Para profesionales</Link></li>
            <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
            <li className="text-bsm-text-secondary">Planes</li>
          </ol>
        </nav>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Planes de suscripción</span>
          <div className="h-px w-8 bg-gold" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-4">
          Tu inventario premium, donde merece estar
        </h1>
        <p className="text-bsm-text-secondary max-w-xl mx-auto text-sm leading-relaxed">
          Sin comisiones por venta. El acceso pasa por un proceso de admisión — precio y
          condiciones se explican en una llamada con el equipo, no en esta página.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
                  <span className="font-display text-2xl font-light text-bsm-text-primary">Consulta</span>
                </div>
                <p className="text-xs text-bsm-text-muted">Precio y condiciones, en la llamada de acceso</p>
                {isElite && (
                  <p className="text-[11px] text-bsm-text-muted mt-2 leading-relaxed border-t border-bsm-border pt-2">
                    {ELITE_LIMIT_NOTE}
                    {eliteNote && <span className="block mt-1 text-gold/80">{eliteNote}</span>}
                  </p>
                )}
              </div>

              {/* Ficha completa del plan */}
              <ul className="flex-1">
                {PLAN_FEATURES[plan.slug].map((row) => (
                  <FeatureRow key={row.label} row={row} />
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* CTA único — el plan se elige tras valorar el showroom, no aquí */}
      <div className="border border-bsm-border bg-surface p-8 mb-20 text-center max-w-2xl mx-auto">
        <h3 className="font-display text-xl font-light mb-2">Primero valoramos el encaje del showroom</h3>
        <p className="text-sm text-bsm-text-secondary mb-6 leading-relaxed">
          Envíanos la información de tu showroom. Si cumple los criterios del market, te
          invitamos a una llamada donde vemos juntos qué plan encaja mejor y resolvemos
          precio y condiciones.
        </p>
        <Link href="/profesionales/solicitar-acceso" className="btn-gold px-8">
          Solicitar valoración de mi showroom
        </Link>
      </div>

      {/* Multi-sede */}
      <div className="border border-bsm-border bg-surface p-8 mb-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs text-gold tracking-widest uppercase mb-1">Varias sedes</p>
          <h3 className="font-display text-2xl font-light mb-2">¿Operas más de una sede?</h3>
          <p className="text-sm text-bsm-text-secondary max-w-lg">
            Para grupos con varias sedes preparamos una configuración adaptada a tu estructura,
            tu inventario y tu equipo, sobre la base del plan Elite en cada sede.
          </p>
        </div>
        <Link href="/profesionales/grupos" className="btn-outline px-6 whitespace-nowrap flex-shrink-0">
          Conocer el modelo Grupo →
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
        <p className="text-sm text-bsm-text-muted mb-4">¿Tienes dudas antes de solicitar la valoración?</p>
        <Link href="mailto:hola@blacklabelmarket.es" className="text-gold hover:text-gold-light transition-colors text-sm">
          hola@blacklabelmarket.es →
        </Link>
      </div>
    </div>
  )
}
