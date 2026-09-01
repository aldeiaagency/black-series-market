'use client'

import { useState, useRef } from 'react'
import { ChevronDown, ChevronRight, Phone, MessageCircle, Mail, X, Trash2 } from 'lucide-react'
import { useModalA11y } from '@/lib/hooks/useModalA11y'

// ── Pipeline definition ────────────────────────────────────────────────────────

export type Stage =
  | 'new' | 'contacted' | 'negotiating' | 'appointment'
  | 'reserved' | 'closed' | 'lost' | 'discarded'

const ACTIVE_STAGES: Stage[] = [
  'new', 'contacted', 'appointment', 'closed', 'lost',
]

const ALL_STAGES: Stage[] = [...ACTIVE_STAGES, 'discarded']

const STAGE_LABELS: Record<Stage, string> = {
  new:         'Nueva',
  contacted:   'Contactada',
  negotiating: 'Contactada',
  appointment: 'Cita',
  reserved:    'Cita',
  closed:      'Ganada',
  lost:        'Perdida',
  discarded:   'Archivada',
}

const STAGE_COLORS: Record<Stage, { card: string; header: string; badge: string }> = {
  new:         { card: 'border-blue-400/30 bg-blue-400/5',       header: 'text-blue-400',      badge: 'border-blue-400/30 text-blue-400' },
  contacted:   { card: 'border-amber-400/30 bg-amber-400/5',     header: 'text-amber-400',     badge: 'border-amber-400/30 text-amber-400' },
  negotiating: { card: 'border-purple-400/30 bg-purple-400/5',   header: 'text-purple-400',    badge: 'border-purple-400/30 text-purple-400' },
  appointment: { card: 'border-violet-400/30 bg-violet-400/5',   header: 'text-violet-400',    badge: 'border-violet-400/30 text-violet-400' },
  reserved:    { card: 'border-emerald-400/30 bg-emerald-400/5', header: 'text-emerald-400',   badge: 'border-emerald-400/30 text-emerald-400' },
  closed:      { card: 'border-gold/30 bg-gold/5',    header: 'text-gold',     badge: 'border-gold/30 text-gold' },
  lost:        { card: 'border-red-400/20 bg-red-400/5',         header: 'text-red-400/70',    badge: 'border-red-400/30 text-red-400/70' },
  discarded:   { card: 'border-bsm-border bg-[#111]/60',         header: 'text-[#555]',        badge: 'border-[#333] text-[#555]' },
}

// ── Types ──────────────────────────────────────────────────────────────────────

type Score = 'hot' | 'warm' | 'cold'

interface Qualification {
  score?:                 Score
  intent?:               string
  budget_range?:         string
  timeline?:             string
  summary?:              string
  next_action?:          string
  qualification_partial?: boolean
}

interface Vehicle {
  brand_name?: string
  model_name?: string
  year?:       number
}

interface LeadHandoff {
  delivery_confirmed_at: string | null
  acknowledged_at: string | null
  decision: 'accepted' | 'rejected' | null
  first_contact_at: string | null
}

export interface Lead {
  id:              string
  status:          Stage
  created_at:      string
  buyer_name?:     string | null
  buyer_email?:    string | null
  buyer_phone?:    string | null
  buyer_whatsapp?: string | null
  message?:        string | null
  source_channel?: string | null
  qualification?:  Qualification | null
  vehicle?:        Vehicle | null
  handoff?:        LeadHandoff | null
}

