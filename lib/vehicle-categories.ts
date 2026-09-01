// `slug` = segmento real de ruta (`/coches/[slug]`) — no siempre coincide con `value` (el
// dato tal como vive en la columna `category` de Supabase). deportivos/superdeportivos
// comparten una sola ruta combinada, igual que ya hace app/(public)/coches/deportivos/page.tsx
// con `.in('category', ['deportivos', 'superdeportivos'])`.
export const CAR_CATEGORIES_PUBLIC = [
  {
    value: 'deportivos',
    slug: 'deportivos',
    label: 'Deportivos',
    examples: 'BMW M3, Porsche 911 Carrera, Audi RS6, Alfa Romeo Giulia QV, Maserati Ghibli Trofeo',
  },
  {
    value: 'superdeportivos',
    slug: 'deportivos',
    label: 'Superdeportivos',
    examples: 'Ferrari 488, Lamborghini Huracán, McLaren 720S, Porsche 911 GT3 RS, Bugatti Chiron',
  },
  {
    value: 'berlinas_compactos',
    slug: 'berlinas',
    label: 'Berlinas, compactos y familiares',
    examples: 'Audi A3, BMW Serie 3, Mercedes Clase C, Audi A4, Alfa Romeo Giulia, Tesla Model 3, Lexus ES',
  },
  {
    value: 'suv_premium',
    slug: 'suv',
    label: 'SUV premium',
    examples: 'Audi Q5, BMW X3, Porsche Macan, Range Rover, Mercedes GLC, Lamborghini Urus',
  },
  {
    value: 'lujo_alta_gama',
    slug: 'lujo',
    label: 'Lujo y alta gama',
    examples: 'Rolls-Royce Ghost, Bentley Continental GT, Mercedes Clase S, BMW Serie 7, Maserati Quattroporte',
  },
  {
    value: 'clasicos',
    slug: 'clasicos',
    label: 'Clásicos y futuros clásicos',
    examples: 'Porsche 911 aire, BMW E30 M3, Ferrari 308 GTB, Jaguar E-Type, Alfa Romeo Spider, Audi Quattro',
  },
  {
    value: 'unidades_especiales',
    slug: 'especiales',
    label: 'Unidades especiales',
    examples: 'Ediciones limitadas, 1 de X unidades, preparaciones homologadas, vehículos de colección',
  },
] as const

// Motos — mismo criterio que CAR_CATEGORIES_PUBLIC. Labels/examples tomados literalmente
// del <title>/description reales de cada app/(public)/motos/<slug>/page.tsx, no inventados.
export const MOTO_CATEGORIES_PUBLIC = [
  {
    value: 'naked',
    slug: 'naked',
    label: 'Naked',
    examples: 'Ducati Streetfighter V4, BMW S1000R, Aprilia Tuono V4, KTM 1290 Super Duke R, MV Agusta Brutale',
  },
  {
    value: 'scooter_premium',
    slug: 'scooter',
    label: 'Scooters premium',
    examples: 'Vespa GTS 300, BMW C 400 GT, Aprilia SRV 850, Yamaha XMAX 400',
  },
  {
    value: 'ediciones_especiales',
    slug: 'ediciones-especiales',
    label: 'Ediciones especiales y colección',
    examples: 'Ducati Superleggera, BMW HP4 Race, Honda RC213V-S, MV Agusta F4 RC',
  },
  {
    value: 'trail_premium',
    slug: 'trail',
    label: 'Trail premium',
    examples: 'Honda Africa Twin, BMW GS, Ducati DesertX, KTM Adventure, Husqvarna Norden',
  },
  {
    value: 'entusiastas',
    slug: 'entusiastas',
    label: 'Para entusiastas',
    examples: 'Honda CB1000R, Triumph Street Triple, Kawasaki Z900RS, Yamaha MT-09',
  },
  {
    value: 'deportivas',
    slug: 'deportivas',
    label: 'Deportivas',
    examples: 'Ducati Panigale V4, BMW M1000RR, Kawasaki Ninja H2, Aprilia RSV4, Honda CBR1000RR',
  },
  {
    value: 'touring_adventure',
    slug: 'touring',
    label: 'Touring y adventure',
    examples: 'BMW R1250 GS, Ducati Multistrada V4, KTM 1290 Super Adventure, Triumph Tiger 1200',
  },
  {
    value: 'clasicas_youngtimers',
    slug: 'clasicas',
    label: 'Clásicas y youngtimers',
    examples: 'Honda CB750, Ducati 900 SS, Triumph T120, BMW R90S, café racers y neo-retro',
  },
  {
    value: 'custom_cruiser',
    slug: 'custom',
    label: 'Custom y cruiser',
    examples: 'Harley-Davidson Heritage, Indian Chief, Triumph Bobber, BMW R18',
  },
] as const

export type MotoCategoryValue = typeof MOTO_CATEGORIES_PUBLIC[number]['value']

// Busca el slug de ruta real (/coches/<slug> o /motos/<slug>) a partir del valor de
// categoría tal como vive en la columna `category` de `vehicles`. Devuelve null si no
// hay categoría o no coincide con ninguna conocida — el breadcrumb/enlazado debe omitir
// el nivel en vez de enlazar a una ruta inventada.
export function findCarCategorySlug(categoryValue: string | null | undefined): string | null {
  return CAR_CATEGORIES_PUBLIC.find((c) => c.value === categoryValue)?.slug ?? null
}
export function findMotoCategorySlug(categoryValue: string | null | undefined): string | null {
  return MOTO_CATEGORIES_PUBLIC.find((c) => c.value === categoryValue)?.slug ?? null
}
export function findCarCategoryLabel(categoryValue: string | null | undefined): string | null {
  return CAR_CATEGORIES_PUBLIC.find((c) => c.value === categoryValue)?.label ?? null
}
export function findMotoCategoryLabel(categoryValue: string | null | undefined): string | null {
  return MOTO_CATEGORIES_PUBLIC.find((c) => c.value === categoryValue)?.label ?? null
}

// Sellos internos — solo asignables desde admin, no visibles en el formulario de vendedor
export const CAR_CATEGORIES_ADMIN = [
  { value: 'black_label_selection', label: 'Black Label Selection' },
  { value: 'black_label_icon',      label: 'Black Label Icon' },
] as const

// Lista completa para el filtro público (compradores ven todo)
export const CAR_CATEGORIES_ALL = [
  ...CAR_CATEGORIES_PUBLIC,
  ...CAR_CATEGORIES_ADMIN,
] as const

export type CarCategoryValue = typeof CAR_CATEGORIES_PUBLIC[number]['value']
  | typeof CAR_CATEGORIES_ADMIN[number]['value']
