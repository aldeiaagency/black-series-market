import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard, Users, Car, Settings, LogOut, TrendingUp,
} from 'lucide-react'

const ADMIN_NAV = [
  { label: 'Panel', href: '/admin', icon: LayoutDashboard },
  { label: 'Concesionarios', href: '/admin/dealers', icon: Users },
  { label: 'Vehículos', href: '/admin/vehiculos', icon: Car },
  { label: 'Analíticas', href: '/admin/analiticas', icon: TrendingUp },
  { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen bg-obsidian">
      <aside className="w-64 bg-surface border-r border-bsm-border flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-bsm-border">
          <Link href="/admin">
            <div className="font-display text-lg font-light tracking-[0.15em]">BLACK SERIES</div>
            <div className="text-[9px] tracking-[0.4em] text-gold uppercase">Admin Panel</div>
          </Link>
        </div>

        <nav className="flex-1 py-4">
          {ADMIN_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-link">
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-bsm-border p-4">
          <Link href="/" className="sidebar-link text-xs">
            Ver marketplace →
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
