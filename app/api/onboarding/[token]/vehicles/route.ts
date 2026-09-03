import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { validateSetupToken } from '@/lib/onboarding/setup-room'
import { sanitizeVehiclePayload } from '@/lib/vehicle-write'
import { vehicleSlug } from '@/lib/utils'
import { randomUUID } from 'crypto'

// Alta vehículo a vehículo desde la sala de configuración (token, sin sesión). Reutiliza la
// MISMA allowlist/normalización de status que POST /api/vehicles (lib/vehicle-write.ts) para no
// duplicar reglas de seguridad — el dealer_id lo decide el servidor a partir del token, nunca el
// payload. Publica en 'active' salvo que el cliente pida explícitamente 'draft': el objetivo de
// este alta es que el gate automático de publicación del perfil (sync_profile_publication_from_vehicle,
// migración 078) se dispare solo en cuanto exista una unidad activa con foto, dejando el perfil
// "en revisión" listo para que el equipo lo publique — sin depender de que alguien procese fotos
// sueltas a mano.
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const admin = createAdminClient()
  const validation = await validateSetupToken(admin, params.token)
  if (!validation.ok) {
    return NextResponse.json({ error: 'El enlace de configuración no es válido o ya ha caducado.' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try { payload = await req.json() } catch { return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 }) }

  const brand = typeof payload.brand_name === 'string' ? payload.brand_name.trim() : ''
  const model = typeof payload.model_name === 'string' ? payload.model_name.trim() : ''
  const year = Number(payload.year)
  const images = Array.isArray(payload.images) ? payload.images : []

  if (!brand || !model) return NextResponse.json({ error: 'Faltan marca y modelo.' }, { status: 400 })
  if (!Number.isInteger(year) || year < 1960 || year > new Date().getFullYear() + 1) {
    return NextResponse.json({ error: 'Año no válido.' }, { status: 400 })
  }
  if (images.length === 0) {
    return NextResponse.json({ error: 'Añade al menos una foto del vehículo.' }, { status: 400 })
  }

  const clean = sanitizeVehiclePayload(payload)
  clean.dealer_id = validation.dealerId
  clean.slug = vehicleSlug(brand, model, year, randomUUID())

  const { data, error } = await admin.from('vehicles').insert(clean).select('id, slug').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, slug: data.slug })
}

// Quitar un vehículo añadido por error desde la propia sala, antes de enviar la configuración.
// Solo puede borrar vehículos del dealer dueño del token — el id no basta por sí solo.
export async function DELETE(req: NextRequest, { params }: { params: { token: string } }) {
  const admin = createAdminClient()
  const validation = await validateSetupToken(admin, params.token)
  if (!validation.ok) {
    return NextResponse.json({ error: 'El enlace de configuración no es válido o ya ha caducado.' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta el id del vehículo.' }, { status: 400 })

  const { error } = await admin.from('vehicles').delete().eq('id', id).eq('dealer_id', validation.dealerId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Lista los vehículos ya añadidos desde esta sala, para mostrarlos al recargar la página.
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const admin = createAdminClient()
  const validation = await validateSetupToken(admin, params.token)
  if (!validation.ok) {
    return NextResponse.json({ error: 'El enlace de configuración no es válido o ya ha caducado.' }, { status: 401 })
  }

  const { data, error } = await admin
    .from('vehicles')
    .select('id, brand_name, model_name, year, price, images, status')
    .eq('dealer_id', validation.dealerId)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
