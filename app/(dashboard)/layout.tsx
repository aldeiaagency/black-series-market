import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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

  return (
    <div className="flex min-h-screen bg-obsidian">
      <Sidebar
        dealerName={dealer.name}
        dealerSlug={dealer.slug}
        plan={dealer.subscription_plan}
        sections={perms.sections}
        role={access.role}
      />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
