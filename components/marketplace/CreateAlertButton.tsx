'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import SearchAlertModal from '@/components/marketplace/SearchAlertModal'

interface Props {
  vehicleType?: 'car' | 'motorcycle'
  className?: string
  label?: string
}

export default function CreateAlertButton({ vehicleType, className, label = 'Crear alerta' }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        <Bell className="w-3.5 h-3.5" />
        {label}
      </button>
      <SearchAlertModal
        open={open}
        onClose={() => setOpen(false)}
        defaultVehicleType={vehicleType}
      />
    </>
  )
}
