#!/usr/bin/env node
// Renderer del calendario de contenidos (Etapa 1) — lee un manifiesto JSON semanal,
// genera un PNG por pieza con Playwright a tamaño real, y escribe
// manifest.output.json para enlazar con el ledger de Airtable y la convención de
// UTM ya construida (agency/diseno_calendario_contenidos_2026-08-30.md §11-A/§12-1).
//
// Uso: node scripts/content/instagram/render.mjs <manifiesto.json> [carpeta-salida]
// No se conecta a n8n ni se automatiza — es un script que H (o Claude) ejecuta a
// mano cada lunes en la Etapa 1.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { TEMPLATES } from './templates.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function fail(msg) {
  console.error(`✗ ${msg}`)
  process.exitCode = 1
}

async function main() {
  const manifestPath = process.argv[2]
  if (!manifestPath) {
    console.error('Uso: node render.mjs <manifiesto.json> [carpeta-salida]')
    process.exit(1)
  }
  const outDir = process.argv[3] || path.join(__dirname, '..', '..', '..', 'outputs', 'instagram')
  fs.mkdirSync(outDir, { recursive: true })

  let manifest
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch (err) {
    console.error(`✗ No se pudo leer o interpretar el manifiesto "${manifestPath}": ${err.message}`)
    process.exit(1)
  }
  const pieces = Array.isArray(manifest.pieces) ? manifest.pieces : []
  if (pieces.length === 0) {
    fail('El manifiesto no tiene ninguna pieza en "pieces".')
    return
  }

  const browser = await chromium.launch()
  const results = []

  try {
    for (const piece of pieces) {
      const { id, template, data, utm_content, cta, vehicle_id } = piece
      const spec = TEMPLATES[template]
      if (!spec) {
        fail(`Pieza "${id}": plantilla "${template}" no existe. Válidas: ${Object.keys(TEMPLATES).join(', ')}`)
        continue
      }
      // El id compone el nombre del PNG de salida (path.join(outDir, `${id}.png`)) —
      // sin esta validación, un id con "/" o ".." (typo o manifiesto corrupto) podría
      // escribir fuera de outDir en vez de simplemente fallar la pieza. Minúsculas
      // only: en Windows (filesystem case-insensitive) dos ids que solo difirieran
      // en mayúsculas se pisarían el PNG sin avisar, y el id también alimenta el
      // ledger de Airtable y la convención de UTM, que ya son slugs en minúscula.
      if (!id || !/^[a-z0-9][a-z0-9._-]*$/.test(id)) {
        fail(`Pieza "${id ?? '(sin id)'}": id ausente o con formato inválido — minúsculas, números, ".", "_" y "-", empezando por letra o número.`)
        continue
      }

      const [width, height] = spec.dims
      let html
      try {
        html = spec.render(data || {})
      } catch (err) {
        fail(`Pieza "${id}": la plantilla lanzó un error al generar el HTML — ${err.message}`)
        continue
      }

      // Sin deviceScaleFactor (= 1): el PNG exportado coincide exactamente con las
      // DIMENSIONS documentadas (1080×1350 / 1080×1920), "tamaño real sin escalado"
      // tal como dice el comentario de cabecera — con scaleFactor:2 el archivo salía
      // al doble de píxeles físicos sin que el QA de abajo (que solo mide CSS px) lo detectara.
      const page = await browser.newPage({ viewport: { width, height } })
      const qa = { fontsLoaded: false, overflow: false, imagesLoaded: true }
      try {
        await page.setContent(html, { waitUntil: 'load' })
        await page.evaluate(() => document.fonts.ready)
        qa.fontsLoaded = await page.evaluate(() => document.fonts.status === 'loaded')

        // QA: ninguna imagen debe quedar rota (naturalWidth 0) y el documento no debe
        // desbordar el lienzo — ambos indicarían una pieza mal formada, no publicable.
        qa.imagesLoaded = await page.evaluate(() =>
          Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0))
        qa.overflow = await page.evaluate(
          ([w, h]) => document.documentElement.scrollWidth > w || document.documentElement.scrollHeight > h,
          [width, height],
        )

        const outFile = path.join(outDir, `${id}.png`)
        await page.screenshot({ path: outFile })
        const dims = await page.evaluate(() => ({ w: document.documentElement.clientWidth, h: document.documentElement.clientHeight }))

        const ok = qa.fontsLoaded && qa.imagesLoaded && !qa.overflow && dims.w === width && dims.h === height
        results.push({
          id, template, utm_content: utm_content ?? null, cta: cta ?? null, vehicle_id: vehicle_id ?? null,
          file: path.relative(process.cwd(), outFile), width, height, ok, qa,
          generated_at: new Date().toISOString(),
        })
        console.log(`${ok ? '✓' : '⚠'} ${id} (${template}) → ${path.basename(outFile)}${ok ? '' : ' — revisar QA'}`)
      } catch (err) {
        fail(`Pieza "${id}": fallo al renderizar — ${err.message}`)
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
  }

  const manifestOutPath = path.join(outDir, 'manifest.output.json')
  fs.writeFileSync(manifestOutPath, JSON.stringify({ week: manifest.week ?? null, generated_at: new Date().toISOString(), pieces: results }, null, 2))
  console.log(`\nEscrito ${manifestOutPath} (${results.length} piezas, ${results.filter((r) => r.ok).length} sin avisos de QA)`)

  if (results.some((r) => !r.ok)) {
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
