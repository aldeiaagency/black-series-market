'use client'

import { GitCompareArrows } from 'lucide-react'
import { useComparator } from '@/hooks/useComparator'
import { cn } from '@/lib/utils'

interface CompareButtonProps {
  vehicleId: string
  variant?: 'card' | 'detail'
  className?: string
}

export default function CompareButton({ vehicleId, variant = 'card', className }: CompareButtonProps) {
  const { isSelected, toggle, canAdd, mounted } = useComparator()
  const selected = mounted && isSelected(vehicleId)
  const disabled = !selected && !canAdd

  if (variant === 'detail') {
    return (
      <button
        onClick={() => { if (!disabled) toggle(vehicleId) }}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 border text-sm transition-all duration-200',
          selected
            ? 'border-[#C6A64B]/40 text-[#C6A64B] bg-[#C6A64B]/5'
            : disabled
              ? 'border-[#1A1A1A] text-[#3A3A3A] cursor-not-allowed'
              : 'border-[#2A2A2A] text-[#686868] hover:border-[#C6A64B]/30 hover:text-[#C9C9C9]',
          className
        )}
        title={disabled ? 'Máximo 3 vehículos en comparador' : undefined}
      >
        <GitCompareArrows className="w-4 h-4" />
        <span>{selected ? 'En comparador' : 'Comparar'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!disabled) toggle(vehicleId) }}
      disabled={disabled}
      className={cn(
        'w-8 h-8 flex items-center justify-center bg-[#0A0A0A]/80 backdrop-blur-sm border transition-all duration-200',
        selected
          ? 'border-[#C6A64B]/40 text-[#C6A64B]'
          : disabled
            ? 'border-[#1A1A1A] text-[#2A2A2A] cursor-not-allowed'
            : 'border-[#2A2A2A]/60 text-[#757575] hover:border-[#C6A64B]/30 hover:text-[#C9C9C9]',
        className
      )}
      title={disabled ? 'Máximo 3 vehículos' : selected ? 'Quitar del comparador' : 'Añadir al comparador'}
      aria-label={selected ? 'Quitar del comparador' : 'Añadir al comparador'}
    >
      <GitCompareArrows className="w-3.5 h-3.5" />
    </button>
  )
}
