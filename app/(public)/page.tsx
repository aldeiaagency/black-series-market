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
  { label: 'Selección premium' },
  { label: 'Vendedores verificados' },
  { label: 'Coches y motos' },
  { label: 'Búsqueda a medida' },
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
                Selección de coches y motos premium
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-light text-[#F4F1EA] leading-[1.02] mb-8"
              style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
            >
              No es volumen.
              <span className="block italic text-[#C9C9C9]">Es selección.</span>
            </h1>

            {/* Subclaim */}
            <p className="text-[#858585] text-[17px] leading-relaxed mb-10 max-w-xl">
              Coches deportivos, clásicos, motos premium y unidades especiales.
              Publicados por concesionarios y compraventas verificados para quienes buscan algo más que un vehículo.
            </p>

            <SearchBar size="hero" className="max-w-2xl mb-10" />

            <div className="flex flex-wrap gap-3">
              <Link href="/coches" className="btn-gold">
                Ver vehículos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/buscar-vehiculo"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm text-[#9A9A9A]
                  border border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-[#C9C9C9]
                  transition-all duration-200 tracking-wide"
              >
                ¿No encuentras tu vehículo?
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
                <span className="text-[10px] text-[#C6A64B]/70 tracking-[0.3em] uppercase">
                  Selección destacada
                </span>
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
            Selección por marca
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
                <span className="text-[10px] text-[#C6A64B]/70 tracking-[0.3em] uppercase">
                  Novedades
                </span>
              </div>
              <h2 className="section-title">Últimas unidades publicadas</h2>
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
              <span className="text-[10px] text-[#C6A64B]/60 tracking-[0.3em] uppercase">
                Nuestro estándar
              </span>
              <div className="h-px w-8 bg-[#C6A64B]/40" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA] tracking-tight">
              Vehículos especiales, vendedores verificados
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Vehículos con algo especial',
                desc: 'Deportivos, clásicos, motos premium y unidades que destacan por configuración, estado, historia o carácter.',
              },
              {
                icon: Star,
                title: 'Concesionarios y compraventas verificados',
                desc: 'Antes de publicar, revisamos la reputación online y el perfil profesional de cada vendedor.',
              },
              {
                icon: Zap,
                title: 'Una forma más cuidada de buscar',
                desc: 'Explora vehículos premium en un entorno más claro, más tranquilo y menos masificado que un portal generalista.',
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
                <span className="text-[10px] text-[#C6A64B]/70 tracking-[0.3em] uppercase">
                  Profesionales verificados
                </span>
              </div>
              <h2 className="section-title">Concesionarios y compraventas</h2>
            </div>
            <Link href="/concesionarios" className="btn-ghost hidden md:flex text-[#686868] hover:text-[#C9C9C9]">
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

      {/* CTA SEARCH */}
      <section className="border-t border-[#141414] py-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="bg-[#080808] border border-[#1A1A1A] p-12 md:p-16 flex flex-col md:flex-row items-start justify-between gap-10">
            <div className="max-w-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#C6A64B]/40" />
                <span className="text-[10px] text-[#C6A64B]/60 tracking-[0.3em] uppercase">
                  Búsqueda a medida
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA] mb-5">
                ¿No encuentras el vehículo que buscas?
              </h2>
              <p className="text-[13px] text-[#686868] leading-relaxed">
                Cuéntanos qué coche o moto estás buscando y revisaremos opciones disponibles entre concesionarios,
                compraventas y especialistas verificados.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
              <Link href="/buscar-vehiculo" className="btn-gold px-8 py-4 text-sm justify-center">
                Pedir búsqueda
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/coches" className="btn-outline px-8 py-4 text-sm justify-center">
                Seguir viendo vehículos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA PROFESSIONAL */}
      <section className="border-t border-[#141414] py-16">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#C6A64B]/30" />
                <span className="text-[10px] text-[#C6A64B]/50 tracking-[0.3em] uppercase">
                  Para profesionales
                </span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-light text-[#F4F1EA] mb-4">
                ¿Eres concesionario o compraventa?
              </h2>
              <p className="text-[13px] text-[#686868] leading-relaxed">
                Si trabajas con vehículos premium, deportivos, clásicos o unidades especiales,
                puedes solicitar acceso para publicar tu stock en Black Label Market.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link href="/publicar" className="btn-outline px-8 py-4 text-sm justify-center">
                Solicitar acceso profesional
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
