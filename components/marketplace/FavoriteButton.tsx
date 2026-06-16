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

  function handleClick(e?: React.MouseEvent) {
    if (e) { e.preventDefault(); e.stopPropagation() }
    if (!mounted) return
    toggle(vehicleId)
  }

  if (variant === 'detail') {
    return (
      <button
        onClick={() => handleClick()}
        title={saved ? 'Quitar de guardados' : 'Guardar vehículo'}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 border text-xs transition-all duration-200',
          saved
            ? 'border-[#C6A64B]/40 text-[#C6A64B] bg-[#C6A64B]/5'
            : 'border-[#2A2A2A] text-[#8A8A8A] hover:border-[#C6A64B]/30 hover:text-[#C9C9C9]',
          className
        )}
        aria-label={saved ? 'Quitar de guardados' : 'Guardar vehículo'}
      >
        <Heart className={cn('w-3.5 h-3.5', saved ? 'fill-[#C6A64B] text-[#C6A64B]' : '')} />
        <span>{saved ? 'Guardado' : 'Guardar'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={(e) => handleClick(e)}
      title={saved ? 'Quitar de guardados' : 'Guardar vehículo'}
      className={cn(
        'w-9 h-9 flex items-center justify-center bg-black/75 backdrop-blur-md border transition-all duration-200',
        saved
          ? 'border-[#C6A64B]/50 text-[#C6A64B]'
          : 'border-[#3A3A3A] text-[#A0A0A0] hover:border-[#C6A64B]/50 hover:text-white hover:bg-black/90',
        className
      )}
      aria-label={saved ? 'Quitar de guardados' : 'Guardar vehículo'}
    >
      <Heart className={cn('w-4 h-4', saved ? 'fill-[#C6A64B]' : '')} />
    </button>
  )
}
