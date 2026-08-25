/**
 * Cálculo de huecos disponibles para la reserva de cita del agente (Fase B:
 * disponibilidad manual por ventanas horarias, sin OAuth de calendario).
 *
 * Las reglas viven en `showroom_calendar_connections.availability_rules` y los
 * ajustes en `booking_settings`. Todo se interpreta en la zona horaria del
 * showroom (por defecto Europe/Madrid), con manejo correcto de horario de verano.
 */

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] // index = getUTCDay-style 0..6

/** Franja horaria [inicio, fin] en formato "HH:MM" (hora local del showroom). */
export type TimeRange = [string, string]

export interface AvailabilityRules {
  timezone: string                       // p.ej. 'Europe/Madrid'
  slot_minutes: number                   // duración del hueco (y paso)
  buffer_minutes: number                 // colchón entre citas
  max_days_ahead: number                 // ventana de reserva (días)
  min_hours_notice: number               // antelación mínima
  weekly: Partial<Record<Weekday, TimeRange[]>>
  blackout_dates: string[]               // 'YYYY-MM-DD' (festivos/cierres)
}

export interface BookingSettings {
  mode: 'in_person' | 'video' | 'both'
  location_text: string | null
  instructions: string | null
}

export interface Slot {
  /** Instante de inicio en UTC (ISO). Es lo que se guarda en appointments.starts_at. */
  start: string
  /** Etiqueta legible en la zona del showroom, p.ej. "lun 1 jul · 10:00". */
  label: string
  /** Día agrupador 'YYYY-MM-DD' (zona del showroom) para la UI. */
  day: string
}

/** Rango de tiempo ocupado (ISO). Fase A lo alimenta tanto de citas internas como de freeBusy de Google. */
export interface BusyRange { start: string; end: string }

export const DEFAULT_RULES: AvailabilityRules = {
  timezone: 'Europe/Madrid',
  slot_minutes: 45,
  buffer_minutes: 0,
  max_days_ahead: 14,
  min_hours_notice: 24,
  weekly: {
    mon: [['10:00', '14:00'], ['16:00', '20:00']],
    tue: [['10:00', '14:00'], ['16:00', '20:00']],
    wed: [['10:00', '14:00'], ['16:00', '20:00']],
    thu: [['10:00', '14:00'], ['16:00', '20:00']],
    fri: [['10:00', '14:00'], ['16:00', '20:00']],
    sat: [['10:00', '14:00']],
    sun: [],
  },
  blackout_dates: [],
}

export const DEFAULT_SETTINGS: BookingSettings = {
  mode: 'in_person',
  location_text: null,
  instructions: null,
}

export function normalizeRules(raw: unknown): AvailabilityRules {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<AvailabilityRules>
  return {
    timezone: r.timezone || DEFAULT_RULES.timezone,
    slot_minutes: clampInt(r.slot_minutes, 15, 240, DEFAULT_RULES.slot_minutes),
    buffer_minutes: clampInt(r.buffer_minutes, 0, 120, DEFAULT_RULES.buffer_minutes),
    max_days_ahead: clampInt(r.max_days_ahead, 1, 60, DEFAULT_RULES.max_days_ahead),
    min_hours_notice: clampInt(r.min_hours_notice, 0, 168, DEFAULT_RULES.min_hours_notice),
    weekly: (r.weekly && typeof r.weekly === 'object' ? r.weekly : DEFAULT_RULES.weekly) as AvailabilityRules['weekly'],
    blackout_dates: Array.isArray(r.blackout_dates) ? r.blackout_dates.filter(s => typeof s === 'string') : [],
  }
}

export function normalizeSettings(raw: unknown): BookingSettings {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Partial<BookingSettings>
  const mode = s.mode === 'video' || s.mode === 'both' ? s.mode : 'in_person'
  return {
    mode,
    location_text: typeof s.location_text === 'string' ? s.location_text : null,
    instructions: typeof s.instructions === 'string' ? s.instructions : null,
  }
}

export function rangesToStr(ranges?: TimeRange[]): string {
  return (ranges || []).map(([s, e]) => `${s}-${e}`).join(', ')
}

export function parseRanges(str: string): TimeRange[] {
  const out: TimeRange[] = []
  for (const part of str.split(',')) {
    const m = part.trim().match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/)
    if (m) out.push([m[1], m[2]])
  }
  return out
}

