'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const BRANDS_CAR = [
  'Ferrari', 'Lamborghini', 'McLaren', 'Bugatti', 'Koenigsegg', 'Pagani',
  'Aston Martin', 'Bentley', 'Rolls-Royce', 'Maserati', 'Porsche',
  'BMW', 'Mercedes-Benz', 'Audi', 'Alfa Romeo', 'Lexus', 'Corvette',
]

const BRANDS_MOTO = [
  'Ducati', 'MV Agusta', 'Aprilia', 'Bimota', 'BMW Motorrad',
  'Harley-Davidson', 'Indian', 'KTM', 'Triumph',
]

const FUEL_OPTIONS = [
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'electric', label: 'Eléctrico' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'plugin_hybrid', label: 'Híbrido enchufable' },
]

const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automático' },
  { value: 'dct', label: 'Doble embrague' },
  { value: 'semi_automatic', label: 'Semiautomático' },
]

const SORT_OPTIONS = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'mileage_asc', label: 'Menor kilometraje' },
]

interface FiltersProps {
  vehicleType: 'car' | 'motorcycle'
  totalCount: number
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-bsm-border pb-5 mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-4 text-left"
      >
        <span className="label-base mb-0">{title}</span>
        <ChevronDown className={cn('w-4 h-4 text-bsm-text-muted transition-transform', !open && '-rotate-90')} />
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

export default function VehicleFilters({ vehicleType, totalCount }: FiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const brands = vehicleType === 'car' ? BRANDS_CAR : BRANDS_MOTO

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function clearAll() {
    router.push(pathname, { scroll: false })
  }

  const hasActiveFilters = Array.from(searchParams.entries()).some(
    ([key]) => !['page', 'sort'].includes(key)
  )

  const FiltersContent = () => (
    <div>
      {/* Sort — mobile only here, desktop in header */}
      <div className="mb-6 lg:hidden">
        <label className="label-base">Ordenar</label>
        <select
          className="select-base"
          value={searchParams.get('sort') || 'featured'}
          onChange={(e) => updateParam('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <FilterGroup title="Marca">
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                className="accent-gold w-3.5 h-3.5"
                checked={searchParams.get('marca') === brand.toLowerCase().replace(' ', '-')}
                onChange={(e) => updateParam('marca', e.target.checked ? brand.toLowerCase().replace(' ', '-') : null)}
              />
              <span className="text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Año">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="label-base">Desde</label>
            <input
              type="number"
              placeholder="1990"
              min="1960"
              max={new Date().getFullYear()}
              className="input-base"
              value={searchParams.get('anioMin') || ''}
              onChange={(e) => updateParam('anioMin', e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="label-base">Hasta</label>
            <input
              type="number"
              placeholder={String(new Date().getFullYear())}
              min="1960"
              max={new Date().getFullYear()}
              className="input-base"
              value={searchParams.get('anioMax') || ''}
              onChange={(e) => updateParam('anioMax', e.target.value)}
            />
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Precio">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="label-base">Desde (€)</label>
            <input
              type="number"
              placeholder="40.000"
              className="input-base"
              value={searchParams.get('precioMin') || ''}
              onChange={(e) => updateParam('precioMin', e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="label-base">Hasta (€)</label>
            <input
              type="number"
              placeholder="Sin límite"
              className="input-base"
              value={searchParams.get('precioMax') || ''}
              onChange={(e) => updateParam('precioMax', e.target.value)}
            />
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Kilometraje máximo">
        <select
          className="select-base"
          value={searchParams.get('kmMax') || ''}
          onChange={(e) => updateParam('kmMax', e.target.value)}
        >
          <option value="">Sin límite</option>
          <option value="10000">Hasta 10.000 km</option>
          <option value="30000">Hasta 30.000 km</option>
          <option value="50000">Hasta 50.000 km</option>
          <option value="100000">Hasta 100.000 km</option>
          <option value="150000">Hasta 150.000 km</option>
        </select>
      </FilterGroup>

      <FilterGroup title="Combustible">
        <div className="space-y-2">
          {FUEL_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                className="accent-gold w-3.5 h-3.5"
                checked={searchParams.get('combustible') === opt.value}
                onChange={(e) => updateParam('combustible', e.target.checked ? opt.value : null)}
              />
              <span className="text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Transmisión">
        <div className="space-y-2">
          {TRANSMISSION_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                className="accent-gold w-3.5 h-3.5"
                checked={searchParams.get('cambio') === opt.value}
                onChange={(e) => updateParam('cambio', e.target.checked ? opt.value : null)}
              />
              <span className="text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors mt-2"
        >
          <X className="w-4 h-4" />
          Borrar todos los filtros
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 btn-outline w-full justify-center"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-gold text-obsidian text-xs flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="mt-4 bg-surface border border-bsm-border p-6 animate-slide-up">
            <FiltersContent />
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-bsm-text-muted uppercase tracking-widest">
              {totalCount} vehículos
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-gold hover:text-gold-light transition-colors"
              >
                Borrar filtros
              </button>
            )}
          </div>
          <FiltersContent />
        </div>
      </aside>
    </>
  )
}
