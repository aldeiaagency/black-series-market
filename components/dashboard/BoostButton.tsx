'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'

interface Props {
  vehicleId: string
  isFeatured: boolean
  featuredUntil?: string | null
}

export default function BoostButton({ vehicleId, isFeatured, featuredUntil }: Props) {
  const [loading, setLoading] = useState(false)

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
    <button
      onClick={handleBoost}
      disabled={loading}
      className="flex items-center gap-1 text-[10px] text-bsm-text-muted hover:text-gold transition-colors disabled:opacity-50"
    >
      <Zap className="w-3 h-3" />
      {loading ? 'Cargando...' : 'Boost €49'}
    </button>
  )
}
