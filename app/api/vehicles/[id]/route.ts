import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'
import { sanitizeVehiclePayload } from '@/lib/vehicle-write'
import { reviewVehicleIntake } from '@/lib/vehicle-intake/review'
import { buildAiColumns, resolveStatus } from '@/lib/vehicle-intake/intake'
import type { ReviewResult, VehicleIntakeRow } from '@/lib/vehicle-intake/types'

// Acceso al vehículo restringido al showroom del usuario (dueño o miembro).
async function resolve(userId: string, vehicleId: string) {
  const access = await getDealerAccess(userId)
  if (!access) return { error: NextResponse.json({ error: 'No tienes un showroom activo.' }, { status: 403 }) }
  if (!getPermissions(access.role).canEditInventory) {
    return { error: NextResponse.json({ error: 'No tienes permisos sobre el inventario.' }, { status: 403 }) }
  }
  const admin = createAdminClient()
  const { data: vehicle } = await admin
    .from('vehicles')
    .select('id, dealer_id')
    .eq('id', vehicleId)
    .maybeSingle()
  if (!vehicle || vehicle.dealer_id !== access.dealerId) {
    return { error: NextResponse.json({ error: 'Vehículo no encontrado.' }, { status: 404 }) }
  }
  return { admin, access }
}

// GET → cargar el vehículo para editar
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })

  const r = await resolve(user.id, id)
  if ('error' in r) return r.error

  // select('*') ya trae ai_suggested_description y ai_review_json (migración 110) igual que
  // cualquier otra columna — el formulario de edición (dashboard/publicar/page.tsx) vuelca el
  // registro completo en su estado y deriva de ahí el motivo de bloqueo y la sugerencia cuando
  // status es pending_review, mismo criterio que ya usa la sala de configuración para lo mismo.
  const { data, error } = await r.admin.from('vehicles').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// PATCH → editar el vehículo
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })

  const r = await resolve(user.id, id)
  if ('error' in r) return r.error

  let payload: Record<string, unknown>
  try { payload = await req.json() } catch { return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 }) }

  // Estado y datos actuales antes de este PATCH. Hacen falta para dos cosas: saber si el
  // vehículo venía de pending_review (única condición para volver a pasar el pipeline de IA) y,
  // si es así, completar con lo que el dealer no haya tocado en este envío los campos que
  // reviewVehicleIntake() necesita — este endpoint recibe la ficha completa del formulario, pero
  // el saneo (sanitizeVehiclePayload) solo copia lo que venga presente en el payload.
  const { data: currentVehicle, error: fetchError } = await r.admin
    .from('vehicles')
    .select('status, vehicle_type, brand_name, model_name, version, year, mileage_km, price, price_on_request, fuel_type, transmission, description, images, original_description')
    .eq('id', id)
    .eq('dealer_id', r.access.dealerId)
    .single()
  if (fetchError || !currentVehicle) return NextResponse.json({ error: 'Vehículo no encontrado.' }, { status: 404 })

  // Seguridad: mismo saneo que en el alta (el admin client se salta el trigger 060).
  // Impide auto-activarse, autoasignarse destacado/sellos o inflar vistas al editar.
  const clean = sanitizeVehiclePayload(payload)
  // El dealer_id no se puede reasignar desde el cliente.
  clean.dealer_id = r.access.dealerId

  // Re-revisar con IA SOLO si el vehículo ya estaba pending_review: es el único caso en que
  // resolver el aviso justifica el coste de una llamada real a OpenAI. Una edición rutinaria de
  // un vehículo active/draft/paused/sold no se re-revisa y se comporta exactamente igual que
  // antes de este cambio. Mismo criterio que la sala de configuración
  // (app/api/onboarding/[token]/vehicles/route.ts, PATCH).
  let review: ReviewResult | undefined
  if (currentVehicle.status === 'pending_review') {
    const merged: VehicleIntakeRow = {
      vehicle_type: (clean.vehicle_type as 'car' | 'motorcycle' | undefined) ?? currentVehicle.vehicle_type,
      brand_name: String(clean.brand_name ?? currentVehicle.brand_name ?? ''),
      model_name: String(clean.model_name ?? currentVehicle.model_name ?? ''),
      version: (clean.version as string | null | undefined) ?? currentVehicle.version,
      year: Number(clean.year ?? currentVehicle.year),
      mileage_km: Number(clean.mileage_km ?? currentVehicle.mileage_km),
      price: (clean.price as number | null | undefined) ?? currentVehicle.price,
      price_on_request: (clean.price_on_request as boolean | undefined) ?? currentVehicle.price_on_request,
      fuel_type: (clean.fuel_type as string | null | undefined) ?? currentVehicle.fuel_type,
      transmission: (clean.transmission as string | null | undefined) ?? currentVehicle.transmission,
      description: (clean.description as string | null | undefined) ?? currentVehicle.description,
      images: (clean.images as { url: string; order: number }[] | undefined) ?? currentVehicle.images,
    }
    const hasPhotos = Array.isArray(merged.images) && merged.images.length > 0
    review = await reviewVehicleIntake(merged)
    clean.status = resolveStatus('active', hasPhotos, review)
    // original_description se conserva si ya había uno (registro de qué escribió el dealer antes
    // de que la IA interviniera por primera vez); solo se rellena con la descripción actual si
    // esta columna seguía vacía. Mismo criterio que el PATCH de la sala de configuración.
    Object.assign(clean, buildAiColumns(review, currentVehicle.original_description ?? merged.description ?? null))
    clean.ai_applied_mode = 'dealer_accepted'
  }

  const { error } = await r.admin.from('vehicles').update(clean).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    status: clean.status,
    review: review
      ? { blockingIssue: review.issues.find((i) => i.blocking)?.message ?? null, suggestedDescription: review.suggested_description }
      : undefined,
  })
}
