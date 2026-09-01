'use client'

import { useState } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export interface FreshnessVehicle {
  id: string
  title: string
  last_confirmed_at: string
  freshness_auto_paused: boolean
  days_since_confirmed: number
}

export default function FreshnessList({ vehicles }: { vehicles: FreshnessVehicle[] }) {
  const [items, setItems] = useState(vehicles)
  const [pending, setPending] = useState<string | null>(null)

  async function confirm(id: string) {
    setPending(id)
    try {
      const res = await fetch(`/api/dealer/vehicles/${id}/confirm-freshness`, { method: 'POST' })
      if (res.ok) setItems((prev) => prev.filter((v) => v.id !== id))
    } finally {
      setPending(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-bsm-text-muted py-6">
        <CheckCircle className="w-4 h-4 text-emerald-400" />
        Todo tu stock está confirmado. Nada pendiente de revisión.
      </div>
    )
  }

  return (
    <div className="divide-y divide-bsm-border">
      {items.map((v) => (
        <div key={v.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="text-sm text-bsm-text-primary truncate">{v.title}</p>
            <p className="text-xs text-bsm-text-muted flex items-center gap-1.5">
              {v.freshness_auto_paused ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  Pausado automáticamente — sin confirmar hace {v.days_since_confirmed} días
                </>
              ) : (
                `Confirmado hace ${v.days_since_confirmed} días`
              )}
            </p>
          </div>
          <button
            onClick={() => confirm(v.id)}
            disabled={pending === v.id}
            className="btn-outline text-xs px-4 py-2 flex-shrink-0 disabled:opacity-50"
          >
            {pending === v.id ? 'Confirmando…' : 'Sigue disponible'}
          </button>
        </div>
      ))}
    </div>
  )
}
