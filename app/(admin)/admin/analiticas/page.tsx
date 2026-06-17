import { createAdminClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/utils'
import {
  Eye, MessageSquare, Heart, Bell, Car, Users, TrendingUp,
  ArrowRight, PhoneCall, Share2, CreditCard, Zap,
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
  // createAdminClient bypasses RLS — required to read cross-dealer metrics.
  const supabase = createAdminClient()

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
    { count: _viewsExtra },           // 14th existing query — result unused
    { data: activeAlertsList },
    { data: openRequestsList },
    { count: activeBoosts },
  ] = await Promise.all([
    // Overview counts
    supabase.from('analytics_events').select('*', { count: 'exact', head: true })
      .in('event_type', ['vehicle_view', 'view']).gte('created_at', d30),

    supabase.from('analytics_events').select('*', { count: 'exact', head: true })
      .eq('event_type', 'vehicle_contact_submit').gte('created_at', d30),

    // Real persisted "vehículos a la carta" requests (custom_requests table)
    supabase.from('custom_requests').select('*', { count: 'exact', head: true })
      .gte('created_at', d30),

    // Real persisted search alerts (search_alerts table)
    supabase.from('search_alerts').select('*', { count: 'exact', head: true })
      .gte('created_at', d30),

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

    // Active search alerts for demand signals (brand breakdown)
    supabase.from('search_alerts').select('brand, vehicle_type').eq('is_active', true).limit(500),

    // Open requests for demand signals (brand breakdown)
    supabase.from('custom_requests').select('brand, vehicle_type')
      .in('status', ['new', 'in_review', 'contacted', 'matched']).limit(500),

    // Active boosts count
    supabase.from('boost_activations').select('*', { count: 'exact', head: true })
      .eq('status', 'active').gte('ends_at', new Date().toISOString()),
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

  // MRR from plan distribution
  const PLAN_PRICES: Record<string, number> = { essential: 197, professional: 449, elite: 899, trial: 0 }
  const mrr = Object.entries(planCount).reduce((sum, [plan, cnt]) => sum + cnt * (PLAN_PRICES[plan] || 0), 0)
  const paidDealers = (planCount.essential || 0) + (planCount.professional || 0) + (planCount.elite || 0)

  // Demand signal brand aggregations
  const alertBrands: Record<string, number> = {}
  for (const a of (activeAlertsList || []) as any[]) {
    if (a.brand) alertBrands[a.brand] = (alertBrands[a.brand] || 0) + 1
  }
  const requestBrands: Record<string, number> = {}
  for (const r of (openRequestsList || []) as any[]) {
    if (r.brand) requestBrands[r.brand] = (requestBrands[r.brand] || 0) + 1
  }
  const topAlertBrands   = Object.entries(alertBrands).sort(([, a], [, b]) => b - a).slice(0, 8)
  const topRequestBrands = Object.entries(requestBrands).sort(([, a], [, b]) => b - a).slice(0, 8)
  const totalActiveAlerts   = (activeAlertsList || []).length
  const totalOpenRequests   = (openRequestsList || []).length

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

      {/* ── Ingresos ────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Ingresos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'MRR estimado',  value: `${formatNumber(mrr)}€`,      icon: CreditCard, color: 'text-emerald-400', sub: 'ingresos mensuales estimados' },
            { label: 'ARR estimado',  value: `${formatNumber(mrr * 12)}€`, icon: TrendingUp,  color: 'text-emerald-300', sub: 'proyección anual' },
            { label: 'Boosts activos', value: formatNumber(activeBoosts || 0), icon: Zap, color: 'text-gold', sub: 'activaciones vigentes' },
            { label: 'Dealers de pago', value: formatNumber(paidDealers), icon: Users, color: 'text-blue-400', sub: 'Essential + Pro + Elite' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`${s.color} mb-2`}><s.icon className="w-4 h-4" /></div>
              <div className="font-display text-2xl font-light mb-0.5">{s.value}</div>
              <div className="text-[10px] text-bsm-text-muted uppercase tracking-wide leading-tight">{s.label}</div>
              <div className="text-[9px] text-bsm-text-muted mt-0.5 opacity-60">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

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
                  { key: 'new',         label: 'Nuevos',      color: 'text-gold' },
                  { key: 'contacted',   label: 'Contactados', color: 'text-blue-400' },
                  { key: 'negotiating', label: 'Negociando',  color: 'text-purple-400' },
                  { key: 'appointment', label: 'Cita/visita', color: 'text-cyan-400' },
                  { key: 'reserved',    label: 'Reservado',   color: 'text-[#C6A64B]' },
                  { key: 'closed',      label: 'Cerrado',     color: 'text-emerald-400' },
                  { key: 'lost',        label: 'Perdido',     color: 'text-red-400' },
                  { key: 'discarded',   label: 'Descartado',  color: 'text-bsm-text-muted' },
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

      {/* ── Demanda no satisfecha ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-1">Demanda no satisfecha</h2>
        <p className="text-xs text-bsm-text-muted mb-4">
          Marcas más buscadas en alertas activas ({totalActiveAlerts}) y solicitudes a la carta abiertas ({totalOpenRequests}) — stock que falta en el market.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top alert brands */}
          <div className="bg-surface border border-bsm-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-3.5 h-3.5 text-purple-400" />
              <h3 className="font-medium text-sm">Marcas en alertas activas</h3>
            </div>
            <div className="space-y-3">
              {topAlertBrands.length > 0 ? topAlertBrands.map(([brand, cnt], i) => {
                const max = topAlertBrands[0][1]
                return (
                  <div key={brand}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-bsm-text-muted w-4">{i + 1}</span>
                        <span className="text-sm text-bsm-text-secondary">{brand}</span>
                      </div>
                      <span className="text-sm text-bsm-text-primary">{cnt}</span>
                    </div>
                    <div className="h-1 bg-surface-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400/40 rounded-full" style={{ width: `${(cnt / max) * 100}%` }} />
                    </div>
                  </div>
                )
              }) : <p className="text-sm text-bsm-text-muted">Sin alertas activas con marca especificada</p>}
            </div>
          </div>

          {/* Top request brands */}
          <div className="bg-surface border border-bsm-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <Car className="w-3.5 h-3.5 text-gold" />
              <h3 className="font-medium text-sm">Marcas en solicitudes abiertas</h3>
            </div>
            <div className="space-y-3">
              {topRequestBrands.length > 0 ? topRequestBrands.map(([brand, cnt], i) => {
                const max = topRequestBrands[0][1]
                return (
                  <div key={brand}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-bsm-text-muted w-4">{i + 1}</span>
                        <span className="text-sm text-bsm-text-secondary">{brand}</span>
                      </div>
                      <span className="text-sm text-bsm-text-primary">{cnt}</span>
                    </div>
                    <div className="h-1 bg-surface-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-gold/40 rounded-full" style={{ width: `${(cnt / max) * 100}%` }} />
                    </div>
                  </div>
                )
              }) : <p className="text-sm text-bsm-text-muted">Sin solicitudes abiertas con marca especificada</p>}
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
