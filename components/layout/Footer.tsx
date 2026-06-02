import Link from 'next/link'
import Logo from '@/components/brand/Logo'
import CookieSettingsButton from '@/components/legal/CookieSettingsButton'

// ── Navigation columns ────────────────────────────────────────────────────────

const EXPLORAR = [
  { label: 'Coches',                        href: '/coches' },
  { label: 'Motos',                         href: '/motos' },
  { label: 'Marcas',                        href: '/marcas' },
  { label: 'Concesionarios y compraventas', href: '/dealers' },
  { label: 'Vehículos a la carta',          href: '/busqueda-privada' },
  { label: 'Mis favoritos',                 href: '/mis-favoritos' },
  { label: 'Cómo funciona',                 href: '/como-funciona' },
]

const PROFESIONALES = [
  { label: 'Publicar vehículos',      href: '/registro' },
  { label: 'Criterios para publicar', href: '/legal/criterios-publicacion' },
  { label: 'Planes de publicación',   href: '/precios' },
  { label: 'Soporte',                 href: '/contacto' },
]

// Legal: "Configurar cookies" rendered separately as a client button
const LEGAL = [
  { label: 'Aviso legal',            href: '/legal/aviso-legal' },
  { label: 'Política de privacidad', href: '/legal/privacidad' },
  { label: 'Política de cookies',    href: '/politica-de-cookies' },
  { label: 'Términos y condiciones', href: '/legal/terminos' },
]

// ── Brand featured ────────────────────────────────────────────────────────────

const FEATURED_BRANDS = [
  'Ferrari', 'Lamborghini', 'McLaren', 'Bugatti', 'Porsche', 'Bentley',
  'Rolls-Royce', 'Aston Martin', 'Maserati', 'BMW M', 'Mercedes AMG', 'Ducati',
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[#1A1A1A] mt-24">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-16">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo width={152} variant="footer" />
              <p className="mt-2 text-[12px] text-[#808080] tracking-[0.12em] uppercase">
                by Black Series
              </p>
            </div>
            <p className="text-[13px] text-[#8A8A8A] leading-relaxed max-w-xs">
              Selección de coches y motos premium, deportivos, clásicos y unidades especiales publicados por profesionales verificados.
            </p>
          </div>

          {/* Explorar */}
          <div>
            <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#808080] mb-5">
              Explorar
            </h4>
            <ul className="space-y-3">
              {EXPLORAR.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[13px] text-[#8A8A8A] hover:text-[#C9C9C9] transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Profesionales */}
          <div>
            <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#808080] mb-5">
              Profesionales
            </h4>
            <ul className="space-y-3">
              {PROFESIONALES.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[13px] text-[#8A8A8A] hover:text-[#C9C9C9] transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#808080] mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {LEGAL.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[13px] text-[#8A8A8A] hover:text-[#C9C9C9] transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {/* Configurar cookies — opens consent panel via CustomEvent */}
              <li>
                <CookieSettingsButton
                  className="text-[13px] text-[#8A8A8A] hover:text-[#C9C9C9] transition-colors duration-150"
                />
              </li>
            </ul>
          </div>

        </div>

        {/* Brands */}
        <div className="border-t border-[#141414] pt-10 mb-10">
          <p className="text-[10px] text-[#737373] uppercase tracking-[0.3em] mb-5">
            Marcas disponibles
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {FEATURED_BRANDS.map((brand) => (
              <Link
                key={brand}
                href={`/marcas/${brand.toLowerCase().replace(/\s/g, '-')}`}
                className="text-[13px] text-[#808080] hover:text-[#C9C9C9] transition-colors duration-150"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-[#141414] pt-8 mb-6">
          <p className="text-[10px] text-[#8A8A8A] leading-relaxed max-w-3xl">
            Black Label Market actúa como plataforma de publicación y contacto entre compradores
            y profesionales seleccionados. La operación comercial se realiza exclusivamente entre comprador
            y vendedor. Black Label no es parte en las transacciones de compraventa.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#737373]">
            © {new Date().getFullYear()} Black Label Market. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-[#737373]">
            Operado por <span className="text-[#8A8A8A]">KAZAWEB, S.L.U.</span> · NIF B42761254
          </p>
        </div>

      </div>
    </footer>
  )
}
