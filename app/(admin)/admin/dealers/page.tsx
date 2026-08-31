import { createAdminClient } from '@/lib/supabase/server'
import { DEALER_STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ status?: string; plan?: string; search?: string }>
}

const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial', essential: 'Essential', professional: 'Professional', elite: 'Elite',
}
const PLAN_BADGE: Record<string, string> = {
  trial: 'text-bsm-text-muted', essential: 'text-blue-400',
  professional: 'text-gold', elite: 'text-emerald-400',
}

export default async function AdminDealersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createAdminClient()

  const [{ count: pendingCount }, { data: allForCounts }] = await Promise.all([
    supabase.from('dealers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('dealers').select('subscription_plan, status'),
  ])

  // Plan distribution counts (across all statuses)
  const planCounts: Record<string, number> = {}
  let totalDealers = 0
  for (const d of (allForCounts || []) as any[]) {
    const plan = d.subscription_plan || 'trial'
    planCounts[plan] = (planCounts[plan] || 0) + 1
    totalDealers++
  }

  let query = supabase
    .from('dealers')
    .select('*, profile:profiles(email)', { count: 'exact' })
    .order('status', { ascending: true })
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)
  if (params.plan)   query = query.eq('subscription_plan', params.plan)
  if (params.search) query = query.ilike('name', `%${params.search}%`)

  const { data: dealers, count } = await query

  function planHref(plan: string) {
    const p = new URLSearchParams()
    if (params.status) p.set('status', params.status)
    if (plan) p.set('plan', plan); else p.delete('plan')
    return p.toString() ? `/admin/dealers?${p}` : '/admin/dealers'
  }

  function statusHref(status: string) {
    const p = new URLSearchParams()
    if (params.plan) p.set('plan', params.plan)
    if (status) p.set('status', status); else p.delete('status')
    return p.toString() ? `/admin/dealers?${p}` : '/admin/dealers'
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Concesionarios</h1>
          <p className="text-sm text-bsm-text-muted">{count} mostrados · {totalDealers} totales</p>
        </div>
        {(pendingCount ?? 0) > 0 && (
          <Link href="/admin/dealers?status=pending"
            className="flex items-center gap-2 px-4 py-2.5 border border-amber-400/30 bg-amber-400/5 text-amber-400 text-sm hover:bg-amber-400/10 transition-colors">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center justify-center">
              {pendingCount}
            </span>
            Solicitud{pendingCount !== 1 ? 'es' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Plan filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Link href={planHref('')}
          className={`text-xs px-3 py-1.5 border transition-colors ${
            !params.plan ? 'border-gold text-gold bg-gold/5' : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'
          }`}>
          Todos los planes ({totalDealers})
        </Link>
        {['trial', 'essential', 'professional', 'elite'].map((plan) => (
          <Link key={plan} href={planHref(plan)}
            className={`text-xs px-3 py-1.5 border transition-colors ${
              params.plan === plan ? 'border-gold text-gold bg-gold/5' : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'
            }`}>
            {PLAN_LABELS[plan]} ({planCounts[plan] || 0})
          </Link>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'trial', 'active', 'suspended'].map((s) => (
          <Link key={s} href={statusHref(s === 'all' ? '' : s)}
            className={`text-xs px-3 py-1.5 border transition-colors capitalize ${
              (params.status === s || (!params.status && s === 'all'))
                ? 'border-bsm-border-light text-bsm-text-primary bg-surface-elevated'
                : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'
            }`}>
            {s === 'all' ? 'Cualquier estado' : DEALER_STATUS_LABELS[s as keyof typeof DEALER_STATUS_LABELS] || s}
          </Link>
        ))}
      </div>

      {/* Desktop — tabla completa */}
      <div className="hidden lg:block bg-surface border border-bsm-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bsm-border">
              {['Concesionario', 'Email', 'Ciudad', 'Plan', 'Vehículos', 'Estado', 'Registro', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(dealers || []).map((d: any) => {
              const plan = d.subscription_plan || 'trial'
              return (
                <tr key={d.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-bsm-text-primary">{d.name}</td>
                  <td className="px-4 py-3 text-bsm-text-muted text-xs">{d.profile?.email}</td>
                  <td className="px-4 py-3 text-bsm-text-muted">{d.location_city || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs capitalize ${PLAN_BADGE[plan] || 'text-bsm-text-muted'}`}>
                      {PLAN_LABELS[plan] || plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-bsm-text-muted">{d.vehicle_slots}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-[10px] ${d.status === 'active' ? 'badge-active' : d.status === 'pending' ? 'badge-pending' : 'badge-muted'}`}>
                      {DEALER_STATUS_LABELS[d.status as keyof typeof DEALER_STATUS_LABELS]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-bsm-text-muted text-xs">
                    {new Date(d.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/dealers/${d.id}`} className="text-xs text-gold hover:text-gold-light">
                      Gestionar →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {(!dealers || dealers.length === 0) && (
          <div className="p-12 text-center text-sm text-bsm-text-muted">
            Sin concesionarios con este filtro
          </div>
        )}
      </div>

      {/* Móvil — tarjetas apiladas (antes: misma tabla de 8 columnas con scroll horizontal) */}
      <div className="lg:hidden space-y-3">
        {(dealers || []).map((d: any) => {
          const plan = d.subscription_plan || 'trial'
          return (
            <Link
              key={d.id}
              href={`/admin/dealers/${d.id}`}
              className="block bg-surface border border-bsm-border p-4 hover:border-bsm-border-light transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="font-medium text-bsm-text-primary truncate">{d.name}</div>
                  <div className="text-xs text-bsm-text-muted truncate">{d.profile?.email}</div>
                </div>
                <span className={`badge text-[10px] shrink-0 ${d.status === 'active' ? 'badge-active' : d.status === 'pending' ? 'badge-pending' : 'badge-muted'}`}>
                  {DEALER_STATUS_LABELS[d.status as keyof typeof DEALER_STATUS_LABELS]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-1.5 text-xs text-bsm-text-muted">
                <div>{d.location_city || '—'}</div>
                <div className={`text-right capitalize ${PLAN_BADGE[plan] || 'text-bsm-text-muted'}`}>
                  {PLAN_LABELS[plan] || plan}
                </div>
                <div>{d.vehicle_slots} vehículos</div>
                <div className="text-right">{new Date(d.created_at).toLocaleDateString('es-ES')}</div>
              </div>
            </Link>
          )
        })}

        {(!dealers || dealers.length === 0) && (
          <div className="p-12 text-center text-sm text-bsm-text-muted bg-surface border border-bsm-border">
            Sin concesionarios con este filtro
          </div>
        )}
      </div>
    </div>
  )
}
