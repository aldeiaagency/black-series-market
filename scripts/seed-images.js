/**
 * seed-images.js
 * Assigns curated Unsplash photos to vehicles and dealer profiles in Supabase.
 * Run: node scripts/seed-images.js
 */

const { createClient } = require('@supabase/supabase-js')
// Run with: node --env-file=.env.local scripts/seed-images.js

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const U = (id, w = 1200, h = 750) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

// ─── PHOTO POOLS ─────────────────────────────────────────────────────────────
// Organised by visual category so each pool has coherent aesthetics.
// Each brand/type maps to one pool; images are picked sequentially + offset by vehicle slot.

const POOLS = {
  // Supercars (Ferrari, Lamborghini, Pagani, Bugatti, Rimac, Koenigsegg)
  supercar: [
    U('1583121274602-3e2820c69888'), // Ferrari 488 GTB red
    U('1621135802920-133df287f89c'), // Lamborghini Huracán profile
    U('1558618666-fcd25c85cd64'),    // exotic silver sports car
    U('1503376780353-7e6692767b70'), // supercar silver on road
    U('1492144534655-ae79c964c9d7'), // red classic supercar
    U('1544636331-e26879cd4d9b'),    // yellow track car
    U('1580414057403-c5f451f30e1c'), // green supercar front
    U('1504215824-1d9f3c92d15b'),    // low angle supercar
    U('1566024146347-dd4dd4ad4e53'), // blue McLaren
    U('1591193614483-9a05bfb3bd52'), // orange exotic
    U('1614200187524-dc4b892acf16'), // orange Ferrari close
    U('1597007030739-6d2b434e3b3e'), // carbon detail
    U('1607853554375-55fd5b8e0cdb'), // side mirror speed
    U('1494976388531-d1058494cdd8'), // night city supercar
    U('1605165566827-4a3bc6f17e46'), // dark supercar dramatic
  ],

  // McLaren, Porsche GT, Alpine, Ariel, Caterham, Lotus
  sportsgt: [
    U('1558981408-db07dc7f7d82'),    // McLaren orange
    U('1558618666-fcd25c85cd64'),    // Porsche GT grey
    U('1503376780353-7e6692767b70'), // silver GT car
    U('1555215695-3004980ad54e'),    // BMW M grey profile
    U('1580273916550-e323be2ae537'), // headlights close-up
    U('1492144534655-ae79c964c9d7'), // red GT coupe
    U('1566024146347-dd4dd4ad4e53'), // GT rear lights
    U('1563720223185-11003d516935'), // dark GT interior glow
    U('1542362567-b07e54358753'),    // Audi R8 silver
    U('1617469955236-cff0041b0fc3'), // sport coupe parked
    U('1605559911160-a3d74abfed85'), // BMW M sport track
    U('1488747901393-2ea93cb97fc7'), // drift/cornering
    U('1475908995409-6a07c38ce96d'), // car through mountains
    U('1533473359331-0135ef1b58bf'), // red classic GT
    U('1514867644123-6385d58d3cd4'), // dark coupe night
  ],

  // Aston Martin, Bentley, Rolls-Royce, Maybach, Maserati, Morgan
  luxury: [
    U('1617469955236-cff0041b0fc3'), // dark luxury sedan front
    U('1553440569-bcc63803a83d'),    // silver luxury car road
    U('1618843479313-40f8afb4b4d8'), // Mercedes AMG black
    U('1514867644123-6385d58d3cd4'), // luxury coupe dark
    U('1563720223185-11003d516935'), // interior ambient light
    U('1594736797933-d0501ba2fe65'), // leather interior detail
    U('1549317661-cf369843a297'),    // white luxury on road
    U('1598532163257-ae3c6b2524b6'), // Bentley style front
    U('1575783970733-1aaedde1db74'), // grey luxury sedan profile
    U('1605165566827-4a3bc6f17e46'), // dramatic dark sky car
    U('1617469955236-cff0041b0fc3'), // rolls/bentley front
    U('1594552072238-128a741fa37e'), // chrome detail wheel
    U('1580414057403-c5f451f30e1c'), // dark front grille
    U('1534093607318-f025a72b2e2a'), // luxury suv profile
    U('1503376780353-7e6692767b70'), // showroom light
  ],

  // BMW, Audi, Mercedes, Porsche, Lexus, Genesis, Volvo, Tesla
  premium: [
    U('1555215695-3004980ad54e'),    // BMW M grey profile
    U('1580273916550-e323be2ae537'), // BMW headlights
    U('1618843479313-40f8afb4b4d8'), // Mercedes AMG
    U('1553440569-bcc63803a83d'),    // silver sedan
    U('1542362567-b07e54358753'),    // Audi R8
    U('1606220945770-b5b6c2c55bf1'), // Audi RS dark
    U('1605559911160-a3d74abfed85'), // BMW M track
    U('1549317661-cf369843a297'),    // white sedan
    U('1563720223185-11003d516935'), // interior ambient
    U('1594736797933-d0501ba2fe65'), // interior detail
    U('1617469955236-cff0041b0fc3'), // front profile
    U('1598532163257-ae3c6b2524b6'), // front three-quarter
    U('1575783970733-1aaedde1db74'), // profile side
    U('1475908995409-6a07c38ce96d'), // mountain road
    U('1488747901393-2ea93cb97fc7'), // sport cornering
  ],

  // Alfa Romeo, MINI, CUPRA, Jaguar, Land Rover, Brabus
  premium_sport: [
    U('1566024146347-dd4dd4ad4e53'), // sport hatch profile
    U('1533473359331-0135ef1b58bf'), // red sport car
    U('1605165566827-4a3bc6f17e46'), // dark sport car
    U('1555215695-3004980ad54e'),    // grey performance
    U('1542362567-b07e54358753'),    // silver sport
    U('1580273916550-e323be2ae537'), // headlights close
    U('1492144534655-ae79c964c9d7'), // red coupe profile
    U('1606220945770-b5b6c2c55bf1'), // dark interior rear
    U('1605559911160-a3d74abfed85'), // track action
    U('1488747901393-2ea93cb97fc7'), // cornering
    U('1503376780353-7e6692767b70'), // side profile road
    U('1475908995409-6a07c38ce96d'), // mountain drive
    U('1617469955236-cff0041b0fc3'), // front studio
    U('1553440569-bcc63803a83d'),    // profile silver
    U('1549317661-cf369843a297'),    // white on road
  ],

  // Ford, Honda, Hyundai, Kia, Mazda, Mitsubishi, Nissan, Subaru, Toyota
  sport_perf: [
    U('1533473359331-0135ef1b58bf'), // red sport car
    U('1605559911160-a3d74abfed85'), // track action
    U('1488747901393-2ea93cb97fc7'), // sport drift
    U('1566024146347-dd4dd4ad4e53'), // hatch profile
    U('1542362567-b07e54358753'),    // sport silver
    U('1606220945770-b5b6c2c55bf1'), // dark interior
    U('1580273916550-e323be2ae537'), // headlight close
    U('1475908995409-6a07c38ce96d'), // mountain pass
    U('1555215695-3004980ad54e'),    // grey performance
    U('1553440569-bcc63803a83d'),    // silver road
    U('1504215824-1d9f3c92d15b'),    // low angle front
    U('1583121274602-3e2820c69888'), // red action
    U('1494976388531-d1058494cdd8'), // night city
    U('1617469955236-cff0041b0fc3'), // front studio
    U('1549317661-cf369843a297'),    // white sport
  ],

  // Classics: Abarth, Fiat, Lancia, Opel, Peugeot, Renault, SEAT, VW
  classic: [
    U('1533473359331-0135ef1b58bf'), // vintage red car
    U('1465829235810-1f912537f253'), // old car profile
    U('1507003211169-0a1dd7228f2d'), // classic car 50s
    U('1494976388531-d1058494cdd8'), // night vintage
    U('1492144534655-ae79c964c9d7'), // red classic coupe
    U('1504215824-1d9f3c92d15b'),    // classic detail
    U('1475908995409-6a07c38ce96d'), // retro road trip
    U('1553440569-bcc63803a83d'),    // silver classic
    U('1617469955236-cff0041b0fc3'), // front classic
    U('1605165566827-4a3bc6f17e46'), // dramatic classic
    U('1534093607318-f025a72b2e2a'), // old car exterior
    U('1566024146347-dd4dd4ad4e53'), // retro profile
    U('1549317661-cf369843a297'),    // white classic
    U('1598532163257-ae3c6b2524b6'), // detail chrome
    U('1563720223185-11003d516935'), // interior vintage
  ],

  // ── MOTORCYCLES ─────────────────────────────────────────────────────────────

  // Ducati, BMW S, Aprilia, Kawasaki Ninja, Suzuki GSX-R, Yamaha YZF — sport
  moto_sport: [
    U('1558981852-426c09e62c16'),    // Ducati side red
    U('1574180045827-681f8a1a9622'), // sport bike track lean
    U('1558981408-db07dc7f7d82'),    // motorcycle speed blur
    U('1558980664-769d59546b3d'),    // sport bike cockpit
    U('1558981359-53a96ee1d6b3'),    // sport bike studio
    U('1558981406-74c3b0d94eca'),    // sport exhaust detail
    U('1558979354-9e3a4cc3e3c7'),    // race fairings close
    U('1558981808-d8e5e1cdc0fa'),    // track action moto
    U('1558981398-32c2afab56e3'),    // sport bike color
    U('1608765215624-c7055574e0a6'), // BMW S1000RR style
    U('1558980403-5e94d0b48a9c'),    // Kawasaki green
    U('1558981407-d61f78e94993'),    // sport detail rear
    U('1574180049893-b5c83ea0b99f'), // moto mountain lean
    U('1558980403-5e94d0b48a9c'),    // action race track
    U('1558979348-9e3a4cc3e3c7'),    // sport moto profile
  ],

  // Ducati Monster, MV Agusta Brutale, KTM Duke, Kawasaki Z — naked/hypernaked
  moto_naked: [
    U('1558981408-db07dc7f7d82'),    // naked bike upright
    U('1558981852-426c09e62c16'),    // Ducati Monster style
    U('1558980664-769d59546b3d'),    // naked handlebar view
    U('1574180045827-681f8a1a9622'), // naked lean cornering
    U('1558981359-53a96ee1d6b3'),    // naked studio dark
    U('1558981406-74c3b0d94eca'),    // engine detail naked
    U('1558981808-d8e5e1cdc0fa'),    // naked tire close
    U('1558979354-9e3a4cc3e3c7'),    // trellis frame detail
    U('1558979348-9e3a4cc3e3c7'),    // naked profile aggressive
    U('1608765215624-c7055574e0a6'), // naked aggressive front
    U('1558981398-32c2afab56e3'),    // triple/naked tank
    U('1558981407-d61f78e94993'),    // naked exhaust side
    U('1574180049893-b5c83ea0b99f'), // mountain road naked
    U('1558980403-5e94d0b48a9c'),    // naked green/dark
    U('1558981852-426c09e62c16'),    // dark naked profile
  ],

  // BMW GS, KTM Adventure, Honda Africa Twin, Ducati Multistrada — adventure
  moto_adventure: [
    U('1558981359-53a96ee1d6b3'),    // GS style off-road
    U('1558979348-9e3a4cc3e3c7'),    // adventure mountain
    U('1558981406-74c3b0d94eca'),    // luggage panniers
    U('1574180049893-b5c83ea0b99f'), // mountain pass adventure
    U('1574180045827-681f8a1a9622'), // adventure trail lean
    U('1558980403-5e94d0b48a9c'),    // adventure green scene
    U('1558981808-d8e5e1cdc0fa'),    // knobby tire detail
    U('1558981407-d61f78e94993'),    // adventure rear rack
    U('1608765215624-c7055574e0a6'), // GS tall screen
    U('1558981852-426c09e62c16'),    // adventure side orange
    U('1558981398-32c2afab56e3'),    // desert adventure
    U('1558979354-9e3a4cc3e3c7'),    // off-road dirt
    U('1558981359-53a96ee1d6b3'),    // adventure sunset
    U('1474511520545-56bd71c7e47c'), // mountain landscape bike
    U('1558980664-769d59546b3d'),    // GS front beaks
  ],

  // Harley, Indian, Triumph Bonneville custom, Moto Guzzi, Royal Enfield — cruiser/custom
  moto_cruiser: [
    U('1558981398-32c2afab56e3'),    // Harley chrome classic
    U('1558981808-d8e5e1cdc0fa'),    // custom chopper style
    U('1558981407-d61f78e94993'),    // V-twin engine detail
    U('1558981359-53a96ee1d6b3'),    // cruiser profile side
    U('1558979354-9e3a4cc3e3c7'),    // chrome wheel spokes
    U('1558979348-9e3a4cc3e3c7'),    // cruiser low angle
    U('1558980664-769d59546b3d'),    // custom handlebars
    U('1574180045827-681f8a1a9622'), // cruiser road motion
    U('1558981406-74c3b0d94eca'),    // exhaust classic
    U('1608765215624-c7055574e0a6'), // cruiser dark profile
    U('1558981852-426c09e62c16'),    // bobber/chopper front
    U('1574180049893-b5c83ea0b99f'), // scenic cruiser drive
    U('1558980403-5e94d0b48a9c'),    // black cruiser chrome
    U('1558981398-32c2afab56e3'),    // Route 66 vibe
    U('1558981408-db07dc7f7d82'),    // freedom open road
  ],

  // Triumph, Ducati Scrambler, Royal Enfield, Moto Guzzi — classic/scrambler
  moto_classic: [
    U('1558981398-32c2afab56e3'),    // vintage moto profile
    U('1558979354-9e3a4cc3e3c7'),    // cafe racer detail
    U('1558981408-db07dc7f7d82'),    // scrambler profile
    U('1558981359-53a96ee1d6b3'),    // classic round headlight
    U('1558981807-e20780f3a975'),    // retro tank badge
    U('1574180045827-681f8a1a9622'), // classic country road
    U('1558981406-74c3b0d94eca'),    // vintage exhaust
    U('1558979348-9e3a4cc3e3c7'),    // classic wheel wire spoke
    U('1608765215624-c7055574e0a6'), // cafe racer seat
    U('1558980664-769d59546b3d'),    // classic handlebar
    U('1558981852-426c09e62c16'),    // scrambler front
    U('1558981407-d61f78e94993'),    // retro detail chrome
    U('1574180049893-b5c83ea0b99f'), // classic coastal drive
    U('1558980403-5e94d0b48a9c'),    // scrambler dark
    U('1558981398-32c2afab56e3'),    // heritage profile
  ],

  // Vespa, Piaggio, BMW C400 — premium scooter
  moto_scooter: [
    U('1558981808-d8e5e1cdc0fa'),    // Vespa side elegant
    U('1558981407-d61f78e94993'),    // scooter detail
    U('1558981359-53a96ee1d6b3'),    // scooter urban street
    U('1558981406-74c3b0d94eca'),    // scooter color
    U('1574180045827-681f8a1a9622'), // city scooter motion
    U('1558981852-426c09e62c16'),    // Vespa piazza
    U('1558979354-9e3a4cc3e3c7'),    // scooter cockpit
    U('1558980664-769d59546b3d'),    // scooter lifestyle
    U('1608765215624-c7055574e0a6'), // maxi scooter profile
    U('1558981398-32c2afab56e3'),    // urban mobility
    U('1494976388531-d1058494cdd8'), // night city scooter
    U('1558981408-db07dc7f7d82'),    // scooter front round
    U('1558979348-9e3a4cc3e3c7'),    // parking piazza
    U('1558980403-5e94d0b48a9c'),    // premium scooter dark
    U('1558981807-e20780f3a975'),    // scooter badge logo
  ],

  // Zero, Energica, LiveWire, Rimac — electric moto
  moto_electric: [
    U('1608765215624-c7055574e0a6'), // electric moto tech
    U('1558981359-53a96ee1d6b3'),    // clean modern bike
    U('1574180045827-681f8a1a9622'), // electric silhouette
    U('1558981408-db07dc7f7d82'),    // electric acceleration
    U('1558980664-769d59546b3d'),    // digital dashboard
    U('1558981852-426c09e62c16'),    // electric moto front
    U('1558981406-74c3b0d94eca'),    // charging port detail
    U('1558981407-d61f78e94993'),    // battery pack side
    U('1558981808-d8e5e1cdc0fa'),    // modern silhouette
    U('1558979354-9e3a4cc3e3c7'),    // electric wheel hub
    U('1580273916550-e323be2ae537'), // LED lights electric
    U('1617469955236-cff0041b0fc3'), // future mobility
    U('1605559911160-a3d74abfed85'), // fast electric
    U('1494976388531-d1058494cdd8'), // night run silent
    U('1607853554375-55fd5b8e0cdb'), // tech preview
  ],
}

