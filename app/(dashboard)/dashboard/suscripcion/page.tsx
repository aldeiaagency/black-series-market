import { redirect } from 'next/navigation'
import { Check, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    price: 149,
    slots: 10,
    features: [
      'Hasta 10 vehículos activos',
      'Perfil de concesionario básico',
      'Gestión de leads centralizada',
      'Analíticas básicas (30 días)',
      'Soporte por email',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 349,
    slots: 30,
    popular: true,
    features: [
      'Hasta 30 vehículos activos',
      'Perfil destacado en búsquedas',
      'Badge verificado en marketplace',
      'Analíticas avanzadas',
      'Soporte prioritario',
      'Acceso a featured spots',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 699,
    slots: 9999,
    features: [
      'Vehículos ilimitados',
      'Aparición en homepage del marketplace',
      'Badge Elite verificado',
      'Analíticas premium con benchmarks',
      'Account manager dedicado',
      'Acceso a eventos exclusivos',
      'Listing destacado permanente',
    ],
  },
]

export default async function SuscripcionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id, subscription_plan, subscription_end_at, stripe_customer_id')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) redirect('/registro')

  const currentPlan = dealer.subscription_plan

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Suscripción</h1>
        {currentPlan ? (
          <p className="text-sm text-bsm-text-muted">
            Plan actual: <span className="text-gold capitalize">{currentPlan}</span>
            {dealer.subscription_end_at && (
              <span> · Próxima renovación: {new Date(dealer.subscription_end_at).toLocaleDateString('es-ES')}</span>
            )}
          </p>
        ) : (
          <p className="text-sm text-bsm-text-muted">Actualmente en periodo de prueba</p>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id
          return (
            <div
              key={plan.id}
              className={`relative bg-surface border p-6 flex flex-col ${
                plan.popular
                  ? 'border-gold/40'
                  : isActive
                  ? 'border-emerald-400/40'
                  : 'border-bsm-border'
              }`}
            >
              {plan.popular && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-gold text-[10px] px-3">Más popular</span>
                </div>
              )}
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge text-[10px] px-3 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                    Plan actual
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-medium text-bsm-text-primary mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-light text-bsm-text-primary">
                    {plan.price}€
                  </span>
                  <span className="text-sm text-bsm-text-muted">/mes</span>
                </div>
                <p className="text-xs text-bsm-text-muted mt-1">
                  {plan.slots === 999 ? 'Vehículos ilimitados' : `Hasta ${plan.slots} vehículos`}
                </p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-bsm-text-secondary">
                    <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              {isActive ? (
                <button className="btn-outline w-full justify-center opacity-50 cursor-not-allowed" disabled>
                  Plan actual
                </button>
              ) : (
                <form action="/api/stripe/create-checkout" method="POST">
                  <input type="hidden" name="plan" value={plan.id} />
                  <button type="submit" className={`w-full justify-center ${plan.popular ? 'btn-gold' : 'btn-outline'}`}>
                    {currentPlan ? 'Cambiar a ' + plan.name : 'Contratar ' + plan.name}
                  </button>
                </form>
              )}
            </div>
          )
        })}
      </div>

      {/* Manage subscription */}
      {dealer.stripe_customer_id && (
        <div className="bg-surface border border-bsm-border p-6 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-bsm-text-primary mb-1">Gestionar suscripción</h3>
            <p className="text-sm text-bsm-text-muted">
              Accede al portal de facturación para gestionar tu pago y descargar facturas.
            </p>
          </div>
          <form action="/api/stripe/portal" method="POST">
            <button type="submit" className="btn-outline flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Portal de facturación
            </button>
          </form>
        </div>
      )}

      {/* Boost destacados */}
      <div className="mt-6 bg-surface border border-bsm-border p-6">
        <h3 className="font-medium text-bsm-text-primary mb-2">Destacar vehículo (boost puntual)</h3>
        <p className="text-sm text-bsm-text-muted mb-4">
          Impulsa un listing concreto por 49€/7 días. Aparece primero en resultados y en secciones destacadas.
        </p>
        <a href="/dashboard/inventario" className="btn-outline text-sm">
          Ver mis vehículos →
        </a>
      </div>
    </div>
  )
}
