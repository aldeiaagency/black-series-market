import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'
import { sanitizeVehiclePayload } from '@/lib/vehicle-write'

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

  // Seguridad: mismo saneo que en el alta (el admin client se salta el trigger 060).
  // Impide auto-activarse, autoasignarse destacado/sellos o inflar vistas al editar.
  const clean = sanitizeVehiclePayload(payload)
  // El dealer_id no se puede reasignar desde el cliente.
  clean.dealer_id = r.access.dealerId

  const { error } = await r.admin.from('vehicles').update(clean).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
