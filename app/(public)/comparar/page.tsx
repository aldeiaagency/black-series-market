import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { formatPrice, formatMileage, FUEL_LABELS, TRANSMISSION_LABELS, DRIVE_LABELS } from '@/lib/utils'
import type { Vehicle } from '@/lib/types'
import type { Metadata } from 'next'
import CompareExpandToggle from '@/components/marketplace/CompareExpandToggle'

export const metadata: Metadata = {
  title: 'Comparar vehículos — Black Label Market',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{ ids?: string }>
}

function CompareCell({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-[#555] text-xs italic">—</span>
  return <span className="text-bsm-text-primary text-sm">{value}</span>
}

function BoolCell({ value }: { value: boolean }) {
  return value
    ? <Check className="w-4 h-4 text-emerald-400 mx-auto" />
    : <X className="w-4 h-4 text-[#555] mx-auto" />
}

function SectionHeader({ label, cols }: { label: string; cols: number }) {
  return (
    <div className={`grid ${cols === 2 ? 'grid-cols-[180px_1fr_1fr]' : 'grid-cols-[180px_1fr_1fr_1fr]'} bg-[#0E0E0E]`}>
      <div className="col-span-full px-4 py-2.5 text-[10px] text-gold uppercase tracking-widest border-b border-t border-bsm-border">
        {label}
      </div>
    </div>
  )
}

function Row({ label, values, cols }: { label: string; values: (string | null | undefined)[]; cols: number }) {
  const allSame = values.every(v => v === values[0])
  return (
    <div className={`grid border-b border-bsm-border ${cols === 2 ? 'grid-cols-[180px_1fr_1fr]' : 'grid-cols-[180px_1fr_1fr_1fr]'}`}>
      <div className="px-4 py-3 text-xs text-bsm-text-muted bg-[#0A0A0A] flex items-center">{label}</div>
      {values.map((v, i) => (
        <div key={i} className={`px-4 py-3 flex items-center ${!allSame && v ? 'bg-[#C6A64B]/3' : ''}`}>
          <CompareCell value={v} />
        </div>
      ))}
    </div>
  )
}

function BoolRow({ label, values, cols }: { label: string; values: boolean[]; cols: number }) {
  return (
    <div className={`grid border-b border-bsm-border ${cols === 2 ? 'grid-cols-[180px_1fr_1fr]' : 'grid-cols-[180px_1fr_1fr_1fr]'}`}>
      <div className="px-4 py-3 text-xs text-bsm-text-muted bg-[#0A0A0A] flex items-center">{label}</div>
      {values.map((v, i) => (
        <div key={i} className="px-4 py-3 flex items-center justify-center">
          <BoolCell value={v} />
        </div>
      ))}
    </div>
  )
}

export default async function CompararPage({ searchParams }: PageProps) {
  const { ids } = await searchParams
  const vehicleIds = ids?.split(',').filter(Boolean).slice(0, 3) || []

  if (vehicleIds.length < 2) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="h-px w-8 bg-gold" />
            <span className="text-xs text-gold tracking-widest uppercase">Comparador</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h1 className="font-display text-3xl font-light text-bsm-text-primary mb-3">
            No hay vehículos seleccionados
          </h1>
          <p className="text-sm text-bsm-text-muted mb-8 leading-relaxed">
            Añade hasta 3 coches o motos para comparar. Usa el botón &quot;Comparar&quot; en cada ficha o card.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/coches" className="btn-gold px-6">Explorar coches</Link>
            <Link href="/motos" className="btn-outline px-6">Explorar motos</Link>
          </div>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: rawVehicles } = await supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city)')
    .in('id', vehicleIds)

  const vehicles = (rawVehicles as (Vehicle & { dealer: any })[]) || []

  if (vehicles.length < 2) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-28 pb-20 text-center">
        <p className="text-bsm-text-muted mb-6">Los vehículos seleccionados ya no están disponibles.</p>
        <div className="flex justify-center gap-4">
          <Link href="/coches" className="btn-gold px-6">Explorar coches</Link>
          <Link href="/motos" className="btn-outline px-6">Explorar motos</Link>
        </div>
      </div>
    )
  }

  const cols = vehicles.length

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-32">
      <div className="mb-10">
        <Link href="/coches" className="flex items-center gap-1.5 text-sm text-bsm-text-muted hover:text-gold transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al marketplace
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Comparativa</span>
        </div>
        <h1 className="section-title">Comparar vehículos</h1>
      </div>

      <div className="overflow-x-auto">

        {/* Vehicle headers */}
        <div className={`grid border border-bsm-border ${cols === 2 ? 'grid-cols-[180px_1fr_1fr]' : 'grid-cols-[180px_1fr_1fr_1fr]'}`}>
          <div className="bg-[#0A0A0A] border-r border-bsm-border" />
          {vehicles.map((v) => {
            const primaryImg = v.images?.[0]?.url
            const href = `/${v.vehicle_type === 'motorcycle' ? 'motos' : 'coches'}/${v.slug}`
            return (
              <div key={v.id} className="p-5 border-r border-bsm-border last:border-0">
                <Link href={href} className="group block">
                  {primaryImg && (
                    <div className="aspect-[16/10] overflow-hidden mb-4 bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={primaryImg} alt={`${v.brand_name} ${v.model_name}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="text-[10px] text-gold/80 tracking-widest uppercase mb-0.5">{v.brand_name}</div>
                  <div className="font-display text-lg font-light text-bsm-text-primary group-hover:text-gold transition-colors">{v.model_name}</div>
                  {v.version && <p className="text-xs text-bsm-text-muted mt-0.5">{v.version}</p>}
                </Link>
                <div className="mt-3 font-display text-xl font-light text-gold">
                  {formatPrice(v.price, v.currency, v.price_on_request)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Specs */}
        <div className="border border-t-0 border-bsm-border">

          <SectionHeader label="General" cols={cols} />
          <Row label="Año"         values={vehicles.map(v => String(v.year))}                                              cols={cols} />
          <Row label="Kilómetros"  values={vehicles.map(v => formatMileage(v.mileage_km))}                                cols={cols} />
          <Row label="Combustible" values={vehicles.map(v => v.fuel_type ? FUEL_LABELS[v.fuel_type] : null)}             cols={cols} />
          <Row label="Transmisión" values={vehicles.map(v => v.transmission ? TRANSMISSION_LABELS[v.transmission] : null)} cols={cols} />
          <Row label="Tracción"    values={vehicles.map(v => v.drive_type ? DRIVE_LABELS[v.drive_type] : null)}          cols={cols} />
          <Row label="Carrocería"  values={vehicles.map(v => v.body_type)}                                                cols={cols} />
          <Row label="Origen"      values={vehicles.map(v => v.registration_country)}                                     cols={cols} />

          <SectionHeader label="Motor y prestaciones" cols={cols} />
          <Row label="Potencia"        values={vehicles.map(v => v.power_hp ? `${v.power_hp} CV` : null)}               cols={cols} />
          <Row label="Cilindrada"      values={vehicles.map(v => v.displacement_cc ? `${v.displacement_cc} cc` : null)} cols={cols} />
          <Row label="Par motor"       values={vehicles.map(v => v.torque_nm ? `${v.torque_nm} Nm` : null)}             cols={cols} />
          <Row label="0–100 km/h"      values={vehicles.map(v => v.zero_to_hundred ? `${v.zero_to_hundred}s` : null)}   cols={cols} />
          <Row label="Velocidad máx."  values={vehicles.map(v => v.top_speed_kmh ? `${v.top_speed_kmh} km/h` : null)}  cols={cols} />
          <Row label="Peso"            values={vehicles.map(v => v.weight_kg ? `${v.weight_kg} kg` : null)}             cols={cols} />

          <SectionHeader label="Condiciones de venta" cols={cols} />
          <BoolRow label="Financiación"       values={vehicles.map(v => !!v.financing_available)} cols={cols} />
          <BoolRow label="Parte de pago"      values={vehicles.map(v => !!v.accepts_trade_in)}    cols={cols} />
          <BoolRow label="Historial servicio" values={vehicles.map(v => !!v.has_service_history)} cols={cols} />
          <BoolRow label="Informe Carfax"     values={vehicles.map(v => !!v.has_carfax)}          cols={cols} />
          <BoolRow label="IVA deducible"      values={vehicles.map(v => !!v.iva_deducible)}       cols={cols} />

          <SectionHeader label="Concesionario" cols={cols} />
          <Row label="Concesionario" values={vehicles.map(v => v.dealer?.name)}          cols={cols} />
          <Row label="Ubicación"     values={vehicles.map(v => v.dealer?.location_city)} cols={cols} />

          {/* Client component: expandable extra fields */}
          <CompareExpandToggle vehicles={vehicles} cols={cols} />

          {/* CTA por vehículo — cierra el bucle de conversión */}
          <div className={`grid ${cols === 2 ? 'grid-cols-[180px_1fr_1fr]' : 'grid-cols-[180px_1fr_1fr_1fr]'}`}>
            <div className="bg-[#0A0A0A] border-r border-bsm-border" />
            {vehicles.map((v) => {
              const href = `/${v.vehicle_type === 'motorcycle' ? 'motos' : 'coches'}/${v.slug}`
              return (
                <div key={v.id} className="p-4 flex flex-col gap-2.5 border-r border-bsm-border last:border-0">
                  <Link href={href} className="btn-gold w-full">
                    Ver ficha
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href={`${href}#contactar`} className="btn-outline w-full">
                    Contactar
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
