'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Categories ──────────────────────────────────────────────────────────────

const CAR_CATEGORIES = [
  { value: 'supercars',            label: 'Supercars & Hypercars' },
  { value: 'luxury_executive',     label: 'Lujo y Ejecutivo' },
  { value: 'premium_modern',       label: 'Premium Moderno' },
  { value: 'sport_performance',    label: 'Sport y Performance' },
  { value: 'classics_youngtimers', label: 'Clásicos y Youngtimers' },
  { value: 'enthusiast_selection', label: 'Selección Entusiasta' },
  { value: 'black_label_selection','label': 'Black Label Selection' },
  { value: 'black_label_icon',     label: 'Black Label Icon' },
]

const MOTO_CATEGORIES = [
  { value: 'premium_modern_bikes',      label: 'Motos Premium Modernas' },
  { value: 'sport_supersport',          label: 'Sport y Supersport' },
  { value: 'naked_hypernaked',          label: 'Naked y Hypernaked' },
  { value: 'adventure_touring_premium', label: 'Adventure y Touring Premium' },
  { value: 'custom_cruiser_premium',    label: 'Custom y Cruiser Premium' },
  { value: 'classic_youngtimer_bikes',  label: 'Clásica y Youngtimer' },
  { value: 'scooter_urban_premium',     label: 'Scooter Urbano Premium' },
  { value: 'enthusiast_selection',      label: 'Selección Entusiasta' },
  { value: 'black_label_selection',     label: 'Black Label Selection' },
  { value: 'black_label_icon',          label: 'Black Label Icon' },
]

// ─── Brands ───────────────────────────────────────────────────────────────────

const FEATURED_BRANDS_CAR = [
  'Aston Martin', 'Audi', 'BMW', 'Ferrari',
  'Lamborghini', 'McLaren', 'Mercedes-Benz', 'Porsche',
]

const ALL_BRANDS_CAR = [
  'Abarth', 'Alfa Romeo', 'Alpine', 'Ariel', 'Aston Martin', 'Audi',
  'Bentley', 'BMW', 'Brabus', 'Bugatti',
  'Caterham', 'Corvette', 'Cupra',
  'Ferrari', 'Fiat', 'Ford',
  'Genesis',
  'Honda', 'Hyundai',
  'Jaguar', 'Kia', 'Koenigsegg',
  'Lamborghini', 'Land Rover', 'Lancia', 'Lexus', 'Lotus',
  'Maserati', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Morgan',
  'Nissan', 'Opel',
  'Pagani', 'Peugeot', 'Porsche',
  'Renault', 'Rimac', 'Rolls-Royce',
  'Seat', 'Subaru',
  'Tesla', 'Toyota',
  'Volkswagen', 'Volvo',
]

const FEATURED_BRANDS_MOTO = [
  'BMW Motorrad', 'Ducati', 'Harley-Davidson',
  'Honda', 'KTM', 'Triumph', 'Yamaha',
]

const ALL_BRANDS_MOTO = [
  'Aprilia', 'Benelli', 'Bimota', 'BMW Motorrad',
  'Cagiva', 'Can-Am',
  'Ducati',
  'Energica',
  'Harley-Davidson', 'Honda', 'Husqvarna',
  'Indian',
  'Kawasaki', 'KTM',
  'LiveWire',
  'Moto Guzzi', 'MV Agusta',
  'Piaggio',
  'Royal Enfield',
  'Suzuki',
  'Triumph',
  'Vespa',
  'Yamaha',
  'Zero Motorcycles',
]

// ─── Other filter options ─────────────────────────────────────────────────────

const FUEL_OPTIONS = [
  { value: 'gasoline',     label: 'Gasolina' },
  { value: 'diesel',       label: 'Diésel' },
  { value: 'electric',     label: 'Eléctrico' },
  { value: 'hybrid',       label: 'Híbrido' },
  { value: 'plugin_hybrid',label: 'Híbrido enchufable' },
]

const TRANSMISSION_OPTIONS = [
  { value: 'manual',        label: 'Manual' },
  { value: 'automatic',     label: 'Automático' },
  { value: 'dct',           label: 'Doble embrague' },
  { value: 'semi_automatic',label: 'Semiautomático' },
]

const CAR_BODY_TYPES = [
  { value: 'Coupé',      label: 'Coupé' },
  { value: 'Cabrio',     label: 'Cabrio / Roadster' },
  { value: 'SUV',        label: 'SUV / Crossover' },
  { value: 'Deportivo',  label: 'Deportivo' },
  { value: 'GT',         label: 'Gran Turismo' },
  { value: 'Clásico',    label: 'Clásico / Heritage' },
  { value: 'Sedán',      label: 'Sedán' },
  { value: 'Hot Hatch',  label: 'Hot Hatch' },
]

