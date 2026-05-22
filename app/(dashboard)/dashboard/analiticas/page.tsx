import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/utils'
import { Eye, MessageSquare, Heart, TrendingUp } from 'lucide-react'

export default async function AnaliticasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dealer } = await supabase
    .from('dealers').select('id, subscription_plan').eq('profile_id', user.id).single()
  if (!dealer) redirect('/registro')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: events }, { data: vehicles }, { data: leads }] = await Promise.all([
    supabase.from('analytics_events')
      .select('event_type, created_at')
      .eq('dealer_id', dealer.id)
      .gte('created_at', thirtyDaysAgo),
    supabase.from('vehicles')
      .select('id, brand_name, model_name, year, views, leads_count, status, images')
      .eq('dealer_id', dealer.id)
      .eq('status', 'active')
      .order('views', { ascending: false })
      .limit(10),
    supabase.from('leads')
      .select('status, created_at')
      .eq('dealer_id', dealer.id)
      .gte('created_at', thirtyDaysAgo),
  ])

  const views = events?.filter((e: any) => e.event_type === 'view').length || 0
  const contacts = events?.filter((e: any) => e.event_type === 'contact').length || 0
  const favorites = events?.filter((e: any) => e.event_type === 'favorite').length || 0
  const leadsTotal = leads?.length || 0
  const conversionRate = views > 0 ? ((leadsTotal / views) * 100).toFixed(1) : '0'

  const STATS = [
    { label: 'Visitas (30d)', value: formatNumber(views), icon: Eye, color: 'text-emerald-400' },
    { label: 'Leads (30d)', value: leadsTotal, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Favoritos (30d)', value: formatNumber(favorites), icon: Heart, color: 'text-gold' },
    { label: 'Conversión', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-amber-400' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Analíticas</h1>
        <p className="text-sm text-bsm-text-muted">Últimos 30 días</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`${s.color} mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="font-display text-3xl font-light mb-1">{s.value}</div>
            <div className="text-xs text-bsm-text-muted uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Top vehicles */}
      <div className="bg-surface border border-bsm-border">
        <div className="p-5 border-b border-bsm-border">
          <h2 className="font-medium text-bsm-text-primary">Vehículos más vistos</h2>
        </div>
        <div className="divide-y divide-bsm-border">
          {vehicles && vehicles.length > 0 ? vehicles.map((v: any, i: number) => (
            <div key={v.id} className="flex items-center gap-4 px-5 py-4">
              <span className="text-xs text-bsm-text-muted w-5 text-center">{i + 1}</span>
              <div className="w-12 h-9 bg-surface-elevated flex-shrink-0 overflow-hidden">
                {v.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-bsm-text-primary truncate">
                  {v.brand_name} {v.model_name} {v.year}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-bsm-text-primary">{formatNumber(v.views)}</p>
                <p className="text-xs text-bsm-text-muted">visitas</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-gold">{v.leads_count}</p>
                <p className="text-xs text-bsm-text-muted">leads</p>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-sm text-bsm-text-muted">
              Sin datos de vehículos activos
            </div>
          )}
        </div>
      </div>

      {dealer.subscription_plan !== 'elite' && (
        <div className="mt-6 bg-gold/5 border border-gold/20 p-6 flex items-center justify-between gap-6">
          <div>
            <p className="font-medium text-bsm-text-primary mb-1">Analíticas avanzadas disponibles en Elite</p>
            <p className="text-sm text-bsm-text-muted">
              Accede a gráficos de evolución, benchmarks de mercado y análisis de competencia.
            </p>
          </div>
          <a href="/dashboard/suscripcion" className="btn-gold flex-shrink-0">
            Actualizar plan
          </a>
        </div>
      )}
    </div>
  )
}
