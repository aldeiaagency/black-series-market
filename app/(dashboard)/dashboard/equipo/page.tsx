import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions, ASSIGNABLE_ROLES, type OrgRole, type AssignableRole } from '@/lib/permissions'

// owner primero, luego el resto por jerarquía real (ASSIGNABLE_ROLES), no por antigüedad.
// group_admin/location_manager (modelo Grupo, aún no asignable desde esta UI) se ordenan
// al final por si alguna vez aparecen — no tienen jerarquía definida en una sede única.
const ROLE_RANK: Record<OrgRole, number> = {
  owner: 0,
  group_admin: ASSIGNABLE_ROLES.length + 1,
  location_manager: ASSIGNABLE_ROLES.length + 2,
  ...(Object.fromEntries(ASSIGNABLE_ROLES.map((role, i) => [role, i + 1])) as Record<AssignableRole, number>),
}
import { getEntitlements } from '@/lib/entitlements'
import TeamManager, { type TeamMember } from '@/components/dashboard/TeamManager'

export default async function EquipoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getDealerAccess(user.id)
  if (!access || !access.orgId) redirect('/registro')

  // Solo quien puede gestionar equipo entra aquí; el resto, al panel.
  const perms = getPermissions(access.role)
  if (!perms.sections.includes('equipo')) redirect('/dashboard')

  const admin = createAdminClient()
  const ent = await getEntitlements(access.orgId)
  const maxUsers = ent?.limits.maxUsers ?? 1

  // ── Gating por plan: el equipo es de Professional en adelante ───────────────
  if (maxUsers <= 1) {
    return (
      <div className="p-8 max-w-3xl">
        <h1 className="font-display text-3xl font-light mb-1">Equipo</h1>
        <p className="text-sm text-bsm-text-muted mb-8">Gestiona los usuarios de tu showroom</p>
        <div className="border border-gold/20 bg-surface p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gold tracking-widest uppercase mb-1">Equipo disponible en Professional</p>
            <p className="text-sm text-bsm-text-secondary">
              Tu plan actual incluye 1 usuario. Professional permite 3 y Elite hasta 10, con roles diferenciados.
            </p>
          </div>
          <Link href="/dashboard/suscripcion" className="btn-outline text-sm px-4 flex-shrink-0">Ver planes →</Link>
        </div>
      </div>
    )
  }

  // ── Miembros + perfiles (nombre/email reales) ───────────────────────────────
  const { data: rawMembers } = await admin
    .from('organization_members')
    .select('id, user_id, role, created_at')
    .eq('organization_id', access.orgId)
    .order('created_at', { ascending: true })

  const userIds = (rawMembers ?? []).map((m) => m.user_id)
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'])

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))

  // Orden: propietario primero, resto por antigüedad
  const members: TeamMember[] = (rawMembers ?? [])
    .map((m) => {
      const p = profileById.get(m.user_id)
      return {
        id:        m.id,
        userId:    m.user_id,
        role:      m.role as OrgRole,
        name:      p?.full_name ?? '',
        email:     p?.email ?? '',
        createdAt: m.created_at,
      }
    })
    .sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role])

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Equipo</h1>
        <p className="text-sm text-bsm-text-muted">
          Da de alta a tu equipo y asigna un rol a cada persona. Las altas son inmediatas:
          generamos una contraseña temporal que entregas al usuario.
        </p>
      </div>

      <TeamManager members={members} maxUsers={maxUsers} canManage={perms.canManageTeam} />
    </div>
  )
}
