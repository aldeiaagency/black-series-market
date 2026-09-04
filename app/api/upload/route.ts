import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const BUCKET = 'vehicle-images'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const GALLERY_MAX = 6

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida. Inicia sesión de nuevo.' }, { status: 401 })

  // Corrección 2026-09-04: la migración 107 (P0.2) revocó la lectura directa de
  // dealers.profile_id para 'authenticated' — este .eq('profile_id', ...) llevaba desde el
  // 2026-09-02 sin devolver nunca fila, bloqueando la subida de fotos a cualquier dealer que
  // pasara por esta ruta. Hallado en el simulacro E2E Karboceramic.
  const { data: dealerRows } = await supabase.rpc('get_own_dealer_summary')
  const dealer = dealerRows?.[0] ?? null
  if (!dealer) return NextResponse.json({ error: 'No tienes un perfil de showroom activo.' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No se ha recibido ningún archivo.' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Formato no permitido. Usa JPG, PNG o WebP.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'El archivo supera el límite de 10 MB.' }, { status: 400 })
  }

  // SEC-7: validar los magic bytes reales del archivo (no fiarse del file.type del cliente).
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
  const isPng  = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47
  const isWebp = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
                 head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50
  if (!isJpeg && !isPng && !isWebp) {
    return NextResponse.json({ error: 'El archivo no es una imagen válida (JPG, PNG o WebP).' }, { status: 400 })
  }

  const type    = req.nextUrl.searchParams.get('type')
  const isLogo  = type === 'logo'
  const isCover = type === 'cover'
  const isGallery = type === 'gallery'
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()

  const admin = createAdminClient()

  // Server-side gallery limit check (cannot be bypassed via client)
  if (isGallery) {
    const { count } = await admin
      .from('dealer_gallery_images')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id)
    if ((count ?? 0) >= GALLERY_MAX) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${GALLERY_MAX} fotografías.` },
        { status: 400 },
      )
    }
  }

  const path = isLogo
    ? `logos/${dealer.id}/logo.${ext}`
    : isCover
      ? `covers/${dealer.id}/cover.${ext}`
      : isGallery
        ? `gallery/${dealer.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        : `${dealer.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: isLogo || isCover,
  })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message || 'Error al subir el archivo. Inténtalo de nuevo.' }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path)

  if (isLogo)  await admin.from('dealers').update({ logo_url:  publicUrl }).eq('id', dealer.id)
  if (isCover) await admin.from('dealers').update({ cover_url: publicUrl }).eq('id', dealer.id)

  if (isGallery) {
    // Determine next position
    const { data: existing } = await admin
      .from('dealer_gallery_images')
      .select('position')
      .eq('dealer_id', dealer.id)
      .order('position', { ascending: false })
      .limit(1)
    const nextPos = existing?.[0]?.position != null ? (existing[0].position as number) + 1 : 0

    const { data: inserted, error: insertError } = await admin
      .from('dealer_gallery_images')
      .insert({ dealer_id: dealer.id, storage_path: path, position: nextPos })
      .select('id')
      .single()

    if (insertError) {
      // Roll back the storage upload to avoid orphaned files
      await admin.storage.from(BUCKET).remove([path])
      return NextResponse.json({ error: 'Error al registrar la imagen.' }, { status: 500 })
    }

    return NextResponse.json({ id: inserted.id, url: publicUrl, path })
  }

  return NextResponse.json({ url: publicUrl, path })
}
