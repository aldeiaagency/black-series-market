'use client'

import { useState } from 'react'
import { Zap, Info } from 'lucide-react'

interface Props {
  vehicleId: string
  isFeatured: boolean
  featuredUntil?: string | null
}

export default function BoostButton({ vehicleId, isFeatured, featuredUntil }: Props) {
  const [loading, setLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const isActive = isFeatured && featuredUntil && new Date(featuredUntil) > new Date()

  async function handleBoost() {
    setLoading(true)
    const res = await fetch('/api/stripe/boost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId }),
    })
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      setLoading(false)
      alert('Error al iniciar el boost')
    }
  }

  if (isActive) {
    const until = new Date(featuredUntil!).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    return (
      <span className="flex items-center gap-1 text-[10px] text-gold">
        <Zap className="w-3 h-3 fill-current" />
        Boost hasta {until}
      </span>
    )
  }

  return (
    <div className="relative flex items-center gap-1">
      <button
        onClick={handleBoost}
        disabled={loading}
        className="flex items-center gap-1 text-[10px] text-bsm-text-muted hover:text-gold transition-colors disabled:opacity-50"
      >
        <Zap className="w-3 h-3" />
        {loading ? 'Cargando...' : 'Boost €49'}
      </button>
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="text-bsm-text-muted hover:text-gold transition-colors"
        aria-label="¿Qué es Boost?"
      >
        <Info className="w-3 h-3" />
      </button>
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-[#0D0D0D] border border-bsm-border text-[11px] text-bsm-text-secondary leading-relaxed z-50 shadow-lg">
          <p className="font-medium text-bsm-text-primary mb-1">Destacado por 7 días</p>
          <p>Tu anuncio aparece primero en los resultados y con etiqueta «Destacado» visible para los compradores. Pago único de €49.</p>
        </div>
      )}
    </div>
  )
}
