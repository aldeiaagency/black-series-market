import { createClient } from '@supabase/supabase-js'
const admin = createClient(
  'https://iylppoaitwnmbwjaubuy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHBwb2FpdHdubWJ3amF1YnV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1MjM0NCwiZXhwIjoyMDk1MDI4MzQ0fQ.jId-UzpvEGXEvzrXbwPmO_HwmBqkOK36fAk8t_T7gEw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)
const RR = '��' // double replacement character

const DOUBLE_FIXES = [
  [`suspensi${RR}n`,   'suspensión'],
  [`Suspensi${RR}n`,   'Suspensión'],
  [`m${RR}ximo`,       'máximo'],
  [`M${RR}ximo`,       'Máximo'],
  [`c${RR}mara`,       'cámara'],
  [`C${RR}mara`,       'Cámara'],
  [`atr${RR}s`,        'atrás'],
  [`Atr${RR}s`,        'Atrás'],
  [`m${RR}s`,          'más'],
  [`adm${RR}s`,        'admás'],
  [`m${RR}ximo`,       'máximo'],
  [`pr${RR}ximo`,      'próximo'],
  [`pr${RR}xima`,      'próxima'],
  [`electr${RR}nica`,  'electrónica'],
  [`Electr${RR}nica`,  'Electrónica'],
  [`t${RR}cnico`,      'técnico'],
  [`t${RR}cnica`,      'técnica'],
  [`din${RR}mico`,     'dinámico'],
  [`aerodin${RR}mico`, 'aerodinámico'],
  [`aerodin${RR}mica`, 'aerodinámica'],
  [`aut${RR}nomo`,     'autónomo'],
  [`aut${RR}noma`,     'autónoma'],
  [`cl${RR}sico`,      'clásico'],
  [`cl${RR}sica`,      'clásica'],
  [`r${RR}pido`,       'rápido'],
  [`r${RR}pida`,       'rápida'],
]

function applyDouble(text) {
  if (!text || !text.includes(RR)) return text
  let r = text
  for (const [pattern, fix] of DOUBLE_FIXES) r = r.split(pattern).join(fix)
  return r
}

const { data: vehicles } = await admin
  .from('vehicles')
  .select('id, slug, description')
  .or(`description.ilike.%${RR}%`)

const targets = (vehicles || []).filter(v => v.description?.includes(RR))
console.log(`Vehículos con doble corrupción: ${targets.length}`)

for (const v of targets) {
  const fixed = applyDouble(v.description)
  if (fixed === v.description) { console.log(`  SIN CAMBIO [${v.slug}]`); continue }
  const { error } = await admin.from('vehicles').update({ description: fixed }).eq('id', v.id)
  if (error) console.error(`  ERROR [${v.slug}]:`, error.message)
  else console.log(`  ✓ [${v.slug}]`)
}
console.log('Listo.')
