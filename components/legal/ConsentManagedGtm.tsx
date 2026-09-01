'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { getStoredConsent } from '@/lib/cookies/consent'

interface ConsentManagedGtmProps {
  gtmId: string | null
}

export default function ConsentManagedGtm({ gtmId }: ConsentManagedGtmProps) {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)

  useEffect(() => {
    const sync = () => setAnalyticsAllowed(getStoredConsent()?.analytics === true)
    sync()
    window.addEventListener('cookie-consent-updated', sync)
    return () => window.removeEventListener('cookie-consent-updated', sync)
  }, [])

  if (!gtmId || !analyticsAllowed) return null

  return (
    <Script id="gtm-init" strategy="afterInteractive">{`
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `}</Script>
  )
}
