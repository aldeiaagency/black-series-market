'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search, Star } from 'lucide-react'
import { cn, SPAIN_PROVINCES } from '@/lib/utils'
import { CAR_CATEGORIES_PUBLIC } from '@/lib/vehicle-categories'

const CAR_CATEGORIES = CAR_CATEGORIES_PUBLIC

const MOTO_CATEGORIES = [
  { value: 'sport_supersport',          label: 'Sport & Supersport' },
  { value: 'naked_hypernaked',          label: 'Naked & Hypernaked' },
  { value: 'premium_modern_bikes',      label: 'Premium moderno' },
  { value: 'adventure_touring_premium', label: 'Adventure & Touring premium' },
  { value: 'custom_cruiser_premium',    label: 'Custom & Cruiser' },
  { value: 'classic_youngtimer_bikes',  label: 'Clásicas y youngtimers' },
  { value: 'scooter_urban_premium',     label: 'Scooter premium' },
  { value: 'enthusiast_selection',      label: 'Selección entusiasta' },
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

// ─── Filter options ───────────────────────────────────────────────────────────

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
  { value: 'Coupé',              label: 'Coupé' },
  { value: 'Cabrio / Roadster',  label: 'Cabrio / Roadster' },
  { value: 'Berlina',            label: 'Berlina' },
  { value: 'Familiar',           label: 'Familiar' },
  { value: 'SUV',                label: 'SUV' },
  { value: 'Compacto',           label: 'Compacto' },
  { value: 'Compacto deportivo', label: 'Compacto deportivo' },
  { value: 'Shooting Brake',     label: 'Shooting Brake' },
  { value: 'Pick-up',            label: 'Pick-up' },
  { value: 'Supercar',           label: 'Supercar' },
  { value: 'Hypercar',           label: 'Hypercar' },
]

const COLOR_OPTIONS = [
  { value: 'Negro',          label: 'Negro' },
  { value: 'Blanco',         label: 'Blanco' },
  { value: 'Gris',           label: 'Gris' },
  { value: 'Plata',          label: 'Plata' },
  { value: 'Rojo',           label: 'Rojo' },
  { value: 'Azul',           label: 'Azul' },
  { value: 'Verde',          label: 'Verde' },
  { value: 'Amarillo',       label: 'Amarillo' },
  { value: 'Naranja',        label: 'Naranja' },
  { value: 'Marrón',         label: 'Marrón' },
  { value: 'Beige',          label: 'Beige' },
  { value: 'Dorado',         label: 'Dorado' },
  { value: 'Morado',         label: 'Morado' },
  { value: 'Color especial', label: 'Color especial' },
]

const CONDITION_OPTIONS = [
  { value: 'new',        label: 'Nuevo' },
  { value: 'seminuevo',  label: 'Seminuevo' },
  { value: 'ocasion',    label: 'Ocasión' },
  { value: 'clasico',    label: 'Clásico' },
  { value: 'restaurado', label: 'Restaurado' },
  { value: 'preparado',  label: 'Preparado' },
  { value: 'coleccion',  label: 'Colección' },
]

const DRIVE_OPTIONS = [
  { value: 'rwd', label: 'Trasera' },
  { value: 'fwd', label: 'Delantera' },
  { value: 'awd', label: 'Total' },
  { value: '4wd', label: '4x4' },
]

const DGT_OPTIONS = [
  { value: '0',    label: 'Etiqueta 0' },
  { value: 'ECO',  label: 'ECO' },
  { value: 'C',    label: 'C' },
  { value: 'B',    label: 'B' },
]

const FEATURED_EQUIPMENT = [
  'Frenos cerámicos', 'Lift delantero', 'Carbono', 'Techo panorámico',
  'Cámara 360', 'Head-up display', 'Sistema de sonido premium',
  'Asientos calefactables', 'Escape sport', 'Suspensión deportiva',
  'Modos de conducción', 'Paquete aerodinámico',
]

