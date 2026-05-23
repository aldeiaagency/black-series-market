import Link from 'next/link'
import { ArrowRight, Shield, Star, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import DealerCard from '@/components/marketplace/DealerCard'
import SearchBar from '@/components/marketplace/SearchBar'

const BRANDS_SHOWCASE = [
  'Ferrari', 'Lamborghini', 'McLaren', 'Bugatti', 'Porsche', 'Bentley',
  'Rolls-Royce', 'Aston Martin', 'Maserati', 'BMW', 'Mercedes-Benz', 'Ducati',
]

const PILLARS = [
  { label: 'Vehículos seleccionados' },
  { label: 'Dealers revisados' },
  { label: 'Coches y motos' },
  { label: 'Búsqueda privada' },
]

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: featuredVehicles }, { data: newVehicles }, { data: featuredDealers }] =
    await Promise.all([
      supabase
        .from('vehicles')
        .select('*, dealer:dealers(name, slug, location_city, logo_url)')
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(6),
      supabase
        .from('vehicles')
        .select('*, dealer:dealers(name, slug, location_city, logo_url)')
        .eq('status', 'active')
        .order('published_at', { ascending: false })
        .limit(8),
      supabase
        .from('dealers')
        .select('*')
        .eq('status', 'active')
        .eq('is_featured', true)
        .limit(4),
    ])

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-[#050505]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(198,166,75,0.04)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050505] to-transparent" />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 pt-36 pb-20 w-full">
          <div className="max-w-3xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-10 bg-[#C6A64B]/60" />
              <span className="text-[10px] text-[#C6A64B]/80 tracking-[0.35em] uppercase font-medium">
                Marketplace curado de coches y motos
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-light text-[#F4F1EA] leading-[1.02] mb-8"
              style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}>
              No es volumen.
              <span className="block italic text-[#C9C9C9]">Es selección.</span>
            </h1>

            {/* Subclaim */}
            <p className="text-[#686868] text-[17px] leading-relaxed mb-10 max-w-xl">
              Coches y motos premium, deportivos, clásicos y unidades especiales.
              Publicados por concesionarios y especialistas seleccionados, presentados con criterio editorial.
            </p>

            <SearchBar size="hero" className="max-w-2xl mb-10" />

            <div className="flex flex-wrap gap-3">
              <Link href="/coches" className="btn-gold">
                Explorar vehículos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/busqueda-privada"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm text-[#9A9A9A]
                  border border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-[#C9C9C9]
                  transition-all duration-200 tracking-wide"
              >
                Solicitar búsqueda privada
              </Link>
            </div>
          </div>

          {/* Pillars */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-px border border-[#161616] bg-[#161616]">
            {PILLARS.map((p) => (
              <div key={p.label} className="bg-[#0A0A0A] px-6 py-6">
                <div className="h-px w-8 bg-[#C6A64B]/40 mb-4" />
                <div className="text-[11px] text-[#686868] uppercase tracking-[0.18em] leading-relaxed">
                  {p.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      {featuredVehicles && featuredVehicles.length > 0 && (
        <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#C6A64B]/50" />
                <span className="text-[10px] text-[#C6A64B]/70 tracking-[0.3em] uppercase">Selección destacada</span>
              </div>
              <h2 className="section-title">Vehículos destacados</h2>
            </div>
            <Link href="/coches?destacados=true" className="btn-ghost hidden md:flex text-[#686868] hover:text-[#C9C9C9]">
              Ver selección
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredVehicles.map((v: any) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>
      )}

      {/* BRANDS */}
      <section className="border-t border-b border-[#141414] py-14">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <p className="text-[10px] text-[#474747] uppercase tracking-[0.35em] text-center mb-8">
            Marcas disponibles
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {BRANDS_SHOWCASE.map((brand) => (
              <Link
                key={brand}
                href={`/coches?marca=${brand.toLowerCase().replace(/ /g, '-')}`}
                className="text-[13px] text-[#575757] hover:text-[#C9C9C9] transition-colors duration-150 tracking-wide"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT VEHICLES */}
      {newVehicles && newVehicles.length > 0 && (
        <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#C6A64B]/50" />
                <span className="text-[10px] text-[#C6A64B]/70 tracking-[0.3em] uppercase">Últimas incorporaciones</span>
              </div>
              <h2 className="section-title">Recién incorporados</h2>
            </div>
            <Link href="/coches?orden=newest" className="btn-ghost hidden md:flex text-[#686868] hover:text-[#C9C9C9]">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newVehicles.map((v: any) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>
      )}

      {/* STANDARD SECTION */}
      <section className="bg-[#080808] border-t border-[#141414] py-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-8 bg-[#C6A64B]/40" />
              <span className="text-[10px] text-[#C6A64B]/60 tracking-[0.3em] uppercase">El estándar</span>
              <div className="h-px w-8 bg-[#C6A64B]/40" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA] tracking-tight">
              El estándar que un vehículo especial merece
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Selección con criterio',
                desc: 'No todo el stock entra. Priorizamos unidades con valor, estado, historia, configuración o demanda real.',
              },
              {
                icon: Star,
                title: 'Dealers seleccionados',
                desc: 'Trabajamos con concesionarios, especialistas y operadores revisados antes de publicar.',
              },
              {
                icon: Zap,
                title: 'Solicitudes cualificadas',
                desc: 'El contacto se orienta a intención real, no a ruido ni curiosidad vacía.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8 border border-[#181818] hover:border-[#242424] transition-colors duration-300">
                <div className="w-9 h-9 border border-[#C6A64B]/20 flex items-center justify-center mb-6">
                  <Icon className="w-4 h-4 text-[#C6A64B]/60" />
                </div>
                <h3 className="font-medium text-[#D4D4D4] mb-3 tracking-wide">{title}</h3>
                <p className="text-[13px] text-[#686868] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED DEALERS */}
      {featuredDealers && featuredDealers.length > 0 && (
        <section className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#C6A64B]/50" />
                <span className="text-[10px] text-[#C6A64B]/70 tracking-[0.3em] uppercase">Concesionarios</span>
              </div>
              <h2 className="section-title">Dealers seleccionados</h2>
            </div>
            <Link href="/dealers" className="btn-ghost hidden md:flex text-[#686868] hover:text-[#C9C9C9]">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDealers.map((d: any) => (
              <DealerCard key={d.id} dealer={d} variant="featured" />
            ))}
          </div>
        </section>
      )}

      {/* CTA DEALER */}
      <section className="border-t border-[#141414] py-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="bg-[#080808] border border-[#1A1A1A] p-12 md:p-16 flex flex-col md:flex-row items-start justify-between gap-10">
            <div className="max-w-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#C6A64B]/40" />
                <span className="text-[10px] text-[#C6A64B]/60 tracking-[0.3em] uppercase">Para concesionarios</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA] mb-5">
                Tu stock merece algo más que un portal generalista
              </h2>
              <p className="text-[13px] text-[#686868] leading-relaxed">
                Black Label Market está diseñado para concesionarios y especialistas que trabajan unidades premium,
                deportivas, clásicas o de alta deseabilidad, y quieren presentarlas con criterio.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
              <Link href="/registro" className="btn-gold px-8 py-4 text-sm justify-center">
                Solicitar acceso dealer
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/precios" className="btn-outline px-8 py-4 text-sm justify-center">
                Ver criterios de publicación
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
