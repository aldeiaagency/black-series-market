import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { normalizeRules, normalizeSettings, DEFAULT_RULES } from '@/lib/booking'
import CitasConfig from './CitasConfig'

export default async function CitasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getDealerAccess(user.id)
  if (!access) redirect('/registro')

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select('subscription_plan')
    .eq('id', access.dealerId)
    .single()

  const plan = dealer?.subscription_plan ?? 'essential'
  const entitled = plan === 'elite' || plan === 'grupo'

  if (!entitled) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-light mb-1">Citas</h1>
          <p className="text-sm text-bsm-text-muted">Reserva de visitas desde el agente de tus fichas</p>
        </div>
        <div className="border border-bsm-border bg-surface p-10 text-center">
          <p className="text-xs text-gold tracking-widest uppercase mb-3">Disponible en Elite</p>
          <p className="text-sm text-bsm-text-secondary leading-relaxed mb-6 max-w-sm mx-auto">
            El agente de cualificación de tu ficha puede, además, proponer y reservar visitas
            según tu disponibilidad. Esta función está incluida en el plan Elite.
          </p>
          <Link href="/dashboard/suscripcion" className="btn-outline px-6 py-2 text-sm">Ver planes →</Link>
        </div>
      </div>
    )
  }

  const { data: conn } = await admin
    .from('showroom_calendar_connections')
    .select('status, availability_rules, booking_settings')
    .eq('dealer_id', access.dealerId)
    .maybeSingle()

  const rules = normalizeRules(conn?.availability_rules ?? DEFAULT_RULES)
  const settings = normalizeSettings(conn?.booking_settings ?? {})
  const enabled = conn?.status === 'connected'

  return <CitasConfig initial={{ enabled, rules, settings }} />
}
