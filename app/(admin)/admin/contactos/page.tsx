import { createAdminClient } from '@/lib/supabase/server'
import { timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { MessageSquare, ArrowUpRight } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ dealer?: string; status?: string; vehicle?: string }>
}

const LEAD_STATUS_LABEL: Record<string, string> = {
  new:         'Nuevo',
  contacted:   'Contactado',
  negotiating: 'Negociando',
  appointment: 'Cita',
  reserved:    'Reservado',
  closed:      'Cerrado',
  lost:        'Perdido',
  discarded:   'Descartado',
}
const LEAD_STATUS_COLOR: Record<string, string> = {
  new:         'badge-gold',
  contacted:   'badge-muted',
  negotiating: 'badge-muted',
  appointment: 'badge-muted',
  reserved:    'badge-active',
  closed:      'badge-active',
  lost:        'badge-muted',
  discarded:   'badge-muted',
}

export default async function AdminContactosPage({ searchParams }: PageProps) {
  const params = await searchParams
  // createAdminClient bypasses RLS — leads are dealer-scoped by RLS
  const supabase = await createAdminClient()

  let query = supabase
    .from('leads')
    .select(`
      id, buyer_name, buyer_email, buyer_phone, message, status, created_at,
      vehicle:vehicles(id, brand_name, model_name, year, slug, vehicle_type),
      dealer:dealers(id, name, slug)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.dealer)  query = query.eq('dealer_id', params.dealer)
  if (params.status)  query = query.eq('status', params.status)
  if (params.vehicle) query = query.eq('vehicle_id', params.vehicle)

  const { data: leads, count } = await query

  const STATUS_FILTERS = [
    { key: '', label: 'Todos' },
    { key: 'new', label: 'Nuevos' },
    { key: 'contacted', label: 'Contactados' },
    { key: 'negotiating', label: 'Negociando' },
    { key: 'appointment', label: 'Cita' },
    { key: 'reserved', label: 'Reservado' },
    { key: 'closed', label: 'Cerrado' },
    { key: 'lost', label: 'Perdido' },
  ]

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (params.dealer)  p.set('dealer', params.dealer)
    if (params.status)  p.set('status', params.status)
    if (params.vehicle) p.set('vehicle', params.vehicle)
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    const qs = p.toString()
    return qs ? `/admin/contactos?${qs}` : '/admin/contactos'
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Contactos</h1>
          <p className="text-sm text-bsm-text-muted">
            {count ?? 0} contactos totales generados en el marketplace
            {params.dealer && <span className="ml-2 text-bsm-text-muted">· filtrado por showroom</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(params.dealer || params.status || params.vehicle) && (
            <Link href="/admin/contactos" className="text-xs text-bsm-text-muted hover:text-gold transition-colors">
              Quitar filtros ×
            </Link>
          )}
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={buildHref({ status: f.key })}
            className={`text-xs px-3 py-1.5 border transition-colors
              ${(params.status === f.key || (!params.status && f.key === ''))
                ? 'border-gold text-gold bg-gold/5'
                : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-bsm-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bsm-border">
              {['Contacto', 'Vehículo', 'Showroom', 'Mensaje', 'Estado', 'Fecha'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads?.map((lead: any) => (
              <tr key={lead.id} className="table-row">
                <td className="px-4 py-3">
                  <p className="font-medium text-bsm-text-primary">{lead.buyer_name}</p>
                  <p className="text-xs text-bsm-text-muted">{lead.buyer_email}</p>
                  {lead.buyer_phone && (
                    <p className="text-xs text-bsm-text-muted">{lead.buyer_phone}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {lead.vehicle ? (
                    <div>
                      <p className="text-xs text-bsm-text-primary">
                        {lead.vehicle.brand_name} {lead.vehicle.model_name}
                      </p>
                      <p className="text-[10px] text-bsm-text-muted">{lead.vehicle.year}</p>
                      {lead.vehicle.slug && (
                        <Link
                          href={`/${lead.vehicle.vehicle_type === 'car' ? 'coches' : 'motos'}/${lead.vehicle.slug}`}
                          target="_blank"
                          className="text-[10px] text-gold hover:text-gold-light flex items-center gap-0.5 mt-0.5"
                        >
                          Ver <ArrowUpRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-bsm-text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {lead.dealer ? (
                    <Link href={`/admin/dealers/${lead.dealer.id}`} className="text-xs text-bsm-text-secondary hover:text-gold">
                      {lead.dealer.name}
                    </Link>
                  ) : (
                    <span className="text-xs text-bsm-text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  {lead.message ? (
                    <p className="text-xs text-bsm-text-muted truncate" title={lead.message}>
                      {lead.message.slice(0, 80)}{lead.message.length > 80 ? '…' : ''}
                    </p>
                  ) : (
                    <span className="text-xs text-bsm-text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge text-[10px] ${LEAD_STATUS_COLOR[lead.status] || 'badge-muted'}`}>
                    {LEAD_STATUS_LABEL[lead.status] || lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-bsm-text-muted">
                  {timeAgo(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!leads || leads.length === 0) && (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 text-bsm-text-muted/30 mx-auto mb-3" />
            <p className="text-sm text-bsm-text-muted">Sin contactos con este filtro</p>
          </div>
        )}
      </div>
    </div>
  )
}
