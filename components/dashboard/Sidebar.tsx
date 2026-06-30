'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Car, PlusCircle, User, BarChart2,
  MessageSquare, CreditCard, LogOut, ExternalLink, FileUp, Users, ClipboardList, CalendarClock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/brand/Logo'
import type { DashboardSection, OrgRole } from '@/lib/permissions'
import { ROLE_LABELS } from '@/lib/permissions'

const NAV: { label: string; href: string; icon: typeof LayoutDashboard; exact?: boolean; section: DashboardSection }[] = [
  { label: 'Panel', href: '/dashboard', icon: LayoutDashboard, exact: true, section: 'panel' },
  { label: 'Inventario', href: '/dashboard/inventario', icon: Car, section: 'inventario' },
  { label: 'Publicar vehículo', href: '/dashboard/publicar', icon: PlusCircle, section: 'publicar' },
  { label: 'Importar CSV', href: '/dashboard/importar', icon: FileUp, section: 'importar' },
  { label: 'Oportunidades', href: '/dashboard/oportunidades', icon: MessageSquare, section: 'oportunidades' },
  { label: 'A la carta', href: '/dashboard/solicitudes', icon: ClipboardList, section: 'solicitudes' },
  { label: 'Citas', href: '/dashboard/citas', icon: CalendarClock, section: 'citas' },
  { label: 'Analíticas', href: '/dashboard/analiticas', icon: BarChart2, section: 'analiticas' },
  { label: 'Equipo', href: '/dashboard/equipo', icon: Users, section: 'equipo' },
  { label: 'Mi perfil', href: '/dashboard/perfil', icon: User, section: 'perfil' },
  { label: 'Suscripción', href: '/dashboard/suscripcion', icon: CreditCard, section: 'suscripcion' },
]

interface SidebarProps {
  dealerName: string
  dealerSlug: string
  plan: string | null
  sections: DashboardSection[]
  role: OrgRole
}

export default function Sidebar({ dealerName, dealerSlug, plan, sections, role }: SidebarProps) {
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
        <div className="flex items-center gap-2">
          {plan && (
            <span className={cn('text-xs capitalize', PLAN_COLORS[plan] || 'text-bsm-text-muted')}>
              Plan {plan}
            </span>
          )}
          {role !== 'owner' && (
            <span className="text-[10px] text-bsm-text-muted border border-bsm-border px-1.5 py-0.5">
              {ROLE_LABELS[role]}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {NAV.filter((item) => sections.includes(item.section)).map((item) => {
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
