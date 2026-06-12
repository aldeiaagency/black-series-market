import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getOrganizationIdForUser, getEntitlements } from '@/lib/entitlements'

function UsageBar({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
  const isWarning = pct >= 80
  const isDanger = pct >= 95

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-bsm-text-muted">{label}</span>
        <span className={`text-xs font-medium ${isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-bsm-text-secondary'}`}>
          {used} / {max >= 99 ? '∞' : max}
        </span>
      </div>
      <div className="h-1 bg-bsm-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-gold'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default async function SuscripcionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const orgId = await getOrganizationIdForUser(user.id)

  const { data: dealer } = await admin
    .from('dealers')
    .select('id, name, subscription_plan, subscription_end_at, stripe_customer_id, stripe_subscription_id')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) redirect('/registro')

  const ent = orgId ? await getEntitlements(orgId) : null

  const planLabel = ent?.plan ?? dealer.subscription_plan ?? 'sin plan'
  const isFounding = ent?.isFounding ?? false

  const { data: plans } = await admin
    .from('plans')
    .select('slug, name, monthly_price, annual_price, plan_limits(key, value_number)')
    .in('slug', ['essential', 'professional', 'elite'])
    .eq('status', 'active')
    .order('sort_order')

  const currentPlan = plans?.find((p) => p.slug === planLabel)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Suscripción</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-bsm-text-muted capitalize">
            Plan: <span className="text-gold">{currentPlan?.name ?? planLabel}</span>
          </span>
          {isFounding && (
            <span className="text-[10px] text-gold border border-gold/30 px-2 py-0.5 tracking-widest uppercase">
              Founding
            </span>
          )}
          {dealer.subscription_end_at && (
            <span className="text-sm text-bsm-text-muted">
              · Próxima renovación: {new Date(dealer.subscription_end_at).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>

      {/* Usage bars */}
      {ent && (
        <div className="bg-surface border border-bsm-border p-6 mb-6">
          <h2 className="text-sm font-medium text-bsm-text-primary mb-5">Uso del plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <UsageBar
              used={ent.usage.activeVehicles}
              max={ent.limits.maxActiveVehicles}
              label="Vehículos activos"
            />
            <UsageBar
              used={ent.usage.users}
              max={ent.limits.maxUsers}
              label="Usuarios del equipo"
            />
            <UsageBar
              used={ent.usage.boostsUsedThisCycle}
              max={ent.limits.includedBoostsMonth}
              label="Boosts del ciclo"
            />
            {ent.limits.maxLocations > 1 && (
              <UsageBar
                used={ent.usage.locations}
                max={ent.limits.maxLocations}
                label="Sedes"
              />
            )}
          </div>

          {ent.usage.activeVehicles >= ent.limits.maxActiveVehicles && (
            <div className="mt-4 border border-amber-400/20 bg-amber-400/5 p-4">
              <p className="text-xs text-amber-400 mb-2">Has alcanzado el límite de vehículos activos.</p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/dashboard/inventario" className="text-xs text-gold hover:underline">Archivar vehículos →</Link>
                <Link href="/profesionales/precios" className="text-xs text-gold hover:underline">Subir de plan →</Link>
                {planLabel === 'essential' && (
                  <Link href="/profesionales/precios#addons" className="text-xs text-gold hover:underline">Comprar +10 vehículos →</Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(plans ?? []).map((plan) => {
          const isCurrentPlan = plan.slug === planLabel
          const monthly = plan.monthly_price ?? 0
          const maxVehicles = (plan.plan_limits as { key: string; value_number: number | null }[])
            ?.find((l) => l.key === 'max_active_vehicles')?.value_number ?? 0

          return (
            <div
              key={plan.slug}
              className={`relative bg-surface border p-5 flex flex-col ${
                isCurrentPlan ? 'border-gold/40' : 'border-bsm-border'
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 tracking-widest uppercase">
                    Plan actual
                  </span>
                </div>
              )}

              <h3 className="font-medium text-bsm-text-primary mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-3xl font-light text-bsm-text-primary">{monthly}€</span>
                <span className="text-xs text-bsm-text-muted">/mes</span>
              </div>
              <p className="text-xs text-bsm-text-muted mb-4">
                {maxVehicles >= 99 ? 'Hasta 100 vehículos' : `Hasta ${maxVehicles} vehículos`}
              </p>

              {isCurrentPlan ? (
                <button className="btn-outline text-sm w-full justify-center opacity-40 cursor-not-allowed" disabled>
                  Plan actual
                </button>
              ) : (
                <form action="/api/stripe/create-checkout" method="POST">
                  <input type="hidden" name="plan" value={plan.slug} />
                  <button type="submit" className="btn-outline text-sm w-full justify-center">
                    Cambiar a {plan.name}
                  </button>
                </form>
              )}
            </div>
          )
        })}
      </div>

      {/* Portal */}
      {dealer.stripe_customer_id && (
        <div className="bg-surface border border-bsm-border p-5 flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-bsm-text-primary mb-0.5">Portal de facturación</h3>
            <p className="text-xs text-bsm-text-muted">Facturas, método de pago y gestión de la suscripción.</p>
          </div>
          <form action="/api/stripe/portal" method="POST">
            <button type="submit" className="btn-outline text-sm px-4">Acceder →</button>
          </form>
        </div>
      )}

      {/* Addons */}
      <div className="bg-surface border border-bsm-border p-5">
        <h3 className="text-sm font-medium text-bsm-text-primary mb-4">Complementos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/dashboard/inventario" className="border border-bsm-border p-4 hover:border-gold/40 transition-colors">
            <p className="text-sm text-bsm-text-primary mb-0.5">Boost 7 días — 49 €</p>
            <p className="text-xs text-bsm-text-muted">Activa desde la ficha de cada vehículo</p>
          </Link>
          <Link href="/profesionales/precios#addons" className="border border-bsm-border p-4 hover:border-gold/40 transition-colors">
            <p className="text-sm text-bsm-text-primary mb-0.5">Ver todos los complementos →</p>
            <p className="text-xs text-bsm-text-muted">Bloques de vehículos, usuarios, editorial…</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
