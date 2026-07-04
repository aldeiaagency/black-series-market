'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Phone } from 'lucide-react'

export interface CustomRequest {
  id:            string
  name:          string
  email:         string
  phone?:        string | null
  vehicle_type?: string | null
  brand?:        string | null
  model?:        string | null
  version?:      string | null
  budget_text?:  string | null
  location?:     string | null
  timeframe?:    string | null
  financing?:    string | null
  trade_in?:     string | null
  message?:      string | null
  status:        string
  created_at:    string
}

interface Props {
  requests: CustomRequest[]
  isElite:  boolean
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  car:        'Turismo',
  motorcycle: 'Moto',
  any:        'Cualquier tipo',
}

const TIMEFRAME_LABELS: Record<string, string> = {
  immediate:    'Inmediata',
  '1_3_months': '1–3 meses',
  '3_6_months': '3–6 meses',
  exploring:    'Explorando opciones',
}

const FINANCING_LABELS: Record<string, string> = {
  yes:   'Sí',
  no:    'No',
  maybe: 'No lo sé',
}

function timeAgoShort(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h    = Math.floor(diff / 3_600_000)
  if (h < 1)  return 'hace menos de 1h'
  if (h < 24) return `hace ${h}h`
  const d = Math.floor(h / 24)
  return `hace ${d} día${d !== 1 ? 's' : ''}`
}

function refCode(id: string) {
  return id.slice(0, 8).toUpperCase()
}