const MOTO_STYLES = [
  { value: 'Superbike',            label: 'Superbike' },
  { value: 'Deportiva',            label: 'Deportiva' },
  { value: 'Naked',                label: 'Naked' },
  { value: 'Naked deportiva',      label: 'Naked deportiva' },
  { value: 'Hypernaked',           label: 'Hypernaked' },
  { value: 'Trail / Adventure',    label: 'Trail / Adventure' },
  { value: 'Maxitrail',            label: 'Maxitrail' },
  { value: 'Turismo',              label: 'Turismo' },
  { value: 'Sport Touring',        label: 'Sport Touring' },
  { value: 'Custom / Cruiser',     label: 'Custom / Cruiser' },
  { value: 'Scrambler',            label: 'Scrambler' },
  { value: 'Café Racer',           label: 'Café Racer' },
  { value: 'Clásica / Neo-retro',  label: 'Clásica / Neo-retro' },
  { value: 'Maxi scooter',         label: 'Maxi scooter' },
  { value: 'Scooter premium',      label: 'Scooter premium' },
  { value: 'Supermotard / Enduro', label: 'Supermotard / Enduro' },
  { value: 'Especial / Collector', label: 'Especial / Collector' },
]

const MOTO_COLOR_OPTIONS = [
  { value: 'Negro',          label: 'Negro' },
  { value: 'Blanco',         label: 'Blanco' },
  { value: 'Gris',           label: 'Gris' },
  { value: 'Plata',          label: 'Plata' },
  { value: 'Rojo',           label: 'Rojo' },
  { value: 'Azul',           label: 'Azul' },
  { value: 'Verde',          label: 'Verde' },
  { value: 'Amarillo',       label: 'Amarillo' },
  { value: 'Naranja',        label: 'Naranja' },
  { value: 'Tricolor',       label: 'Tricolor' },
  { value: 'Color especial', label: 'Color especial' },
]

const MOTO_EQUIPMENT = [
  'Quickshifter', 'ABS en curva', 'Control de tracción', 'Modos de conducción',
  'Suspensión electrónica', 'Control de crucero', 'Puños calefactables',
  'Maletas originales', 'Escape deportivo', 'Escape Akrapovic', 'Escape Termignoni',
  'Carbono', 'Llantas forjadas', 'Telemetría', 'Launch Control',
]

const PROPULSION_OPTIONS = [
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'electric', label: 'Eléctrica' },
  { value: 'hybrid',   label: 'Híbrida' },
  { value: 'other',    label: 'Otro' },
]

const LICENSE_TYPES = [
  { value: 'A',  label: 'A — Sin restricciones' },
  { value: 'A2', label: 'A2 — Hasta 35 kW' },
  { value: 'A1', label: 'A1 — Hasta 125 cc' },
  { value: 'AM', label: 'AM — Ciclomotor' },
  { value: 'B',  label: 'B — Convalidado a moto' },
]

const MOTO_CC_RANGES = [
  { value: '0-599',    label: 'Hasta 600 cc' },
  { value: '600-899',  label: '600 – 900 cc' },
  { value: '900-1199', label: '900 – 1.200 cc' },
  { value: '1200-9999',label: 'Más de 1.200 cc' },
]

const MOTO_KM_OPTIONS = [
  { value: '5000',   label: 'Hasta 5.000 km' },
  { value: '10000',  label: 'Hasta 10.000 km' },
  { value: '20000',  label: 'Hasta 20.000 km' },
  { value: '30000',  label: 'Hasta 30.000 km' },
  { value: '40000',  label: 'Hasta 40.000 km' },
  { value: '50000',  label: 'Hasta 50.000 km' },
  { value: '60000',  label: 'Hasta 60.000 km' },
  { value: '70000',  label: 'Hasta 70.000 km' },
  { value: '80000',  label: 'Hasta 80.000 km' },
  { value: '90000',  label: 'Hasta 90.000 km' },
  { value: '100000', label: 'Hasta 100.000 km' },
]

