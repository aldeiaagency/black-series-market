import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iylppoaitwnmbwjaubuy.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHBwb2FpdHdubWJ3amF1YnV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1MjM0NCwiZXhwIjoyMDk1MDI4MzQ0fQ.jId-UzpvEGXEvzrXbwPmO_HwmBqkOK36fAk8t_T7gEw'

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const R = '??' // U+FFFD

// Fetch remaining corrupted vehicles
const { data: vehicles, error } = await admin
  .from('vehicles')
  .select('id, slug, brand_name, model_name, version, description, color_exterior, color_interior, body_type')

if (error) { console.error(error.message); process.exit(1) }

const corrupted = vehicles.filter(v =>
  [v.brand_name, v.model_name, v.version, v.description, v.color_exterior, v.color_interior, v.body_type]
    .some(f => f?.includes(R))
)

if (corrupted.length === 0) {
  console.log('No quedan errores de encoding. Todo limpio.')
  process.exit(0)
}

console.log(`Vehículos con errores residuales: ${corrupted.length}\n`)

// Show remaining errors with context
for (const v of corrupted) {
  const fields = { brand_name: v.brand_name, model_name: v.model_name, version: v.version,
    body_type: v.body_type, color_exterior: v.color_exterior, color_interior: v.color_interior }
  for (const [k, val] of Object.entries(fields)) {
    if (val?.includes(R)) console.log(`  [${v.slug}] ${k}: "${val}"`)
  }
  if (v.description?.includes(R)) {
    // Extract snippets around each error
    const parts = v.description.split(R)
    for (let i = 0; i < parts.length - 1; i++) {
      const before = parts[i].slice(-12)
      const after  = parts[i + 1].slice(0, 12)
      console.log(`  [${v.slug}] desc snippet: "...${before}??${after}..."`)
    }
  }
}

// ── All known fixes for second pass ──────────────────────────────────────────
const ALL_REPLACEMENTS = [
  // body_type
  [new RegExp(`Coup${R}`, 'g'),                'Coupé'],
  [new RegExp(`coup${R}`, 'g'),                'coupé'],
  [new RegExp(`Caber${R}`, 'g'),               'Cabrió'],
  [new RegExp(`caber${R}`, 'g'),               'cabrió'],
  [new RegExp(`cabriol${R}`, 'g'),             'cabriolé'],

  // common accented words missed in pass 1
  [new RegExp(`est${R}`, 'g'),                 'está'],
  [new RegExp(`tambi${R}n`, 'g'),              'también'],
  [new RegExp(`adem${R}s`, 'g'),               'además'],
  [new RegExp(`m${R}s`, 'g'),                  'más'],
  [new RegExp(`f${R}cil`, 'g'),                'fácil'],
  [new RegExp(`r${R}pido`, 'g'),               'rápido'],
  [new RegExp(`r${R}pida`, 'g'),               'rápida'],
  [new RegExp(`comp${R}s`, 'g'),               'compás'],
  [new RegExp(`c${R}modo`, 'g'),               'cómodo'],
  [new RegExp(`c${R}moda`, 'g'),               'cómoda'],
  [new RegExp(`fr${R}`, 'g'),                  'fré'],
  [new RegExp(`aer${R}`, 'g'),                 'aero'],
  [new RegExp(`r${R}plica`, 'g'),              'réplica'],
  [new RegExp(`as${R}`, 'g'),                  'así'],
  [new RegExp(`cr${R}`, 'g'),                  'cré'],
  [new RegExp(`dise${R}o`, 'g'),               'diseño'],
  [new RegExp(`n${R}mero`, 'g'),               'número'],
  [new RegExp(`aut${R}ntico`, 'g'),            'auténtico'],
  [new RegExp(`aut${R}ntica`, 'g'),            'auténtica'],
  [new RegExp(`electr${R}nico`, 'g'),          'electrónico'],
  [new RegExp(`electr${R}nica`, 'g'),          'electrónica'],
  [new RegExp(`din${R}mico`, 'g'),             'dinámico'],
  [new RegExp(`din${R}mica`, 'g'),             'dinámica'],
  [new RegExp(`aeron${R}utica`, 'g'),          'aeronáutica'],
  [new RegExp(`peri${R}do`, 'g'),              'período'],
  [new RegExp(`r${R}cord`, 'g'),              'récord'],
  [new RegExp(`est${R}tica`, 'g'),             'estética'],
  [new RegExp(`est${R}tico`, 'g'),             'estético'],
  [new RegExp(`s${R}lida`, 'g'),               'sólida'],
  [new RegExp(`s${R}lido`, 'g'),               'sólido'],
  [new RegExp(`pr${R}ximo`, 'g'),              'próximo'],
  [new RegExp(`pr${R}xima`, 'g'),              'próxima'],
  [new RegExp(`aut${R}noma`, 'g'),             'autónoma'],
  [new RegExp(`aut${R}nomo`, 'g'),             'autónomo'],
  [new RegExp(`expl${R}sivo`, 'g'),            'explosivo'],
  [new RegExp(`expl${R}siva`, 'g'),            'explosiva'],
  [new RegExp(`exclusiv${R}`, 'g'),            'exclusivé'],
  [new RegExp(`t${R}rmino`, 'g'),              'término'],
  [new RegExp(`t${R}rminos`, 'g'),             'términos'],
  [new RegExp(`pl${R}stico`, 'g'),             'plástico'],
  [new RegExp(`pl${R}stica`, 'g'),             'plástica'],
  [new RegExp(`hidr${R}ulico`, 'g'),           'hidráulico'],
  [new RegExp(`hidr${R}ulica`, 'g'),           'hidráulica'],
  [new RegExp(`mec${R}nica`, 'g'),             'mecánica'],
  [new RegExp(`mec${R}nico`, 'g'),             'mecánico'],
  [new RegExp(`c${R}lculo`, 'g'),              'cálculo'],
  [new RegExp(`extr${R}`, 'g'),                'extraí'],
  [new RegExp(`car${R}cter`, 'g'),             'carácter'],
  [new RegExp(`cap${R}z`, 'g'),                'capáz'],
  [new RegExp(`aqu${R}`, 'g'),                 'aquí'],
  [new RegExp(`all${R}`, 'g'),                 'allí'],
  [new RegExp(`tambi${R}`, 'g'),               'también'],
  [new RegExp(`f${R}`, 'g'),                   'fé'],
]

