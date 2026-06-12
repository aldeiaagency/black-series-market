import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminFoundingPage() {
  const admin = createAdminClient()

  const { data: members } = await admin
    .from('founding_memberships')
    .select(`
      id, plan_slug, conditions_status, granted_at, revoked_at, revocation_reason,
      organization:organizations(id, name, slug)
    `)
    .order('granted_at', { ascending: false })

  const activeCount = (members ?? []).filter((m) => m.conditions_status === 'active').length
  const revokedCount = (members ?? []).filter((m) => m.conditions_status === 'revoked').length
  const remainingSlots = Math.max(0, 20 - activeCount)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Programa Founding</h1>
          <p className="text-sm text-bsm-text-muted">
            {activeCount} activos · {revokedCount} revocados · {remainingSlots} plazas disponibles (de 20)
          </p>
        </div>
        <Link href="/admin/founding/otorgar" className="btn-gold px-5 text-sm">
          Otorgar condición
        </Link>
      </div>

      {/* Capacity indicator */}
      <div className="bg-surface border border-bsm-border p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-bsm-text-muted">Ocupación del programa (máx. 20)</span>
          <span className="text-xs text-bsm-text-primary">{activeCount}/20</span>
        </div>
        <div className="h-1 bg-bsm-border rounded-full">
          <div
            className="h-full bg-gold rounded-full"
            style={{ width: `${Math.min(100, (activeCount / 20) * 100)}%` }}
          />
        </div>
      </div>

      <div className="border border-bsm-border divide-y divide-bsm-border">
        {(members ?? []).length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-bsm-text-muted">
              Aún no hay miembros Founding. Otorga la condición a los primeros concesionarios seleccionados.
            </p>
          </div>
        ) : (
          (members ?? []).map((m) => {
            const org = m.organization as { id: string; name: string; slug: string } | null
            return (
              <div key={m.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm text-bsm-text-primary font-medium truncate">
                      {org?.name ?? 'Organización desvinculada'}
                    </p>
                    <span className={`text-[9px] border px-2 py-0.5 uppercase tracking-widest flex-shrink-0 ${
                      m.conditions_status === 'active'
                        ? 'border-emerald-400/30 text-emerald-400'
                        : 'border-red-400/30 text-red-400'
                    }`}>
                      {m.conditions_status}
                    </span>
                  </div>
                  <p className="text-xs text-bsm-text-muted">
                    Plan: {m.plan_slug} · Otorgado: {new Date(m.granted_at).toLocaleDateString('es-ES')}
                    {m.revoked_at && ` · Revocado: ${new Date(m.revoked_at).toLocaleDateString('es-ES')}`}
                    {m.revocation_reason && ` (${m.revocation_reason})`}
                  </p>
                </div>
                {m.conditions_status === 'active' && (
                  <Link
                    href={`/admin/founding/revocar?id=${m.id}`}
                    className="text-xs text-red-400 hover:underline flex-shrink-0"
                  >
                    Revocar
                  </Link>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
