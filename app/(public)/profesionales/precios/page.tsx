import Link from 'next/link'
import { Check, Minus } from 'lucide-react'
import type { Metadata } from 'next'
import { checkEliteAvailability } from '@/lib/elite-capacity'
import {
  PLANS,
  COMPARISON_ROWS,
  FOUNDING_MAX_SELLERS,
  ELITE_LIMIT_NOTE,
  formatEUR,
  type PlanDef,
  type ComparisonRow,
} from '@/lib/plans-config'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Precios y planes para profesionales — Black Label Market',
  description:
    'Essential 179 €/mes · Professional 449 €/mes · Elite 899 €/mes. Sin comisiones por venta. Sin permanencia. Precios para concesionarios y especialistas premium.',
  alternates: { canonical: '/profesionales/precios' },
  openGraph: {
    title: 'Precios y planes — Black Label Market',
    description: 'Planes para concesionarios y especialistas premium en España. Sin comisión por venta.',
    url: `${SITE_URL}/profesionales/precios`,
    type: 'website',
  },
}

function renderCell(plan: PlanDef, row: ComparisonRow) {
  const val = plan.values[row.key]

  if (row.type === 'limit') {
    if (typeof val !== 'number') return <span className="text-bsm-text-muted text-sm">—</span>
    if (row.key === 'max_active_vehicles' && val >= 100) {
      return <span className="text-sm text-bsm-text-primary">Hasta {val}</span>
    }
    if (val >= 99 && row.key === 'max_users') {
      return <span className="text-sm text-bsm-text-primary">Sin límite</span>
    }
    return <span className="text-sm text-bsm-text-primary">{val}{row.suffix ?? ''}</span>
  }

  if (val === 'destacado') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] text-gold tracking-widest uppercase border border-gold/30 px-2 py-0.5">
        <Check className="w-3 h-3" /> Destacado
      </span>
    )
  }
  if (val === true) return <Check className="w-4 h-4 text-gold mx-auto" />
  return <Minus className="w-4 h-4 text-bsm-text-muted mx-auto" />
}

const KEY_FEATURE_ROWS = COMPARISON_ROWS.filter(
  (r) => r.type === 'feature' && r.key !== 'verified_profile' && r.key !== 'manual_inventory' && r.key !== 'analytics_basic',
)

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

  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-32 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {PLANS.map((plan) => {
          const isElite = plan.limited
          const isPopular = plan.popular
          const maxVehicles = plan.values.max_active_vehicles as number
          const limitLabel = maxVehicles >= 100 ? 'Hasta 100 vehículos activos' : `Hasta ${maxVehicles} vehículos activos`

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
                <p className="text-xs text-gold">
                  o {formatEUR(plan.foundingPrice)}/mes con condición Founding
                </p>
                <p className="text-xs text-bsm-text-muted mt-2">{limitLabel}</p>
                {isElite && (
                  <p className="text-[11px] text-bsm-text-muted mt-2 leading-relaxed border-t border-bsm-border pt-2">
                    {ELITE_LIMIT_NOTE}
                  </p>
                )}
              </div>

              {/* Key features */}
              <ul className="space-y-2.5 flex-1 mb-8">
                {KEY_FEATURE_ROWS.map((row) => {
                  const val = plan.values[row.key]
                  if (!val) return null
                  return (
                    <li key={row.key} className="flex items-start gap-2.5 text-sm text-bsm-text-secondary">
                      <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      {row.label}
                      {val === 'destacado' && (
                        <span className="ml-1 text-[10px] text-gold tracking-widest uppercase border border-gold/30 px-1.5 py-0.5">Destacado</span>
                      )}
                    </li>
                  )
                })}
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

      {/* Founding note */}
      <div className="border border-gold/20 bg-surface p-6 mb-12 text-center">
        <p className="text-xs text-gold tracking-widest uppercase mb-2">Programa Founding</p>
        <p className="text-sm text-bsm-text-secondary max-w-2xl mx-auto">
          Los primeros {FOUNDING_MAX_SELLERS} profesionales seleccionados acceden a precio Founding
          —mitad de precio— bloqueado de por vida mientras mantengan su suscripción activa.{' '}
          <Link href="/profesionales/founding" className="text-gold hover:text-gold-light underline underline-offset-2">
            Ver condiciones del Founding →
          </Link>
        </p>
      </div>

      {/* Comparison table */}
      <div className="mb-12">
        <h2 className="font-display text-2xl font-light text-center mb-8">Comparativa de planes</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-bsm-border">
                <th className="text-left py-4 px-4 text-xs text-bsm-text-muted font-normal w-2/5" />
                {PLANS.map((plan) => (
                  <th key={plan.slug} className="py-4 px-4 text-center align-bottom">
                    <span className="block text-sm font-medium text-bsm-text-primary">{plan.name}</span>
                    <span className="block font-display text-2xl font-light text-bsm-text-primary mt-1">
                      {plan.monthlyPrice}€<span className="text-xs text-bsm-text-muted font-sans"> /mes</span>
                    </span>
                    <span className="block text-[11px] text-gold mt-0.5">
                      Founding {formatEUR(plan.foundingPrice)}/mes
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-bsm-border/50 hover:bg-surface/60 transition-colors">
                  <td className="py-3 px-4 text-sm text-bsm-text-secondary">{row.label}</td>
                  {PLANS.map((plan) => (
                    <td key={plan.slug} className="py-3 px-4 text-center">
                      {renderCell(plan, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-bsm-text-muted mt-4 text-center max-w-2xl mx-auto">
          {ELITE_LIMIT_NOTE} La sincronización del stock está incluida en Elite y disponible como complemento en los demás planes desde tu panel.
        </p>
      </div>

      {/* Note */}
      <p className="text-center text-xs text-bsm-text-muted mb-16 max-w-2xl mx-auto">
        Precios sin IVA. Las funcionalidades todavía no operativas solo aparecerán como incluidas cuando estén desarrolladas, verificadas y activadas.
      </p>

      {/* Multi-sede */}
      <div className="border border-bsm-border bg-surface p-8 mb-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs text-gold tracking-widest uppercase mb-1">Varias sedes</p>
          <h3 className="font-display text-2xl font-light mb-2">¿Operas más de una sede?</h3>
          <p className="text-sm text-bsm-text-secondary max-w-lg">
            Si gestionas varias ubicaciones o marcas, ponte en contacto con nosotros y te preparamos
            una propuesta a medida con visión consolidada de inventario y oportunidades.
          </p>
        </div>
        <Link href="/profesionales/solicitar-acceso?plan=grupo" className="btn-outline px-6 whitespace-nowrap flex-shrink-0">
          Contactar →
        </Link>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-2xl font-light text-center mb-8">Preguntas frecuentes</h2>
        {[
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
            a: 'No. Todos los perfiles y vehículos pasan verificación editorial previa a la publicación, idéntica para todos los planes.',
          },
          {
            q: '¿Cuándo se activa el plan Founding?',
            a: 'Una vez aprobada tu solicitud, el equipo de Black Label Market te confirma la condición Founding. El precio queda bloqueado mientras mantengas la suscripción activa.',
          },
        ].map(({ q, a }) => (
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