function applyAll(text) {
  if (!text) return text
  let r = text
  for (const [pat, fix] of ALL_REPLACEMENTS) r = r.replace(pat, fix)
  return r
}

console.log('\n── Aplicando segunda pasada ─────────────────────────────────────\n')

let fixed = 0
for (const v of corrupted) {
  const updates = {}

  if (v.body_type?.includes(R))       updates.body_type       = applyAll(v.body_type)
  if (v.version?.includes(R))         updates.version         = applyAll(v.version)
  if (v.color_exterior?.includes(R))  updates.color_exterior  = applyAll(v.color_exterior)
  if (v.color_interior?.includes(R))  updates.color_interior  = applyAll(v.color_interior)
  if (v.description?.includes(R))     updates.description     = applyAll(v.description)
  if (v.brand_name?.includes(R))      updates.brand_name      = applyAll(v.brand_name)
  if (v.model_name?.includes(R))      updates.model_name      = applyAll(v.model_name)

  // Remove updates that still contain R (couldn't fix)
  for (const [k, val] of Object.entries(updates)) {
    if (typeof val === 'string' && val.includes(R)) {
      console.log(`  AÚN SIN FIX [${v.slug}] ${k}: "${val.replace(new RegExp(R, 'g'), '??')}"`)
      delete updates[k]
    }
  }

  if (Object.keys(updates).length === 0) continue

  const { error: updateErr } = await admin.from('vehicles').update(updates).eq('id', v.id)
  if (updateErr) {
    console.error(`  ERROR [${v.slug}]:`, updateErr.message)
  } else {
    fixed++
    const labels = Object.keys(updates).filter(k => k !== 'description').join(', ')
    console.log(`  ✓ [${v.slug}] ${labels || '(description)'}`)
  }
}

console.log(`\nSegunda pasada: ${fixed} vehículos actualizados.`)
console.log('Ejecuta de nuevo para verificar que no quedan errores.')