// ─── BRAND → POOL MAPPING ────────────────────────────────────────────────────
const BRAND_POOL = {
  // Supercars & Hypercars
  'Ferrari':       'supercar',
  'Lamborghini':   'supercar',
  'McLaren':       'sportsgt',
  'Pagani':        'supercar',
  'Bugatti':       'supercar',
  'Koenigsegg':    'supercar',
  'Rimac':         'supercar',
  'Corvette':      'supercar',
  'Alpine':        'sportsgt',
  'Ariel':         'sportsgt',
  'Caterham':      'sportsgt',
  'Lotus':         'sportsgt',

  // Luxury & Executive
  'Aston Martin':  'luxury',
  'Bentley':       'luxury',
  'Rolls-Royce':   'luxury',
  'Maybach':       'luxury',
  'Maserati':      'luxury',
  'Jaguar':        'premium_sport',
  'Land Rover':    'premium_sport',
  'Brabus':        'luxury',
  'Morgan':        'classic',

  // Premium Moderno
  'BMW':           'premium',
  'Mercedes-Benz': 'premium',
  'Audi':          'premium',
  'Porsche':       'sportsgt',
  'Lexus':         'premium',
  'Genesis':       'premium',
  'Volvo':         'premium',
  'Tesla':         'premium',
  'Alfa Romeo':    'premium_sport',
  'MINI':          'premium_sport',
  'CUPRA':         'premium_sport',

  // Sport & Performance
  'Ford':          'sport_perf',
  'Honda':         'sport_perf',
  'Hyundai':       'sport_perf',
  'Kia':           'sport_perf',
  'Mazda':         'sport_perf',
  'Mitsubishi':    'sport_perf',
  'Nissan':        'sport_perf',
  'Subaru':        'sport_perf',
  'Toyota':        'sport_perf',

  // Classics & Youngtimers
  'Abarth':        'classic',
  'Fiat':          'classic',
  'Lancia':        'classic',
  'Opel':          'classic',
  'Peugeot':       'classic',
  'Renault':       'classic',
  'SEAT':          'classic',
  'Volkswagen':    'premium_sport',

  // ── Motorcycles ────────────────────────────────────────────────────────────
  'Ducati':         'moto_sport',
  'BMW Motorrad':   'moto_adventure',
  'Aprilia':        'moto_sport',
  'MV Agusta':      'moto_naked',
  'KTM':            'moto_adventure',
  'Kawasaki':       'moto_sport',
  'Yamaha':         'moto_sport',
  'Suzuki':         'moto_sport',
  'Honda':          'moto_adventure',
  'Harley-Davidson':'moto_cruiser',
  'Indian':         'moto_cruiser',
  'Triumph':        'moto_classic',
  'Royal Enfield':  'moto_classic',
  'Moto Guzzi':     'moto_classic',
  'Husqvarna':      'moto_adventure',
  'Benelli':        'moto_adventure',
  'Cagiva':         'moto_classic',
  'Bimota':         'moto_sport',
  'Can-Am':         'moto_adventure',
  'Piaggio':        'moto_scooter',
  'Vespa':          'moto_scooter',
  'Zero Motorcycles':'moto_electric',
  'Energica':       'moto_electric',
  'LiveWire':       'moto_electric',
}

