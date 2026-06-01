/**
 * Test script: verifica que el upload al bucket vehicle-images funciona.
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/test-cover-upload.example.mjs
 *
 * O con un archivo .env cargado previamente:
 *   node --env-file=.env.local scripts/test-cover-upload.example.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: faltan variables de entorno requeridas.')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? 'OK' : 'FALTA')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? 'OK' : 'FALTA')
  console.error('\nEjecuta con:')
  console.error('  node --env-file=.env.local scripts/test-cover-upload.example.mjs')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BUCKET = 'vehicle-images'
const testPath = 'covers/test-script/cover.webp'

const imageFile = readFileSync(resolve('public/brand/alfa-romeo.webp'))
console.log('Archivo de prueba cargado:', imageFile.length, 'bytes')

// 1. Verificar que el bucket existe
const { data: buckets, error: bucketsErr } = await admin.storage.listBuckets()
if (bucketsErr) {
  console.error('Error listando buckets:', bucketsErr.message)
  process.exit(1)
}

const bucket = buckets.find((b) => b.name === BUCKET)
if (!bucket) {
  console.error(`El bucket "${BUCKET}" no existe en este proyecto.`)
  process.exit(1)
}
console.log(`Bucket "${BUCKET}" encontrado — público: ${bucket.public}`)

// 2. Upload de prueba
const { data, error } = await admin.storage.from(BUCKET).upload(testPath, imageFile, {
  contentType: 'image/webp',
  upsert: true,
})

if (error) {
  console.error('Error en upload:', error.message)
  process.exit(1)
}

console.log('Upload correcto — path:', data.path)

// 3. Limpiar
await admin.storage.from(BUCKET).remove([testPath])
console.log('Archivo de prueba eliminado. Todo OK.')
