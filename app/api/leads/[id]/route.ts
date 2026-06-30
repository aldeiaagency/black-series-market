import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'
import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES = ['new', 'contacted', 'negotiating', 'appointment', 'reserved', 'closed', 'lost', 'discarded']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida. Inicia sesión de nuevo.' }, { status: 401 })

  // Owner o miembro con permiso de gestionar oportunidades.
  const access = await getDealerAccess(user.id)
  if (!access) return NextResponse.json({ error: 'No tienes un perfil de showroom activo.' }, { status: 403 })
  if (!getPermissions(access.role).canManageOpportunities) {
    return NextResponse.json({ error: 'No tienes permisos para gestionar oportunidades.' }, { status: 403 })
  }

  const { status } = await req.json()
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado no válido.' }, { status: 400 })
  }

  // Acceso controlado en código → admin client; el lead debe ser del showroom.
  const admin = createAdminClient()
  const { error } = await admin
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('dealer_id', access.dealerId)

  if (error) return NextResponse.json({ error: 'Error al actualizar el lead. Inténtalo de nuevo.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida. Inicia sesión de nuevo.' }, { status: 401 })

  const access = await getDealerAccess(user.id)
  if (!access) return NextResponse.json({ error: 'No tienes un perfil de showroom activo.' }, { status: 403 })
  if (!getPermissions(access.role).canManageOpportunities) {
    return NextResponse.json({ error: 'No tienes permisos para gestionar oportunidades.' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('dealer_id', access.dealerId)

  if (error) return NextResponse.json({ error: 'Error al eliminar el lead.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
