'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { VEHICLE_CONDITION_LABELS } from '@/lib/utils'
import type { Vehicle } from '@/lib/types'

interface Props {
  vehicles: (Vehicle & { dealer?: any })[]
  cols: number
}

function Cell({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-[#555] text-xs italic">—</span>
  return <span className="text-bsm-text-primary text-sm">{value}</span>
}

function BoolCell({ value }: { value: boolean }) {
  return value
    ? <Check className="w-4 h-4 text-emerald-400 mx-auto" />
    : <X className="w-4 h-4 text-[#555] mx-auto" />
}

function Row({ label, values, cols }: { label: string; values: (string | null | undefined)[]; cols: number }) {
  const allSame = values.every(v => v === values[0])
  const grid = cols === 2 ? 'grid-cols-[180px_1fr_1fr]' : 'grid-cols-[180px_1fr_1fr_1fr]'
  return (
    <div className={`grid border-b border-bsm-border ${grid}`}>
      <div className="px-4 py-3 text-xs text-bsm-text-muted bg-[#0A0A0A] flex items-center">{label}</div>
      {values.map((v, i) => (
        <div key={i} className={`px-4 py-3 flex items-center border-l border-bsm-border ${!allSame && v ? 'bg-gold/3' : ''}`}>
          <Cell value={v} />
        </div>
      ))}
    </div>
  )
}

function BoolRow({ label, values, cols }: { label: string; values: boolean[]; cols: number }) {
  const grid = cols === 2 ? 'grid-cols-[180px_1fr_1fr]' : 'grid-cols-[180px_1fr_1fr_1fr]'
  return (
    <div className={`grid border-b border-bsm-border ${grid}`}>
      <div className="px-4 py-3 text-xs text-bsm-text-muted bg-[#0A0A0A] flex items-center">{label}</div>
      {values.map((v, i) => (
        <div key={i} className="px-4 py-3 flex items-center justify-center border-l border-bsm-border">
          <BoolCell value={v} />
        </div>
      ))}
    </div>
  )
}

function SectionHeader({ label, cols }: { label: string; cols: number }) {
  const grid = cols === 2 ? 'grid-cols-[180px_1fr_1fr]' : 'grid-cols-[180px_1fr_1fr_1fr]'
  return (
    <div className={`grid ${grid} bg-[#0E0E0E]`}>
      <div className="col-span-full px-4 py-2.5 text-[10px] text-gold uppercase tracking-widest border-b border-t border-bsm-border">
        {label}
      </div>
    </div>
  )
}

export default function CompareExpandToggle({ vehicles, cols }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {/* Toggle button */}
      <div className="flex justify-center py-6 border-b border-bsm-border">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-gold border border-bsm-border hover:border-gold/30 px-6 py-2.5 transition-all duration-200"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ocultar características completas
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver todas las características
            </>
          )}
        </button>
      </div>

      {/* Extra fields — only shown when expanded */}
      {expanded && (
        <>
          <SectionHeader label="Acabado e interior" cols={cols} />
          <Row label="Color exterior"  values={vehicles.map(v => v.color_exterior)}                                            cols={cols} />
          <Row label="Color interior"  values={vehicles.map(v => v.color_interior)}                                            cols={cols} />
          <Row label="Tapizado"        values={vehicles.map(v => v.upholstery)}                                                cols={cols} />
          <Row label="Condición"       values={vehicles.map(v => v.condition_type ? VEHICLE_CONDITION_LABELS[v.condition_type] ?? v.condition_type : null)} cols={cols} />

          <SectionHeader label="Motor detalle" cols={cols} />
          <Row label="Config. motor"   values={vehicles.map(v => v.engine_config)}                                             cols={cols} />
          <Row label="Cilindros"       values={vehicles.map(v => v.cylinders ? String(v.cylinders) : null)}                   cols={cols} />
          <Row label="Potencia (kW)"   values={vehicles.map(v => v.power_kw ? `${v.power_kw} kW` : null)}                    cols={cols} />

          <SectionHeader label="Documentación" cols={cols} />
          <Row label="Año matriculación" values={vehicles.map(v => v.registration_year ? String(v.registration_year) : null)} cols={cols} />
          <Row label="País matrícula"    values={vehicles.map(v => v.registration_country)}                                    cols={cols} />
          <Row label="ITV válida hasta"  values={vehicles.map(v => v.itv_valid_until ? new Date(v.itv_valid_until).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : null)} cols={cols} />
          <BoolRow label="Garantía"     values={vehicles.map(v => !!v.has_warranty)}                                          cols={cols} />

          <SectionHeader label="Equipamiento destacado" cols={cols} />
          {vehicles[0] && (() => {
            // Collect all unique equipment items across all vehicles
            const allItems = Array.from(new Set(vehicles.flatMap(v => v.equipment || [])))
            return allItems.map(item => (
              <BoolRow
                key={item}
                label={item}
                values={vehicles.map(v => (v.equipment || []).includes(item))}
                cols={cols}
              />
            ))
          })()}
        </>
      )}
    </>
  )
}
