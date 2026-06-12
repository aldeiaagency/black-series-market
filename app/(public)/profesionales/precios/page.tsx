import Link from 'next/link'
import { Check, Minus } from 'lucide-react'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { checkEliteAvailability } from '@/lib/elite-capacity'

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

type Plan = {
  id: string
  slug: string
  name: string
  monthly_price: number | null
  annual_price: number | null
  founding_monthly_price: number | null
  sort_order: number
  plan_limits: { key: string; value_number: number | null }[]
  plan_features: {
    feature_key: string
    included: boolean
    availability_status: string
    public_visible: boolean
    display_label: string | null
  }[]
}

// Features shown in the public comparison table (in order)
const COMPARISON_FEATURES = [
  { key: 'max_active_vehicles',   label: 'Vehículos activos', isLimit: true },
  { key: 'max_users',             label: 'Usuarios', isLimit: true },
  { key: 'verified_profile',      label: 'Perfil verificado', isLimit: false },
  { key: 'manual_inventory',      label: 'Inventario manual', isLimit: false },
  { key: 'csv_recurring',         label: 'Importación CSV recurrente', isLimit: false },
  { key: 'opportunities_inbox',   label: 'Bandeja de oportunidades', isLimit: false },
  { key: 'pipeline',              label: 'Pipeline kanban', isLimit: false },
  { key: 'analytics_basic',       label: 'Analítica básica', isLimit: false },
  { key: 'analytics_retention_days', label: 'Historial analítico', isLimit: true, suffix: ' días' },
  { key: 'analytics_advanced',    label: 'Analítica avanzada', isLimit: false },
  { key: 'vehicles_on_request',   label: 'Vehículos a la carta', isLimit: false },
  { key: 'showroom_featured',     label: 'Showroom Destacado', isLimit: false },
  { key: 'showroom_listing_priority', label: 'Prioridad en listados', isLimit: false },
]

async function getPlansFromDB(): Promise<Plan[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('plans')
    .select(`
      id, slug, name, monthly_price, annual_price, founding_monthly_price, sort_order,
      plan_limits(key, value_number),
      plan_features(feature_key, included, availability_status, public_visible, display_label)
    `)
    .in('slug', ['essential', 'professional', 'elite'])
    .eq('status', 'active')
    .order('sort_order')

  return (data ?? []) as Plan[]
}

function getLimitValue(plan: Plan, key: string): number | null {
  return plan.plan_limits?.find((l) => l.key === key)?.value_number ?? null
}

function getFeature(plan: Plan, key: string) {
  return plan.plan_features?.find((f) => f.feature_key === key)
}

function renderCell(plan: Plan, row: typeof COMPARISON_FEATURES[0]) {
  if (row.isLimit) {
    const val = getLimitValue(plan, row.key)
    if (val === null) return <span className="text-bsm-text-muted text-sm">—</span>
    if (val >= 99) return <span className="text-sm text-bsm-text-primary">Sin límite</span>
    return <span className="text-sm text-bsm-text-primary">{val}{row.suffix ?? ''}</span>
  }
  const feat = getFeature(plan, row.key)
  if (!feat || !feat.public_visible) return <Minus className="w-4 h-4 text-bsm-text-muted mx-auto" />
  if (feat.included && feat.availability_status === 'operative') {
    return <Check className="w-4 h-4 text-gold mx-auto" />
  }
  if (feat.included && feat.availability_status === 'partial') {
    return <span className="text-[10px] text-gold uppercase tracking-wide">Parcial</span>
  }
  return <Minus className="w-4 h-4 text-bsm-text-muted mx-auto" />
}

