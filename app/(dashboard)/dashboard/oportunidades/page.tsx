import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'
import { getEntitlements } from '@/lib/entitlements'
import KanbanBoard, { type Lead, type Stage } from '@/components/dashboard/KanbanBoard'
import { timeAgo, LEAD_STATUS_LABELS, getLeadStatusColor } from '@/lib/utils'

const VALID_STAGES = new Set([
  'new', 'contacted', 'negotiating', 'appointment',
  'reserved', 'closed', 'lost', 'discarded',
])

function toStage(raw: string | null | undefined): Stage {
  if (raw === 'negotiating') return 'contacted'
  if (raw === 'reserved') return 'appointment'
  return (raw && VALID_STAGES.has(raw) ? raw : 'new') as Stage
}

export default async function OportunidadesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getDealerAccess(user.id)
  if (!access) redirect('/registro')

  const canManage = getPermissions(access.role).canManageOpportunities

  const admin = createAdminClient()
  const ent   = access.orgId ? await getEntitlements(access.orgId) : null

  // Pipeline kanban included in Professional + Elite.
  const hasPipeline = ent?.features['pipeline']?.included ?? false

  const { data: rawLeads } = await admin
    .from('leads')
    .select('id, status, created_at, buyer_name, buyer_email, buyer_phone, buyer_whatsapp, message, source_channel, qualification, vehicle:vehicles(brand_name, model_name, year)')
    .eq('dealer_id', access.dealerId)
    .order('created_at', { ascending: false })
    .limit(200)

  const leads: Lead[] = (rawLeads ?? []).map(l => ({
    id:              l.id,
    status:          toStage(l.status),
    created_at:      l.created_at,
    buyer_name:      l.buyer_name ?? null,
    buyer_email:     l.buyer_email ?? null,
    buyer_phone:     l.buyer_phone ?? null,
    buyer_whatsapp:  l.buyer_whatsapp ?? null,
    message:         l.message ?? null,
    source_channel:  l.source_channel ?? null,
    qualification:   l.qualification as Lead['qualification'] ?? null,
    vehicle:         Array.isArray(l.vehicle) ? l.vehicle[0] ?? null : l.vehicle ?? null,
  }))

  const newCount = leads.filter(l => l.status === 'new').length

  // ── Kanban (Professional / Elite) ────────────────────────────────────────────
  if (hasPipeline) {
    return (
      <div className="p-8 min-h-screen">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-light mb-1">Oportunidades</h1>
            <p className="text-sm text-bsm-text-muted">
              {newCount > 0 && <span className="text-gold mr-2">{newCount} nueva{newCount !== 1 ? 's' : ''}</span>}
              {leads.length} total
              {!canManage && (
                <span className="ml-2 text-[11px] border border-bsm-border px-1.5 py-0.5">Solo lectura</span>
              )}
            </p>
          </div>
        </div>

        <KanbanBoard initialLeads={leads} canManage={canManage} />
      </div>
    )
  }

  // ── Lista básica (Essential) ──────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Oportunidades</h1>
        <p className="text-sm text-bsm-text-muted">
          {newCount > 0 && <span className="text-gold mr-2">{newCount} nueva{newCount !== 1 ? 's' : ''}</span>}
          {leads.length} total
        </p>
      </div>

      {/* Upsell pipeline */}
      <div className="border border-gold/20 bg-surface p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gold tracking-widest uppercase mb-1">Pipeline disponible en Professional</p>
          <p className="text-sm text-bsm-text-secondary">
            Gestiona las oportunidades en un kanban con estados claros: Nueva, Contactada, Cita, Ganada, Perdida y Archivada.
          </p>
        </div>
        <Link href="/dashboard/suscripcion" className="btn-outline text-sm px-4 flex-shrink-0">
          Ver planes →
        </Link>
      </div>

      <div className="border border-bsm-border divide-y divide-bsm-border">
        {leads.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-bsm-text-muted">Aún no tienes oportunidades recibidas.</p>
          </div>
        ) : (
          leads.slice(0, 50).map(opp => {
            const q = opp.qualification
            return (
              <div key={opp.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-bsm-text-primary font-medium truncate">
                      {opp.buyer_name ?? 'Comprador anónimo'}
                    </p>
                    <p className="text-xs text-bsm-text-muted">
                      {timeAgo(opp.created_at)}
                      {opp.vehicle?.brand_name && (
                        <span className="ml-1">· <span className="text-[#BFA14A]/80">{opp.vehicle.brand_name} {opp.vehicle.model_name}</span></span>
                      )}
                    </p>
                  </div>
                  <span className={`badge text-[10px] ${getLeadStatusColor(opp.status)}`}>
                    {LEAD_STATUS_LABELS[opp.status as keyof typeof LEAD_STATUS_LABELS] ?? opp.status}
                  </span>
                </div>
                {q?.summary && (
                  <p className="text-xs text-bsm-text-muted italic leading-relaxed mt-1">{q.summary}</p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
