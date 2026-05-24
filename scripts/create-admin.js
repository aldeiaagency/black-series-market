/**
 * create-admin.js
 * Creates an admin user in Supabase Auth and sets role = 'admin' in profiles.
 * Run: node scripts/create-admin.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'aldeiaceo@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'BlackSeries2025!'

async function main() {
  console.log('👤  Creating admin user:', ADMIN_EMAIL)

  // 1. Create user in auth (or get existing)
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === ADMIN_EMAIL)

  let userId

  if (found) {
    console.log('   User already exists, updating password...')
    const { data, error } = await supabase.auth.admin.updateUserById(found.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (error) { console.error('   ✗', error.message); process.exit(1) }
    userId = found.id
    console.log('   ✓ Password updated')
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (error) { console.error('   ✗', error.message); process.exit(1) }
    userId = data.user.id
    console.log('   ✓ User created, id:', userId)
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
    console.error('   ✗ Profile error:', profileError.message)
    process.exit(1)
  }

  console.log('   ✓ Profile role set to admin\n')
  console.log('═══════════════════════════════════════')
  console.log('  Admin panel: /admin')
  console.log('  Email:      ', ADMIN_EMAIL)
  console.log('  Password:   ', ADMIN_PASSWORD)
  console.log('═══════════════════════════════════════\n')
}

main().catch(console.error)
