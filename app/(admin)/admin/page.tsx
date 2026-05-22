import { createClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/utils'
import { Users, Car, MessageSquare, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: dealerCount },
    { count: vehicleCount },
    { count: activeVehicles },
    { count: pendingVehicles },
    { count: leadCount },
    { data: recentDealers },
    { data: recentVehicles },
  ] = await Promise.all([
    supabase.from('dealers').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('dealers').select('id, name, status, subscription_plan, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('vehicles').select('id, brand_name, model_name, year, status, dealer:dealers(name), created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const STATS = [
    { label: 'Concesionarios', value: formatNumber(dealerCount || 0), icon: Users, color: 'text-gold', href: '/admin/dealers' },
    { label: 'Vehículos activos', value: formatNumber(activeVehicles || 0), icon: Car, color: 'text-emerald-400', href: '/admin/vehiculos?status=active' },
    { label: 'En revisión', value: formatNumber(pendingVehicles || 0), icon: Car, color: 'text-amber-400', href: '/admin/vehiculos?status=pending_review' },
    { label: 'Total leads', value: formatNumber(leadCount || 0), icon: MessageSquare, color: 'text-blue-400', href: '#' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Panel de administración</h1>
        <p className="text-sm text-bsm-text-muted">Black Series Market — Vista general</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href} className="stat-card hover:border-gold/20 transition-colors">
            <div className={`${s.color} mb-3`}><s.icon className="w-5 h-5" /></div>
            <div className="font-display text-3xl font-light mb-1">{s.value}</div>
            <div className="text-xs text-bsm-text-muted uppercase tracking-wide">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent dealers */}
        <div className="bg-surface border border-bsm-border">
          <div className="flex items-center justify-between p-5 border-b border-bsm-border">
            <h2 className="font-medium">Concesionarios recientes</h2>
            <Link href="/admin/dealers" className="text-xs text-gold">Ver todos →</Link>
          </div>
          <div className="divide-y divide-bsm-border">
            {recentDealers?.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-bsm-text-primary">{d.name}</p>
                  <p className="text-xs text-bsm-text-muted capitalize">{d.subscription_plan || 'trial'}</p>
                </div>
                <span className={`badge text-[10px] ${d.status === 'active' ? 'badge-active' : 'badge-pending'}`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending vehicles */}
        <div className="bg-surface border border-bsm-border">
          <div className="flex items-center justify-between p-5 border-b border-bsm-border">
            <h2 className="font-medium">Vehículos recientes</h2>
            <Link href="/admin/vehiculos" className="text-xs text-gold">Ver todos →</Link>
          </div>
          <div className="divide-y divide-bsm-border">
            {recentVehicles?.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-bsm-text-primary">
                    {v.brand_name} {v.model_name} {v.year}
                  </p>
                  <p className="text-xs text-bsm-text-muted">{v.dealer?.name}</p>
                </div>
                <span className={`badge text-[10px] ${v.status === 'active' ? 'badge-active' : v.status === 'pending_review' ? 'badge-pending' : 'badge-muted'}`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
