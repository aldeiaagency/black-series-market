import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'

export default async function FacturacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select('stripe_customer_id, subscription_plan, subscription_end_at')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) redirect('/registro')

  // Auto-redirect to Stripe portal if customer exists
  if (dealer.stripe_customer_id) {
    let portalUrl: string | null = null
    try {
      const session = await createPortalSession(dealer.stripe_customer_id)
      portalUrl = session.url
    } catch {}

    if (portalUrl) {
      redirect(portalUrl)
    }
  }

  // Fallback: no Stripe customer yet
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Facturación</h1>
        <p className="text-sm text-bsm-text-muted">Gestión de pagos y facturas</p>
      </div>

      <div className="bg-surface border border-bsm-border p-8 text-center">
        <p className="text-sm text-bsm-text-secondary mb-2">
          Aún no tienes una suscripción activa.
        </p>
        <p className="text-xs text-bsm-text-muted mb-6">
          El portal de facturación estará disponible una vez actives tu plan.
        </p>
        <a href="/dashboard/suscripcion" className="btn-gold px-6">
          Activar suscripción
        </a>
      </div>
    </div>
  )
}