const MOTO_STYLES = [
  { value: 'superbike',       label: 'Superbike' },
  { value: 'deportiva',       label: 'Deportiva' },
  { value: 'naked',           label: 'Naked' },
  { value: 'hypernaked',      label: 'Hypernaked' },
  { value: 'maxitrail',       label: 'Maxitrail' },
  { value: 'adventure',       label: 'Adventure' },
  { value: 'trail',           label: 'Trail' },
  { value: 'touring',         label: 'Touring' },
  { value: 'sport_touring',   label: 'Sport Touring' },
  { value: 'custom',          label: 'Custom' },
  { value: 'cruiser',         label: 'Cruiser' },
  { value: 'scrambler',       label: 'Scrambler / Café Racer' },
  { value: 'clasica',         label: 'Clásica' },
  { value: 'youngtimer',      label: 'Youngtimer' },
  { value: 'maxiscooter',     label: 'Maxiscooter' },
  { value: 'scooter_premium', label: 'Scooter Premium' },
  { value: 'electrica',       label: 'Eléctrica' },
  { value: 'enduro_supermoto',label: 'Enduro / Supermotard' },
  { value: 'especial',        label: 'Especial / Collector' },
]

const LICENSE_TYPES = [
  { value: 'A',  label: 'A — Sin restricciones' },
  { value: 'A2', label: 'A2 — Hasta 35 kW' },
  { value: 'A1', label: 'A1 — Hasta 125 cc' },
]

const MOTO_CC_RANGES = [
  { value: '0-599',   label: 'Hasta 600 cc' },
  { value: '600-899', label: '600 – 900 cc' },
  { value: '900-1199',label: '900 – 1.200 cc' },
  { value: '1200-9999',label: 'Más de 1.200 cc' },
]