function clampInt(v: unknown, min: number, max: number, dflt: number): number {
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  if (!Number.isFinite(n)) return dflt
  return Math.min(max, Math.max(min, Math.round(n)))
}

// ── Zona horaria ────────────────────────────────────────────────────────────

/** Offset (minutos) de `tz` respecto a UTC para un instante dado. */
function tzOffsetMinutes(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const p = dtf.formatToParts(date).reduce<Record<string, string>>((a, x) => { a[x.type] = x.value; return a }, {})
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +(p.hour === '24' ? '0' : p.hour), +p.minute, +p.second)
  return (asUTC - date.getTime()) / 60000
}

/** Convierte una hora de pared (y/m/d hh:mm en `tz`) al instante UTC correcto. */
function wallTimeToUtc(y: number, mo: number, d: number, hh: number, mm: number, tz: string): Date {
  // Aproximación: asumimos el offset y lo corregimos una vez (suficiente salvo en el salto exacto de DST).
  const guess = Date.UTC(y, mo - 1, d, hh, mm)
  const off1 = tzOffsetMinutes(new Date(guess), tz)
  const utc = guess - off1 * 60000
  const off2 = tzOffsetMinutes(new Date(utc), tz)
  return new Date(off2 === off1 ? utc : guess - off2 * 60000)
}

/** Partes de fecha (año/mes/día/weekday) de un instante, en la zona `tz`. */
function partsInTz(date: Date, tz: string): { y: number; mo: number; d: number; wd: number; ymd: string } {
  const dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
  const p = dtf.formatToParts(date).reduce<Record<string, string>>((a, x) => { a[x.type] = x.value; return a }, {})
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const ymd = `${p.year}-${p.month}-${p.day}`
  return { y: +p.year, mo: +p.month, d: +p.day, wd: map[p.weekday] ?? 0, ymd }
}

function labelFor(date: Date, tz: string): string {
  const day = new Intl.DateTimeFormat('es-ES', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(date)
  const time = new Intl.DateTimeFormat('es-ES', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
  return `${day.replace('.', '')} · ${time}`
}

// ── Cálculo de huecos ───────────────────────────────────────────────────────

/**
 * Devuelve los huecos disponibles desde `now`, dentro de la ventana de reserva,
 * excluyendo festivos, los que no cumplan la antelación, y cualquiera que solape
 * con un rango ocupado (citas internas ya confirmadas y, en Fase A, los bloques
 * reales del Google Calendar conectado — ambos llegan mezclados en `busyRanges`).
 */
export function computeSlots(rules: AvailabilityRules, busyRanges: BusyRange[], now: Date = new Date(), limit = 60): Slot[] {
  const busy = busyRanges.map(r => ({ start: new Date(r.start).getTime(), end: new Date(r.end).getTime() }))
  const minStart = now.getTime() + rules.min_hours_notice * 3600_000
  const slots: Slot[] = []

  for (let dayOffset = 0; dayOffset <= rules.max_days_ahead && slots.length < limit; dayOffset++) {
    // Día base = hoy (en la zona) + dayOffset.
    const base = new Date(now.getTime() + dayOffset * 86400_000)
    const { y, mo, d, wd, ymd } = partsInTz(base, rules.timezone)
    if (rules.blackout_dates.includes(ymd)) continue
    const ranges = rules.weekly[WEEKDAYS[wd]] || []
    for (const [start, end] of ranges) {
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      const endMin = eh * 60 + em
      for (let t = sh * 60 + sm; t + rules.slot_minutes <= endMin; t += rules.slot_minutes + rules.buffer_minutes) {
        const dt = wallTimeToUtc(y, mo, d, Math.floor(t / 60), t % 60, rules.timezone)
        const ms = dt.getTime()
        if (ms < minStart) continue
        const slotEndMs = ms + rules.slot_minutes * 60_000
        const overlaps = busy.some(b => ms < b.end && slotEndMs > b.start)
        if (overlaps) continue
        slots.push({ start: dt.toISOString(), label: labelFor(dt, rules.timezone), day: ymd })
        if (slots.length >= limit) break
      }
      if (slots.length >= limit) break
    }
  }
  return slots
}
