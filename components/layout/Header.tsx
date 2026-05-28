'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, Search, Heart, LogOut, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import Logo from '@/components/brand/Logo'
import CompareBar from '@/components/marketplace/CompareBar'
import { createClient } from '@/lib/supabase/client'

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
  { label: 'Vehículos a la carta', href: '/busqueda-privada' },
  { label: 'Cómo funciona', href: '/como-funciona' },
]

interface AuthUser {
  id: string
  email?: string
  user_metadata?: { full_name?: string }
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isDealer, setIsDealer] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
    setUserMenuOpen(false)
  }, [pathname])

  // Auth state
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) checkDealer(user.id, supabase)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) checkDealer(u.id, supabase)
      else setIsDealer(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkDealer(userId: string, supabase: ReturnType<typeof createClient>) {
    const { data } = await supabase.from('dealers').select('id').eq('profile_id', userId).single()
    setIsDealer(!!data)
  }

  // Close user menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setIsDealer(false)
    router.push('/')
    router.refresh()
  }

  const isHome = pathname === '/'
  const userInitial = user?.user_metadata?.full_name?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || '?'

  return (
    <>
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled || !isHome
          ? 'backdrop-blur-md border-b border-[#2A1E16]'
          : ''
      )}
      style={
        scrolled || !isHome
          ? { background: 'linear-gradient(180deg, rgba(58,45,36,0.97) 0%, rgba(42,33,28,0.97) 45%, rgba(5,5,5,0.97) 100%)' }
          : { background: 'linear-gradient(180deg, rgba(58,45,36,0.50) 0%, rgba(5,5,5,0) 100%)' }
      }
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <Logo width={180} variant="header" />
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
            <Link href="/buscar" className="p-2 text-[#808080] hover:text-[#C9C9C9] transition-colors" title="Buscar">
              <Search className="w-4 h-4" />
            </Link>

            {user ? (
              <>
                {/* Heart → cuenta/favoritos */}
                <Link href="/cuenta/favoritos" className="p-2 text-[#808080] hover:text-[#C9C9C9] transition-colors" title="Mis favoritos">
                  <Heart className="w-4 h-4" />
                </Link>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium
                      bg-[#C6A64B]/15 border border-[#C6A64B]/40 text-[#C6A64B]
                      hover:bg-[#C6A64B]/25 transition-colors"
                    aria-label="Menú de usuario"
                  >
                    {userInitial}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-[#0E0E0E] border border-[#1E1E1E]
                      shadow-[0_8px_32px_rgba(0,0,0,0.7)] animate-fade-in">
                      {/* Email */}
                      <div className="px-4 py-3 border-b border-[#1A1A1A]">
                        <p className="text-[11px] text-[#808080] truncate">{user.email}</p>
                      </div>
                      {/* Links */}
                      <div className="py-1">
                        <Link href="/cuenta/favoritos"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#9A9A9A] hover:text-[#C9C9C9] hover:bg-[#141414] transition-colors">
                          <Heart className="w-3.5 h-3.5" />
                          Mis favoritos
                        </Link>
                        <Link href="/cuenta/alertas"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#9A9A9A] hover:text-[#C9C9C9] hover:bg-[#141414] transition-colors">
                          <Bell className="w-3.5 h-3.5" />
                          Mis alertas
                        </Link>
                        {isDealer && (
                          <Link href="/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#9A9A9A] hover:text-[#C9C9C9] hover:bg-[#141414] transition-colors">
                            <User className="w-3.5 h-3.5" />
                            Mi panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-[#1A1A1A] py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-[#808080] hover:text-red-400 hover:bg-[#141414] transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/mis-favoritos" className="p-2 text-[#808080] hover:text-[#C9C9C9] transition-colors" title="Mis favoritos">
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
              </>
            )}
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
        <div className="lg:hidden border-t border-[#2A1E16] animate-slide-up" style={{ background: 'linear-gradient(180deg, #3A2D24 0%, #2A211C 45%, #050505 100%)' }}>
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
                        className="block py-2 text-[13px] text-[#808080] hover:text-[#C6A64B]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-6 flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/cuenta/favoritos" className="btn-outline w-full justify-center text-sm">
                    <Heart className="w-4 h-4" />
                    Mis favoritos
                  </Link>
                  <Link href="/cuenta/alertas" className="btn-outline w-full justify-center text-sm">
                    <Bell className="w-4 h-4" />
                    Mis alertas
                  </Link>
                  {isDealer && (
                    <Link href="/dashboard" className="btn-outline w-full justify-center text-sm">
                      Mi panel
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="w-full text-sm text-[#808080] hover:text-red-400 transition-colors py-2">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-outline w-full justify-center text-sm">
                    Acceder
                  </Link>
                  <Link href="/registro-comprador" className="btn-gold w-full justify-center text-sm">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
    <CompareBar />
    </>
  )
}
