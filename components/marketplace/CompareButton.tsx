'use client'

import { GitCompareArrows } from 'lucide-react'
import { useComparator, type CompareVehicle } from '@/hooks/useComparator'
import { cn } from '@/lib/utils'

interface CompareButtonProps {
  vehicle: CompareVehicle
  variant?: 'card' | 'detail'
  className?: string
}

export default function CompareButton({ vehicle, variant = 'card', className }: CompareButtonProps) {
  const { isSelected, toggle, canAdd, mounted } = useComparator()
  const sel      = mounted && isSelected(vehicle.id)
  const disabled = !sel && !canAdd

  function handleClick(e?: React.MouseEvent) {
    if (variant === 'card') { e?.preventDefault(); e?.stopPropagation() }
    if (!disabled) toggle(vehicle)
  }

  if (variant === 'detail') {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 border text-xs transition-all duration-200',
          sel
            ? 'border-gold/40 text-gold bg-gold/5'
            : disabled
              ? 'border-[#1A1A1A] text-[#8A8A8A] cursor-not-allowed'
              : 'border-bsm-border text-[#8A8A8A] hover:border-gold/30 hover:text-[#C9C9C9]',
          className
        )}
        title={disabled ? 'Máximo 3 vehículos en comparador' : undefined}
      >
        <GitCompareArrows className="w-3.5 h-3.5" />
        <span>{sel ? 'En comparador' : 'Comparar'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-9 h-9 flex items-center justify-center bg-black/75 backdrop-blur-md border transition-all duration-200',
        sel
          ? 'border-gold/50 text-gold'
          : disabled
            ? 'border-[#1A1A1A] text-bsm-border cursor-not-allowed'
            : 'border-[#3A3A3A] text-[#A0A0A0] hover:border-gold/50 hover:text-white hover:bg-black/90',
        className
      )}
      title={disabled ? 'Máximo 3 vehículos' : sel ? 'Quitar del comparador' : 'Añadir al comparador'}
      aria-label={sel ? 'Quitar del comparador' : 'Añadir al comparador'}
    >
      <GitCompareArrows className="w-4 h-4" />
    </button>
  )
}
