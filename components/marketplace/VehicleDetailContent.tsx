import Link from 'next/link'
import {
  MapPin, Phone, MessageCircle, Shield, CheckCircle, ArrowRight,
  FileText, Clock, Wrench, AlertCircle, ChevronRight, Search,
  Users,
} from 'lucide-react'
import VehicleGallery from '@/components/marketplace/VehicleGallery'
import VehicleCard from '@/components/marketplace/VehicleCard'
import QualifiedLeadForm from '@/components/marketplace/QualifiedLeadForm'
import AssistantWidget from '@/components/marketplace/AssistantWidget'
import FavoriteButton from '@/components/marketplace/FavoriteButton'
import CompareButton from '@/components/marketplace/CompareButton'
import DealerInlineCard from '@/components/marketplace/DealerInlineCard'
import TrackLink from '@/components/marketplace/TrackLink'
import ShareButton from '@/components/social/ShareButton'
import StickyAwareSidebar from '@/components/marketplace/StickyAwareSidebar'
import { formatPrice, formatMileage, FUEL_LABELS, TRANSMISSION_LABELS, DRIVE_LABELS, VEHICLE_CONDITION_LABELS } from '@/lib/utils'
import type { Vehicle } from '@/lib/types'

export type ContactMode = 'classic' | 'assistant'

interface Props {
  vehicle: Vehicle & { dealer: any }
  similarVehicles: (Vehicle & { dealer?: any })[]
  dealerVehicles: (Vehicle & { dealer?: any })[]
  backHref: string
  backLabel: string
  contactMode?: ContactMode
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-light mb-6 pb-4 border-b border-bsm-border">
      {children}
    </h2>
  )
}

function SummaryCell({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="bg-surface border border-bsm-border p-4">
      <div className="text-[11px] text-bsm-text-muted uppercase tracking-widest mb-1.5">{label}</div>
      {value
        ? <div className="text-sm font-medium text-bsm-text-primary">{value}</div>
        : <div className="text-xs text-[#808080] italic">Consultar con el vendedor</div>
      }
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-5 py-3 text-sm border-b border-bsm-border last:border-0">
      <span className="text-bsm-text-muted">{label}</span>
      <span className="text-bsm-text-primary font-medium text-right max-w-[55%]">{value}</span>
    </div>
  )
}

function HistoryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-bsm-border last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-bsm-text-muted">
        <Icon className="w-4 h-4 text-gold/50" />
        {label}
      </div>
      {value
        ? <span className="text-sm text-bsm-text-primary font-medium">{value}</span>
        : <span className="text-xs text-[#808080] italic">Consultar con el vendedor</span>
      }
    </div>
  )
}


