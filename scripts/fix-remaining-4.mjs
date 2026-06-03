import { createClient } from '@supabase/supabase-js'
const admin = createClient(
  'https://iylppoaitwnmbwjaubuy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHBwb2FpdHdubWJ3amF1YnV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1MjM0NCwiZXhwIjoyMDk1MDI4MzQ0fQ.jId-UzpvEGXEvzrXbwPmO_HwmBqkOK36fAk8t_T7gEw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)
const R = '�'

const EXTRA = [
  [`Suspensi${R}n`,  'Suspensión'],
  [`suspensi${R}n`,  'suspensión'],
  [`Est${R}tica`,    'Estética'],
  [`est${R}tica`,    'estética'],
  [`Est${R}tico`,    'Estético'],
  [`m${R}ximo`,      'máximo'],
  [`M${R}ximo`,      'Máximo'],
  [`c${R}mara`,      'cámara'],
  [`C${R}mara`,      'Cámara'],
  [`atr${R}s`,       'atrás'],
  [`Atr${R}s`,       'Atrás'],
  [`m${R}ximo`,      'máximo'],
]

function fix(text) {
  if (!text) return text
  let r = text
  for (const [p, f] of EXTRA) r = r.split(p).join(f)
  return r
}

const slugs = [
  'indian-challenger-dark-horse-2024',
  'bmw-rninet-urban-gs-2023',
  'bmw-k1600-gtl-2022',
  'yamaha-tmax-560-tech-max-2024',
]

const { data } = await admin.from('vehicles').select('id, slug, description').in('slug', slugs)

for (const v of data) {
  const fixed = fix(v.description)
  if (fixed === v.description) { console.log(`  SIN CAMBIO: ${v.slug}`); continue }
  const { error } = await admin.from('vehicles').update({ description: fixed }).eq('id', v.id)
  if (error) console.error(`ERROR ${v.slug}:`, error.message)
  else console.log(`  ✓ ${v.slug}`)
}
