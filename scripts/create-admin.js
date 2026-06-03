/**
 * create-admin.js
 * Creates an admin user in Supabase Auth and sets role = 'admin' in profiles.
 * Run: ADMIN_EMAIL=... ADMIN_PASSWORD=... node --env-file=.env.local scripts/create-admin.js
 */

const { createClient } = require('@supabase/supabase-js')

// Guard: all required env vars must be set before initialising any client
const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan variables: NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY')
  console.error('Ejecuta con: node --env-file=.env.local scripts/create-admin.js')
  process.exit(1)
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Faltan variables: ADMIN_EMAIL y ADMIN_PASSWORD son obligatorias.')
  console.error('Ejecuta con: ADMIN_EMAIL=... ADMIN_PASSWORD=... node --env-file=.env.local scripts/create-admin.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('Creando usuario admin:', ADMIN_EMAIL)

  // 1. Create user in auth (or get existing)
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === ADMIN_EMAIL)

  let userId

  if (found) {
    console.log('  Usuario ya existe — actualizando contraseña...')
    const { error } = await supabase.auth.admin.updateUserById(found.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (error) { console.error('  Error:', error.message); process.exit(1) }
    userId = found.id
    console.log('  Contraseña actualizada')
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (error) { console.error('  Error:', error.message); process.exit(1) }
    userId = data.user.id
    console.log('  Usuario creado, id:', userId)
  }

  // 2. Upsert profile with role = admin
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: ADMIN_EMAIL,
      full_name: 'Black Series Admin',
      role: 'admin',
    }, { onConflict: 'id' })

  if (profileError) {
    console.error('  Error en perfil:', profileError.message)
    process.exit(1)
  }

  console.log('  Rol admin asignado correctamente')
  console.log('Panel admin disponible en /admin')
}

main().catch(console.error)
