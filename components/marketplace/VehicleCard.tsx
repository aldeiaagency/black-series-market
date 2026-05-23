'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Gauge, Calendar } from 'lucide-react'
import { cn, formatPrice, formatMileage, FUEL_LABELS } from '@/lib/utils'
import type { Vehicle } from '@/lib/types'

interface VehicleCardProps {
  vehicle: Vehicle
  variant?: 'default' | 'compact'
}

export default function VehicleCard({ vehicle, variant = 'default' }: VehicleCardProps) {
  const [imgError, setImgError] = useState(false)
  const primaryImage = vehicle.images?.[0]?.url
  const title = vehicle.title || `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year}`

  const showFeatured = vehicle.is_featured
  const showPick = vehicle.is_editors_pick && !vehicle.is_featured
  const showBadge = vehicle.badge && !showFeatured && !showPick

  return (
    <Link href={`/${vehicle.vehicle_type === 'car' ? 'coches' : 'motos'}/${vehicle.slug}`}>
      <article className={cn(
        'group relative bg-[#0D0D0D] border border-[#1A1A1A] overflow-hidden cursor-pointer',
        'transition-all duration-300 hover:border-[#C6A64B]/25 hover:shadow-[0_8px_40px_rgba(0,0,0,0.7)]'
      )}>

        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#111111]">
          {primaryImage && !imgError ? (
            <Image
              src={primaryImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImgError(true)}
            />
          ) : (
            /* Premium fallback */
            <div className="absolute inset-0 bg-[#111111] flex flex-col items-center justify-center gap-3">
              <span className="font-display text-4xl font-light text-[#2A2A2A] tracking-widest select-none">
                {vehicle.brand_name?.[0] || 'BL'}
              </span>
              <span className="text-[10px] text-[#2A2A2A] tracking-[0.25em] uppercase select-none">
                Imagen no disponible
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/70 via-transparent to-transparent" />

          {/* Badge — max 1 shown */}
          <div className="absolute top-3 left-3">
            {showFeatured && (
              <span className="inline-flex items-center px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase
                text-[#C6A64B] bg-[#C6A64B]/10 border border-[#C6A64B]/25 font-medium">
                Destacado
              </span>
            )}
            {showPick && (
              <span className="inline-flex items-center px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase
                text-[#C9C9C9] bg-[#1A1A1A]/90 border border-[#2A2A2A] font-medium">
                Selection
              </span>
            )}
            {showBadge && (
              <span className="inline-flex items-center px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase
                text-[#9A9A9A] bg-[#141414]/90 border border-[#222222] font-medium">
                {vehicle.badge}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-3.5">
          {/* Brand */}
          <div className="mb-0.5">
            <span className="text-[10px] text-[#C6A64B]/80 tracking-[0.25em] uppercase font-medium">
              {vehicle.brand_name}
            </span>
          </div>

          {/* Model */}
          <h3 className="font-display text-[18px] font-light text-[#EBEBEB] leading-snug mb-0.5
            group-hover:text-white transition-colors duration-200">
            {vehicle.model_name}
          </h3>
          {vehicle.version && (
            <p className="text-[12px] text-[#686868] mb-3 leading-tight">{vehicle.version}</p>
          )}

          {/* Specs */}
          <div className="flex items-center gap-3.5 mb-4 text-[12px] text-[#686868]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#474747]" />
              {vehicle.year}
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3 h-3 text-[#474747]" />
              {formatMileage(vehicle.mileage_km)}
            </span>
            {vehicle.fuel_type && (
              <span className="hidden sm:block text-[#575757]">
                {FUEL_LABELS[vehicle.fuel_type]}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#1A1A1A] mb-3.5" />

          {/* Price + Power */}
          <div className="flex items-end justify-between">
            <div>
              <div className={cn(
                'font-display text-[20px] font-light leading-none',
                vehicle.price_on_request ? 'text-[#686868] text-[16px]' : 'text-[#C6A64B]'
              )}>
                {formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request)}
              </div>
              {vehicle.dealer && (
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#575757]">
                  <MapPin className="w-2.5 h-2.5" />
                  {vehicle.dealer.location_city || vehicle.dealer.name}
                </div>
              )}
            </div>
            {vehicle.power_hp && (
              <div className="text-right">
                <div className="font-display text-[18px] font-light text-[#D4D4D4]">
                  {vehicle.power_hp}
                </div>
                <div className="text-[9px] text-[#575757] uppercase tracking-[0.15em]">CV</div>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