const CAR_KM_OPTIONS = [
  { value: '5000',   label: 'Hasta 5.000 km' },
  { value: '10000',  label: 'Hasta 10.000 km' },
  { value: '20000',  label: 'Hasta 20.000 km' },
  { value: '30000',  label: 'Hasta 30.000 km' },
  { value: '40000',  label: 'Hasta 40.000 km' },
  { value: '50000',  label: 'Hasta 50.000 km' },
  { value: '60000',  label: 'Hasta 60.000 km' },
  { value: '70000',  label: 'Hasta 70.000 km' },
  { value: '80000',  label: 'Hasta 80.000 km' },
  { value: '90000',  label: 'Hasta 90.000 km' },
  { value: '100000', label: 'Hasta 100.000 km' },
  { value: '120000', label: 'Hasta 120.000 km' },
  { value: '140000', label: 'Hasta 140.000 km' },
  { value: '160000', label: 'Hasta 160.000 km' },
  { value: '180000', label: 'Hasta 180.000 km' },
  { value: '200000', label: 'Hasta 200.000 km' },
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
  compact = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  compact?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  if (compact) {
    return (
      <div className="border-b border-[#1A1A1A] last:border-0">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full py-[14px] text-left"
        >
          <span className="label-base mb-0">{title}</span>
          {open
            ? <ChevronUp className="w-3.5 h-3.5 text-bsm-text-muted" />
            : <ChevronDown className="w-3.5 h-3.5 text-bsm-text-muted" />
          }
        </button>
        {open && <div className="pb-4">{children}</div>}
      </div>
    )
  }

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
  const [mobileOpen, setMobileOpen]             = useState(false)
  const [models, setModels]                     = useState<string[]>([])
  const [loadingModels, setLoadingModels]       = useState(false)
  const [searchDraft, setSearchDraft]           = useState(searchParams.get('search') || '')
  const [showAdvanced, setShowAdvanced]         = useState(false)
  const [featuredDealers, setFeaturedDealers]   = useState<{ id: string; name: string; location_city: string | null }[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const isMoto      = vehicleType === 'motorcycle'
  const categories  = isMoto ? MOTO_CATEGORIES : CAR_CATEGORIES
  const allBrands   = isMoto ? ALL_BRANDS_MOTO : ALL_BRANDS_CAR

  const currentBrand = searchParams.get('marca') || ''
  const currentModel = searchParams.get('modelo') || ''

  const activeFilterCount = Array.from(searchParams.entries()).filter(
    ([k]) => !['page', 'sort'].includes(k)
  ).length

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    if (!currentBrand) { setModels([]); return }
    setLoadingModels(true)
    const type = isMoto ? 'motorcycle' : 'car'
    fetch(`/api/models?brand=${currentBrand}&type=${type}`)
      .then((r) => r.json())
      .then((data: string[]) => setModels(data))
      .finally(() => setLoadingModels(false))
  }, [currentBrand, isMoto])

  useEffect(() => {
    setSearchDraft(searchParams.get('search') || '')
  }, [searchParams])

  // Fetch featured dealers for showroom filter
  useEffect(() => {
    fetch('/api/featured-dealers')
      .then((r) => r.json())
      .then((data) => setFeaturedDealers(data || []))
      .catch(() => {})
  }, [])

  // Open advanced section automatically if an advanced filter is active
  useEffect(() => {
    const advancedParams = ['condicion', 'ivaDeducible', 'traccion', 'etiquetaDgt', 'equipamiento', 'historial']
    if (advancedParams.some((p) => searchParams.has(p))) {
      setShowAdvanced(true)
    }
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
            {categories.map((cat) => {
              const hasExamples = 'examples' in cat
              const isExpanded  = expandedCategory === cat.value
              return (
                <div key={cat.value}>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="accent-gold w-3.5 h-3.5 flex-shrink-0"
                      checked={searchParams.get('categoria') === cat.value}
                      onChange={(e) => updateParam('categoria', e.target.checked ? cat.value : null)}
                    />
                    <span className="flex items-center gap-1.5 text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors leading-tight">
                      {cat.label}
                    </span>
                    {hasExamples && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setExpandedCategory(isExpanded ? null : cat.value) }}
                        className="ml-auto flex-shrink-0 w-4 h-4 rounded-full border border-[#444] text-[#666]
                          hover:border-gold hover:text-gold transition-colors text-[9px]
                          flex items-center justify-center select-none"
                        aria-label={`Ejemplos de ${cat.label}`}
                      >
                        i
                      </button>
                    )}
                  </label>
                  {hasExamples && isExpanded && (
                    <p className="mt-1.5 ml-6 text-[10px] text-[#737373] leading-relaxed">
                      <span className="text-[#555] mr-1">Ej:</span>
                      {(cat as { examples: string }).examples}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </FilterGroup>

        {/* Brand + Model + Version */}
        <FilterGroup title="Marca y modelo">
          <div className="space-y-3">
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
            {!currentBrand && (
              <select
                className="select-base"
                value=""
                onChange={(e) => e.target.value && updateBrand(e.target.value)}
              >
                <option value="">Cualquier marca</option>
                {allBrands.map((brand) => (
                  <option key={brand} value={brand.toLowerCase().replace(/ /g, '-')}>
                    {brand}
                  </option>
                ))}
              </select>
            )}
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
              <input type="number" placeholder="Desde"
                className="input-base" value={searchParams.get('anioMin') || ''}
                onChange={(e) => updateParam('anioMin', e.target.value)} />
            </div>
            <div className="flex-1">
              <input type="number" placeholder="Hasta"
                className="input-base" value={searchParams.get('anioMax') || ''}
                onChange={(e) => updateParam('anioMax', e.target.value)} />
            </div>
          </div>
        </FilterGroup>

        {/* Potencia CV — moved from Más filtros */}
        <FilterGroup title="Potencia (CV)" defaultOpen={false}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input type="number" placeholder="Desde (CV)" className="input-base"
                value={searchParams.get('cvMin') || ''}
                onChange={(e) => updateParam('cvMin', e.target.value)} />
            </div>
            <div className="flex-1">
              <input type="number" placeholder="Hasta (CV)" className="input-base"
                value={searchParams.get('cvMax') || ''}
                onChange={(e) => updateParam('cvMax', e.target.value)} />
            </div>
          </div>
        </FilterGroup>

        {/* Price */}
        <FilterGroup title="Precio">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input type="number" placeholder="Desde (€)" className="input-base"
                value={searchParams.get('precioMin') || ''}
                onChange={(e) => updateParam('precioMin', e.target.value)} />
            </div>
            <div className="flex-1">
              <input type="number" placeholder="Hasta (€)" className="input-base"
                value={searchParams.get('precioMax') || ''}
                onChange={(e) => updateParam('precioMax', e.target.value)} />
            </div>
          </div>
        </FilterGroup>

        {/* Mileage */}
        <FilterGroup title="Kilometraje">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input type="number" placeholder="Desde (km)" className="input-base"
                value={searchParams.get('kmMin') || ''}
                onChange={(e) => updateParam('kmMin', e.target.value)} />
            </div>
            <div className="flex-1">
              <input type="number" placeholder="Hasta (km)" className="input-base"
                value={searchParams.get('kmMax') || ''}
                onChange={(e) => updateParam('kmMax', e.target.value)} />
            </div>
          </div>
        </FilterGroup>

        {/* Ubicación */}
        <FilterGroup title="Ubicación" defaultOpen={false}>
          <select className="select-base" value={searchParams.get('provincia') || ''}
            onChange={(e) => updateParam('provincia', e.target.value || null)}>
            <option value="">Cualquier provincia</option>
            {SPAIN_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </FilterGroup>

        {/* Showroom — featured dealers, moved here from Más filtros */}
        {featuredDealers.length > 0 && (
          <FilterGroup title="Showroom" defaultOpen={false}>
            <div className="space-y-2">
              {featuredDealers.map((d) => (
                <label key={d.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="accent-gold w-3.5 h-3.5"
                    checked={searchParams.get('showroom') === d.id}
                    onChange={(e) => updateParam('showroom', e.target.checked ? d.id : null)}
                  />
                  <span className="flex items-center gap-1.5 text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors min-w-0">
                    <span className="truncate">
                      {d.location_city ? `${d.name} · ${d.location_city}` : d.name}
                    </span>
                    <span className="inline-flex items-center gap-0.5 shrink-0 px-1 py-0.5 text-[9px] tracking-wider uppercase
                      border border-gold/30 text-gold/80 bg-gold/5">
                      <Star className="w-2.5 h-2.5" />
                      Dest.
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </FilterGroup>
        )}

        {/* Vehicle-type-specific main filters */}
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
            <FilterGroup title="Propulsión" defaultOpen={false}>
              <div className="space-y-2">
                {PROPULSION_OPTIONS.map((o) => (
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
            <FilterGroup title="Color" defaultOpen={false}>
              <div className="space-y-2">
                {MOTO_COLOR_OPTIONS.map((o) => (
                  <CheckOption key={o.value} param="colorExterior" value={o.value} label={o.label} />
                ))}
              </div>
            </FilterGroup>
          </>
        ) : (
          <>
            <FilterGroup title="Carrocería" defaultOpen={false}>
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
            <FilterGroup title="Color exterior" defaultOpen={false}>
              <div className="space-y-2">
                {COLOR_OPTIONS.map((o) => (
                  <CheckOption key={o.value} param="colorExterior" value={o.value} label={o.label} />
                ))}
              </div>
            </FilterGroup>
          </>
        )}

        {/* Guarantee + Financing */}
        <FilterGroup title="Garantía y financiación" defaultOpen={false}>
          <div className="space-y-2">
            <CheckOption param="garantia"     value="si"   label="Con garantía" />
            <CheckOption param="financiacion" value="si"   label="Con financiación" />
            <CheckOption param="ivaDeducible" value="si" label="IVA deducible" />
            <CheckOption param="destacados"   value="true" label="Solo destacados" />
          </div>
        </FilterGroup>

        {/* ── ADVANCED FILTERS ── */}
        <div className="border-b border-bsm-border pb-5 mb-5">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full mb-1 text-left"
          >
            <span className="label-base mb-0 text-gold/80">Más filtros</span>
            {showAdvanced
              ? <ChevronUp className="w-4 h-4 text-bsm-text-muted" />
              : <ChevronDown className="w-4 h-4 text-bsm-text-muted" />
            }
          </button>
          {showAdvanced && (
            <div className="mt-4 border-t border-[#1A1A1A]">

              {/* Estado */}
              <FilterGroup title="Estado" defaultOpen={false} compact>
                <div className="space-y-2">
                  {CONDITION_OPTIONS.map((o) => (
                    <CheckOption key={o.value} param="condicion" value={o.value} label={o.label} />
                  ))}
                </div>
              </FilterGroup>

              {/* Car-only: Tracción, Etiqueta DGT */}
              {!isMoto && (
                <>
                  <FilterGroup title="Tracción" defaultOpen={false} compact>
                    <div className="space-y-2">
                      {DRIVE_OPTIONS.map((o) => (
                        <CheckOption key={o.value} param="traccion" value={o.value} label={o.label} />
                      ))}
                    </div>
                  </FilterGroup>
                  <FilterGroup title="Etiqueta DGT" defaultOpen={false} compact>
                    <div className="space-y-2">
                      {DGT_OPTIONS.map((o) => (
                        <CheckOption key={o.value} param="etiquetaDgt" value={o.value} label={o.label} />
                      ))}
                    </div>
                  </FilterGroup>
                </>
              )}

              {/* Historial */}
              <FilterGroup title="Historial" defaultOpen={false} compact>
                <div className="space-y-2">
                  <CheckOption param="historial" value="si" label="Historial completo" />
                </div>
              </FilterGroup>

              {/* Equipamiento destacado */}
              <FilterGroup title="Equipamiento destacado" defaultOpen={false} compact>
                <div className="space-y-2">
                  {(isMoto ? MOTO_EQUIPMENT : FEATURED_EQUIPMENT).map((item) => (
                    <CheckOption key={item} param="equipamiento" value={item} label={item} />
                  ))}
                </div>
              </FilterGroup>

            </div>
          )}
        </div>

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

      {/* ── MOBILE drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar filtros"
          />
          <div className="relative z-10 w-[min(85vw,340px)] h-full bg-[#080808] border-r border-bsm-border flex flex-col">
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
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {renderFilters()}
            </div>
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
      <aside
        className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 self-start sticky top-24 overflow-y-auto"
        style={{ height: 'calc(100vh - 6rem)' }}
      >
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
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
        <div className="flex-1 pb-8">
          {renderFilters()}
        </div>
      </aside>
    </>
  )
}
