import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iylppoaitwnmbwjaubuy.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHBwb2FpdHdubWJ3amF1YnV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1MjM0NCwiZXhwIjoyMDk1MDI4MzQ0fQ.jId-UzpvEGXEvzrXbwPmO_HwmBqkOK36fAk8t_T7gEw'

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const REPLACEMENT = '�'

// Mapa de correcciones: patrón corrupto → valor correcto
// Comunidades autónomas y campos frecuentes con acentos
const REGION_FIXES = {
  [`Andaluc${REPLACEMENT}a`]:          'Andalucía',
  [`Catalu${REPLACEMENT}a`]:           'Cataluña',
  [`Pa${REPLACEMENT}s Vasco`]:         'País Vasco',
  [`Arag${REPLACEMENT}n`]:             'Aragón',
  [`Castilla y Le${REPLACEMENT}n`]:    'Castilla y León',
  [`Castilla-La Mancha`]:              'Castilla-La Mancha', // sin acento, sin cambio
  [`Regi${REPLACEMENT}n de Murcia`]:   'Región de Murcia',
  [`Principado de Asturias`]:          'Principado de Asturias',
  [`Comunidad Foral de Navarra`]:      'Comunidad Foral de Navarra',
  [`Islas Baleares`]:                  'Islas Baleares',
  [`Islas Canarias`]:                  'Islas Canarias',
  [`Extremadura`]:                     'Extremadura',
  [`Galicia`]:                         'Galicia',
  [`Cantabria`]:                       'Cantabria',
  [`La Rioja`]:                        'La Rioja',
  [`Comunidad de Madrid`]:             'Comunidad de Madrid',
  [`Comunidad Valenciana`]:            'Comunidad Valenciana',
}

// Obtener todos los dealers con location_region o location_city corrupto
const { data: dealers, error } = await admin
  .from('dealers')
  .select('id, name, location_region, location_city')

if (error) { console.error('Error fetching dealers:', error.message); process.exit(1) }

console.log(`Total dealers: ${dealers.length}`)

let fixed = 0
let corrupted = 0

for (const dealer of dealers) {
  const updates = {}

  // Fix location_region
  if (dealer.location_region?.includes(REPLACEMENT)) {
    corrupted++
    const fix = REGION_FIXES[dealer.location_region]
    if (fix) {
      updates.location_region = fix
      console.log(`  REGION: "${dealer.location_region}" → "${fix}" (${dealer.name})`)
    } else {
      // Intento genérico: quitar el carácter corrupto y dejar el resto
      const cleaned = dealer.location_region.replace(new RegExp(REPLACEMENT, 'g'), '¿')
      console.log(`  REGION SIN FIX: "${dealer.location_region}" (${dealer.name}) — revisar manualmente`)
    }
  }

  // Fix location_city
  if (dealer.location_city?.includes(REPLACEMENT)) {
    corrupted++
    // Ciudades comunes
    const CITY_FIXES = {
      [`M${REPLACEMENT}laga`]:    'Málaga',
      [`C${REPLACEMENT}rdoba`]:   'Córdoba',
      [`Almer${REPLACEMENT}a`]:   'Almería',
      [`Ja${REPLACEMENT}n`]:      'Jaén',
      [`Girona`]:                 'Girona',
      [`Lleida`]:                 'Lleida',
      [`Tarragona`]:              'Tarragona',
    }
    const fix = CITY_FIXES[dealer.location_city]
    if (fix) {
      updates.location_city = fix
      console.log(`  CITY: "${dealer.location_city}" → "${fix}" (${dealer.name})`)
    } else {
      console.log(`  CITY SIN FIX: "${dealer.location_city}" (${dealer.name}) — revisar manualmente`)
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateErr } = await admin
      .from('dealers')
      .update(updates)
      .eq('id', dealer.id)

    if (updateErr) {
      console.error(`  ERROR actualizando ${dealer.name}:`, updateErr.message)
    } else {
      fixed++
      console.log(`  ✓ Corregido: ${dealer.name}`)
    }
  }
}

console.log(`\nResumen: ${corrupted} campos corruptos encontrados, ${fixed} dealers actualizados.`)
if (corrupted === 0) console.log('No se encontró corrupción de encoding en dealers.')
