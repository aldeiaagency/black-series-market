import Link from 'next/link'
import { MapPin, Phone, MessageCircle, Shield, CheckCircle, Calendar, Gauge, Zap, Settings, ArrowLeft } from 'lucide-react'
import VehicleGallery from '@/components/marketplace/VehicleGallery'
import ContactForm from '@/components/marketplace/ContactForm'
import VehicleCard from '@/components/marketplace/VehicleCard'
import { formatPrice, formatMileage, FUEL_LABELS, TRANSMISSION_LABELS, DRIVE_LABELS } from '@/lib/utils'
import type { Vehicle } from '@/lib/types'

interface Props {
  vehicle: Vehicle & { dealer: any }
  relatedVehicles: Vehicle[]
  backHref: string
  backLabel: string
}

export default function VehicleDetailContent({ vehicle, relatedVehicles, backHref, backLabel }: Props) {
  const title = `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year}${vehicle.version ? ' ' + vehicle.version : ''}`

  const quickSpecs = [
    { label: 'Año', value: String(vehicle.year) },
    { label: 'Kilometraje', value: formatMileage(vehicle.mileage_km) },
    { label: 'Potencia', value: vehicle.power_hp ? `${vehicle.power_hp} CV` : null },
    { label: 'Combustible', value: vehicle.fuel_type ? FUEL_LABELS[vehicle.fuel_type] : null },
  ].filter((s) => s.value)

  const technicalSpecs = [
    { label: 'Cilindrada', value: vehicle.displacement_cc ? `${vehicle.displacement_cc} cc` : null },
    { label: 'Potencia', value: vehicle.power_hp ? `${vehicle.power_hp} CV / ${vehicle.power_kw ?? '—'} kW` : null },
    { label: 'Par motor', value: vehicle.torque_nm ? `${vehicle.torque_nm} Nm` : null },
    { label: 'Cilindros', value: vehicle.cylinders ? String(vehicle.cylinders) : null },
    { label: 'Configuración motor', value: vehicle.engine_config },
    { label: '0-100 km/h', value: vehicle.zero_to_hundred ? `${vehicle.zero_to_hundred}s` : null },
    { label: 'Velocidad máxima', value: vehicle.top_speed_kmh ? `${vehicle.top_speed_kmh} km/h` : null },
    { label: 'Transmisión', value: vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : null },
    { label: 'Tracción', value: vehicle.drive_type ? DRIVE_LABELS[vehicle.drive_type] : null },
    { label: 'Peso', value: vehicle.weight_kg ? `${vehicle.weight_kg} kg` : null },
    { label: 'Carrocería', value: vehicle.body_type },
    { label: 'Color exterior', value: vehicle.color_exterior },
    { label: 'Color interior', value: vehicle.color_interior },
    { label: 'Tapicería', value: vehicle.upholstery },
    { label: 'Año matriculación', value: vehicle.registration_year ? String(vehicle.registration_year) : null },
    { label: 'País de origen', value: vehicle.registration_country },
    { label: 'ITV válida hasta', value: vehicle.itv_valid_until || null },
  ].filter((s) => s.value)

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-bsm-text-muted mb-8">
        <Link href={backHref} className="hover:text-gold transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel}
        </Link>
        <span>/</span>
        <Link href={`${backHref}?marca=${vehicle.brand_name.toLowerCase().replace(' ', '-')}`} className="text-gold hover:text-gold-light transition-colors">
          {vehicle.brand_name}
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px]">{title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-8">
          {/* Title block */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gold tracking-widest uppercase">{vehicle.brand_name}</span>
              {vehicle.is_editors_pick && <span className="badge-gold text-[10px]">Editor&apos;s Pick</span>}
              {vehicle.is_exclusive && <span className="badge text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">Exclusivo</span>}
              {vehicle.is_featured && <span className="badge text-[10px] text-gold bg-gold/10 border border-gold/20">Destacado</span>}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary leading-tight">
              {vehicle.model_name}
              {vehicle.version && (
                <span className="text-bsm-text-secondary font-sans text-2xl font-normal ml-3">{vehicle.version}</span>
              )}
            </h1>
          </div>

          {/* Gallery */}
          <div className="mb-10">
            <VehicleGallery images={vehicle.images || []} title={title} />
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {quickSpecs.map((spec) => (
              <div key={spec.label} className="bg-surface border border-bsm-border p-4 text-center">
                <div className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-1.5">{spec.label}</div>
                <div className="text-sm font-medium text-bsm-text-primary">{spec.value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="mb-10">
              <h2 className="font-display text-2xl font-light mb-4 pb-4 border-b border-bsm-border">Descripción</h2>
              <div className="text-bsm-text-secondary leading-relaxed whitespace-pre-wrap text-sm">{vehicle.description}</div>
            </div>
          )}

          {/* Technical specs */}
          {technicalSpecs.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-2xl font-light mb-6 pb-4 border-b border-bsm-border">Ficha técnica</h2>
              <div className="border border-bsm-border">
                {technicalSpecs.map((spec, i) => (
                  <div key={spec.label} className={`flex justify-between items-center px-5 py-3 text-sm ${i < technicalSpecs.length - 1 ? 'border-b border-bsm-border' : ''}`}>
                    <span className="text-bsm-text-muted">{spec.label}</span>
                    <span className="text-bsm-text-primary font-medium text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {vehicle.equipment && vehicle.equipment.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-2xl font-light mb-6 pb-4 border-b border-bsm-border">Equipamiento</h2>
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

          {/* Certifications & conditions */}
          <div className="flex flex-wrap gap-3 mb-10">
            {vehicle.has_service_history && (
              <div className="flex items-center gap-2 px-4 py-2 border border-emerald-400/20 text-emerald-400 text-xs">
                <Shield className="w-4 h-4" />Historial de mantenimiento
              </div>
            )}
            {vehicle.has_carfax && (
              <div className="flex items-center gap-2 px-4 py-2 border border-emerald-400/20 text-emerald-400 text-xs">
                <Shield className="w-4 h-4" />Informe Carfax disponible
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
        </div>

        {/* RIGHT — sticky sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-5">
            {/* Price card */}
            <div className="bg-surface border border-bsm-border p-6">
              <div className="mb-4">
                <div className={`font-display text-3xl font-light ${vehicle.price_on_request ? 'text-bsm-text-secondary text-2xl' : 'text-gold'}`}>
                  {formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request)}
                </div>
                {vehicle.is_negotiable && <p className="text-xs text-bsm-text-muted mt-1">Precio negociable</p>}
              </div>

              <div className="space-y-2.5 pt-4 border-t border-bsm-border text-sm mb-5">
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
              </div>

              <div className="space-y-3">
                {vehicle.dealer?.whatsapp && (
                  <a
                    href={`https://wa.me/${vehicle.dealer.whatsapp.replace(/\D/g, '')}?text=Hola, me interesa el ${encodeURIComponent(title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-gold w-full justify-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
                {vehicle.dealer?.phone && (
                  <a href={`tel:${vehicle.dealer.phone}`} className="btn-outline w-full justify-center">
                    <Phone className="w-4 h-4" />
                    Llamar
                  </a>
                )}
              </div>
            </div>

            {/* Dealer card */}
            {vehicle.dealer && (
              <div className="bg-surface border border-bsm-border p-5">
                <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-3">Concesionario</p>
                <Link href={`/dealers/${vehicle.dealer.slug}`} className="font-medium text-bsm-text-primary hover:text-gold transition-colors block mb-1">
                  {vehicle.dealer.name}
                </Link>
                {vehicle.dealer.location_city && (
                  <div className="flex items-center gap-1 text-xs text-bsm-text-muted mb-3">
                    <MapPin className="w-3 h-3" />
                    {[vehicle.dealer.location_city, vehicle.dealer.location_region].filter(Boolean).join(', ')}
                  </div>
                )}
                <Link href={`/dealers/${vehicle.dealer.slug}`} className="text-xs text-gold hover:text-gold-light transition-colors">
                  Ver todos sus vehículos →
                </Link>
              </div>
            )}

            {/* Contact form */}
            <div className="bg-surface border border-bsm-border p-6">
              <h3 className="font-medium text-bsm-text-primary mb-1">Solicitar información</h3>
              <p className="text-xs text-bsm-text-muted mb-5">El concesionario responderá en menos de 24h</p>
              <ContactForm vehicleId={vehicle.id} dealerId={vehicle.dealer_id} vehicleTitle={title} />
            </div>
          </div>
        </div>
      </div>

      {/* Related vehicles */}
      {relatedVehicles.length > 0 && (
        <div className="mt-20 pt-12 border-t border-bsm-border">
          <h2 className="font-display text-2xl font-light mb-8">Más de {vehicle.dealer?.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedVehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      )}
    </div>
  )
}
