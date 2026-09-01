import Link from 'next/link'
import Image from 'next/image'
import { MapPin, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Dealer } from '@/lib/types'

interface DealerCardProps {
  dealer: Dealer
  variant?: 'default' | 'featured'
}

export default function DealerCard({ dealer, variant = 'default' }: DealerCardProps) {
  const isFeatured = variant === 'featured'
  const initial = dealer.name?.[0]?.toUpperCase() || '?'
  const location = [dealer.location_city, dealer.location_region].filter(Boolean).join(', ')

  return (
    <Link href={`/dealers/${dealer.slug}`}>
      <article className={cn(
        'group relative bg-[#0D0D0D] border overflow-hidden transition-all duration-300',
        'hover:shadow-[0_8px_40px_rgba(0,0,0,0.7)]',
        isFeatured
          ? 'border-gold/25 hover:border-gold/50'
          : 'border-[#1A1A1A] hover:border-gold/20'
      )}>

        {/* Featured gold top line */}
        {isFeatured && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent z-10" />
        )}

        {/* Cover + overlay + centered logo/name/verified */}
        <div className={cn(
          'relative overflow-hidden flex flex-col items-center justify-end pb-5',
          isFeatured ? 'h-52' : 'h-44'
        )}>
          {dealer.cover_url ? (
            <Image
              src={dealer.cover_url}
              alt={dealer.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04] opacity-55 group-hover:opacity-65"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#161616] via-[#0E0E0E] to-[#080808]">
              <div className={cn(
                'absolute inset-0',
                isFeatured
                  ? 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(198,166,75,0.08)_0%,transparent_70%)]'
                  : 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(198,166,75,0.04)_0%,transparent_70%)]'
              )} />
            </div>
          )}

          {/* Gradient overlay — bottom heavy */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/90 via-[#0D0D0D]/30 to-transparent" />

          {/* Featured badge */}
          {isFeatured && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] tracking-[0.15em] uppercase
                text-gold bg-[#0D0D0D]/90 border border-gold/30">
                Destacado
              </span>
            </div>
          )}

          {/* Logo + name + verified — overlaid on bottom */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            <div className="w-12 h-12 bg-[#0E0E0E]/90 border border-bsm-border flex items-center justify-center overflow-hidden mb-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {dealer.logo_url ? (
                <Image
                  src={dealer.logo_url}
                  alt={`${dealer.name} logo`}
                  width={48}
                  height={48}
                  className="object-contain p-1.5"
                />
              ) : (
                <span className="font-display text-xl font-light text-gold/70 select-none">
                  {initial}
                </span>
              )}
            </div>

            <h3 className="font-medium text-[#F4F1EA] text-[14px] tracking-wide leading-tight mb-0.5">
              {dealer.name}
            </h3>

            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3 h-3" />
              <span className="text-[9px] tracking-widest uppercase font-medium">Verificado</span>
            </div>
          </div>
        </div>

        {/* Bottom bar — location + vehicle count */}
        <div className="px-4 py-3.5 border-t border-[#1A1A1A] flex flex-col items-center gap-1">
          {location && (
            <div className="flex items-center gap-1 text-[11px] text-[#9E9E9E]">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {dealer.vehicle_count !== undefined && (
            <div className="text-[11px] text-[#9E9E9E]">
              {dealer.vehicle_count} {dealer.vehicle_count === 1 ? 'vehículo' : 'vehículos'}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
