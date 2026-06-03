import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Slugs canónicos por tipo — determina sección cuando no hay vehículos publicados.
// Honda aparece en ambas listas porque fabrica coches y motos.
const CAR_BRAND_SLUGS = new Set([
  'abarth','alfa-romeo','alpine','ariel','aston-martin','audi',
  'bentley','bmw','brabus','bugatti','caterham','corvette','cupra',
  'dodge','ferrari','fiat','ford','genesis','honda','hyundai',
  'jaguar','kia','koenigsegg','lamborghini','lancia','land-rover',
  'lexus','lotus','maserati','maybach','mazda','mclaren',
  'mercedes-benz','mini','mitsubishi','morgan','nissan','opel',
  'pagani','peugeot','polestar','porsche','renault','rimac',
  'rolls-royce','seat','subaru','tesla','toyota','volkswagen','volvo',
])

const MOTO_BRAND_SLUGS = new Set([
  'aprilia','benelli','bimota','bmw-motorrad','cagiva','can-am',
  'ducati','energica','harley-davidson','honda','husqvarna',
  'indian','kawasaki','ktm','livewire','moto-guzzi','mv-agusta',
  'piaggio','royal-enfield','suzuki','triumph','vespa','yamaha',
  'zero-motorcycles',
])

export default async function MarcasPage() {
  const supabase = await createClient()

  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name')

  // Count active vehicles per brand and track which types each brand has
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('brand_name, vehicle_type')
    .eq('status', 'active')

  const countMap: Record<string, number> = {}
  const typeMap: Record<string, Set<string>> = {}

  vehicles?.forEach((v: any) => {
    const key = v.brand_name.toLowerCase()
    countMap[key] = (countMap[key] || 0) + 1
    if (!typeMap[key]) typeMap[key] = new Set()
    typeMap[key].add(v.vehicle_type)
  })

  const enriched = (brands || []).map((b: any) => ({
    ...b,
    count: countMap[b.name.toLowerCase()] || 0,
    types: typeMap[b.name.toLowerCase()] || new Set<string>(),
  }))

  // A brand appears in a section if it has vehicles of that type OR is in the slug set.
  // Honda is in both sets → appears in both sections.
  const carBrands  = enriched.filter((b: any) => b.types.has('car')        || CAR_BRAND_SLUGS.has(b.slug))
  const motoBrands = enriched.filter((b: any) => b.types.has('motorcycle') || MOTO_BRAND_SLUGS.has(b.slug))

  function vehicleLabel(count: number) {
    return count === 1 ? '1 vehículo' : `${count} vehículos`
  }

  function BrandCard({ brand }: { brand: any }) {
    return (
      <Link
        href={`/marcas/${brand.slug}`}
        className="group bg-surface border border-bsm-border p-6 flex flex-col items-center text-center
          hover:border-gold/30 hover:shadow-card transition-all duration-300"
      >
        <div className="w-12 h-12 flex items-center justify-center mb-4">
          {brand.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
          ) : (
            <span className="font-display text-2xl font-light text-gold group-hover:text-gold-light transition-colors">
              {brand.name[0]}
            </span>
          )}
        </div>
        <h3 className="text-sm font-medium text-bsm-text-primary group-hover:text-gold transition-colors mb-1">
          {brand.name}
        </h3>
        <p className="text-xs text-bsm-text-muted">
          {vehicleLabel(brand.count)}
        </p>
      </Link>
    )
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Catálogo</span>
        </div>
        <h1 className="section-title">Marcas del marketplace</h1>
      </div>

      {carBrands.length > 0 && (
        <div className="mb-14">
          <h2 className="font-display text-xl font-light mb-6 pb-4 border-b border-bsm-border text-bsm-text-primary">
            Coches
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {carBrands.map((brand: any) => <BrandCard key={brand.id} brand={brand} />)}
          </div>
        </div>
      )}

      {motoBrands.length > 0 && (
        <div className="mb-14">
          <h2 className="font-display text-xl font-light mb-6 pb-4 border-b border-bsm-border text-bsm-text-primary">
            Motos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {motoBrands.map((brand: any) => <BrandCard key={brand.id} brand={brand} />)}
          </div>
        </div>
      )}
    </div>
  )
}
