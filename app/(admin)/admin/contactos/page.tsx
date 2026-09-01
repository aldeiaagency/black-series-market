import { createAdminClient } from '@/lib/supabase/server'
import { timeAgo, formatNumber } from '@/lib/utils'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ dealer?: string; status?: string }>
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Nuevo', contacted: 'Contactado', negotiating: 'Negociando',
  appointment: 'Cita', reserved: 'Reservado', closed: 'Cerrado',
  lost: 'Perdido', discarded: 'Descartado',
}
const STATUS_COLOR: Record<string, string> = {
  new: 'text-gold', contacted: 'text-blue-400', negotiating: 'text-purple-400',
  appointment: 'text-cyan-400', reserved: 'text-gold', closed: 'text-emerald-400',
  lost: 'text-red-400', discarded: 'text-bsm-text-muted',
}

const STATUS_FILTERS = [
  { key: '', label: 'Todos' }, { key: 'new', label: 'Nuevos' },
  { key: 'contacted', label: 'Contactados' }, { key: 'negotiating', label: 'Negociando' },
  { key: 'appointment', label: 'Cita' }, { key: 'closed', label: 'Cerrado' },
  { key: 'lost', label: 'Perdido' },
]

export default async function AdminContactosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createAdminClient()

  let query = supabase
    .from('leads')
    .select('id, status, created_at, dealer_id, dealer:dealers(id, name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(2000)

  if (params.dealer) query = query.eq('dealer_id', params.dealer)
  if (params.status) query = query.eq('status', params.status)

  const { data: leads, count } = await query

  // Aggregate by status
  const byStatus: Record<string, number> = {}
  for (const l of (leads || []) as any[]) {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1
  }

  // Aggregate by dealer (only relevant when no dealer filter)
  const byDealer: Record<string, { name: string; count: number; latest: string }> = {}
  if (!params.dealer) {
    for (const l of (leads || []) as any[]) {
      const did = l.dealer_id
      const dname = l.dealer?.name || did?.slice(0, 8) || '—'
      if (!byDealer[did]) byDealer[did] = { name: dname, count: 0, latest: l.created_at }
      byDealer[did].count++
    }
  }
  const dealerRows = Object.entries(byDealer).sort(([, a], [, b]) => b.count - a.count)

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (params.dealer) p.set('dealer', params.dealer)
    if (params.status) p.set('status', params.status)
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    const qs = p.toString()
    return qs ? `/admin/contactos?${qs}` : '/admin/contactos'
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Contactos</h1>
          <p className="text-sm text-bsm-text-muted">
            {formatNumber(count ?? 0)} leads totales · vista agregada
            {params.dealer && <span className="ml-1">· filtrado por showroom</span>}
          </p>
        </div>
        {(params.dealer || params.status) && (
          <Link href="/admin/contactos" className="text-xs text-bsm-text-muted hover:text-gold transition-colors">
            Quitar filtros ×
          </Link>
        )}
      </div>

      {/* Privacy notice */}
      <div className="border border-bsm-border bg-surface p-4 text-xs text-bsm-text-muted leading-relaxed">
        Los datos de contacto individuales (nombre, email, teléfono, mensaje) son gestionados por cada showroom desde su panel de oportunidades — no están accesibles aquí por política de privacidad RGPD.
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link key={f.key} href={buildHref({ status: f.key })}
            className={`text-xs px-3 py-1.5 border transition-colors ${
              (params.status === f.key || (!params.status && !f.key))
                ? 'border-gold text-gold bg-gold/5'
                : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'
            }`}>
            {f.label} ({f.key ? (byStatus[f.key] ?? 0) : (count ?? 0)})
          </Link>
        ))}
      </div>

      {/* Status breakdown cards */}
      <section>
        <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Distribución por estado</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <Link key={key} href={buildHref({ status: key })}
              className="bg-surface border border-bsm-border p-4 text-center hover:border-gold/20 transition-colors">
              <div className={`font-display text-2xl font-light mb-0.5 ${STATUS_COLOR[key] || ''}`}>
                {formatNumber(byStatus[key] || 0)}
              </div>
              <div className="text-[10px] text-bsm-text-muted">{label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Per-dealer breakdown */}
      {!params.dealer && dealerRows.length > 0 && (
        <section>
          <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Desglose por showroom</h2>
          <div className="bg-surface border border-bsm-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bsm-border">
                  {['Showroom', 'Leads totales', 'Último contacto', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dealerRows.map(([dealerId, { name, count: dc, latest }]) => (
                  <tr key={dealerId} className="table-row">
                    <td className="px-4 py-3">
                      <Link href={`/admin/dealers/${dealerId}`} className="font-medium text-bsm-text-primary hover:text-gold">
                        {name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-bsm-text-secondary">{formatNumber(dc)}</td>
                    <td className="px-4 py-3 text-xs text-bsm-text-muted">{timeAgo(latest)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/contactos?dealer=${dealerId}`} className="text-xs text-gold hover:text-gold-light">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(count ?? 0) === 0 && (
        <div className="border border-bsm-border bg-surface p-12 text-center">
          <MessageSquare className="w-10 h-10 text-bsm-text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-bsm-text-muted">Sin contactos con este filtro</p>
        </div>
      )}
    </div>
  )
}
