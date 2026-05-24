'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  vehicleId: string
  variant?: 'card' | 'detail'
  className?: string
}

export default function FavoriteButton({ vehicleId, variant = 'card', className }: FavoriteButtonProps) {
  const { isFavorite, toggle, mounted } = useFavorites()
  const saved = mounted && isFavorite(vehicleId)

  if (variant === 'detail') {
    return (
      <button
        onClick={() => toggle(vehicleId)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 border text-sm transition-all duration-200',
          saved
            ? 'border-[#C6A64B]/40 text-[#C6A64B] bg-[#C6A64B]/5'
            : 'border-[#2A2A2A] text-[#8A8A8A] hover:border-[#C6A64B]/30 hover:text-[#C9C9C9]',
          className
        )}
        aria-label={saved ? 'Quitar de guardados' : 'Guardar vehículo'}
      >
        <Heart className={cn('w-4 h-4', saved ? 'fill-[#C6A64B] text-[#C6A64B]' : '')} />
        <span>{saved ? 'Guardado' : 'Guardar vehículo'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(vehicleId) }}
      className={cn(
        'w-8 h-8 flex items-center justify-center bg-[#0A0A0A]/80 backdrop-blur-sm border transition-all duration-200',
        saved
          ? 'border-[#C6A64B]/40 text-[#C6A64B]'
          : 'border-[#2A2A2A]/60 text-[#757575] hover:border-[#C6A64B]/30 hover:text-[#C9C9C9]',
        className
      )}
      aria-label={saved ? 'Quitar de guardados' : 'Guardar vehículo'}
    >
      <Heart className={cn('w-3.5 h-3.5', saved ? 'fill-[#C6A64B]' : '')} />
    </button>
  )
}
