'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { cn, SPAIN_LOCATIONS, getProvinciasByComunidad } from '@/lib/utils'
import { CAR_CATEGORIES_PUBLIC } from '@/lib/vehicle-categories'

const CAR_CATEGORIES = CAR_CATEGORIES_PUBLIC

const MOTO_CATEGORIES = [
  {
    value: 'deportivas',
    label: 'Deportivas',
    examples: 'Ducati Panigale V4, BMW M1000RR, Kawasaki Ninja H2, Aprilia RSV4, Honda CBR1000RR, Yamaha R1',
  },
  {
    value: 'naked',
    label: 'Naked',
    examples: 'BMW S1000R, Ducati Streetfighter V4, KTM 1290 Super Duke R, Yamaha MT-10, Kawasaki Z H2',
  },
  {
    value: 'touring_adventure',
    label: 'Touring / Adventure',
    examples: 'BMW R1250GS, Honda Gold Wing, BMW K1600 GTL, Ducati Multistrada V4, Triumph Tiger 1200',
  },
  {
    value: 'custom_cruiser',
    label: 'Custom / Cruiser',
    examples: 'Harley-Davidson CVO, Indian Challenger, Triumph Bobber TFC, BMW R18, Yamaha V-Max',
  },
  {
    value: 'clasicas_youngtimers',
    label: 'Clásicas y youngtimers',
    examples: 'Honda CB750, Ducati 900 SS, Triumph T120, BMW R90S, Kawasaki ZXR750, café racers y neo-retro',
  },
  {
    value: 'scooter_premium',
    label: 'Scooter premium',
    examples: 'BMW C650 GT, Yamaha T-Max 560, Honda Forza 750, Vespa GTS Super, Kymco AK 550',
  },
  {
    value: 'trail_premium',
    label: 'Trail premium',
    examples: 'Honda Africa Twin, Yamaha Ténéré 700, KTM 890 Adventure, Triumph Tiger 900, Royal Enfield Himalayan',
  },
  {
    value: 'ediciones_especiales',
    label: 'Ediciones especiales',
    examples: 'Ediciones limitadas, aniversario, homologaciones especiales, unidades numeradas, colecciones TFC',
  },
  {
    value: 'entusiastas',
    label: 'Motos para entusiastas',
    examples: 'Motos de carácter especial, historia o piezas raras. Cagiva Mito, Honda VFR, piezas de colección únicas',
  },
]

// ─── Brands ───────────────────────────────────────────────────────────────────

const FEATURED_BRANDS_CAR = [
  'Aston Martin', 'Audi', 'BMW', 'Ferrari',
  'Lamborghini', 'McLaren', 'Mercedes-Benz', 'Porsche',
]

