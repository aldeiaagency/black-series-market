import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iylppoaitwnmbwjaubuy.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHBwb2FpdHdubWJ3amF1YnV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1MjM0NCwiZXhwIjoyMDk1MDI4MzQ0fQ.jId-UzpvEGXEvzrXbwPmO_HwmBqkOK36fAk8t_T7gEw'

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const R = '�' // U+FFFD — replacement character

// ── Ordered replacements — specific before generic ────────────────────────────
// IMPORTANT: order matters. Longer/more specific patterns first.
const FIXES = [
  // ── Undo bad replacement from pass 1 ────────────────────────────────────────
  [/Electrúnica/g,           'Electrónica'],
  [/electrúnica/g,           'electrónica'],
  [/Electrúnico/g,           'Electrónico'],
  [/electrúnico/g,           'electrónico'],

  // ── Öhlins (Swedish brand — Ö = U+00D6, was also corrupted to U+FFFD) ──────
  [`${R}hlins`, 'Öhlins'],

  // ── body_type ────────────────────────────────────────────────────────────────
  [`Coup${R}`,              'Coupé'],
  [`coup${R}`,              'coupé'],

  // ── Words where context makes the accent unambiguous ─────────────────────────

  // -ción / -ción words (always ó before n)
  [`producci${R}n`,         'producción'],
  [`Producci${R}n`,         'Producción'],
  [`calefacci${R}n`,        'calefacción'],
  [`Calefacci${R}n`,        'Calefacción'],
  [`generaci${R}n`,         'generación'],
  [`Generaci${R}n`,         'Generación'],
  [`colecci${R}n`,          'colección'],
  [`Colecci${R}n`,          'Colección'],
  [`personalizaci${R}n`,    'personalización'],
  [`Personalizaci${R}n`,    'Personalización'],
  [`homologaci${R}n`,       'homologación'],
  [`Homologaci${R}n`,       'Homologación'],
  [`competici${R}n`,        'competición'],
  [`Competici${R}n`,        'Competición'],
  [`revisi${R}n`,           'revisión'],
  [`Revisi${R}n`,           'Revisión'],
  [`revoluci${R}n`,         'revolución'],
  [`Revoluci${R}n`,         'Revolución'],
  [`emoci${R}n`,            'emoción'],
  [`Emoci${R}n`,            'Emoción'],
  [`decoraci${R}n`,         'decoración'],
  [`Decoraci${R}n`,         'Decoración'],
  [`conducci${R}n`,         'conducción'],
  [`Conducci${R}n`,         'Conducción'],
  // (already fixed in pass 1 but add as safety):
  [`configuraci${R}n`,      'configuración'],
  [`informaci${R}n`,        'información'],
  [`versi${R}n`,            'versión'],
  [`edici${R}n`,            'edición'],
  [`selecci${R}n`,          'selección'],
  [`transmisi${R}n`,        'transmisión'],
  [`suspensi${R}n`,         'suspensión'],
  [`inyecci${R}n`,          'inyección'],
  [`direcci${R}n`,          'dirección'],
  [`condici${R}n`,          'condición'],
  [`tracci${R}n`,           'tracción'],
  [`inspecci${R}n`,         'inspección'],
  [`Inspecci${R}n`,         'Inspección'],
  [`documentaci${R}n`,      'documentación'],
  [`Documentaci${R}n`,      'Documentación'],
  [`navegaci${R}n`,         'navegación'],
  [`climatizaci${R}n`,      'climatización'],
  [`actualizaci${R}n`,      'actualización'],
  [`adquisici${R}n`,        'adquisición'],

  // -ía words (always í)
  [`autonom${R}a`,          'autonomía'],
  [`Autonom${R}a`,          'Autonomía'],
  [`carrocer${R}a`,         'carrocería'],
  [`Carrocer${R}a`,         'Carrocería'],
  [`ingenier${R}a`,         'ingeniería'],
  [`Ingenier${R}a`,         'Ingeniería'],
  [`garant${R}a`,           'garantía'],
  [`Garant${R}a`,           'Garantía'],
  [`tapicer${R}a`,          'tapicería'],
  [`Tapicer${R}a`,          'Tapicería'],

  // -ción ambiguous (resolved by fixed word)
  [`l${R}nea`,              'línea'],
  [`L${R}nea`,              'Línea'],

  // -ico/-ica (adjectival forms, always ó)
  [`aerodin${R}mico`,       'aerodinámico'],
  [`aerodin${R}mica`,       'aerodinámica'],
  [`Aerodin${R}mico`,       'Aerodinámico'],
  [`Aerodin${R}mica`,       'Aerodinámica'],
  [`din${R}mico`,           'dinámico'],
  [`din${R}mica`,           'dinámica'],
  [`electrocr${R}mico`,     'electrocrómico'],
  [`electrocr${R}mica`,     'electrocrómica'],
  [`mecanogr${R}fico`,      'mecanográfico'],
  [`centr${R}fugo`,         'centrífugo'],
  [`Centr${R}fugo`,         'Centrífugo'],
  [`cl${R}sico`,            'clásico'],
  [`cl${R}sica`,            'clásica'],
  [`Cl${R}sico`,            'Clásico'],
  [`Cl${R}sica`,            'Clásica'],
  [`m${R}tico`,             'mítico'],
  [`m${R}tica`,             'mítica'],
  [`M${R}tico`,             'Mítico'],
  [`M${R}tica`,             'Mítica'],
  [`expl${R}sivo`,          'explosivo'],
  [`ic${R}nico`,            'icónico'],
  [`ic${R}nica`,            'icónica'],
  [`Ic${R}nico`,            'Icónico'],
  [`aut${R}ntico`,          'auténtico'],
  [`aut${R}ntica`,          'auténtica'],
  [`Aut${R}ntico`,          'Auténtico'],
  [`hidr${R}ulico`,         'hidráulico'],
  [`hidr${R}ulica`,         'hidráulica'],
  [`mec${R}nico`,           'mecánico'],
  [`mec${R}nica`,           'mecánica'],
  [`t${R}cnico`,            'técnico'],
  [`t${R}cnica`,            'técnica'],
  [`T${R}cnico`,            'Técnico'],
  [`T${R}cnica`,            'Técnica'],
  [`b${R}xer`,              'bóxer'],
  [`B${R}xer`,              'Bóxer'],
  [`el${R}ctrico`,          'eléctrico'],
  [`el${R}ctrica`,          'eléctrica'],
  [`El${R}ctrico`,          'Eléctrico'],
  [`El${R}ctrica`,          'Eléctrica'],

  // -és/-és (nationality/adj ending)
  [`japon${R}s`,            'japonés'],
  [`Japon${R}s`,            'Japonés'],
  [`franc${R}s`,            'francés'],
  [`Franc${R}s`,            'Francés'],
  [`ingl${R}s`,             'inglés'],
  [`Ingl${R}s`,             'Inglés'],

  // Specific nouns
  [`sue${R}o`,              'sueño'],
  [`Sue${R}o`,              'Sueño'],
  [`dise${R}o`,             'diseño'],
  [`Dise${R}o`,             'Diseño'],
  [`Espa${R}a`,             'España'],
  [`espa${R}ol`,            'español'],
  [`Espa${R}ol`,            'Español'],
  [`a${R}o`,                'año'],
  [`A${R}o`,                'Año'],
  [`v${R}lvula`,            'válvula'],
  [`V${R}lvula`,            'Válvula'],
  [`caf${R}`,               'café'],
  [`Caf${R}`,               'Café'],
  [`h${R}brido`,            'híbrido'],
  [`H${R}brido`,            'Híbrido'],
  [`p${R}blico`,            'público'],
  [`p${R}blica`,            'pública'],
  [`P${R}blico`,            'Público'],
  [`pin${R}culo`,           'pináculo'],
  [`Pin${R}culo`,           'Pináculo'],
  [`ep${R}tome`,            'epítome'],
  [`Ep${R}tome`,            'Epítome'],
  [`cont${R}mpor`,          'contémpor'],
  [`contempor${R}neo`,      'contemporáneo'],
  [`contempor${R}nea`,      'contemporánea'],
  [`Contempor${R}neo`,      'Contemporáneo'],
  [`bicil${R}ndrico`,       'bicilíndrico'],
  [`Bicil${R}ndrico`,       'Bicilíndrico'],
  [`aut${R}nomo`,           'autónomo'],
  [`aut${R}noma`,           'autónoma'],
  [`Aut${R}nomo`,           'Autónomo'],
  [`r${R}pido`,             'rápido'],
  [`r${R}pida`,             'rápida'],
  [`R${R}pido`,             'Rápido'],
  [`ultrarr${R}pida`,       'ultrarrápida'],
  [`ultrarr${R}pido`,       'ultrarrápido'],
  [`pr${R}ximo`,            'próximo'],
  [`pr${R}xima`,            'próxima'],
  [`Pr${R}ximo`,            'Próximo'],
  [`seg${R}n`,              'según'],
  [`Seg${R}n`,              'Según'],
  [`contin${R}a`,           'continúa'],
  [`Contin${R}a`,           'Continúa'],
  [`2${R} generaci`,        '2ª generaci'],
  [`n${R}mero`,             'número'],
  [`N${R}mero`,             'Número'],
  [`Andaluc${R}a`,          'Andalucía'],
  [`m${R}s`,                'más'],
  [`M${R}s`,                'Más'],
  [`adem${R}s`,             'además'],
  [`Adem${R}s`,             'Además'],
  [`kil${R}metros`,         'kilómetros'],
  [`tel${R}fono`,           'teléfono'],
  [`veh${R}culo`,           'vehículo'],
  [`Veh${R}culo`,           'Vehículo'],
  [`Reci${R}n`,             'Recién'],
  [`tambi${R}n`,            'también'],
  [`Tambi${R}n`,            'También'],
  [`est${R}tica`,           'estética'],
  [`est${R}tico`,           'estético'],
  [`exclusi${R}n`,          'exclusión'],
]

