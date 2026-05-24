import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id, name, slug, status, subscription_plan, vehicle_slots')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) redirect('/registro')
  if (dealer.status === 'pending') redirect('/solicitud-enviada')

  return (
    <div className="flex min-h-screen bg-obsidian">
      <Sidebar
        dealerName={dealer.name}
        dealerSlug={dealer.slug}
        plan={dealer.subscription_plan}
      />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
