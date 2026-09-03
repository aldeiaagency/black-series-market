import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { validateSetupToken } from '@/lib/onboarding/setup-room'

const BUCKET = 'vehicle-images'
// Auditoría de seguridad 2026-09-02, P0.6: documentos/CSV de onboarding nunca deben ser
// públicos e indefinidos (pueden incluir datos sensibles del negocio/fundador) — bucket privado
// separado, servidos con signed URL de expiración corta en vez de getPublicUrl().
const PRIVATE_BUCKET = 'onboarding-private'
const PRIVATE_TYPES: UploadKind[] = ['document', 'stock_bulk', 'stock_csv']
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 días — cubre el ciclo real de revisión de admin
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const CSV_TYPES = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024
const MAX_STOCK_IMAGE_SIZE = 15 * 1024 * 1024
const GALLERY_MAX = 6

// vehicle_photo: fotos de fichas reales publicadas desde la sala (alta vehículo a vehículo) —
// van al mismo bucket público que usa el resto del catálogo, nunca al bucket privado de material
// en bruto (stock_bulk), porque estas SÍ deben quedar visibles de forma estable en la ficha.
type UploadKind = 'logo' | 'cover' | 'gallery' | 'document' | 'stock_bulk' | 'stock_csv' | 'vehicle_photo'

function imageExtFromBytes(head: Uint8Array): 'jpg' | 'png' | 'webp' | null {
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'jpg'
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return 'png'
  if (
    head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
    head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50
  ) return 'webp'
  return null
}

function documentExtFromBytes(file: File, head: Uint8Array): 'pdf' | 'doc' | 'docx' | null {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46
  const isZip = head[0] === 0x50 && head[1] === 0x4b
  const isOle = head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0
  if (isPdf && ext === 'pdf') return 'pdf'
  if (isZip && ext === 'docx') return 'docx'
  if (isOle && ext === 'doc') return 'doc'
  return null
}

async function validateCsv(file: File): Promise<boolean> {
  const text = await file.slice(0, 4096).text().catch(() => '')
  const firstLine = text.split(/\r?\n/)[0]?.toLowerCase() ?? ''
  const required = ['brand', 'model', 'year']
  const spanishRequired = ['marca', 'modelo', 'año']
  return required.every((h) => firstLine.includes(h)) || spanishRequired.every((h) => firstLine.includes(h))
}

function safeName(name: string) {
  const ext = (name.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  return ext || 'bin'
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token
  const admin = createAdminClient()
  const validation = await validateSetupToken(admin, token)
  if (!validation.ok) {
    return NextResponse.json({ error: 'El enlace de configuración no es válido o ya ha caducado.' }, { status: 401 })
  }

  const type = (req.nextUrl.searchParams.get('type') || '') as UploadKind
  if (!['logo', 'cover', 'gallery', 'document', 'stock_bulk', 'stock_csv', 'vehicle_photo'].includes(type)) {
    return NextResponse.json({ error: 'Tipo de subida no permitido.' }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No se ha recibido ningún archivo.' }, { status: 400 })

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  let ext: string | null = null
  let maxSize = MAX_IMAGE_SIZE

  if (type === 'document') {
    if (!DOCUMENT_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido. Sube PDF, DOC o DOCX.' }, { status: 400 })
    }
    ext = documentExtFromBytes(file, head)
    maxSize = MAX_DOCUMENT_SIZE
    if (!ext) return NextResponse.json({ error: 'El documento no tiene una firma válida.' }, { status: 400 })
  } else if (type === 'stock_csv') {
    if (!CSV_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Formato no permitido. Sube un CSV.' }, { status: 400 })
    }
    maxSize = MAX_DOCUMENT_SIZE
    ext = safeName(file.name)
    if (ext !== 'csv') return NextResponse.json({ error: 'El archivo debe tener extensión .csv.' }, { status: 400 })
    if (!(await validateCsv(file))) {
      return NextResponse.json({ error: 'El CSV no parece seguir la plantilla: debe incluir marca, modelo y año.' }, { status: 400 })
    }
  } else {
    if (!IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido. Usa JPG, PNG o WebP.' }, { status: 400 })
    }
    ext = imageExtFromBytes(head)
    maxSize = type === 'stock_bulk' ? MAX_STOCK_IMAGE_SIZE : MAX_IMAGE_SIZE
    if (!ext) return NextResponse.json({ error: 'El archivo no es una imagen válida (JPG, PNG o WebP).' }, { status: 400 })
  }

  if (file.size > maxSize) {
    const mb = Math.round(maxSize / 1024 / 1024)
    return NextResponse.json({ error: `El archivo supera el límite de ${mb} MB.` }, { status: 400 })
  }

  if (type === 'gallery') {
    const { count } = await admin
      .from('dealer_gallery_images')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', validation.dealerId)
    if ((count ?? 0) >= GALLERY_MAX) {
      return NextResponse.json({ error: `El showroom ya tiene ${GALLERY_MAX} fotografías de instalaciones.` }, { status: 400 })
    }
  }

  const random = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const path = type === 'logo'
    ? `logos/${validation.dealerId}/logo.${ext}`
    : type === 'cover'
      ? `covers/${validation.dealerId}/cover.${ext}`
      : `onboarding/${validation.dealerId}/${type}/${random}.${ext}`

  const isPrivate = PRIVATE_TYPES.includes(type)
  const bucket = isPrivate ? PRIVATE_BUCKET : BUCKET

  const { error: uploadError } = await admin.storage.from(bucket).upload(path, file, {
    contentType: file.type || (ext === 'csv' ? 'text/csv' : 'application/octet-stream'),
    upsert: type === 'logo' || type === 'cover',
  })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message || 'Error al subir el archivo.' }, { status: 500 })
  }

  let publicUrl: string
  if (isPrivate) {
    const { data: signed, error: signError } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
    if (signError || !signed) {
      await admin.storage.from(bucket).remove([path])
      return NextResponse.json({ error: 'No se pudo generar el enlace del archivo.' }, { status: 500 })
    }
    publicUrl = signed.signedUrl
  } else {
    publicUrl = admin.storage.from(bucket).getPublicUrl(path).data.publicUrl
  }

  if (type === 'logo') await admin.from('dealers').update({ logo_url: publicUrl }).eq('id', validation.dealerId)
  if (type === 'cover') await admin.from('dealers').update({ cover_url: publicUrl }).eq('id', validation.dealerId)

  if (type === 'gallery') {
    const { data: existing } = await admin
      .from('dealer_gallery_images')
      .select('position')
      .eq('dealer_id', validation.dealerId)
      .order('position', { ascending: false })
      .limit(1)
    const nextPos = existing?.[0]?.position != null ? Number(existing[0].position) + 1 : 0
    const { data: inserted, error: insertError } = await admin
      .from('dealer_gallery_images')
      .insert({ dealer_id: validation.dealerId, storage_path: path, position: nextPos })
      .select('id')
      .single()
    if (insertError) {
      await admin.storage.from(BUCKET).remove([path])
      return NextResponse.json({ error: 'Error al registrar la fotografía.' }, { status: 500 })
    }
    return NextResponse.json({ id: inserted.id, url: publicUrl, path, type })
  }

  return NextResponse.json({ url: publicUrl, path, type, name: file.name, size: file.size, content_type: file.type })
}
