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
          className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors mb-3"
        >
          Ver showroom completo <ChevronRight className="w-3 h-3" />
        </Link>

        {/* WhatsApp CTA */}
        {dealer.whatsapp && (
          <a
            href={`https://wa.me/${dealer.whatsapp.replace(/\D/g, '')}?text=Hola, me interesa conocer vuestro showroom en Black Label Market`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium tracking-wide text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contactar por WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}
