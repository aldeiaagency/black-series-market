// Single source of truth for brand-to-vehicle-type mapping.
// Matches the sets used in /marcas/page.tsx for consistency.
// Brands that appear in both sets are multi-type (e.g. Honda, Suzuki).

export const CAR_BRAND_SLUGS = new Set([
  'abarth', 'alfa-romeo', 'alpine', 'ariel', 'aston-martin', 'audi',
  'bentley', 'bmw', 'brabus', 'bugatti', 'cadillac', 'caterham', 'corvette', 'cupra',
  'dodge', 'ds', 'ferrari', 'fiat', 'ford', 'genesis', 'honda', 'hyundai',
  'jaguar', 'kia', 'koenigsegg', 'lamborghini', 'lancia', 'land-rover',
  'lexus', 'lotus', 'maserati', 'maybach', 'mazda', 'mclaren',
  'mercedes-benz', 'mini', 'mitsubishi', 'morgan', 'nissan', 'opel',
  'pagani', 'peugeot', 'polestar', 'porsche', 'renault', 'rimac',
  'rolls-royce', 'seat', 'subaru', 'tesla', 'toyota', 'volkswagen', 'volvo',
])

export const MOTO_BRAND_SLUGS = new Set([
  'aprilia', 'benelli', 'bimota', 'bmw-motorrad', 'cagiva', 'can-am',
  'ducati', 'energica', 'harley-davidson', 'honda', 'husqvarna',
  'indian', 'kawasaki', 'ktm', 'livewire', 'moto-guzzi', 'mv-agusta',
  'piaggio', 'royal-enfield', 'suzuki', 'triumph', 'vespa', 'yamaha',
  'zero-motorcycles',
])

export function brandSlugsForType(vehicleType: 'car' | 'motorcycle'): Set<string> {
  return vehicleType === 'motorcycle' ? MOTO_BRAND_SLUGS : CAR_BRAND_SLUGS
}
