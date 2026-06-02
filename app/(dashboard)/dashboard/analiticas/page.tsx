import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatNumber, VEHICLE_STATUS_LABELS } from '@/lib/utils'
import {
  Eye, MessageSquare, Heart, TrendingUp, Car,
  Share2, PhoneCall, Edit, ExternalLink, AlertCircle,
} from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────

function pct(num: number, den: number) {
  if (!den) return '—'
  return `${((num / den) * 100).toFixed(1)}%`
}

function daysAgo(isoDate: string | null | undefined): number {
  if (!isoDate) return 999
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000)
}

function fmtDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_STYLE: Record<string, string> = {
  active:         'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
  paused:         'text-[#C6A64B] border-[#C6A64B]/30',
  sold:           'text-[#9A9A9A] border-[#3A3A3A]',
  pending_review: 'text-blue-400 border-blue-400/30',
  draft:          'text-[#737373] border-[#2A2A2A]',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default async function AnaliticasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id, subscription_plan')
    .eq('profile_id', user.id)
    .single()
  if (!dealer) redirect('/registro')

  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const [{ data: events }, { data: vehicles }] = await Promise.all([
    // Events last 30d for this dealer — include vehicle_id for per-vehicle grouping
    supabase
      .from('analytics_events')
      .select('event_type, vehicle_id')
      .eq('dealer_id', dealer.id)
      .gte('created_at', d30),

    // All vehicles for this dealer (all statuses for full rendimiento view)
    supabase
      .from('vehicles')
      .select('id, brand_name, model_name, year, version, slug, vehicle_type, status, views, leads_count, images, description, published_at, updated_at')
      .eq('dealer_id', dealer.id)
      .order('published_at', { ascending: false }),
  ])

  const evts     = events   || []
  const vehicles_ = vehicles || []

  // ── Global 30d counts ─────────────────────────────────────────────────────
  const totalViews     = evts.filter((e: any) => e.event_type === 'vehicle_view' || e.event_type === 'view').length
  const totalContacts  = evts.filter((e: any) => e.event_type === 'vehicle_contact_submit' || e.event_type === 'contact').length
  const totalSaved     = evts.filter((e: any) => e.event_type === 'vehicle_saved' || e.event_type === 'favorite').length
  const totalWhatsapp  = evts.filter((e: any) => e.event_type === 'vehicle_whatsapp_click').length
  const totalPhone     = evts.filter((e: any) => e.event_type === 'vehicle_phone_click').length
  const activeVehicles = vehicles_.filter((v: any) => v.status === 'active').length

  // ── Per-vehicle event aggregation ─────────────────────────────────────────
  type VStats = { views: number; contacts: number; saved: number; whatsapp: number; phone: number }
  const byVehicle: Record<string, VStats> = {}

  for (const e of evts as any[]) {
    if (!e.vehicle_id) continue
    if (!byVehicle[e.vehicle_id]) byVehicle[e.vehicle_id] = { views: 0, contacts: 0, saved: 0, whatsapp: 0, phone: 0 }
    const s = byVehicle[e.vehicle_id]
    if (e.event_type === 'vehicle_view'            || e.event_type === 'view')    s.views++
    if (e.event_type === 'vehicle_contact_submit'  || e.event_type === 'contact') s.contacts++
    if (e.event_type === 'vehicle_saved'           || e.event_type === 'favorite') s.saved++
    if (e.event_type === 'vehicle_whatsapp_click') s.whatsapp++
    if (e.event_type === 'vehicle_phone_click')    s.phone++
  }

  // ── Sort vehicles: more contacts → more views → most recent ───────────────
  const sortedVehicles = [...vehicles_].sort((a: any, b: any) => {
    const sa = byVehicle[a.id] ?? { contacts: 0, views: 0 }
    const sb = byVehicle[b.id] ?? { contacts: 0, views: 0 }
    if (sb.contacts !== sa.contacts) return sb.contacts - sa.contacts
    if (sb.views    !== sa.views)    return sb.views    - sa.views
    return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
  })

  // ── Insights ──────────────────────────────────────────────────────────────
  type Insight = { vehicleName: string; message: string; type: 'good' | 'warn' | 'info' }
  const insights: Insight[] = []

  for (const v of vehicles_ as any[]) {
    if (v.status !== 'active') continue
    const s = byVehicle[v.id] ?? { views: 0, contacts: 0, saved: 0, whatsapp: 0, phone: 0 }
    const name = `${v.brand_name} ${v.model_name} ${v.year}`
    const age  = daysAgo(v.published_at)

    if (s.contacts >= 1) {
      insights.push({ vehicleName: name, type: 'good',
        message: 'Este vehículo está generando demanda. Mantén disponibilidad y respuesta actualizadas.' })
    } else if (s.views > 8 && s.contacts === 0) {
      insights.push({ vehicleName: name, type: 'warn',
        message: 'Tiene interés, pero pocos contactos. Revisa precio, fotos o descripción.' })
    } else if (s.views <= 3 && age > 7) {
      insights.push({ vehicleName: name, type: 'info',
        message: 'Pocas visitas. Revisa si está publicado correctamente o considera destacarlo.' })
    }

    const hasImages      = v.images?.length > 0
    const hasDescription = v.description?.trim().length > 20
    if (!hasImages || !hasDescription) {
      insights.push({ vehicleName: name, type: 'warn',
        message: 'Completa la ficha para mejorar la confianza del comprador.' })
    }
  }

  // Limit to 5 most actionable — warn first, then good, then info
  const sortedInsights = insights
    .sort((a, b) => {
      const order = { warn: 0, good: 1, info: 2 }
      return order[a.type] - order[b.type]
    })
    .slice(0, 5)

  // ── No vehicles empty state ────────────────────────────────────────────────
  if (vehicles_.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-light mb-1">Rendimiento</h1>
          <p className="text-sm text-bsm-text-muted">Últimos 30 días</p>
        </div>
        <div className="border border-bsm-border bg-surface text-center py-20 px-6 max-w-lg mx-auto">
          <TrendingUp className="w-10 h-10 text-bsm-text-muted mx-auto mb-4" />
          <h2 className="font-display text-xl font-light mb-2">Aún no hay datos suficientes</h2>
          <p className="text-sm text-bsm-text-muted mb-8 leading-relaxed max-w-sm mx-auto">
            Cuando tus vehículos empiecen a recibir visitas y contactos, verás aquí su rendimiento.
          </p>
          <Link href="/dashboard/inventario" className="btn-gold px-6">
            <Car className="w-4 h-4" />
            Ver mis vehículos
          </Link>
        </div>
      </div>
    )
  }

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const KPIS = [
    { label: 'Vistas',            value: formatNumber(totalViews),    icon: Eye,          color: 'text-blue-400',    sub: 'últimos 30 días' },
    { label: 'Contactos',         value: formatNumber(totalContacts), icon: MessageSquare, color: 'text-emerald-400', sub: 'últimos 30 días' },
    { label: 'Guardados',         value: formatNumber(totalSaved),    icon: Heart,         color: 'text-pink-400',    sub: 'últimos 30 días' },
    { label: 'WhatsApp',          value: formatNumber(totalWhatsapp), icon: Share2,        color: 'text-green-400',   sub: 'clics en ficha' },
    { label: 'Teléfono',          value: formatNumber(totalPhone),    icon: PhoneCall,     color: 'text-cyan-400',    sub: 'clics en ficha' },
    { label: 'Vehículos activos', value: activeVehicles,              icon: Car,           color: 'text-gold',        sub: 'publicados ahora' },
    { label: 'Vista → Contacto',  value: pct(totalContacts, totalViews), icon: TrendingUp, color: 'text-amber-400',  sub: 'conversión' },
  ]

  return (
    <div className="p-8 space-y-10">

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-light mb-1">Rendimiento</h1>
        <p className="text-sm text-bsm-text-muted">Últimos 30 días · solo tus vehículos</p>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {KPIS.map((k) => (
          <div key={k.label} className="stat-card">
            <div className={`${k.color} mb-2`}><k.icon className="w-4 h-4" /></div>
            <div className="font-display text-2xl font-light mb-0.5">{k.value}</div>
            <div className="text-[10px] text-bsm-text-muted uppercase tracking-wide leading-tight">{k.label}</div>
            <div className="text-[9px] text-bsm-text-muted mt-0.5 opacity-60">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Insights ─────────────────────────────────────────────────────── */}
      {sortedInsights.length > 0 && (
        <section>
          <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Qué puedes mejorar</h2>
          <div className="space-y-3">
            {sortedInsights.map((ins, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-4 border ${
                  ins.type === 'good'
                    ? 'border-emerald-400/20 bg-emerald-400/5'
                    : ins.type === 'warn'
                      ? 'border-[#C6A64B]/20 bg-[#C6A64B]/5'
                      : 'border-bsm-border bg-surface'
                }`}
              >
                <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  ins.type === 'good' ? 'text-emerald-400' : ins.type === 'warn' ? 'text-[#C6A64B]' : 'text-[#737373]'
                }`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-bsm-text-primary mb-0.5">{ins.vehicleName}</p>
                  <p className="text-xs text-bsm-text-secondary leading-relaxed">{ins.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Rendimiento por vehículo ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest">Rendimiento por vehículo</h2>
          <span className="text-xs text-bsm-text-muted">{sortedVehicles.length} vehículos</span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-surface border border-bsm-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bsm-border text-[10px] text-bsm-text-muted uppercase tracking-widest">
                <th className="text-left px-4 py-3 w-10" />
                <th className="text-left px-4 py-3">Vehículo</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Vistas</th>
                <th className="text-right px-4 py-3">Contactos</th>
                <th className="text-right px-4 py-3">Guardados</th>
                <th className="text-right px-4 py-3">WhatsApp</th>
                <th className="text-left px-4 py-3">Publicado</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {sortedVehicles.map((v: any) => {
                const s = byVehicle[v.id] ?? { views: 0, contacts: 0, saved: 0, whatsapp: 0, phone: 0 }
                const pubPath = v.vehicle_type === 'car' ? 'coches' : 'motos'
                const statusStyle = STATUS_STYLE[v.status] || 'text-bsm-text-muted border-bsm-border'
                return (
                  <tr key={v.id} className="border-b border-bsm-border last:border-0 hover:bg-surface-elevated transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-9 bg-surface-elevated flex-shrink-0 overflow-hidden">
                        {v.images?.[0]?.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-bsm-text-primary">
                        {v.brand_name} {v.model_name} {v.year}
                      </p>
                      {v.version && (
                        <p className="text-xs text-bsm-text-muted">{v.version}</p>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-widest uppercase border font-medium ${statusStyle}`}>
                        {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS] || v.status}
                      </span>
                    </td>
                    {/* Stats */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-bsm-text-primary font-medium">{s.views}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${s.contacts > 0 ? 'text-emerald-400' : 'text-bsm-text-muted'}`}>
                        {s.contacts}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-bsm-text-muted">{s.saved}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-bsm-text-muted">{s.whatsapp + s.phone}</span>
                    </td>
                    {/* Published */}
                    <td className="px-4 py-3 text-xs text-bsm-text-muted whitespace-nowrap">
                      {fmtDate(v.published_at || v.updated_at)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/dashboard/publicar?edit=${v.id}`}
                          className="p-1.5 text-bsm-text-muted hover:text-gold transition-colors"
                          title="Editar vehículo"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        {v.status === 'active' && (
                          <Link
                            href={`/${pubPath}/${v.slug}`}
                            target="_blank"
                            className="p-1.5 text-bsm-text-muted hover:text-gold transition-colors"
                            title="Ver vehículo publicado"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {sortedVehicles.map((v: any) => {
            const s = byVehicle[v.id] ?? { views: 0, contacts: 0, saved: 0, whatsapp: 0, phone: 0 }
            const pubPath = v.vehicle_type === 'car' ? 'coches' : 'motos'
            const statusStyle = STATUS_STYLE[v.status] || 'text-bsm-text-muted border-bsm-border'
            return (
              <div key={v.id} className="bg-surface border border-bsm-border p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-9 bg-surface-elevated flex-shrink-0 overflow-hidden">
                      {v.images?.[0]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-bsm-text-primary truncate">
                        {v.brand_name} {v.model_name} {v.year}
                      </p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 mt-1 text-[9px] tracking-widest uppercase border font-medium ${statusStyle}`}>
                        {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS] || v.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link href={`/dashboard/publicar?edit=${v.id}`} className="p-1.5 text-bsm-text-muted hover:text-gold transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    {v.status === 'active' && (
                      <Link href={`/${pubPath}/${v.slug}`} target="_blank" className="p-1.5 text-bsm-text-muted hover:text-gold transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-bsm-border">
                  {[
                    { label: 'Vistas',    value: s.views,              color: '' },
                    { label: 'Contactos', value: s.contacts,           color: s.contacts > 0 ? 'text-emerald-400' : '' },
                    { label: 'Guardados', value: s.saved,              color: '' },
                    { label: 'WA/Tel',    value: s.whatsapp + s.phone, color: '' },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <p className={`text-base font-medium ${m.color || 'text-bsm-text-primary'}`}>{m.value}</p>
                      <p className="text-[9px] text-bsm-text-muted uppercase tracking-wide mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Upsell si no es elite ─────────────────────────────────────────── */}
      {dealer.subscription_plan !== 'elite' && (
        <div className="bg-gold/5 border border-gold/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-bsm-text-primary mb-1">Más analíticas disponibles en Elite</p>
            <p className="text-sm text-bsm-text-muted">
              Accede a evolución temporal, comparativas de mercado y más métricas por vehículo.
            </p>
          </div>
          <Link href="/dashboard/suscripcion" className="btn-gold flex-shrink-0">
            Actualizar plan
          </Link>
        </div>
      )}
    </div>
  )
}
