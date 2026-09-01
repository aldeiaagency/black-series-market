'use client'

import type { MouseEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { Car, Bike } from 'lucide-react'
import VehicleCard from '@/components/marketplace/VehicleCard'

interface DealerInventoryProps {
  slug: string
  vehicles: any[]
  otherVehicles: any[]
}

export function DealerInventoryFallback(props: DealerInventoryProps) {
  return <InventoryContent {...props} tipo={null} />
}

export default function DealerInventory(props: DealerInventoryProps) {
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo')

  function handleSelect(event: MouseEvent<HTMLAnchorElement>, value: string | null) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    window.history.pushState(
      null,
      '',
      value ? '/dealers/' + props.slug + '?tipo=' + value : '/dealers/' + props.slug,
    )
  }

  return <InventoryContent {...props} tipo={tipo} onSelect={handleSelect} />
}

function InventoryContent({
  slug,
  vehicles,
  otherVehicles,
  tipo,
  onSelect,
}: DealerInventoryProps & {
  tipo: string | null
  onSelect?: (event: MouseEvent<HTMLAnchorElement>, tipo: string | null) => void
}) {
  const cars = vehicles.filter((vehicle) => vehicle.vehicle_type === 'car')
  const motos = vehicles.filter((vehicle) => vehicle.vehicle_type === 'motorcycle')
  const displayVehicles =
    tipo === 'car' ? cars :
    tipo === 'motorcycle' ? motos :
    vehicles

  const filterHref = (value: string | null) =>
    value ? '/dealers/' + slug + '?tipo=' + value : '/dealers/' + slug

  return (
    <div className='pb-8'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
        <div>
          <h2 className='font-display text-2xl font-light mb-1'>Inventario actual</h2>
          <p className='text-sm text-bsm-text-muted'>
            {vehicles.length} unidad{vehicles.length !== 1 ? 'es' : ''} disponible{vehicles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {cars.length > 0 && motos.length > 0 && (
          <div className='flex border border-bsm-border'>
            <a
              href={filterHref(null)}
              onClick={onSelect ? (event) => onSelect(event, null) : undefined}
              className={'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ' +
                (!tipo || tipo === 'all'
                  ? 'bg-gold/10 text-gold border-r border-bsm-border'
                  : 'text-bsm-text-muted hover:text-bsm-text-primary border-r border-bsm-border')}
            >
              Todos
              <span className='text-xs opacity-60'>({vehicles.length})</span>
            </a>
            <a
              href={filterHref('car')}
              onClick={onSelect ? (event) => onSelect(event, 'car') : undefined}
              className={'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ' +
                (tipo === 'car'
                  ? 'bg-gold/10 text-gold border-r border-bsm-border'
                  : 'text-bsm-text-muted hover:text-bsm-text-primary border-r border-bsm-border')}
            >
              <Car className='w-3.5 h-3.5' />
              Coches
              <span className='text-xs opacity-60'>({cars.length})</span>
            </a>
            <a
              href={filterHref('motorcycle')}
              onClick={onSelect ? (event) => onSelect(event, 'motorcycle') : undefined}
              className={'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ' +
                (tipo === 'motorcycle'
                  ? 'bg-gold/10 text-gold'
                  : 'text-bsm-text-muted hover:text-bsm-text-primary')}
            >
              <Bike className='w-3.5 h-3.5' />
              Motos
              <span className='text-xs opacity-60'>({motos.length})</span>
            </a>
          </div>
        )}
      </div>

      {displayVehicles.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12'>
          {displayVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <p className='text-bsm-text-muted text-center py-16 border border-bsm-border bg-surface'>
          Este showroom no tiene vehículos activos en este momento.
        </p>
      )}

      {otherVehicles.length > 0 && (
        <div className='mb-12'>
          <h3 className='font-display text-lg font-light text-bsm-text-muted mb-6 pb-3 border-b border-[#1A1A1A]'>
            Vendidos / Reservados
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {otherVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
