import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const BRAND_CATEGORIES: Record<string, string[]> = {
  'Supercars & Hypercars': [
    'alpine', 'ariel', 'bugatti', 'caterham', 'corvette',
    'ferrari', 'koenigsegg', 'lamborghini', 'lotus', 'mclaren', 'pagani', 'rimac',
  ],
  'Luxury & Executive': [
    'aston-martin', 'bentley', 'brabus', 'jaguar', 'land-rover',
    'maserati', 'maybach', 'morgan', 'rolls-royce',
  ],
  'Premium Moderno': [
    'alfa-romeo', 'audi', 'bmw', 'cupra', 'genesis',
    'lexus', 'mercedes-benz', 'mini', 'porsche', 'tesla', 'volvo',
  ],
  'Sport & Performance': [
    'ford', 'honda', 'hyundai', 'kia', 'mazda',
    'mitsubishi', 'nissan', 'subaru', 'toyota',
  ],
  'Classics & Youngtimers': [
    'abarth', 'fiat', 'lancia', 'opel', 'peugeot', 'renault', 'seat', 'volkswagen',
  ],
  'Motos': [
    'aprilia', 'benelli', 'bimota', 'bmw-motorrad', 'cagiva', 'can-am',
    'ducati', 'energica',
    'harley-davidson', 'honda', 'husqvarna',
    'indian', 'kawasaki', 'ktm', 'livewire',
    'moto-guzzi', 'mv-agusta',
    'piaggio', 'royal-enfield',
    'suzuki', 'triumph', 'vespa', 'yamaha', 'zero-motorcycles',
  ],
}

export default async function MarcasPage() {
  const supabase = await createClient()
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const { data: counts } = await supabase
    .from('vehicles')
    .select('brand_name')
    .eq('status', 'active')

  const countMap: Record<string, number> = {}
  counts?.forEach((v: any) => {
    const key = v.brand_name.toLowerCase()
    countMap[key] = (countMap[key] || 0) + 1
  })

  const brandMap: Record<string, any> = {}
  brands?.forEach((b: any) => {
    brandMap[b.slug] = { ...b, count: countMap[b.name.toLowerCase()] || 0 }
  })

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Catálogo</span>
        </div>
        <h1 className="section-title">Marcas del marketplace</h1>
      </div>

      {Object.entries(BRAND_CATEGORIES).map(([category, slugs]) => {
        const categoryBrands = slugs
          .map((s) => brandMap[s])
          .filter(Boolean)
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
        if (!categoryBrands.length) return null
        return (
          <div key={category} className="mb-14">
            <h2 className="font-display text-xl font-light mb-6 pb-4 border-b border-bsm-border text-bsm-text-primary">
              {category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categoryBrands.map((brand: any) => (
                <Link
                  key={brand.id}
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
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
