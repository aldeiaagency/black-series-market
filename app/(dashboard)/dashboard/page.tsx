import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Car, Eye, MessageSquare, TrendingUp, PlusCircle, ArrowRight, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatNumber, VEHICLE_STATUS_LABELS } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dealer } = await supabase
    .from('dealers')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) redirect('/registro')

  const [
    { data: vehicles },
    { count: activeVehicles },
    { count: pendingVehicles },
    { data: leads, count: leadCount },
    { data: analytics },
  ] = await Promise.all([
    // Widget "vehículos recientes": solo los 5 últimos para mostrar en pantalla
    supabase.from('vehicles').select('id, status, brand_name, model_name, year, views, leads_count, images')
      .eq('dealer_id', dealer.id).order('created_at', { ascending: false }).limit(5),
    // Contador real de activos: HEAD request, sin traer filas
    supabase.from('vehicles').select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id).eq('status', 'active'),
    // Contador real de en revisión: HEAD request, sin traer filas
    supabase.from('vehicles').select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id).eq('status', 'pending_review'),
    supabase.from('leads').select('*', { count: 'exact' })
      .eq('dealer_id', dealer.id).eq('status', 'new').limit(5),
    supabase.from('analytics_events').select('event_type')
      .eq('dealer_id', dealer.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const totalViews = analytics?.filter((e: any) =>
    e.event_type === 'vehicle_view' || e.event_type === 'view'
  ).length || 0
  const profileViews = analytics?.filter((e: any) =>
    e.event_type === 'professional_profile_view'
  ).length || 0

  const STATS = [
    { label: 'Vehículos activos', value: activeVehicles ?? 0, icon: Car, color: 'text-gold' },
    { label: 'Visitas este mes', value: formatNumber(totalViews), icon: Eye, color: 'text-emerald-400' },
    { label: 'Visitas al perfil', value: formatNumber(profileViews), icon: UserCheck, color: 'text-purple-400' },
    { label: 'Leads sin leer', value: leadCount ?? 0, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'En revisión', value: pendingVehicles ?? 0, icon: TrendingUp, color: 'text-amber-400' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">
          Bienvenido, {dealer.name}
        </h1>
        <p className="text-sm text-bsm-text-muted">
          Plan {dealer.subscription_plan || 'Trial'} ·{' '}
          {activeVehicles ?? 0}/{dealer.vehicle_slots} slots usados
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`${stat.color} mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="font-display text-3xl font-light text-bsm-text-primary mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-bsm-text-muted uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent vehicles */}
        <div className="bg-surface border border-bsm-border">
          <div className="flex items-center justify-between p-5 border-b border-bsm-border">
            <h2 className="font-medium text-bsm-text-primary">Vehículos recientes</h2>
            <Link href="/dashboard/inventario" className="text-xs text-gold hover:text-gold-light">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-bsm-border">
            {vehicles && vehicles.length > 0 ? vehicles.map((v: any) => (
              <div key={v.id} className="flex items-center gap-4 p-4 hover:bg-surface-elevated transition-colors">
                <div className="w-12 h-9 bg-surface-overlay flex-shrink-0 overflow-hidden">
                  {v.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-bsm-text-primary truncate">
                    {v.brand_name} {v.model_name} {v.year}
                  </p>
                  <p className="text-xs text-bsm-text-muted">{v.views} visitas · {v.leads_count} leads</p>
                </div>
                <span className={`badge text-[10px] ${v.status === 'active' ? 'badge-active' : v.status === 'pending_review' ? 'badge-pending' : 'badge-muted'}`}>
                  {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS]}
                </span>
              </div>
            )) : (
              <div className="p-8 text-center">
                <p className="text-sm text-bsm-text-muted mb-4">Aún no has publicado vehículos</p>
                <Link href="/dashboard/publicar" className="btn-gold text-sm px-6 py-2.5">
                  <PlusCircle className="w-4 h-4" />
                  Publicar primer vehículo
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent leads */}
        <div className="bg-surface border border-bsm-border">
          <div className="flex items-center justify-between p-5 border-b border-bsm-border">
            <h2 className="font-medium text-bsm-text-primary">Últimos leads</h2>
            <Link href="/dashboard/mensajes" className="text-xs text-gold hover:text-gold-light">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-bsm-border">
            {leads && leads.length > 0 ? leads.map((lead: any) => (
              <div key={lead.id} className="p-4 hover:bg-surface-elevated transition-colors">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <p className="text-sm font-medium text-bsm-text-primary">{lead.buyer_name}</p>
                  <span className="badge badge-gold text-[10px] flex-shrink-0">Nuevo</span>
                </div>
                <p className="text-xs text-bsm-text-muted truncate">{lead.message}</p>
                <p className="text-xs text-bsm-text-muted mt-1">{lead.buyer_email}</p>
              </div>
            )) : (
              <div className="p-8 text-center text-sm text-bsm-text-muted">
                No hay leads nuevos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/publicar" className="btn-gold justify-center py-4">
          <PlusCircle className="w-4 h-4" />
          Publicar vehículo
        </Link>
        <Link href="/dashboard/inventario" className="btn-outline justify-center py-4">
          <Car className="w-4 h-4" />
          Gestionar inventario
        </Link>
        <Link href="/dashboard/suscripcion" className="btn-outline justify-center py-4">
          <ArrowRight className="w-4 h-4" />
          Mejorar plan
        </Link>
      </div>
    </div>
  )
}
