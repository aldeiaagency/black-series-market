import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Car } from 'lucide-react'
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
        'group bg-surface border border-bsm-border transition-all duration-300 hover:border-gold/30 hover:shadow-card',
        variant === 'featured' && 'border-gold/20'
      )}>
        {/* Cover */}
        <div className="relative h-32 bg-surface-elevated overflow-hidden">
          {dealer.cover_url ? (
            <Image
              src={dealer.cover_url}
              alt={dealer.name}
              fill
              className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-obsidian-50 to-obsidian" />
          )}
          {dealer.is_verified && (
            <div className="absolute top-3 right-3 badge-gold text-[10px]">
              Verificado
            </div>
          )}
          {dealer.subscription_plan === 'elite' && (
            <div className="absolute top-3 left-3 badge text-[10px] text-gold bg-obsidian/80 border border-gold/30">
              Elite
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 -mt-6 relative">
          {/* Logo */}
          <div className="w-12 h-12 bg-surface border border-bsm-border overflow-hidden mb-3">
            {dealer.logo_url ? (
              <Image
                src={dealer.logo_url}
                alt={`${dealer.name} logo`}
                width={48}
                height={48}
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-display text-gold">
                  {dealer.name[0]}
                </span>
              </div>
            )}
          </div>

          <h3 className="font-medium text-bsm-text-primary group-hover:text-gold transition-colors mb-1">
            {dealer.name}
          </h3>

          {(dealer.location_city || dealer.location_region) && (
            <div className="flex items-center gap-1 text-xs text-bsm-text-muted mb-3">
              <MapPin className="w-3 h-3" />
              {[dealer.location_city, dealer.location_region].filter(Boolean).join(', ')}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-bsm-text-muted">
            {dealer.vehicle_count !== undefined && (
              <span className="flex items-center gap-1">
                <Car className="w-3.5 h-3.5" />
                {dealer.vehicle_count} vehículos
              </span>
            )}
            {dealer.avg_rating !== undefined && dealer.avg_rating > 0 && (
              <span className="flex items-center gap-1 text-gold">
                <Star className="w-3.5 h-3.5 fill-gold" />
                {dealer.avg_rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
