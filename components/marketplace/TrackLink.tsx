'use client'

interface TrackLinkProps {
  href: string
  eventType: string
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
  function handleClick() {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        vehicle_id: vehicleId || null,
        dealer_id:  dealerId  || null,
      }),
    }).catch(() => {})
  }

  return (
    <a href={href} target={target} rel={rel} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}
