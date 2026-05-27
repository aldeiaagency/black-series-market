/**
 * Downloads brand logos from public CDNs and converts them to WebP.
 * Output: public/brand/{slug}.webp
 * Run: node scripts/download-brand-logos.mjs
 */

import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'brand')
mkdirSync(OUT_DIR, { recursive: true })

// Primary CDN: filippofilip95 car-logos-dataset (PNG optimized ~120px)
const CDN = 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized'

// Wikipedia REST API — returns page summary with thumbnail image
async function wikiThumbnail(pageTitle) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; brand-logo-downloader/1.0)' },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return null
  const json = await res.json()
  return json?.thumbnail?.source || json?.originalimage?.source || null
}

/**
 * Maps each brand slug → candidate URLs tried in order.
 * For 'wiki:PageTitle' entries the Wikipedia REST API is called to get the thumbnail.
 */
const BRANDS = {
  // ── Supercars & Hypercars ───────────────────────────────────────────────
  alpine:           [`${CDN}/alpine.png`, 'wiki:Alpine (automobile)'],
  ariel:            ['wiki:Ariel Motor Company'],
  bugatti:          [`${CDN}/bugatti.png`],
  caterham:         ['wiki:Caterham Cars'],
  corvette:         [`${CDN}/chevrolet.png`, 'wiki:Chevrolet Corvette'],
  ferrari:          [`${CDN}/ferrari.png`],
  koenigsegg:       [`${CDN}/koenigsegg.png`],
  lamborghini:      [`${CDN}/lamborghini.png`],
  lotus:            [`${CDN}/lotus.png`],
  mclaren:          [`${CDN}/mclaren.png`],
  pagani:           [`${CDN}/pagani.png`],
  rimac:            ['wiki:Rimac Automobili'],

  // ── Luxury & Executive ──────────────────────────────────────────────────
  'aston-martin':   [`${CDN}/aston-martin.png`],
  bentley:          [`${CDN}/bentley.png`],
  brabus:           ['wiki:Brabus'],
  jaguar:           [`${CDN}/jaguar.png`],
  'land-rover':     [`${CDN}/land-rover.png`],
  maserati:         [`${CDN}/maserati.png`],
  maybach:          [`${CDN}/maybach.png`],
  morgan:           ['wiki:Morgan Motor Company'],
  'rolls-royce':    [`${CDN}/rolls-royce.png`],

  // ── Premium Moderno ─────────────────────────────────────────────────────
  'alfa-romeo':     [`${CDN}/alfa-romeo.png`],
  audi:             [`${CDN}/audi.png`],
  bmw:              [`${CDN}/bmw.png`],
  cupra:            [`${CDN}/cupra.png`, 'wiki:Cupra (car brand)'],
  genesis:          [`${CDN}/genesis.png`],
  lexus:            [`${CDN}/lexus.png`],
  'mercedes-benz':  [`${CDN}/mercedes-benz.png`],
  mini:             [`${CDN}/mini.png`],
  porsche:          [`${CDN}/porsche.png`],
  tesla:            [`${CDN}/tesla.png`],
  volvo:            [`${CDN}/volvo.png`],

  // ── Sport & Performance ─────────────────────────────────────────────────
  ford:             [`${CDN}/ford.png`],
  honda:            [`${CDN}/honda.png`],
  hyundai:          [`${CDN}/hyundai.png`],
  kia:              [`${CDN}/kia.png`],
  mazda:            [`${CDN}/mazda.png`],
  mitsubishi:       [`${CDN}/mitsubishi.png`],
  nissan:           [`${CDN}/nissan.png`],
  subaru:           [`${CDN}/subaru.png`],
  toyota:           [`${CDN}/toyota.png`],

  // ── Classics & Youngtimers ──────────────────────────────────────────────
  abarth:           [`${CDN}/abarth.png`],
  fiat:             [`${CDN}/fiat.png`],
  lancia:           [`${CDN}/lancia.png`],
  opel:             [`${CDN}/opel.png`],
  peugeot:          [`${CDN}/peugeot.png`],
  renault:          [`${CDN}/renault.png`],
  seat:             [`${CDN}/seat.png`],
  volkswagen:       [`${CDN}/volkswagen.png`],

  // ── Motos ───────────────────────────────────────────────────────────────
  aprilia:          [`${CDN}/aprilia.png`, 'wiki:Aprilia (motorcycles)'],
  benelli:          [`${CDN}/benelli.png`, 'wiki:Benelli (motorcycles)'],
  bimota:           ['wiki:Bimota'],
  'bmw-motorrad':   [`${CDN}/bmw.png`],
  cagiva:           ['wiki:Cagiva'],
  'can-am':         [`${CDN}/can-am.png`, 'wiki:Can-Am (motorcycles)'],
  ducati:           [`${CDN}/ducati.png`],
  energica:         ['wiki:Energica Motor Company'],
  'harley-davidson':[`${CDN}/harley-davidson.png`],
  husqvarna:        [`${CDN}/husqvarna.png`, 'wiki:Husqvarna Motorcycles'],
  indian:           [`${CDN}/indian.png`, 'wiki:Indian Motorcycle'],
  kawasaki:         [`${CDN}/kawasaki.png`],
  ktm:              [`${CDN}/ktm.png`],
  livewire:         ['wiki:LiveWire (motorcycle)'],
  'moto-guzzi':     [`${CDN}/moto-guzzi.png`, 'wiki:Moto Guzzi'],
  'mv-agusta':      [`${CDN}/mv-agusta.png`, 'wiki:MV Agusta'],
  piaggio:          [`${CDN}/piaggio.png`, 'wiki:Piaggio'],
  'royal-enfield':  [`${CDN}/royal-enfield.png`, 'wiki:Royal Enfield'],
  suzuki:           [`${CDN}/suzuki.png`],
  triumph:          [`${CDN}/triumph.png`, 'wiki:Triumph Motorcycles'],
  vespa:            [`${CDN}/vespa.png`, 'wiki:Vespa'],
  yamaha:           [`${CDN}/yamaha.png`],
  'zero-motorcycles':['wiki:Zero Motorcycles'],
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; brand-logo-downloader/1.0)' },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`)
  const buf = await res.arrayBuffer()
  return Buffer.from(buf)
}

