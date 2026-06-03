import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MarcasPage() {
  const supabase = await createClient()

  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('brand_name, vehicle_type')
    .eq('status', 'active')

  // Count vehicles per brand and track which types each brand has
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
    types: typeMap[b.name.toLowerCase()] || new Set(),
  }))

  // A brand belongs to a section if it has that type in inventory.
  // Brands with no inventory at all go to cars by default.
  const MOTO_SLUGS = new Set([
    'aprilia','benelli','bimota','bmw-motorrad','cagiva','can-am',
    'ducati','energica','harley-davidson','husqvarna','indian',
    'kawasaki','ktm','livewire','moto-guzzi','mv-agusta',
    'piaggio','royal-enfield','triumph','vespa','zero-motorcycles',
  ])

  const carBrands = enriched.filter((b: any) =>
    b.types.has('car') || (!b.types.has('motorcycle') && !MOTO_SLUGS.has(b.slug))
  )
  const motoBrands = enriched.filter((b: any) =>
    b.types.has('motorcycle') || MOTO_SLUGS.has(b.slug)
  )

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
          {brand.count > 0 ? `${brand.count} vehículo${brand.count !== 1 ? 's' : ''}` : 'Próximamente'}
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