function applyFixes(text) {
  if (!text) return text
  let r = text
  for (const [pattern, fix] of FIXES) {
    if (typeof pattern === 'string') {
      r = r.split(pattern).join(fix)
    } else {
      r = r.replace(pattern, fix)
    }
  }
  return r
}

// ── Fetch all vehicles ────────────────────────────────────────────────────────
const { data: vehicles, error } = await admin
  .from('vehicles')
  .select('id, slug, brand_name, model_name, version, description, color_exterior, color_interior, body_type')

if (error) { console.error(error.message); process.exit(1) }

const needsFix = vehicles.filter(v =>
  [v.brand_name, v.model_name, v.version, v.description, v.color_exterior, v.color_interior, v.body_type]
    .some(f => f?.includes(R) || f?.includes('Electrúnica') || f?.includes('electrúnica'))
)

console.log(`Vehículos a corregir: ${needsFix.length}\n`)

if (needsFix.length === 0) {
  console.log('No quedan errores. Todo limpio.')
  process.exit(0)
}

let fixed = 0

for (const v of needsFix) {
  const updates = {}
  const fields = ['brand_name', 'model_name', 'version', 'body_type', 'color_exterior', 'color_interior', 'description']

  for (const field of fields) {
    if (!v[field]) continue
    const fixed_val = applyFixes(v[field])
    if (fixed_val !== v[field]) updates[field] = fixed_val
  }

  // Report any R still remaining after fixes
  for (const [k, val] of Object.entries(updates)) {
    if (typeof val === 'string' && val.includes(R)) {
      const parts = val.split(R)
      for (let i = 0; i < parts.length - 1; i++) {
        console.log(`  RESIDUAL [${v.slug}] ${k}: "...${parts[i].slice(-12)}??${parts[i+1].slice(0,12)}..."`)
      }
    }
  }

  if (Object.keys(updates).length === 0) continue

  const { error: updateErr } = await admin.from('vehicles').update(updates).eq('id', v.id)
  if (updateErr) {
    console.error(`  ERROR [${v.slug}]:`, updateErr.message)
  } else {
    fixed++
    const labels = Object.entries(updates)
      .filter(([k]) => k !== 'description')
      .map(([k, val]) => `${k}: "${val}"`)
      .join(' | ')
    console.log(`  ✓ [${v.slug}] ${labels || '(description corregida)'}`)
  }
}

console.log(`\nFinal: ${fixed} vehículos actualizados.`)
