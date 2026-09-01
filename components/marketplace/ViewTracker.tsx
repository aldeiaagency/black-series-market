'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics/client'

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
    trackEvent({
      event_type: 'vehicle_view',
      vehicle_id: vehicleId,
      dealer_id: dealerId ?? null,
      keepalive: true,
    })
  }, [vehicleId, dealerId])
  return null
}
