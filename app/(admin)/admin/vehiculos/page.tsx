import { createClient } from '@/lib/supabase/server'
import { VEHICLE_STATUS_LABELS, getVehicleStatusColor, formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminVehiculosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)

  const { data: vehicles, count } = await query

  async function approveVehicle(id: string) {
    'use server'
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = await createAdminClient()
    await supabase.from('vehicles').update({
      status: 'active',
      published_at: new Date().toISOString(),
    }).eq('id', id)
  }

  const STATUS_FILTERS = ['all', 'pending_review', 'active', 'paused', 'sold', 'draft']

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Vehículos</h1>
          <p className="text-sm text-bsm-text-muted">{count} vehículos</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={s === 'all' ? '/admin/vehiculos' : `/admin/vehiculos?status=${s}`}
            className={`text-xs px-3 py-1.5 border transition-colors capitalize
              ${(params.status === s || (!params.status && s === 'all'))
                ? 'border-gold text-gold bg-gold/5'
                : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
          >
            {s === 'all' ? 'Todos' : VEHICLE_STATUS_LABELS[s as keyof typeof VEHICLE_STATUS_LABELS] || s}
          </Link>
        ))}
      </div>

      <div className="bg-surface border border-bsm-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bsm-border">
              {['Foto', 'Vehículo', 'Concesionario', 'Precio', 'Estado', 'Visitas', 'Fecha', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles?.map((v: any) => (
              <tr key={v.id} className="table-row">
                <td className="px-4 py-3">
                  <div className="w-14 h-10 bg-surface-elevated overflow-hidden">
                    {v.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-bsm-text-primary">{v.brand_name} {v.model_name}</p>
                  <p className="text-xs text-bsm-text-muted">{v.year}</p>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dealers/${v.dealer?.slug}`} className="text-xs text-bsm-text-secondary hover:text-gold">
                    {v.dealer?.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-bsm-text-primary text-sm">
                  {formatPrice(v.price, v.currency, v.price_on_request)}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge text-[10px] ${getVehicleStatusColor(v.status)}`}>
                    {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS]}
                  </span>
                </td>
                <td className="px-4 py-3 text-bsm-text-muted">{v.views}</td>
                <td className="px-4 py-3 text-bsm-text-muted text-xs">
                  {new Date(v.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {v.status === 'pending_review' && (
                      <form action={approveVehicle.bind(null, v.id)}>
                        <button type="submit" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                          Aprobar
                        </button>
                      </form>
                    )}
                    {v.status === 'active' && (
                      <Link
                        href={`/${v.vehicle_type === 'car' ? 'coches' : 'motos'}/${v.slug}`}
                        target="_blank"
                        className="text-xs text-gold hover:text-gold-light"
                      >
                        Ver →
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!vehicles || vehicles.length === 0) && (
          <div className="p-12 text-center text-sm text-bsm-text-muted">
            Sin vehículos con este filtro
          </div>
        )}
      </div>
    </div>
  )
}
