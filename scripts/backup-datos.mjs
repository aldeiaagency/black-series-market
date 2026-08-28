#!/usr/bin/env node
/**
 * Backup de DATOS de Black Label Market.
 *
 * Por qué existe: Supabase en plan gratuito no ofrece backups restaurables por el usuario
 * (verificado 2026-08-28: `pitr_enabled: false`, `backups: []`). El ESQUEMA sí está a salvo
 * —está versionado en `supabase/migrations/`—, así que lo que no tenía ninguna copia eran
 * los DATOS. Este script cubre exactamente ese hueco.
 *
 * Qué guarda:
 *   - Todas las tablas del esquema `public`, con paginación (descubiertas dinámicamente:
 *     si mañana hay una tabla nueva, entra sola en el backup sin tocar este script).
 *   - Los usuarios de `auth.users` vía Admin API — sin esto, restaurar los datos dejaría
 *     a todo el mundo sin poder entrar.
 *
 * Qué NO guarda (y por qué no hace falta):
 *   - Esquema, funciones, triggers, políticas RLS → viven en `supabase/migrations/` (git).
 *   - Ficheros de Storage (fotos de vehículos) → ver nota al final de la ejecución.
 *
 * Uso:
 *   node scripts/backup-datos.mjs [--out <carpeta>]
 *
 * Requiere en el entorno (o en .env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Nunca imprime credenciales por pantalla.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { resolve, join } from 'node:path'

const PAGE_SIZE = 1000

function loadEnv() {
  // Prioridad: entorno real (GitHub Actions/cron) → .env.local (desarrollo).
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    const envPath = resolve(process.cwd(), '.env.local')
    if (existsSync(envPath)) {
      for (const line of readFileSync(envPath, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
        if (!m) continue
        const value = m[2].replace(/^["']|["']$/g, '')
        if (m[1] === 'NEXT_PUBLIC_SUPABASE_URL' && !url) url = value
        if (m[1] === 'SUPABASE_SERVICE_ROLE_KEY' && !key) key = value
      }
    }
  }

  if (!url || !key) {
    console.error('ERROR: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.')
    process.exit(1)
  }
  return { url: url.replace(/\/$/, ''), key }
}

async function api(url, key, path, extraHeaders = {}) {
  const res = await fetch(url + path, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...extraHeaders },
  })
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status} ${await res.text()}`)
  return res
}

/** Descubre las tablas de `public` leyendo el spec OpenAPI que expone PostgREST. */
async function discoverTables(url, key) {
  const spec = await (await api(url, key, '/rest/v1/')).json()
  return Object.keys(spec.definitions || spec.components?.schemas || {}).sort()
}

/** Descarga una tabla completa, paginando. Devuelve null si no es legible (p. ej. vistas). */
async function dumpTable(url, key, table) {
  const rows = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const res = await api(url, key, `/rest/v1/${table}?select=*&limit=${PAGE_SIZE}&offset=${offset}`)
    const page = await res.json()
    if (!Array.isArray(page)) return null
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
  }
  return rows
}

/** Cuentas de acceso. Sin esto, restaurar los datos deja a todos fuera. */
async function dumpAuthUsers(url, key) {
  const users = []
  for (let page = 1; ; page++) {
    const res = await api(url, key, `/auth/v1/admin/users?page=${page}&per_page=${PAGE_SIZE}`)
    const body = await res.json()
    const batch = body.users || []
    users.push(...batch)
    if (batch.length < PAGE_SIZE) break
  }
  return users
}

async function main() {
  const outFlag = process.argv.indexOf('--out')
  const outDir = outFlag !== -1 ? process.argv[outFlag + 1] : resolve(process.cwd(), '..', '_backups')
  const { url, key } = loadEnv()

  const startedAt = new Date()
  const stamp = startedAt.toISOString().slice(0, 19).replace(/[:T]/g, '-')
  console.log(`Backup de datos — ${startedAt.toISOString()}`)

  const tables = await discoverTables(url, key)
  console.log(`Tablas detectadas: ${tables.length}`)

  const data = {}
  const summary = []
  let totalRows = 0
  const skipped = []

  for (const table of tables) {
    try {
      const rows = await dumpTable(url, key, table)
      if (rows === null) { skipped.push(table); continue }
      data[table] = rows
      totalRows += rows.length
      summary.push({ tabla: table, filas: rows.length })
    } catch (err) {
      skipped.push(`${table} (${err.message.slice(0, 60)})`)
    }
  }

  let authUsers = []
  try {
    authUsers = await dumpAuthUsers(url, key)
    console.log(`Cuentas de usuario: ${authUsers.length}`)
  } catch (err) {
    console.error(`AVISO: no se pudieron exportar las cuentas: ${err.message}`)
  }

  const payload = {
    _meta: {
      generado: startedAt.toISOString(),
      proyecto: url,
      tablas: Object.keys(data).length,
      filas_totales: totalRows,
      cuentas: authUsers.length,
      omitidas: skipped,
      nota_esquema: 'El esquema no se incluye: vive versionado en supabase/migrations/.',
    },
    auth_users: authUsers,
    public: data,
  }

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const file = join(outDir, `blm-datos-${stamp}.json.gz`)
  writeFileSync(file, gzipSync(Buffer.from(JSON.stringify(payload), 'utf8')))

  const sizeKb = Math.round(writeFileSync.length >= 0 ? (await import('node:fs')).statSync(file).size / 1024 : 0)

  console.log('\nContenido:')
  summary.filter((s) => s.filas > 0).sort((a, b) => b.filas - a.filas)
    .forEach((s) => console.log(`   ${String(s.filas).padStart(6)}  ${s.tabla}`))
  const vacias = summary.filter((s) => s.filas === 0).length
  if (vacias) console.log(`   (${vacias} tablas vacías)`)
  if (skipped.length) console.log(`\nOmitidas (vistas o sin acceso): ${skipped.length}`)

  console.log(`\nOK  ${file}`)
  console.log(`    ${totalRows} filas + ${authUsers.length} cuentas · ${sizeKb} KB comprimido`)
  console.log('\nRecuerda: las fotos de vehículos viven en Supabase Storage y NO entran aquí.')
}

main().catch((err) => {
  console.error(`\nFALLO: ${err.message}`)
  process.exit(1)
})