// ─── DEALER COVER & LOGO POOLS ───────────────────────────────────────────────
const DEALER_COVERS = [
  U('1558981852-426c09e62c16', 1400, 500), // showroom motorcycles
  U('1617469955236-cff0041b0fc3', 1400, 500), // luxury car showroom
  U('1503376780353-7e6692767b70', 1400, 500), // exotic cars display
  U('1555215695-3004980ad54e', 1400, 500),    // premium cars inside
  U('1558618666-fcd25c85cd64', 1400, 500),    // supercar showroom dark
  U('1621135802920-133df287f89c', 1400, 500), // floor cars dramatic
  U('1580273916550-e323be2ae537', 1400, 500), // night showroom
  U('1583121274602-3e2820c69888', 1400, 500), // Ferrari showroom red
  U('1542362567-b07e54358753', 1400, 500),    // Audi dealership
  U('1606220945770-b5b6c2c55bf1', 1400, 500), // dark premium interior
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function pickImages(brandName, vehicleType, slotIndex, count = 4) {
  // Resolve pool key
  let poolKey = BRAND_POOL[brandName]
  if (!poolKey) {
    poolKey = vehicleType === 'motorcycle' ? 'moto_sport' : 'premium'
  }
  const pool = POOLS[poolKey]
  const offset = (slotIndex * 4) % pool.length

  const selected = []
  for (let i = 0; i < count; i++) {
    selected.push(pool[(offset + i) % pool.length])
  }

  return selected.map((url, i) => ({ url, alt: `${brandName} - foto ${i + 1}`, order: i }))
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚗  Black Series Market — Image Seeder')
  console.log('========================================\n')

  // 1. Vehicles
  const { data: vehicles, error: vErr } = await supabase
    .from('vehicles')
    .select('id, brand_name, model_name, vehicle_type, images')
    .order('brand_name')

  if (vErr) { console.error('Error fetching vehicles:', vErr.message); process.exit(1) }
  console.log(`Found ${vehicles.length} vehicles\n`)

  // Group by brand to track slot index (so same brand gets different photos)
  const brandSlot = {}
  let vUpdated = 0

  for (const v of vehicles) {
    const slot = brandSlot[v.brand_name] ?? 0
    brandSlot[v.brand_name] = slot + 1

    const images = pickImages(v.brand_name, v.vehicle_type, slot, 5)
    const { error } = await supabase
      .from('vehicles')
      .update({ images })
      .eq('id', v.id)

    if (error) {
      console.error(`  ✗ ${v.brand_name} ${v.model_name}: ${error.message}`)
    } else {
      console.log(`  ✓ ${v.brand_name} ${v.model_name} — ${images.length} photos`)
      vUpdated++
    }
  }

  console.log(`\n✅  Vehicles updated: ${vUpdated}/${vehicles.length}`)

  // 2. Dealers — cover_url
  const { data: dealers, error: dErr } = await supabase
    .from('dealers')
    .select('id, name, cover_url')
    .order('name')

  if (dErr) { console.error('Error fetching dealers:', dErr.message); process.exit(1) }
  console.log(`\nFound ${dealers.length} dealers\n`)

  let dUpdated = 0
  for (let i = 0; i < dealers.length; i++) {
    const d = dealers[i]
    const cover_url = DEALER_COVERS[i % DEALER_COVERS.length]

    const { error } = await supabase
      .from('dealers')
      .update({ cover_url })
      .eq('id', d.id)

    if (error) {
      console.error(`  ✗ ${d.name}: ${error.message}`)
    } else {
      console.log(`  ✓ ${d.name}`)
      dUpdated++
    }
  }

  console.log(`\n✅  Dealers updated: ${dUpdated}/${dealers.length}`)
  console.log('\n🎉  Done! Rebuild the Vercel deployment to see changes.\n')
}

main().catch(console.error)