const ALL_BRANDS_CAR = [
  'Abarth', 'Alfa Romeo', 'Alpine', 'Ariel', 'Aston Martin', 'Audi',
  'Bentley', 'BMW', 'Brabus', 'Bugatti',
  'Cadillac', 'Caterham', 'Corvette', 'Cupra',
  'Dodge', 'DS',
  'Ferrari', 'Fiat', 'Ford',
  'Genesis',
  'Honda', 'Hyundai',
  'Jaguar', 'Kia', 'Koenigsegg',
  'Lamborghini', 'Land Rover', 'Lancia', 'Lexus', 'Lotus',
  'Maserati', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Morgan',
  'Nissan', 'Opel',
  'Pagani', 'Peugeot', 'Polestar', 'Porsche',
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
  { value: 'Superbike',            label: 'Superbike',            examples: 'Ducati Panigale V4, BMW M1000RR, Honda CBR1000RR-R, Aprilia RSV4 Factory, Kawasaki Ninja H2' },
  { value: 'Deportiva',            label: 'Deportiva',            examples: 'Yamaha R6, Honda CBR600RR, Kawasaki ZX-6R, Triumph Daytona 765 Moto2' },
  { value: 'Naked',                label: 'Naked',                examples: 'KTM Duke 890, Yamaha MT-09, Honda CB650R, Triumph Street Triple RS' },
  { value: 'Naked deportiva',      label: 'Naked deportiva',      examples: 'BMW S1000R, Ducati Streetfighter V4, Aprilia Tuono V4 Factory' },
  { value: 'Hypernaked',           label: 'Hypernaked',           examples: 'KTM 1290 Super Duke R, Kawasaki Z H2, Yamaha MT-10 SP, MV Agusta Brutale 1000 RR' },
  { value: 'Trail / Adventure',    label: 'Trail / Adventure',    examples: 'BMW R1250GS, Honda Africa Twin, Triumph Tiger 900, KTM 890 Adventure' },
  { value: 'Maxitrail',            label: 'Maxitrail',            examples: 'Ducati Multistrada V4, BMW R1250GS Adventure, Triumph Tiger 1200, Honda CRF1100L Africa Twin Adventure' },
  { value: 'Turismo',              label: 'Turismo',              examples: 'Honda Gold Wing, BMW K1600 GTL, Harley-Davidson Road Glide Ultra, Kawasaki Concours 14' },
  { value: 'Sport Touring',        label: 'Sport Touring',        examples: 'BMW S1000XR, Ducati Multistrada 950, Kawasaki Versys 1000, Honda NT1100' },
  { value: 'Custom / Cruiser',     label: 'Custom / Cruiser',     examples: 'Harley-Davidson Fat Boy, Indian Chief, BMW R18, Yamaha V-Max, Triumph Bonneville Bobber' },
  { value: 'Scrambler',            label: 'Scrambler',            examples: 'Ducati Scrambler 1100 Sport Pro, Triumph Street Scrambler, Royal Enfield Meteor, BMW R nineT Scrambler' },
  { value: 'Café Racer',           label: 'Café Racer',           examples: 'Triumph Thruxton RS, BMW R Nine T Pure, Honda CB1000R Black Edition, Ducati Sport Classic' },
  { value: 'Clásica / Neo-retro',  label: 'Clásica / Neo-retro',  examples: 'Triumph Bonneville T120, BMW R Nine T, Royal Enfield Classic 500, Moto Guzzi V7 Stone' },
  { value: 'Maxi scooter',         label: 'Maxi scooter',         examples: 'Yamaha T-Max 560 Tech Max, Honda Forza 750, BMW C650 GT, Kymco AK 550' },
  { value: 'Scooter premium',      label: 'Scooter premium',      examples: 'Vespa GTS Super 300, Piaggio Beverly 400, Honda ADV350, Yamaha Xmax 400' },
  { value: 'Supermotard / Enduro', label: 'Supermotard / Enduro', examples: 'KTM 690 SMC R, Husqvarna 701 Supermoto, Beta RR 390, Sherco SE-F 300' },
  { value: 'Especial / Collector', label: 'Especial / Collector', examples: 'Ducati 916, Honda RC30 (VFR750R), Bimota Tesi 3D, MV Agusta 750 Sport, Kawasaki ZXR750' },
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
  const [versionDraft, setVersionDraft]         = useState(searchParams.get('version') || '')
  const [showAdvanced, setShowAdvanced]         = useState(false)
  const [allDealers, setAllDealers]             = useState<{ id: string; name: string; location_city: string | null; isFeatured: boolean }[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // ── Staging (filter drawer) ────────────────────────────────────────────────
  // While the drawer is open we edit a local `draft` instead of navigating; the URL
  // is only updated when the user taps "Ver N". This avoids a reload per toggle.
  // `view` is what reads resolve against: the draft while staging, the live URL
  // otherwise. The quick bar (drawer closed → draft null) keeps applying instantly.
  const [draft, setDraft] = useState<URLSearchParams | null>(null)
  const [draftCount, setDraftCount] = useState<number | null>(null)
  const [countLoading, setCountLoading] = useState(false)
  const [brandsWithStock, setBrandsWithStock] = useState<string[]>([])
  const view = draft ?? searchParams

  const isMoto      = vehicleType === 'motorcycle'
  const categories  = isMoto ? MOTO_CATEGORIES : CAR_CATEGORIES
  const allBrands   = brandsWithStock

  const currentBrand = view.get('marca') || ''
  const currentModel = view.get('modelo') || ''

  const activeFilterCount = Array.from(searchParams.entries()).filter(
    ([k]) => !['page', 'sort'].includes(k)
  ).length
  // Count reflecting the draft while the drawer is open (else the applied URL).
  const drawerFilterCount = Array.from(view.entries()).filter(
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

  // ── Quick filters (top bar) ────────────────────────────────────────────────
  // Which range popover (price / year) is currently open in the quick bar.
  const [openQuick, setOpenQuick] = useState<string | null>(null)

  // Fuel options surfaced as a quick filter in the bar.
  const FUEL_QUICK = [
    { value: 'gasoline', label: 'Gasolina' },
    { value: 'diesel', label: 'Diésel' },
    { value: 'electric', label: 'Eléctrico' },
    { value: 'hybrid', label: 'Híbrido' },
    { value: 'plugin_hybrid', label: 'Híbrido enchufable' },
  ]

  const brandSlug = (name: string) => name.toLowerCase().replace(/ /g, '-')

  // Commit a set of params either to the local draft (staging) or to the URL (live).
  function commit(mutate: (p: URLSearchParams) => void) {
    if (draft) {
      const next = new URLSearchParams(draft.toString())
      mutate(next)
      next.delete('page')
      setDraft(next)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }

  // Apply a min/max range in a single operation.
  function updateRange(minKey: string, minVal: string, maxKey: string, maxVal: string) {
    commit((p) => {
      minVal ? p.set(minKey, minVal) : p.delete(minKey)
      maxVal ? p.set(maxKey, maxVal) : p.delete(maxKey)
    })
  }

  useEffect(() => {
    if (!currentBrand) { setModels([]); return }
    setLoadingModels(true)
    const type = isMoto ? 'motorcycle' : 'car'
    fetch(`/api/models?brand=${currentBrand}&type=${type}`)
      .then((r) => r.json())
      .then((data: string[]) => setModels(data))
      .finally(() => setLoadingModels(false))
  }, [currentBrand, isMoto])

  // Filtro de marca "centrado en stock": solo marcas con vehículos publicados.
  useEffect(() => {
    const type = isMoto ? 'motorcycle' : 'car'
    fetch(`/api/brands?type=${type}`)
      .then((r) => r.json())
      .then((data: string[]) => setBrandsWithStock(Array.isArray(data) ? data : []))
      .catch(() => setBrandsWithStock([]))
  }, [isMoto])

  useEffect(() => {
    setSearchDraft(searchParams.get('search') || '')
    setVersionDraft(searchParams.get('version') || '')
  }, [searchParams])

  // Fetch all dealers with active stock, filtered by current location
  useEffect(() => {
    const provincia  = searchParams.get('provincia')
    const comunidad  = searchParams.get('comunidad')
    const qs         = new URLSearchParams()
    qs.set('type', isMoto ? 'motorcycle' : 'car')
    if (provincia) {
      qs.set('provincias', provincia)
    } else if (comunidad) {
      const ps = getProvinciasByComunidad(comunidad)
      if (ps.length) qs.set('provincias', ps.join(','))
    }
    fetch(`/api/featured-dealers?${qs}`)
      .then((r) => r.json())
      .then((data) => setAllDealers(Array.isArray(data) ? data : []))
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('provincia'), searchParams.get('comunidad'), isMoto])

  // Open advanced section automatically if an advanced filter is active
  useEffect(() => {
    const advancedParams = ['condicion', 'ivaDeducible', 'traccion', 'etiquetaDgt', 'equipamiento', 'historial']
    if (advancedParams.some((p) => searchParams.has(p))) {
      setShowAdvanced(true)
    }
  }, [searchParams])

  // Live result count for the staging drawer — debounced; mirrors the grid's filters.
  useEffect(() => {
    if (!mobileOpen || !draft) return
    setCountLoading(true)
    const t = setTimeout(() => {
      const qs = new URLSearchParams(draft.toString())
      qs.delete('page'); qs.delete('sort')
      qs.set('type', isMoto ? 'motorcycle' : 'car')
      fetch(`/api/vehicles/count?${qs.toString()}`)
        .then((r) => r.json())
        .then((d) => setDraftCount(typeof d.count === 'number' ? d.count : null))
        .catch(() => setDraftCount(null))
        .finally(() => setCountLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [draft, mobileOpen, isMoto])

  function updateParam(key: string, value: string | null) {
    commit((p) => {
      if (value === null || value === '') p.delete(key)
      else p.set(key, value)
    })
  }

  function updateBrand(brand: string) {
    commit((p) => {
      if (!brand) { p.delete('marca'); p.delete('modelo') }
      else { p.set('marca', brand); p.delete('modelo') }
    })
  }

  function updateComunidad(comunidad: string) {
    commit((p) => {
      if (!comunidad) { p.delete('comunidad'); p.delete('provincia') }
      else { p.set('comunidad', comunidad); p.delete('provincia') }
      p.delete('showroom')
    })
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('search', searchDraft.trim() || null)
    if (!draft) setMobileOpen(false)  // live (quick bar): close mobile; staging: keep open
  }

  function clearAll() {
    setSearchDraft('')
    if (draft) {
      const sort = draft.get('sort')
      const next = new URLSearchParams()
      if (sort) next.set('sort', sort)
      setDraft(next)
      return
    }
    const sort = searchParams.get('sort')
    router.push(sort ? `${pathname}?sort=${sort}` : pathname, { scroll: false })
  }

  // Drawer lifecycle: open initialises the draft from the live URL; apply pushes the
  // draft to the URL; close/cancel discards it.
  function openDrawer() {
    setDraft(new URLSearchParams(searchParams.toString()))
    setDraftCount(null)
    setCountLoading(true)
    setMobileOpen(true)
  }
  function closeDrawer() {
    setMobileOpen(false)
    setDraft(null)
  }
  function applyDraft() {
    if (draft) {
      const next = new URLSearchParams(draft.toString())
      next.delete('page')
      router.push(`${pathname}?${next.toString()}`, { scroll: false })
    }
    closeDrawer()
  }

  const CheckOption = ({ param, value, label }: { param: string; value: string; label: string }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        className="accent-gold w-3.5 h-3.5"
        checked={view.get(param) === value}
        onChange={(e) => updateParam(param, e.target.checked ? value : null)}
      />
      <span className="text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors">
        {label}
      </span>
    </label>
  )

  function renderFilters() {
    // Inside the drawer every read resolves against the draft (staging). Shadowing
    // `searchParams` here keeps the large JSX below untouched while making each
    // `searchParams.get(...)` draft-aware automatically.
    const searchParams = view
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
              className="flex items-center gap-1 text-xs text-[#9E9E9E] hover:text-[#9A9A9A] transition-colors mt-2"
            >
              <X className="w-3 h-3" />
              Quitar búsqueda
            </button>
          )}
        </FilterGroup>

        {/* Category */}
        <FilterGroup title="Categoría">
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
                    <p className="mt-1.5 ml-6 text-[10px] text-[#9E9E9E] leading-relaxed">
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
        <FilterGroup title="Potencia (CV)">
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

        {/* Ubicación — 2 niveles: comunidad → provincia */}
        <FilterGroup title="Ubicación" defaultOpen={false}>
          {/* Nivel 1: comunidad autónoma */}
          <select
            className="select-base"
            value={searchParams.get('comunidad') || ''}
            onChange={(e) => updateComunidad(e.target.value)}
          >
            <option value="">Cualquier comunidad</option>
            {SPAIN_LOCATIONS.map(({ comunidad }) => (
              <option key={comunidad} value={comunidad}>{comunidad}</option>
            ))}
          </select>

          {/* Nivel 2: provincias (solo si hay comunidad con >1 provincia) */}
          {(() => {
            const comunidad = searchParams.get('comunidad')
            if (!comunidad) return (
              <p className="mt-2 text-[10px] text-[#555] leading-relaxed">
                Selecciona una comunidad para ver sus provincias.
              </p>
            )
            const provincias = getProvinciasByComunidad(comunidad)
            if (provincias.length <= 1) return null
            return (
              <div className="mt-3">
                <p className="text-[10px] text-[#9E9E9E] uppercase tracking-widest mb-2">
                  Provincia (opcional)
                </p>
                <div className="space-y-1.5">
                  {provincias.map((p) => (
                    <CheckOption key={p} param="provincia" value={p} label={p} />
                  ))}
                </div>
              </div>
            )
          })()}
        </FilterGroup>

        {/* Showroom — todos los dealers con stock en la ubicación seleccionada */}
        <FilterGroup title="Showroom" defaultOpen={false}>
          {allDealers.length === 0 ? (
            <p className="text-[11px] text-[#555] leading-relaxed">
              {searchParams.get('comunidad') || searchParams.get('provincia')
                ? 'No hay showrooms con stock en esta ubicación.'
                : 'Cargando showrooms…'}
            </p>
          ) : (
            <div className="space-y-2">
              {allDealers.map((d) => (
                <label key={d.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="accent-gold w-3.5 h-3.5"
                    checked={searchParams.get('showroom') === d.id}
                    onChange={(e) => updateParam('showroom', e.target.checked ? d.id : null)}
                  />
                  <span className="flex items-center gap-1.5 text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors min-w-0 flex-wrap">
                    <span className="truncate">
                      {d.location_city ? `${d.name} · ${d.location_city}` : d.name}
                    </span>
                    {d.isFeatured && (
                      <span className="shrink-0 border border-[#C6A64B]/35 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[#C6A64B]/75">
                        Destacado
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}
        </FilterGroup>

        {/* Vehicle-type-specific main filters */}
        {isMoto ? (
          <>
            <FilterGroup title="Tipo de moto">
              <div className="space-y-2">
                {MOTO_STYLES.map((style) => {
                  const isExpanded = expandedCategory === style.value
                  return (
                    <div key={style.value}>
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="accent-gold w-3.5 h-3.5 flex-shrink-0"
                          checked={searchParams.get('estilo') === style.value}
                          onChange={(e) => updateParam('estilo', e.target.checked ? style.value : null)}
                        />
                        <span className="text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors leading-tight">
                          {style.label}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setExpandedCategory(isExpanded ? null : style.value) }}
                          className="ml-auto flex-shrink-0 w-4 h-4 rounded-full border border-[#444] text-[#666]
                            hover:border-gold hover:text-gold transition-colors text-[9px]
                            flex items-center justify-center select-none"
                          aria-label={`Ejemplos de ${style.label}`}
                        >i</button>
                      </label>
                      {isExpanded && (
                        <p className="mt-1.5 ml-6 text-[10px] text-[#9E9E9E] leading-relaxed">
                          <span className="text-[#555] mr-1">Ej:</span>{style.examples}
                        </p>
                      )}
                    </div>
                  )
                })}
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
            className="flex items-center gap-2 text-sm text-[#9E9E9E] hover:text-[#9A9A9A] transition-colors mt-4"
          >
            <X className="w-4 h-4" />
            Borrar todos los filtros
          </button>
        )}
      </div>
    )
  }

  const priceLabel = (() => {
    const min = searchParams.get('precioMin'), max = searchParams.get('precioMax')
    if (min && max) return `${(+min / 1000).toFixed(0)}k–${(+max / 1000).toFixed(0)}k €`
    if (min) return `Desde ${(+min / 1000).toFixed(0)}k €`
    if (max) return `Hasta ${(+max / 1000).toFixed(0)}k €`
    return 'Precio'
  })()
  const yearLabel = (() => {
    const min = searchParams.get('anioMin'), max = searchParams.get('anioMax')
    if (min && max) return `${min}–${max}`
    if (min) return `${min}+`
    if (max) return `Hasta ${max}`
    return 'Año'
  })()

  const quickSelectCls =
    'select-base w-auto min-w-[7rem] text-sm py-2'
  const quickBtnCls =
    'flex items-center gap-1.5 px-3 py-2 text-sm border border-bsm-border text-bsm-text-secondary ' +
    'hover:border-gold/40 hover:text-bsm-text-primary transition-colors whitespace-nowrap'

  return (
    <>
      {/* ── FILTER BAR ── */}
      <div className="space-y-3">
        {/* Search — su propia fila, alineada a la izquierda */}
        <form onSubmit={submitSearch} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bsm-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder={`Marca, modelo${isMoto ? ', estilo' : ', versión'}…`}
            className="input-base pl-9 text-sm"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            aria-label="Buscar"
          />
        </form>

        {/* Filtros rápidos — fila alineada a la izquierda */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick: Marca */}
          <select
            className={`${quickSelectCls} hidden sm:block`}
            value={currentBrand}
            onChange={(e) => updateBrand(e.target.value)}
            aria-label="Marca"
          >
            <option value="">Marca</option>
            {allBrands.map((brand) => (
              <option key={brand} value={brandSlug(brand)}>{brand}</option>
            ))}
          </select>

          {/* Quick: Modelo (aparece al elegir marca) */}
          {currentBrand && (
            <select
              className={`${quickSelectCls} hidden sm:block`}
              value={view.get('modelo') || ''}
              onChange={(e) => updateParam('modelo', e.target.value || null)}
              disabled={loadingModels}
              aria-label="Modelo"
            >
              <option value="">{loadingModels ? 'Cargando…' : 'Modelo'}</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}

          {/* Quick: Versión (texto) — consecutivo a Marca/Modelo, mismo ancho */}
          <form
            onSubmit={(e) => { e.preventDefault(); updateParam('version', versionDraft.trim() || null) }}
            className="hidden sm:block"
          >
            <input
              type="text"
              placeholder="Versión"
              className="input-base text-sm py-2 w-36"
              value={versionDraft}
              onChange={(e) => setVersionDraft(e.target.value)}
              onBlur={() => { if ((view.get('version') || '') !== versionDraft.trim()) updateParam('version', versionDraft.trim() || null) }}
              aria-label="Versión"
            />
          </form>

          {/* Quick: Categoría */}
          <select
            className={`${quickSelectCls} hidden md:block`}
            value={view.get('categoria') || ''}
            onChange={(e) => updateParam('categoria', e.target.value || null)}
            aria-label="Categoría"
          >
            <option value="">Categoría</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Quick: Precio */}
          <div className="relative hidden md:block">
            <button type="button" onClick={() => setOpenQuick(openQuick === 'precio' ? null : 'precio')} className={quickBtnCls}>
              {priceLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openQuick === 'precio' && (
              <>
                <button className="fixed inset-0 z-30" aria-hidden onClick={() => setOpenQuick(null)} />
                <form
                  onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); updateRange('precioMin', String(fd.get('min') || ''), 'precioMax', String(fd.get('max') || '')); setOpenQuick(null) }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-40 w-64 bg-[#0D0D0D] border border-bsm-border p-4 shadow-xl"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <input name="min" type="number" defaultValue={searchParams.get('precioMin') || ''} placeholder="Desde €" className="input-base text-sm" />
                    <input name="max" type="number" defaultValue={searchParams.get('precioMax') || ''} placeholder="Hasta €" className="input-base text-sm" />
                  </div>
                  <button type="submit" className="btn-gold w-full justify-center text-xs mt-3 py-2">Aplicar</button>
                </form>
              </>
            )}
          </div>

          {/* Quick: Año */}
          <div className="relative hidden lg:block">
            <button type="button" onClick={() => setOpenQuick(openQuick === 'anio' ? null : 'anio')} className={quickBtnCls}>
              {yearLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openQuick === 'anio' && (
              <>
                <button className="fixed inset-0 z-30" aria-hidden onClick={() => setOpenQuick(null)} />
                <form
                  onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); updateRange('anioMin', String(fd.get('min') || ''), 'anioMax', String(fd.get('max') || '')); setOpenQuick(null) }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-40 w-56 bg-[#0D0D0D] border border-bsm-border p-4 shadow-xl"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <input name="min" type="number" min="1950" defaultValue={searchParams.get('anioMin') || ''} placeholder="Desde" className="input-base text-sm" />
                    <input name="max" type="number" min="1950" defaultValue={searchParams.get('anioMax') || ''} placeholder="Hasta" className="input-base text-sm" />
                  </div>
                  <button type="submit" className="btn-gold w-full justify-center text-xs mt-3 py-2">Aplicar</button>
                </form>
              </>
            )}
          </div>

          {/* Quick: Combustible */}
          <select
            className={`${quickSelectCls} hidden lg:block`}
            value={searchParams.get('combustible') || ''}
            onChange={(e) => updateParam('combustible', e.target.value || null)}
            aria-label="Combustible"
          >
            <option value="">Combustible</option>
            {FUEL_QUICK.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* All filters → drawer */}
          <button
            onClick={openDrawer}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gold/40 text-gold
              hover:bg-gold/10 transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Todos los filtros
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gold text-obsidian text-[10px] font-medium flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── FILTER DRAWER (derecha en escritorio, pantalla completa en móvil) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-label="Cerrar filtros"
          />
          <div className="relative z-10 h-full w-full sm:w-[420px] bg-[#080808] border-l border-bsm-border flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.8)] animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-bsm-border flex-shrink-0">
              <div>
                <span className="text-sm font-medium text-bsm-text-primary">
                  Filtros {drawerFilterCount > 0 ? `(${drawerFilterCount})` : ''}
                </span>
                <p className="text-[11px] text-bsm-text-muted mt-0.5">{totalCount} vehículos en total</p>
              </div>
              <button
                onClick={closeDrawer}
                className="p-1 text-bsm-text-muted hover:text-bsm-text-primary transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain filter-scroll px-5 py-5">
              {renderFilters()}
            </div>
            <div className="flex-shrink-0 px-5 py-4 border-t border-bsm-border flex items-center gap-3">
              {drawerFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-bsm-text-muted hover:text-bsm-text-primary transition-colors whitespace-nowrap"
                >
                  Borrar todo
                </button>
              )}
              <button
                onClick={applyDraft}
                disabled={countLoading}
                className="btn-gold flex-1 justify-center text-sm disabled:opacity-70"
              >
                {countLoading
                  ? 'Calculando…'
                  : draftCount != null
                    ? `Ver ${draftCount} ${isMoto ? (draftCount === 1 ? 'moto' : 'motos') : (draftCount === 1 ? 'coche' : 'coches')}`
                    : 'Ver resultados'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
