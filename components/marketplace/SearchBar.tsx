'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

const QUICK_SEARCHES = [
  { label: 'Ferrari F8', href: '/coches?search=Ferrari+F8' },
  { label: 'Lamborghini Huracán', href: '/coches?search=Lamborghini+Huracan' },
  { label: 'Porsche 911', href: '/coches?search=Porsche+911' },
  { label: 'McLaren 720S', href: '/coches?search=McLaren+720S' },
  { label: 'BMW M5 Competition', href: '/coches?search=BMW+M5' },
  { label: 'Mercedes AMG GT', href: '/coches?search=Mercedes+AMG+GT' },
  { label: 'Ducati Panigale V4', href: '/motos?search=Ducati+Panigale' },
  { label: 'MV Agusta F4', href: '/motos?search=MV+Agusta+F4' },
]

interface SearchBarProps {
  placeholder?: string
  className?: string
  size?: 'default' | 'hero'
}

export default function SearchBar({
  placeholder = 'Buscar por marca, modelo...',
  className = '',
  size = 'default',
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
      setFocused(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className={`relative flex items-center ${size === 'hero' ? 'h-16' : 'h-12'}`}>
          <Search className={`absolute left-4 ${size === 'hero' ? 'w-5 h-5' : 'w-4 h-4'} text-bsm-text-muted pointer-events-none`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={placeholder}
            className={`w-full bg-surface border border-bsm-border text-bsm-text-primary placeholder-bsm-text-muted
              focus:outline-none focus:border-gold/50 transition-colors duration-200
              ${size === 'hero' ? 'pl-14 pr-16 text-base' : 'pl-11 pr-14 text-sm'}
              h-full`}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="absolute right-14 p-1 text-bsm-text-muted hover:text-bsm-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className={`absolute right-0 h-full px-5 bg-gold text-obsidian font-medium text-sm
              hover:bg-gold-light transition-colors duration-200`}
          >
            {size === 'hero' ? 'Buscar' : <Search className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {focused && (
        <div className="absolute top-full left-0 right-0 z-40 bg-surface border border-bsm-border border-t-0 shadow-card">
          <div className="p-4">
            <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">
              Búsquedas populares
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { router.push(s.href); setFocused(false) }}
                  className="text-xs px-3 py-1.5 border border-bsm-border text-bsm-text-secondary
                    hover:border-gold/40 hover:text-gold transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
