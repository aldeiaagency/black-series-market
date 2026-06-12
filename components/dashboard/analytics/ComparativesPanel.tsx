'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface PeriodTotals {
  views: number
  contacts: number
  saved: number
  whatsapp: number
  phone: number
}

export interface VehicleStat {
  vehicleId: string
  name: string
  views: number
  contacts: number
  convRate: string
}

interface Props {
  current: PeriodTotals
  previous: PeriodTotals
  currentLabel: string
  previousLabel: string
  topVehicles: VehicleStat[]
  bottomVehicles: VehicleStat[]
}

function delta(cur: number, prev: number): { pct: string; dir: 'up' | 'down' | 'flat' } {
  if (prev === 0 && cur === 0) return { pct: '—', dir: 'flat' }
  if (prev === 0) return { pct: '+∞', dir: 'up' }
  const d = ((cur - prev) / prev) * 100
  return {
    pct: `${d >= 0 ? '+' : ''}${d.toFixed(1)}%`,
    dir: d > 0 ? 'up' : d < 0 ? 'down' : 'flat',
  }
}

function DeltaBadge({ cur, prev }: { cur: number; prev: number }) {
  const { pct, dir } = delta(cur, prev)
  const color = dir === 'up' ? 'text-emerald-400' : dir === 'down' ? 'text-red-400' : 'text-bsm-text-muted'
  const Icon  = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {pct}
    </span>
  )
}

const METRICS: { key: keyof PeriodTotals; label: string }[] = [
  { key: 'views',    label: 'Vistas' },
  { key: 'contacts', label: 'Contactos' },
  { key: 'saved',    label: 'Guardados' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'phone',    label: 'Teléfono' },
]

export default function ComparativesPanel({
  current, previous, currentLabel, previousLabel,
  topVehicles, bottomVehicles,
}: Props) {
  return (
    <div className="space-y-8">

      {/* ── Periodo vs Periodo ───────────────────────────────────────── */}
      <section>
        <h3 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">
          Comparativa de periodos
        </h3>
        <div className="bg-surface border border-bsm-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bsm-border text-[10px] text-bsm-text-muted uppercase tracking-widest">
                <th className="text-left px-4 py-3">Métrica</th>
                <th className="text-right px-4 py-3">{currentLabel}</th>
                <th className="text-right px-4 py-3">{previousLabel}</th>
                <th className="text-right px-4 py-3">Variación</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map(({ key, label }) => (
                <tr key={key} className="border-b border-bsm-border last:border-0">
                  <td className="px-4 py-2.5 text-bsm-text-secondary text-xs">{label}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-bsm-text-primary">{current[key]}</td>
                  <td className="px-4 py-2.5 text-right text-bsm-text-muted">{previous[key]}</td>
                  <td className="px-4 py-2.5 text-right">
                    <DeltaBadge cur={current[key]} prev={previous[key]} />
                  </td>
                </tr>
              ))}
              <tr className="border-t border-bsm-border bg-surface-elevated">
                <td className="px-4 py-2.5 text-xs text-bsm-text-secondary">Vista → Contacto</td>
                <td className="px-4 py-2.5 text-right font-medium text-bsm-text-primary text-xs">
                  {current.views ? `${((current.contacts / current.views) * 100).toFixed(1)}%` : '—'}
                </td>
                <td className="px-4 py-2.5 text-right text-bsm-text-muted text-xs">
                  {previous.views ? `${((previous.contacts / previous.views) * 100).toFixed(1)}%` : '—'}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <DeltaBadge
                    cur={current.views ? (current.contacts / current.views) * 100 : 0}
                    prev={previous.views ? (previous.contacts / previous.views) * 100 : 0}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Top / Bottom vehículos ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top */}
        <section>
          <h3 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">
            Mejor rendimiento — Contactos
          </h3>
          {topVehicles.length === 0 ? (
            <p className="text-xs text-bsm-text-muted py-4">Sin datos en el periodo</p>
          ) : (
            <div className="space-y-2">
              {topVehicles.map((v, i) => (
                <div key={v.vehicleId}
                  className="flex items-center gap-3 bg-surface border border-bsm-border px-4 py-2.5">
                  <span className="text-[10px] text-bsm-text-muted w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-bsm-text-primary truncate">{v.name}</p>
                    <p className="text-[10px] text-bsm-text-muted">
                      {v.views} vistas · conv. {v.convRate}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-emerald-400 flex-shrink-0">
                    {v.contacts}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bottom */}
        <section>
          <h3 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">
            Menor rendimiento — Sin contactos
          </h3>
          {bottomVehicles.length === 0 ? (
            <p className="text-xs text-bsm-text-muted py-4">Todos tus vehículos activos generaron contactos</p>
          ) : (
            <div className="space-y-2">
              {bottomVehicles.map((v, i) => (
                <div key={v.vehicleId}
                  className="flex items-center gap-3 bg-surface border border-bsm-border px-4 py-2.5">
                  <span className="text-[10px] text-bsm-text-muted w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-bsm-text-primary truncate">{v.name}</p>
                    <p className="text-[10px] text-bsm-text-muted">{v.views} vistas</p>
                  </div>
                  <span className="text-[10px] text-bsm-text-muted flex-shrink-0">0 contactos</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
