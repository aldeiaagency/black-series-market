import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPlansPage() {
  const admin = createAdminClient()

  const { data: plans } = await admin
    .from('plans')
    .select('*, plan_limits(key, value_number), plan_features(feature_key, included, availability_status, public_visible)')
    .order('sort_order')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Planes</h1>
        <p className="text-sm text-bsm-text-muted">Catálogo de planes con precios y límites</p>
      </div>

      <div className="space-y-4">
        {(plans ?? []).map((plan) => {
          const limits = (plan.plan_limits as { key: string; value_number: number | null }[]) ?? []
          const features = (plan.plan_features as { feature_key: string; included: boolean; availability_status: string; public_visible: boolean }[]) ?? []
          const maxVehicles = limits.find((l) => l.key === 'max_active_vehicles')?.value_number
          const maxUsers = limits.find((l) => l.key === 'max_users')?.value_number
          const retention = limits.find((l) => l.key === 'analytics_retention_days')?.value_number

          return (
            <div key={plan.id} className="bg-surface border border-bsm-border p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-medium text-bsm-text-primary text-lg">{plan.name}</h2>
                    <span className={`text-[10px] px-2 py-0.5 border uppercase tracking-widest ${
                      plan.status === 'active' ? 'border-emerald-400/30 text-emerald-400' : 'border-bsm-border text-bsm-text-muted'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-xs text-bsm-text-muted font-mono">{plan.slug}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-bsm-text-secondary">
                    <span className="font-display text-2xl text-bsm-text-primary">{plan.monthly_price ?? '—'}€</span>
                    <span className="text-bsm-text-muted">/mes</span>
                  </p>
                  <p className="text-[10px] text-bsm-text-muted">+ IVA</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="border border-bsm-border p-3">
                  <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-1">Vehículos</p>
                  <p className="text-sm text-bsm-text-primary">{maxVehicles ?? '—'}</p>
                </div>
                <div className="border border-bsm-border p-3">
                  <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-1">Usuarios</p>
                  <p className="text-sm text-bsm-text-primary">{maxUsers ?? '—'}</p>
                </div>
                <div className="border border-bsm-border p-3">
                  <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-1">Analítica</p>
                  <p className="text-sm text-bsm-text-primary">{retention ?? '—'} días</p>
                </div>
                <div className="border border-bsm-border p-3">
                  <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-1">Features</p>
                  <p className="text-sm text-bsm-text-primary">
                    {features.filter((f) => f.included).length} / {features.length}
                  </p>
                </div>
              </div>

              {/* Stripe IDs */}
              {(plan.stripe_product_id || plan.stripe_monthly_price_id) && (
                <div className="border-t border-bsm-border pt-3 mt-3">
                  <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-2">Stripe</p>
                  <div className="flex flex-wrap gap-3">
                    {plan.stripe_product_id && (
                      <span className="text-xs text-bsm-text-muted font-mono">prod: {plan.stripe_product_id}</span>
                    )}
                    {plan.stripe_monthly_price_id && (
                      <span className="text-xs text-bsm-text-muted font-mono">monthly: {plan.stripe_monthly_price_id}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-bsm-text-muted mt-6">
        Para modificar precios o límites, actualiza directamente en Supabase y en Stripe. Los tres deben sincronizarse a la vez.
      </p>
    </div>
  )
}
