import Link from 'next/link'
import Logo from '@/components/brand/Logo'
import CookieSettingsButton from '@/components/legal/CookieSettingsButton'
import MarketSocialLinks from '@/components/social/MarketSocialLinks'

// ── Navigation columns ────────────────────────────────────────────────────────

const EXPLORAR = [
  { label: 'Coches',                        href: '/coches' },
  { label: 'Motos',                         href: '/motos' },
  { label: 'Marcas',                        href: '/marcas' },
  { label: 'Concesionarios y compraventas', href: '/dealers' },
  { label: 'Vehículos a la carta',          href: '/vehiculos-a-la-carta' },
  { label: 'Guías del mercado',             href: '/guias' },
  { label: 'Glosario premium',              href: '/glosario' },
  { label: 'Selección mensual',             href: '/seleccion-mensual' },
  { label: 'Cómo funciona',                 href: '/como-funciona' },
  { label: 'Sobre nosotros',               href: '/sobre-nosotros' },
]

const PROFESIONALES = [
  { label: 'Para profesionales',        href: '/para-profesionales' },
  { label: 'Solicitar valoración',      href: '/profesionales/solicitar-acceso' },
  { label: 'Criterios para publicar',   href: '/legal/criterios-publicacion' },
  { label: 'Condiciones profesionales', href: '/legal/condiciones-profesionales' },
  { label: 'Comparar modalidades',      href: '/profesionales/planes' },
  { label: 'Contacto',                   href: '/contacto' },
]

// Legal: "Configurar cookies" rendered separately as a client button
const LEGAL = [
  { label: 'Aviso legal',            href: '/legal/aviso-legal' },
  { label: 'Política de privacidad', href: '/legal/privacidad' },
  { label: 'Política de cookies',    href: '/legal/cookies' },
  { label: 'Términos y condiciones', href: '/legal/terminos' },
]

// ── Brand featured ────────────────────────────────────────────────────────────

// slug = brands.slug real (lib/brand-editorial.ts). No derivarlo del label: "BMW M" y
// "Mercedes AMG" no son slugs reales (son bmw y mercedes-benz) y generaban enlaces rotos.
const FEATURED_BRANDS = [
  { label: 'Ferrari', slug: 'ferrari' },
  { label: 'Lamborghini', slug: 'lamborghini' },
  { label: 'McLaren', slug: 'mclaren' },
  { label: 'Bugatti', slug: 'bugatti' },
  { label: 'Porsche', slug: 'porsche' },
  { label: 'Bentley', slug: 'bentley' },
  { label: 'Rolls-Royce', slug: 'rolls-royce' },
  { label: 'Aston Martin', slug: 'aston-martin' },
  { label: 'Maserati', slug: 'maserati' },
  { label: 'BMW M', slug: 'bmw' },
  { label: 'Mercedes AMG', slug: 'mercedes-benz' },
  { label: 'Ducati', slug: 'ducati' },
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
            <div className="mb-6 inline-block">
              <Logo width={152} variant="footer" />
              <p className="mt-1 text-[10px] text-[#9E9E9E] tracking-[0.15em] uppercase text-center">
                by{' '}
                <a
                  href="https://blackseriesagency.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  Black Series
                </a>
              </p>
            </div>
            <p className="text-[13px] text-[#8A8A8A] leading-relaxed max-w-xs mb-4">
              Black Label Market es un producto de{' '}
              <a
                href="https://blackseriesagency.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C9C9C9] hover:text-gold underline underline-offset-2 decoration-bsm-border transition-colors"
              >
                Black Series
              </a>
              , agencia especializada en el mundo del motor de alto rendimiento.
            </p>
            <MarketSocialLinks className="-ml-1.5" />
          </div>

          {/* Explorar */}
          <div>
            <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#9E9E9E] mb-5">
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
            <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#9E9E9E] mb-5">
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
            <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#9E9E9E] mb-5">
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
          <p className="text-[10px] text-[#9E9E9E] uppercase tracking-[0.3em] mb-5 text-center">
            Marcas disponibles
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {FEATURED_BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/marcas/${brand.slug}`}
                className="text-[13px] text-[#9E9E9E] hover:text-[#C9C9C9] transition-colors duration-150"
              >
                {brand.label}
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
          <p className="text-[11px] text-[#9E9E9E]">
            © {new Date().getFullYear()} Black Label Market. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <CookieSettingsButton
              className="text-[11px] text-[#9E9E9E] hover:text-[#8A8A8A] transition-colors underline-offset-2 hover:underline"
            />
            <p className="text-[11px] text-[#9E9E9E]">
              Operado por <span className="text-[#8A8A8A]">KAZAWEB, S.L.U.</span> · NIF B42761254
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}
