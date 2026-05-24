'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, GitCompareArrows } from 'lucide-react'
import { useComparator } from '@/hooks/useComparator'

export default function CompareBar() {
  const { selected, clear, mounted } = useComparator()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(mounted && selected.length >= 2)
  }, [mounted, selected.length])

  if (!visible) return null

  const compareUrl = `/comparar?ids=${selected.join(',')}`

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#C6A64B]/20 bg-[#0A0A0A]/97 backdrop-blur-md animate-slide-up">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <GitCompareArrows className="w-4 h-4 text-[#C6A64B]" />
          <span className="text-sm text-[#C9C9C9]">
            {selected.length} vehículo{selected.length !== 1 ? 's' : ''} seleccionado{selected.length !== 1 ? 's' : ''} para comparar
          </span>
          {selected.length < 3 && (
            <span className="text-xs text-[#808080]">
              (puedes añadir {3 - selected.length} más)
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clear}
            className="flex items-center gap-1.5 text-xs text-[#808080] hover:text-[#C9C9C9] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
          <Link
            href={compareUrl}
            className="px-5 py-2 text-[12px] tracking-[0.08em] font-medium uppercase
              bg-[#C6A64B] text-[#0A0A0A] hover:bg-[#D4B560] transition-colors duration-200"
          >
            Comparar ahora
          </Link>
        </div>
      </div>
    </div>
  )
}
