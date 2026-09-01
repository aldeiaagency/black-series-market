import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import FreshnessList, { type FreshnessVehicle } from '@/components/dashboard/FreshnessList'
import { Clock, Gauge } from 'lucide-react'

const LIVE_OPPORTUNITY_CAP = 10
const DAYS_ATTENTION_WINDOW = 11 // muestra unidades a 3 días o menos del plazo de 14

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

export default async function EstadoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getDealerAccess(user.id)
  if (!access) redirect('/registro')

  const admin = createAdminClient()

  const [{ data: rawVehicles }, { data: rawHandoffs }, { count: liveCount }] = await Promise.all([
    admin
      .from('vehicles')
      .select('id, brand_name, model_name, year, last_confirmed_at, freshness_auto_paused, status')
      .eq('dealer_id', access.dealerId)
      .in('status', ['active', 'paused']),
    admin
      .from('lead_handoffs')
      .select('id, delivery_confirmed_at, lead:leads(vehicle:vehicles(brand_name, model_name, year))')
      .eq('dealer_id', access.dealerId)
      .not('delivery_confirmed_at', 'is', null)
      .is('acknowledged_at', null),
    admin
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', access.dealerId)
      .in('status', ['new', 'contacted', 'negotiating', 'appointment']),
  ])

  const freshnessVehicles: FreshnessVehicle[] = (rawVehicles ?? [])
    .filter((v) => v.freshness_auto_paused || daysSince(v.last_confirmed_at) >= DAYS_ATTENTION_WINDOW)
    .map((v) => ({
      id: v.id,
      title: [v.brand_name, v.model_name, v.year].filter(Boolean).join(' '),
      last_confirmed_at: v.last_confirmed_at,
      freshness_auto_paused: v.freshness_auto_paused,
      days_since_confirmed: daysSince(v.last_confirmed_at),
    }))
    .sort((a, b) => b.days_since_confirmed - a.days_since_confirmed)

  const pendingAck = (rawHandoffs ?? []).map((h: any) => {
    const vehicle = h.lead?.vehicle
    const title = vehicle ? [vehicle.brand_name, vehicle.model_name, vehicle.year].filter(Boolean).join(' ') : 'una oportunidad'
    const hoursElapsed = Math.floor((Date.now() - new Date(h.delivery_confirmed_at).getTime()) / (1000 * 60 * 60))
    return { id: h.id, title, hoursElapsed }
  }).sort((a, b) => b.hoursElapsed - a.hoursElapsed)

  const live = liveCount ?? 0
  const capacityPct = Math.min(100, Math.round((live / LIVE_OPPORTUNITY_CAP) * 100))

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Estado</h1>
        <p className="text-sm text-bsm-text-muted">Frescura de tu stock, oportunidades pendientes de confirmar y tu capacidad actual.</p>
      </div>

      {/* Densidad / capacidad */}
      <div className="border border-bsm-border bg-surface p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-medium text-bsm-text-primary">Oportunidades vivas</h2>
        </div>
        <p className="text-2xl font-display font-light text-bsm-text-primary mb-2">{live} <span className="text-sm text-bsm-text-muted font-sans">de ~{LIVE_OPPORTUNITY_CAP} recomendadas</span></p>
        <div className="h-1.5 bg-bsm-border w-full">
          <div className="h-full bg-gold" style={{ width: `${capacityPct}%` }} />
        </div>
        {live >= LIVE_OPPORTUNITY_CAP && (
          <p className="text-xs text-bsm-text-muted mt-3">
            Estás en o por encima del volumen recomendado — prioriza cerrar o descartar oportunidades abiertas antes de que sigan entrando más.
          </p>
        )}
      </div>

      {/* SLA de acuse */}
      <div className="border border-bsm-border bg-surface p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-medium text-bsm-text-primary">Pendientes de confirmar recepción</h2>
        </div>
        {pendingAck.length === 0 ? (
          <p className="text-sm text-bsm-text-muted">Sin oportunidades pendientes de acuse.</p>
        ) : (
          <div className="divide-y divide-bsm-border">
            {pendingAck.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-4 py-2.5">
                <p className="text-sm text-bsm-text-primary truncate">{h.title}</p>
                <p className={`text-xs flex-shrink-0 ${h.hoursElapsed > 24 ? 'text-red-400' : 'text-bsm-text-muted'}`}>
                  {h.hoursElapsed > 24 ? `${h.hoursElapsed}h — SLA vencido` : `hace ${h.hoursElapsed}h`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frescura de stock */}
      <div className="border border-bsm-border bg-surface p-6">
        <h2 className="text-sm font-medium text-bsm-text-primary mb-1">Frescura de stock</h2>
        <p className="text-xs text-bsm-text-muted mb-3">Confirma disponibilidad cada 14 días o la unidad se pausa sola.</p>
        <FreshnessList vehicles={freshnessVehicles} />
      </div>
    </div>
  )
}
