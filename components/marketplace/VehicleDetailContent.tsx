import Link from 'next/link'
import {
  MapPin, Phone, MessageCircle, Shield, CheckCircle, ArrowLeft, ArrowRight,
  FileText, Clock, Wrench, BadgeCheck, AlertCircle, ChevronRight, Search,
} from 'lucide-react'
import VehicleGallery from '@/components/marketplace/VehicleGallery'
import VehicleCard from '@/components/marketplace/VehicleCard'
import QualifiedLeadForm from '@/components/marketplace/QualifiedLeadForm'
import FavoriteButton from '@/components/marketplace/FavoriteButton'
import CompareButton from '@/components/marketplace/CompareButton'
import { formatPrice, formatMileage, FUEL_LABELS, TRANSMISSION_LABELS, DRIVE_LABELS } from '@/lib/utils'
import type { Vehicle } from '@/lib/types'

interface Props {
  vehicle: Vehicle & { dealer: any }
  relatedVehicles: Vehicle[]
  backHref: string
  backLabel: string
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-5 py-3 text-sm border-b border-bsm-border last:border-0">
      <span className="text-bsm-text-muted">{label}</span>
      <span className="text-bsm-text-primary font-medium text-right max-w-[55%]">{value}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-light mb-6 pb-4 border-b border-bsm-border">
      {children}
    </h2>
  )
}

