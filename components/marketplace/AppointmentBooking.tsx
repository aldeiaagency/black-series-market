'use client'

import { useEffect, useState } from 'react'
import { Loader2, Calendar, MapPin, Video, Check, ArrowLeft } from 'lucide-react'

interface Slot { start: string; label: string; day: string }
interface Settings { mode: 'in_person' | 'video' | 'both'; location_text: string | null; instructions: string | null }

interface Props {
  dealerId: string
  vehicleId: string
  vehicleTitle: string
  sessionId: string | null
  onBack: () => void
}

function dayHeader(day: string): string {
  const d = new Date(day + 'T12:00:00')
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
}
function slotTime(label: string): string {
  const parts = label.split('·')
  return (parts[parts.length - 1] || label).trim()
}

export default function AppointmentBooking({ dealerId, vehicleId, vehicleTitle, sessionId, onBack }: Props) {
  const [loading, setLoading]   = useState(true)
  const [slots, setSlots]       = useState<Slot[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [selected, setSelected] = useState<Slot | null>(null)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [done, setDone]         = useState<{ label: string; links: { google: string; outlook: string } } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/assistant/availability?dealer=${encodeURIComponent(dealerId)}`)
        const data = await res.json()
        if (cancelled) return
        setSlots(Array.isArray(data.slots) ? data.slots : [])
        setSettings(data.settings ?? null)
      } catch { if (!cancelled) setSlots([]) }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [dealerId])

  async function confirm() {
    if (!selected || submitting) return
    if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Indica tu nombre y un email válido.'); return
    }
    setError(null); setSubmitting(true)
    try {
      const res = await fetch('/api/assistant/book', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealer_id: dealerId, vehicle_id: vehicleId, session_id: sessionId,
          start: selected.start, buyer_name: name.trim(), buyer_email: email.trim(), buyer_phone: phone.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error === 'slot_unavailable' ? 'Ese hueco se acaba de ocupar. Elige otro.' : 'No se pudo reservar. Inténtalo de nuevo.')
        if (data.error === 'slot_unavailable') setSelected(null)
        return
      }
      setDone({ label: data.label, links: data.calendar_links })
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Confirmada ──────────────────────────────────────────────────────────────
  if (done) return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-10 h-10 bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mb-3">
        <Check className="w-5 h-5 text-emerald-400" />
      </div>
      <p className="font-medium text-bsm-text-primary mb-1">Visita reservada</p>
      <p className="text-xs text-bsm-text-muted max-w-[260px] mb-4">
        {done.label}. El showroom ha recibido tu cita y te enviamos la confirmación por email.
      </p>
      <div className="flex flex-col gap-2 w-full">
        <a href={done.links.google} target="_blank" rel="noopener noreferrer" className="btn-outline w-full justify-center text-xs">
          <Calendar className="w-3.5 h-3.5" /> Añadir a Google Calendar
        </a>
        <a href={done.links.outlook} target="_blank" rel="noopener noreferrer" className="text-center text-xs text-bsm-text-muted hover:text-bsm-text-primary py-1">
          Añadir a Outlook
        </a>
      </div>
    </div>
  )

  // ── Cargando ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-bsm-text-muted" /></div>
  )

  // ── Sin huecos ──────────────────────────────────────────────────────────────
  if (slots.length === 0) return (
    <div className="space-y-3 text-center py-4">
      <p className="text-sm text-bsm-text-primary">No hay huecos disponibles ahora mismo</p>
      <p className="text-xs text-bsm-text-muted">Vuelve al chat y deja tu consulta; el showroom te propondrá una visita.</p>
      <button onClick={onBack} className="text-xs text-gold hover:underline">← Volver al chat</button>
    </div>
  )

  const days = Array.from(new Set(slots.map(s => s.day)))

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-bsm-text-muted hover:text-bsm-text-primary">
        <ArrowLeft className="w-3 h-3" /> Volver al chat
      </button>

      <div className="flex items-start gap-2 p-3 bg-[#0A0A0A] border border-[#1A1A1A]">
        <Calendar className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-bsm-text-primary font-medium">Reservar visita</p>
          <p className="text-xs text-bsm-text-muted">{vehicleTitle}</p>
          {settings && (
            <p className="text-[11px] text-bsm-text-muted mt-1 flex items-center gap-1">
              {settings.mode === 'video' ? <><Video className="w-3 h-3" /> Videollamada</> : <><MapPin className="w-3 h-3" /> {settings.location_text || 'En el showroom'}</>}
            </p>
          )}
        </div>
      </div>

      {!selected ? (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {days.map(day => (
            <div key={day}>
              <p className="text-[10px] uppercase tracking-widest text-bsm-text-muted mb-1.5 capitalize">{dayHeader(day)}</p>
              <div className="flex flex-wrap gap-1.5">
                {slots.filter(s => s.day === day).map(s => (
                  <button key={s.start} onClick={() => setSelected(s)}
                    className="px-3 py-1.5 text-xs border border-bsm-border text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-colors">
                    {slotTime(s.label)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 bg-gold/5 border border-gold/20">
            <span className="text-sm text-bsm-text-primary capitalize">{selected.label}</span>
            <button onClick={() => setSelected(null)} className="text-[11px] text-bsm-text-muted hover:text-gold">Cambiar</button>
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" className="input-base text-sm" />
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Tu email" className="input-base text-sm" />
          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="Teléfono (opcional)" className="input-base text-sm" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button onClick={confirm} disabled={submitting} className="btn-gold w-full justify-center disabled:opacity-40">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar cita'}
          </button>
        </div>
      )}
      {error && !selected && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
