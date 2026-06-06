'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Car, PlusCircle, User, BarChart2,
  MessageSquare, CreditCard, LogOut, ExternalLink, FileUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/brand/Logo'

const NAV = [
  { label: 'Panel', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Inventario', href: '/dashboard/inventario', icon: Car },
  { label: 'Publicar vehículo', href: '/dashboard/publicar', icon: PlusCircle },
  { label: 'Importar CSV', href: '/dashboard/importar', icon: FileUp },
  { label: 'Oportunidades', href: '/dashboard/mensajes', icon: MessageSquare },
  { label: 'Analíticas', href: '/dashboard/analiticas', icon: BarChart2 },
  { label: 'Mi perfil', href: '/dashboard/perfil', icon: User },
  { label: 'Suscripción', href: '/dashboard/suscripcion', icon: CreditCard },
]

interface SidebarProps {
  dealerName: string
  dealerSlug: string
  plan: string | null
}

export default function Sidebar({ dealerName, dealerSlug, plan }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const PLAN_COLORS: Record<string, string> = {
    essential: 'text-bsm-text-muted',
    professional: 'text-gold',
    elite: 'text-gold',
  }

  return (
    <aside className="w-64 bg-surface border-r border-bsm-border flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-bsm-border">
        <Link href="/">
          <Logo width={140} />
        </Link>
      </div>

      {/* Dealer info */}
      <div className="px-4 py-4 border-b border-bsm-border">
        <p className="text-xs text-bsm-text-muted mb-1">Concesionario</p>
        <p className="text-sm font-medium text-bsm-text-primary truncate">{dealerName}</p>
        {plan && (
          <span className={cn('text-xs capitalize', PLAN_COLORS[plan] || 'text-bsm-text-muted')}>
            Plan {plan}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {NAV.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(isActive ? 'sidebar-link-active' : 'sidebar-link')}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-bsm-border p-4 space-y-1">
        <a
          href={`/dealers/${dealerSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link text-xs"
        >
          <ExternalLink className="w-4 h-4" />
          Ver perfil público
        </a>
        <button onClick={handleLogout} className="sidebar-link w-full text-left">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