const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: 'Disponible', cls: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' },
  paused: { label: 'Reservado',  cls: 'text-[#C6A64B] border-[#C6A64B]/30' },
  sold:   { label: 'Vendido',    cls: 'text-[#9A9A9A] border-[#3A3A3A]' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VehicleDetailContent({
  vehicle,
  similarVehicles,
  dealerVehicles,
  backHref,
  backLabel,
  contactMode = 'classic',
}: Props) {
  const isCar = vehicle.vehicle_type === 'car'
  const title = `${vehicle.brand_name} ${vehicle.model_name}${vehicle.version ? ' ' + vehicle.version : ''}`
  const loc = vehicle.location_province || vehicle.dealer?.location_city || vehicle.registration_country || null
  const statusBadge = STATUS_BADGE[vehicle.status as keyof typeof STATUS_BADGE]
  const vehicleTypeParam: 'car' | 'motorcycle' = isCar ? 'car' : 'motorcycle'
  const vehicleWord = isCar ? 'vehículo' : 'moto'

  // ── Summary specs (always show with "Consultar con el vendedor" fallback) ─────
  const summarySpecs = isCar
    ? [
        { label: 'Año',              value: String(vehicle.year) },
        { label: 'Kilómetros',       value: formatMileage(vehicle.mileage_km) },
        { label: 'Precio',           value: formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request) },
        { label: 'Potencia',         value: vehicle.power_hp ? `${vehicle.power_hp} CV` : null },
        { label: 'Combustible',      value: vehicle.fuel_type ? FUEL_LABELS[vehicle.fuel_type] : null },
        { label: 'Cambio',           value: vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : null },
        { label: 'Carrocería',       value: vehicle.body_type || null },
        { label: 'Tracción',         value: vehicle.drive_type ? DRIVE_LABELS[vehicle.drive_type] : null },
        { label: 'Estado',           value: vehicle.condition_type ? VEHICLE_CONDITION_LABELS[vehicle.condition_type] ?? null : null },
        { label: 'Ubicación',        value: loc },
        { label: 'Garantía',         value: vehicle.has_warranty ? (vehicle.warranty_months ? `${vehicle.warranty_months} meses` : 'Disponible') : null },
        { label: 'Financiación',     value: vehicle.financing_available ? 'Disponible' : null },
        { label: 'Categoría',        value: vehicle.category || null },
      ]
    : [
        { label: 'Año',          value: String(vehicle.year) },
        { label: 'Kilómetros',   value: formatMileage(vehicle.mileage_km) },
        { label: 'Precio',       value: formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request) },
        { label: 'Cilindrada',   value: vehicle.displacement_cc ? `${vehicle.displacement_cc} cc` : null },
        { label: 'Potencia',     value: vehicle.power_hp ? `${vehicle.power_hp} CV` : null },
        { label: 'Carnet',       value: vehicle.license_type || null },
        { label: 'Tipo de moto', value: vehicle.body_type || null },
        { label: 'Ubicación',    value: loc },
        { label: 'Garantía',     value: vehicle.has_warranty ? 'Disponible' : null },
        { label: 'Financiación', value: vehicle.financing_available ? 'Disponible' : null },
        { label: 'Categoría',    value: vehicle.category || null },
      ]

  // ── Technical specs split by vehicle type (only fields with values) ──────
  const technicalSpecs = isCar
    ? [
        vehicle.displacement_cc    && { label: 'Cilindrada',           value: `${vehicle.displacement_cc} cc` },
        vehicle.power_hp           && { label: 'Potencia',             value: `${vehicle.power_hp} CV${vehicle.power_kw ? ` / ${vehicle.power_kw} kW` : ''}` },
        vehicle.torque_nm          && { label: 'Par motor',            value: `${vehicle.torque_nm} Nm` },
        vehicle.cylinders          && { label: 'Cilindros',            value: String(vehicle.cylinders) },
        vehicle.engine_config      && { label: 'Configuración motor',  value: vehicle.engine_config },
        vehicle.zero_to_hundred    && { label: '0-100 km/h',           value: `${vehicle.zero_to_hundred}s` },
        vehicle.top_speed_kmh      && { label: 'Velocidad máxima',     value: `${vehicle.top_speed_kmh} km/h` },
        vehicle.transmission       && { label: 'Transmisión',          value: TRANSMISSION_LABELS[vehicle.transmission] },
        vehicle.drive_type         && { label: 'Tracción',             value: DRIVE_LABELS[vehicle.drive_type] },
        vehicle.body_type          && { label: 'Carrocería',           value: vehicle.body_type },
        vehicle.doors              && { label: 'Puertas',              value: String(vehicle.doors) },
        vehicle.seats              && { label: 'Plazas',               value: String(vehicle.seats) },
        vehicle.weight_kg          && { label: 'Peso',                 value: `${vehicle.weight_kg} kg` },
        vehicle.color_exterior     && { label: 'Color exterior',       value: vehicle.color_exterior },
        vehicle.color_interior     && { label: 'Color interior',       value: vehicle.color_interior },
        vehicle.upholstery         && { label: 'Tapicería',            value: vehicle.upholstery },
        vehicle.dgt_label          && { label: 'Etiqueta DGT',         value: vehicle.dgt_label },
        vehicle.registration_year  && { label: 'Año de matriculación', value: String(vehicle.registration_year) },
        vehicle.registration_country && { label: 'País de origen',     value: vehicle.registration_country },
        vehicle.itv_valid_until    && { label: 'ITV válida hasta',     value: vehicle.itv_valid_until },
      ].filter(Boolean) as { label: string; value: string }[]
    : [
        vehicle.displacement_cc    && { label: 'Cilindrada',                  value: `${vehicle.displacement_cc} cc` },
        vehicle.power_hp           && { label: 'Potencia',                    value: `${vehicle.power_hp} CV${vehicle.power_kw ? ` / ${vehicle.power_kw} kW` : ''}` },
        vehicle.torque_nm          && { label: 'Par motor',                   value: `${vehicle.torque_nm} Nm` },
        vehicle.engine_config      && { label: 'Configuración motor',         value: vehicle.engine_config },
        vehicle.zero_to_hundred    && { label: '0-100 km/h',                  value: `${vehicle.zero_to_hundred}s` },
        vehicle.top_speed_kmh      && { label: 'Velocidad máxima',            value: `${vehicle.top_speed_kmh} km/h` },
        vehicle.transmission       && { label: 'Transmisión',                 value: TRANSMISSION_LABELS[vehicle.transmission] },
        vehicle.weight_kg          && { label: 'Peso',                        value: `${vehicle.weight_kg} kg` },
        vehicle.license_type       && { label: 'Carnet',                      value: vehicle.license_type },
        vehicle.body_type          && { label: 'Tipo de moto',                value: vehicle.body_type },
        vehicle.color_exterior     && { label: 'Color',                       value: vehicle.color_exterior },
        vehicle.has_abs                && { label: 'ABS',                         value: 'Sí' },
        vehicle.has_traction_control   && { label: 'Control de tracción',      value: 'Sí' },
        vehicle.has_riding_modes       && { label: 'Modos de conducción',      value: 'Sí' },
        vehicle.has_electronic_suspension && { label: 'Suspensión electrónica', value: 'Sí' },
        vehicle.has_panniers           && { label: 'Maletas incluidas',        value: 'Sí' },
        vehicle.registration_year  && { label: 'Año de matriculación',        value: String(vehicle.registration_year) },
        vehicle.registration_country && { label: 'País de origen',            value: vehicle.registration_country },
        vehicle.itv_valid_until    && { label: 'ITV válida hasta',            value: vehicle.itv_valid_until },
      ].filter(Boolean) as { label: string; value: string }[]


  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-bsm-text-muted mb-8 flex-wrap">
        <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
        <span className="text-[#666666]">/</span>
        <Link href={backHref} className="hover:text-gold transition-colors">{backLabel}</Link>
        <span className="text-[#666666]">/</span>
        <Link
          href={`${backHref}?marca=${vehicle.brand_name?.toLowerCase().replace(/\s+/g, '-') ?? ''}`}
          className="hover:text-gold transition-colors"
        >
          {vehicle.brand_name}
        </Link>
        <span className="text-[#666666]">/</span>
        <span className="text-bsm-text-secondary truncate max-w-[180px]">{vehicle.model_name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* ──────────────── LEFT COLUMN ──────────────── */}
        <div className="lg:col-span-8 space-y-10">

          {/* Title block */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gold tracking-widest uppercase">{vehicle.brand_name}</span>
              {vehicle.is_featured && (
                <span className="inline-flex items-center px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase
                  text-gold bg-gold/10 border border-gold/20 font-medium">
                  Destacado
                </span>
              )}
              {statusBadge && (
                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase border font-medium ${statusBadge.cls}`}>
                  {statusBadge.label}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary leading-tight">
              {vehicle.model_name}
            </h1>

            {/* Subtitle: version · year · location */}
            <p className="text-[#8A8A8A] text-sm mt-1.5">
              {[vehicle.version, String(vehicle.year), loc].filter(Boolean).join(' · ')}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              <FavoriteButton vehicleId={vehicle.id} variant="detail" />
              {vehicle.status === 'active' && (
                <CompareButton
                  vehicle={{
                    id: vehicle.id,
                    brand_name: vehicle.brand_name,
                    model_name: vehicle.model_name,
                    year: vehicle.year,
                    slug: vehicle.slug,
                    vehicle_type: vehicle.vehicle_type,
                    primaryImage: vehicle.images?.[0]?.url ?? null,
                  }}
                  variant="detail"
                />
              )}
            </div>
          </div>

          {/* Status banners */}
          {vehicle.status === 'sold' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-[#2A2A2A] bg-[#0D0D0D]">
              <span className="inline-flex items-center px-3 py-1 text-[10px] tracking-widest uppercase
                text-[#9A9A9A] border border-[#2A2A2A] self-start sm:self-auto flex-shrink-0">
                Vendido
              </span>
              <p className="text-xs text-[#808080]">Esta unidad ya no está disponible.</p>
              <Link href={backHref} className="text-xs text-[#C6A64B] hover:text-[#D4B560] transition-colors sm:ml-auto whitespace-nowrap flex-shrink-0">
                Ver unidades disponibles →
              </Link>
            </div>
          )}
          {vehicle.status === 'paused' && (
            <div className="flex items-center gap-3 p-4 border border-[#C6A64B]/20 bg-[#0D0D0D]">
              <span className="inline-flex items-center px-3 py-1 text-[10px] tracking-widest uppercase
                text-[#C6A64B] border border-[#C6A64B]/30 flex-shrink-0">
                Reservado
              </span>
              <p className="text-xs text-[#8A8A8A]">Consulta disponibilidad directamente con el vendedor.</p>
            </div>
          )}

          {/* Gallery */}
          <VehicleGallery images={vehicle.images || []} title={title} videoUrl={vehicle.video_url} />

          {/* Resumen de la unidad */}
          <div>
            <SectionTitle>Resumen del vehículo</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {summarySpecs.map((spec) => (
                <SummaryCell key={spec.label} label={spec.label} value={spec.value} />
              ))}
            </div>
          </div>

          {/* Descripción del vehículo */}
          <div>
            <SectionTitle>Descripción del vehículo</SectionTitle>
            {vehicle.description ? (
              <div className="text-bsm-text-secondary leading-relaxed whitespace-pre-wrap text-sm">
                {vehicle.description}
              </div>
            ) : (
              <div className="bg-surface border border-bsm-border p-6">
                <p className="text-sm text-bsm-text-secondary leading-relaxed">
                  Esta unidad ha sido seleccionada por cumplir los criterios de publicación de Black Label Market.
                  Si necesitas más información sobre su configuración, estado o historial,
                  contacta directamente con el vendedor a través del formulario de solicitud.
                </p>
              </div>
            )}
          </div>


          {/* Datos técnicos */}
          {technicalSpecs.length > 0 && (
            <div>
              <SectionTitle>Datos técnicos</SectionTitle>
              <div className="border border-bsm-border">
                {technicalSpecs.map((spec) => (
                  <SpecRow key={spec.label} label={spec.label} value={spec.value} />
                ))}
              </div>
            </div>
          )}

          {/* Equipamiento destacado */}
          <div>
            <SectionTitle>Equipamiento destacado</SectionTitle>
            {vehicle.equipment && vehicle.equipment.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {vehicle.equipment.map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-bsm-text-secondary py-1">
                    <CheckCircle className="w-3.5 h-3.5 text-gold/60 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-bsm-border px-5 py-4">
                <p className="text-sm text-[#808080] italic">
                  Equipamiento pendiente de confirmar. Solicita información al vendedor.
                </p>
              </div>
            )}
          </div>

          {/* Historial y documentación */}
          <div>
            <SectionTitle>Historial y documentación</SectionTitle>
            <div className="border border-bsm-border mb-4">
              <HistoryRow icon={MapPin}      label="País de origen"            value={vehicle.registration_country || null} />
              <HistoryRow icon={Users}       label="Número de propietarios"  value={vehicle.num_owners != null ? String(vehicle.num_owners) : null} />
              <HistoryRow icon={Wrench}      label="Historial de mantenimiento" value={vehicle.has_service_history ? 'Disponible' : null} />
              <HistoryRow icon={FileText}    label="Informe Carfax"          value={vehicle.has_carfax ? 'Disponible' : null} />
              <HistoryRow icon={Clock}       label="ITV válida hasta"        value={vehicle.itv_valid_until || null} />
            </div>
            <div className="flex items-start gap-2 p-4 bg-[#0D0D0D] border border-[#1A1A1A]">
              <AlertCircle className="w-4 h-4 text-[#808080] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#808080] leading-relaxed">
                La información documental debe confirmarse con el vendedor antes de formalizar cualquier operación.
              </p>
            </div>
          </div>

          {/* Condiciones de venta */}
          <div>
            <SectionTitle>Condiciones de venta</SectionTitle>
            <div className="border border-bsm-border mb-4">
              {[
                { label: 'Financiación disponible', value: vehicle.financing_available ? 'Sí' : null },
                { label: 'Entrega de tu vehículo',  value: vehicle.accepts_trade_in ? 'Aceptada' : null },
                { label: 'Prueba disponible',       value: vehicle.has_test_drive ? 'Sí' : null },
                { label: 'Transporte nacional',     value: vehicle.national_delivery ? 'Incluido' : null },
                { label: 'IVA deducible',           value: vehicle.iva_deducible ? 'Sí' : null },
                { label: 'Garantía',                value: vehicle.has_warranty ? (vehicle.warranty_months ? `${vehicle.warranty_months} meses` : 'Disponible') : null },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5 border-b border-bsm-border last:border-0">
                  <span className="text-sm text-bsm-text-muted">{label}</span>
                  <span className={`text-sm font-medium ${value ? 'text-emerald-400' : 'text-[#808080] italic text-xs'}`}>
                    {value || 'Consultar con el vendedor'}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 p-4 bg-[#0D0D0D] border border-[#1A1A1A]">
              <AlertCircle className="w-4 h-4 text-[#808080] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#808080] leading-relaxed">
                Las condiciones finales dependen del vendedor responsable de la unidad.
                Solicita información para confirmar disponibilidad, documentación y condiciones actualizadas.
              </p>
            </div>
          </div>


          {/* Sobre el vendedor (expanded body section) */}
          {vehicle.dealer && (
            <div>
              <SectionTitle>Sobre el vendedor</SectionTitle>
              <div className="border border-bsm-border p-6">
                <div className="flex items-start gap-4 mb-4">
                  {vehicle.dealer.logo_url ? (
                    <div className="w-12 h-12 flex-shrink-0 bg-[#111111] border border-[#1E1E1E] flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vehicle.dealer.logo_url}
                        alt={vehicle.dealer.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex-shrink-0 bg-[#111111] border border-[#1E1E1E] flex items-center justify-center">
                      <span className="font-display text-xl font-light text-gold/60">
                        {vehicle.dealer.name?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <Link
                        href={`/dealers/${vehicle.dealer.slug}`}
                        className="font-medium text-bsm-text-primary hover:text-gold transition-colors"
                      >
                        {vehicle.dealer.name}
                      </Link>
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-label="Profesional verificado" />
                    </div>
                    {vehicle.dealer.location_city && (
                      <div className="flex items-center gap-1 text-xs text-bsm-text-muted">
                        <MapPin className="w-3 h-3" />
                        {[vehicle.dealer.location_city, vehicle.dealer.location_region].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                {vehicle.dealer.description && (
                  <p className="text-xs text-bsm-text-muted leading-relaxed mb-4 border-t border-bsm-border pt-4">
                    {vehicle.dealer.description}
                  </p>
                )}
                <div className="border-t border-bsm-border pt-4">
                  <Link
                    href={`/dealers/${vehicle.dealer.slug}`}
                    className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors"
                  >
                    Ver showroom completo <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Marketplace disclaimer */}
          <div className="flex items-start gap-3 p-5 border border-[#1A1A1A] bg-[#0A0A0A]">
            <AlertCircle className="w-4 h-4 text-[#737373] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#737373] leading-relaxed">
              Información proporcionada por el vendedor profesional. Black Label Market recomienda confirmar disponibilidad, historial, documentación, garantía y condiciones antes de formalizar cualquier operación. Black Label Market actúa como plataforma de publicación y contacto; la operación comercial se realiza directamente entre comprador y vendedor.
            </p>
          </div>
        </div>

        {/* ──────────────── RIGHT COLUMN ──────────────── */}
        <div className="lg:col-span-4">
          <StickyAwareSidebar>

            {vehicle.status === 'sold' ? (
              /* ── VENDIDO ── */
              <>
                <div className="bg-surface border border-bsm-border p-6">
                  <div className="mb-5">
                    <div className="inline-flex items-center px-3 py-1 text-[10px] tracking-widest uppercase
                      text-[#9A9A9A] border border-[#2A2A2A] mb-3">
                      Vendido
                    </div>
                    <div className="font-display text-2xl font-light text-bsm-text-muted line-through opacity-40">
                      {formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request)}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-bsm-border">
                    <p className="text-sm text-bsm-text-muted mb-5 leading-relaxed">
                      Esta unidad ya no está disponible. Puedes explorar unidades similares o solicitar un vehículo a la carta.
                    </p>
                    <div className="space-y-3">
                      <Link href={backHref} className="btn-outline w-full justify-center text-sm">
                        <Search className="w-4 h-4" />
                        Consultar similares
                      </Link>
                      <Link href="/vehiculos-a-la-carta" className="btn-gold w-full justify-center text-sm">
                        <ArrowRight className="w-4 h-4" />
                        Solicitar vehículo a la carta
                      </Link>
                    </div>
                  </div>
                </div>
                {vehicle.dealer && (
                  <div className="bg-surface border border-bsm-border overflow-hidden">
                    <DealerInlineCard dealer={vehicle.dealer} variant="sidebar" />
                  </div>
                )}
              </>

            ) : vehicle.status === 'paused' ? (
              /* ── RESERVADO ── */
              <>
                <div className="bg-surface border border-bsm-border p-6">
                  <div className="mb-5">
                    <div className="inline-flex items-center px-3 py-1 text-[10px] tracking-widest uppercase
                      text-[#C6A64B] border border-[#C6A64B]/30 mb-3">
                      Reservado
                    </div>
                    <div className="font-display text-3xl font-light text-bsm-text-secondary">
                      {formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request)}
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-bsm-border text-sm mb-5">
                    <div className="flex justify-between text-bsm-text-secondary">
                      <span>Año</span><span className="text-bsm-text-primary">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between text-bsm-text-secondary">
                      <span>Kilómetros</span><span className="text-bsm-text-primary">{formatMileage(vehicle.mileage_km)}</span>
                    </div>
                    {vehicle.power_hp && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Potencia</span><span className="text-bsm-text-primary">{vehicle.power_hp} CV</span>
                      </div>
                    )}
                    {!isCar && vehicle.displacement_cc && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Cilindrada</span><span className="text-bsm-text-primary">{vehicle.displacement_cc} cc</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {vehicle.dealer?.whatsapp && (
                      <TrackLink
                        href={`https://wa.me/${vehicle.dealer.whatsapp.replace(/\D/g, '')}?text=Consulto disponibilidad del ${encodeURIComponent(title)}`}
                        eventType="vehicle_whatsapp_click"
                        vehicleId={vehicle.id}
                        dealerId={vehicle.dealer_id}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 text-sm font-medium tracking-wide text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors duration-200"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Consultar disponibilidad
                      </TrackLink>
                    )}
                    {vehicle.dealer?.phone && (
                      <TrackLink
                        href={`tel:${vehicle.dealer.phone}`}
                        eventType="vehicle_phone_click"
                        vehicleId={vehicle.id}
                        dealerId={vehicle.dealer_id}
                        className="btn-ghost w-full justify-center text-sm text-bsm-text-muted"
                      >
                        <Phone className="w-4 h-4" />
                        Llamar al vendedor
                      </TrackLink>
                    )}
                    <Link href="/vehiculos-a-la-carta" className="flex items-center justify-center gap-2 text-xs
                      text-bsm-text-muted hover:text-gold transition-colors py-2">
                      ¿No encuentras esta unidad? Solicitar vehículo a la carta →
                    </Link>
                    <ShareButton
                      title={title}
                      text="Mira este vehículo en Black Label Market"
                      label="Compartir"
                      className="flex items-center justify-center gap-2 w-full py-2 text-xs text-bsm-text-muted hover:text-gold transition-colors border border-bsm-border hover:border-gold/30"
                    />
                  </div>
                </div>
                {vehicle.dealer && (
                  <div className="bg-surface border border-bsm-border overflow-hidden">
                    <DealerInlineCard dealer={vehicle.dealer} variant="sidebar" />
                  </div>
                )}
              </>

            ) : (
              /* ── ACTIVE — CTAs completos ── */
              <>
                <div className="bg-surface border border-bsm-border p-6">
                  <div className="mb-5">
                    <div className={`font-display text-3xl font-light leading-none mb-1 ${vehicle.price_on_request ? 'text-bsm-text-secondary text-2xl' : 'text-gold'}`}>
                      {formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request)}
                    </div>
                    {vehicle.is_negotiable && (
                      <p className="text-xs text-bsm-text-muted">Precio negociable</p>
                    )}
                  </div>
                  <div className="space-y-2 pt-4 border-t border-bsm-border text-sm mb-5">
                    <div className="flex justify-between text-bsm-text-secondary">
                      <span>Año</span><span className="text-bsm-text-primary">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between text-bsm-text-secondary">
                      <span>Kilómetros</span><span className="text-bsm-text-primary">{formatMileage(vehicle.mileage_km)}</span>
                    </div>
                    {vehicle.power_hp && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Potencia</span><span className="text-bsm-text-primary">{vehicle.power_hp} CV</span>
                      </div>
                    )}
                    {isCar && vehicle.fuel_type && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Combustible</span><span className="text-bsm-text-primary">{FUEL_LABELS[vehicle.fuel_type]}</span>
                      </div>
                    )}
                    {isCar && vehicle.transmission && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Cambio</span><span className="text-bsm-text-primary">{TRANSMISSION_LABELS[vehicle.transmission]}</span>
                      </div>
                    )}
                    {!isCar && vehicle.displacement_cc && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Cilindrada</span><span className="text-bsm-text-primary">{vehicle.displacement_cc} cc</span>
                      </div>
                    )}
                    {!isCar && vehicle.license_type && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Carnet</span><span className="text-bsm-text-primary">{vehicle.license_type}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {vehicle.dealer?.whatsapp && (
                      <TrackLink
                        href={`https://wa.me/${vehicle.dealer.whatsapp.replace(/\D/g, '')}?text=Hola, me interesa el ${encodeURIComponent(title)}`}
                        eventType="vehicle_whatsapp_click"
                        vehicleId={vehicle.id}
                        dealerId={vehicle.dealer_id}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 text-sm font-medium tracking-wide text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors duration-200"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Consultar por WhatsApp
                      </TrackLink>
                    )}
                    {vehicle.dealer?.phone && (
                      <TrackLink
                        href={`tel:${vehicle.dealer.phone}`}
                        eventType="vehicle_phone_click"
                        vehicleId={vehicle.id}
                        dealerId={vehicle.dealer_id}
                        className="btn-outline w-full justify-center"
                      >
                        <Phone className="w-4 h-4" />
                        Llamar al vendedor
                      </TrackLink>
                    )}
                    <ShareButton
                      title={title}
                      text="Mira este vehículo en Black Label Market"
                      label="Compartir"
                      className="flex items-center justify-center gap-2 w-full py-2 text-xs text-bsm-text-muted hover:text-gold transition-colors border border-bsm-border hover:border-gold/30"
                    />
                  </div>
                </div>

                {/* Dealer card (sidebar) */}
                {vehicle.dealer && (
                  <div className="bg-surface border border-bsm-border overflow-hidden">
                    <DealerInlineCard dealer={vehicle.dealer} variant="sidebar" />
                  </div>
                )}

                {/* Contact block — classic form or assistant widget */}
                <div className="bg-surface border border-bsm-border p-6">
                  <h3 className="font-display text-lg font-light text-bsm-text-primary mb-1">
                    {contactMode === 'assistant' ? 'Consultar sobre este vehículo' : 'Pedir información sobre este vehículo'}
                  </h3>
                  <p className="text-xs text-bsm-text-muted mb-5">
                    {contactMode === 'assistant'
                      ? 'Nuestro asistente puede ayudarte ahora mismo.'
                      : 'Déjanos tus datos y el vendedor te responderá directamente.'}
                  </p>
                  {contactMode === 'assistant' ? (
                    <AssistantWidget
                      vehicleId={vehicle.id}
                      dealerId={vehicle.dealer_id}
                      vehicleTitle={title}
                      dealerWhatsapp={vehicle.dealer?.whatsapp ?? null}
                    />
                  ) : (
                    <QualifiedLeadForm
                      vehicleId={vehicle.id}
                      dealerId={vehicle.dealer_id}
                      vehicleTitle={title}
                    />
                  )}
                </div>
              </>
            )}
          </StickyAwareSidebar>
        </div>
      </div>

      {/* Similar vehicles */}
      {similarVehicles.length > 0 && (
        <div className="mt-20 pt-12 border-t border-bsm-border">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-6 bg-gold" />
                <span className="text-[10px] text-gold tracking-widest uppercase">Similares</span>
              </div>
              <h2 className="font-display text-2xl font-light">Vehículos similares</h2>
            </div>
            <Link
              href={`${backHref}?marca=${vehicle.brand_name?.toLowerCase().replace(/\s+/g, '-') ?? ''}`}
              className="text-xs text-gold hover:text-gold-light transition-colors hidden sm:flex items-center gap-1"
            >
              Ver más de {vehicle.brand_name} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarVehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      )}

      {/* Dealer vehicles */}
      {dealerVehicles.length > 0 && (
        <div className="mt-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-6 bg-gold" />
                <span className="text-[10px] text-gold tracking-widest uppercase">También disponible</span>
              </div>
              <h2 className="font-display text-2xl font-light">Más vehículos disponibles en {vehicle.dealer?.name}</h2>
            </div>
            {vehicle.dealer?.slug && (
              <Link
                href={`/dealers/${vehicle.dealer.slug}`}
                className="text-xs text-gold hover:text-gold-light transition-colors hidden sm:flex items-center gap-1"
              >
                Ver showroom <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealerVehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      )}
    </div>
  )
}
