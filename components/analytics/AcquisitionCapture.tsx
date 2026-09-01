'use client'

import { useEffect } from 'react'
import { captureAcquisitionContext } from '@/lib/analytics/client'

export default function AcquisitionCapture() {
  useEffect(() => {
    const capture = () => { captureAcquisitionContext() }
    capture()
    window.addEventListener('cookie-consent-updated', capture)
    return () => window.removeEventListener('cookie-consent-updated', capture)
  }, [])

  return null
}
