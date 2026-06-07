import { createAdminClient } from '@/lib/supabase/server'
import { VEHICLE_STATUS_LABELS, getVehicleStatusColor, formatPrice } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RejectVehicleButton from '@/components/admin/RejectVehicleButton'
import { AlertTriangle, ImageOff } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ status?: string; dealer?: string }>
}

export default async function AdminVehiculosPage({ searchParams }: PageProps) {
  const params = await searchParams
  // createAdminClient bypasses RLS — needed to see pending_review and non-active vehicles
  const supabase = await createAdminClient()

  let query = supabase
    .from('vehicles')
    .select('*, dealer:dealers(id, name, slug)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)
  if (params.dealer) query = query.eq('dealer_id', params.dealer)

  const { data: vehicles, count } = await query

  async function approveVehicle(id: string) {
    'use server'
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = await createAdminClient()
    await supabase.from('vehicles').update({
      status: 'active',
      published_at: new Date().toISOString(),
    }).eq('id', id)
    redirect('/admin/vehiculos?status=pending_review')
  }

  const STATUS_FILTERS = [
    { key: 'all',            label: 'Todos' },
    { key: 'pending_review', label: 'En revisión' },
    { key: 'active',         label: 'Activos' },
    { key: 'paused',         label: 'Reservados' },
    { key: 'draft',          label: 'Borradores' },
    { key: 'sold',           label: 'Vendidos' },
    { key: 'expired',        label: 'Caducados' },
  ]

  // Health indicators
  function vehicleHealthIssues(v: any): string[] {
    const issues: string[] = []
    if (!v.images || v.images.length === 0) issues.push('sin foto')
    if (!v.description || v.description.trim().length < 20) issues.push('sin desc.')
    if (!v.price && !v.price_on_request) issues.push('sin precio')
    return issues
  }

  const pendingCount = vehicles?.filter((v: any) => v.status === 'pending_review').length ?? 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Vehículos</h1>
          <p className="text-sm text-bsm-text-muted">
            {count} vehículos
            {params.status === 'pending_review' && pendingCount > 0 && (
              <span className="ml-2 text-amber-400">· {pendingCount} pendientes de acción</span>
            )}
            {params.dealer && <span className="ml-2 text-bsm-text-muted">· filtrado por showroom</span>}
          </p>
        </div>
        {params.dealer && (
          <Link href="/admin/vehiculos" className="text-xs text-bsm-text-muted hover:text-gold transition-colors">
            Quitar filtro ×
          </Link>
        )}
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all'
              ? (params.dealer ? `/admin/vehiculos?dealer=${params.dealer}` : '/admin/vehiculos')
              : (params.dealer ? `/admin/vehiculos?status=${f.key}&dealer=${params.dealer}` : `/admin/vehiculos?status=${f.key}`)
            }
            className={`text-xs px-3 py-1.5 border transition-colors
              ${(params.status === f.key || (!params.status && f.key === 'all'))
                ? 'border-gold text-gold bg-gold/5'
                : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-surface border border-bsm-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bsm-border">
              {['Foto', 'Vehículo', 'Showroom', 'Precio', 'Estado', 'Visitas', 'Fecha', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles?.map((v: any) => {
              const issues = vehicleHealthIssues(v)
              return (
                <tr key={v.id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="w-14 h-10 bg-surface-elevated overflow-hidden flex items-center justify-center">
                      {v.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageOff className="w-4 h-4 text-bsm-text-muted opacity-40" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-bsm-text-primary">{v.brand_name} {v.model_name}</p>
                    <p className="text-xs text-bsm-text-muted">{v.year}{v.location_province ? ` · ${v.location_province}` : ''}</p>
                    {issues.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-amber-400/70" />
                        <span className="text-[10px] text-amber-400/70">{issues.join(', ')}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/dealers/${v.dealer?.id}`} className="text-xs text-bsm-text-secondary hover:text-gold">
                      {v.dealer?.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-bsm-text-primary text-sm">
                    {formatPrice(v.price, v.currency, v.price_on_request)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-[10px] ${getVehicleStatusColor(v.status)}`}>
                      {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS] || v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-bsm-text-muted">{v.views ?? 0}</td>
                  <td className="px-4 py-3 text-bsm-text-muted text-xs">
                    {new Date(v.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {v.status === 'pending_review' && (
                        <>
                          <form action={approveVehicle.bind(null, v.id)}>
                            <button type="submit" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                              Aprobar
                            </button>
                          </form>
                          <RejectVehicleButton
                            vehicleId={v.id}
                            vehicleTitle={`${v.brand_name} ${v.model_name} ${v.year}`}
                          />
                        </>
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
                      <Link
                        href={`/admin/dealers/${v.dealer?.id}`}
                        className="text-xs text-bsm-text-muted hover:text-bsm-text-secondary"
                      >
                        Showroom
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {(!vehicles || vehicles.length === 0) && (
          <div className="p-12 text-center text-sm text-bsm-text-muted">
            Sin vehículos con este filtro
          </div>
        )}
      </div>

      {/* Inventory health summary */}
      {vehicles && vehicles.length > 0 && (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Sin foto principal', count: vehicles.filter((v: any) => !v.images || v.images.length === 0).length, color: 'text-amber-400' },
            { label: 'Sin descripción', count: vehicles.filter((v: any) => !v.description || v.description.trim().length < 20).length, color: 'text-amber-400' },
            { label: 'Sin precio definido', count: vehicles.filter((v: any) => !v.price && !v.price_on_request).length, color: 'text-amber-400' },
            { label: 'Pendientes de revisión', count: vehicles.filter((v: any) => v.status === 'pending_review').length, color: 'text-amber-400' },
          ].map((item) => (
            <div key={item.label} className="bg-surface border border-bsm-border p-4">
              <div className={`font-display text-2xl font-light mb-0.5 ${item.count > 0 ? item.color : 'text-emerald-400'}`}>
                {item.count}
              </div>
              <div className="text-xs text-bsm-text-muted">{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