export default function VehicleDetailContent({ vehicle, relatedVehicles, backHref, backLabel }: Props) {
  const title = `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year}${vehicle.version ? ' ' + vehicle.version : ''}`
  const isCar = vehicle.vehicle_type === 'car'

  // Quick summary specs
  const summarySpecs = isCar
    ? [
        { label: 'Año',          value: String(vehicle.year) },
        { label: 'Kilometraje',  value: formatMileage(vehicle.mileage_km) },
        vehicle.power_hp       && { label: 'Potencia',     value: `${vehicle.power_hp} CV` },
        vehicle.fuel_type      && { label: 'Combustible',  value: FUEL_LABELS[vehicle.fuel_type] },
        vehicle.transmission   && { label: 'Cambio',       value: TRANSMISSION_LABELS[vehicle.transmission] },
        vehicle.body_type      && { label: 'Carrocería',   value: vehicle.body_type },
        vehicle.registration_country && { label: 'Origen', value: vehicle.registration_country },
        vehicle.financing_available  && { label: 'Financiación', value: 'Disponible' },
        vehicle.has_service_history  && { label: 'Historial',    value: 'Disponible' },
      ].filter(Boolean) as { label: string; value: string }[]
    : [
        { label: 'Año',          value: String(vehicle.year) },
        { label: 'Kilometraje',  value: formatMileage(vehicle.mileage_km) },
        vehicle.displacement_cc && { label: 'Cilindrada',  value: `${vehicle.displacement_cc} cc` },
        vehicle.power_hp        && { label: 'Potencia',    value: `${vehicle.power_hp} CV` },
        vehicle.body_type       && { label: 'Tipo',        value: vehicle.body_type },
        vehicle.fuel_type       && { label: 'Combustible', value: FUEL_LABELS[vehicle.fuel_type] },
        vehicle.registration_country && { label: 'Origen', value: vehicle.registration_country },
        vehicle.financing_available  && { label: 'Financiación', value: 'Disponible' },
      ].filter(Boolean) as { label: string; value: string }[]

  // Technical specs
  const technicalSpecs = [
    vehicle.displacement_cc && { label: 'Cilindrada',        value: `${vehicle.displacement_cc} cc` },
    vehicle.power_hp        && { label: 'Potencia',           value: `${vehicle.power_hp} CV${vehicle.power_kw ? ` / ${vehicle.power_kw} kW` : ''}` },
    vehicle.torque_nm       && { label: 'Par motor',          value: `${vehicle.torque_nm} Nm` },
    vehicle.cylinders       && { label: 'Cilindros',          value: String(vehicle.cylinders) },
    vehicle.engine_config   && { label: 'Configuración',      value: vehicle.engine_config },
    vehicle.zero_to_hundred && { label: '0-100 km/h',         value: `${vehicle.zero_to_hundred}s` },
    vehicle.top_speed_kmh   && { label: 'Velocidad máxima',   value: `${vehicle.top_speed_kmh} km/h` },
    vehicle.transmission    && { label: 'Transmisión',         value: TRANSMISSION_LABELS[vehicle.transmission] },
    vehicle.drive_type      && { label: 'Tracción',            value: DRIVE_LABELS[vehicle.drive_type] },
    vehicle.weight_kg       && { label: 'Peso',                value: `${vehicle.weight_kg} kg` },
    vehicle.body_type       && { label: 'Carrocería',          value: vehicle.body_type },
    vehicle.color_exterior  && { label: 'Color exterior',      value: vehicle.color_exterior },
    vehicle.color_interior  && { label: 'Color interior',      value: vehicle.color_interior },
    vehicle.upholstery      && { label: 'Tapicería',           value: vehicle.upholstery },
    vehicle.registration_year && { label: 'Año matriculación', value: String(vehicle.registration_year) },
    vehicle.registration_country && { label: 'País de origen', value: vehicle.registration_country },
    vehicle.itv_valid_until && { label: 'ITV válida hasta',    value: vehicle.itv_valid_until },
  ].filter(Boolean) as { label: string; value: string }[]

  // History fields
  const historyFields = [
    { label: 'Origen',                  value: vehicle.registration_country || null,       icon: MapPin },
    { label: 'Historial de servicio',   value: vehicle.has_service_history ? 'Disponible' : null, icon: Wrench },
    { label: 'Informe Carfax',          value: vehicle.has_carfax ? 'Disponible' : null,   icon: FileText },
    { label: 'ITV válida hasta',        value: vehicle.itv_valid_until || null,             icon: Clock },
  ]

  const hasHistoryData = historyFields.some((f) => f.value)

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-bsm-text-muted mb-8">
        <Link href={backHref} className="hover:text-gold transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel}
        </Link>
        <span>/</span>
        <Link
          href={`${backHref}?marca=${vehicle.brand_name.toLowerCase().replace(/\s/g, '-')}`}
          className="text-gold hover:text-gold-light transition-colors"
        >
          {vehicle.brand_name}
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px]">{title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ───── LEFT COLUMN ───── */}
        <div className="lg:col-span-8 space-y-10">

          {/* Title block */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gold tracking-widest uppercase">{vehicle.brand_name}</span>
              {vehicle.is_editors_pick && (
                <span className="badge-gold text-[10px]">Editor&apos;s Pick</span>
              )}
              {vehicle.is_exclusive && (
                <span className="badge text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                  Exclusivo
                </span>
              )}
              {vehicle.is_featured && (
                <span className="badge text-[10px] text-gold bg-gold/10 border border-gold/20">
                  Destacado
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary leading-tight">
              {vehicle.model_name}
              {vehicle.version && (
                <span className="text-bsm-text-secondary font-sans text-2xl font-normal ml-3">
                  {vehicle.version}
                </span>
              )}
            </h1>

            {/* Action buttons under title */}
            <div className="flex items-center gap-3 mt-4">
              <FavoriteButton vehicleId={vehicle.id} variant="detail" />
              {vehicle.status === 'active' && (
                <CompareButton vehicleId={vehicle.id} variant="detail" />
              )}
            </div>
          </div>

          {/* Status banner */}
          {vehicle.status === 'sold' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-[#2A2A2A] bg-[#0D0D0D]">
              <span className="inline-flex items-center px-3 py-1 text-[10px] tracking-widest uppercase text-[#9A9A9A] border border-[#2A2A2A] self-start sm:self-auto flex-shrink-0">
                Vendido
              </span>
              <p className="text-xs text-[#575757]">Esta unidad ya no está disponible.</p>
              <Link href={backHref} className="text-xs text-[#C6A64B] hover:text-[#D4B560] transition-colors sm:ml-auto whitespace-nowrap flex-shrink-0">
                Ver unidades disponibles →
              </Link>
            </div>
          )}
          {vehicle.status === 'paused' && (
            <div className="flex items-center gap-3 p-4 border border-[#C6A64B]/20 bg-[#0D0D0D]">
              <span className="inline-flex items-center px-3 py-1 text-[10px] tracking-widest uppercase text-[#C6A64B] border border-[#C6A64B]/30 flex-shrink-0">
                Reservado
              </span>
              <p className="text-xs text-[#686868]">Consulta disponibilidad directamente con el dealer.</p>
            </div>
          )}

          {/* Gallery */}
          <VehicleGallery images={vehicle.images || []} title={title} />

          {/* Resumen de la unidad */}
          <div>
            <SectionTitle>Resumen de la unidad</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {summarySpecs.map((spec) => (
                <div key={spec.label} className="bg-surface border border-bsm-border p-4">
                  <div className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-1.5">
                    {spec.label}
                  </div>
                  <div className="text-sm font-medium text-bsm-text-primary">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {vehicle.description ? (
            <div>
              <SectionTitle>Descripción</SectionTitle>
              <div className="text-bsm-text-secondary leading-relaxed whitespace-pre-wrap text-sm">
                {vehicle.description}
              </div>
            </div>
          ) : (
            <div>
              <SectionTitle>Por qué esta unidad encaja</SectionTitle>
              <div className="bg-surface border border-bsm-border p-6">
                <p className="text-sm text-bsm-text-secondary leading-relaxed italic">
                  Esta unidad ha sido seleccionada por cumplir los criterios de publicación de Black Label Market.
                  Si necesitas más información sobre su configuración, estado o historial, contacta directamente con el dealer.
                </p>
              </div>
            </div>
          )}

          {/* Technical specs */}
          {technicalSpecs.length > 0 && (
            <div>
              <SectionTitle>Ficha técnica</SectionTitle>
              <div className="border border-bsm-border">
                {technicalSpecs.map((spec) => (
                  <SpecRow key={spec.label} label={spec.label} value={spec.value} />
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {vehicle.equipment && vehicle.equipment.length > 0 && (
            <div>
              <SectionTitle>Equipamiento</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vehicle.equipment.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-bsm-text-secondary py-1">
                    <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial y documentación */}
          <div>
            <SectionTitle>Historial y documentación</SectionTitle>
            <div className="border border-bsm-border">
              {hasHistoryData ? (
                historyFields
                  .filter((f) => f.value)
                  .map((f) => (
                    <div key={f.label} className="flex items-center justify-between px-5 py-3.5 border-b border-bsm-border last:border-0">
                      <div className="flex items-center gap-2.5 text-sm text-bsm-text-muted">
                        <f.icon className="w-4 h-4 text-gold/60" />
                        {f.label}
                      </div>
                      <span className="text-sm text-bsm-text-primary font-medium">{f.value}</span>
                    </div>
                  ))
              ) : null}

              {/* Static history fields */}
              {[
                { label: 'Siniestros declarados',  icon: AlertCircle },
                { label: 'Libro de mantenimiento', icon: FileText },
                { label: 'Número de propietarios', icon: BadgeCheck },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between px-5 py-3.5 border-b border-bsm-border last:border-0">
                  <div className="flex items-center gap-2.5 text-sm text-bsm-text-muted">
                    <f.icon className="w-4 h-4 text-[#3A3A3A]" />
                    {f.label}
                  </div>
                  <span className="text-xs text-[#575757] italic">Consultar con dealer</span>
                </div>
              ))}
            </div>
          </div>

          {/* Condiciones de venta */}
          <div>
            <SectionTitle>Condiciones de venta</SectionTitle>
            <div className="border border-bsm-border mb-4">
              {[
                { label: 'Financiación disponible', value: vehicle.financing_available ? 'Sí' : null },
                { label: 'Acepta parte de pago',    value: vehicle.accepts_trade_in    ? 'Sí' : null },
                { label: 'IVA deducible',           value: null },
                { label: 'Prueba disponible',       value: null },
                { label: 'Transporte nacional',     value: null },
                { label: 'Garantía',                value: null },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5 border-b border-bsm-border last:border-0">
                  <span className="text-sm text-bsm-text-muted">{label}</span>
                  <span className={`text-sm font-medium ${value ? 'text-emerald-400' : 'text-[#575757] italic text-xs'}`}>
                    {value || 'Consultar con dealer'}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 p-4 bg-[#0D0D0D] border border-[#1A1A1A]">
              <AlertCircle className="w-4 h-4 text-[#575757] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#575757] leading-relaxed">
                Las condiciones finales dependen del dealer responsable de la unidad.
                Solicita información para confirmar disponibilidad, documentación y condiciones actualizadas.
              </p>
            </div>
          </div>

          {/* Certifications */}
          {(vehicle.has_service_history || vehicle.has_carfax || vehicle.financing_available || vehicle.accepts_trade_in) && (
            <div className="flex flex-wrap gap-3">
              {vehicle.has_service_history && (
                <div className="flex items-center gap-2 px-4 py-2 border border-emerald-400/20 text-emerald-400 text-xs">
                  <Shield className="w-4 h-4" />Historial de servicio
                </div>
              )}
              {vehicle.has_carfax && (
                <div className="flex items-center gap-2 px-4 py-2 border border-emerald-400/20 text-emerald-400 text-xs">
                  <Shield className="w-4 h-4" />Informe Carfax
                </div>
              )}
              {vehicle.financing_available && (
                <div className="flex items-center gap-2 px-4 py-2 border border-gold/20 text-gold text-xs">
                  <CheckCircle className="w-4 h-4" />Financiación disponible
                </div>
              )}
              {vehicle.accepts_trade_in && (
                <div className="flex items-center gap-2 px-4 py-2 border border-gold/20 text-gold text-xs">
                  <CheckCircle className="w-4 h-4" />Acepta parte de pago
                </div>
              )}
            </div>
          )}

          {/* Marketplace disclaimer */}
          <div className="flex items-start gap-3 p-5 border border-[#1A1A1A] bg-[#0A0A0A]">
            <AlertCircle className="w-4 h-4 text-[#474747] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#474747] leading-relaxed">
              Información proporcionada por el dealer. Black Label recomienda confirmar disponibilidad,
              historial, condiciones y documentación antes de formalizar cualquier operación.
              Black Label Market actúa como plataforma de publicación y contacto; la operación comercial
              se realiza entre comprador y vendedor.
            </p>
          </div>
        </div>

        {/* ───── RIGHT COLUMN (sticky) ───── */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-5">

            {vehicle.status === 'sold' ? (
              /* ── VENDIDO ── */
              <div className="bg-surface border border-bsm-border p-6">
                <div className="mb-5">
                  <div className="inline-flex items-center px-3 py-1 text-[10px] tracking-widest uppercase text-[#9A9A9A] border border-[#2A2A2A] mb-3">
                    Vendido
                  </div>
                  <div className="font-display text-2xl font-light text-bsm-text-muted line-through opacity-40">
                    {formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request)}
                  </div>
                </div>
                <div className="pt-4 border-t border-bsm-border">
                  <p className="text-sm text-bsm-text-muted mb-5 leading-relaxed">
                    Esta unidad ya no está disponible. Puedes explorar unidades similares o registrar una búsqueda privada.
                  </p>
                  <div className="space-y-3">
                    <Link href={backHref} className="btn-outline w-full justify-center text-sm">
                      <Search className="w-4 h-4" />
                      Consultar similares
                    </Link>
                    <Link href="/busqueda-privada" className="btn-gold w-full justify-center text-sm">
                      <ArrowRight className="w-4 h-4" />
                      Solicitar búsqueda privada
                    </Link>
                  </div>
                </div>
              </div>
            ) : vehicle.status === 'paused' ? (
              /* ── RESERVADO ── */
              <>
                <div className="bg-surface border border-bsm-border p-6">
                  <div className="mb-5">
                    <div className="inline-flex items-center px-3 py-1 text-[10px] tracking-widest uppercase text-[#C6A64B] border border-[#C6A64B]/30 mb-3">
                      Reservado
                    </div>
                    <div className={`font-display text-3xl font-light ${vehicle.price_on_request ? 'text-bsm-text-secondary text-2xl' : 'text-bsm-text-secondary'}`}>
                      {formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request)}
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-bsm-border text-sm mb-5">
                    <div className="flex justify-between text-bsm-text-secondary">
                      <span>Año</span><span className="text-bsm-text-primary">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between text-bsm-text-secondary">
                      <span>Kilometraje</span><span className="text-bsm-text-primary">{formatMileage(vehicle.mileage_km)}</span>
                    </div>
                    {vehicle.power_hp && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Potencia</span><span className="text-bsm-text-primary">{vehicle.power_hp} CV</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {vehicle.dealer?.whatsapp && (
                      <a
                        href={`https://wa.me/${vehicle.dealer.whatsapp.replace(/\D/g, '')}?text=Consulto disponibilidad del ${encodeURIComponent(title)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-outline w-full justify-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Consultar disponibilidad
                      </a>
                    )}
                    {vehicle.dealer?.phone && (
                      <a href={`tel:${vehicle.dealer.phone}`} className="btn-ghost w-full justify-center text-sm text-bsm-text-muted">
                        <Phone className="w-4 h-4" />
                        Llamar al dealer
                      </a>
                    )}
                    <Link href="/busqueda-privada" className="flex items-center justify-center gap-2 text-xs text-bsm-text-muted hover:text-gold transition-colors py-2">
                      ¿No consigues esta unidad? Solicitar búsqueda privada →
                    </Link>
                  </div>
                </div>
                {vehicle.dealer && (
                  <div className="bg-surface border border-bsm-border p-5">
                    <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-3">Dealer seleccionado</p>
                    <Link href={`/dealers/${vehicle.dealer.slug}`} className="font-medium text-bsm-text-primary hover:text-gold transition-colors block mb-1">
                      {vehicle.dealer.name}
                    </Link>
                    {vehicle.dealer.location_city && (
                      <div className="flex items-center gap-1 text-xs text-bsm-text-muted mb-3">
                        <MapPin className="w-3 h-3" />
                        {[vehicle.dealer.location_city, vehicle.dealer.location_region].filter(Boolean).join(', ')}
                      </div>
                    )}
                    <Link href={`/dealers/${vehicle.dealer.slug}`} className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors">
                      Ver showroom completo<ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              /* ── ACTIVE — CTAs completos ── */
              <>
                {/* Price card */}
                <div className="bg-surface border border-bsm-border p-6">
                  <div className="mb-5">
                    <div className={`font-display text-3xl font-light ${vehicle.price_on_request ? 'text-bsm-text-secondary text-2xl' : 'text-gold'}`}>
                      {formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request)}
                    </div>
                    {vehicle.is_negotiable && (
                      <p className="text-xs text-bsm-text-muted mt-1">Precio negociable</p>
                    )}
                  </div>
                  <div className="space-y-2 pt-4 border-t border-bsm-border text-sm mb-5">
                    <div className="flex justify-between text-bsm-text-secondary">
                      <span>Año</span><span className="text-bsm-text-primary">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between text-bsm-text-secondary">
                      <span>Kilometraje</span><span className="text-bsm-text-primary">{formatMileage(vehicle.mileage_km)}</span>
                    </div>
                    {vehicle.power_hp && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Potencia</span><span className="text-bsm-text-primary">{vehicle.power_hp} CV</span>
                      </div>
                    )}
                    {vehicle.fuel_type && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Combustible</span><span className="text-bsm-text-primary">{FUEL_LABELS[vehicle.fuel_type]}</span>
                      </div>
                    )}
                    {vehicle.transmission && (
                      <div className="flex justify-between text-bsm-text-secondary">
                        <span>Cambio</span><span className="text-bsm-text-primary">{TRANSMISSION_LABELS[vehicle.transmission]}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {vehicle.dealer?.whatsapp && (
                      <a
                        href={`https://wa.me/${vehicle.dealer.whatsapp.replace(/\D/g, '')}?text=Hola, me interesa el ${encodeURIComponent(title)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-gold w-full justify-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contactar por WhatsApp
                      </a>
                    )}
                    {vehicle.dealer?.phone && (
                      <a href={`tel:${vehicle.dealer.phone}`} className="btn-outline w-full justify-center">
                        <Phone className="w-4 h-4" />
                        Llamar al dealer
                      </a>
                    )}
                  </div>
                </div>

                {/* Dealer card */}
                {vehicle.dealer && (
                  <div className="bg-surface border border-bsm-border p-5">
                    <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-3">Dealer seleccionado</p>
                    <Link href={`/dealers/${vehicle.dealer.slug}`} className="font-medium text-bsm-text-primary hover:text-gold transition-colors block mb-1">
                      {vehicle.dealer.name}
                    </Link>
                    {vehicle.dealer.location_city && (
                      <div className="flex items-center gap-1 text-xs text-bsm-text-muted mb-3">
                        <MapPin className="w-3 h-3" />
                        {[vehicle.dealer.location_city, vehicle.dealer.location_region].filter(Boolean).join(', ')}
                      </div>
                    )}
                    <Link href={`/dealers/${vehicle.dealer.slug}`} className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors">
                      Ver showroom completo<ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Qualified lead form */}
                <div className="bg-surface border border-bsm-border p-6">
                  <h3 className="font-medium text-bsm-text-primary mb-1">Solicitar información</h3>
                  <p className="text-xs text-bsm-text-muted mb-5">
                    Tu solicitud llegará con contexto completo al dealer
                  </p>
                  <QualifiedLeadForm
                    vehicleId={vehicle.id}
                    dealerId={vehicle.dealer_id}
                    vehicleTitle={title}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Related vehicles */}
      {relatedVehicles.length > 0 && (
        <div className="mt-20 pt-12 border-t border-bsm-border">
          <h2 className="font-display text-2xl font-light mb-8">
            Más de {vehicle.dealer?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedVehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      )}
    </div>
  )
}
