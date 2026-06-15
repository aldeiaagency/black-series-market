// Aplica un archivo .sql al proyecto Supabase vía Management API.
// Uso: node --env-file=.env.local scripts/apply-sql.mjs supabase/migrations/035_seed_models_catalog.sql
import { readFileSync } from 'node:fs'

const PROJECT_REF = 'iylppoaitwnmbwjaubuy'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN

const file = process.argv[2]
if (!file) { console.error('Falta la ruta del .sql'); process.exit(1) }
if (!TOKEN) { console.error('Falta SUPABASE_ACCESS_TOKEN (ejecuta con --env-file=.env.local)'); process.exit(1) }

const query = readFileSync(file, 'utf8')

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
})

const text = await res.text()
console.log(`[${res.status}] ${res.statusText}`)
console.log(text.slice(0, 2000))
process.exit(res.ok ? 0 : 1)
