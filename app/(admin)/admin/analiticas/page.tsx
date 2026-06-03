import { createClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/utils'
import {
  Eye, MessageSquare, Heart, Bell, Car, Users, TrendingUp,
  ArrowRight, PhoneCall, Share2,
} from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────────────────────

function pct(num: number, den: number) {
  if (!den) return '—'
  return `${((num / den) * 100).toFixed(1)}%`
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const item of arr) {
    const k = key(item)
    out[k] = (out[k] || 0) + 1
  }
  return out
}

// ── component ─────────────────────────────────────────────────────────────────

export default async function AdminAnaliticasPage() {
  const supabase = await createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const d30 = thirtyDaysAgo.toISOString()

  // ── Parallel fetches ─────────────────────────────────────────────────────
  const [
    { count: views30d },
    { count: contacts30d },
    { count: requests30d },
    { count: alerts30d },
    { count: saved30d },
    { count: totalLeads30d },
    { count: newDealers30d },
    { data: allEvents30d },         // all events for grouping (vehicle/dealer)
    { data: topVehicles },
    { data: allVehicles },          // for brand/model aggregation
    { data: allDealers },
    { data: leadsByStatus },
    { data: planDistribution },
  ] = await Promise.all([
    // Overview counts
    supabase.from('analytics_events').select('*', { count: 'exact', head: true })
      .in('event_type', ['vehicle_view', 'view']).gte('created_at', d30),

    supabase.from('analytics_events').select('*', { count: 'exact', head: true })
      .eq('event_type', 'vehicle_contact_submit').gte('created_at', d30),

    supabase.from('analytics_events').select('*', { count: 'exact', head: true })
      .eq('event_type', 'vehicle_request_submit').gte('created_at', d30),

    supabase.from('analytics_events').select('*', { count: 'exact', head: true })
      .eq('event_type', 'search_alert_created').gte('created_at', d30),

    supabase.from('analytics_events').select('*', { count: 'exact', head: true })
      .eq('event_type', 'vehicle_saved').gte('created_at', d30),

    // Legacy metrics
    supabase.from('leads').select('*', { count: 'exact', head: true })
      .gte('created_at', d30),

    supabase.from('dealers').select('*', { count: 'exact', head: true })
      .gte('created_at', d30),

    // All events 30d for grouping by vehicle/dealer
    supabase.from('analytics_events')
      .select('event_type, vehicle_id, dealer_id')
      .gte('created_at', d30)
      .limit(2000),

    // Top vehicles by views (denormalized counter)
    supabase.from('vehicles')
      .select('id, brand_name, model_name, year, views, slug, vehicle_type, dealer:dealers(name)')
      .eq('status', 'active')
      .order('views', { ascending: false })
      .limit(10),

    // All active vehicles for brand/model analysis
    supabase.from('vehicles')
      .select('brand_name, model_name, views, vehicle_type')
      .eq('status', 'active'),

    // All dealers for name lookup
    supabase.from('dealers')
      .select('id, name, location_city, subscription_plan')
      .eq('status', 'active'),

    // Lead status breakdown
    supabase.from('leads').select('status'),

    // Plan distribution
    supabase.from('dealers').select('subscription_plan').eq('status', 'active'),

    // Total views in 30 days — matches event_type inserted by vehicle detail pages
    supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'view')
      .gte('created_at', d30),
  ])

  // ── Aggregations from events ────────────────────────────────────────────
  const events = allEvents30d || []
  const dealerMap = Object.fromEntries((allDealers || []).map((d: any) => [d.id, d]))

  // Group events by vehicle_id for specific event types
  const contactsByVehicle = groupBy(
    events.filter((e: any) => e.event_type === 'vehicle_contact_submit' && e.vehicle_id),
    (e: any) => e.vehicle_id
  )
  const savedByVehicle = groupBy(
    events.filter((e: any) => e.event_type === 'vehicle_saved' && e.vehicle_id),
    (e: any) => e.vehicle_id
  )
  const waByVehicle = groupBy(
    events.filter((e: any) => e.event_type === 'vehicle_whatsapp_click' && e.vehicle_id),
    (e: any) => e.vehicle_id
  )

  // Group by dealer_id
  const contactsByDealer = groupBy(
    events.filter((e: any) =>
      ['vehicle_contact_submit', 'vehicle_whatsapp_click', 'vehicle_phone_click'].includes(e.event_type)
      && e.dealer_id
    ),
    (e: any) => e.dealer_id
  )
  const profileViewsByDealer = groupBy(
    events.filter((e: any) => e.event_type === 'professional_profile_view' && e.dealer_id),
    (e: any) => e.dealer_id
  )

  // Top 8 vehicles by contacts (vehicle_id → count)
  const topByContacts = Object.entries(contactsByVehicle)
    .sort(([, a], [, b]) => b - a).slice(0, 8)
  const topBySaved = Object.entries(savedByVehicle)
    .sort(([, a], [, b]) => b - a).slice(0, 8)

  // Fetch vehicle details for top-by-contacts and top-by-saved (only if there's data)
  const idsForContacts = topByContacts.map(([id]) => id)
  const idsForSaved    = topBySaved.map(([id]) => id)

  const [{ data: vehiclesByContact }, { data: vehiclesBySaved }] = await Promise.all([
    idsForContacts.length
      ? supabase.from('vehicles').select('id, brand_name, model_name, year, dealer:dealers(name)').in('id', idsForContacts)
      : Promise.resolve({ data: [] }),
    idsForSaved.length
      ? supabase.from('vehicles').select('id, brand_name, model_name, year, dealer:dealers(name)').in('id', idsForSaved)
      : Promise.resolve({ data: [] }),
  ])

  const vcMap = Object.fromEntries((vehiclesByContact || []).map((v: any) => [v.id, v]))
  const vsMap = Object.fromEntries((vehiclesBySaved    || []).map((v: any) => [v.id, v]))

  // Top dealers by contacts and profile views
  const topDealersByContacts = Object.entries(contactsByDealer)
    .sort(([, a], [, b]) => b - a).slice(0, 8)
  const topDealersByProfileViews = Object.entries(profileViewsByDealer)
    .sort(([, a], [, b]) => b - a).slice(0, 8)

  // Brand analysis from vehicles.views
  const brandViews: Record<string, number> = {}
  for (const v of (allVehicles || []) as any[]) {
    if (v.brand_name) brandViews[v.brand_name] = (brandViews[v.brand_name] || 0) + (v.views || 0)
  }
  const topBrands = Object.entries(brandViews).sort(([, a], [, b]) => b - a).slice(0, 8)

  // Lead and plan aggregations
  const leadStatuses: Record<string, number> = {}
  for (const l of (leadsByStatus || []) as any[]) {
    leadStatuses[l.status] = (leadStatuses[l.status] || 0) + 1
  }
  const planCount: Record<string, number> = {}
  for (const d of (planDistribution || []) as any[]) {
    const plan = d.subscription_plan || 'trial'
    planCount[plan] = (planCount[plan] || 0) + 1
  }

  const v30 = views30d    || 0
  const c30 = contacts30d || 0
  const s30 = saved30d    || 0

  const OVERVIEW = [
    { label: 'Vistas (30d)',       value: formatNumber(v30), icon: Eye,          color: 'text-blue-400',    sub: 'fichas de vehículo' },
    { label: 'Contactos (30d)',    value: formatNumber(c30), icon: MessageSquare, color: 'text-emerald-400', sub: 'formularios enviados' },
    { label: 'Solicitudes (30d)',  value: formatNumber(requests30d || 0), icon: Car, color: 'text-gold', sub: 'vehículos a la carta' },
    { label: 'Alertas (30d)',      value: formatNumber(alerts30d || 0), icon: Bell, color: 'text-purple-400', sub: 'alertas creadas' },
    { label: 'Guardados (30d)',    value: formatNumber(s30), icon: Heart,         color: 'text-pink-400',    sub: 'vehículos guardados' },
    { label: 'Leads (30d)',        value: formatNumber(totalLeads30d || 0), icon: TrendingUp, color: 'text-amber-400', sub: 'formulario cualificado' },
    { label: 'Dealers nuevos (30d)', value: formatNumber(newDealers30d || 0), icon: Users, color: 'text-cyan-400', sub: 'registros recientes' },
  ]

  const PLAN_COLORS: Record<string, string> = {
    essential: 'bg-blue-400', professional: 'bg-gold', elite: 'bg-emerald-400', trial: 'bg-[#2A2A2A]',
  }
  const PLAN_LABELS: Record<string, string> = {
    essential: 'Essential', professional: 'Professional', elite: 'Elite', trial: 'Trial',
  }
  const totalDealersActive = planDistribution?.length || 1

  return (
    <div className="p-8 space-y-10">

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-light mb-1">Analíticas del marketplace</h1>
        <p className="text-sm text-bsm-text-muted">Últimos 30 días · datos internos</p>
      </div>

      {/* ── Overview ───────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Resumen 30 días</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {OVERVIEW.map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`${s.color} mb-2`}><s.icon className="w-4 h-4" /></div>
              <div className="font-display text-2xl font-light mb-0.5">{s.value}</div>
              <div className="text-[10px] text-bsm-text-muted uppercase tracking-wide leading-tight">{s.label}</div>
              <div className="text-[9px] text-bsm-text-muted mt-0.5 opacity-60">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Conversión ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Conversión</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Vista → Contacto',  value: pct(c30, v30), icon: ArrowRight,  sub: `${c30} contactos / ${formatNumber(v30)} vistas` },
            { label: 'Vista → Guardado',  value: pct(s30, v30), icon: Heart,       sub: `${s30} guardados / ${formatNumber(v30)} vistas` },
            { label: 'Vista → WhatsApp',  value: pct(events.filter((e: any) => e.event_type === 'vehicle_whatsapp_click').length, v30), icon: Share2, sub: 'clics WhatsApp en ficha' },
            { label: 'Vista → Llamada',   value: pct(events.filter((e: any) => e.event_type === 'vehicle_phone_click').length, v30), icon: PhoneCall, sub: 'clics teléfono en ficha' },
          ].map((s) => (
            <div key={s.label} className="bg-surface border border-bsm-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-4 h-4 text-gold/60" />
                <span className="text-xs text-bsm-text-muted uppercase tracking-widest">{s.label}</span>
              </div>
              <div className="font-display text-3xl font-light text-gold mb-1">{s.value}</div>
              <div className="text-[10px] text-bsm-text-muted">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demanda — marcas más vistas ────────────────────────────────────── */}
      <section>
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Demanda — marcas</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Brands by total views */}
          <div className="bg-surface border border-bsm-border p-6">
            <h3 className="font-medium mb-5 text-sm">Marcas más vistas (acumulado)</h3>
            <div className="space-y-3">
              {topBrands.length > 0 ? topBrands.map(([brand, views], i) => {
                const max = topBrands[0][1]
                return (
                  <div key={brand}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-bsm-text-muted w-4">{i + 1}</span>
                        <span className="text-sm text-bsm-text-secondary">{brand}</span>
                      </div>
                      <span className="text-sm text-bsm-text-primary">{formatNumber(views)}</span>
                    </div>
                    <div className="h-1 bg-surface-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-gold/40 rounded-full" style={{ width: `${(views / max) * 100}%` }} />
                    </div>
                  </div>
                )
              }) : <p className="text-sm text-bsm-text-muted">Sin datos</p>}
            </div>
          </div>

          {/* Lead status + plan distribution */}
          <div className="space-y-6">
            <div className="bg-surface border border-bsm-border p-6">
              <h3 className="font-medium mb-4 text-sm">Estado de leads</h3>
              <div className="space-y-2.5">
                {[
                  { key: 'new',         label: 'Nuevos',       color: 'text-gold' },
                  { key: 'contacted',   label: 'Contactados',  color: 'text-blue-400' },
                  { key: 'qualified',   label: 'Cualificados', color: 'text-emerald-400' },
                  { key: 'closed_won',  label: 'Ganados',      color: 'text-emerald-300' },
                  { key: 'closed_lost', label: 'Perdidos',     color: 'text-red-400' },
                ].map(({ key, label, color }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className={`text-sm ${color}`}>{label}</span>
                    <span className="text-sm text-bsm-text-primary">{formatNumber(leadStatuses[key] || 0)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-bsm-border p-6">
              <h3 className="font-medium mb-4 text-sm">Distribución de planes</h3>
              <div className="space-y-3">
                {Object.entries(planCount).sort(([, a], [, b]) => b - a).map(([plan, count]) => {
                  const pp = Math.round((count / totalDealersActive) * 100)
                  return (
                    <div key={plan}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-bsm-text-secondary">{PLAN_LABELS[plan] || plan}</span>
                        <span className="text-xs text-bsm-text-muted">{count} ({pp}%)</span>
                      </div>
                      <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${PLAN_COLORS[plan] || 'bg-bsm-border'}`} style={{ width: `${pp}%` }} />
                      </div>
                    </div>
                  )
                })}
                {Object.keys(planCount).length === 0 && <p className="text-sm text-bsm-text-muted">Sin datos</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inventario — vehículos ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Inventario — vehículos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top by views */}
          <div className="bg-surface border border-bsm-border">
            <div className="p-4 border-b border-bsm-border flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <h3 className="font-medium text-sm">Más vistos</h3>
            </div>
            <div className="divide-y divide-bsm-border">
              {(topVehicles || []).map((v: any, i: number) => (
                <div key={v.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-bsm-text-muted w-4 flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-bsm-text-primary truncate">{v.brand_name} {v.model_name} {v.year}</p>
                      <p className="text-[10px] text-bsm-text-muted truncate">{v.dealer?.name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-bsm-text-muted flex-shrink-0 ml-2">{formatNumber(v.views || 0)}</span>
                </div>
              ))}
              {!topVehicles?.length && <p className="text-sm text-bsm-text-muted p-6">Sin datos</p>}
            </div>
          </div>

          {/* Top by contacts */}
          <div className="bg-surface border border-bsm-border">
            <div className="p-4 border-b border-bsm-border flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="font-medium text-sm">Más contactados (30d)</h3>
            </div>
            <div className="divide-y divide-bsm-border">
              {topByContacts.length > 0 ? topByContacts.map(([id, count], i) => {
                const v = vcMap[id]
                return (
                  <div key={id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-bsm-text-muted w-4 flex-shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-bsm-text-primary truncate">
                          {v ? `${v.brand_name} ${v.model_name} ${v.year}` : id.slice(0, 8)}
                        </p>
                        <p className="text-[10px] text-bsm-text-muted truncate">{v?.dealer?.name || '—'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-bsm-text-muted flex-shrink-0 ml-2">{count}</span>
                  </div>
                )
              }) : <p className="text-sm text-bsm-text-muted p-6">Sin datos aún</p>}
            </div>
          </div>

          {/* Top by saved */}
          <div className="bg-surface border border-bsm-border">
            <div className="p-4 border-b border-bsm-border flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <h3 className="font-medium text-sm">Más guardados (30d)</h3>
            </div>
            <div className="divide-y divide-bsm-border">
              {topBySaved.length > 0 ? topBySaved.map(([id, count], i) => {
                const v = vsMap[id]
                return (
                  <div key={id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-bsm-text-muted w-4 flex-shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-bsm-text-primary truncate">
                          {v ? `${v.brand_name} ${v.model_name} ${v.year}` : id.slice(0, 8)}
                        </p>
                        <p className="text-[10px] text-bsm-text-muted truncate">{v?.dealer?.name || '—'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-bsm-text-muted flex-shrink-0 ml-2">{count}</span>
                  </div>
                )
              }) : <p className="text-sm text-bsm-text-muted p-6">Sin datos aún</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── Inventario — profesionales ─────────────────────────────────────── */}
      <section>
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Inventario — profesionales</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Dealers by contacts */}
          <div className="bg-surface border border-bsm-border">
            <div className="p-4 border-b border-bsm-border flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="font-medium text-sm">Profesionales con más contactos (30d)</h3>
            </div>
            <div className="divide-y divide-bsm-border">
              {topDealersByContacts.length > 0 ? topDealersByContacts.map(([id, count], i) => {
                const d = dealerMap[id]
                return (
                  <div key={id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-bsm-text-muted w-4 flex-shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-bsm-text-primary truncate">{d?.name || id.slice(0, 8)}</p>
                        <p className="text-[10px] text-bsm-text-muted">{d?.location_city || '—'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-bsm-text-muted flex-shrink-0 ml-2">{count}</span>
                  </div>
                )
              }) : <p className="text-sm text-bsm-text-muted p-6">Sin datos aún</p>}
            </div>
          </div>

          {/* Dealers by profile views */}
          <div className="bg-surface border border-bsm-border">
            <div className="p-4 border-b border-bsm-border flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <h3 className="font-medium text-sm">Profesionales con más vistas de perfil (30d)</h3>
            </div>
            <div className="divide-y divide-bsm-border">
              {topDealersByProfileViews.length > 0 ? topDealersByProfileViews.map(([id, count], i) => {
                const d = dealerMap[id]
                return (
                  <div key={id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-bsm-text-muted w-4 flex-shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-bsm-text-primary truncate">{d?.name || id.slice(0, 8)}</p>
                        <p className="text-[10px] text-bsm-text-muted">{d?.location_city || '—'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-bsm-text-muted flex-shrink-0 ml-2">{count}</span>
                  </div>
                )
              }) : <p className="text-sm text-bsm-text-muted p-6">Sin datos aún</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── Nota sobre schema ─────────────────────────────────────────────── */}
      <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-4 text-[11px] text-[#737373] leading-relaxed">
        <strong className="text-[#9A9A9A]">Nota técnica:</strong> La tabla <code>analytics_events</code> no tiene columna <code>metadata</code> ni <code>user_id</code>.
        Para añadir &quot;filtros más usados&quot; y segmentación por usuario autenticado, ejecuta la migración propuesta:
        <code className="ml-1 text-gold/60">supabase/migrations/005_analytics_metadata.sql</code>
      </div>
    </div>
  )
}
