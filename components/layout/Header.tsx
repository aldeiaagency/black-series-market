'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Search, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import Logo from '@/components/brand/Logo'
import CompareBar from '@/components/marketplace/CompareBar'

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
  { label: 'Showrooms', href: '/dealers' },
  { label: 'Búsqueda privada', href: '/busqueda-privada' },
  { label: 'Cómo funciona', href: '/como-funciona' },
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
    <>
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled || !isHome
          ? 'bg-[#080808]/96 backdrop-blur-md border-b border-[#1E1E1E]'
          : 'bg-gradient-to-b from-[#080808]/70 to-transparent'
      )}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <Logo width={144} variant="header" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
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
                    'flex items-center gap-1 px-3.5 py-2 text-[13px] tracking-[0.06em] transition-colors duration-150',
                    pathname.startsWith(item.href) && item.href !== '/'
                      ? 'text-[#C9C9C9]'
                      : 'text-[#757575] hover:text-[#C9C9C9]'
                  )}
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3 h-3 opacity-60" />}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-[#0E0E0E] border border-[#1E1E1E] shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-fade-in">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={cn(
                          'block px-4 py-2.5 text-[13px] transition-colors duration-150',
                          child.label === 'Ver todas'
                            ? 'text-[#C9C9C9] border-t border-[#1E1E1E] mt-1 pt-3'
                            : 'text-[#757575] hover:text-[#C9C9C9] hover:bg-[#141414]'
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
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link href="/buscar" className="p-2 text-[#575757] hover:text-[#C9C9C9] transition-colors" title="Buscar">
              <Search className="w-4 h-4" />
            </Link>
            <Link href="/mis-favoritos" className="p-2 text-[#575757] hover:text-[#C9C9C9] transition-colors" title="Mis favoritos">
              <Heart className="w-4 h-4" />
            </Link>
            <Link href="/login" className="px-4 py-2 text-[13px] text-[#757575] hover:text-[#C9C9C9] tracking-wide transition-colors">
              Acceder
            </Link>
            <Link
              href="/registro-comprador"
              className="px-5 py-2.5 text-[12px] tracking-[0.1em] font-medium uppercase
                border border-[#C6A64B]/60 text-[#C6A64B]
                hover:bg-[#C6A64B]/8 hover:border-[#C6A64B]
                transition-all duration-200"
            >
              Registrarse
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-[#757575] hover:text-[#C9C9C9] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#080808] border-t border-[#1E1E1E] animate-slide-up">
          <div className="px-6 py-6 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block py-3 text-[#9A9A9A] hover:text-[#C9C9C9] text-[15px] tracking-wide border-b border-[#141414]"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 space-y-0.5 py-1">
                    {item.children.slice(0, -1).map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block py-2 text-[13px] text-[#575757] hover:text-[#C6A64B]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-6 flex flex-col gap-3">
              <Link href="/login" className="btn-outline w-full justify-center text-sm">
                Acceder
              </Link>
              <Link href="/registro-comprador" className="btn-gold w-full justify-center text-sm">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
    <CompareBar />
    </>
  )
}
