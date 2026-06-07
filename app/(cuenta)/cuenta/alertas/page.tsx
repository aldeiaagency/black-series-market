import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, Bell, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const metadata = { title: 'Mis alertas — Black Label Market' }

const TIMELINE_LABELS: Record<string, string> = {
  immediate:   'Compra inmediata',
  '1_3_months': '1-3 meses',
  '3_6_months': '3-6 meses',
  exploring:   'Explorando opciones',
}

const TYPE_LABELS: Record<string, string> = {
  car:        'Coche',
  motorcycle: 'Moto',
  any:        'Cualquier tipo',
}

async function deleteAlert(formData: FormData) {
  'use server'
  const alertId = formData.get('alertId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('search_alerts').delete().eq('id', alertId).eq('user_id', user.id)
  revalidatePath('/cuenta/alertas')
}

export default async function CuentaAlertasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: alerts } = await supabase
    .from('search_alerts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const activeAlerts = alerts || []

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Mi cuenta</span>
        </div>
        <h1 className="section-title mb-2">Mis alertas</h1>
        <p className="text-sm text-bsm-text-muted">
          Te avisamos cuando entre una unidad compatible con tu búsqueda
        </p>
      </div>

      {/* Subnav */}
      <div className="flex gap-4 mb-10 border-b border-bsm-border">
        <Link
          href="/cuenta/favoritos"
          className="flex items-center gap-2 pb-3 text-sm text-bsm-text-muted hover:text-bsm-text-primary transition-colors"
        >
          <Heart className="w-3.5 h-3.5" />
          Guardados
        </Link>
        <Link
          href="/cuenta/alertas"
          className="flex items-center gap-2 pb-3 text-sm border-b-2 border-gold text-gold -mb-px"
        >
          <Bell className="w-3.5 h-3.5" />
          Alertas
          {activeAlerts.length > 0 && (
            <span className="text-xs bg-gold/15 text-gold px-1.5 py-0.5 rounded-sm">{activeAlerts.length}</span>
          )}
        </Link>
      </div>

      {/* Content */}
      {activeAlerts.length > 0 ? (
        <div className="space-y-4 max-w-2xl">
          {activeAlerts.map((alert: any) => (
            <div key={alert.id} className="bg-surface border border-bsm-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Summary line */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                    <span className="text-sm font-medium text-bsm-text-primary">
                      {TYPE_LABELS[alert.vehicle_type] || alert.vehicle_type}
                    </span>
                    {alert.brand && (
                      <span className="text-sm text-bsm-text-secondary">{alert.brand}</span>
                    )}
                    {alert.model && (
                      <span className="text-sm text-bsm-text-secondary">{alert.model}</span>
                    )}
                    {alert.budget_max && (
                      <span className="text-xs text-bsm-text-muted border border-bsm-border px-2 py-0.5">
                        Máx. {alert.budget_max}
                      </span>
                    )}
                    {alert.year_min && (
                      <span className="text-xs text-bsm-text-muted border border-bsm-border px-2 py-0.5">
                        Desde {alert.year_min}
                      </span>
                    )}
                  </div>
                  {/* Details */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#808080]">
                    {alert.timeline && (
                      <span>Plazo: {TIMELINE_LABELS[alert.timeline] || alert.timeline}</span>
                    )}
                    {alert.location && <span>Zona: {alert.location}</span>}
                    {alert.km_max && <span>Km máx: {alert.km_max}</span>}
                    <span className="text-[#8A8A8A]">
                      Creada {new Date(alert.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Delete */}
                <form action={deleteAlert}>
                  <input type="hidden" name="alertId" value={alert.id} />
                  <button
                    type="submit"
                    className="p-2 text-[#8A8A8A] hover:text-red-400 transition-colors flex-shrink-0"
                    title="Eliminar alerta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-bsm-border bg-surface max-w-2xl">
          <Bell className="w-12 h-12 text-[#2A2A2A] mx-auto mb-5" />
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-2">
            Sin alertas activas
          </h2>
          <p className="text-sm text-bsm-text-muted mb-8 max-w-xs mx-auto">
            Crea una alerta y te avisamos cuando entre una unidad que encaje con tu búsqueda.
          </p>
          <Link href="/coches" className="btn-gold px-6">
            Explorar y crear alerta
          </Link>
        </div>
      )}
    </div>
  )
}
