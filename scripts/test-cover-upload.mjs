import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SUPABASE_URL = 'https://iylppoaitwnmbwjaubuy.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bHBwb2FpdHdubWJ3amF1YnV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1MjM0NCwiZXhwIjoyMDk1MDI4MzQ0fQ.jId-UzpvEGXEvzrXbwPmO_HwmBqkOK36fAk8t_T7gEw'

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const BUCKET = 'vehicle-images'
const testPath = 'covers/test-dealer-id/cover.webp'
const imageFile = readFileSync(resolve('public/brand/alfa-romeo.webp'))

console.log('Probando upload a:', BUCKET, '/', testPath)
console.log('Tamaño del archivo:', imageFile.length, 'bytes')

// 1. Verificar que el bucket existe
const { data: buckets, error: bucketsErr } = await admin.storage.listBuckets()
if (bucketsErr) {
  console.error('ERROR listando buckets:', bucketsErr.message)
  process.exit(1)
}
console.log('Buckets disponibles:', buckets.map(b => `${b.name} (public: ${b.public})`))

const bucket = buckets.find(b => b.name === BUCKET)
if (!bucket) {
  console.error('ERROR: El bucket "vehicle-images" NO existe')
  process.exit(1)
}
console.log('Bucket encontrado:', bucket.name, '| file_size_limit:', bucket.file_size_limit, '| allowed_mime_types:', bucket.allowed_mime_types)

// 2. Intentar el upload
const { data, error } = await admin.storage.from(BUCKET).upload(testPath, imageFile, {
  contentType: 'image/webp',
  upsert: true,
})

if (error) {
  console.error('ERROR en upload:', error.message)
  console.error('Status code:', error.status)
  console.error('Error completo:', JSON.stringify(error, null, 2))
} else {
  console.log('Upload OK:', data)
  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(testPath)
  console.log('URL pública:', publicUrl)

  // Limpiar archivo de prueba
  await admin.storage.from(BUCKET).remove([testPath])
  console.log('Archivo de prueba eliminado.')
}
