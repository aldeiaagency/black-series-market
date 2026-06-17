import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import ImportarClient from './ImportarClient'

export default async function ImportarPage() {
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
  const canImportCSV = plan === 'professional' || plan === 'elite'

  if (!canImportCSV) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-light mb-1">Importar vehículos</h1>
          <p className="text-sm text-bsm-text-muted">Carga masiva de inventario por CSV</p>
        </div>
        <div className="border border-bsm-border bg-surface p-10 text-center">
          <p className="text-xs text-gold tracking-widest uppercase mb-3">Disponible en Professional y Elite</p>
          <p className="text-sm text-bsm-text-secondary leading-relaxed mb-6 max-w-sm mx-auto">
            El plan Essential incluye gestión de inventario manual. La importación por CSV
            — para subir o actualizar varios vehículos a la vez — está disponible a partir
            del plan Professional.
          </p>
          <Link href="/dashboard/suscripcion" className="btn-outline px-6 py-2 text-sm">
            Ver planes →
          </Link>
        </div>
      </div>
    )
  }

  return <ImportarClient />
}
