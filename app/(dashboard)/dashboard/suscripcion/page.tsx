import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check, Zap, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'
import { getEntitlements } from '@/lib/entitlements'
import { PLANS, ADDONS, getPlan, ELITE_LIMIT_NOTE } from '@/lib/plans-config'

function UsageBar({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
  const isWarning = pct >= 80
  const isDanger = pct >= 95

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-bsm-text-muted">{label}</span>
        <span className={`text-xs font-medium ${isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-bsm-text-secondary'}`}>
          {used} / {max}
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

  const access = await getDealerAccess(user.id)
  if (!access) redirect('/registro')
  if (!getPermissions(access.role).canManageSubscription) redirect('/dashboard')

  const admin = createAdminClient()
  const orgId = access.orgId

  const { data: dealer } = await admin
    .from('dealers')
    .select('id, name, subscription_plan, subscription_end_at, stripe_customer_id, stripe_subscription_id')
    .eq('id', access.dealerId)
    .single()

  if (!dealer) redirect('/registro')

  const ent = orgId ? await getEntitlements(orgId) : null

  const planLabel = ent?.plan ?? dealer.subscription_plan ?? 'essential'
  const currentPlan = getPlan(planLabel)

  // Complementos relevantes para el plan actual
  const relevantAddons = ADDONS.filter((a) => (a.appliesTo as string[]).includes(planLabel) || a.includedInElite)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Suscripción</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-bsm-text-muted">
            Plan: <span className="text-gold">{currentPlan?.name ?? planLabel}</span>
          </span>
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
              label="Vehículos publicados"
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
              <p className="text-xs text-amber-400 mb-2">Has alcanzado el límite de vehículos publicados.</p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/dashboard/inventario" className="text-xs text-gold hover:underline">Archivar vehículos →</Link>
                <Link href="/profesionales/precios" className="text-xs text-gold hover:underline">Subir de plan →</Link>
                <Link href="#complementos" className="text-xs text-gold hover:underline">Ampliar con complementos →</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.slug === planLabel
          const maxVehicles = plan.values.max_active_vehicles as number

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
              <div className="flex items-baseline gap-1 mb-0.5">
                <span className="font-display text-3xl font-light text-bsm-text-primary">{plan.monthlyPrice}€</span>
                <span className="text-xs text-bsm-text-muted">/mes</span>
              </div>
              <p className="text-[11px] text-bsm-text-muted mb-3">+ IVA</p>
              <p className="text-xs text-bsm-text-muted mb-2">
                {maxVehicles >= 100 ? 'Hasta 100 vehículos' : `Hasta ${maxVehicles} vehículos`}
              </p>
              {plan.limited && (
                <p className="text-[10px] text-bsm-text-muted mb-4 leading-relaxed">{ELITE_LIMIT_NOTE}</p>
              )}

              <div className="mt-auto pt-2">
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

      {/* Complementos */}
      <div id="complementos" className="scroll-mt-8">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-bsm-text-primary">Complementos</h2>
          <p className="text-xs text-bsm-text-muted">Amplía tu plan según tus necesidades, sin cambiar de nivel.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {relevantAddons.map((addon) => {
            const includedHere = addon.includedInElite && planLabel === 'elite'

            return (
              <div key={addon.slug} className="bg-surface border border-bsm-border p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-bsm-text-primary">{addon.name}</p>
                  <p className="font-display text-base font-light text-gold whitespace-nowrap">
                    {includedHere ? 'Incluido' : (
                      <>
                        {addon.price}
                        <span className="text-[10px] text-bsm-text-muted ml-1">+ IVA · {addon.unit}</span>
                      </>
                    )}
                  </p>
                </div>
                <p className="text-xs text-bsm-text-muted mb-3 flex-1">{addon.desc}</p>

                {includedHere ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Incluido en tu plan Elite
                  </span>
                ) : addon.action === 'inventory' ? (
                  <Link href="/dashboard/inventario" className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline">
                    <Zap className="w-3.5 h-3.5" /> Activar desde la ficha del vehículo
                  </Link>
                ) : (
                  <a
                    href={`mailto:hola@blacklabelmarket.es?subject=${encodeURIComponent(`Complemento: ${addon.name}`)}&body=${encodeURIComponent(`Hola, soy ${dealer.name} y quiero contratar el complemento "${addon.name}" (${addon.price} ${addon.unit}).`)}`}
                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Solicitar complemento
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
