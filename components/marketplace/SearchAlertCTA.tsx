import Link from 'next/link'
import { Bell } from 'lucide-react'

interface SearchAlertCTAProps {
  vehicleType?: 'car' | 'motorcycle'
  compact?: boolean
}

export default function SearchAlertCTA({ vehicleType, compact = false }: SearchAlertCTAProps) {
  const typeLabel = vehicleType === 'motorcycle' ? 'moto' : vehicleType === 'car' ? 'coche' : 'vehículo'

  if (compact) {
    return (
      <div className="flex items-center gap-3 border border-[#1E1E1E] bg-[#0D0D0D] px-4 py-3">
        <Bell className="w-4 h-4 text-[#C6A64B] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#C9C9C9]">¿No encuentras lo que buscas?</p>
          <p className="text-[11px] text-[#575757]">Registra tu demanda en búsqueda privada</p>
        </div>
        <Link
          href="/busqueda-privada"
          className="text-[11px] text-[#C6A64B] hover:text-[#D4B560] transition-colors whitespace-nowrap"
        >
          Solicitar →
        </Link>
      </div>
    )
  }

  return (
    <div className="border border-[#1E1E1E] bg-[#0D0D0D] p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 flex items-center justify-center border border-[#C6A64B]/20 bg-[#C6A64B]/5 flex-shrink-0">
          <Bell className="w-5 h-5 text-[#C6A64B]" />
        </div>
        <div>
          <h3 className="font-display text-xl font-light text-[#F4F1EA] mb-2">
            Crea una alerta de búsqueda
          </h3>
          <p className="text-sm text-[#686868] leading-relaxed">
            Si no encuentras el {typeLabel} que buscas, registra tu demanda.
            Cuando entre una unidad compatible con tus criterios, podemos contactarte.
          </p>
        </div>
      </div>

      <div className="text-[11px] text-[#474747] mb-5 italic">
        Ejemplo: Porsche 911 manual, hasta 90.000 €, nacional, menos de 80.000 km.
      </div>

      <Link
        href="/busqueda-privada"
        className="inline-flex items-center gap-2 px-6 py-3 text-[12px] tracking-[0.1em] font-medium uppercase
          border border-[#C6A64B]/60 text-[#C6A64B]
          hover:bg-[#C6A64B]/8 hover:border-[#C6A64B]
          transition-all duration-200"
      >
        <Bell className="w-3.5 h-3.5" />
        Solicitar búsqueda privada
      </Link>

      <p className="text-[10px] text-[#3A3A3A] mt-4">
        Este servicio no garantiza disponibilidad. Registra tu interés para detectar oportunidades compatibles.
      </p>
    </div>
  )
}
