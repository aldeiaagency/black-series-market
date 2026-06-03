'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { X } from 'lucide-react'

// ─── Label mapping ────────────────────────────────────────────────────────────

const FUEL_LABELS: Record<string, string> = {
  gasoline: 'Gasolina', diesel: 'Diésel', electric: 'Eléctrico',
  hybrid: 'Híbrido', plugin_hybrid: 'Híbrido enchufable',
}

const TRANSMISSION_LABELS: Record<string, string> = {
  manual: 'Manual', automatic: 'Automático',
  dct: 'Doble embrague', semi_automatic: 'Semiautomático',
}

const LICENSE_LABELS: Record<string, string> = {
  A: 'Carnet A', A2: 'Carnet A2', A1: 'Carnet A1',
}

const CC_LABELS: Record<string, string> = {
  '0-599': 'Hasta 600 cc', '600-899': '600–900 cc',
  '900-1199': '900–1.200 cc', '1200-9999': 'Más de 1.200 cc',
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'Nuevo', seminuevo: 'Seminuevo', ocasion: 'Ocasión',
  clasico: 'Clásico', restaurado: 'Restaurado', preparado: 'Preparado', coleccion: 'Colección',
}

const DRIVE_LABELS: Record<string, string> = {
  rwd: 'Tracción trasera', fwd: 'Tracción delantera', awd: 'Tracción total', '4wd': '4x4',
}

const CATEGORY_LABELS: Record<string, string> = {
  // Coches
  supercars: 'Supercars', luxury_executive: 'Lujo y Ejecutivo',
  premium_modern: 'Premium Moderno', sport_performance: 'Sport y Performance',
  classics_youngtimers: 'Clásicos y Youngtimers', enthusiast_selection: 'Selección Entusiasta',
  // Motos
  deportivas: 'Deportivas', naked: 'Naked',
  touring_adventure: 'Touring / Adventure', custom_cruiser: 'Custom / Cruiser',
  clasicas_youngtimers: 'Clásicas y youngtimers', scooter_premium: 'Scooter premium',
  trail_premium: 'Trail premium', ediciones_especiales: 'Ediciones especiales',
  entusiastas: 'Motos para entusiastas',
}

function getLabel(key: string, value: string): string | null {
  switch (key) {
    case 'search':      return `"${value}"`
    case 'marca':       return value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    case 'modelo':      return value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    case 'version':     return `Versión: ${value}`
    case 'categoria':   return CATEGORY_LABELS[value] || value
    case 'anioMin':     return `Desde ${value}`
    case 'anioMax':     return `Hasta ${value}`
    case 'precioMin':   return `Desde ${parseInt(value).toLocaleString('es-ES')} €`
    case 'precioMax':   return `Hasta ${parseInt(value).toLocaleString('es-ES')} €`
    case 'kmMax':       return `Máx. ${parseInt(value).toLocaleString('es-ES')} km`
    case 'cvMin':       return `Desde ${value} CV`
    case 'cvMax':       return `Hasta ${value} CV`
    case 'tipo':        return value
    case 'estilo':      return value
    case 'combustible': return FUEL_LABELS[value] || value
    case 'cambio':      return TRANSMISSION_LABELS[value] || value
    case 'carnet':      return LICENSE_LABELS[value] || value
    case 'cc':          return CC_LABELS[value] || `${value} cc`
    case 'garantia':      return value === 'si' ? 'Con garantía' : null
    case 'financiacion':  return value === 'si' ? 'Con financiación' : null
    case 'ivaDeducible':  return value === 'si' ? 'IVA deducible' : null
    case 'destacados':    return value === 'true' ? 'Destacados' : null
    case 'colorExterior': return `Color: ${value}`
    case 'provincia':     return `${value}`
    case 'condicion':     return CONDITION_LABELS[value] || value
    case 'traccion':      return DRIVE_LABELS[value] || value
    case 'etiquetaDgt':   return `DGT ${value}`
    case 'historial':     return value === 'si' ? 'Historial completo' : null
    case 'equipamiento':  return value
    case 'showroom':      return 'Showroom seleccionado'
    case 'ciudad':        return `Ciudad: ${value}`
    default:              return null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ActiveFiltersBarProps {
  className?: string
}

export default function ActiveFiltersBar({ className = '' }: ActiveFiltersBarProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const activeFilters = Array.from(searchParams.entries())
    .filter(([k]) => !['page', 'sort'].includes(k))
    .map(([k, v]) => ({ key: k, value: v, label: getLabel(k, v) }))
    .filter((f): f is { key: string; value: string; label: string } => f.label !== null)

  if (activeFilters.length === 0) return null

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    // Removing brand also removes model
    if (key === 'marca') params.delete('modelo')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString())
    const sort = params.get('sort')
    router.push(sort ? `${pathname}?sort=${sort}` : pathname, { scroll: false })
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {activeFilters.map((f) => (
        <button
          key={f.key}
          onClick={() => removeFilter(f.key)}
          className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs
            border border-[#2A2A2A] bg-[#0D0D0D] text-[#9A9A9A]
            hover:border-[#C6A64B]/30 hover:text-[#C6A64B]
            transition-colors duration-150 group"
          aria-label={`Quitar filtro: ${f.label}`}
        >
          {f.label}
          <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
        </button>
      ))}
      <button
        onClick={clearAll}
        className="text-xs text-[#808080] hover:text-[#9A9A9A] transition-colors underline underline-offset-2"
      >
        Limpiar todos
      </button>
    </div>
  )
}
