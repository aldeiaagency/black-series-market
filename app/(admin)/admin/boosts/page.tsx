import { createAdminClient } from '@/lib/supabase/server'

export default async function AdminBoostsPage() {
  const admin = createAdminClient()

  const now = new Date().toISOString()

  const [activeResult, creditsResult, configResult] = await Promise.all([
    admin
      .from('boost_activations')
      .select('id, starts_at, ends_at, status, vehicle:vehicles(id, title, make, model), organization:organizations(name)')
      .eq('status', 'active')
      .gte('ends_at', now)
      .order('ends_at'),

    admin
      .from('boost_credits')
      .select('id, source, quantity, used, expires_at, organization:organizations(name)')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(50),

    admin
      .from('platform_config')
      .select('value')
      .eq('key', 'boost_config')
      .single(),
  ])

  const activeBoosts = activeResult.data ?? []
  const credits = creditsResult.data ?? []
  const maxShare: number = configResult.data?.value?.max_boosted_share ?? 0.10

  // Count total active vehicles for capacity calc
  const { count: totalActive } = await admin
    .from('vehicles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  const maxBoosted = Math.floor((totalActive ?? 0) * maxShare)
  const capacityUsed = activeBoosts.length

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Boosts</h1>
        <p className="text-sm text-bsm-text-muted">
          Destacados activos y créditos disponibles
        </p>
      </div>

      {/* Capacity */}
      <div className="bg-surface border border-bsm-border p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-bsm-text-muted">
            Cupo global de boosts simultáneos ({Math.round(maxShare * 100)}% de {totalActive} activos)
          </span>
          <span className="text-xs text-bsm-text-primary">{capacityUsed} / {maxBoosted}</span>
        </div>
        <div className="h-1 bg-bsm-border rounded-full">
          <div
            className={`h-full rounded-full ${capacityUsed >= maxBoosted ? 'bg-red-500' : 'bg-gold'}`}
            style={{ width: `${maxBoosted > 0 ? Math.min(100, (capacityUsed / maxBoosted) * 100) : 0}%` }}
          />
        </div>
        <p className="text-[10px] text-bsm-text-muted mt-2">
          Para cambiar el cupo, actualiza <code>platform_config.key=&apos;boost_config&apos;</code> → <code>max_boosted_share</code>.
        </p>
      </div>

      {/* Active boosts */}
      <div className="mb-8">
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">
          Boosts activos ({activeBoosts.length})
        </h2>
        {activeBoosts.length === 0 ? (
          <div className="border border-bsm-border p-6 text-center">
            <p className="text-sm text-bsm-text-muted">Sin boosts activos en este momento.</p>
          </div>
        ) : (
          <div className="border border-bsm-border divide-y divide-bsm-border">
            {activeBoosts.map((b) => {
              const vehicle = b.vehicle as unknown as { id: string; title: string | null; make: string | null; model: string | null } | null
              const org = b.organization as unknown as { name: string } | null
              const daysLeft = Math.ceil((new Date(b.ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))

              return (
                <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-bsm-text-primary truncate">
                      {vehicle?.title ?? (vehicle?.make ? `${vehicle.make} ${vehicle.model}` : 'Vehículo no disponible')}
                    </p>
                    <p className="text-xs text-bsm-text-muted">{org?.name ?? '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-medium ${daysLeft <= 1 ? 'text-amber-400' : 'text-bsm-text-secondary'}`}>
                      {daysLeft}d restantes
                    </p>
                    <p className="text-[10px] text-bsm-text-muted">
                      hasta {new Date(b.ends_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Credits */}
      <div>
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">
          Créditos disponibles (últimos 50)
        </h2>
        <div className="border border-bsm-border divide-y divide-bsm-border">
          {credits.map((c) => {
            const org = c.organization as unknown as { name: string } | null
            const remaining = c.quantity - c.used
            return (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-bsm-text-primary truncate">{org?.name ?? '—'}</p>
                  <p className="text-xs text-bsm-text-muted">
                    {c.source} · {remaining}/{c.quantity} restantes
                    {c.expires_at ? ` · caduca ${new Date(c.expires_at).toLocaleDateString('es-ES')}` : ''}
                  </p>
                </div>
                <span className={`text-[10px] border px-2 py-1 flex-shrink-0 ${remaining > 0 ? 'border-emerald-400/30 text-emerald-400' : 'border-bsm-border text-bsm-text-muted'}`}>
                  {remaining > 0 ? `${remaining} disp.` : 'agotado'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
