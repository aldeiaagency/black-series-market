import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iylppoaitwnmbwjaubuy.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHBwb2FpdHdubWJ3amF1YnV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1MjM0NCwiZXhwIjoyMDk1MDI4MzQ0fQ.jId-UzpvEGXEvzrXbwPmO_HwmBqkOK36fAk8t_T7gEw'

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const R = '�' // U+FFFD — carácter de reemplazo

// ── Correcciones exactas para model_name ─────────────────────────────────────
const MODEL_FIXES = {
  [`Hurac${R}n`]:          'Huracán',
  [`Murci${R}lago`]:       'Murciélago',
  [`Ghibl${R}`]:           'Ghiblí',
  [`Di${R}blo`]:           'Diáblo',
  [`Evang${R}lico`]:       'Evangélico',
  [`M${R}rcedes`]:         'Mércedes',
  [`Taur${R}s`]:           'Taurus',
  [`Cali${R}rnia`]:        'California',
}

// ── Correcciones para version (REPLACE parcial) ───────────────────────────────
const VERSION_REPLACEMENTS = [
  [new RegExp(`Edici${R}n`, 'g'),        'Edición'],
  [new RegExp(`El${R}ctrico`, 'g'),       'Eléctrico'],
  [new RegExp(`el${R}ctrico`, 'g'),       'eléctrico'],
  [new RegExp(`H${R}brido`, 'g'),         'Híbrido'],
  [new RegExp(`h${R}brido`, 'g'),         'híbrido'],
  [new RegExp(`Autom${R}tico`, 'g'),      'Automático'],
  [new RegExp(`autom${R}tico`, 'g'),      'automático'],
  [new RegExp(`Cami${R}n`, 'g'),          'Camión'],
  [new RegExp(`Aut${R}nomo`, 'g'),        'Autónomo'],
  [new RegExp(`Versi${R}n`, 'g'),         'Versión'],
  [new RegExp(`versi${R}n`, 'g'),         'versión'],
]

// ── Correcciones para description (REPLACE parcial) ──────────────────────────
const DESCRIPTION_REPLACEMENTS = [
  [new RegExp(`h${R}brido`, 'g'),            'híbrido'],
  [new RegExp(`H${R}brido`, 'g'),            'Híbrido'],
  [new RegExp(`el${R}ctrico`, 'g'),          'eléctrico'],
  [new RegExp(`El${R}ctrico`, 'g'),          'Eléctrico'],
  [new RegExp(`autom${R}tico`, 'g'),         'automático'],
  [new RegExp(`Autom${R}tico`, 'g'),         'Automático'],
  [new RegExp(`configuraci${R}n`, 'g'),      'configuración'],
  [new RegExp(`informaci${R}n`, 'g'),        'información'],
  [new RegExp(`versi${R}n`, 'g'),            'versión'],
  [new RegExp(`Versi${R}n`, 'g'),            'Versión'],
  [new RegExp(`edici${R}n`, 'g'),            'edición'],
  [new RegExp(`Edici${R}n`, 'g'),            'Edición'],
  [new RegExp(`selecci${R}n`, 'g'),          'selección'],
  [new RegExp(`transmisi${R}n`, 'g'),        'transmisión'],
  [new RegExp(`suspensi${R}n`, 'g'),         'suspensión'],
  [new RegExp(`inyecci${R}n`, 'g'),          'inyección'],
  [new RegExp(`direcci${R}n`, 'g'),          'dirección'],
  [new RegExp(`condici${R}n`, 'g'),          'condición'],
  [new RegExp(`kil${R}metros`, 'g'),         'kilómetros'],
  [new RegExp(`tel${R}fono`, 'g'),           'teléfono'],
  [new RegExp(`veh${R}culo`, 'g'),           'vehículo'],
  [new RegExp(`Veh${R}culo`, 'g'),           'Vehículo'],
  [new RegExp(`Reci${R}n`, 'g'),             'Recién'],
  [new RegExp(`garant${R}a`, 'g'),           'garantía'],
  [new RegExp(`Garant${R}a`, 'g'),           'Garantía'],
  [new RegExp(`tambi${R}n`, 'g'),            'también'],
  [new RegExp(`Tambi${R}n`, 'g'),            'También'],
  [new RegExp(`est${R}tica`, 'g'),           'estética'],
  [new RegExp(`cami${R}n`, 'g'),             'camión'],
  [new RegExp(`potenci${R}metro`, 'g'),      'potenciómetro'],
  [new RegExp(`m${R}s`, 'g'),               'más'],
  [new RegExp(`adem${R}s`, 'g'),            'además'],
  [new RegExp(`pr${R}ctica`, 'g'),          'práctica'],
  [new RegExp(`pr${R}cticamente`, 'g'),     'prácticamente'],
  [new RegExp(`fant${R}stico`, 'g'),        'fantástico'],
  [new RegExp(`t${R}cnica`, 'g'),           'técnica'],
  [new RegExp(`t${R}cnico`, 'g'),           'técnico'],
  [new RegExp(`carrocer${R}a`, 'g'),        'carrocería'],
  [new RegExp(`frenos`, 'g'),               'frenos'],
  [new RegExp(`tapicer${R}a`, 'g'),         'tapicería'],
  [new RegExp(`Tapicер${R}a`, 'g'),         'Tapicería'],
  [new RegExp(`aut${R}ntico`, 'g'),         'auténtico'],
  [new RegExp(`adquisici${R}n`, 'g'),       'adquisición'],
  [new RegExp(`inspecci${R}n`, 'g'),        'inspección'],
  [new RegExp(`Inspecci${R}n`, 'g'),        'Inspección'],
  [new RegExp(`navegaci${R}n`, 'g'),        'navegación'],
  [new RegExp(`climatizaci${R}n`, 'g'),     'climatización'],
  [new RegExp(`actualizaci${R}n`, 'g'),     'actualización'],
  [new RegExp(`pantalla`, 'g'),             'pantalla'],
  [new RegExp(`pl${R}stico`, 'g'),          'plástico'],
  [new RegExp(`m${R}nimo`, 'g'),            'mínimo'],
  [new RegExp(`m${R}nima`, 'g'),            'mínima'],
  [new RegExp(`única`, 'g'),               'única'],
  [new RegExp(`${R}nico`, 'g'),             'único'],
  [new RegExp(`${R}nica`, 'g'),             'única'],
]

