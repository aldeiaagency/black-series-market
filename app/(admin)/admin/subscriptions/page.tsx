import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>
}

const STATUS_COLORS: Record<string, string> = {
  active:     'border-emerald-400/30 text-emerald-400',
  trialing:   'border-blue-400/30 text-blue-400',
  past_due:   'border-amber-400/30 text-amber-400',
  canceled:   'border-red-400/30 text-red-400',
  paused:     'border-bsm-border text-bsm-text-muted',
}

export default async function AdminSubscriptionsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const admin = createAdminClient()

  let query = admin
    .from('subscriptions')
    .select(`
      id, status, billing_cycle, created_at, current_period_end, cancel_at_period_end,
      plan:plans(slug, name),
      organization:organizations(id, name, slug)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)

  const { data: subscriptions, count } = await query.limit(100)

  // Also fetch dealers legacy for dealers not yet on new system
  const { data: legacyDealers, count: dealerCount } = await admin
    .from('dealers')
    .select('id, name, subscription_plan, status, subscription_end_at, stripe_subscription_id', { count: 'exact' })
    .not('subscription_plan', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Suscripciones</h1>
        <p className="text-sm text-bsm-text-muted">
          {count ?? 0} en sistema v2 · {dealerCount ?? 0} en sistema legacy
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['', 'active', 'trialing', 'past_due', 'canceled'].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/subscriptions?status=${s}` : '/admin/subscriptions'}
            className={`text-xs px-3 py-1.5 border transition-colors capitalize ${
              (params.status === s || (!params.status && !s))
                ? 'border-gold text-gold bg-gold/5'
                : 'border-bsm-border text-bsm-text-muted hover:border-gold/40'
            }`}
          >
            {s || 'Todas'}
          </Link>
        ))}
      </div>

      {/* New system */}
      {(subscriptions?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">Sistema v2</h2>
          <div className="border border-bsm-border divide-y divide-bsm-border">
            {(subscriptions ?? []).map((sub) => {
              const plan = sub.plan as unknown as { slug: string; name: string } | null
              const org = sub.organization as unknown as { id: string; name: string; slug: string } | null

              return (
                <div key={sub.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm text-bsm-text-primary font-medium truncate">
                        {org?.name ?? sub.id}
                      </p>
                    </div>
                    <p className="text-xs text-bsm-text-muted">
                      {plan?.name ?? '—'} · {sub.billing_cycle}
                      {sub.current_period_end && ` · hasta ${new Date(sub.current_period_end).toLocaleDateString('es-ES')}`}
                      {sub.cancel_at_period_end && ' · cancela al periodo'}
                    </p>
                  </div>
                  <span className={`text-[10px] border px-2 py-1 uppercase tracking-widest flex-shrink-0 ${STATUS_COLORS[sub.status] ?? 'border-bsm-border text-bsm-text-muted'}`}>
                    {sub.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legacy */}
      {(legacyDealers?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">Sistema legacy (dealers)</h2>
          <div className="border border-bsm-border divide-y divide-bsm-border">
            {(legacyDealers ?? []).map((d) => (
              <div key={d.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-bsm-text-primary font-medium truncate">{d.name}</p>
                  <p className="text-xs text-bsm-text-muted">
                    {d.subscription_plan}
                    {d.subscription_end_at && ` · hasta ${new Date(d.subscription_end_at).toLocaleDateString('es-ES')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/dealers?search=${encodeURIComponent(d.name)}`}
                    className="text-xs text-gold hover:underline"
                  >
                    Ver dealer →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
