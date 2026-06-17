import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import SolicitudesBoard, { type CustomRequest } from '@/components/dashboard/SolicitudesBoard'

export default async function SolicitudesPage() {
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

  const plan      = dealer?.subscription_plan ?? 'essential'
  const hasAccess = plan === 'professional' || plan === 'elite'
  const isElite   = plan === 'elite'

  // ── Upsell para Essential ──────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-light mb-1">A la carta</h1>
          <p className="text-sm text-bsm-text-muted">Solicitudes de búsqueda de compradores</p>
        </div>
        <div className="border border-bsm-border bg-surface p-10 text-center">
          <p className="text-xs text-gold tracking-widest uppercase mb-3">Disponible en Professional y Elite</p>
          <p className="text-sm text-bsm-text-secondary leading-relaxed mb-6 max-w-sm mx-auto">
            Cuando un comprador busca algo que no está publicado en el market, su solicitud
            llega al tablón. Los showrooms Professional y Elite pueden ver estas oportunidades
            y atenderlas antes de que el comprador busque en otro sitio.
          </p>
          <Link href="/dashboard/suscripcion" className="btn-outline px-6 py-2 text-sm">
            Ver planes →
          </Link>
        </div>
      </div>
    )
  }

  // ── Filtro de tiempo: Professional ve sólo peticiones con >24h de antigüedad ─
  const cutoff = isElite
    ? null
    : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  let query = admin
    .from('custom_requests')
    .select('id, name, email, phone, vehicle_type, brand, model, version, budget_text, location, timeframe, financing, trade_in, message, status, created_at')
    .in('status', ['new', 'in_review'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (cutoff) query = query.lte('created_at', cutoff)

  const { data: rawReqs } = await query
  const requests: CustomRequest[] = rawReqs ?? []

  const exclusiveCount = isElite
    ? requests.filter(r => Date.now() - new Date(r.created_at).getTime() < 24 * 60 * 60 * 1000).length
    : 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-display text-3xl font-light mb-1">A la carta</h1>
            <p className="text-sm text-bsm-text-muted">
              {requests.length} solicitud{requests.length !== 1 ? 'es' : ''} activa{requests.length !== 1 ? 's' : ''}
              {isElite && exclusiveCount > 0 && (
                <span className="ml-2 text-[#BFA14A]">
                  · {exclusiveCount} en ventana exclusiva
                </span>
              )}
            </p>
          </div>
          {isElite ? (
            <span className="text-[10px] text-[#BFA14A] border border-[#BFA14A]/30 bg-[#BFA14A]/5 px-3 py-1.5 uppercase tracking-widest flex-shrink-0">
              Acceso anticipado · 24 h
            </span>
          ) : (
            <span className="text-[10px] text-bsm-text-muted border border-bsm-border px-3 py-1.5 uppercase tracking-widest flex-shrink-0">
              Acceso estándar
            </span>
          )}
        </div>

        {/* Banner upsell Elite (solo para Professional) */}
        {!isElite && (
          <div className="border border-bsm-border bg-surface p-4 flex items-center gap-3">
            <div className="w-0.5 h-10 bg-[#BFA14A]/40 flex-shrink-0" />
            <p className="text-xs text-bsm-text-muted leading-relaxed">
              Con el plan <span className="text-bsm-text-secondary">Elite</span> ves las solicitudes{' '}
              <span className="text-bsm-text-secondary">24 horas antes</span> que el resto del market
              — acceso exclusivo a las más recientes mientras están en la mejor ventana de cierre.
            </p>
          </div>
        )}
      </div>

      <SolicitudesBoard requests={requests} isElite={isElite} />
    </div>
  )
}
