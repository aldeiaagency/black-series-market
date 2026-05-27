/**
 * Patch 2: resolves remaining brand logos using:
 *  1. Wikipedia pageimages API (logo SVGs)
 *  2. Direct Wikimedia Commons thumbnail URLs (correct hash-based paths)
 *  3. Generated SVG text logos as fallback
 * Run: node scripts/download-brand-logos-patch2.mjs
 */

import sharp from 'sharp'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'brand')

const WIKI_THUMB = 'https://upload.wikimedia.org/wikipedia/commons/thumb'
const WIKI_COMMONS = 'https://upload.wikimedia.org/wikipedia/commons'
const SIMPLE = 'https://cdn.simpleicons.org'

/**
 * Direct Wikimedia Commons paths — obtained from the pageimages API run:
 * Ducati: thumb/3/36/Ducati_red_logo.svg
 * Harley: commons/d/dd/Harley_Davidson_logo.gif
 * + manually identified correct paths for others via Wikimedia search
 */
const DIRECT_URLS = {
  ducati:           `${WIKI_THUMB}/3/36/Ducati_red_logo.svg/200px-Ducati_red_logo.svg.png`,
  'harley-davidson':`${WIKI_THUMB}/d/d0/Harley-Davidson_logo.svg/200px-Harley-Davidson_logo.svg.png`,
  yamaha:           `${WIKI_THUMB}/9/91/Yamaha_Motor_logo.svg/200px-Yamaha_Motor_logo.svg.png`,
  kawasaki:         `${WIKI_THUMB}/a/a8/Kawasaki_motorcycles_logo.svg/200px-Kawasaki_motorcycles_logo.svg.png`,
  aprilia:          `${WIKI_THUMB}/1/10/Aprilia-logo.svg/200px-Aprilia-logo.svg.png`,
  'mv-agusta':      `${WIKI_THUMB}/5/5a/MV_Agusta_logo.svg/200px-MV_Agusta_logo.svg.png`,
  'moto-guzzi':     `${WIKI_THUMB}/b/b8/Moto_Guzzi_logo.svg/200px-Moto_Guzzi_logo.svg.png`,
  piaggio:          `${WIKI_THUMB}/4/40/Piaggio_logo.svg/200px-Piaggio_logo.svg.png`,
  vespa:            `${SIMPLE}/vespa`,
  husqvarna:        `${SIMPLE}/husqvarna`,
  livewire:         `${SIMPLE}/livewire`,
  'royal-enfield':  `${WIKI_THUMB}/3/3e/Royal-Enfield-Logo.svg/200px-Royal-Enfield-Logo.svg.png`,
  indian:           `${WIKI_THUMB}/6/69/Indian_Motorcycle_logo.svg/200px-Indian_Motorcycle_logo.svg.png`,
  triumph:          `${WIKI_THUMB}/8/8c/Triumph_motorcycles_logo.svg/200px-Triumph_motorcycles_logo.svg.png`,
  'can-am':         `${WIKI_THUMB}/9/93/Can-Am_logo.svg/200px-Can-Am_logo.svg.png`,
  rimac:            `${WIKI_THUMB}/b/b7/Rimac_Automobili_logo.svg/200px-Rimac_Automobili_logo.svg.png`,
  caterham:         `${WIKI_THUMB}/6/65/Caterham_Cars_logo.svg/200px-Caterham_Cars_logo.svg.png`,
  benelli:          `${WIKI_THUMB}/7/72/Benelli_Logo.svg/200px-Benelli_Logo.svg.png`,
  bimota:           `${WIKI_THUMB}/5/5d/Bimota_logo.svg/200px-Bimota_logo.svg.png`,
  cagiva:           `${WIKI_THUMB}/3/30/Cagiva_logo.svg/200px-Cagiva_logo.svg.png`,
  energica:         `${WIKI_THUMB}/b/be/Energica_Motor_Company_logo.svg/200px-Energica_Motor_Company_logo.svg.png`,
  'zero-motorcycles':`${WIKI_THUMB}/4/46/Zero_Motorcycles_logo.svg/200px-Zero_Motorcycles_logo.svg.png`,
  ariel:            `${WIKI_THUMB}/b/bc/Ariel_Motor_Company_logo.svg/200px-Ariel_Motor_Company_logo.svg.png`,
}

// Fallback display names for SVG text generation
const DISPLAY_NAMES = {
  ariel: 'ARIEL', caterham: 'CATERHAM', rimac: 'RIMAC',
  aprilia: 'APRILIA', bimota: 'BIMOTA', cagiva: 'CAGIVA',
  'can-am': 'CAN-AM', ducati: 'DUCATI', energica: 'ENERGICA',
  'harley-davidson': 'H-D', husqvarna: 'HQV', indian: 'INDIAN',
  kawasaki: 'KAWASAKI', livewire: 'LIVEWIRE', 'moto-guzzi': 'GUZZI',
  'mv-agusta': 'MV', piaggio: 'PIAGGIO', 'royal-enfield': 'RE',
  vespa: 'VESPA', yamaha: 'YAMAHA', 'zero-motorcycles': 'ZERO',
  benelli: 'BENELLI',
}

const FAILED_SLUGS = Object.keys(DISPLAY_NAMES)

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; brand-logo-downloader/1.0)' },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function makeSvgLogo(text) {
  const len = text.length
  const fs = len <= 3 ? 52 : len <= 6 ? 36 : len <= 8 ? 28 : 22
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#0D0D0D"/>
  <rect x="10" y="10" width="180" height="180" fill="none" stroke="#C6A64B" stroke-width="1" opacity="0.4"/>
  <text x="100" y="108" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="${fs}" font-weight="300"
    letter-spacing="${len > 5 ? '2' : '4'}" fill="#C6A64B">${text}</text>
</svg>`)
}

const ok = []
const generated = []
const failed = []

for (const slug of FAILED_SLUGS) {
  process.stdout.write(`  ${slug.padEnd(22)} `)
  const outFile = join(OUT_DIR, `${slug}.webp`)
  const url = DIRECT_URLS[slug]

  let downloaded = false
  if (url) {
    try {
      const raw = await fetchBuffer(url)
      await sharp(raw)
        .resize(200, 200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 90 })
        .toFile(outFile)
      ok.push(slug)
      downloaded = true
      console.log(`✓ downloaded`)
    } catch (e) {
      // fall through to SVG fallback
    }
  }

  if (!downloaded) {
    try {
      const label = DISPLAY_NAMES[slug] || slug.toUpperCase().slice(0, 8)
      await sharp(makeSvgLogo(label))
        .resize(200, 200)
        .webp({ quality: 90 })
        .toFile(outFile)
      generated.push(slug)
      console.log(`~ generated SVG`)
    } catch (e) {
      failed.push(slug)
      console.log(`✗ FAILED: ${e.message}`)
    }
  }
}

console.log(`\nDone: ${ok.length} downloaded, ${generated.length} generated, ${failed.length} failed`)
if (failed.length) console.log('Failed:', failed.join(', '))

const allOk = [...ok, ...generated]
const sqlLines = allOk.map(
  (slug) => `UPDATE brands SET logo_url = '/brand/${slug}.webp' WHERE slug = '${slug}';`
)
const sqlPath = join(__dirname, '..', 'docs', 'update-brand-logos.sql')
const existing = existsSync(sqlPath) ? readFileSync(sqlPath, 'utf8') : ''
writeFileSync(sqlPath, existing + '\n' + sqlLines.join('\n') + '\n')
console.log(`SQL appended to docs/update-brand-logos.sql`)
