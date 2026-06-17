'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Phone, MessageSquare, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo, LEAD_STATUS_LABELS, getLeadStatusColor } from '@/lib/utils'
import type { LeadStatus } from '@/lib/types'

export interface BandejaLead {
  id: string
  status: string
  created_at: string
  buyer_name: string | null
  buyer_email: string | null
  buyer_phone: string | null
  buyer_whatsapp: string | null
  message: string | null
  source_channel: string | null
  qualification: { summary?: string; intent?: string; budget?: string; timeline?: string } | null
  vehicle: { brand_name: string; model_name: string; year: number } | null
}

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  phone:    'Teléfono',
  email:    'Email',
  form:     'Formulario web',
  assistant:'Asistente IA',
}

const UPDATABLE_STATUSES = [
  { value: 'new',        label: 'Nueva' },
  { value: 'contacted',  label: 'Contactada' },
  { value: 'negotiating',label: 'En negociación' },
  { value: 'appointment',label: 'Cita concertada' },
  { value: 'closed',     label: 'Ganada' },
  { value: 'lost',       label: 'Perdida' },
  { value: 'discarded',  label: 'Descartada' },
]

export default function LeadsBandeja({ initialLeads }: { initialLeads: BandejaLead[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [selected, setSelected] = useState<BandejaLead | null>(null)
  const [updating, setUpdating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!selected) return
    setConfirmDelete(false)
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  async function deleteLead(leadId: string) {
    setDeleting(true)
    const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
    if (res.ok) {
      setLeads(prev => prev.filter(l => l.id !== leadId))
      setSelected(null)
    }
    setDeleting(false)
    setConfirmDelete(false)
  }

  async function updateStatus(leadId: string, newStatus: string) {
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('leads').update({ status: newStatus }).eq('id', leadId)
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    setSelected(prev => prev?.id === leadId ? { ...prev, status: newStatus } : prev)
    setUpdating(false)
  }

  const newCount = leads.filter(l => l.status === 'new').length

  if (leads.length === 0) {
    return (
      <div className="border border-bsm-border p-12 text-center">
        <p className="text-sm text-bsm-text-muted">Aún no tienes oportunidades recibidas.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border border-bsm-border divide-y divide-bsm-border">
        {leads.slice(0, 50).map(lead => {
          const q = lead.qualification
          return (
            <button
              key={lead.id}
              onClick={() => setSelected(lead)}
              className="w-full text-left px-5 py-4 hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-bsm-text-primary font-medium truncate">
                    {lead.buyer_name ?? 'Comprador anónimo'}
                  </p>
                  <p className="text-xs text-bsm-text-muted">
                    {timeAgo(lead.created_at)}
                    {lead.vehicle?.brand_name && (
                      <span className="ml-1">
                        · <span className="text-[#BFA14A]/80">{lead.vehicle.brand_name} {lead.vehicle.model_name}</span>
                      </span>
                    )}
                  </p>
                </div>
                <span className={`badge text-[10px] flex-shrink-0 ${getLeadStatusColor(lead.status as LeadStatus)}`}>
                  {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS] ?? lead.status}
                </span>
              </div>
              {q?.summary && (
                <p className="text-xs text-bsm-text-muted italic leading-relaxed mt-1 text-left">{q.summary}</p>
              )}
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-label="Cerrar"
          />
          <div className="relative z-10 w-full max-w-lg bg-[#0A0A0A] border border-bsm-border shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-bsm-border flex-shrink-0">
              <div>
                <h2 className="font-display text-xl font-light text-bsm-text-primary">
                  {selected.buyer_name ?? 'Comprador anónimo'}
                </h2>
                <p className="text-xs text-bsm-text-muted mt-0.5">{timeAgo(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-bsm-text-muted hover:text-bsm-text-primary transition-colors mt-1 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Vehículo */}
              {selected.vehicle && (
                <div>
                  <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-1">Vehículo de interés</p>
                  <p className="text-sm text-[#BFA14A] font-medium">
                    {selected.vehicle.brand_name} {selected.vehicle.model_name}
                    {selected.vehicle.year && <span className="text-bsm-text-muted font-normal"> · {selected.vehicle.year}</span>}
                  </p>
                </div>
              )}

              {/* Contacto */}
              <div>
                <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-2">Contacto</p>
                <div className="space-y-2">
                  {selected.buyer_email && (
                    <a
                      href={`mailto:${selected.buyer_email}`}
                      className="flex items-center gap-2.5 text-sm text-bsm-text-secondary hover:text-gold transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-bsm-text-muted" />
                      {selected.buyer_email}
                    </a>
                  )}
                  {selected.buyer_phone && (
                    <a
                      href={`tel:${selected.buyer_phone}`}
                      className="flex items-center gap-2.5 text-sm text-bsm-text-secondary hover:text-gold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-bsm-text-muted" />
                      {selected.buyer_phone}
                    </a>
                  )}
                  {selected.buyer_whatsapp && selected.buyer_whatsapp !== selected.buyer_phone && (
                    <a
                      href={`https://wa.me/${selected.buyer_whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-bsm-text-secondary hover:text-gold transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-bsm-text-muted" />
                      WhatsApp · {selected.buyer_whatsapp}
                    </a>
                  )}
                  {selected.source_channel && SOURCE_LABELS[selected.source_channel] && (
                    <p className="text-xs text-bsm-text-muted">
                      Canal: <span className="text-bsm-text-secondary">{SOURCE_LABELS[selected.source_channel]}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Mensaje */}
              {selected.message && (
                <div>
                  <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-2">Mensaje</p>
                  <p className="text-sm text-bsm-text-secondary leading-relaxed whitespace-pre-line border border-bsm-border bg-surface px-4 py-3">
                    {selected.message}
                  </p>
                </div>
              )}

              {/* Cualificación */}
              {selected.qualification?.summary && (
                <div>
                  <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-2">Resumen del asistente</p>
                  <p className="text-sm text-bsm-text-secondary italic leading-relaxed">{selected.qualification.summary}</p>
                  {(selected.qualification.budget || selected.qualification.timeline) && (
                    <div className="mt-2 flex flex-wrap gap-3">
                      {selected.qualification.budget && (
                        <span className="text-[11px] border border-bsm-border px-2 py-1 text-bsm-text-muted">
                          Presupuesto: <span className="text-bsm-text-secondary">{selected.qualification.budget}</span>
                        </span>
                      )}
                      {selected.qualification.timeline && (
                        <span className="text-[11px] border border-bsm-border px-2 py-1 text-bsm-text-muted">
                          Plazo: <span className="text-bsm-text-secondary">{selected.qualification.timeline}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Estado */}
              <div>
                <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-2">Estado</p>
                <select
                  value={selected.status}
                  disabled={updating}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  className="select-base text-sm disabled:opacity-50"
                >
                  {UPDATABLE_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 border-t border-bsm-border flex-shrink-0 space-y-2">
              {selected.buyer_email && (
                <a
                  href={`mailto:${selected.buyer_email}?subject=Tu consulta en Black Label Market`}
                  className="btn-gold w-full justify-center text-sm py-3"
                >
                  <Mail className="w-4 h-4" />
                  Responder por email
                </a>
              )}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 text-xs text-bsm-text-muted hover:text-red-400 transition-colors py-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar oportunidad
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteLead(selected.id)}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-red-900/30 border border-red-500/40 text-red-400 hover:bg-red-900/50 transition-colors py-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    {deleting ? 'Eliminando…' : 'Confirmar borrado'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-bsm-text-muted hover:text-bsm-text-primary transition-colors py-2 px-3 border border-bsm-border"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
