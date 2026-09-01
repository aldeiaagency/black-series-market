'use client'

import { trackEvent } from '@/lib/analytics/client'
import type { AnalyticsEventType } from '@/lib/analytics/events'

interface TrackLinkProps {
  href: string
  eventType: AnalyticsEventType
  vehicleId?: string | null
  dealerId?: string | null
  className?: string
  children: React.ReactNode
  target?: string
  rel?: string
}

export default function TrackLink({
  href,
  eventType,
  vehicleId,
  dealerId,
  className,
  children,
  target,
  rel,
}: TrackLinkProps) {
  // Solo WhatsApp lleva código de referencia — es el único canal con mensaje de texto donde
  // tiene sentido dejarlo (una llamada de teléfono no tiene cuerpo de mensaje). El clic en sí
  // ya queda registrado en Supabase/GA4; este código es lo único que viaja fuera del Market,
  // para que si un comercial lo pega de vuelta en algún sitio, se pueda correlacionar con este
  // evento exacto. No hay todavía ningún sitio donde reportarlo — es solo trazabilidad barata.
  function withWhatsappRef(baseHref: string, ref: string): string {
    try {
      const url = new URL(baseHref)
      const currentText = url.searchParams.get('text') || ''
      url.searchParams.set('text', `${currentText}\n\nRef: ${ref}`)
      return url.toString()
    } catch {
      return baseHref
    }
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const isWhatsapp = eventType === 'vehicle_whatsapp_click'
    const refCode = isWhatsapp ? crypto.randomUUID().slice(0, 8).toUpperCase() : undefined

    trackEvent({
      event_type: eventType,
      vehicle_id: vehicleId || null,
      dealer_id: dealerId || null,
      metadata: refCode ? { whatsapp_ref: refCode } : undefined,
    })

    if (typeof window !== 'undefined') {
      const dl = ((window as any).dataLayer = (window as any).dataLayer || [])
      dl.push({
        event:          'dealer_contact_click',
        contact_method: isWhatsapp ? 'whatsapp' : 'phone',
        vehicle_id:     vehicleId || undefined,
        dealer_id:      dealerId  || undefined,
      })
    }

    // El href estático no puede llevar un código por-clic (es la misma cadena para todo el
    // mundo hasta la próxima revalidación ISR) — se reconstruye aquí, en el momento real del
    // clic, y se navega a mano en su lugar.
    if (refCode) {
      e.preventDefault()
      window.open(withWhatsappRef(href, refCode), target || '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <a href={href} target={target} rel={rel} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}