function HandoffControls({ lead }: { lead: Lead }) {
  const [handoff, setHandoff] = useState<LeadHandoff | null>(lead.handoff ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function record(fulfillment_event: string) {
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fulfillment_event }),
    })
    const result = await res.json().catch(() => null)
    if (res.ok && result?.handoff) setHandoff(result.handoff)
    else setError(res.status === 409 ? 'La transición no es válida para este handoff.' : 'No se pudo guardar.')
    setSaving(false)
  }

  if (!handoff) return null
  const delivered = !!handoff.delivery_confirmed_at
  const acknowledged = !!handoff.acknowledged_at
  const contacted = !!handoff.first_contact_at
  const rejected = handoff.decision === 'rejected'
  const accepted = handoff.decision === 'accepted'

  return (
    <section>
      <h3 className='text-[10px] uppercase tracking-widest text-bsm-text-muted mb-3'>Cumplimiento del handoff</h3>
      <div className='flex flex-wrap gap-1.5 mb-3'>
        <span className='text-[10px] border border-bsm-border px-2 py-1'>Persistido</span>
        {delivered && <span className='text-[10px] border border-blue-400/30 text-blue-400 px-2 py-1'>Entregado</span>}
        {acknowledged && <span className='text-[10px] border border-amber-400/30 text-amber-400 px-2 py-1'>Acusado</span>}
        {accepted && <span className='text-[10px] border border-emerald-400/30 text-emerald-400 px-2 py-1'>Aceptado</span>}
        {rejected && <span className='text-[10px] border border-red-400/30 text-red-400 px-2 py-1'>Rechazado · recuperar</span>}
        {contacted && <span className='text-[10px] border border-violet-400/30 text-violet-400 px-2 py-1'>Primer contacto</span>}
      </div>
      <div className='flex flex-wrap gap-2'>
        {delivered && !acknowledged && !contacted && (
          <button disabled={saving} onClick={() => record('handoff_acknowledged')} className='text-xs border border-bsm-border px-3 py-1.5 disabled:opacity-40'>Registrar acuse</button>
        )}
        {acknowledged && !handoff.decision && !contacted && (<>
          <button disabled={saving} onClick={() => record('handoff_accepted')} className='text-xs border border-emerald-400/30 text-emerald-400 px-3 py-1.5 disabled:opacity-40'>Aceptar</button>
          <button disabled={saving} onClick={() => record('handoff_rejected')} className='text-xs border border-red-400/30 text-red-400 px-3 py-1.5 disabled:opacity-40'>Rechazar</button>
        </>)}
        {!contacted && !rejected && (
          <button disabled={saving} onClick={() => record('handoff_first_contact')} className='text-xs border border-violet-400/30 text-violet-400 px-3 py-1.5 disabled:opacity-40'>Registrar primer contacto</button>
        )}
      </div>
      {error && <p className='text-xs text-red-400 mt-2'>{error}</p>}
    </section>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  ficha_form:      'Formulario',
  ficha_assistant: 'Asistente IA',
  whatsapp_click:  'WhatsApp',
  phone_click:     'Llamada',
}

function ScoreBadge({ score }: { score: Score }) {
  const map = {
    hot:  { icon: '🔥', cls: 'text-orange-400 border-orange-400/30 bg-orange-400/5' },
    warm: { icon: '🟡', cls: 'text-amber-400 border-amber-400/30 bg-amber-400/5'   },
    cold: { icon: '⚪', cls: 'text-[#9E9E9E] border-bsm-border'                      },
  }
  const { icon, cls } = map[score]
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] border ${cls}`}>
      {icon}
    </span>
  )
}

// ── MovePopover (fixed-position to escape overflow containers) ─────────────────

function MovePopover({
  leadId,
  currentStatus,
  onMove,
  disabled,
}: {
  leadId:        string
  currentStatus: Stage
  onMove:        (id: string, stage: Stage) => void
  disabled:      boolean
}) {
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  function open(e: React.MouseEvent) {
    e.stopPropagation()
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setDropPos({ top: rect.bottom + 4, left: rect.left })
  }

  const targets = ALL_STAGES.filter(s => s !== currentStatus)

  return (
    <>
      <button
        ref={btnRef}
        onClick={open}
        disabled={disabled}
        className="text-[10px] text-bsm-text-muted hover:text-bsm-text-secondary border border-bsm-border px-2 py-0.5 hover:border-bsm-text-muted transition-colors disabled:opacity-40 leading-none"
      >
        Mover →
      </button>

      {dropPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropPos(null)} />
          <div
            className="fixed z-50 bg-[#161616] border border-bsm-border shadow-2xl min-w-[150px] py-1"
            style={{ top: dropPos.top, left: dropPos.left }}
          >
            {targets.map((s, i) => {
              const isClose = s === 'lost' || s === 'discarded'
              const prevIsClose = i > 0 && (targets[i - 1] === 'lost' || targets[i - 1] === 'discarded')
              return (
                <button
                  key={s}
                  onClick={() => { onMove(leadId, s); setDropPos(null) }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-surface ${
                    isClose && !prevIsClose
                      ? 'text-bsm-text-muted border-t border-bsm-border mt-1 pt-2 hover:text-bsm-text-secondary'
                      : isClose
                      ? 'text-bsm-text-muted hover:text-bsm-text-secondary'
                      : 'text-bsm-text-secondary hover:text-bsm-text-primary'
                  }`}
                >
                  {STAGE_LABELS[s]}
                </button>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

