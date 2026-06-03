'use client'

import { useState } from 'react'
import { Share2, Link as LinkIcon, Check } from 'lucide-react'

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  label?: string
  className?: string
}

export default function ShareButton({
  title,
  text,
  url,
  label = 'Compartir',
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
        return
      } catch {
        // User cancelled or share not supported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard not available — silent fail
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 transition-colors duration-150 ${className}`}
      aria-label={label}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">Enlace copiado</span>
        </>
      ) : (
        <>
          {typeof navigator !== 'undefined' && 'share' in navigator
            ? <Share2 className="w-3.5 h-3.5" />
            : <LinkIcon className="w-3.5 h-3.5" />
          }
          {label}
        </>
      )}
    </button>
  )
}
