// Uso: node --env-file=.env.local scripts/run-migrations.mjs
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY')
  console.error('Ejecuta con: node --env-file=.env.local scripts/run-migrations.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

async function main() {
  console.log('=== Checking existing DB state ===\n')

  // 1. Check if platform_config table exists
  const { data: configData, error: configErr } = await supabase
    .from('platform_config')
    .select('key')
    .limit(1)

  if (configErr) {
    console.log('platform_config table: MISSING ->', configErr.message)
  } else {
    console.log('platform_config table: EXISTS, rows:', configData?.length)
  }

  // 2. Check if vehicles.featured_until exists
  const { data: vData, error: vErr } = await supabase
    .from('vehicles')
    .select('featured_until')
    .limit(1)

  if (vErr) {
    console.log('vehicles.featured_until column: MISSING ->', vErr.message)
  } else {
    console.log('vehicles.featured_until column: EXISTS')
  }

  // 3. Try to insert platform_config data if table exists
  if (!configErr) {
    console.log('\n=== Inserting platform_config defaults ===')
    const defaults = [
      {
        key: 'planes',
        value: [
          { id: 'essential', name: 'Essential', price: 149, slots: 15, features: ['15 vehículos activos', 'Ficha de concesionario', 'Leads ilimitados', 'Estadísticas básicas'], highlighted: false },
          { id: 'professional', name: 'Professional', price: 349, slots: 40, features: ['40 vehículos activos', 'Perfil destacado en búsquedas', 'Estadísticas avanzadas', 'Boost de visibilidad mensual'], highlighted: true },
          { id: 'elite', name: 'Elite', price: 699, slots: 100, features: ['Hasta 100 vehículos activos', 'Badge Elite exclusivo', 'Posición prioritaria', 'Account manager dedicado'], highlighted: false },
        ],
      },
      {
        key: 'criterios',
        value: { car_min_price: 40000, moto_min_price: 15000, max_vehicle_age: 15, requires_professional_photo: true, requires_carfax: false },
      },
      {
        key: 'seo',
        value: { site_name: 'Black Series Market', tagline: 'El marketplace de vehículos premium', og_image: '', ga_id: '', gtm_id: '' },
      },
    ]

    for (const row of defaults) {
      const { error } = await supabase
        .from('platform_config')
        .upsert({ key: row.key, value: row.value, updated_at: new Date().toISOString() })
      console.log(`  INSERT ${row.key}:`, error ? `ERROR - ${error.message}` : 'OK')
    }
  }

  // 4. Try Management API with service role for DDL
  console.log('\n=== Attempting DDL via REST ===')
  const sqls = [
    `CREATE TABLE IF NOT EXISTS platform_config (key TEXT PRIMARY KEY, value JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW())`,
    `ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ`,
  ]

  for (const sql of sqls) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE,
      },
      body: JSON.stringify({ sql }),
    })
    const text = await res.text()
    console.log(`  [${res.status}] ${sql.slice(0, 60)}... -> ${text.slice(0, 100)}`)
  }
}

main().catch(console.error)
