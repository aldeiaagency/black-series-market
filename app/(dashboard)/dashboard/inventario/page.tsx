import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Edit, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatMileage } from '@/lib/utils'
import BoostButton from '@/components/dashboard/BoostButton'
import VehicleStatusSelector from '@/components/dashboard/VehicleStatusSelector'

export default async function InventarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id, name, vehicle_slots, subscription_plan')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) redirect('/registro')

  const { data: vehicles, count } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact' })
    .eq('dealer_id', dealer.id)
    .order('created_at', { ascending: false })

  const activeCount = vehicles?.filter((v) => v.status === 'active').length || 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Inventario</h1>
          <p className="text-sm text-bsm-text-muted">
            {activeCount} activos de {dealer.vehicle_slots} disponibles
          </p>
        </div>
        <Link href="/dashboard/publicar" className="btn-gold">
          <PlusCircle className="w-4 h-4" />
          Publicar vehículo
        </Link>
      </div>

      {/* Slots bar */}
      <div className="mb-8 bg-surface border border-bsm-border p-4">
        <div className="flex items-center justify-between text-xs text-bsm-text-muted mb-2">
          <span>Slots usados</span>
          <span>{activeCount} / {dealer.vehicle_slots}</span>
        </div>
        <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-gold transition-all duration-500"
            style={{ width: `${Math.min((activeCount / dealer.vehicle_slots) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Table */}
      {vehicles && vehicles.length > 0 ? (
        <div className="bg-surface border border-bsm-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bsm-border">
                <th className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide w-16">Foto</th>
                <th className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">Vehículo</th>
                <th className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">Precio</th>
                <th className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">Km</th>
                <th className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">Visitas</th>
                <th className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">Leads</th>
                <th className="px-4 py-3 w-32" />
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: any) => (
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
                    <p className="font-medium text-bsm-text-primary">
                      {v.brand_name} {v.model_name}
                    </p>
                    <p className="text-xs text-bsm-text-muted">{v.year}{v.version ? ` · ${v.version}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-bsm-text-primary">
                    {formatPrice(v.price, v.currency, v.price_on_request)}
                  </td>
                  <td className="px-4 py-3 text-bsm-text-muted">
                    {formatMileage(v.mileage_km)}
                  </td>
                  <td className="px-4 py-3">
                    <VehicleStatusSelector vehicleId={v.id} initialStatus={v.status} />
                  </td>
                  <td className="px-4 py-3 text-bsm-text-muted">{v.views}</td>
                  <td className="px-4 py-3 text-bsm-text-muted">{v.leads_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      {v.status === 'active' && (
                        <BoostButton
                          vehicleId={v.id}
                          isFeatured={v.is_featured}
                          featuredUntil={v.featured_until}
                        />
                      )}
                      <Link
                        href={`/dashboard/publicar?edit=${v.id}`}
                        className="p-2 text-bsm-text-muted hover:text-gold transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {v.status === 'active' && (
                        <Link
                          href={`/${v.vehicle_type === 'car' ? 'coches' : 'motos'}/${v.slug}`}
                          target="_blank"
                          className="p-2 text-bsm-text-muted hover:text-gold transition-colors"
                          title="Ver publicado"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-surface border border-bsm-border p-16 text-center">
          <div className="w-16 h-16 border border-bsm-border flex items-center justify-center mx-auto mb-6">
            <PlusCircle className="w-8 h-8 text-bsm-text-muted" />
          </div>
          <h2 className="font-display text-xl font-light mb-2">Sin vehículos</h2>
          <p className="text-sm text-bsm-text-muted mb-6">
            Publica tu primer vehículo y empieza a recibir leads de compradores premium.
          </p>
          <Link href="/dashboard/publicar" className="btn-gold">
            <PlusCircle className="w-4 h-4" />
            Publicar primer vehículo
          </Link>
        </div>
      )}
    </div>
  )
}
