import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions, ASSIGNABLE_ROLES, type OrgRole } from '@/lib/permissions'

// Helper: valida sesión + permiso de gestión de equipo y devuelve el acceso y la
// fila de membresía objetivo (dentro de la MISMA organización del solicitante).
async function authorize(memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 }) }

  const access = await getDealerAccess(user.id)
  if (!access || !access.orgId || !getPermissions(access.role).canManageTeam) {
    return { error: NextResponse.json({ error: 'No tienes permisos para gestionar el equipo.' }, { status: 403 }) }
  }

  const admin = createAdminClient()
  const { data: member } = await admin
    .from('organization_members')
    .select('id, user_id, role, organization_id')
    .eq('id', memberId)
    .maybeSingle()

  if (!member || member.organization_id !== access.orgId) {
    return { error: NextResponse.json({ error: 'Miembro no encontrado.' }, { status: 404 }) }
  }
  if (member.role === 'owner') {
    return { error: NextResponse.json({ error: 'No se puede modificar al propietario.' }, { status: 403 }) }
  }

  return { admin, member }
}

// PATCH → cambiar el rol de un miembro
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await authorize(id)
  if ('error' in auth) return auth.error
  const { admin, member } = auth

  let body: { role?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 }) }

  const role = body.role as OrgRole
  if (!(ASSIGNABLE_ROLES as readonly OrgRole[]).includes(role)) {
    return NextResponse.json({ error: 'Rol no válido.' }, { status: 400 })
  }

  const { error } = await admin
    .from('organization_members')
    .update({ role })
    .eq('id', member.id)

  if (error) return NextResponse.json({ error: 'No se pudo actualizar el rol.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE → quitar a un miembro de ESTA organización. El usuario de auth se conserva:
// puede pertenecer a otras organizaciones (organization_members permite un mismo
// user_id en varias filas, una por organización) y, si se le vuelve a añadir aquí o
// en otro showroom, POST /api/team/members reutiliza esa misma cuenta en vez de
// fallar por email duplicado.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await authorize(id)
  if ('error' in auth) return auth.error
  const { admin, member } = auth

  const { error } = await admin.from('organization_members').delete().eq('id', member.id)
  if (error) return NextResponse.json({ error: 'No se pudo eliminar al miembro.' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
