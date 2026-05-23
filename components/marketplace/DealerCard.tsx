import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Car } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Dealer } from '@/lib/types'

interface DealerCardProps {
  dealer: Dealer
  variant?: 'default' | 'featured'
}

export default function DealerCard({ dealer, variant = 'default' }: DealerCardProps) {
  return (
    <Link href={`/dealers/${dealer.slug}`}>
      <article className={cn(
        'group bg-[#0D0D0D] border border-[#1A1A1A] transition-all duration-300',
        'hover:border-[#C6A64B]/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]',
        variant === 'featured' && 'border-[#222222]'
      )}>

        {/* Cover */}
        <div className="relative h-32 bg-[#111111] overflow-hidden">
          {dealer.cover_url ? (
            <Image
              src={dealer.cover_url}
              alt={dealer.name}
              fill
              className="object-cover opacity-50 group-hover:opacity-65 transition-opacity duration-500"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          ) : (
            /* Premium gradient fallback */
            <div className="absolute inset-0 bg-gradient-to-br from-[#161616] via-[#111111] to-[#0A0A0A]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(198,166,75,0.04)_0%,transparent_70%)]" />
            </div>
          )}

          {/* Badges */}
          {dealer.is_verified && (
            <div className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 text-[9px]
              tracking-[0.15em] uppercase text-[#C9C9C9] bg-[#0D0D0D]/90 border border-[#2A2A2A]">
              Revisado
            </div>
          )}
          {dealer.subscription_plan === 'elite' && (
            <div className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 text-[9px]
              tracking-[0.15em] uppercase text-[#C6A64B]/80 bg-[#0D0D0D]/90 border border-[#C6A64B]/20">
              Elite
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 -mt-5 relative">
          {/* Logo */}
          <div className="w-11 h-11 bg-[#111111] border border-[#1E1E1E] overflow-hidden mb-3 flex items-center justify-center">
            {dealer.logo_url ? (
              <Image
                src={dealer.logo_url}
                alt={`${dealer.name} logo`}
                width={44}
                height={44}
                className="object-contain p-1"
              />
            ) : (
              <span className="font-display text-xl font-light text-[#C6A64B]/60">
                {dealer.name[0]}
              </span>
            )}
          </div>

          <h3 className="font-medium text-[#D4D4D4] group-hover:text-[#F4F1EA] transition-colors duration-200 mb-1 text-[14px] tracking-wide">
            {dealer.name}
          </h3>

          {(dealer.location_city || dealer.location_region) && (
            <div className="flex items-center gap-1 text-[11px] text-[#575757] mb-3">
              <MapPin className="w-2.5 h-2.5" />
              {[dealer.location_city, dealer.location_region].filter(Boolean).join(', ')}
            </div>
          )}

          {dealer.vehicle_count !== undefined && (
            <div className="flex items-center gap-1 text-[11px] text-[#575757]">
              <Car className="w-3 h-3" />
              {dealer.vehicle_count} vehículos
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
