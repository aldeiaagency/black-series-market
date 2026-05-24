'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Gauge, Calendar } from 'lucide-react'
import { cn, formatPrice, formatMileage, FUEL_LABELS } from '@/lib/utils'
import type { Vehicle } from '@/lib/types'
import FavoriteButton from '@/components/marketplace/FavoriteButton'
import CompareButton from '@/components/marketplace/CompareButton'
import DealerInlineCard from '@/components/marketplace/DealerInlineCard'

interface VehicleCardProps {
  vehicle: Vehicle & { dealer?: any }
  variant?: 'default' | 'compact'
}

function isNewVehicle(publishedAt: string | null): boolean {
  if (!publishedAt) return false
  return Date.now() - new Date(publishedAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

const STATUS_CONFIG = {
  sold:    { label: 'Vendido',        cls: 'text-[#9A9A9A] bg-[#141414]/95 border-[#2A2A2A]' },
  paused:  { label: 'Reservado',      cls: 'text-[#C6A64B] bg-[#141414]/95 border-[#C6A64B]/30' },
  expired: { label: 'No disponible',  cls: 'text-[#9A9A9A] bg-[#141414]/95 border-[#2A2A2A]' },
} as const

export default function VehicleCard({ vehicle, variant = 'default' }: VehicleCardProps) {
  const [imgError, setImgError] = useState(false)
  const primaryImage = vehicle.images?.[0]?.url
  const href = `/${vehicle.vehicle_type === 'car' ? 'coches' : 'motos'}/${vehicle.slug}`

  const title = vehicle.title || `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year}`

  const isActive = vehicle.status === 'active'
  const statusOverlay = !isActive && vehicle.status in STATUS_CONFIG
    ? STATUS_CONFIG[vehicle.status as keyof typeof STATUS_CONFIG]
    : null

  // Badge priority: featured > editors_pick > new arrival > custom; max 2 badges total
  const showFeatured   = vehicle.is_featured && isActive
  const showPick       = vehicle.is_editors_pick && !vehicle.is_featured && isActive
  const showNew        = !showFeatured && !showPick && isActive && isNewVehicle(vehicle.published_at)
  const showBadge      = vehicle.badge && !showFeatured && !showPick && !showNew && isActive

  return (
    <article className={cn(
      'group relative bg-[#0D0D0D] border border-[#1A1A1A] overflow-hidden',
      'transition-all duration-300 hover:border-[#C6A64B]/25 hover:shadow-[0_8px_40px_rgba(0,0,0,0.7)]',
      !isActive && 'opacity-75'
    )}>

      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#111111]">
        <Link href={href} className="absolute inset-0 z-10" tabIndex={-1} aria-hidden="true" />
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
          <div className="absolute inset-0 bg-[#111111] flex flex-col items-center justify-center gap-3">
            <span className="font-display text-4xl font-light text-[#2A2A2A] tracking-widest select-none">
              {vehicle.brand_name?.[0] || 'BL'}
            </span>
            <span className="text-[10px] text-[#2A2A2A] tracking-[0.25em] uppercase select-none">
              Imagen no disponible
            </span>
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/70 via-transparent to-transparent pointer-events-none" />

        {/* Status overlay (sold/reserved) */}
        {statusOverlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className={cn(
              'px-4 py-2 text-[11px] tracking-[0.2em] uppercase font-medium border',
              statusOverlay.cls
            )}>
              {statusOverlay.label}
            </span>
          </div>
        )}

        {/* Top badges — max 2 */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-1">
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
          {showNew && (
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase
              text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 font-medium">
              Recién llegado
            </span>
          )}
          {showBadge && (
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase
              text-[#9A9A9A] bg-[#141414]/90 border border-[#222222] font-medium">
              {vehicle.badge}
            </span>
          )}
        </div>

        {/* Action buttons — top right */}
        {isActive && (
          <div className="absolute top-3 right-3 z-20 flex gap-1.5
            opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <FavoriteButton vehicleId={vehicle.id} variant="card" />
            <CompareButton vehicleId={vehicle.id} variant="card" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-3.5">
        <Link href={href} className="block">
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
            <div className={cn(
              'font-display text-[20px] font-light leading-none',
              vehicle.price_on_request ? 'text-[#686868] text-[16px]' : 'text-[#C6A64B]'
            )}>
              {formatPrice(vehicle.price, vehicle.currency, vehicle.price_on_request)}
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
        </Link>

        {/* Dealer row — separate link so it doesn't nest inside the vehicle link */}
        {vehicle.dealer ? (
          <div className="mt-3 pt-2.5 border-t border-[#1A1A1A]">
            <DealerInlineCard dealer={vehicle.dealer} variant="card" />
          </div>
        ) : (
          <div className="mt-3 pt-2.5 border-t border-[#1A1A1A]">
            <span className="text-[11px] text-[#3A3A3A] italic">Vendedor pendiente de confirmar</span>
          </div>
        )}
      </div>
    </article>
  )
}