// ── Correcciones para color_exterior / color_interior ────────────────────────
const COLOR_REPLACEMENTS = [
  [new RegExp(`Gr${R}s`, 'g'),     'Gris'],
  [new RegExp(`gr${R}s`, 'g'),     'gris'],
  [new RegExp(`Azul`, 'g'),        'Azul'],
  [new RegExp(`Marr${R}n`, 'g'),   'Marrón'],
  [new RegExp(`marr${R}n`, 'g'),   'marrón'],
]

function applyReplacements(text, replacements) {
  if (!text) return text
  let result = text
  for (const [pattern, fix] of replacements) {
    result = result.replace(pattern, fix)
  }
  return result
}

// ── Fetch all vehicles ────────────────────────────────────────────────────────
const { data: vehicles, error } = await admin
  .from('vehicles')
  .select('id, brand_name, model_name, version, description, color_exterior, color_interior, body_type, slug')

if (error) { console.error('Error fetching vehicles:', error.message); process.exit(1) }

console.log(`Total vehículos en BD: ${vehicles.length}`)

// First pass: detect corrupted
const corrupted = vehicles.filter(v =>
  [v.brand_name, v.model_name, v.version, v.description, v.color_exterior, v.color_interior, v.body_type]
    .some(f => f?.includes(R))
)

console.log(`Vehículos con corrupción detectada: ${corrupted.length}\n`)

if (corrupted.length === 0) {
  console.log('No se encontró corrupción. Nada que corregir.')
  process.exit(0)
}

// Show detected
for (const v of corrupted) {
  const affected = []
  if (v.brand_name?.includes(R))      affected.push(`brand_name: "${v.brand_name}"`)
  if (v.model_name?.includes(R))      affected.push(`model_name: "${v.model_name}"`)
  if (v.version?.includes(R))         affected.push(`version: "${v.version}"`)
  if (v.color_exterior?.includes(R))  affected.push(`color_exterior: "${v.color_exterior}"`)
  if (v.color_interior?.includes(R))  affected.push(`color_interior: "${v.color_interior}"`)
  if (v.body_type?.includes(R))       affected.push(`body_type: "${v.body_type}"`)
  if (v.description?.includes(R))     affected.push(`description: (contiene ${(v.description.match(new RegExp(R, 'g')) || []).length} errores)`)
  console.log(`  [${v.slug}] ${affected.join(' | ')}`)
}

console.log('\n── Aplicando correcciones ──────────────────────────────────────\n')

let fixed = 0
let skipped = 0

for (const v of corrupted) {
  const updates = {}

  // model_name — exact match
  if (v.model_name?.includes(R)) {
    const fix = MODEL_FIXES[v.model_name]
    if (fix) {
      updates.model_name = fix
    } else {
      console.log(`  SKIP model_name sin fix exacto: "${v.model_name}" [${v.slug}]`)
      skipped++
    }
  }

  // version — partial replace
  if (v.version?.includes(R)) {
    updates.version = applyReplacements(v.version, VERSION_REPLACEMENTS)
    if (updates.version?.includes(R)) {
      console.log(`  SKIP version con R residual: "${updates.version}" [${v.slug}]`)
      skipped++
      delete updates.version
    }
  }

  // description — partial replace
  if (v.description?.includes(R)) {
    updates.description = applyReplacements(v.description, DESCRIPTION_REPLACEMENTS)
    const remaining = (updates.description.match(new RegExp(R, 'g')) || []).length
    if (remaining > 0) {
      console.log(`  AVISO description: quedan ${remaining} errores sin fix en [${v.slug}] — corregir manualmente`)
    }
  }

  // color_exterior / color_interior
  if (v.color_exterior?.includes(R)) {
    updates.color_exterior = applyReplacements(v.color_exterior, COLOR_REPLACEMENTS)
    if (updates.color_exterior?.includes(R)) {
      console.log(`  SKIP color_exterior sin fix: "${v.color_exterior}" [${v.slug}]`)
      skipped++
      delete updates.color_exterior
    }
  }
  if (v.color_interior?.includes(R)) {
    updates.color_interior = applyReplacements(v.color_interior, COLOR_REPLACEMENTS)
    if (updates.color_interior?.includes(R)) {
      console.log(`  SKIP color_interior sin fix: "${v.color_interior}" [${v.slug}]`)
      skipped++
      delete updates.color_interior
    }
  }

  if (Object.keys(updates).length === 0) continue

  const { error: updateErr } = await admin
    .from('vehicles')
    .update(updates)
    .eq('id', v.id)

  if (updateErr) {
    console.error(`  ERROR actualizando [${v.slug}]:`, updateErr.message)
  } else {
    fixed++
    const summary = Object.entries(updates)
      .filter(([k]) => k !== 'description')
      .map(([k, val]) => `${k}: "${val}"`)
      .join(', ')
    console.log(`  ✓ [${v.slug}] ${summary || '(description corregida)'}`)
  }
}

console.log(`\nResumen: ${corrupted.length} vehículos con corrupción → ${fixed} corregidos, ${skipped} campos sin fix conocido (revisar manualmente).`)