async function processLogo(slug, candidates) {
  // Resolve 'wiki:...' entries to actual image URLs
  const urls = []
  for (const c of candidates) {
    if (typeof c === 'string' && c.startsWith('wiki:')) {
      try {
        const imgUrl = await wikiThumbnail(c.slice(5))
        if (imgUrl) urls.push(imgUrl)
      } catch { /* skip */ }
    } else {
      urls.push(c)
    }
  }

  for (const url of urls) {
    try {
      const raw = await fetchBuffer(url)
      await sharp(raw)
        .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 90 })
        .toFile(join(OUT_DIR, `${slug}.webp`))
      return 'ok'
    } catch { /* try next */ }
  }
  return 'failed'
}

const results = { ok: [], failed: [] }

for (const [slug, candidates] of Object.entries(BRANDS)) {
  process.stdout.write(`  ${slug.padEnd(22)} `)
  const status = await processLogo(slug, candidates)
  if (status === 'ok') {
    results.ok.push(slug)
    console.log('✓')
  } else {
    results.failed.push(slug)
    console.log('✗ FAILED')
  }
}

console.log(`\nDone: ${results.ok.length} ok, ${results.failed.length} failed`)
if (results.failed.length) console.log('Failed:', results.failed.join(', '))

// Generate SQL update statements
const sqlLines = results.ok.map(
  (slug) => `UPDATE brands SET logo_url = '/brand/${slug}.webp' WHERE slug = '${slug}';`
)
const sqlPath = join(__dirname, '..', 'docs', 'update-brand-logos.sql')
writeFileSync(sqlPath, sqlLines.join('\n') + '\n')
console.log(`\nSQL saved to docs/update-brand-logos.sql`)
