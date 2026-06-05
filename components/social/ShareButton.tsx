'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Link as LinkIcon, Check, Mail } from 'lucide-react'

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  label?: string
  className?: string
}

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function ShareButton({
  title,
  text,
  url,
  label = 'Compartir',
  className = '',
}: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasNative, setHasNative] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHasNative(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])

  useEffect(() => {
    function onMouse(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  function getUrl() {
    return url || (typeof window !== 'undefined' ? window.location.href : '')
  }

  async function handleNative() {
    const shareUrl = getUrl()
    try { await navigator.share({ title, text, url: shareUrl }); setOpen(false) } catch {}
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getUrl())
      setCopied(true)
      setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
    } catch {}
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 transition-colors duration-150 ${className}`}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Share2 className="w-3.5 h-3.5" />
        {label}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#0E0E0E] border border-[#2A2A2A] shadow-[0_8px_24px_rgba(0,0,0,0.6)] z-30 animate-fade-in">
          {hasNative && (
            <button
              onClick={handleNative}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#9A9A9A] hover:text-[#C9C9C9] hover:bg-[#141414] transition-colors text-left"
            >
              <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
              Compartir
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#9A9A9A] hover:text-[#C9C9C9] hover:bg-[#141414] transition-colors text-left"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
              : <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />}
            <span className={copied ? 'text-emerald-400' : ''}>{copied ? 'Enlace copiado' : 'Copiar enlace'}</span>
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + getUrl())}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#9A9A9A] hover:text-[#C9C9C9] hover:bg-[#141414] transition-colors"
          >
            <WaIcon />
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + ' ' + getUrl())}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#9A9A9A] hover:text-[#C9C9C9] hover:bg-[#141414] transition-colors"
          >
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            Email
          </a>
        </div>
      )}
    </div>
  )
}
