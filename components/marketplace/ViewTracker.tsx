'use client'

import { useEffect, useRef } from 'react'

/**
 * Registra una vista de vehículo desde el cliente (beacon a /api/track), en lugar de escribir
 * en el render del Server Component. Así la ficha no tiene efectos de escritura y puede cachearse
 * con ISR; y el contador de vistas se incrementa de forma atómica en el servidor.
 */
export default function ViewTracker({ vehicleId, dealerId }: { vehicleId: string; dealerId?: string | null }) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'vehicle_view', vehicle_id: vehicleId, dealer_id: dealerId ?? null }),
      keepalive: true,
    }).catch(() => {})
  }, [vehicleId, dealerId])
  return null
}
