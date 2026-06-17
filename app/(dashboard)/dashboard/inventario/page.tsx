import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Edit, Eye, Zap } from 'lucide-react'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getEntitlements } from '@/lib/entitlements'
import { getPermissions } from '@/lib/permissions'
import { formatPrice, formatMileage, VEHICLE_STATUS_LABELS, getVehicleStatusColor } from '@/lib/utils'
import BoostButton from '@/components/dashboard/BoostButton'
import VehicleStatusSelector from '@/components/dashboard/VehicleStatusSelector'

export default async function InventarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getDealerAccess(user.id)
  if (!access) redirect('/registro')
  const canEdit = getPermissions(access.role).canEditInventory

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select('id, name, vehicle_slots, subscription_plan')
    .eq('id', access.dealerId)
    .single()

  if (!dealer) redirect('/registro')

  // Límite real del plan (fuente de verdad: entitlements). Fallback al campo legacy.
  const ent = access.orgId ? await getEntitlements(access.orgId) : null
  const vehicleLimit = ent?.limits.maxActiveVehicles ?? dealer.vehicle_slots

  const [{ data: vehicles }, { data: leadsRaw }] = await Promise.all([
    admin
      .from('vehicles')
      .select('*', { count: 'exact' })
      .eq('dealer_id', dealer.id)
      .order('created_at', { ascending: false }),
    // Real contact counts — no stale leads_count column
    admin
      .from('leads')
      .select('vehicle_id')
      .eq('dealer_id', dealer.id),
  ])

  // Build per-vehicle contact map
  const contactsByVehicle: Record<string, number> = {}
  for (const l of leadsRaw ?? []) {
    if (l.vehicle_id) contactsByVehicle[l.vehicle_id] = (contactsByVehicle[l.vehicle_id] ?? 0) + 1
  }

  const activeCount = vehicles?.filter((v) => v.status === 'active').length || 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Inventario</h1>
          <p className="text-sm text-bsm-text-muted">
            {activeCount} activos de {vehicleLimit} disponibles
          </p>
        </div>
        {canEdit && (
          <Link href="/dashboard/publicar" className="btn-gold">
            <PlusCircle className="w-4 h-4" />
            Publicar vehículo
          </Link>
        )}
      </div>

      {/* Vehicles published bar */}
      <div className="mb-8 bg-surface border border-bsm-border p-4">
        <div className="flex items-center justify-between text-xs text-bsm-text-muted mb-2">
          <span>Vehículos publicados</span>
          <span>{activeCount} / {vehicleLimit}</span>
        </div>
        <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-gold transition-all duration-500"
            style={{ width: `${Math.min((activeCount / vehicleLimit) * 100, 100)}%` }}
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
                <th className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">Contactos</th>
                <th className="px-4 py-3 w-36" />
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: any) => {
                const contacts = contactsByVehicle[v.id] ?? 0
                return (
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
                      {canEdit ? (
                        <VehicleStatusSelector vehicleId={v.id} initialStatus={v.status} />
                      ) : (
                        <span className={`badge text-[10px] ${getVehicleStatusColor(v.status)}`}>
                          {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS] ?? v.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-bsm-text-muted">{v.views}</td>
                    <td className="px-4 py-3">
                      <span className={contacts > 0 ? 'text-emerald-400 font-medium' : 'text-bsm-text-muted'}>
                        {contacts}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {canEdit && v.status === 'active' && (
                          <BoostButton
                            vehicleId={v.id}
                            isFeatured={v.is_featured}
                            featuredUntil={v.featured_until}
                          />
                        )}
                        {canEdit && (
                          <Link
                            href={`/dashboard/publicar?edit=${v.id}`}
                            className="p-2 text-bsm-text-muted hover:text-gold transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
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
                        {canEdit && v.status === 'draft' && (
                          <Link
                            href={`/dashboard/publicar?edit=${v.id}`}
                            className="text-[10px] px-2 py-1 border border-gold/40 text-gold hover:bg-gold/5 transition-colors"
                            title="Completar y publicar"
                          >
                            Publicar
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
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