// ── Lead detail modal ─────────────────────────────────────────────────────────

function LeadModal({
  lead,
  canManage,
  isPending,
  onClose,
  onMove,
  onDelete,
}: {
  lead:       Lead
  canManage:  boolean
  isPending:  boolean
  onClose:    () => void
  onMove:     (id: string, stage: Stage) => void
  onDelete:   (id: string) => Promise<void>
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const dialogRef = useModalA11y(true, onClose) // focus-trap + Escape + retorno de foco

  const q = lead.qualification
  const qualRows = [
    { label: 'Intención',    value: q?.intent },
    { label: 'Presupuesto',  value: q?.budget_range },
    { label: 'Plazo',        value: q?.timeline },
  ].filter(r => r.value) as { label: string; value: string }[]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Detalle del lead" className="relative bg-[#0D0D0D] border border-bsm-border w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-bsm-border sticky top-0 bg-[#0D0D0D] z-10">
          <div>
            <h2 className="text-xl font-light text-bsm-text-primary">
              {lead.buyer_name ?? 'Comprador anónimo'}
            </h2>
            {lead.vehicle?.brand_name && (
              <p className="text-sm text-gold/80 mt-0.5">
                {lead.vehicle.brand_name} {lead.vehicle.model_name} {lead.vehicle.year}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {q?.score && <ScoreBadge score={q.score} />}
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${STAGE_COLORS[lead.status].badge}`}>
              {STAGE_LABELS[lead.status]}
            </span>
            <button
              onClick={onClose}
              className="text-bsm-text-muted hover:text-bsm-text-primary transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact info */}
          <section>
            <h3 className="text-[10px] uppercase tracking-widest text-bsm-text-muted mb-3">Contacto</h3>
            <div className="space-y-2">
              {lead.buyer_email && (
                <a
                  href={`mailto:${lead.buyer_email}`}
                  className="flex items-center gap-2.5 text-sm text-bsm-text-secondary hover:text-gold transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0 text-bsm-text-muted" />
                  {lead.buyer_email}
                </a>
              )}
              {lead.buyer_phone && (
                <a
                  href={`tel:${lead.buyer_phone}`}
                  className="flex items-center gap-2.5 text-sm text-bsm-text-secondary hover:text-gold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 flex-shrink-0 text-bsm-text-muted" />
                  {lead.buyer_phone}
                </a>
              )}
              {lead.buyer_whatsapp && (
                <a
                  href={`https://wa.me/${lead.buyer_whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  WhatsApp · {lead.buyer_whatsapp}
                </a>
              )}
              {!lead.buyer_email && !lead.buyer_phone && !lead.buyer_whatsapp && (
                <p className="text-sm text-bsm-text-muted">Sin datos de contacto</p>
              )}
            </div>
          </section>

          {/* Message */}
          {lead.message && (
            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-bsm-text-muted mb-3">Mensaje</h3>
              <p className="text-sm text-bsm-text-secondary leading-relaxed whitespace-pre-line">
                {lead.message}
              </p>
            </section>
          )}

          {/* AI qualification */}
          {q && (qualRows.length > 0 || q.summary) && (
            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-bsm-text-muted mb-3">
                Cualificación del agente
              </h3>
              <div className="space-y-2.5">
                {q.score && (
                  <div className="mb-1">
                    <ScoreBadge score={q.score} />
                  </div>
                )}
                {qualRows.map(r => (
                  <div key={r.label} className="flex gap-4">
                    <span className="text-xs text-bsm-text-muted min-w-[80px]">{r.label}</span>
                    <span className="text-xs text-bsm-text-secondary">{r.value}</span>
                  </div>
                ))}
                {q.summary && (
                  <p className="text-xs text-bsm-text-muted italic leading-relaxed pt-1">{q.summary}</p>
                )}
                {q.next_action && (
                  <p className="text-xs text-gold leading-relaxed">→ {q.next_action}</p>
                )}
                {q.qualification_partial && (
                  <span className="text-[10px] text-[#9E9E9E] border border-bsm-border px-2 py-0.5 inline-block">
                    Cualificación parcial
                  </span>
                )}
              </div>
            </section>
          )}

          {canManage && <HandoffControls lead={lead} />}

          {/* Meta */}
          <div className="flex items-center gap-3 pt-2 border-t border-bsm-border">
            <span className="text-xs text-bsm-text-muted">
              {new Date(lead.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {lead.source_channel && (
              <span className="text-[10px] border border-bsm-border px-2 py-0.5 text-bsm-text-muted">
                {SOURCE_LABELS[lead.source_channel] ?? lead.source_channel}
              </span>
            )}
          </div>

          {/* Move actions */}
          {canManage && (
            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-bsm-text-muted mb-3">Mover a</h3>
              <div className="flex flex-wrap gap-1.5">
                {ALL_STAGES.filter(s => s !== lead.status).map(s => (
                  <button
                    key={s}
                    onClick={() => { onMove(lead.id, s); onClose() }}
                    disabled={isPending}
                    className="text-xs border border-bsm-border px-3 py-1.5 text-bsm-text-secondary hover:border-bsm-text-muted hover:text-bsm-text-primary transition-colors disabled:opacity-40"
                  >
                    {STAGE_LABELS[s]}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Delete */}
          <div className="pt-2 border-t border-bsm-border">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-xs text-bsm-text-muted hover:text-red-400 transition-colors py-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar oportunidad
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setDeleting(true)
                    await onDelete(lead.id)
                    setDeleting(false)
                    onClose()
                  }}
                  disabled={deleting}
                  className="flex items-center gap-1.5 text-xs bg-red-900/30 border border-red-500/40 text-red-400 hover:bg-red-900/50 transition-colors px-3 py-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  {deleting ? 'Eliminando…' : 'Confirmar borrado'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-bsm-text-muted hover:text-bsm-text-primary transition-colors px-3 py-1.5 border border-bsm-border"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Compact kanban card ───────────────────────────────────────────────────────

function LeadCard({
  lead,
  canManage,
  onMove,
  isPending,
  onOpen,
}: {
  lead:       Lead
  canManage:  boolean
  onMove:     (id: string, stage: Stage) => void
  isPending:  boolean
  onOpen:     () => void
}) {
  const { card } = STAGE_COLORS[lead.status]
  const q = lead.qualification
  const isGray = lead.status === 'discarded'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver lead de ${lead.buyer_name ?? 'comprador anónimo'}`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
      className={`border p-3 cursor-pointer hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${card} ${isPending ? 'opacity-50' : ''} ${isGray ? 'opacity-55' : ''}`}
    >
      {/* Name + score */}
      <div className="flex items-start justify-between gap-1.5 mb-0.5">
        <p className={`text-sm font-medium truncate flex-1 ${isGray ? 'text-bsm-text-muted' : 'text-bsm-text-primary'}`}>
          {lead.buyer_name ?? 'Anónimo'}
        </p>
        {q?.score && !isGray && <ScoreBadge score={q.score} />}
      </div>

      {/* Vehicle */}
      {lead.vehicle?.brand_name && (
        <p className="text-[10px] text-gold/80 truncate">
          {lead.vehicle.brand_name} {lead.vehicle.model_name} {lead.vehicle.year}
        </p>
      )}

      {/* Email */}
      <p className="text-[10px] text-bsm-text-muted truncate mt-0.5">
        {lead.buyer_email ?? '—'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <span className="text-[10px] text-bsm-text-muted">
          {new Date(lead.created_at).toLocaleDateString('es-ES')}
          {lead.source_channel && ` · ${SOURCE_LABELS[lead.source_channel] ?? lead.source_channel}`}
        </span>
        {canManage && (
          <MovePopover
            leadId={lead.id}
            currentStatus={lead.status}
            onMove={onMove}
            disabled={isPending}
          />
        )}
      </div>
    </div>
  )
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function KanbanBoard({ initialLeads, canManage }: {
  initialLeads: Lead[]
  canManage:    boolean
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [showClosed, setShowClosed] = useState(false)
  const [openLead, setOpenLead] = useState<Lead | null>(null)

  async function handleDelete(id: string) {
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    if (res.ok) setLeads(cur => cur.filter(l => l.id !== id))
  }

  async function handleMove(id: string, stage: Stage) {
    const prev = leads.find(l => l.id === id)
    if (!prev) return

    setLeads(cur => cur.map(l => l.id === id ? { ...l, status: stage } : l))
    setPendingIds(cur => { const s = new Set(cur); s.add(id); return s })

    // Keep modal in sync with optimistic update
    setOpenLead(cur => cur?.id === id ? { ...cur, status: stage } : cur)

    try {
        const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: stage }),
        })
        if (!res.ok) throw new Error()
        const result = await res.json().catch(() => null)
        if (result?.handoff) {
          setLeads(cur => cur.map(l => l.id === id ? { ...l, handoff: result.handoff } : l))
          setOpenLead(cur => cur?.id === id ? { ...cur, handoff: result.handoff } : cur)
        }
    } catch {
      setLeads(cur => cur.map(l => l.id === id ? prev : l))
      setOpenLead(cur => cur?.id === id ? prev : cur)
    } finally {
      setPendingIds(cur => { const s = new Set(cur); s.delete(id); return s })
    }
  }

  const byStage = (stage: Stage) => leads.filter(l => l.status === stage)
  const closedLeads = leads.filter(l => l.status === 'discarded')
  const newCount = leads.filter(l => l.status === 'new').length

  return (
    <>
      {/* Live stats — computed from client state so update on every move */}
      <p className="text-sm text-bsm-text-muted mb-6">
        {newCount > 0 && (
          <span className="text-gold mr-2">{newCount} nueva{newCount !== 1 ? 's' : ''}</span>
        )}
        {leads.length} total
        {!canManage && (
          <span className="ml-2 text-[11px] border border-bsm-border px-1.5 py-0.5">Solo lectura</span>
        )}
      </p>

      {/* Active pipeline columns */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {ACTIVE_STAGES.map(stage => {
          const cards = byStage(stage)
          const { header } = STAGE_COLORS[stage]
          return (
            <div key={stage} className="flex-shrink-0 w-56">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] uppercase tracking-widest font-semibold ${header}`}>
                  {STAGE_LABELS[stage]}
                </span>
                <span className="text-[10px] text-bsm-text-muted bg-surface border border-bsm-border px-2 py-0.5 tabular-nums">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2">
                {cards.length === 0 ? (
                  <div className="border border-dashed border-bsm-border p-4 text-center">
                    <p className="text-[10px] text-bsm-text-muted/50">—</p>
                  </div>
                ) : (
                  cards.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      canManage={canManage}
                      onMove={handleMove}
                      isPending={pendingIds.has(lead.id)}
                      onOpen={() => setOpenLead(lead)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Archived opportunities */}
      {closedLeads.length > 0 && (
        <div className="mt-6 border-t border-bsm-border pt-4">
          <button
            onClick={() => setShowClosed(o => !o)}
            className="flex items-center gap-2 text-xs text-bsm-text-muted hover:text-bsm-text-secondary transition-colors mb-3"
          >
            {showClosed ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Archivadas
            <span className="text-[10px] border border-bsm-border px-1.5 py-0.5">{closedLeads.length}</span>
          </button>
          {showClosed && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-4xl">
              {closedLeads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  canManage={canManage}
                  onMove={handleMove}
                  isPending={pendingIds.has(lead.id)}
                  onOpen={() => setOpenLead(lead)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {openLead && (
        <LeadModal
          lead={openLead}
          canManage={canManage}
          isPending={pendingIds.has(openLead.id)}
          onClose={() => setOpenLead(null)}
          onMove={handleMove}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
