import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getOrganizationIdForUser, getEntitlements } from '@/lib/entitlements'

// ─── Pipeline stages ──────────────────────────────────────────────────────────

const PIPELINE_STAGES = ['new', 'contacted', 'appointment', 'won', 'lost'] as const
type Stage = typeof PIPELINE_STAGES[number]

const STAGE_LABELS: Record<Stage, string> = {
  new:         'Nueva',
  contacted:   'Contactada',
  appointment: 'Cita',
  won:         'Ganada',
  lost:        'Perdida',
}

const STAGE_COLORS: Record<Stage, string> = {
  new:         'border-blue-400/30 bg-blue-400/5',
  contacted:   'border-amber-400/30 bg-amber-400/5',
  appointment: 'border-purple-400/30 bg-purple-400/5',
  won:         'border-emerald-400/30 bg-emerald-400/5',
  lost:        'border-red-400/30 bg-red-400/5',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Score = 'hot' | 'warm' | 'cold'

interface Qualification {
  score?:      Score
  intent?:     string
  budget_range?: string
  timeline?:   string
  summary?:    string
  next_action?: string
  qualification_partial?: boolean
  session_id?: string
}

type Opportunity = {
  id:              string
  status:          Stage
  created_at:      string
  buyer_name?:     string
  buyer_email?:    string
  source_channel?: string
  qualification?:  Qualification | null
  loss_reason?:    string | null
  assigned_to?:    string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapLeadStatus(status: string): Stage {
  const map: Record<string, Stage> = {
    new: 'new', contacted: 'contacted', negotiating: 'appointment',
    appointment: 'appointment', closed: 'won', discarded: 'lost', lost: 'lost',
  }
  return map[status] ?? 'new'
}

function ageDays(created_at: string): number {
  return Math.floor((Date.now() - new Date(created_at).getTime()) / 86_400_000)
}

// ─── Score badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: Score }) {
  const map = {
    hot:  { icon: '🔥', label: 'Caliente', cls: 'text-orange-400 border-orange-400/30 bg-orange-400/5' },
    warm: { icon: '🟡', label: 'Templado', cls: 'text-amber-400 border-amber-400/30 bg-amber-400/5'   },
    cold: { icon: '⚪', label: 'Frío',     cls: 'text-[#737373] border-[#2A2A2A] bg-transparent'      },
  }
  const { icon, label, cls } = map[score]
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] border ${cls}`}>
      {icon} {label}
    </span>
  )
}

// ─── Alert: hot lead stale > 24h ─────────────────────────────────────────────

function HotAlert({ opp }: { opp: Opportunity }) {
  const hot    = opp.qualification?.score === 'hot'
  const stale  = ageDays(opp.created_at) >= 1
  if (!hot || !stale || opp.status === 'won' || opp.status === 'lost') return null
  return (
    <span className="inline-block px-1.5 py-0.5 text-[10px] border border-red-400/40 text-red-400 bg-red-400/5 mt-1">
      ⚠ Lead caliente sin actualizar
    </span>
  )
}

// ─── Qualification detail block ───────────────────────────────────────────────

function QualificationBlock({ q }: { q: Qualification }) {
  const rows = [
    q.intent       && { label: 'Intención',    value: q.intent },
    q.budget_range && { label: 'Presupuesto',  value: q.budget_range },
    q.timeline     && { label: 'Plazo',        value: q.timeline },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="mt-2 pt-2 border-t border-bsm-border space-y-1">
      {q.score && <ScoreBadge score={q.score} />}
      {rows.map(r => (
        <div key={r.label} className="flex gap-1.5 text-[10px]">
          <span className="text-bsm-text-muted min-w-[72px]">{r.label}</span>
          <span className="text-bsm-text-secondary truncate">{r.value}</span>
        </div>
      ))}
      {q.summary && (
        <p className="text-[10px] text-bsm-text-muted italic leading-relaxed pt-0.5">{q.summary}</p>
      )}
      {q.next_action && (
        <p className="text-[10px] text-gold leading-relaxed">→ {q.next_action}</p>
      )}
      {q.qualification_partial && (
        <span className="text-[10px] text-[#737373] border border-[#2A2A2A] px-1.5 py-0.5">Cualificación parcial</span>
      )}
    </div>
  )
}

// ─── Source channel label ─────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  ficha_form:      'Formulario',
  ficha_assistant: 'Asistente',
  whatsapp_click:  'WhatsApp',
  phone_click:     'Llamada',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OportunidadesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const orgId = await getOrganizationIdForUser(user.id)
  const ent   = orgId ? await getEntitlements(orgId) : null

  const hasPipeline = ent?.features['pipeline']?.included &&
                      ent?.features['pipeline']?.status !== 'future'

  const { data: dealer } = await admin
    .from('dealers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) redirect('/registro')

  const { data: leads } = await admin
    .from('leads')
    .select('id, status, created_at, buyer_name, buyer_email, source_channel, qualification, loss_reason, assigned_to')
    .eq('dealer_id', dealer.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const opportunities: Opportunity[] = (leads ?? []).map((l) => ({
    id:              l.id,
    status:          mapLeadStatus(l.status),
    created_at:      l.created_at,
    buyer_name:      l.buyer_name,
    buyer_email:     l.buyer_email,
    source_channel:  l.source_channel,
    qualification:   l.qualification as Qualification | null,
    loss_reason:     l.loss_reason,
    assigned_to:     l.assigned_to,
  }))

  // ── Kanban view (Professional / Elite) ─────────────────────────────────────
  if (hasPipeline) {
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
            <div key={stage} className="flex-shrink-0 w-72">
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
                  byStage[stage].map((opp) => {
                    const q     = opp.qualification
                    const score = q?.score
                    return (
                      <div key={opp.id} className={`border p-3 ${STAGE_COLORS[stage]}`}>
                        {/* Header row: name + score */}
                        <div className="flex items-start justify-between gap-1.5 mb-0.5">
                          <p className="text-sm text-bsm-text-primary font-medium truncate flex-1">
                            {opp.buyer_name ?? 'Comprador anónimo'}
                          </p>
                          {score && <ScoreBadge score={score} />}
                        </div>

                        <p className="text-xs text-bsm-text-muted truncate">{opp.buyer_email ?? '—'}</p>

                        {/* Hot alert */}
                        <HotAlert opp={opp} />

                        {/* Qualification data if available */}
                        {q?.intent || q?.budget_range || q?.timeline ? (
                          <div className="mt-2 space-y-0.5">
                            {q.intent       && <p className="text-[10px] text-bsm-text-muted">Intención: <span className="text-bsm-text-secondary">{q.intent}</span></p>}
                            {q.budget_range && <p className="text-[10px] text-bsm-text-muted">Presupuesto: <span className="text-bsm-text-secondary">{q.budget_range}</span></p>}
                          </div>
                        ) : null}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-bsm-text-muted">
                            {new Date(opp.created_at).toLocaleDateString('es-ES')}
                          </span>
                          {opp.source_channel && (
                            <span className="text-[10px] text-bsm-text-muted border border-bsm-border px-1.5 py-0.5">
                              {SOURCE_LABELS[opp.source_channel] ?? opp.source_channel}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lost/descartadas collapsed */}
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

  // ── List view (Essential) ───────────────────────────────────────────────────
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

      <div className="border border-bsm-border divide-y divide-bsm-border">
        {opportunities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-bsm-text-muted">Aún no tienes oportunidades recibidas.</p>
          </div>
        ) : (
          opportunities.slice(0, 50).map((opp) => {
            const q = opp.qualification
            return (
              <div key={opp.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-bsm-text-primary font-medium truncate">
                      {opp.buyer_name ?? 'Comprador anónimo'}
                    </p>
                    <p className="text-xs text-bsm-text-muted">
                      {new Date(opp.created_at).toLocaleDateString('es-ES')}
                      {opp.source_channel && ` · ${SOURCE_LABELS[opp.source_channel] ?? opp.source_channel}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {q?.score && <ScoreBadge score={q.score} />}
                    <span className={`text-[10px] border px-2 py-1 uppercase tracking-widest ${STAGE_COLORS[opp.status]}`}>
                      {STAGE_LABELS[opp.status]}
                    </span>
                  </div>
                </div>
                {/* Show qualification summary if present */}
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
