'use client'

import { useEffect, useRef } from 'react'

/**
 * Accesibilidad de modales: focus-trap, cierre con Escape, bloqueo de scroll del body y retorno
 * del foco al elemento que abrió el modal. Devuelve un ref para el contenedor del diálogo.
 *
 * Uso:
 *   const ref = useModalA11y(isOpen, onClose)
 *   <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="...">…</div>
 */
export function useModalA11y(isOpen: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const node = ref.current
    const prevFocus = document.activeElement as HTMLElement | null

    const focusables = () =>
      node
        ? Array.from(
            node.querySelectorAll<HTMLElement>(
              'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => el.offsetParent !== null)
        : []

    // Enfoca el primer elemento del modal al abrir.
    const t = window.setTimeout(() => focusables()[0]?.focus(), 0)

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Tab') {
        const els = focusables()
        if (els.length === 0) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus()
    }
  }, [isOpen, onClose])

  return ref
}