const SORT_OPTIONS = [
  { value: 'featured',     label: 'Destacados' },
  { value: 'newest',       label: 'Más recientes' },
  { value: 'price_asc',    label: 'Precio: menor a mayor' },
  { value: 'price_desc',   label: 'Precio: mayor a menor' },
  { value: 'mileage_asc',  label: 'Menor kilometraje' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FiltersProps {
  vehicleType: 'car' | 'motorcycle'
  totalCount: number
}

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-bsm-border pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-4 text-left"
      >
        <span className="label-base mb-0">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-bsm-text-muted" />
          : <ChevronDown className="w-4 h-4 text-bsm-text-muted" />
        }
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VehicleFilters({ vehicleType, totalCount }: FiltersProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen]       = useState(false)
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [models, setModels]               = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [searchDraft, setSearchDraft]     = useState(searchParams.get('search') || '')

  const isMoto          = vehicleType === 'motorcycle'
  const categories      = isMoto ? MOTO_CATEGORIES : CAR_CATEGORIES
  const allBrands       = isMoto ? ALL_BRANDS_MOTO : ALL_BRANDS_CAR
  const featuredBrands  = isMoto ? FEATURED_BRANDS_MOTO : FEATURED_BRANDS_CAR
  const displayedBrands = showAllBrands ? allBrands : featuredBrands
  const hiddenCount     = allBrands.length - featuredBrands.length

  const currentBrand = searchParams.get('marca') || ''
  const currentModel = searchParams.get('modelo') || ''

  // Active filter count (excluding page and sort)
  const activeFilterCount = Array.from(searchParams.entries()).filter(
    ([k]) => !['page', 'sort'].includes(k)
  ).length

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Fetch models whenever brand changes
  useEffect(() => {
    if (!currentBrand) { setModels([]); return }
    setLoadingModels(true)
    const type = isMoto ? 'motorcycle' : 'car'
    fetch(`/api/models?brand=${currentBrand}&type=${type}`)
      .then((r) => r.json())
      .then((data: string[]) => setModels(data))
      .finally(() => setLoadingModels(false))
  }, [currentBrand, isMoto])

  // Keep searchDraft in sync when param changes externally
  useEffect(() => {
    setSearchDraft(searchParams.get('search') || '')
  }, [searchParams])

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function updateBrand(brand: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!brand) { params.delete('marca'); params.delete('modelo') }
    else { params.set('marca', brand); params.delete('modelo') }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('search', searchDraft.trim() || null)
    setMobileOpen(false)
  }

  function clearAll() {
    const sort = searchParams.get('sort')
    router.push(sort ? `${pathname}?sort=${sort}` : pathname, { scroll: false })
    setSearchDraft('')
  }

  const CheckOption = ({ param, value, label }: { param: string; value: string; label: string }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        className="accent-gold w-3.5 h-3.5"
        checked={searchParams.get(param) === value}
        onChange={(e) => updateParam(param, e.target.checked ? value : null)}
      />
      <span className="text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors">
        {label}
      </span>
    </label>
  )

  function renderFilters() {
    return (
      <div>
        {/* Mobile-only sort */}
        <div className="mb-6 lg:hidden">
          <label className="label-base">Ordenar</label>
          <select className="select-base" value={searchParams.get('sort') || 'featured'}
            onChange={(e) => updateParam('sort', e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Search */}
        <FilterGroup title="Buscar">
          <form onSubmit={submitSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bsm-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder={`Marca, modelo${isMoto ? ', estilo' : ', versión'}…`}
                className="input-base pl-9 text-sm"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
            </div>
            <button type="submit"
              className="px-3 py-2 bg-gold/10 border border-gold/30 text-gold text-xs hover:bg-gold/20 transition-colors">
              OK
            </button>
          </form>
          {searchParams.get('search') && (
            <button
              onClick={() => { setSearchDraft(''); updateParam('search', null) }}
              className="flex items-center gap-1 text-xs text-[#808080] hover:text-[#9A9A9A] transition-colors mt-2"
            >
              <X className="w-3 h-3" />
              Quitar búsqueda
            </button>
          )}
        </FilterGroup>

        {/* Category */}
        <FilterGroup title="Categoría" defaultOpen={false}>
          <div className="space-y-2">
            {categories.map((cat) => (
              <CheckOption key={cat.value} param="categoria" value={cat.value} label={cat.label} />
            ))}
          </div>
        </FilterGroup>

        {/* Brand + Model + Version */}
        <FilterGroup title="Marca y modelo">
          <div className="space-y-3">

            {/* Chip when brand selected */}
            {currentBrand && (
              <div className="flex items-center justify-between border border-gold/40 bg-surface-elevated px-3 py-2.5">
                <span className="text-sm font-medium text-bsm-text-primary uppercase tracking-widest">
                  {currentBrand.replace(/-/g, ' ')}
                  {currentModel && <span className="text-gold"> {currentModel}</span>}
                </span>
                <button
                  onClick={() => updateBrand('')}
                  className="ml-2 text-bsm-text-muted hover:text-gold transition-colors flex-shrink-0"
                  aria-label="Borrar marca"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Brand chips (hidden once brand selected) */}
            {!currentBrand && (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {displayedBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => updateBrand(brand.toLowerCase().replace(/ /g, '-'))}
                      className="text-xs px-2.5 py-1 border border-bsm-border text-bsm-text-secondary
                        hover:border-gold/40 hover:text-gold transition-all duration-150 whitespace-nowrap"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowAllBrands(!showAllBrands)}
                  className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors mt-3"
                >
                  {showAllBrands
                    ? <><ChevronUp className="w-3 h-3" />Ver menos</>
                    : <><ChevronDown className="w-3 h-3" />Ver todas las marcas ({hiddenCount} más)</>
                  }
                </button>
              </div>
            )}

            {/* Model select */}
            {currentBrand && !currentModel && (
              <select
                className="select-base"
                value=""
                onChange={(e) => updateParam('modelo', e.target.value || null)}
                disabled={loadingModels}
              >
                <option value="">
                  {loadingModels ? 'Cargando modelos…' : 'Cualquier modelo'}
                </option>
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}

            {/* Version */}
            <div>
              <label className="label-base flex items-center gap-1.5">
                Versión
                <span
                  title="Ej: M Sport, GTI, Elegance, Competition…"
                  className="w-3.5 h-3.5 rounded-full border border-bsm-text-muted text-bsm-text-muted
                    text-[9px] flex items-center justify-center cursor-help select-none"
                >i</span>
              </label>
              <input
                type="text"
                placeholder="Ej: M Sport, GTI, Elegance…"
                className="input-base"
                value={searchParams.get('version') || ''}
                onChange={(e) => updateParam('version', e.target.value || null)}
              />
            </div>
          </div>
        </FilterGroup>

        {/* Year */}
        <FilterGroup title="Año">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="label-base">Desde</label>
              <input type="number" placeholder="1970" min="1960" max={new Date().getFullYear()}
                className="input-base" value={searchParams.get('anioMin') || ''}
                onChange={(e) => updateParam('anioMin', e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="label-base">Hasta</label>
              <input type="number" placeholder={String(new Date().getFullYear())}
                min="1960" max={new Date().getFullYear()} className="input-base"
                value={searchParams.get('anioMax') || ''}
                onChange={(e) => updateParam('anioMax', e.target.value)} />
            </div>
          </div>
        </FilterGroup>

        {/* Price */}
        <FilterGroup title="Precio">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="label-base">Desde (€)</label>
              <input type="number" placeholder="0" className="input-base"
                value={searchParams.get('precioMin') || ''}
                onChange={(e) => updateParam('precioMin', e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="label-base">Hasta (€)</label>
              <input type="number" placeholder="Sin límite" className="input-base"
                value={searchParams.get('precioMax') || ''}
                onChange={(e) => updateParam('precioMax', e.target.value)} />
            </div>
          </div>
        </FilterGroup>

        {/* Power */}
        <FilterGroup title="Potencia (CV)" defaultOpen={false}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="label-base">Desde</label>
              <input type="number" placeholder="0" className="input-base"
                value={searchParams.get('cvMin') || ''}
                onChange={(e) => updateParam('cvMin', e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="label-base">Hasta</label>
              <input type="number" placeholder="Sin límite" className="input-base"
                value={searchParams.get('cvMax') || ''}
                onChange={(e) => updateParam('cvMax', e.target.value)} />
            </div>
          </div>
        </FilterGroup>

        {/* Mileage */}
        <FilterGroup title="Kilometraje máximo">
          <select className="select-base" value={searchParams.get('kmMax') || ''}
            onChange={(e) => updateParam('kmMax', e.target.value)}>
            <option value="">Sin límite</option>
            <option value="5000">Hasta 5.000 km</option>
            <option value="10000">Hasta 10.000 km</option>
            <option value="30000">Hasta 30.000 km</option>
            <option value="50000">Hasta 50.000 km</option>
            <option value="100000">Hasta 100.000 km</option>
          </select>
        </FilterGroup>

        {/* Vehicle-type-specific filters */}
        {isMoto ? (
          <>
            <FilterGroup title="Tipo de moto">
              <div className="space-y-2">
                {MOTO_STYLES.map((o) => (
                  <CheckOption key={o.value} param="estilo" value={o.value} label={o.label} />
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Cilindrada" defaultOpen={false}>
              <div className="space-y-2">
                {MOTO_CC_RANGES.map((o) => (
                  <CheckOption key={o.value} param="cc" value={o.value} label={o.label} />
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Carnet requerido" defaultOpen={false}>
              <div className="space-y-2">
                {LICENSE_TYPES.map((o) => (
                  <CheckOption key={o.value} param="carnet" value={o.value} label={o.label} />
                ))}
              </div>
            </FilterGroup>
          </>
        ) : (
          <>
            <FilterGroup title="Carrocería">
              <div className="space-y-2">
                {CAR_BODY_TYPES.map((o) => (
                  <CheckOption key={o.value} param="tipo" value={o.value} label={o.label} />
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Combustible" defaultOpen={false}>
              <div className="space-y-2">
                {FUEL_OPTIONS.map((o) => (
                  <CheckOption key={o.value} param="combustible" value={o.value} label={o.label} />
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Transmisión" defaultOpen={false}>
              <div className="space-y-2">
                {TRANSMISSION_OPTIONS.map((o) => (
                  <CheckOption key={o.value} param="cambio" value={o.value} label={o.label} />
                ))}
              </div>
            </FilterGroup>
          </>
        )}

        {/* Guarantee + Financing */}
        <FilterGroup title="Garantía y financiación" defaultOpen={false}>
          <div className="space-y-2">
            <CheckOption param="garantia"    value="si"   label="Con garantía" />
            <CheckOption param="financiacion" value="si"  label="Con financiación" />
            <CheckOption param="destacados"  value="true" label="Solo destacados" />
          </div>
        </FilterGroup>

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 text-sm text-[#808080] hover:text-[#9A9A9A] transition-colors mt-4"
          >
            <X className="w-4 h-4" />
            Borrar todos los filtros
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ── MOBILE trigger ── */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 btn-outline w-full justify-center"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-gold text-obsidian text-[10px] font-medium flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── MOBILE drawer (fixed overlay) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar filtros"
          />

          {/* Panel */}
          <div className="relative z-10 w-[min(85vw,340px)] h-full bg-[#080808] border-r border-bsm-border flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-bsm-border flex-shrink-0">
              <span className="text-sm font-medium text-bsm-text-primary">
                Filtros {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-bsm-text-muted hover:text-bsm-text-primary transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {renderFilters()}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-bsm-border">
              <button
                onClick={() => setMobileOpen(false)}
                className="btn-gold w-full justify-center text-sm"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP sidebar ── */}
      <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-bsm-text-muted uppercase tracking-widest">
              {totalCount} vehículos
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Borrar {activeFilterCount > 1 ? `${activeFilterCount} filtros` : 'filtro'}
              </button>
            )}
          </div>
          {renderFilters()}
        </div>
      </aside>
    </>
  )
}
