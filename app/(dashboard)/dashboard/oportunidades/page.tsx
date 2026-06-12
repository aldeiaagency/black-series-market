import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getOrganizationIdForUser, getEntitlements } from '@/lib/entitlements'

const PIPELINE_STAGES = ['new', 'contacted', 'appointment', 'won', 'lost'] as const
type Stage = typeof PIPELINE_STAGES[number]

const STAGE_LABELS: Record<Stage, string> = {
  new: 'Nueva',
  contacted: 'Contactada',
  appointment: 'Cita',
  won: 'Ganada',
  lost: 'Perdida',
}

const STAGE_COLORS: Record<Stage, string> = {
  new: 'border-blue-400/30 bg-blue-400/5',
  contacted: 'border-amber-400/30 bg-amber-400/5',
  appointment: 'border-purple-400/30 bg-purple-400/5',
  won: 'border-emerald-400/30 bg-emerald-400/5',
  lost: 'border-red-400/30 bg-red-400/5',
}

type Opportunity = {
  id: string
  status: Stage
  created_at: string
  vehicle_title?: string
  buyer_name?: string
  buyer_email?: string
  source?: string
  location_name?: string
}

export default async function OportunidadesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const orgId = await getOrganizationIdForUser(user.id)
  const ent = orgId ? await getEntitlements(orgId) : null

  const hasPipeline = ent?.features['pipeline']?.included && ent?.features['pipeline']?.status !== 'future'

  // Fetch leads/opportunities from the existing leads table
  const { data: dealer } = await admin
    .from('dealers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) redirect('/registro')

  const { data: leads } = await admin
    .from('leads')
    .select('id, status, created_at, vehicle_id, buyer_name, buyer_email, source')
    .eq('dealer_id', dealer.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const opportunities: Opportunity[] = (leads ?? []).map((l) => ({
    id: l.id,
    status: mapLeadStatus(l.status),
    created_at: l.created_at,
    buyer_name: l.buyer_name,
    buyer_email: l.buyer_email,
    source: l.source,
  }))

  if (hasPipeline) {
    // Kanban view for Professional/Elite
    const byStage = PIPELINE_STAGES.reduce<Record<Stage, Opportunity[]>>((acc, s) => {
      acc[s] = opportunities.filter((o) => o.status === s)
      return acc
    }, { new: [], contacted: [], appointment: [], won: [], lost: [] })

    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-light mb-1">Oportunidades</h1>
          <p className="text-sm text-bsm-text-muted">Pipeline de contactos y visitas</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.filter((s) => s !== 'lost').map((stage) => (
            <div key={stage} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-bsm-text-muted uppercase tracking-widest">
                  {STAGE_LABELS[stage]}
                </span>
                <span className="text-xs text-bsm-text-muted bg-surface border border-bsm-border px-2 py-0.5">
                  {byStage[stage].length}
                </span>
              </div>
              <div className="space-y-2">
                {byStage[stage].length === 0 ? (
                  <div className="border border-dashed border-bsm-border p-4 text-center">
                    <p className="text-xs text-bsm-text-muted">Sin oportunidades</p>
                  </div>
                ) : (
                  byStage[stage].map((opp) => (
                    <div key={opp.id} className={`border p-3 ${STAGE_COLORS[stage]}`}>
                      <p className="text-sm text-bsm-text-primary font-medium mb-0.5 truncate">
                        {opp.buyer_name ?? 'Comprador anónimo'}
                      </p>
                      <p className="text-xs text-bsm-text-muted truncate">{opp.buyer_email ?? '—'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-bsm-text-muted">
                          {new Date(opp.created_at).toLocaleDateString('es-ES')}
                        </span>
                        {opp.source && (
                          <span className="text-[10px] text-bsm-text-muted border border-bsm-border px-1.5 py-0.5">
                            {opp.source}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lost stage collapsed */}
        {byStage.lost.length > 0 && (
          <div className="mt-6 border border-bsm-border p-4">
            <p className="text-xs text-bsm-text-muted uppercase tracking-widest">
              Descartadas ({byStage.lost.length})
            </p>
          </div>
        )}
      </div>
    )
  }

  // Simple list for Essential
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Oportunidades</h1>
        <p className="text-sm text-bsm-text-muted">Bandeja de contactos recibidos</p>
      </div>

      {/* Upsell pipeline */}
      <div className="border border-gold/20 bg-surface p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gold tracking-widest uppercase mb-1">Pipeline disponible en Professional</p>
          <p className="text-sm text-bsm-text-secondary">
            Gestiona las oportunidades en un kanban con estados, historial y asignación por sede.
          </p>
        </div>
        <Link href="/profesionales/precios" className="btn-outline text-sm px-4 flex-shrink-0">
          Ver planes →
        </Link>
      </div>

      {/* Simple list */}
      <div className="border border-bsm-border divide-y divide-bsm-border">
        {opportunities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-bsm-text-muted">Aún no tienes oportunidades recibidas.</p>
          </div>
        ) : (
          opportunities.slice(0, 50).map((opp) => (
            <div key={opp.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-bsm-text-primary font-medium truncate">
                  {opp.buyer_name ?? 'Comprador anónimo'}
                </p>
                <p className="text-xs text-bsm-text-muted">
                  {new Date(opp.created_at).toLocaleDateString('es-ES')} · {opp.source ?? 'web'}
                </p>
              </div>
              <span className={`text-[10px] border px-2 py-1 uppercase tracking-widest flex-shrink-0 ${STAGE_COLORS[opp.status]}`}>
                {STAGE_LABELS[opp.status]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function mapLeadStatus(status: string): Stage {
  const map: Record<string, Stage> = {
    new: 'new',
    contacted: 'contacted',
    negotiating: 'appointment',
    closed: 'won',
    discarded: 'lost',
  }
  return map[status] ?? 'new'
}
