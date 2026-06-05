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
  whatsapp?: string | null
  phone?: string | null
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
          'flex items-center gap-3 group/dealer',
          className
        )}
      >
        {/* Logo or initial */}
        <div className="w-7 h-7 flex-shrink-0 bg-[#111111] border border-[#1E1E1E] flex items-center justify-center overflow-hidden">
          {dealer.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={dealer.logo_url}
              alt={dealer.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-[10px] font-medium text-[#C6A64B]/60 leading-none select-none">
              {initial}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[#8A8A8A] group-hover/dealer:text-[#C6A64B] transition-colors duration-150 truncate leading-tight">
            {dealer.name}
            {city && (
              <>
                <span className="text-[#3A3A3A] mx-1.5 select-none">·</span>
                <span className="text-[11px] text-[#737373] group-hover/dealer:text-[#C6A64B]/60">{city}</span>
              </>
            )}
          </p>
        </div>

        {dealer.is_verified && (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" aria-label="Profesional verificado" />
        )}
      </Link>
    )
  }

  // sidebar variant — cover image fills the entire card, info overlaid with gradient
  return (
    <div className={cn('relative min-h-[190px] overflow-hidden', className)}>
      {/* Background: cover image or solid dark */}
      {dealer.cover_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={dealer.cover_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#0D0D0D]" />
      )}

      {/* Gradient overlay: transparent top → solid black bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 pt-6 pb-5">
        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">
          Profesional seleccionado
        </p>

        {/* Logo */}
        <div className="w-10 h-10 mb-3 flex-shrink-0 bg-black/60 border border-white/15 flex items-center justify-center overflow-hidden">
          {dealer.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={dealer.logo_url}
              alt={dealer.name}
              className="w-full h-full object-contain p-0.5"
            />
          ) : (
            <span className="font-display text-sm font-light text-[#C6A64B]/70 select-none">
              {initial}
            </span>
          )}
        </div>

        {/* Name */}
        <Link
          href={`/dealers/${dealer.slug}`}
          className="font-medium text-white hover:text-gold transition-colors text-sm mb-1"
        >
          {dealer.name}
        </Link>

        {/* Verified */}
        {dealer.is_verified && (
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest">Verificado</span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center justify-center gap-1 text-xs text-white/50 mb-4">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {locationLabel}
        </div>

        {/* Link */}
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
