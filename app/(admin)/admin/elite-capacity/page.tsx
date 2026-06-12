import { createAdminClient } from '@/lib/supabase/server'

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponible',
  low_availability: 'Disponibilidad baja',
  waitlist: 'Lista de espera',
  closed: 'Sin plaza',
}

const STATUS_COLORS: Record<string, string> = {
  available:        'border-emerald-400/30 text-emerald-400',
  low_availability: 'border-amber-400/30 text-amber-400',
  waitlist:         'border-blue-400/30 text-blue-400',
  closed:           'border-red-400/30 text-red-400',
}

export default async function AdminEliteCapacityPage() {
  const admin = createAdminClient()

  const { data: rules } = await admin
    .from('elite_capacity_rules')
    .select('*')
    .order('geographic_scope_type')
    .order('geographic_scope_id')

  const { data: waitlist } = await admin
    .from('elite_waitlist')
    .select('id, status, created_at, organization:organizations(name)')
    .eq('status', 'waiting')
    .order('created_at')

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Capacidad Elite</h1>
        <p className="text-sm text-bsm-text-muted">
          Gestión de plazas disponibles por ámbito geográfico.
          Los números internos nunca se publican.
        </p>
      </div>

      {/* Rules */}
      <div className="mb-10">
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">Reglas de capacidad</h2>
        <div className="border border-bsm-border divide-y divide-bsm-border">
          {(rules ?? []).map((rule) => (
            <div key={rule.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-sm text-bsm-text-primary font-medium">
                    {rule.geographic_scope_type === 'country' ? 'País' : 'Provincia'}: {rule.geographic_scope_id}
                    {rule.category !== '*' && ` · ${rule.category}`}
                  </p>
                  <p className="text-xs text-bsm-text-muted mt-0.5">
                    Ocupación: {rule.current_elite_showrooms}
                    {rule.max_elite_showrooms ? ` / ${rule.max_elite_showrooms}` : ''}
                    {rule.max_elite_share ? ` · Máx. ${Math.round(rule.max_elite_share * 100)}% del total` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {rule.manual_override && (
                    <span className="text-[9px] text-amber-400 border border-amber-400/30 px-2 py-0.5 uppercase tracking-widest">
                      Override manual
                    </span>
                  )}
                  <span className={`text-[10px] border px-2 py-1 uppercase tracking-widest ${STATUS_COLORS[rule.availability_status] ?? 'border-bsm-border text-bsm-text-muted'}`}>
                    {STATUS_LABELS[rule.availability_status] ?? rule.availability_status}
                  </span>
                </div>
              </div>
              {rule.notes && (
                <p className="text-xs text-bsm-text-muted italic">{rule.notes}</p>
              )}
              <p className="text-[10px] text-bsm-text-muted mt-2">
                Actualizado: {new Date(rule.updated_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist */}
      {(waitlist?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">
            Lista de espera ({waitlist?.length})
          </h2>
          <div className="border border-bsm-border divide-y divide-bsm-border">
            {(waitlist ?? []).map((entry) => {
              const org = entry.organization as { name: string } | null
              return (
                <div key={entry.id} className="px-5 py-3 flex items-center justify-between">
                  <p className="text-sm text-bsm-text-primary">{org?.name ?? entry.id}</p>
                  <p className="text-xs text-bsm-text-muted">
                    {new Date(entry.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-8 border border-bsm-border bg-surface p-4">
        <p className="text-xs text-bsm-text-muted">
          Para modificar una regla o registrar una excepción manual, actualiza directamente en Supabase.
          Toda excepción debe quedar registrada en el <code className="text-gold">audit_log</code>.
        </p>
      </div>
    </div>
  )
}
