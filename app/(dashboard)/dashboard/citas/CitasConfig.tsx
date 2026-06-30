'use client'

import { useState } from 'react'
import { Loader2, Check, CalendarClock } from 'lucide-react'
import { saveCalendarConfig, type CalendarConfigInput } from './actions'
import type { AvailabilityRules, BookingSettings, Weekday, TimeRange } from '@/lib/booking'

const DAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'Lunes' }, { key: 'tue', label: 'Martes' }, { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' }, { key: 'fri', label: 'Viernes' }, { key: 'sat', label: 'Sábado' }, { key: 'sun', label: 'Domingo' },
]

function rangesToStr(ranges?: TimeRange[]): string {
  return (ranges || []).map(([s, e]) => `${s}-${e}`).join(', ')
}
function parseRanges(str: string): TimeRange[] {
  const out: TimeRange[] = []
  for (const part of str.split(',')) {
    const m = part.trim().match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/)
    if (m) out.push([m[1], m[2]])
  }
  return out
}

interface Props {
  initial: { enabled: boolean; rules: AvailabilityRules; settings: BookingSettings }
}

export default function CitasConfig({ initial }: Props) {
  const [enabled, setEnabled] = useState(initial.enabled)
  const [weekly, setWeekly] = useState<Record<string, string>>(
    Object.fromEntries(DAYS.map(d => [d.key, rangesToStr(initial.rules.weekly[d.key])]))
  )
  const [slot, setSlot] = useState(String(initial.rules.slot_minutes))
  const [notice, setNotice] = useState(String(initial.rules.min_hours_notice))
  const [horizon, setHorizon] = useState(String(initial.rules.max_days_ahead))
  const [mode, setMode] = useState<BookingSettings['mode']>(initial.settings.mode)
  const [location, setLocation] = useState(initial.settings.location_text ?? '')
  const [instructions, setInstructions] = useState(initial.settings.instructions ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSave() {
    setSaving(true); setSaved(false); setError(null)
    const weeklyParsed: Partial<Record<Weekday, TimeRange[]>> = {}
    for (const d of DAYS) weeklyParsed[d.key] = parseRanges(weekly[d.key] || '')
    const input: CalendarConfigInput = {
      enabled,
      slot_minutes: Number(slot), min_hours_notice: Number(notice), max_days_ahead: Number(horizon),
      weekly: weeklyParsed, mode, location_text: location, instructions,
    }
    try {
      const res = await saveCalendarConfig(input)
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
      else setError(res.error === 'not_entitled' ? 'No disponible en tu plan.' : 'No se pudo guardar.')
    } catch { setError('Error al guardar.') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-start gap-3">
        <CalendarClock className="w-6 h-6 text-gold mt-1" />
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Citas</h1>
          <p className="text-sm text-bsm-text-muted">
            Define tu disponibilidad. El agente de tus fichas propondrá estos huecos a los compradores
            para reservar una visita; tú y el comprador recibís la confirmación por email.
          </p>
        </div>
      </div>

      {/* Activar */}
      <label className="flex items-center gap-3 mb-8 cursor-pointer">
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="accent-[#C6A64B] w-4 h-4" />
        <span className="text-sm text-bsm-text-primary">Activar reserva de visitas en el agente</span>
      </label>

      <div className={enabled ? '' : 'opacity-50 pointer-events-none'}>
        {/* Disponibilidad semanal */}
        <h2 className="text-xs text-gold tracking-widest uppercase mb-3">Disponibilidad semanal</h2>
        <p className="text-xs text-bsm-text-muted mb-3">Franjas por día, formato <code>10:00-14:00, 16:00-20:00</code>. Deja vacío un día sin visitas.</p>
        <div className="space-y-2 mb-8">
          {DAYS.map(d => (
            <div key={d.key} className="grid grid-cols-[110px_1fr] items-center gap-3">
              <label className="text-sm text-bsm-text-secondary">{d.label}</label>
              <input value={weekly[d.key]} onChange={e => setWeekly(w => ({ ...w, [d.key]: e.target.value }))}
                placeholder="—" className="input-base text-sm" />
            </div>
          ))}
        </div>

        {/* Parámetros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-bsm-text-muted block mb-1.5">Duración (min)</label>
            <input type="number" value={slot} onChange={e => setSlot(e.target.value)} className="input-base text-sm" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-bsm-text-muted block mb-1.5">Antelación mín. (h)</label>
            <input type="number" value={notice} onChange={e => setNotice(e.target.value)} className="input-base text-sm" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-bsm-text-muted block mb-1.5">Ventana (días)</label>
            <input type="number" value={horizon} onChange={e => setHorizon(e.target.value)} className="input-base text-sm" />
          </div>
        </div>

        {/* Modalidad */}
        <h2 className="text-xs text-gold tracking-widest uppercase mb-3">Modalidad</h2>
        <div className="flex gap-2 mb-4">
          {([['in_person', 'Presencial'], ['video', 'Videollamada'], ['both', 'Ambas']] as const).map(([v, l]) => (
            <label key={v} className="flex items-center justify-center px-4 py-2 border border-bsm-border text-sm text-bsm-text-muted cursor-pointer has-[:checked]:border-[#C6A64B]/40 has-[:checked]:text-gold has-[:checked]:bg-[#C6A64B]/5">
              <input type="radio" name="mode" value={v} checked={mode === v} onChange={() => setMode(v)} className="sr-only" />
              {l}
            </label>
          ))}
        </div>
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-widest text-bsm-text-muted block mb-1.5">Dirección / lugar (si es presencial)</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="C/ Ejemplo 1, Madrid" className="input-base text-sm" />
        </div>
        <div className="mb-8">
          <label className="text-[10px] uppercase tracking-widest text-bsm-text-muted block mb-1.5">Instrucciones para el comprador (opcional)</label>
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={2} placeholder="Pregunta por el vehículo en recepción al llegar." className="input-base text-sm resize-none" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={onSave} disabled={saving} className="btn-gold px-6 disabled:opacity-40">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
        </button>
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-400"><Check className="w-4 h-4" /> Guardado</span>}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </div>
  )
}
