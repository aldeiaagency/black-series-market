import { createClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/utils'
import { TrendingUp, Eye, MessageSquare, Heart, Users, Car } from 'lucide-react'

export default async function AdminAnaliticasPage() {
  const supabase = await createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString()

  const [
    { data: topVehicles },
    { data: topDealers },
    { count: totalLeads30d },
    { count: newDealers30d },
    { data: leadsByDay },
    { data: planDistribution },
    { data: brandStats },
    { count: totalViews30d },
  ] = await Promise.all([
    // Top vehicles by views
    supabase
      .from('vehicles')
      .select('id, brand_name, model_name, year, views, slug, vehicle_type, price, dealer:dealers(name)')
      .eq('status', 'active')
      .order('views', { ascending: false })
      .limit(10),

    // Top dealers by vehicle count
    supabase
      .from('dealers')
      .select('id, name, slug, subscription_plan, location_city, vehicle_count:vehicles(count)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10),

    // New leads in 30 days
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgoISO),

    // New dealers in 30 days
    supabase
      .from('dealers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgoISO),

    // Leads by status
    supabase
      .from('leads')
      .select('status'),

    // Dealers by plan
    supabase
      .from('dealers')
      .select('subscription_plan')
      .eq('status', 'active'),

    // Top brands by vehicle count
    supabase
      .from('vehicles')
      .select('brand_name')
      .eq('status', 'active'),

    // Total views in 30 days — matches event_type inserted by vehicle detail pages
    supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'view')
      .gte('created_at', thirtyDaysAgoISO),
  ])

  // Aggregate brand stats
  const brandCount: Record<string, number> = {}
  brandStats?.forEach((v: any) => {
    brandCount[v.brand_name] = (brandCount[v.brand_name] || 0) + 1
  })
  const topBrands = Object.entries(brandCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  // Aggregate lead statuses
  const leadStatuses: Record<string, number> = {}
  leadsByDay?.forEach((l: any) => {
    leadStatuses[l.status] = (leadStatuses[l.status] || 0) + 1
  })
  const totalLeadsAll = leadsByDay?.length || 0

  // Plan distribution
  const planCount: Record<string, number> = {}
  planDistribution?.forEach((d: any) => {
    const plan = d.subscription_plan || 'trial'
    planCount[plan] = (planCount[plan] || 0) + 1
  })

  // Top dealers formatted
  const topDealersFormatted = topDealers?.map((d: any) => ({
    ...d,
    vehicle_count: d.vehicle_count?.[0]?.count ?? 0,
  })) || []

  const OVERVIEW_STATS = [
    { label: 'Vistas (30d)', value: formatNumber(totalViews30d || 0), icon: Eye, color: 'text-blue-400', sub: 'eventos analytics' },
    { label: 'Leads (30d)', value: formatNumber(totalLeads30d || 0), icon: MessageSquare, color: 'text-emerald-400', sub: 'nuevas consultas' },
    { label: 'Dealers nuevos (30d)', value: formatNumber(newDealers30d || 0), icon: Users, color: 'text-gold', sub: 'registros recientes' },
    { label: 'Total leads', value: formatNumber(totalLeadsAll), icon: TrendingUp, color: 'text-purple-400', sub: 'todos los tiempos' },
  ]

  const PLAN_COLORS: Record<string, string> = {
    essential: 'bg-blue-400',
    professional: 'bg-gold',
    elite: 'bg-emerald-400',
    trial: 'bg-bsm-border',
  }

  const PLAN_LABELS: Record<string, string> = {
    essential: 'Essential',
    professional: 'Professional',
    elite: 'Elite',
    trial: 'Trial',
  }

  const totalDealersActive = planDistribution?.length || 1

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Analíticas del marketplace</h1>
        <p className="text-sm text-bsm-text-muted">Visión global de rendimiento — últimos 30 días</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {OVERVIEW_STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`${s.color} mb-3`}><s.icon className="w-5 h-5" /></div>
            <div className="font-display text-3xl font-light mb-0.5">{s.value}</div>
            <div className="text-xs text-bsm-text-muted uppercase tracking-wide">{s.label}</div>
            <div className="text-[10px] text-bsm-text-muted mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Plan distribution */}
        <div className="bg-surface border border-bsm-border p-6">
          <h2 className="font-medium mb-5">Distribución de planes</h2>
          <div className="space-y-4">
            {Object.entries(planCount).sort(([, a], [, b]) => b - a).map(([plan, count]) => {
              const pct = Math.round((count / totalDealersActive) * 100)
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-bsm-text-secondary">{PLAN_LABELS[plan] || plan}</span>
                    <span className="text-sm text-bsm-text-primary font-medium">{count} <span className="text-xs text-bsm-text-muted">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${PLAN_COLORS[plan] || 'bg-bsm-border'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {Object.keys(planCount).length === 0 && (
              <p className="text-sm text-bsm-text-muted">Sin datos disponibles</p>
            )}
          </div>
        </div>

        {/* Lead status breakdown */}
        <div className="bg-surface border border-bsm-border p-6">
          <h2 className="font-medium mb-5">Estado de leads</h2>
          <div className="space-y-3">
            {[
              { key: 'new', label: 'Nuevos', color: 'text-gold' },
              { key: 'contacted', label: 'Contactados', color: 'text-blue-400' },
              { key: 'qualified', label: 'Cualificados', color: 'text-emerald-400' },
              { key: 'closed_won', label: 'Ganados', color: 'text-emerald-300' },
              { key: 'closed_lost', label: 'Perdidos', color: 'text-red-400' },
            ].map(({ key, label, color }) => {
              const n = leadStatuses[key] || 0
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className={`text-sm ${color}`}>{label}</span>
                  <span className="text-sm text-bsm-text-primary">{formatNumber(n)}</span>
                </div>
              )
            })}
          </div>
          {totalLeadsAll > 0 && (
            <div className="mt-5 pt-4 border-t border-bsm-border">
              <div className="flex justify-between text-xs text-bsm-text-muted">
                <span>Total leads</span>
                <span className="text-bsm-text-primary font-medium">{formatNumber(totalLeadsAll)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Top brands */}
        <div className="bg-surface border border-bsm-border p-6">
          <h2 className="font-medium mb-5">Marcas más activas</h2>
          <div className="space-y-3">
            {topBrands.map(([brand, count], i) => (
              <div key={brand} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-bsm-text-muted w-4">{i + 1}</span>
                  <span className="text-sm text-bsm-text-secondary">{brand}</span>
                </div>
                <span className="text-sm text-bsm-text-primary">{count} <span className="text-xs text-bsm-text-muted">vehíc.</span></span>
              </div>
            ))}
            {topBrands.length === 0 && (
              <p className="text-sm text-bsm-text-muted">Sin vehículos activos</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top vehicles by views */}
        <div className="bg-surface border border-bsm-border">
          <div className="p-5 border-b border-bsm-border">
            <h2 className="font-medium">Vehículos más vistos</h2>
          </div>
          <div className="divide-y divide-bsm-border">
            {topVehicles?.map((v: any, i) => (
              <div key={v.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-bsm-text-muted w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-bsm-text-primary">
                      {v.brand_name} {v.model_name} {v.year}
                    </p>
                    <p className="text-xs text-bsm-text-muted">{v.dealer?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-bsm-text-muted">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-sm">{formatNumber(v.views || 0)}</span>
                </div>
              </div>
            ))}
            {(!topVehicles || topVehicles.length === 0) && (
              <div className="p-8 text-center text-sm text-bsm-text-muted">Sin vehículos activos</div>
            )}
          </div>
        </div>

        {/* Top dealers by vehicle count */}
        <div className="bg-surface border border-bsm-border">
          <div className="p-5 border-b border-bsm-border">
            <h2 className="font-medium">Concesionarios más activos</h2>
          </div>
          <div className="divide-y divide-bsm-border">
            {topDealersFormatted.map((d: any, i: number) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-bsm-text-muted w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-bsm-text-primary">{d.name}</p>
                    <p className="text-xs text-bsm-text-muted capitalize">{d.subscription_plan || 'trial'} · {d.location_city || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-bsm-text-muted">
                  <Car className="w-3.5 h-3.5" />
                  <span className="text-sm">{d.vehicle_count}</span>
                </div>
              </div>
            ))}
            {topDealersFormatted.length === 0 && (
              <div className="p-8 text-center text-sm text-bsm-text-muted">Sin concesionarios activos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