export default function SolicitudesBoard({ requests, isElite }: Props) {
  const [selected, setSelected] = useState<CustomRequest | null>(null)

  useEffect(() => {
    if (!selected) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selected])

  if (requests.length === 0) {
    return (
      <div className="border border-dashed border-bsm-border p-16 text-center">
        <p className="text-sm text-bsm-text-muted">
          {isElite
            ? 'No hay solicitudes activas en este momento.'
            : 'No hay solicitudes abiertas para acceso estándar ahora mismo.'}
        </p>
        <p className="text-xs text-bsm-text-muted mt-1">
          Vuelve más tarde o activa notificaciones cuando se configure la integración.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {requests.map(req => {
          const ageMs     = Date.now() - new Date(req.created_at).getTime()
          const isNew     = ageMs < 24 * 60 * 60 * 1000
          const typeLabel = req.vehicle_type ? (VEHICLE_TYPE_LABELS[req.vehicle_type] ?? req.vehicle_type) : null
          const timeLabel = req.timeframe    ? (TIMEFRAME_LABELS[req.timeframe]        ?? req.timeframe)    : null
          const vehicleName = [req.brand, req.model, req.version].filter(Boolean).join(' ') || 'Vehículo sin especificar'
          const ref = refCode(req.id)

          return (
            <button
              key={req.id}
              onClick={() => setSelected(req)}
              className={`w-full text-left border bg-surface p-5 hover:border-[#C6A64B]/40 transition-colors ${
                isNew && isElite ? 'border-[#C6A64B]/30' : 'border-bsm-border'
              }`}
            >
              {/* Row 1: badges + age */}
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {typeLabel && (
                    <span className="text-[10px] border border-bsm-border px-2 py-0.5 text-bsm-text-muted uppercase tracking-widest">
                      {typeLabel}
                    </span>
                  )}
                  {req.financing === 'yes' && (
                    <span className="text-[10px] border border-bsm-border px-2 py-0.5 text-bsm-text-muted">
                      Con financiación
                    </span>
                  )}
                  {req.trade_in === 'yes' && (
                    <span className="text-[10px] border border-bsm-border px-2 py-0.5 text-bsm-text-muted">
                      Entrega vehículo
                    </span>
                  )}
                  {isNew && isElite && (
                    <span className="text-[10px] border border-[#C6A64B]/40 bg-[#C6A64B]/5 px-2 py-0.5 text-[#C6A64B]">
                      Exclusivo · menos de 24h
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-bsm-text-muted flex-shrink-0">
                  {timeAgoShort(req.created_at)}
                </span>
              </div>

              {/* Row 2: vehicle name */}
              <h3 className="text-lg font-light text-bsm-text-primary mb-3">{vehicleName}</h3>

              {/* Row 3: key specs */}
              <div className="flex items-start gap-8 flex-wrap">
                {req.budget_text && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted uppercase tracking-wider block mb-0.5">Presupuesto</span>
                    <span className="text-sm text-bsm-text-secondary">{req.budget_text}</span>
                  </div>
                )}
                {timeLabel && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted uppercase tracking-wider block mb-0.5">Plazo</span>
                    <span className="text-sm text-bsm-text-secondary">{timeLabel}</span>
                  </div>
                )}
                {req.location && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted uppercase tracking-wider block mb-0.5">Ubicación</span>
                    <span className="text-sm text-bsm-text-secondary">{req.location}</span>
                  </div>
                )}
              </div>

              {/* Footer: ref + hint */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-bsm-border">
                <span className="text-[10px] text-bsm-text-muted font-mono">#{ref}</span>
                <span className="text-xs text-bsm-text-muted">Ver solicitud completa →</span>
              </div>
            </button>
          )
        })}
      </div>

      {selected && (
        <RequestModal
          req={selected}
          isElite={isElite}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

function RequestModal({
  req,
  isElite,
  onClose,
}: {
  req:     CustomRequest
  isElite: boolean
  onClose: () => void
}) {
  const ageMs     = Date.now() - new Date(req.created_at).getTime()
  const isNew     = ageMs < 24 * 60 * 60 * 1000
  const typeLabel = req.vehicle_type ? (VEHICLE_TYPE_LABELS[req.vehicle_type] ?? req.vehicle_type) : null
  const timeLabel = req.timeframe    ? (TIMEFRAME_LABELS[req.timeframe]        ?? req.timeframe)    : null
  const finLabel  = req.financing    ? (FINANCING_LABELS[req.financing]        ?? req.financing)    : null
  const vehicleName = [req.brand, req.model, req.version].filter(Boolean).join(' ') || 'Vehículo sin especificar'
  const ref = refCode(req.id)
  const mailSubject = encodeURIComponent(`Solicitud a la carta #${ref}`)
  const mailBody = encodeURIComponent(
    `Hola,\n\nCreo que puedo atender la solicitud #${ref} (${vehicleName}).\n\nOs contacto para coordinar.`
  )

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg bg-[#0A0A0A] border border-bsm-border flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-6 border-b border-bsm-border flex-shrink-0">
            <div>
              <h2 className="font-display text-xl font-light text-bsm-text-primary mb-1">{vehicleName}</h2>
              <p className="text-[10px] text-bsm-text-muted font-mono">Ref. {ref}</p>
            </div>
            <button onClick={onClose} className="text-bsm-text-muted hover:text-bsm-text-primary flex-shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">

            {/* Contact */}
            <div>
              <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-3">Contacto</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-bsm-text-muted">Nombre</span>
                  <span className="text-sm text-bsm-text-primary">{req.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-bsm-text-muted">Email</span>
                  <a
                    href={`mailto:${req.email}`}
                    className="text-sm text-bsm-text-secondary hover:text-[#C6A64B] flex items-center gap-1.5 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    <Mail className="w-3 h-3" />
                    {req.email}
                  </a>
                </div>
                {req.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-bsm-text-muted">Teléfono</span>
                    <a
                      href={`tel:${req.phone}`}
                      className="text-sm text-bsm-text-secondary hover:text-[#C6A64B] flex items-center gap-1.5 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <Phone className="w-3 h-3" />
                      {req.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle details */}
            <div className="border-t border-bsm-border pt-6">
              <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-3">Vehículo buscado</p>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                {typeLabel && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted block mb-0.5">Tipo</span>
                    <span className="text-sm text-bsm-text-secondary">{typeLabel}</span>
                  </div>
                )}
                {req.brand && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted block mb-0.5">Marca</span>
                    <span className="text-sm text-bsm-text-secondary">{req.brand}</span>
                  </div>
                )}
                {req.model && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted block mb-0.5">Modelo</span>
                    <span className="text-sm text-bsm-text-secondary">{req.model}</span>
                  </div>
                )}
                {req.version && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted block mb-0.5">Versión</span>
                    <span className="text-sm text-bsm-text-secondary">{req.version}</span>
                  </div>
                )}
                {req.budget_text && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted block mb-0.5">Presupuesto</span>
                    <span className="text-sm text-bsm-text-secondary">{req.budget_text}</span>
                  </div>
                )}
                {req.location && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted block mb-0.5">Ubicación</span>
                    <span className="text-sm text-bsm-text-secondary">{req.location}</span>
                  </div>
                )}
                {timeLabel && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted block mb-0.5">Plazo</span>
                    <span className="text-sm text-bsm-text-secondary">{timeLabel}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="border-t border-bsm-border pt-6">
              <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-3">Preferencias</p>
              <div className="flex gap-8">
                {finLabel && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted block mb-0.5">Financiación</span>
                    <span className="text-sm text-bsm-text-secondary">{finLabel}</span>
                  </div>
                )}
                {req.trade_in && (
                  <div>
                    <span className="text-[10px] text-bsm-text-muted block mb-0.5">Entrega vehículo</span>
                    <span className="text-sm text-bsm-text-secondary">{req.trade_in === 'yes' ? 'Sí' : 'No'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {req.message && (
              <div className="border-t border-bsm-border pt-6">
                <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-3">Detalles adicionales</p>
                <p className="text-sm text-bsm-text-secondary leading-relaxed whitespace-pre-line">{req.message}</p>
              </div>
            )}

            {isNew && isElite && (
              <div className="border-t border-bsm-border pt-4">
                <span className="text-[10px] border border-[#C6A64B]/40 bg-[#C6A64B]/5 px-3 py-1.5 text-[#C6A64B]">
                  Acceso exclusivo · menos de 24h
                </span>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-bsm-border p-6 flex-shrink-0">
            <a
              href={`mailto:hola@blacklabelmarket.es?subject=${mailSubject}&body=${mailBody}`}
              className="block w-full text-center text-sm border border-[#C6A64B]/40 px-6 py-3 text-[#C6A64B] hover:bg-[#C6A64B]/5 transition-colors"
            >
              Tengo este vehículo →
            </a>
            <p className="text-[10px] text-bsm-text-muted text-center mt-3">
              Indícanos la referencia y te conectamos con el comprador.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
