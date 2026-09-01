import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getEntitlements } from '@/lib/entitlements'
import { getPermissions, type DashboardSection } from '@/lib/permissions'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.user_metadata?.must_change_password === true) redirect('/cambiar-password-temporal')

  // Resolución central: dueño directo o miembro del equipo de la organización.
  const access = await getDealerAccess(user.id)
  if (!access) redirect('/registro')

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select('id, name, slug, status, subscription_plan, vehicle_slots, terms_accepted_at')
    .eq('id', access.dealerId)
    .single()

  if (!dealer) redirect('/registro')
  if (dealer.status === 'pending') redirect('/solicitud-enviada')
  if (!dealer.terms_accepted_at) redirect('/aceptar-condiciones')

  const perms = getPermissions(access.role)
  const ent = access.orgId ? await getEntitlements(access.orgId) : null

  // Los permisos de rol deciden qué puede hacer el miembro; los entitlements
  // deciden qué ha contratado el showroom. Las páginas mantienen sus propios
  // guards: este filtro sólo evita mostrar accesos que el plan no incluye.
  const gatedSections: Partial<Record<DashboardSection, boolean>> = {
    importar:
      ent?.features['csv_recurring']?.included === true &&
      ent.features['csv_recurring'].status === 'operative',
    solicitudes:
      ent?.features['vehicles_on_request']?.included === true &&
      ent.features['vehicles_on_request'].displayLabel === 'general_board' &&
      ent.features['vehicles_on_request'].status === 'operative',
    citas:
      ent?.features['appointment_booking']?.included === true &&
      ent.features['appointment_booking'].status === 'operative',
  }
  const visibleSections = perms.sections.filter(
    (section) => gatedSections[section] ?? true,
  )

  // Aviso en el icono de "A la carta", mismo criterio que ve el dealer al entrar en la
  // página (Elite ve todo; Professional solo lo que ya superó la ventana exclusiva de 24h).
  let solicitudesBadge = 0
  if (visibleSections.includes('solicitudes')) {
    const isElite = dealer.subscription_plan === 'elite'
    const cutoff = isElite ? null : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    let countQuery = admin
      .from('custom_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'in_review'])
    if (cutoff) countQuery = countQuery.lte('created_at', cutoff)
    const { count } = await countQuery
    solicitudesBadge = count ?? 0
  }

  return (
    <div className="flex min-h-screen bg-obsidian">
      <Sidebar
        dealerName={dealer.name}
        dealerSlug={dealer.slug}
        plan={dealer.subscription_plan}
        sections={visibleSections}
        role={access.role}
        solicitudesBadge={solicitudesBadge}
      />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
