import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import {
  VEHICLE_STATUS_LABELS, getVehicleStatusColor,
  FUEL_LABELS, TRANSMISSION_LABELS, DRIVE_LABELS,
  formatPrice, timeAgo,
} from '@/lib/utils'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle, XCircle, AlertTriangle,
  Gauge, Zap, Fuel, Settings2, MapPin, Calendar,
  Eye, MessageSquare, Car, ImageOff,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}

async function approveVehicle(formData: FormData) {
  'use server'
  const id = formData.get('vehicleId') as string
  const { createAdminClient } = await import('@/lib/supabase/server')
  const { notifyN8n } = await import('@/lib/integrations/n8n')
  const supabase = await createAdminClient()
  const { data: updated, error } = await supabase.from('vehicles').update({
    status: 'active',
    published_at: new Date().toISOString(),
  }).eq('id', id).select('id, brand_name, model_name, year, slug, dealer_id').single()

  // El trigger de BD bloquea si el dealer supera su tope de vehículos publicados.
  if (error) {
    if (error.message.includes('VEHICLE_LIMIT_REACHED')) {
      redirect(`/admin/vehiculos/${id}?error=vehicle_limit`)
    }
    redirect(`/admin/vehiculos/${id}?error=approve_failed`)
  }

  let dealerEmail = ''
  if (updated?.dealer_id) {
    const { data: dlr } = await supabase.from('dealers').select('email').eq('id', updated.dealer_id).single()
    dealerEmail = dlr?.email ?? ''
  }

  await notifyN8n('vehicle.approved', {
    entityType: 'vehicle',
    entityId: id,
    dealerId: updated?.dealer_id ?? null,
    vehicleId: id,
    payload: {
      brand: updated?.brand_name,
      model: updated?.model_name,
      year: updated?.year,
      vehicle_title: `${updated?.brand_name ?? ''} ${updated?.model_name ?? ''} ${updated?.year ?? ''}`.trim(),
      vehicle_slug: updated?.slug ?? null,
      dealer_email: dealerEmail,
    },
  })
  redirect(`/admin/vehiculos/${id}`)
}

async function rejectVehicle(formData: FormData) {
  'use server'
  const id     = formData.get('vehicleId') as string
  const reason = formData.get('rejection_reason') as string
  const notes  = formData.get('admin_notes') as string
  const { createAdminClient } = await import('@/lib/supabase/server')
  const { notifyN8n } = await import('@/lib/integrations/n8n')
  const supabase = await createAdminClient()
  const { data: updated } = await supabase.from('vehicles').update({
    status:           'draft',
    rejection_reason: reason || null,
    admin_notes:      notes  || null,
  }).eq('id', id).select('id, brand_name, model_name, year, slug, dealer_id').single()

  let dealerEmail = ''
  if (updated?.dealer_id) {
    const { data: dlr } = await supabase.from('dealers').select('email').eq('id', updated.dealer_id).single()
    dealerEmail = dlr?.email ?? ''
  }

  await notifyN8n('vehicle.rejected', {
    entityType: 'vehicle',
    entityId: id,
    dealerId: updated?.dealer_id ?? null,
    vehicleId: id,
    payload: {
      brand: updated?.brand_name,
      model: updated?.model_name,
      year: updated?.year,
      vehicle_title: `${updated?.brand_name ?? ''} ${updated?.model_name ?? ''} ${updated?.year ?? ''}`.trim(),
      vehicle_slug: updated?.slug ?? null,
      dealer_email: dealerEmail,
      rejection_reason: reason || null,
    },
  })
  redirect(`/admin/vehiculos/${id}`)
}

async function editVehicle(formData: FormData) {
  'use server'
  const id          = formData.get('vehicleId') as string
  const priceRaw    = formData.get('price') as string
  const yearRaw     = formData.get('year') as string
  const mileageRaw  = formData.get('mileage_km') as string
  const supabase    = await createAdminClient()
  await supabase.from('vehicles').update({
    status:      formData.get('status') as string || undefined,
    price:       priceRaw    ? parseFloat(priceRaw)   : null,
    year:        yearRaw     ? parseInt(yearRaw)       : null,
    mileage_km:  mileageRaw  ? parseInt(mileageRaw)   : null,
    admin_notes: (formData.get('admin_notes') as string)?.trim() || null,
  }).eq('id', id)
  revalidatePath(`/admin/vehiculos/${id}`)
  redirect(`/admin/vehiculos/${id}`)
}

