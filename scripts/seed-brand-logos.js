/**
 * seed-brand-logos.js
 * Sets logo_url on brands table using Clearbit's free logo API.
 * Run: node scripts/seed-brand-logos.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const logo = (domain) => `https://logo.clearbit.com/${domain}`

// brand slug → clearbit domain
const BRAND_LOGOS = {
  'ferrari':          logo('ferrari.com'),
  'lamborghini':      logo('lamborghini.com'),
  'mclaren':          logo('mclaren.com'),
  'bugatti':          logo('bugatti.com'),
  'pagani':           logo('pagani.com'),
  'koenigsegg':       logo('koenigsegg.com'),
  'rimac':            logo('rimac.com'),
  'corvette':         logo('chevrolet.com'),
  'alpine':           logo('alpinecars.com'),
  'lotus':            logo('lotuscars.com'),
  'ariel':            logo('arielmotor.com'),
  'caterham':         logo('caterhamcars.com'),

  'aston-martin':     logo('astonmartin.com'),
  'bentley':          logo('bentleymotors.com'),
  'rolls-royce':      logo('rolls-roycemotorcars.com'),
  'maybach':          logo('mercedes-benz.com'),
  'maserati':         logo('maserati.com'),
  'jaguar':           logo('jaguar.com'),
  'land-rover':       logo('landrover.com'),
  'brabus':           logo('brabus.com'),
  'morgan':           logo('morgancars.co.uk'),

  'bmw':              logo('bmw.com'),
  'mercedes-benz':    logo('mercedes-benz.com'),
  'audi':             logo('audi.com'),
  'porsche':          logo('porsche.com'),
  'lexus':            logo('lexus.com'),
  'genesis':          logo('genesis.com'),
  'volvo':            logo('volvocars.com'),
  'tesla':            logo('tesla.com'),
  'alfa-romeo':       logo('alfaromeo.com'),
  'mini':             logo('mini.com'),
  'cupra':            logo('cupraofficial.com'),

  'ford':             logo('ford.com'),
  'honda':            logo('honda.com'),
  'hyundai':          logo('hyundai.com'),
  'kia':              logo('kia.com'),
  'mazda':            logo('mazda.com'),
  'mitsubishi':       logo('mitsubishi-motors.com'),
  'nissan':           logo('nissan.com'),
  'subaru':           logo('subaru.com'),
  'toyota':           logo('toyota.com'),

  'abarth':           logo('abarth.com'),
  'fiat':             logo('fiat.com'),
  'lancia':           logo('lancia.com'),
  'opel':             logo('opel.com'),
  'peugeot':          logo('peugeot.com'),
  'renault':          logo('renault.com'),
  'seat':             logo('seat.com'),
  'volkswagen':       logo('vw.com'),

  // Motos
  'ducati':           logo('ducati.com'),
  'bmw-motorrad':     logo('bmw-motorrad.com'),
  'aprilia':          logo('aprilia.com'),
  'mv-agusta':        logo('mvagusta.com'),
  'ktm':              logo('ktm.com'),
  'kawasaki':         logo('kawasaki.com'),
  'yamaha':           logo('yamaha-motor.com'),
  'suzuki':           logo('suzuki.com'),
  'harley-davidson':  logo('harley-davidson.com'),
  'indian':           logo('indianmotorcycle.com'),
  'triumph':          logo('triumphmotorcycles.com'),
  'royal-enfield':    logo('royalenfield.com'),
  'moto-guzzi':       logo('motoguzzi.com'),
  'husqvarna':        logo('husqvarna.com'),
  'benelli':          logo('benelli.com'),
  'cagiva':           logo('cagiva.com'),
  'bimota':           logo('bimota.it'),
  'can-am':           logo('can-am.brp.com'),
  'piaggio':          logo('piaggio.com'),
  'vespa':            logo('vespa.com'),
  'zero-motorcycles': logo('zeromotorcycles.com'),
  'energica':         logo('energicamotor.com'),
  'livewire':         logo('livewire.com'),
}

async function main() {
  console.log('🏷️  Black Series Market — Brand Logo Seeder')
  console.log('=============================================\n')

  const { data: brands, error } = await supabase
    .from('brands')
    .select('id, name, slug')
    .order('name')

  if (error) { console.error('Error:', error.message); process.exit(1) }
  console.log(`Found ${brands.length} brands\n`)

  let updated = 0, skipped = 0

  for (const b of brands) {
    const logoUrl = BRAND_LOGOS[b.slug]
    if (!logoUrl) {
      console.log(`  — ${b.name} (no mapping for slug: ${b.slug})`)
      skipped++
      continue
    }

    const { error: uErr } = await supabase
      .from('brands')
      .update({ logo_url: logoUrl })
      .eq('id', b.id)

    if (uErr) {
      console.error(`  ✗ ${b.name}: ${uErr.message}`)
    } else {
      console.log(`  ✓ ${b.name}`)
      updated++
    }
  }

  console.log(`\n✅  Updated: ${updated}  Skipped: ${skipped}`)
  console.log('\n🎉  Done!\n')
}

main().catch(console.error)
