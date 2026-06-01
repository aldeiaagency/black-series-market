import Link from 'next/link'
import { MapPin, CheckCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DealerProps {
  name: string
  slug: string
  logo_url?: string | null
  cover_url?: string | null
  location_city?: string | null
  location_region?: string | null
  is_verified?: boolean
  subscription_plan?: string | null
}

interface DealerInlineCardProps {
  dealer: DealerProps
  variant?: 'card' | 'sidebar'
  className?: string
}

/**
 * Compact dealer display. Use variant="card" in VehicleCard, variant="sidebar" in detail panels.
 */
export default function DealerInlineCard({ dealer, variant = 'card', className }: DealerInlineCardProps) {
  const initial = dealer.name?.[0]?.toUpperCase() || '?'
  const city = dealer.location_city || null
  const region = dealer.location_region || null
  const locationLabel = [city, region].filter(Boolean).join(', ') || 'Ubicación pendiente'

  if (variant === 'card') {
    return (
      <Link
        href={`/dealers/${dealer.slug}`}
        className={cn(
          'flex items-center gap-2 group/dealer',
          className
        )}
      >
        {/* Logo or initial */}
        <div className="w-5 h-5 flex-shrink-0 bg-[#111111] border border-[#1E1E1E] flex items-center justify-center overflow-hidden">
          {dealer.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={dealer.logo_url}
              alt={dealer.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-[8px] font-medium text-[#C6A64B]/60 leading-none select-none">
              {initial}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[12px] text-[#8A8A8A] group-hover/dealer:text-[#C6A64B] transition-colors duration-150 truncate block leading-tight">
            {dealer.name}
          </span>
          {city && (
            <span className="flex items-center gap-0.5 text-[11px] text-[#737373] leading-tight">
              <MapPin className="w-2 h-2 flex-shrink-0" />
              {city}
            </span>
          )}
        </div>

        {dealer.is_verified && (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" aria-label="Profesional verificado" />
        )}
      </Link>
    )
  }

  // sidebar variant
  return (
    <div className={cn('', className)}>
      {/* Cover image */}
      {dealer.cover_url && (
        <div className="w-full h-20 mb-4 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dealer.cover_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-3 text-center">
        Profesional seleccionado
      </p>

      {/* Logo centered */}
      <div className="flex justify-center mb-3">
        <div className="w-10 h-10 flex-shrink-0 bg-[#111111] border border-[#1E1E1E] flex items-center justify-center overflow-hidden">
          {dealer.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={dealer.logo_url}
              alt={dealer.name}
              className="w-full h-full object-contain p-0.5"
            />
          ) : (
            <span className="font-display text-sm font-light text-[#C6A64B]/60 select-none">
              {initial}
            </span>
          )}
        </div>
      </div>

      {/* Name + verified centered */}
      <div className="text-center mb-1">
        <Link
          href={`/dealers/${dealer.slug}`}
          className="font-medium text-bsm-text-primary hover:text-gold transition-colors text-sm"
        >
          {dealer.name}
        </Link>
        {dealer.is_verified && (
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest">Verificado</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 text-xs text-bsm-text-muted mb-4">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        {locationLabel}
      </div>

      <div className="text-center">
        <Link
          href={`/dealers/${dealer.slug}`}
          className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors"
        >
          Ver showroom completo <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
