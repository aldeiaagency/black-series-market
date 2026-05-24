'use client'

import { useState, useTransition } from 'react'
import { getVehicleStatusColor, VEHICLE_STATUS_LABELS } from '@/lib/utils'
import { updateVehicleStatus } from '@/app/(dashboard)/dashboard/inventario/actions'
import type { VehicleStatus } from '@/lib/types'

type SelectableStatus = 'active' | 'paused' | 'sold'
const SELECTABLE: SelectableStatus[] = ['active', 'paused', 'sold']

interface Props {
  vehicleId: string
  initialStatus: string
}

export default function VehicleStatusSelector({ vehicleId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()

  const vs = status as VehicleStatus

  if (!SELECTABLE.includes(status as SelectableStatus)) {
    return (
      <span className={`badge text-[10px] ${getVehicleStatusColor(vs)}`}>
        {VEHICLE_STATUS_LABELS[vs]}
      </span>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as SelectableStatus
    setStatus(next)
    startTransition(() => updateVehicleStatus(vehicleId, next))
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className={`badge text-[10px] cursor-pointer appearance-none pr-5 ${getVehicleStatusColor(vs)} ${isPending ? 'opacity-50' : ''}`}
    >
      {SELECTABLE.map((s) => (
        <option key={s} value={s} className="bg-[#0D0D0D] text-[#C9C9C9]">
          {VEHICLE_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  )
}