export default async function AdminVehicleDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { error: errorFlag } = await searchParams
  const supabase = await createAdminClient()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(id, name, slug, email, phone, location_city, subscription_plan, is_verified)')
    .eq('id', id)
    .single()

  if (!vehicle) notFound()

  const images: { url: string; order: number }[] = vehicle.images || []
  const equipment: string[] = vehicle.equipment || []
  const isPending = vehicle.status === 'pending_review'

  function row(label: string, value: string | number | null | undefined) {
    if (!value && value !== 0) return null
    return (
      <div className="flex justify-between py-2 border-b border-bsm-border/50">
        <span className="text-xs text-bsm-text-muted">{label}</span>
        <span className="text-xs text-bsm-text-primary text-right max-w-[60%]">{value}</span>
      </div>
    )
  }

  // Extract YouTube embed URL from any YouTube link format
  function youtubeEmbedUrl(url: string): string | null {
    try {
      const u = new URL(url)
      let id: string | null = null
      if (u.hostname.includes('youtu.be')) {
        id = u.pathname.slice(1)
      } else if (u.hostname.includes('youtube.com')) {
        id = u.searchParams.get('v')
        if (!id && u.pathname.startsWith('/embed/')) id = u.pathname.split('/embed/')[1]
        if (!id && u.pathname.startsWith('/shorts/')) id = u.pathname.split('/shorts/')[1]
      }
      return id ? `https://www.youtube.com/embed/${id}` : null
    } catch { return null }
  }

  const youtubeEmbed = vehicle.video_url ? youtubeEmbedUrl(vehicle.video_url) : null

  // Health issues
  const issues: string[] = []
  if (images.length === 0) issues.push('Sin fotografías')
  if (!vehicle.description || vehicle.description.trim().length < 20) issues.push('Descripción ausente o demasiado corta')
  if (!vehicle.price && !vehicle.price_on_request) issues.push('Sin precio definido')
  if (images.length < 5) issues.push(`Pocas fotos (${images.length} — recomendado mínimo 5)`)

  return (
    <div className="p-8 max-w-6xl">

      {/* Back */}
      <Link
        href="/admin/vehiculos?status=pending_review"
        className="flex items-center gap-1.5 text-sm text-bsm-text-muted hover:text-gold transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver a cola de revisión
      </Link>

      {/* Error de aprobación */}
      {errorFlag && (
        <div className="flex items-start gap-3 p-4 border border-amber-400/30 bg-amber-400/5 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-400">
            {errorFlag === 'vehicle_limit'
              ? 'No se pudo aprobar: el showroom ha alcanzado el límite de vehículos publicados de su plan. Debe pausar otro vehículo, ampliar con un bloque de inventario o subir de plan antes de publicar este.'
              : 'No se pudo aprobar el vehículo. Inténtalo de nuevo.'}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">
            {vehicle.brand_name} {vehicle.model_name} {vehicle.year}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`badge text-[10px] ${getVehicleStatusColor(vehicle.status)}`}>
              {VEHICLE_STATUS_LABELS[vehicle.status as keyof typeof VEHICLE_STATUS_LABELS] || vehicle.status}
            </span>
            {vehicle.version && (
              <span className="text-sm text-bsm-text-muted">{vehicle.version}</span>
            )}
            {vehicle.vehicle_type === 'motorcycle' && (
              <span className="badge badge-muted text-[10px]">Moto</span>
            )}
            <div className="flex items-center gap-1 text-xs text-bsm-text-muted">
              <Calendar className="w-3 h-3" />
              Enviado {timeAgo(vehicle.created_at)}
            </div>
            <div className="flex items-center gap-1 text-xs text-bsm-text-muted">
              <Eye className="w-3 h-3" />{vehicle.views ?? 0} vistas
            </div>
          </div>
        </div>

        {/* Approval actions — only for pending */}
        {isPending && (
          <div className="flex flex-col gap-3 flex-shrink-0">
            <form action={approveVehicle}>
              <input type="hidden" name="vehicleId" value={id} />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors w-full justify-center"
              >
                <CheckCircle className="w-4 h-4" />
                Aprobar y publicar
              </button>
            </form>
            <form action={rejectVehicle} className="space-y-2">
              <input type="hidden" name="vehicleId" value={id} />
              <textarea
                name="rejection_reason"
                rows={2}
                placeholder="Motivo del rechazo (visible para el vendedor)..."
                className="w-full text-xs bg-surface-elevated border border-bsm-border p-2 text-bsm-text-secondary resize-none focus:outline-none focus:border-red-400/50"
              />
              <textarea
                name="admin_notes"
                rows={2}
                placeholder="Notas internas (solo admin)..."
                className="w-full text-xs bg-surface-elevated border border-bsm-border p-2 text-bsm-text-secondary resize-none focus:outline-none focus:border-gold/50"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 border border-red-400/40 text-red-400 hover:bg-red-400/5 text-sm transition-colors w-full justify-center"
              >
                <XCircle className="w-4 h-4" />
                Rechazar (vuelve a borrador)
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Health warnings */}
      {issues.length > 0 && (
        <div className="mb-6 p-4 border border-amber-400/20 bg-amber-400/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Avisos de calidad</span>
          </div>
          <ul className="space-y-1">
            {issues.map((issue) => (
              <li key={issue} className="text-xs text-bsm-text-muted flex items-center gap-1.5">
                <span className="text-amber-400/60">·</span> {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Previous rejection reason */}
      {vehicle.rejection_reason && (
        <div className="mb-6 p-4 border border-red-400/20 bg-red-400/5">
          <p className="text-xs text-red-400 font-medium mb-1">Motivo de rechazo anterior:</p>
          <p className="text-xs text-bsm-text-muted">{vehicle.rejection_reason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Images + description */}
        <div className="lg:col-span-2 space-y-6">

          {/* Image gallery */}
          <div className="bg-surface border border-bsm-border">
            <div className="p-4 border-b border-bsm-border text-sm font-medium flex items-center justify-between">
              <span>Fotografías ({images.length})</span>
              {images.length === 0 && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <ImageOff className="w-3 h-3" /> Sin fotos
                </span>
              )}
            </div>
            {images.length > 0 ? (
              <div className="p-4">
                {/* Main image */}
                <div className="w-full aspect-video bg-surface-elevated overflow-hidden mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[0].url}
                    alt={`${vehicle.brand_name} ${vehicle.model_name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="grid grid-cols-6 gap-1.5">
                    {images.slice(1, 13).map((img, i) => (
                      <div key={i} className="aspect-video bg-surface-elevated overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {images.length > 13 && (
                      <div className="aspect-video bg-surface-elevated flex items-center justify-center">
                        <span className="text-[10px] text-bsm-text-muted">+{images.length - 13}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <ImageOff className="w-10 h-10 text-bsm-text-muted/30 mx-auto mb-2" />
                <p className="text-sm text-bsm-text-muted">Sin fotografías</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-surface border border-bsm-border">
            <div className="p-4 border-b border-bsm-border text-sm font-medium">Descripción</div>
            <div className="p-5">
              {vehicle.description ? (
                <p className="text-sm text-bsm-text-secondary leading-relaxed whitespace-pre-wrap">
                  {vehicle.description}
                </p>
              ) : (
                <p className="text-sm text-bsm-text-muted italic">Sin descripción</p>
              )}
            </div>
          </div>

          {/* Equipment */}
          {equipment.length > 0 && (
            <div className="bg-surface border border-bsm-border">
              <div className="p-4 border-b border-bsm-border text-sm font-medium">
                Equipamiento ({equipment.length} extras)
              </div>
              <div className="p-5 grid grid-cols-2 gap-1.5">
                {equipment.map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-bsm-text-secondary">
                    <CheckCircle className="w-3 h-3 text-emerald-400/60 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              {vehicle.equipment_extra && (
                <div className="px-5 pb-4 border-t border-bsm-border pt-3">
                  <p className="text-xs text-bsm-text-muted font-medium mb-1">Extras adicionales:</p>
                  <p className="text-xs text-bsm-text-secondary">{vehicle.equipment_extra}</p>
                </div>
              )}
            </div>
          )}

          {/* Video */}
          {vehicle.video_url && (
            <div className="bg-surface border border-bsm-border">
              <div className="p-4 border-b border-bsm-border text-sm font-medium">Video</div>
              {youtubeEmbed ? (
                <div className="w-full aspect-video">
                  <iframe
                    src={youtubeEmbed}
                    title="Vehicle video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="p-4">
                  <a href={vehicle.video_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-gold hover:text-gold-light break-all">
                    {vehicle.video_url}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Specs + dealer */}
        <div className="space-y-5">

          {/* Price */}
          <div className="bg-surface border border-bsm-border p-5">
            <div className="text-xs text-bsm-text-muted uppercase tracking-wide mb-1">Precio</div>
            <div className="font-display text-3xl font-light text-bsm-text-primary">
              {vehicle.price_on_request ? (
                <span className="text-lg">Bajo consulta</span>
              ) : vehicle.price ? (
                formatPrice(vehicle.price)
              ) : (
                <span className="text-bsm-text-muted text-lg">No definido</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {vehicle.is_negotiable      && <span className="badge badge-muted text-[10px]">Negociable</span>}
              {vehicle.accepts_trade_in   && <span className="badge badge-muted text-[10px]">Acepta cambio</span>}
              {vehicle.financing_available&& <span className="badge badge-muted text-[10px]">Financiación</span>}
              {vehicle.iva_deducible      && <span className="badge badge-muted text-[10px]">IVA ded.</span>}
              {vehicle.has_warranty       && <span className="badge badge-active text-[10px]">Garantía{vehicle.warranty_months ? ` ${vehicle.warranty_months}m` : ''}</span>}
              {vehicle.has_test_drive     && <span className="badge badge-muted text-[10px]">Prueba disp.</span>}
            </div>
          </div>

          {/* Main specs */}
          <div className="bg-surface border border-bsm-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-4 h-4 text-gold/60" />
              <span className="text-xs font-medium uppercase tracking-wide text-bsm-text-muted">Datos principales</span>
            </div>
            <div className="space-y-0">
              {row('Tipo', vehicle.vehicle_type === 'motorcycle' ? 'Moto' : 'Coche')}
              {row('Carrocería', vehicle.body_type)}
              {row('Año', vehicle.year)}
              {row('Kilómetros', vehicle.mileage_km !== null ? `${vehicle.mileage_km?.toLocaleString('es-ES')} km` : null)}
              {row('Condición', vehicle.condition_type)}
              {row('Categoría', vehicle.category)}
              {row('Color exterior', vehicle.color_exterior)}
              {row('Color interior', vehicle.color_interior)}
              {row('Tapicería', vehicle.upholstery)}
              {row('Puertas', vehicle.doors)}
              {row('Plazas', vehicle.seats)}
              {row('Etiqueta DGT', vehicle.dgt_label)}
              {row('Nº propietarios', vehicle.num_owners)}
              {row('Año matriculación', vehicle.registration_year)}
              {row('ITV válida hasta', vehicle.itv_valid_until)}
            </div>
          </div>

          {/* Engine */}
          <div className="bg-surface border border-bsm-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4 text-gold/60" />
              <span className="text-xs font-medium uppercase tracking-wide text-bsm-text-muted">Motor y rendimiento</span>
            </div>
            <div className="space-y-0">
              {row('Combustible', FUEL_LABELS[vehicle.fuel_type as keyof typeof FUEL_LABELS])}
              {row('Transmisión', TRANSMISSION_LABELS[vehicle.transmission as keyof typeof TRANSMISSION_LABELS])}
              {row('Tracción', DRIVE_LABELS[vehicle.drive_type as keyof typeof DRIVE_LABELS])}
              {row('Potencia', vehicle.power_hp ? `${vehicle.power_hp} CV${vehicle.power_kw ? ` / ${vehicle.power_kw} kW` : ''}` : null)}
              {row('Par motor', vehicle.torque_nm ? `${vehicle.torque_nm} Nm` : null)}
              {row('Cilindrada', vehicle.displacement_cc ? `${vehicle.displacement_cc} cc` : null)}
              {row('Cilindros', vehicle.cylinders)}
              {row('Configuración', vehicle.engine_config)}
              {row('0–100 km/h', vehicle.zero_to_hundred ? `${vehicle.zero_to_hundred} s` : null)}
              {row('Vel. máx.', vehicle.top_speed_kmh ? `${vehicle.top_speed_kmh} km/h` : null)}
              {row('Peso', vehicle.weight_kg ? `${vehicle.weight_kg} kg` : null)}
              {vehicle.vehicle_type === 'motorcycle' && row('Carnet requerido', vehicle.license_type)}
            </div>
          </div>

          {/* Documentation */}
          <div className="bg-surface border border-bsm-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="w-4 h-4 text-gold/60" />
              <span className="text-xs font-medium uppercase tracking-wide text-bsm-text-muted">Documentación</span>
            </div>
            <div className="space-y-1.5">
              {[
                { key: 'has_service_history', label: 'Historial de mantenimiento' },
                { key: 'has_carfax',          label: 'Informe Carfax / InfoCoche' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm border flex-shrink-0 ${vehicle[key] ? 'border-emerald-400 bg-emerald-400/20' : 'border-bsm-border'}`}>
                    {vehicle[key] && <CheckCircle className="w-2 h-2 text-emerald-400" />}
                  </div>
                  <span className={`text-xs ${vehicle[key] ? 'text-bsm-text-secondary' : 'text-bsm-text-muted'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Moto electronics */}
          {vehicle.vehicle_type === 'motorcycle' && (
            <div className="bg-surface border border-bsm-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-gold/60" />
                <span className="text-xs font-medium uppercase tracking-wide text-bsm-text-muted">Electrónica</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { key: 'has_abs',                   label: 'ABS' },
                  { key: 'has_traction_control',      label: 'Control de tracción' },
                  { key: 'has_riding_modes',          label: 'Modos de conducción' },
                  { key: 'has_electronic_suspension', label: 'Suspensión electrónica' },
                  { key: 'has_panniers',              label: 'Maletas incluidas' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm border flex-shrink-0 ${vehicle[key] ? 'border-emerald-400 bg-emerald-400/20' : 'border-bsm-border'}`}>
                      {vehicle[key] && <CheckCircle className="w-2 h-2 text-emerald-400" />}
                    </div>
                    <span className={`text-xs ${vehicle[key] ? 'text-bsm-text-secondary' : 'text-bsm-text-muted'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dealer */}
          <div className="bg-surface border border-bsm-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-gold/60" />
              <span className="text-xs font-medium uppercase tracking-wide text-bsm-text-muted">Showroom</span>
            </div>
            {vehicle.dealer ? (
              <div className="space-y-2">
                <Link
                  href={`/admin/dealers/${vehicle.dealer.id}`}
                  className="text-sm font-medium text-gold hover:text-gold-light"
                >
                  {vehicle.dealer.name} →
                </Link>
                <div className="space-y-1 text-xs text-bsm-text-muted">
                  {vehicle.dealer.location_city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{vehicle.dealer.location_city}
                    </div>
                  )}
                  {vehicle.dealer.email && <div>{vehicle.dealer.email}</div>}
                  {vehicle.dealer.phone && <div>{vehicle.dealer.phone}</div>}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="badge badge-muted text-[10px] capitalize">{vehicle.dealer.subscription_plan || 'trial'}</span>
                  {vehicle.dealer.is_verified && <span className="badge badge-active text-[10px]">✓ Verificado</span>}
                </div>
              </div>
            ) : (
              <p className="text-xs text-bsm-text-muted">Sin showroom asociado</p>
            )}
          </div>

          {/* Quick edit */}
          <div className="bg-surface border border-bsm-border p-5">
            <h3 className="text-xs font-medium mb-4 uppercase tracking-wide text-bsm-text-muted">Edición rápida</h3>
            <form action={editVehicle} className="space-y-3">
              <input type="hidden" name="vehicleId" value={id} />
              <div>
                <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Estado</label>
                <select name="status" defaultValue={vehicle.status}
                  className="select-base text-xs mt-1 w-full">
                  <option value="draft">Borrador</option>
                  <option value="pending_review">En revisión</option>
                  <option value="active">Activo</option>
                  <option value="paused">Reservado</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Precio (€)</label>
                <input type="number" name="price" defaultValue={vehicle.price ?? ''}
                  className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Año</label>
                <input type="number" name="year" defaultValue={vehicle.year ?? ''}
                  className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Kilómetros</label>
                <input type="number" name="mileage_km" defaultValue={vehicle.mileage_km ?? ''}
                  className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Notas internas</label>
                <textarea name="admin_notes" rows={2} defaultValue={vehicle.admin_notes ?? ''}
                  className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary p-2 resize-none focus:outline-none focus:border-gold/50 transition-colors" />
              </div>
              <button type="submit"
                className="text-xs px-3 py-1.5 border border-bsm-border text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-colors">
                Guardar cambios
              </button>
            </form>
          </div>


          {/* Location */}
          {vehicle.location_province && (
            <div className="bg-surface border border-bsm-border p-4">
              <div className="flex items-center gap-2 text-xs text-bsm-text-muted">
                <MapPin className="w-3 h-3" />
                {vehicle.location_province}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom approve/reject bar — visible at bottom for long pages */}
      {isPending && (
        <div className="mt-10 pt-6 border-t border-bsm-border flex items-center gap-4">
          <form action={approveVehicle}>
            <input type="hidden" name="vehicleId" value={id} />
            <button type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors">
              <CheckCircle className="w-4 h-4" />
              Aprobar y publicar
            </button>
          </form>
          <Link
            href="/admin/vehiculos?status=pending_review"
            className="text-xs text-bsm-text-muted hover:text-bsm-text-secondary transition-colors"
          >
            Volver a la cola →
          </Link>
        </div>
      )}
    </div>
  )
}
