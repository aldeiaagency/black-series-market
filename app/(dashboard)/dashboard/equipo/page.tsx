import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationIdForUser, getEntitlements } from '@/lib/entitlements'
import { createAdminClient } from '@/lib/supabase/server'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  inventory_manager: 'Gestor de inventario',
  sales: 'Ventas',
  viewer: 'Solo lectura',
  group_admin: 'Admin Grupo',
  location_manager: 'Gestor de sede',
}

export default async function EquipoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const orgId = await getOrganizationIdForUser(user.id)

  if (!orgId) {
    return (
      <div className="p-8 max-w-2xl">
        <h1 className="font-display text-3xl font-light mb-4">Equipo</h1>
        <p className="text-sm text-bsm-text-muted mb-6">
          Esta funcionalidad requiere que tu cuenta esté vinculada a una organización.
        </p>
        <Link href="/profesionales/solicitar-acceso" className="btn-outline px-6">
          Completar configuración →
        </Link>
      </div>
    )
  }

  const ent = await getEntitlements(orgId)

  const canInvite = ent ? ent.usage.users < ent.limits.maxUsers : false
  const maxUsers = ent?.limits.maxUsers ?? 1

  const { data: members } = await admin
    .from('organization_members')
    .select('id, role, created_at, user_id, location_id')
    .eq('organization_id', orgId)
    .order('created_at')

  const memberProfiles = members ?? []

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Equipo</h1>
          <p className="text-sm text-bsm-text-muted">
            {memberProfiles.length} / {maxUsers === 9999 ? '∞' : maxUsers} usuarios
          </p>
        </div>
        {canInvite ? (
          <Link href="/dashboard/equipo/invitar" className="btn-gold px-5 text-sm">
            Invitar usuario
          </Link>
        ) : (
          <div className="text-right">
            <span className="text-xs text-amber-400 border border-amber-400/20 px-3 py-1.5 block mb-1">
              Límite alcanzado
            </span>
            <Link href="/profesionales/precios" className="text-xs text-gold hover:underline">
              Ampliar plan →
            </Link>
          </div>
        )}
      </div>

      {/* Gating message for Essential */}
      {maxUsers <= 1 && (
        <div className="border border-gold/20 bg-surface p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gold tracking-widest uppercase mb-1">Equipo disponible en Professional</p>
            <p className="text-sm text-bsm-text-secondary">
              Añade hasta 3 miembros con roles diferenciados. Elite permite hasta 10.
            </p>
          </div>
          <Link href="/profesionales/precios" className="btn-outline text-sm px-4 flex-shrink-0">
            Ver planes →
          </Link>
        </div>
      )}

      {/* Members list */}
      <div className="border border-bsm-border divide-y divide-bsm-border">
        {memberProfiles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-bsm-text-muted">Aún no hay miembros en el equipo.</p>
          </div>
        ) : (
          memberProfiles.map((m) => (
            <div key={m.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-bsm-text-primary font-medium truncate">{m.user_id}</p>
                <p className="text-xs text-bsm-text-muted">
                  {new Date(m.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              <span className="text-xs text-bsm-text-secondary border border-bsm-border px-2 py-1 flex-shrink-0">
                {ROLE_LABELS[m.role] ?? m.role}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
