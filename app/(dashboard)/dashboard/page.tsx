import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Car, Eye, MessageSquare, TrendingUp, PlusCircle, ArrowRight, UserCheck, CheckCircle2, Circle } from 'lucide-react'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getEntitlements } from '@/lib/entitlements'
import { getPermissions } from '@/lib/permissions'
import { formatNumber, VEHICLE_STATUS_LABELS } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getDealerAccess(user.id)
  if (!access) redirect('/registro')
  const perms = getPermissions(access.role)

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select('*')
    .eq('id', access.dealerId)
    .single()

  if (!dealer) redirect('/registro')

  // Límite real del plan (fuente de verdad: entitlements). Fallback al campo legacy.
  const ent = access.orgId ? await getEntitlements(access.orgId) : null
  const vehicleLimit = ent?.limits.maxActiveVehicles ?? dealer.vehicle_slots

  const [
    { data: vehicles },
    { count: activeVehicles },
    { count: pendingVehicles },
    { data: leads, count: leadCount },
    { data: analytics },
  ] = await Promise.all([
    // Widget "vehículos recientes": solo los 5 últimos para mostrar en pantalla
    admin.from('vehicles').select('id, status, brand_name, model_name, year, views, leads_count, images')
      .eq('dealer_id', dealer.id).order('created_at', { ascending: false }).limit(5),
    // Contador real de activos: HEAD request, sin traer filas
    admin.from('vehicles').select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id).eq('status', 'active'),
    // Contador real de en revisión: HEAD request, sin traer filas
    admin.from('vehicles').select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealer.id).eq('status', 'pending_review'),
    admin.from('leads').select('*', { count: 'exact' })
      .eq('dealer_id', dealer.id).eq('status', 'new').limit(5),
    admin.from('analytics_events').select('event_type')
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

  // Getting-started steps for new dealers (0 vehicles published)
  const isNewDealer = (activeVehicles ?? 0) === 0
  const hasProfile = !!(dealer.description && dealer.phone)
  const hasPlan = dealer.status === 'active'
  const isPro = dealer.subscription_plan === 'professional' || dealer.subscription_plan === 'elite' || dealer.subscription_plan === 'grupo'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">
          Bienvenido, {dealer.name}
        </h1>
        <p className="text-sm text-bsm-text-muted">
          Plan {dealer.subscription_plan || 'Trial'} ·{' '}
          {activeVehicles ?? 0}/{vehicleLimit} vehículos publicados
        </p>
      </div>

      {/* Trial banner — visible mientras el dealer no haya pasado a plan de pago */}
      {dealer.status === 'trial' && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-gold/30 bg-[#0D0C07] px-6 py-4">
          <p className="text-sm text-bsm-text-secondary">
            <span className="text-gold">Prueba activa</span>
            {dealer.trial_ends_at ? (
              <> hasta el {new Date(dealer.trial_ends_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.</>
            ) : (
              <>. Tu showroom ya es visible en el market.</>
            )}
            {' '}Tu perfil y tu stock ya son públicos — sin coste durante el programa fundador.
          </p>
          <Link href="/dashboard/suscripcion" className="shrink-0 text-xs uppercase tracking-widest text-gold hover:underline">
            Ver planes →
          </Link>
        </div>
      )}

      {/* Getting started — only for dealers with no published vehicles yet */}
      {isNewDealer && (
        <div className="mb-8 border border-gold/20 bg-[#0D0C07] p-6">
          <p className="text-xs text-gold tracking-widest uppercase mb-4">Primeros pasos</p>
          <div className="space-y-3">
            {[
              { done: true,     label: 'Cuenta creada y acceso concedido',                   href: null },
              { done: hasProfile, label: 'Completa el perfil de tu showroom',                 href: '/dashboard/perfil' },
              { done: hasPlan,   label: 'Activa tu plan de suscripción',                      href: '/dashboard/suscripcion' },
              { done: false,     label: 'Publica tu primer vehículo',                         href: '/dashboard/publicar' },
              { done: false,     label: isPro ? 'Configura el asistente IA (disponible en tu plan)' : 'Mejora a Professional para activar el asistente IA', href: isPro ? '/dashboard/perfil' : '/dashboard/suscripcion' },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                {step.done
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : <Circle className="w-4 h-4 text-bsm-text-muted flex-shrink-0" />}
                {step.href && !step.done ? (
                  <Link href={step.href} className="text-sm text-bsm-text-secondary hover:text-gold transition-colors">
                    {step.label} →
                  </Link>
                ) : (
                  <span className={`text-sm ${step.done ? 'text-bsm-text-muted line-through' : 'text-bsm-text-secondary'}`}>
                    {step.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
            <Link href="/dashboard/oportunidades" className="text-xs text-gold hover:text-gold-light">
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
      <div className={`mt-8 grid grid-cols-1 gap-4 ${dealer.subscription_plan === 'elite' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        <Link href="/dashboard/publicar" className="btn-gold justify-center py-4">
          <PlusCircle className="w-4 h-4" />
          Publicar vehículo
        </Link>
        <Link href="/dashboard/inventario" className="btn-outline justify-center py-4">
          <Car className="w-4 h-4" />
          Gestionar inventario
        </Link>
        {dealer.subscription_plan !== 'elite' && (
          <Link href="/dashboard/suscripcion" className="btn-outline justify-center py-4">
            <ArrowRight className="w-4 h-4" />
            Mejorar plan
          </Link>
        )}
      </div>
    </div>
  )
}
