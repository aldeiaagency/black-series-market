'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics/client'

export default function DealerViewTracker({ dealerId }: { dealerId: string }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    trackEvent({
      event_type: 'professional_profile_view',
      dealer_id: dealerId,
      keepalive: true,
    })
  }, [dealerId])

  return null
}
