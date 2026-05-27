/**
 * Patch script: downloads logos for brands that failed in the main script.
 * Uses Clearbit Logo API (logo.clearbit.com) which returns company logos by domain.
 * Run: node scripts/download-brand-logos-patch.mjs
 */

import sharp from 'sharp'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'brand')
const CDN = 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized'
const CLEARBIT = 'https://logo.clearbit.com'

// slug → ordered list of candidate URLs
const FAILED_BRANDS = {
  ariel:            [`${CLEARBIT}/arielmotorcompany.com`, `${CLEARBIT}/arielcars.com`],
  caterham:         [`${CLEARBIT}/caterhamcars.com`, `${CLEARBIT}/caterham.com`],
  rimac:            [`${CLEARBIT}/rimac-automobili.com`, `${CLEARBIT}/rimac.com`],
  aprilia:          [`${CDN}/aprilia.png`, `${CLEARBIT}/aprilia.com`],
  bimota:           [`${CLEARBIT}/bimota.it`],
  cagiva:           [`${CLEARBIT}/cagiva.com`, `${CLEARBIT}/cagivagroup.com`],
  'can-am':         [`${CLEARBIT}/can-am.com`, `${CLEARBIT}/brp.com`],
  ducati:           [`${CDN}/ducati.png`, `${CLEARBIT}/ducati.com`],
  energica:         [`${CLEARBIT}/energicamotor.com`],
  'harley-davidson':[`${CDN}/harley-davidson.png`, `${CLEARBIT}/harley-davidson.com`],
  husqvarna:        [`${CDN}/husqvarna.png`, `${CLEARBIT}/husqvarna-motorcycles.com`],
  indian:           [`${CDN}/indian.png`, `${CLEARBIT}/indianmotorcycle.com`],
  kawasaki:         [`${CDN}/kawasaki.png`, `${CLEARBIT}/kawasaki.com`],
  livewire:         [`${CLEARBIT}/livewire.com`, `${CLEARBIT}/livewireev.com`],
  'moto-guzzi':     [`${CDN}/moto-guzzi.png`, `${CLEARBIT}/motoguzzi.com`],
  'mv-agusta':      [`${CDN}/mv-agusta.png`, `${CLEARBIT}/mvagusta.com`],
  piaggio:          [`${CDN}/piaggio.png`, `${CLEARBIT}/piaggio.com`],
  'royal-enfield':  [`${CDN}/royal-enfield.png`, `${CLEARBIT}/royalenfield.com`],
  vespa:            [`${CDN}/vespa.png`, `${CLEARBIT}/vespa.com`],
  yamaha:           [`${CDN}/yamaha.png`, `${CLEARBIT}/yamaha-motor.com`, `${CLEARBIT}/yamaha.com`],
  'zero-motorcycles':[`${CLEARBIT}/zeromotorcycles.com`],
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; brand-logo-downloader/1.0)',
      'Accept': 'image/*',
    },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  // Verify it's actually an image (not a 404 HTML page)
  const ct = res.headers.get('content-type') || ''
  if (!ct.startsWith('image/')) throw new Error(`Not an image: ${ct}`)
  return Buffer.from(await res.arrayBuffer())
}

async function processLogo(slug, urls) {
  for (const url of urls) {
    try {
      const raw = await fetchBuffer(url)
      await sharp(raw)
        .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 90 })
        .toFile(join(OUT_DIR, `${slug}.webp`))
      return { ok: true, url }
    } catch (e) {
      // try next
    }
  }
  return { ok: false }
}

const ok = []
const failed = []

for (const [slug, urls] of Object.entries(FAILED_BRANDS)) {
  process.stdout.write(`  ${slug.padEnd(22)} `)
  const result = await processLogo(slug, urls)
  if (result.ok) {
    ok.push(slug)
    console.log(`✓  (${result.url.replace('https://', '')})`)
  } else {
    failed.push(slug)
    console.log('✗ FAILED')
  }
}

console.log(`\nDone: ${ok.length} ok, ${failed.length} still failed`)
if (failed.length) console.log('Still failed:', failed.join(', '))

// Append to existing SQL file
const sqlPath = join(__dirname, '..', 'docs', 'update-brand-logos.sql')
const newLines = ok.map(
  (slug) => `UPDATE brands SET logo_url = '/brand/${slug}.webp' WHERE slug = '${slug}';`
)
const existing = existsSync(sqlPath) ? readFileSync(sqlPath, 'utf8') : ''
writeFileSync(sqlPath, existing + newLines.join('\n') + '\n')
console.log(`\nSQL appended to docs/update-brand-logos.sql`)
