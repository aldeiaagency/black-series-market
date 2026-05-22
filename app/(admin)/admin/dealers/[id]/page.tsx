import { notFound, redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { DEALER_STATUS_LABELS, VEHICLE_STATUS_LABELS, getVehicleStatusColor, formatPrice, formatNumber, timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Car, MessageSquare, Eye, MapPin, Mail, Phone, Globe } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

async function setDealerStatus(dealerId: string, status: string) {
  'use server'
  const supabase = await createAdminClient()
  await supabase.from('dealers').update({ status }).eq('id', dealerId)
  redirect(`/admin/dealers/${dealerId}`)
}

async function setDealerPlan(dealerId: string, plan: string) {
  'use server'
  const supabase = await createAdminClient()
  const slots = plan === 'elite' ? 100 : plan === 'professional' ? 40 : plan === 'essential' ? 15 : 5
  await supabase.from('dealers').update({ subscription_plan: plan, vehicle_slots: slots }).eq('id', dealerId)
  redirect(`/admin/dealers/${dealerId}`)
}

async function setDealerFeatured(dealerId: string, featured: boolean) {
  'use server'
  const supabase = await createAdminClient()
  await supabase.from('dealers').update({ is_featured: featured }).eq('id', dealerId)
  redirect(`/admin/dealers/${dealerId}`)
}

export default async function AdminDealerDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: dealer } = await supabase
    .from('dealers')
    .select('*, profile:profiles(email, created_at)')
    .eq('id', id)
    .single()

  if (!dealer) notFound()

  const [
    { data: vehicles, count: vehicleCount },
    { data: leads, count: leadCount },
  ] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id, brand_name, model_name, year, price, status, views, vehicle_type, slug, created_at', { count: 'exact' })
      .eq('dealer_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('leads')
      .select('id, buyer_name, buyer_email, status, created_at, vehicle:vehicles(brand_name, model_name)', { count: 'exact' })
      .eq('dealer_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const activeVehicles = vehicles?.filter((v: any) => v.status === 'active').length || 0
  const totalViews = vehicles?.reduce((sum: number, v: any) => sum + (v.views || 0), 0) || 0

  const PLAN_OPTIONS = [
    { value: 'trial', label: 'Trial (5 slots)' },
    { value: 'essential', label: 'Essential (15 slots)' },
    { value: 'professional', label: 'Professional (40 slots)' },
    { value: 'elite', label: 'Elite (100 slots)' },
  ]

  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'trial', label: 'Trial' },
    { value: 'active', label: 'Activo' },
    { value: 'suspended', label: 'Suspendido' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/dealers" className="flex items-center gap-1.5 text-sm text-bsm-text-muted hover:text-gold transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a concesionarios
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {dealer.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dealer.logo_url} alt={dealer.name} className="w-16 h-16 object-contain bg-surface-elevated border border-bsm-border p-2" />
            ) : (
              <div className="w-16 h-16 bg-surface-elevated border border-bsm-border flex items-center justify-center">
                <span className="font-display text-2xl text-gold">{dealer.name?.[0]}</span>
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl font-light mb-1">{dealer.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-bsm-text-muted">
                {dealer.location_city && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{dealer.location_city}</span>
                )}
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{dealer.profile?.email}</span>
                {dealer.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{dealer.phone}</span>
                )}
                {dealer.website_url && (
                  <a href={dealer.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gold">
                    <Globe className="w-3.5 h-3.5" />Web
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`badge text-[10px] ${dealer.status === 'active' ? 'badge-active' : dealer.status === 'pending' ? 'badge-pending' : 'badge-muted'}`}>
                  {DEALER_STATUS_LABELS[dealer.status as keyof typeof DEALER_STATUS_LABELS] || dealer.status}
                </span>
                <span className="badge badge-muted text-[10px] capitalize">{dealer.subscription_plan || 'trial'}</span>
                {dealer.is_featured && <span className="badge badge-gold text-[10px]">Destacado</span>}
                <Link href={`/dealers/${dealer.slug}`} target="_blank" className="text-xs text-gold hover:text-gold-light">
                  Ver perfil público →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6">
            {[
              { icon: Car, value: vehicleCount || 0, label: 'Vehículos' },
              { icon: Eye, value: totalViews, label: 'Vistas totales' },
              { icon: MessageSquare, value: leadCount || 0, label: 'Leads' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-bsm-text-muted mb-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="font-display text-2xl font-light">{formatNumber(value)}</div>
                <div className="text-[10px] text-bsm-text-muted uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Controls */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-surface border border-bsm-border p-5">
            <h3 className="text-sm font-medium mb-4 uppercase tracking-wide text-bsm-text-muted">Estado de cuenta</h3>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => (
                <form key={opt.value} action={setDealerStatus.bind(null, id, opt.value)}>
                  <button
                    type="submit"
                    className={`w-full text-left text-sm px-3 py-2 border transition-colors
                      ${dealer.status === opt.value
                        ? 'border-gold text-gold bg-gold/5'
                        : 'border-bsm-border text-bsm-text-secondary hover:border-bsm-border-light'}`}
                  >
                    {opt.label}
                  </button>
                </form>
              ))}
            </div>
          </div>

          {/* Plan */}
          <div className="bg-surface border border-bsm-border p-5">
            <h3 className="text-sm font-medium mb-4 uppercase tracking-wide text-bsm-text-muted">Plan de suscripción</h3>
            <div className="space-y-2">
              {PLAN_OPTIONS.map((opt) => (
                <form key={opt.value} action={setDealerPlan.bind(null, id, opt.value)}>
                  <button
                    type="submit"
                    className={`w-full text-left text-sm px-3 py-2 border transition-colors
                      ${dealer.subscription_plan === opt.value || (!dealer.subscription_plan && opt.value === 'trial')
                        ? 'border-gold text-gold bg-gold/5'
                        : 'border-bsm-border text-bsm-text-secondary hover:border-bsm-border-light'}`}
                  >
                    {opt.label}
                  </button>
                </form>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-bsm-border text-xs text-bsm-text-muted">
              Slots usados: <span className="text-bsm-text-primary">{activeVehicles} / {dealer.vehicle_slots}</span>
            </div>
          </div>

          {/* Featured */}
          <div className="bg-surface border border-bsm-border p-5">
            <h3 className="text-sm font-medium mb-4 uppercase tracking-wide text-bsm-text-muted">Visibilidad</h3>
            <form action={setDealerFeatured.bind(null, id, !dealer.is_featured)}>
              <button
                type="submit"
                className={`w-full text-sm px-3 py-2 border transition-colors
                  ${dealer.is_featured
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-bsm-border text-bsm-text-secondary hover:border-bsm-border-light'}`}
              >
                {dealer.is_featured ? 'Quitar destacado' : 'Marcar como destacado'}
              </button>
            </form>
            <p className="text-[10px] text-bsm-text-muted mt-2">
              Los concesionarios destacados aparecen en la homepage y en la sección Elite del listado.
            </p>
          </div>

          {/* Info */}
          <div className="bg-surface border border-bsm-border p-5 space-y-3 text-sm">
            <h3 className="text-sm font-medium mb-1 uppercase tracking-wide text-bsm-text-muted">Información</h3>
            <div className="flex justify-between">
              <span className="text-bsm-text-muted">Registrado</span>
              <span className="text-bsm-text-primary">{new Date(dealer.created_at).toLocaleDateString('es-ES')}</span>
            </div>
            {dealer.profile?.email && (
              <div className="flex justify-between">
                <span className="text-bsm-text-muted">Email</span>
                <a href={`mailto:${dealer.profile.email}`} className="text-gold hover:text-gold-light truncate max-w-[160px]">
                  {dealer.profile.email}
                </a>
              </div>
            )}
            {dealer.stripe_customer_id && (
              <div className="flex justify-between">
                <span className="text-bsm-text-muted">Stripe ID</span>
                <span className="text-[11px] text-bsm-text-muted font-mono">{dealer.stripe_customer_id.slice(0, 14)}…</span>
              </div>
            )}
            {dealer.description && (
              <div className="pt-2 border-t border-bsm-border">
                <p className="text-xs text-bsm-text-muted leading-relaxed">{dealer.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Vehicles & Leads */}
        <div className="lg:col-span-2 space-y-8">
          {/* Vehicles */}
          <div className="bg-surface border border-bsm-border">
            <div className="flex items-center justify-between p-5 border-b border-bsm-border">
              <h2 className="font-medium">Inventario ({vehicleCount})</h2>
              <Link href={`/admin/vehiculos?dealer=${id}`} className="text-xs text-gold">
                Ver en vehículos →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bsm-border">
                    {['Vehículo', 'Precio', 'Estado', 'Vistas', 'Fecha'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles?.map((v: any) => (
                    <tr key={v.id} className="table-row">
                      <td className="px-4 py-3">
                        <p className="font-medium text-bsm-text-primary">
                          {v.brand_name} {v.model_name}
                        </p>
                        <p className="text-xs text-bsm-text-muted">{v.year}</p>
                      </td>
                      <td className="px-4 py-3 text-bsm-text-primary">{formatPrice(v.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[10px] ${getVehicleStatusColor(v.status)}`}>
                          {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-bsm-text-muted">{formatNumber(v.views || 0)}</td>
                      <td className="px-4 py-3 text-bsm-text-muted text-xs">{timeAgo(v.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!vehicles || vehicles.length === 0) && (
                <div className="p-8 text-center text-sm text-bsm-text-muted">Sin vehículos publicados</div>
              )}
            </div>
          </div>

          {/* Leads */}
          <div className="bg-surface border border-bsm-border">
            <div className="p-5 border-b border-bsm-border">
              <h2 className="font-medium">Leads recientes ({leadCount})</h2>
            </div>
            <div className="divide-y divide-bsm-border">
              {leads?.map((lead: any) => (
                <div key={lead.id} className="flex items-start justify-between px-5 py-3.5 gap-4">
                  <div>
                    <p className="text-sm font-medium text-bsm-text-primary">{lead.buyer_name}</p>
                    <p className="text-xs text-bsm-text-muted">{lead.buyer_email}</p>
                    {lead.vehicle && (
                      <p className="text-xs text-bsm-text-muted mt-0.5">
                        → {lead.vehicle.brand_name} {lead.vehicle.model_name}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`badge text-[10px] ${lead.status === 'new' ? 'badge-gold' : lead.status === 'closed_won' ? 'badge-active' : 'badge-muted'}`}>
                      {lead.status}
                    </span>
                    <p className="text-[10px] text-bsm-text-muted mt-1">{timeAgo(lead.created_at)}</p>
                  </div>
                </div>
              ))}
              {(!leads || leads.length === 0) && (
                <div className="p-8 text-center text-sm text-bsm-text-muted">Sin leads registrados</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
