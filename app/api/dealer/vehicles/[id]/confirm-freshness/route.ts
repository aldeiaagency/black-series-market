import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/dealer/vehicles/[id]/confirm-freshness
 * Botón "Sigue disponible" de la sección Estado (P5 punto 1). Reinicia el plazo de
 * reconfirmación de 14 días y reactiva la unidad si estaba pausada por caducidad.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })

  const access = await getDealerAccess(user.id)
  if (!access) return NextResponse.json({ error: 'No tienes un perfil de showroom activo.' }, { status: 403 })
  if (!getPermissions(access.role).canEditInventory) {
    return NextResponse.json({ error: 'No tienes permisos para gestionar el inventario.' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('confirm_vehicle_freshness', {
    p_vehicle_id: id,
    p_dealer_id: access.dealerId,
  })

  if (error) return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'vehicle_not_found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
