'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Eye, Heart, MapPin, Gauge, Calendar } from 'lucide-react'
import { cn, formatPrice, formatMileage, FUEL_LABELS } from '@/lib/utils'
import type { Vehicle } from '@/lib/types'

interface VehicleCardProps {
  vehicle: Vehicle
  variant?: 'default' | 'compact'
}

const BADGE_STYLES: Record<string, string> = {
  'Exclusivo': 'badge-gold',
  'Recién llegado': 'badge text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
  'Última unidad': 'badge text-amber-400 bg-amber-400/10 border border-amber-400/20',
  'Reservado': 'badge text-bsm-text-muted bg-surface border border-bsm-border',
  'Editor\'s Pick': 'badge text-gold bg-gold/10 border border-gold/20',
}

export default function VehicleCard({ vehicle, variant = 'default' }: VehicleCardProps) {
  const primaryImage = vehicle.images?.[0]?.url || '/placeholder-car.jpg'
  const title = vehicle.title || `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year}`

  return (
    <Link href={`/${vehicle.vehicle_type === 'car' ? 'coches' : 'motos'}/${vehicle.slug}`}>
      <article className="vehicle-card group cursor-pointer">
        {/* Image */}
        <div className="vehicle-card-image relative aspect-[16/10] overflow-hidden bg-surface-elevated">
          <Image
            src={primaryImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {vehicle.is_featured && (
              <span className="badge-gold text-[10px]">Destacado</span>
            )}
            {vehicle.is_editors_pick && (
              <span className="badge text-[10px] text-gold bg-obsidian/80 border border-gold/30">
                Editor&apos;s Pick
              </span>
            )}
            {vehicle.badge && (
              <span className={cn(
                BADGE_STYLES[vehicle.badge] || 'badge-muted',
                'text-[10px]'
              )}>
                {vehicle.badge}
              </span>
            )}
          </div>

          {/* Quick stats overlay */}
          <div className="absolute bottom-3 right-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1 text-xs text-white/70 bg-obsidian/70 px-2 py-1">
              <Eye className="w-3 h-3" />
              {vehicle.views}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/70 bg-obsidian/70 px-2 py-1">
              <Heart className="w-3 h-3" />
              {vehicle.favorites_count}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand & Model */}
          <div className="mb-1">
            <span className="text-xs text-gold tracking-widest uppercase font-medium">
              {vehicle.brand_name}
            </span>
          </div>
          <h3 className="font-display text-lg font-light text-bsm-text-primary leading-tight mb-3 group-hover:text-gold transition-colors">
            {vehicle.model_name}
            {vehicle.version && (
              <span className="text-bsm-text-secondary font-sans text-sm font-normal ml-2">
                {vehicle.version}
              </span>
            )}
          </h3>

          {/* Key specs */}
          <div className="flex items-center gap-4 mb-4 text-xs text-bsm-text-secondary">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {vehicle.year}
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" />
              {formatMileage(vehicle.mileage_km)}
            </span>
            {vehicle.fuel_type && (
              <span className="hidden sm:flex items-center gap-1.5">
                {FUEL_LABELS[vehicle.fuel_type]}
              </span>
            )}
          </div>

          {/* Separator */}
          <div className="h-px bg-bsm-border mb-4" />

          {/* Price & Dealer */}
          <div className="flex items-end justify-between">
            <div>
              <div className={cn(
                'font-display text-xl font-light',
                vehicle.price_on_request ? 'text-bsm-text-secondary text-base' : 'text-gold'
              )}>
                {formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request)}
              </div>
              {vehicle.dealer && (
                <div className="flex items-center gap-1 mt-1 text-xs text-bsm-text-muted">
                  <MapPin className="w-3 h-3" />
                  {vehicle.dealer.location_city || vehicle.dealer.name}
                </div>
              )}
            </div>
            {vehicle.power_hp && (
              <div className="text-right">
                <div className="text-lg font-display font-light text-bsm-text-primary">
                  {vehicle.power_hp}
                </div>
                <div className="text-[10px] text-bsm-text-muted uppercase tracking-wide">CV</div>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
