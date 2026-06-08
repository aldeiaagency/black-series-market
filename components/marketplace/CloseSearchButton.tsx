'use client'

import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

/**
 * Close (X) for the full-page search screen. Returns to the previous page when there
 * is history; otherwise falls back to the marketplace home so the user is never stuck.
 */
export default function CloseSearchButton({ className = '' }: { className?: string }) {
  const router = useRouter()

  function close() {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/')
  }

  return (
    <button
      onClick={close}
      aria-label="Cerrar búsqueda"
      className={`inline-flex items-center justify-center w-9 h-9 border border-bsm-border text-bsm-text-muted hover:border-gold/40 hover:text-gold transition-colors ${className}`}
    >
      <X className="w-5 h-5" />
    </button>
  )
}
