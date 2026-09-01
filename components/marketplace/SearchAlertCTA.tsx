'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import SearchAlertModal from '@/components/marketplace/SearchAlertModal'

interface AlertInitialValues {
  brand?: string
  model?: string
  budget_max?: string
  year_min?: string
  km_max?: string
  location?: string
}

interface SearchAlertCTAProps {
  vehicleType?: 'car' | 'motorcycle'
  compact?: boolean
  initialValues?: AlertInitialValues
}

export default function SearchAlertCTA({ vehicleType, compact = false, initialValues }: SearchAlertCTAProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const typeLabel = vehicleType === 'motorcycle' ? 'moto' : vehicleType === 'car' ? 'coche' : 'vehículo'

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-3 border border-bsm-border-light bg-[#0D0D0D] px-4 py-3">
          <Bell className="w-4 h-4 text-gold flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#C9C9C9]">¿No encuentras el vehículo que buscas?</p>
            <p className="text-[11px] text-[#9E9E9E]">Cuéntanos qué buscas y te avisamos si aparece algo.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="text-[11px] text-gold hover:text-[#D4B560] transition-colors whitespace-nowrap flex-shrink-0"
          >
            Avísame si aparece →
          </button>
        </div>
        <SearchAlertModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultVehicleType={vehicleType}
          initialValues={initialValues}
        />
      </>
    )
  }

  return (
    <>
      <div className="border border-bsm-border-light bg-[#0D0D0D] p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 flex items-center justify-center border border-gold/20 bg-gold/5 flex-shrink-0">
            <Bell className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="font-display text-xl font-light text-[#F4F1EA] mb-2">
              ¿No encuentras el vehículo que buscas?
            </h3>
            <p className="text-sm text-[#8A8A8A] leading-relaxed">
              Cuéntanos qué {typeLabel} tienes en mente y te avisaremos si aparece una unidad compatible.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-[#9E9E9E] mb-5 italic">
          Ejemplo: Porsche 911 manual, hasta 90.000 €, nacional, menos de 80.000 km.
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-[12px] tracking-[0.1em] font-medium uppercase
              border border-gold/60 text-gold
              hover:bg-gold/8 hover:border-gold
              transition-all duration-200"
          >
            <Bell className="w-3.5 h-3.5" />
            Avísame si aparece
          </button>
          <Link
            href="/vehiculos-a-la-carta"
            className="inline-flex items-center gap-2 px-6 py-3 text-[12px] tracking-[0.1em] font-medium uppercase
              border border-bsm-border text-[#8A8A8A]
              hover:border-[#3A3A3A] hover:text-[#C9C9C9]
              transition-all duration-200"
          >
            Solicitar búsqueda
          </Link>
        </div>

        <p className="text-[10px] text-[#8A8A8A] mt-4">
          Este servicio no garantiza disponibilidad. Registra tu interés para detectar oportunidades compatibles.
        </p>
      </div>
      <SearchAlertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultVehicleType={vehicleType}
      />
    </>
  )
}
