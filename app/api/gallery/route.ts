import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'

const BUCKET = 'vehicle-images'

// Auditoría de seguridad 2026-09-02 (P0.2): las 3 rutas de abajo leían `dealers.profile_id`
// directo, columna que deja de ser accesible por `authenticated` (allowlist pública).
// getDealerAccess resuelve con service role — mejora colateral: ahora reconoce también a
// miembros del equipo con permiso de editar perfil (canEditProfile), no solo al dueño directo.
async function resolveGalleryDealerId(userId: string): Promise<string | null> {
  const access = await getDealerAccess(userId)
  if (!access || !getPermissions(access.role).canEditProfile) return null
  return access.dealerId
}

// ---------------------------------------------------------------------------
// GET — list gallery images for the authenticated dealer
// ---------------------------------------------------------------------------
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const dealerId = await resolveGalleryDealerId(user.id)
  if (!dealerId) return NextResponse.json({ error: 'Sin perfil de showroom' }, { status: 403 })

  const admin = createAdminClient()
  const { data: rows } = await admin
    .from('dealer_gallery_images')
    .select('id, storage_path, position')
    .eq('dealer_id', dealerId)
    .order('position', { ascending: true })

  const images = (rows ?? []).map((row: { id: string; storage_path: string; position: number }) => ({
    id: row.id,
    url: admin.storage.from(BUCKET).getPublicUrl(row.storage_path).data.publicUrl,
    storage_path: row.storage_path,
    position: row.position,
  }))

  return NextResponse.json({ images })
}

// ---------------------------------------------------------------------------
// DELETE — remove one image (DB record + Storage file)
// ?id=<uuid>
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Parámetro id requerido' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const dealerId = await resolveGalleryDealerId(user.id)
  if (!dealerId) return NextResponse.json({ error: 'Sin perfil de showroom' }, { status: 403 })

  const admin = createAdminClient()

  // Fetch the image to verify ownership before deleting
  const { data: image } = await admin
    .from('dealer_gallery_images')
    .select('id, storage_path, dealer_id')
    .eq('id', id)
    .single()

  if (!image) return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
  // Explicit ownership check — belt-and-suspenders on top of RLS
  if (image.dealer_id !== dealerId) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  // Remove from Storage (best-effort; don't fail if file already gone)
  await admin.storage.from(BUCKET).remove([image.storage_path])

  // Remove from DB
  const { error } = await admin
    .from('dealer_gallery_images')
    .delete()
    .eq('id', id)
    .eq('dealer_id', dealerId) // double-check in query

  if (error) return NextResponse.json({ error: 'Error al eliminar la imagen' }, { status: 500 })

  return NextResponse.json({ success: true })
}

// ---------------------------------------------------------------------------
// PATCH — reorder images
// Body: { order: [{ id: string; position: number }, ...] }
// ---------------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const dealerId = await resolveGalleryDealerId(user.id)
  if (!dealerId) return NextResponse.json({ error: 'Sin perfil de showroom' }, { status: 403 })

  let body: { order?: { id: string; position: number }[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 })
  }

  const { order } = body
  if (!Array.isArray(order) || order.length === 0) {
    return NextResponse.json({ error: 'Campo order requerido (array)' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Verify all submitted IDs belong to this dealer before writing
  const ids = order.map((o) => o.id)
  const { data: owned } = await admin
    .from('dealer_gallery_images')
    .select('id')
    .eq('dealer_id', dealerId)
    .in('id', ids)

  if (!owned || owned.length !== ids.length) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  // Update each position individually (gallery max=6, so N updates is negligible)
  await Promise.all(
    order.map(({ id, position }) =>
      admin.from('dealer_gallery_images').update({ position }).eq('id', id).eq('dealer_id', dealerId),
    ),
  )

  return NextResponse.json({ success: true })
}
