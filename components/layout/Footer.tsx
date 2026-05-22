import Link from 'next/link'

const LINKS = {
  Explorar: [
    { label: 'Coches de lujo', href: '/coches' },
    { label: 'Motos premium', href: '/motos' },
    { label: 'Marcas', href: '/marcas' },
    { label: 'Concesionarios', href: '/dealers' },
    { label: 'Búsqueda avanzada', href: '/buscar' },
  ],
  Concesionarios: [
    { label: 'Publicar vehículo', href: '/registro' },
    { label: 'Planes y precios', href: '/precios' },
    { label: 'Acceder al panel', href: '/login' },
    { label: 'Soporte', href: '/contacto' },
  ],
  Legal: [
    { label: 'Aviso legal', href: '/legal/aviso-legal' },
    { label: 'Política de privacidad', href: '/legal/privacidad' },
    { label: 'Política de cookies', href: '/legal/cookies' },
    { label: 'Términos de uso', href: '/legal/terminos' },
  ],
}

const FEATURED_BRANDS = [
  'Ferrari', 'Lamborghini', 'McLaren', 'Bugatti', 'Porsche', 'Bentley',
  'Rolls-Royce', 'Aston Martin', 'Maserati', 'BMW M', 'Mercedes AMG', 'Ducati',
]

export default function Footer() {
  return (
    <footer className="bg-obsidian-100 border-t border-bsm-border mt-24">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-16">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="font-display text-2xl font-light text-bsm-text-primary tracking-[0.15em]">
                BLACK SERIES
              </div>
              <div className="text-[10px] font-medium tracking-[0.4em] text-gold uppercase">
                Market
              </div>
            </div>
            <p className="text-sm text-bsm-text-secondary leading-relaxed max-w-xs">
              El marketplace de referencia para vehículos premium, de lujo, superdeportivos
              e hipercoches en España y Europa.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-bsm-text-muted">Plataforma activa</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-bsm-text-muted mb-5">
                {category}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-bsm-text-secondary hover:text-gold transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Brands */}
        <div className="border-t border-bsm-border pt-10 mb-10">
          <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">
            Marcas destacadas
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {FEATURED_BRANDS.map((brand) => (
              <span key={brand} className="text-sm text-bsm-text-muted hover:text-gold cursor-pointer transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-bsm-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-bsm-text-muted">
            © {new Date().getFullYear()} Black Series Market. Todos los derechos reservados.
          </p>
          <p className="text-xs text-bsm-text-muted">
            Operado por <span className="text-gold">Black Series Agency</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
