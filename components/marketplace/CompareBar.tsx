'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { X, GitCompareArrows } from 'lucide-react'
import { useComparator } from '@/hooks/useComparator'

const MAX = 3

export default function CompareBar() {
  const { selected, remove, clear, mounted } = useComparator()
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setVisible(mounted && selected.length > 0)
  }, [mounted, selected.length])

  // En /comparar la tabla se pinta del ?ids= de la URL. Sincronización DIRIGIDA POR ACCIÓN:
  // al quitar/limpiar en la barra estando en /comparar, actualizamos también la URL para que la
  // tabla cambie al instante. Es por acción (no un effect sobre el estado) para no sobrescribir
  // un enlace compartido /comparar?ids=… abierto por alguien con otra selección local.
  function handleRemove(id: string) {
    remove(id)
    if (pathname === '/comparar') {
      const ids = selected.filter(v => v.id !== id).map(v => v.id).join(',')
      router.replace(ids ? `/comparar?ids=${ids}` : '/comparar')
    }
  }
  function handleClear() {
    clear()
    if (pathname === '/comparar') router.replace('/comparar')
  }

  if (!visible) return null

  const compareUrl = `/comparar?ids=${selected.map(v => v.id).join(',')}`
  const canCompare = selected.length >= 2

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#C6A64B]/20 bg-[#0A0A0A]/97 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-12 py-3 flex items-center gap-4 flex-wrap lg:flex-nowrap justify-between">

        {/* Slots */}
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
          <GitCompareArrows className="w-4 h-4 text-[#C6A64B] shrink-0" />

          {/* Filled slots */}
          {selected.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-2 border border-[#2A2A2A] bg-[#111] px-2 py-1.5 shrink-0"
            >
              {v.primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.primaryImage}
                  alt=""
                  className="w-10 h-7 object-cover shrink-0 bg-[#0D0D0D]"
                />
              ) : (
                <div className="w-10 h-7 bg-[#1A1A1A] flex items-center justify-center shrink-0">
                  <span className="text-[9px] text-[#444] font-display">{v.brand_name[0]}</span>
                </div>
              )}
              <div className="min-w-0 max-w-[110px]">
                <div className="text-[9px] text-[#C6A64B]/70 uppercase tracking-widest truncate">{v.brand_name}</div>
                <div className="text-[11px] text-[#C9C9C9] truncate leading-tight">{v.model_name}</div>
              </div>
              <button
                onClick={() => handleRemove(v.id)}
                className="text-[#555] hover:text-[#C9C9C9] transition-colors shrink-0 ml-1"
                aria-label={`Quitar ${v.brand_name} ${v.model_name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: MAX - selected.length }).map((_, i) => (
            <div
              key={i}
              className="w-[130px] h-[46px] border border-dashed border-[#222] flex items-center justify-center shrink-0"
            >
              <span className="text-[10px] text-[#333]">+ Añadir</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {!canCompare && (
            <span className="hidden lg:block text-[11px] text-[#555]">
              Añade {2 - selected.length} más para comparar
            </span>
          )}
          <button
            onClick={handleClear}
            className="text-xs text-[#666] hover:text-[#C9C9C9] transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
          {canCompare && (
            <Link
              href={compareUrl}
              className="px-5 py-2 text-[12px] tracking-[0.08em] font-medium uppercase
                bg-[#C6A64B] text-[#0A0A0A] hover:bg-[#D4B560] transition-colors whitespace-nowrap"
            >
              Comparar {selected.length} vehículos
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
