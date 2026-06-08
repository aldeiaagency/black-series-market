import { createAdminClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/utils'
import { Users, Car, MessageSquare, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const VEHICLE_STATUS_BADGE: Record<string, string> = {
  active:         'badge-active',
  pending_review: 'badge-pending',
  draft:          'badge-muted',
  paused:         'badge-muted',
  sold:           'badge-muted',
  expired:        'badge-muted',
}
const VEHICLE_STATUS_LABEL: Record<string, string> = {
  active:         'Activo',
  pending_review: 'En revisión',
  draft:          'Borrador',
  paused:         'Reservado',
  sold:           'Vendido',
  expired:        'Caducado',
}

export default async function AdminPage() {
  // createAdminClient bypasses RLS — necessary for cross-dealer queries
  const supabase = await createAdminClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const d30 = thirtyDaysAgo.toISOString()

  const [
    { count: totalDealers },
    { count: activeDealers },
    { count: activeVehicles },
    { count: pendingVehicles },
    { count: totalLeads },
    { count: leads30d },
    { count: requests30d },
    { data: recentDealers },
    { data: pendingReviewVehicles },
  ] = await Promise.all([
    supabase.from('dealers').select('*', { count: 'exact', head: true }),
    supabase.from('dealers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', d30),
    supabase.from('custom_requests').select('*', { count: 'exact', head: true })
      .gte('created_at', d30),
    supabase.from('dealers')
      .select('id, name, status, subscription_plan, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('vehicles')
      .select('id, brand_name, model_name, year, status, dealer:dealers(name), created_at, images')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const STATS = [
    {
      label: 'Showrooms totales',
      sub: `${activeDealers ?? 0} activos`,
      value: formatNumber(totalDealers || 0),
      icon: Users,
      color: 'text-gold',
      href: '/admin/dealers',
    },
    {
      label: 'Vehículos activos',
      sub: 'publicados en marketplace',
      value: formatNumber(activeVehicles || 0),
      icon: Car,
      color: 'text-emerald-400',
      href: '/admin/vehiculos?status=active',
    },
    {
      label: 'En revisión',
      sub: 'pendientes de aprobación',
      value: formatNumber(pendingVehicles || 0),
      icon: Clock,
      color: pendingVehicles ? 'text-amber-400' : 'text-bsm-text-muted',
      href: '/admin/vehiculos?status=pending_review',
    },
    {
      label: 'Contactos totales',
      sub: `${leads30d ?? 0} últimos 30 días`,
      value: formatNumber(totalLeads || 0),
      icon: MessageSquare,
      color: 'text-blue-400',
      href: '/admin/contactos',
    },
    {
      label: 'Solicitudes a la carta',
      sub: 'últimos 30 días',
      value: formatNumber(requests30d || 0),
      icon: TrendingUp,
      color: 'text-purple-400',
      href: '/admin/analiticas',
    },
    {
      label: 'Aprobados',
      sub: 'showrooms activos',
      value: formatNumber(activeDealers || 0),
      icon: CheckCircle,
      color: 'text-emerald-400',
      href: '/admin/dealers?status=active',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Panel de administración</h1>
        <p className="text-sm text-bsm-text-muted">Black Label Market — Vista general del marketplace</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href} className="stat-card hover:border-gold/20 transition-colors group">
            <div className={`${s.color} mb-3`}><s.icon className="w-5 h-5" /></div>
            <div className="font-display text-3xl font-light mb-0.5">{s.value}</div>
            <div className="text-xs text-bsm-text-muted uppercase tracking-wide leading-tight">{s.label}</div>
            <div className="text-[10px] text-bsm-text-muted mt-1 opacity-60">{s.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Concesionarios recientes */}
        <div className="bg-surface border border-bsm-border">
          <div className="flex items-center justify-between p-5 border-b border-bsm-border">
            <h2 className="font-medium">Showrooms recientes</h2>
            <Link href="/admin/dealers" className="text-xs text-gold">Ver todos →</Link>
          </div>
          <div className="divide-y divide-bsm-border">
            {recentDealers?.map((d: any) => (
              <Link key={d.id} href={`/admin/dealers/${d.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-elevated transition-colors">
                <div>
                  <p className="text-sm font-medium text-bsm-text-primary">{d.name}</p>
                  <p className="text-xs text-bsm-text-muted capitalize">{d.subscription_plan || 'trial'}</p>
                </div>
                <span className={`badge text-[10px] ${d.status === 'active' ? 'badge-active' : d.status === 'pending' ? 'badge-pending' : 'badge-muted'}`}>
                  {d.status === 'active' ? 'Activo' : d.status === 'pending' ? 'Pendiente' : d.status === 'trial' ? 'Trial' : d.status}
                </span>
              </Link>
            ))}
            {!recentDealers?.length && (
              <p className="p-8 text-center text-sm text-bsm-text-muted">Sin datos</p>
            )}
          </div>
        </div>

        {/* Vehículos pendientes de revisión */}
        <div className="bg-surface border border-bsm-border">
          <div className="flex items-center justify-between p-5 border-b border-bsm-border">
            <h2 className="font-medium flex items-center gap-2">
              Cola de revisión
              {(pendingVehicles ?? 0) > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-medium">
                  {pendingVehicles}
                </span>
              )}
            </h2>
            <Link href="/admin/vehiculos?status=pending_review" className="text-xs text-gold">
              Gestionar →
            </Link>
          </div>
          <div className="divide-y divide-bsm-border">
            {pendingReviewVehicles && pendingReviewVehicles.length > 0 ? pendingReviewVehicles.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-8 bg-surface-elevated overflow-hidden flex-shrink-0">
                    {v.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-3 h-3 text-bsm-text-muted" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-bsm-text-primary">
                      {v.brand_name} {v.model_name} {v.year}
                    </p>
                    <p className="text-xs text-bsm-text-muted">{v.dealer?.name}</p>
                  </div>
                </div>
                <Link
                  href={`/admin/vehiculos?status=pending_review`}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex-shrink-0"
                >
                  Revisar →
                </Link>
              </div>
            )) : (
              <div className="p-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400/30 mx-auto mb-2" />
                <p className="text-sm text-bsm-text-muted">Cola vacía — sin pendientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
