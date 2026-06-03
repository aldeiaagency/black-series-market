import { createClient } from '@supabase/supabase-js'
const admin = createClient(
  'https://iylppoaitwnmbwjaubuy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHBwb2FpdHdubWJ3amF1YnV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1MjM0NCwiZXhwIjoyMDk1MDI4MzQ0fQ.jId-UzpvEGXEvzrXbwPmO_HwmBqkOK36fAk8t_T7gEw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)
const R = '�'
const { data } = await admin.from('vehicles').select('id, slug, body_type, description, color_exterior, color_interior')
const corrupted = data.filter(v =>
  [v.body_type, v.description, v.color_exterior, v.color_interior].some(f => f?.includes(R))
)
console.log(`Vehículos con errores residuales: ${corrupted.length}\n`)
for (const v of corrupted) {
  if (v.body_type?.includes(R)) console.log(`BODY [${v.slug}]: "${v.body_type}"`)
  if (v.color_exterior?.includes(R)) console.log(`COLOR_EXT [${v.slug}]: "${v.color_exterior}"`)
  if (v.color_interior?.includes(R)) console.log(`COLOR_INT [${v.slug}]: "${v.color_interior}"`)
  if (v.description?.includes(R)) {
    const parts = v.description.split(R)
    for (let i = 0; i < parts.length - 1; i++) {
      console.log(`DESC [${v.slug}]: "...${parts[i].slice(-18)}�${parts[i+1].slice(0,18)}..."`)
    }
  }
}