export default async function PreciosPage() {
  const [plans, eliteCap] = await Promise.all([
    getPlansFromDB(),
    checkEliteAvailability(),
  ])

  // Fallback to static data if DB not seeded yet
  const displayPlans = plans.length > 0 ? plans : []

  const addons = [
    { name: 'Boost 7 días', price: '49 €', unit: 'por activación', desc: 'Posiciona un vehículo en primer lugar 7 días.' },
    { name: 'Pack 5 Boosts', price: '199 €', unit: 'válidos 180 días', desc: 'Ahorra 46 € respecto a comprar boosts individuales.' },
    { name: '+10 vehículos activos', price: '59 €', unit: '/mes por bloque', desc: 'Essential: máx. 2 bloques. Professional: sin tope publicado.' },
    { name: '+25 vehículos activos', price: '99 €', unit: '/mes por bloque', desc: 'Elite. Para inventarios >200 activos se revisa el encaje.' },
    { name: 'Usuario adicional', price: '19 €', unit: '/mes por usuario', desc: 'Professional y Elite. Añade miembros del equipo.' },
    { name: 'Migración avanzada', price: 'Desde 290 €', unit: 'único', desc: 'Importación y normalización de catálogo existente.', consultive: true },
    { name: 'Diagnóstico Anti-Fuga Express', price: '149 €', unit: 'único', desc: 'Análisis de abandono de fichas + plan de acción.', consultive: true },
    { name: 'Espacio editorial', price: '150-300 €', unit: 'único', desc: 'Aparición en guías y selecciones. Sujeto a aprobación editorial.', consultive: true },
  ]

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
          Sin comisiones por venta. Sin permanencia. Anual equivale a 10 mensualidades.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {displayPlans.map((plan) => {
          const isElite = plan.slug === 'elite'
          const monthlyLimit = getLimitValue(plan, 'max_active_vehicles')
          const limitLabel = !monthlyLimit || monthlyLimit >= 99
            ? 'Hasta 100 vehículos activos'
            : `Hasta ${monthlyLimit} vehículos activos`

          const isPopular = plan.slug === 'professional'
          const monthly = plan.monthly_price ?? 0
          const annual = plan.annual_price ?? 0
          const founding = plan.founding_monthly_price ?? 0

          const eliteCTA = isElite ? eliteCap : null

          return (
            <div
              key={plan.id}
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
                <h2 className="font-medium text-bsm-text-primary text-xl mb-2">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-5xl font-light text-bsm-text-primary">{monthly}€</span>
                  <span className="text-bsm-text-muted text-sm">/mes</span>
                </div>
                <p className="text-xs text-bsm-text-muted">
                  {annual}€/año · Founding: {founding}€/mes
                </p>
                <p className="text-xs text-bsm-text-muted mt-1">{limitLabel}</p>
              </div>

              {/* Key features */}
              <ul className="space-y-2.5 flex-1 mb-8">
                {COMPARISON_FEATURES.filter((f) => !f.isLimit).slice(0, 6).map((row) => {
                  const feat = getFeature(plan, row.key)
                  if (!feat?.included) return null
                  return (
                    <li key={row.key} className="flex items-start gap-2.5 text-sm text-bsm-text-secondary">
                      <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      {row.label}
                      {feat.display_label === 'Destacado' && (
                        <span className="ml-1 text-[10px] text-gold tracking-widest uppercase border border-gold/30 px-1.5 py-0.5">Destacado</span>
                      )}
                    </li>
                  )
                })}
              </ul>

              {isElite && eliteCTA ? (
                <Link
                  href={eliteCTA.ctaHref}
                  className={`w-full justify-center text-center ${eliteCTA.status === 'closed' ? 'btn-outline opacity-60 pointer-events-none' : 'btn-gold'}`}
                >
                  {eliteCTA.ctaLabel}
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
      <div className="border border-gold/20 bg-surface p-6 mb-16 text-center">
        <p className="text-xs text-gold tracking-widest uppercase mb-2">Programa Founding</p>
        <p className="text-sm text-bsm-text-secondary max-w-2xl mx-auto">
          Los primeros 15-20 profesionales seleccionados acceden a precio Founding bloqueado de por vida mientras mantengan su suscripción activa.
          Founding + anual no son acumulables.{' '}
          <Link href="/profesionales/founding" className="text-gold hover:text-gold-light underline underline-offset-2">
            Ver condiciones del Founding →
          </Link>
        </p>
      </div>

      {/* Annual billing note */}
      <p className="text-center text-xs text-bsm-text-muted mb-16">
        El plan anual equivale a 10 mensualidades (2 meses gratis). Precios sin IVA.
        Las funcionalidades todavía no operativas solo aparecerán como incluidas cuando estén desarrolladas, verificadas y activadas.
      </p>

      {/* Comparison table */}
      <div className="mb-20">
        <h2 className="font-display text-2xl font-light text-center mb-8">Comparativa de planes</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-bsm-border">
                <th className="text-left py-3 px-4 text-xs text-bsm-text-muted font-normal w-1/2" />
                {displayPlans.map((plan) => (
                  <th key={plan.id} className="py-3 px-4 text-center text-sm font-medium text-bsm-text-primary">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((row) => (
                <tr key={row.key} className="border-b border-bsm-border/50 hover:bg-surface/60 transition-colors">
                  <td className="py-3 px-4 text-sm text-bsm-text-secondary">{row.label}</td>
                  {displayPlans.map((plan) => (
                    <td key={plan.id} className="py-3 px-4 text-center">
                      {renderCell(plan, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Addons */}
      <div className="mb-20">
        <h2 className="font-display text-2xl font-light text-center mb-2">Complementos</h2>
        <p className="text-center text-sm text-bsm-text-muted mb-8">
          Amplía tu plan según tus necesidades, sin cambiar de nivel.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addons.map((addon) => (
            <div key={addon.name} className="bg-surface border border-bsm-border p-5">
              {addon.consultive && (
                <span className="text-[10px] text-bsm-text-muted uppercase tracking-widest block mb-1">Servicio consultivo</span>
              )}
              <p className="text-sm font-medium text-bsm-text-primary mb-1">{addon.name}</p>
              <p className="text-xs text-bsm-text-muted mb-2">{addon.desc}</p>
              <p className="font-display text-xl font-light text-gold">
                {addon.price}
                <span className="text-xs text-bsm-text-muted ml-1">{addon.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Grupo */}
      <div className="border border-bsm-border bg-surface p-8 mb-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs text-gold tracking-widest uppercase mb-1">Modelo Grupo</p>
          <h3 className="font-display text-2xl font-light mb-2">¿Operas varias sedes?</h3>
          <p className="text-sm text-bsm-text-secondary max-w-lg">
            Plan Elite por sede principal + 50% por cada sede adicional. Con visión consolidada de inventario y oportunidades.
            Ejemplo 2 sedes: 899 + 449,50 = 1.348,50 €/mes.
          </p>
        </div>
        <Link href="/profesionales/grupos" className="btn-outline px-6 whitespace-nowrap flex-shrink-0">
          Ver modelo Grupo →
        </Link>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-2xl font-light text-center mb-8">Preguntas frecuentes</h2>
        {[
          {
            q: '¿Hay comisión por venta?',
            a: 'No. Pagas solo la suscripción mensual o anual. No cobramos comisión cuando vendes un vehículo.',
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
