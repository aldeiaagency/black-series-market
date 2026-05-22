'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Coches', href: '/coches' },
  { label: 'Motos', href: '/motos' },
  {
    label: 'Marcas',
    href: '/marcas',
    children: [
      { label: 'Ferrari', href: '/coches?marca=ferrari' },
      { label: 'Lamborghini', href: '/coches?marca=lamborghini' },
      { label: 'McLaren', href: '/coches?marca=mclaren' },
      { label: 'Porsche', href: '/coches?marca=porsche' },
      { label: 'Bentley', href: '/coches?marca=bentley' },
      { label: 'Rolls-Royce', href: '/coches?marca=rolls-royce' },
      { label: 'BMW M', href: '/coches?marca=bmw' },
      { label: 'Mercedes AMG', href: '/coches?marca=mercedes-benz' },
      { label: 'Ver todas', href: '/marcas' },
    ],
  },
  { label: 'Concesionarios', href: '/dealers' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  const isHome = pathname === '/'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || !isHome
          ? 'bg-obsidian/95 backdrop-blur-md border-b border-bsm-border'
          : 'bg-gradient-to-b from-obsidian/80 to-transparent'
      )}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl font-light text-bsm-text-primary tracking-[0.15em] group-hover:text-gold transition-colors">
                BLACK SERIES
              </span>
              <span className="text-[10px] font-medium tracking-[0.4em] text-gold uppercase">
                Market
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 text-sm tracking-wide transition-colors duration-150',
                    pathname.startsWith(item.href) && item.href !== '/'
                      ? 'text-gold'
                      : 'text-bsm-text-secondary hover:text-bsm-text-primary'
                  )}
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-surface border border-bsm-border shadow-card animate-fade-in">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={cn(
                          'block px-4 py-2.5 text-sm transition-colors duration-150',
                          child.label === 'Ver todas'
                            ? 'text-gold border-t border-bsm-border mt-1 pt-3'
                            : 'text-bsm-text-secondary hover:text-bsm-text-primary hover:bg-surface-elevated'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/buscar" className="p-2 text-bsm-text-secondary hover:text-gold transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-ghost text-sm">
              Acceder
            </Link>
            <Link href="/registro" className="btn-gold text-sm px-5 py-2.5">
              Publicar vehículo
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-bsm-text-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-obsidian border-t border-bsm-border animate-slide-up">
          <div className="px-6 py-6 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block py-3 text-bsm-text-secondary hover:text-bsm-text-primary text-base border-b border-bsm-border/50"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 space-y-1 mt-1">
                    {item.children.slice(0, -1).map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block py-2 text-sm text-bsm-text-muted hover:text-gold"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-6 flex flex-col gap-3">
              <Link href="/login" className="btn-outline w-full justify-center">
                Acceder
              </Link>
              <Link href="/registro" className="btn-gold w-full justify-center">
                Publicar vehículo
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
