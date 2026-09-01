'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

export interface DailyPoint {
  date: string   // YYYY-MM-DD
  views: number
  contacts: number
  saved: number
}

interface Props {
  data: DailyPoint[]
}

function fmtTick(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-bsm-border px-3 py-2 text-xs space-y-1">
      <p className="text-bsm-text-muted mb-1">{fmtTick(label)}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-bsm-text-secondary capitalize">{p.name}:</span>
          <span className="font-medium text-bsm-text-primary">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function EvolutionChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-bsm-text-muted">
        Sin datos para el periodo seleccionado
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
        <XAxis
          dataKey="date"
          tickFormatter={fmtTick}
          tick={{ fill: '#9E9E9E', fontSize: 10 }}
          axisLine={{ stroke: '#2A2A2A' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#9E9E9E', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#9E9E9E', paddingTop: 8 }}
          formatter={(value) => <span className="text-bsm-text-muted capitalize">{value}</span>}
        />
        <Line
          type="monotone" dataKey="views" name="Vistas"
          stroke="#60A5FA" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }}
        />
        <Line
          type="monotone" dataKey="contacts" name="Contactos"
          stroke="#34D399" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }}
        />
        <Line
          type="monotone" dataKey="saved" name="Guardados"
          stroke="#F472B6" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
