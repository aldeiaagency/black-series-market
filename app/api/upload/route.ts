import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const BUCKET = 'vehicle-images'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida. Inicia sesión de nuevo.' }, { status: 401 })

  const { data: dealer } = await supabase
    .from('dealers').select('id').eq('profile_id', user.id).single()
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

  const type = req.nextUrl.searchParams.get('type')
  const isLogo  = type === 'logo'
  const isCover = type === 'cover'
  const ext = file.name.split('.').pop() || 'jpg'
  const path = isLogo
    ? `logos/${dealer.id}/logo.${ext}`
    : isCover
      ? `covers/${dealer.id}/cover.${ext}`
      : `${dealer.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const admin = createAdminClient()
  const { error } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: isLogo || isCover,
  })

  if (error) return NextResponse.json({ error: error.message || 'Error al subir el archivo. Inténtalo de nuevo.' }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path)

  if (isLogo)  await admin.from('dealers').update({ logo_url:  publicUrl }).eq('id', dealer.id)
  if (isCover) await admin.from('dealers').update({ cover_url: publicUrl }).eq('id', dealer.id)

  return NextResponse.json({ url: publicUrl, path })
}
