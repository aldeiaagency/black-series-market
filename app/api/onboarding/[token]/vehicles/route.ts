import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { validateSetupToken } from '@/lib/onboarding/setup-room'
import { sanitizeVehiclePayload } from '@/lib/vehicle-write'
import { vehicleSlug } from '@/lib/utils'
import { randomUUID } from 'crypto'
import { reviewVehicleIntake } from '@/lib/vehicle-intake/review'
import { normalizeVin } from '@/lib/vehicle-intake/dedupe'
import { buildAiColumns, resolveStatus } from '@/lib/vehicle-intake/intake'

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

  // Mismo pipeline de revisión que el wizard (migración 110): el fundador está delante durante
  // la sala de configuración igual que un dealer en el wizard, así que tampoco aquí se
  // auto-aplica la sugerencia de texto — solo se guarda y un bloqueo real fuerza pending_review.
  const originalDescription = typeof clean.description === 'string' ? clean.description : null
  const review = await reviewVehicleIntake({
    vehicle_type: clean.vehicle_type as 'car' | 'motorcycle' | undefined,
    brand_name: brand,
    model_name: model,
    version: clean.version as string | null | undefined,
    year,
    mileage_km: Number(clean.mileage_km),
    price: clean.price as number | null | undefined,
    price_on_request: clean.price_on_request as boolean | undefined,
    fuel_type: clean.fuel_type as string | null | undefined,
    transmission: clean.transmission as string | null | undefined,
    description: originalDescription,
    images: images as { url: string; order: number }[],
  })

  clean.status = resolveStatus(clean.status === 'draft' ? 'draft' : 'active', images.length > 0, review)
  clean.vin_normalized = normalizeVin(clean.vin as string | null | undefined)
  clean.intake_source = 'vehicle_by_vehicle'
  clean.ai_applied_mode = 'none'
  Object.assign(clean, buildAiColumns(review, originalDescription))

  const { data, error } = await admin.from('vehicles').insert(clean).select('id, slug').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, slug: data.slug, status: clean.status, review })
}

// Corrige la descripción de un vehículo ya añadido (normalmente para aplicar la sugerencia de la
// IA cuando quedó en pending_review) y vuelve a evaluarlo — si la descripción resuelve el
// bloqueo, pasa a publicarse solo. Antes de esto no había ninguna forma de resolver un aviso de
// la sala salvo borrar el vehículo y volver a escribirlo entero desde cero (hallazgo 2026-09-04,
// simulación E2E showroom-vs-administrador con Codex).
export async function PATCH(req: NextRequest, { params }: { params: { token: string } }) {
  const admin = createAdminClient()
  const validation = await validateSetupToken(admin, params.token)
  if (!validation.ok) {
    return NextResponse.json({ error: 'El enlace de configuración no es válido o ya ha caducado.' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta el id del vehículo.' }, { status: 400 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 }) }
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  if (!description) return NextResponse.json({ error: 'Falta la descripción.' }, { status: 400 })

  const { data: vehicle, error: fetchError } = await admin
    .from('vehicles')
    .select('vehicle_type, brand_name, model_name, version, year, mileage_km, price, price_on_request, fuel_type, transmission, images, original_description')
    .eq('id', id)
    .eq('dealer_id', validation.dealerId)
    .single()
  if (fetchError || !vehicle) return NextResponse.json({ error: 'Vehículo no encontrado.' }, { status: 404 })

  const review = await reviewVehicleIntake({
    vehicle_type: vehicle.vehicle_type, brand_name: vehicle.brand_name, model_name: vehicle.model_name,
    version: vehicle.version, year: vehicle.year, mileage_km: vehicle.mileage_km,
    price: vehicle.price, price_on_request: vehicle.price_on_request,
    fuel_type: vehicle.fuel_type, transmission: vehicle.transmission,
    description, images: vehicle.images,
  })

  const hasPhotos = Array.isArray(vehicle.images) && vehicle.images.length > 0
  const status = resolveStatus('active', hasPhotos, review)

  const { error: updateError } = await admin.from('vehicles').update({
    description,
    status,
    ai_applied_mode: 'dealer_accepted',
    ...buildAiColumns(review, vehicle.original_description ?? description),
  }).eq('id', id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ ok: true, status, review })
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

  // ai_suggested_description/ai_review_json se incluyen para que, si el fundador recarga la sala,
  // no pierda el motivo de un pending_review ni la sugerencia (antes se perdía por completo — el
  // vehículo simplemente dejaba de explicarse a sí mismo, hallazgo 2026-09-04).
  const { data, error } = await admin
    .from('vehicles')
    .select('id, brand_name, model_name, year, price, images, status, ai_suggested_description, ai_review_json')
    .eq('dealer_id', validation.dealerId)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type ReviewIssue = { blocking?: boolean; message?: string }
  const mapped = (data ?? []).map((v) => {
    const issues = (v.ai_review_json as { issues?: ReviewIssue[] } | null)?.issues ?? []
    return {
      id: v.id, brand_name: v.brand_name, model_name: v.model_name, year: v.year, price: v.price,
      images: v.images, status: v.status,
      blockingIssue: issues.find((i) => i.blocking)?.message ?? null,
      suggestedDescription: v.ai_suggested_description,
    }
  })
  return NextResponse.json({ data: mapped })
}
