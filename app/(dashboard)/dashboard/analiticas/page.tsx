import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationIdForUser, getEntitlements } from '@/lib/entitlements'
import { formatNumber, VEHICLE_STATUS_LABELS } from '@/lib/utils'
import {
  Eye, MessageSquare, Heart, TrendingUp, Car,
  Share2, PhoneCall, Edit, ExternalLink, AlertCircle, Lock,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import type { DailyPoint } from '@/components/dashboard/analytics/EvolutionChart'
import type { PeriodTotals, VehicleStat } from '@/components/dashboard/analytics/ComparativesPanel'

// Client components (recharts requires browser)
const EvolutionChart  = dynamic(() => import('@/components/dashboard/analytics/EvolutionChart'),  { ssr: false })
const ComparativesPanel = dynamic(() => import('@/components/dashboard/analytics/ComparativesPanel'), { ssr: false })

// ── Tier resolution ───────────────────────────────────────────────────────────

type AnalyticsTier = 'basic' | 'advanced' | 'elite'

function resolveTier(features: Record<string, { included: boolean; status: string }>): AnalyticsTier {
  if (features['analytics_extended_compare']?.included && features['analytics_extended_compare']?.status === 'operative') return 'elite'
  if (features['analytics_advanced']?.included            && features['analytics_advanced']?.status            === 'operative') return 'advanced'
  return 'basic'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function fmtShort(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

const STATUS_STYLE: Record<string, string> = {
  active:         'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
  paused:         'text-[#C6A64B] border-[#C6A64B]/30',
  sold:           'text-[#9A9A9A] border-[#3A3A3A]',
  pending_review: 'text-blue-400 border-blue-400/30',
  draft:          'text-[#737373] border-[#2A2A2A]',
}

// ── Upgrade gating block ──────────────────────────────────────────────────────

function UpgradeBanner({ tier, requiredTier }: { tier: AnalyticsTier; requiredTier: 'advanced' | 'elite' }) {
  const label    = requiredTier === 'elite' ? 'Elite' : 'Professional'
  const subtitle = requiredTier === 'elite'
    ? 'Comparativas periodo vs periodo, ranking de vehículos top/bottom y más.'
    : 'Tabla de rendimiento por vehículo, funnel y evolución temporal.'
  return (
    <div className="border border-bsm-border bg-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-80">
      <div className="flex items-start gap-3">
        <Lock className="w-4 h-4 text-bsm-text-muted flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-bsm-text-primary mb-0.5">Disponible en {label}</p>
          <p className="text-xs text-bsm-text-muted">{subtitle}</p>
        </div>
      </div>
      <Link href="/dashboard/suscripcion" className="btn-gold flex-shrink-0 text-sm">
        Ver planes
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AnaliticasPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const params  = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id, profile_id')
    .eq('profile_id', user.id)
    .single()
  if (!dealer) redirect('/registro')

  // ── Server-side entitlement resolution ─────────────────────────────────────
  const orgId = await getOrganizationIdForUser(user.id)
  const ent   = orgId ? await getEntitlements(orgId) : null
  const tier  = resolveTier(ent?.features ?? {})
  const retentionDays = ent?.limits.analyticsRetentionDays ?? 30

  // ── Date range — clamped server-side ───────────────────────────────────────
  const now        = new Date()
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const minAllowed = new Date(todayEnd.getTime() - retentionDays * 24 * 60 * 60 * 1000)

  // Default: last 30 days (regardless of retention — Essential can see up to 30d, others can select more)
  const defaultFrom = new Date(todayEnd.getTime() - 30 * 24 * 60 * 60 * 1000)

  let rangeFrom = params.from ? new Date(params.from + 'T00:00:00') : defaultFrom
  let rangeTo   = params.to   ? new Date(params.to   + 'T23:59:59') : todayEnd

  // Clamp — server enforces regardless of what client sends
  if (rangeFrom < minAllowed) rangeFrom = minAllowed
  if (rangeTo   > todayEnd)   rangeTo   = todayEnd
  if (rangeFrom > rangeTo)    rangeFrom = rangeTo

  const rangeFromISO = rangeFrom.toISOString()
  const rangeToISO   = rangeTo.toISOString()

  // ── Fetch: current period events + vehicles ─────────────────────────────────
  const [{ data: events }, { data: vehicles }] = await Promise.all([
    supabase
      .from('analytics_events')
      .select('event_type, vehicle_id')
      .eq('dealer_id', dealer.id)
      .gte('created_at', rangeFromISO)
      .lte('created_at', rangeToISO),

    supabase
      .from('vehicles')
      .select('id, brand_name, model_name, year, version, slug, vehicle_type, status, views, leads_count, images, description, published_at, updated_at')
      .eq('dealer_id', dealer.id)
      .order('published_at', { ascending: false }),
  ])

  const evts      = events   || []
  const vehicles_ = vehicles || []

  // ── Global counts ──────────────────────────────────────────────────────────
  const totalViews    = evts.filter((e: any) => e.event_type === 'vehicle_view'           || e.event_type === 'view').length
  const totalContacts = evts.filter((e: any) => e.event_type === 'vehicle_contact_submit' || e.event_type === 'contact').length
  const totalSaved    = evts.filter((e: any) => e.event_type === 'vehicle_saved'          || e.event_type === 'favorite').length
  const totalWhatsapp = evts.filter((e: any) => e.event_type === 'vehicle_whatsapp_click').length
  const totalPhone    = evts.filter((e: any) => e.event_type === 'vehicle_phone_click').length
  const activeVehicles = vehicles_.filter((v: any) => v.status === 'active').length

  // ── Per-vehicle aggregation (Advanced+) ────────────────────────────────────
  type VStats = { views: number; contacts: number; saved: number; whatsapp: number; phone: number }
  const byVehicle: Record<string, VStats> = {}
  for (const e of evts as any[]) {
    if (!e.vehicle_id) continue
    if (!byVehicle[e.vehicle_id]) byVehicle[e.vehicle_id] = { views: 0, contacts: 0, saved: 0, whatsapp: 0, phone: 0 }
    const s = byVehicle[e.vehicle_id]
    if (e.event_type === 'vehicle_view'           || e.event_type === 'view')    s.views++
    if (e.event_type === 'vehicle_contact_submit' || e.event_type === 'contact') s.contacts++
    if (e.event_type === 'vehicle_saved'          || e.event_type === 'favorite') s.saved++
    if (e.event_type === 'vehicle_whatsapp_click') s.whatsapp++
    if (e.event_type === 'vehicle_phone_click')    s.phone++
  }

  const sortedVehicles = [...vehicles_].sort((a: any, b: any) => {
    const sa = byVehicle[a.id] ?? { contacts: 0, views: 0 }
    const sb = byVehicle[b.id] ?? { contacts: 0, views: 0 }
    if (sb.contacts !== sa.contacts) return sb.contacts - sa.contacts
    if (sb.views    !== sa.views)    return sb.views    - sa.views
    return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
  })

  // ── Evolution data (Advanced+) — from analytics_daily rollup ───────────────
  let evolutionData: DailyPoint[] = []
  if (tier === 'advanced' || tier === 'elite') {
    const { data: daily } = await supabase
      .from('analytics_daily')
      .select('date, views, contacts, saved')
      .eq('dealer_id', dealer.id)
      .gte('date', toInputDate(rangeFrom))
      .lte('date', toInputDate(rangeTo))
      .order('date', { ascending: true })
    evolutionData = (daily || []).map((r: any) => ({
      date: r.date,
      views: r.views,
      contacts: r.contacts,
      saved: r.saved,
    }))
  }

  // ── Elite: previous period data ────────────────────────────────────────────
  let previousTotals: PeriodTotals | null = null
  let topVehicles:    VehicleStat[]       = []
  let bottomVehicles: VehicleStat[]       = []

  if (tier === 'elite') {
    const spanMs      = rangeTo.getTime() - rangeFrom.getTime()
    const prevFromISO = new Date(rangeFrom.getTime() - spanMs).toISOString()
    const prevToISO   = rangeFrom.toISOString()

    const { data: prevEvents } = await supabase
      .from('analytics_events')
      .select('event_type')
      .eq('dealer_id', dealer.id)
      .gte('created_at', prevFromISO)
      .lt('created_at',  prevToISO)

    const pe = prevEvents || []
    previousTotals = {
      views:    pe.filter((e: any) => e.event_type === 'vehicle_view'           || e.event_type === 'view').length,
      contacts: pe.filter((e: any) => e.event_type === 'vehicle_contact_submit' || e.event_type === 'contact').length,
      saved:    pe.filter((e: any) => e.event_type === 'vehicle_saved'          || e.event_type === 'favorite').length,
      whatsapp: pe.filter((e: any) => e.event_type === 'vehicle_whatsapp_click').length,
      phone:    pe.filter((e: any) => e.event_type === 'vehicle_phone_click').length,
    }

    // Top 5 by contacts
    topVehicles = sortedVehicles
      .filter((v: any) => (byVehicle[v.id]?.contacts ?? 0) > 0)
      .slice(0, 5)
      .map((v: any) => {
        const s = byVehicle[v.id] ?? { views: 0, contacts: 0 }
        return {
          vehicleId: v.id,
          name: `${v.brand_name} ${v.model_name} ${v.year}`,
          views: s.views,
          contacts: s.contacts,
          convRate: pct(s.contacts, s.views),
        }
      })

    // Bottom 5 active with views but 0 contacts
    bottomVehicles = sortedVehicles
      .filter((v: any) => v.status === 'active' && (byVehicle[v.id]?.views ?? 0) > 0 && (byVehicle[v.id]?.contacts ?? 0) === 0)
      .slice(0, 5)
      .map((v: any) => ({
        vehicleId: v.id,
        name: `${v.brand_name} ${v.model_name} ${v.year}`,
        views: byVehicle[v.id]?.views ?? 0,
        contacts: 0,
        convRate: '0.0%',
      }))
  }

  // ── Insights ──────────────────────────────────────────────────────────────
  type Insight = { vehicleName: string; message: string; type: 'good' | 'warn' | 'info' }
  const insights: Insight[] = []
  for (const v of vehicles_ as any[]) {
    if (v.status !== 'active') continue
    const s    = byVehicle[v.id] ?? { views: 0, contacts: 0, saved: 0, whatsapp: 0, phone: 0 }
    const name = `${v.brand_name} ${v.model_name} ${v.year}`
    const age  = daysAgo(v.published_at)
    if (s.contacts >= 3)
      insights.push({ vehicleName: name, type: 'good', message: `${s.contacts} contactos en el periodo. Alta demanda — responde rápido.` })
    else if (s.contacts >= 1)
      insights.push({ vehicleName: name, type: 'good', message: 'Está generando demanda. Mantén disponibilidad y tiempo de respuesta actualizados.' })
    else if (s.views >= 10 && s.contacts === 0)
      insights.push({ vehicleName: name, type: 'warn', message: `${s.views} visitas sin contacto. Revisa precio, fotos o descripción.` })
    else if (s.views >= 5 && s.views < 10 && s.contacts === 0 && age > 14)
      insights.push({ vehicleName: name, type: 'warn', message: 'Interés moderado sin contactos. Considera ajustar precio o añadir fotos.' })
    else if (s.views <= 3 && age > 10)
      insights.push({ vehicleName: name, type: 'info', message: 'Pocas visitas en más de 10 días. Verifica que esté activo o usa Boost.' })
    if (!v.images?.length || !v.description?.trim())
      insights.push({ vehicleName: name, type: 'warn', message: 'Completa la ficha para mejorar la confianza del comprador.' })
  }
  const sortedInsights = insights
    .sort((a, b) => { const o = { warn: 0, good: 1, info: 2 }; return o[a.type] - o[b.type] })
    .slice(0, 5)

  // ── Previous period label ──────────────────────────────────────────────────
  const spanMs       = rangeTo.getTime() - rangeFrom.getTime()
  const prevFrom     = new Date(rangeFrom.getTime() - spanMs)
  const prevTo       = new Date(rangeFrom.getTime() - 1)
  const currentLabel  = `${fmtShort(rangeFrom)} – ${fmtShort(rangeTo)}`
  const previousLabel = `${fmtShort(prevFrom)} – ${fmtShort(prevTo)}`

  // ── Tier label for header ──────────────────────────────────────────────────
  const tierLabel: Record<AnalyticsTier, string> = {
    basic:    `Essential · ${retentionDays} días`,
    advanced: `Professional · ${retentionDays} días`,
    elite:    `Elite · ${retentionDays} días`,
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (vehicles_.length === 0) {
    return (
      <div className="p-8">
        <h1 className="font-display text-3xl font-light mb-1">Rendimiento</h1>
        <p className="text-sm text-bsm-text-muted mb-8">Sin vehículos publicados</p>
        <div className="border border-bsm-border bg-surface text-center py-20 px-6 max-w-lg mx-auto">
          <TrendingUp className="w-10 h-10 text-bsm-text-muted mx-auto mb-4" />
          <h2 className="font-display text-xl font-light mb-2">Aún no hay datos</h2>
          <p className="text-sm text-bsm-text-muted mb-8 leading-relaxed max-w-sm mx-auto">
            Cuando tus vehículos reciban visitas y contactos, verás aquí su rendimiento.
          </p>
          <Link href="/dashboard/inventario" className="btn-gold px-6">
            <Car className="w-4 h-4" />
            Ver inventario
          </Link>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 space-y-10">

      {/* ── Header + Date range selector ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Rendimiento</h1>
          <p className="text-xs text-bsm-text-muted">{tierLabel[tier]}</p>
        </div>

        {/* Date range form (GET → same page, server clamps the values) */}
        <form method="GET" action="/dashboard/analiticas"
          className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-bsm-text-muted">Desde</label>
          <input
            type="date"
            name="from"
            defaultValue={toInputDate(rangeFrom)}
            min={toInputDate(minAllowed)}
            max={toInputDate(rangeTo)}
            className="input-base text-xs py-1 px-2 h-8 w-36"
          />
          <label className="text-xs text-bsm-text-muted">Hasta</label>
          <input
            type="date"
            name="to"
            defaultValue={toInputDate(rangeTo)}
            min={toInputDate(minAllowed)}
            max={toInputDate(todayEnd)}
            className="input-base text-xs py-1 px-2 h-8 w-36"
          />
          <button type="submit"
            className="h-8 px-3 text-xs border border-bsm-border text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-colors">
            Aplicar
          </button>
        </form>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 px-4 py-3 border border-bsm-border bg-surface text-[11px] text-bsm-text-muted">
        <span className="mt-0.5 flex-shrink-0">ℹ</span>
        Datos del periodo {currentLabel}. Los datos se actualizan en tiempo real.
        {tier === 'basic' && ' El plan Essential incluye hasta 30 días de historial.'}
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {[
          { label: 'Vistas',            value: formatNumber(totalViews),    icon: Eye,           color: 'text-blue-400',    sub: 'período seleccionado' },
          { label: 'Contactos',         value: formatNumber(totalContacts), icon: MessageSquare, color: 'text-emerald-400', sub: 'período seleccionado' },
          { label: 'Guardados',         value: formatNumber(totalSaved),    icon: Heart,          color: 'text-pink-400',    sub: 'período seleccionado' },
          { label: 'WhatsApp',          value: formatNumber(totalWhatsapp), icon: Share2,         color: 'text-green-400',   sub: 'clics en ficha' },
          { label: 'Teléfono',          value: formatNumber(totalPhone),    icon: PhoneCall,      color: 'text-cyan-400',    sub: 'clics en ficha' },
          { label: 'Vehículos activos', value: activeVehicles,              icon: Car,            color: 'text-gold',        sub: 'publicados ahora' },
          { label: 'Vista → Contacto',  value: pct(totalContacts, totalViews), icon: TrendingUp,  color: 'text-amber-400',   sub: 'conversión' },
        ].map((k) => (
          <div key={k.label} className="stat-card">
            <div className={`${k.color} mb-2`}><k.icon className="w-4 h-4" /></div>
            <div className="font-display text-2xl font-light mb-0.5">{k.value}</div>
            <div className="text-[10px] text-bsm-text-muted uppercase tracking-wide leading-tight">{k.label}</div>
            <div className="text-[9px] text-bsm-text-muted mt-0.5 opacity-60">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Insights ─────────────────────────────────────────────────────────── */}
      {sortedInsights.length > 0 && (
        <section>
          <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Recomendaciones</h2>
          <div className="space-y-3">
            {sortedInsights.map((ins, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 border ${
                ins.type === 'good'
                  ? 'border-emerald-400/20 bg-emerald-400/5'
                  : ins.type === 'warn'
                    ? 'border-[#C6A64B]/20 bg-[#C6A64B]/5'
                    : 'border-bsm-border bg-surface'
              }`}>
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

      {/* ── Evolución temporal (Advanced+) ───────────────────────────────────── */}
      {(tier === 'advanced' || tier === 'elite') ? (
        <section>
          <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Evolución temporal</h2>
          <div className="bg-surface border border-bsm-border p-4">
            <EvolutionChart data={evolutionData} />
          </div>
        </section>
      ) : (
        <UpgradeBanner tier={tier} requiredTier="advanced" />
      )}

      {/* ── Funnel (Advanced+) ───────────────────────────────────────────────── */}
      {(tier === 'advanced' || tier === 'elite') && (
        <section>
          <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Funnel</h2>
          <div className="bg-surface border border-bsm-border p-6">
            <div className="flex items-end gap-0 max-w-md">
              {[
                { label: 'Vistas',     value: totalViews,    color: 'bg-blue-500/60',    width: '100%' },
                { label: 'Guardados',  value: totalSaved,    color: 'bg-pink-500/60',    width: totalViews ? `${Math.min(100, (totalSaved / totalViews) * 100)}%` : '0%' },
                { label: 'Contactos',  value: totalContacts, color: 'bg-emerald-500/60', width: totalViews ? `${Math.min(100, (totalContacts / totalViews) * 100)}%` : '0%' },
                { label: 'WA/Tel',     value: totalWhatsapp + totalPhone, color: 'bg-green-500/60', width: totalViews ? `${Math.min(100, ((totalWhatsapp + totalPhone) / totalViews) * 100)}%` : '0%' },
              ].map((step) => (
                <div key={step.label} className="flex-1 flex flex-col items-center gap-2 px-1">
                  <span className="text-xs font-medium text-bsm-text-primary">{step.value}</span>
                  <div className={`${step.color} w-full`} style={{ height: 40 }} />
                  <span className="text-[9px] text-bsm-text-muted uppercase tracking-wide text-center leading-tight">{step.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-bsm-text-muted mt-4">
              Conversión vista → contacto: {pct(totalContacts, totalViews)}
            </p>
          </div>
        </section>
      )}

      {/* ── Rendimiento por vehículo (Advanced+) ────────────────────────────── */}
      {(tier === 'advanced' || tier === 'elite') ? (
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
                  <th className="text-right px-4 py-3">Conv.</th>
                  <th className="text-right px-4 py-3">Guardados</th>
                  <th className="text-right px-4 py-3">WA/Tel</th>
                  <th className="text-left px-4 py-3">Publicado</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {sortedVehicles.map((v: any) => {
                  const s = byVehicle[v.id] ?? { views: 0, contacts: 0, saved: 0, whatsapp: 0, phone: 0 }
                  const pubPath = v.vehicle_type === 'car' ? 'coches' : 'motos'
                  return (
                    <tr key={v.id} className="border-b border-bsm-border last:border-0 hover:bg-surface-elevated transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-12 h-9 bg-surface-elevated flex-shrink-0 overflow-hidden">
                          {v.images?.[0]?.url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-bsm-text-primary">{v.brand_name} {v.model_name} {v.year}</p>
                        {v.version && <p className="text-xs text-bsm-text-muted">{v.version}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-widest uppercase border font-medium ${STATUS_STYLE[v.status] || 'text-bsm-text-muted border-bsm-border'}`}>
                          {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS] || v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-bsm-text-primary">{s.views}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${s.contacts > 0 ? 'text-emerald-400' : 'text-bsm-text-muted'}`}>{s.contacts}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-bsm-text-muted">{pct(s.contacts, s.views)}</td>
                      <td className="px-4 py-3 text-right text-sm text-bsm-text-muted">{s.saved}</td>
                      <td className="px-4 py-3 text-right text-sm text-bsm-text-muted">{s.whatsapp + s.phone}</td>
                      <td className="px-4 py-3 text-xs text-bsm-text-muted whitespace-nowrap">{fmtDate(v.published_at || v.updated_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/dashboard/publicar?edit=${v.id}`}
                            className="p-1.5 text-bsm-text-muted hover:text-gold transition-colors" title="Editar">
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          {v.status === 'active' && (
                            <Link href={`/${pubPath}/${v.slug}`} target="_blank"
                              className="p-1.5 text-bsm-text-muted hover:text-gold transition-colors" title="Ver publicado">
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
              return (
                <div key={v.id} className="bg-surface border border-bsm-border p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-9 bg-surface-elevated flex-shrink-0 overflow-hidden">
                        {v.images?.[0]?.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-bsm-text-primary truncate">{v.brand_name} {v.model_name} {v.year}</p>
                        <span className={`inline-flex items-center px-1.5 py-0.5 mt-1 text-[9px] tracking-widest uppercase border font-medium ${STATUS_STYLE[v.status] || 'text-bsm-text-muted border-bsm-border'}`}>
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
      ) : null}

      {/* ── Comparativas Elite ────────────────────────────────────────────────── */}
      {tier === 'elite' && previousTotals ? (
        <section>
          <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Comparativas</h2>
          <ComparativesPanel
            current={{ views: totalViews, contacts: totalContacts, saved: totalSaved, whatsapp: totalWhatsapp, phone: totalPhone }}
            previous={previousTotals}
            currentLabel={currentLabel}
            previousLabel={previousLabel}
            topVehicles={topVehicles}
            bottomVehicles={bottomVehicles}
          />
        </section>
      ) : tier !== 'elite' ? (
        <UpgradeBanner tier={tier} requiredTier="elite" />
      ) : null}

    </div>
  )
}
