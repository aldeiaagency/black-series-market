import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Star, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import DealerCard from '@/components/marketplace/DealerCard'
import SearchBar from '@/components/marketplace/SearchBar'

const BRANDS_SHOWCASE = [
  'Ferrari', 'Lamborghini', 'McLaren', 'Bugatti', 'Porsche', 'Bentley',
  'Rolls-Royce', 'Aston Martin', 'Maserati', 'BMW', 'Mercedes-Benz', 'Ducati',
]

const STATS = [
  { value: '+500', label: 'Vehículos exclusivos' },
  { value: '+80', label: 'Concesionarios premium' },
  { value: '100%', label: 'Curación editorial' },
  { value: '15+', label: 'Países cubiertos' },
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
        <div className="absolute inset-0 bg-obsidian">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.06)_0%,_transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 pt-32 pb-20 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-gold" />
              <span className="text-xs text-gold tracking-[0.3em] uppercase font-medium">
                El marketplace de referencia
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-light text-bsm-text-primary leading-[1.05] mb-8">
              Vehículos que
              <span className="block italic text-gold">no comprometen</span>
            </h1>

            <p className="text-bsm-text-secondary text-lg leading-relaxed mb-10 max-w-xl">
              Coches y motos premium, de lujo, superdeportivos e hipercoches.
              Curados editorialmente. Publicados por los mejores concesionarios de Europa.
            </p>

            <SearchBar size="hero" className="max-w-2xl mb-10" />

            <div className="flex flex-wrap gap-4">
              <Link href="/coches" className="btn-gold">
                Explorar coches
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/motos" className="btn-outline">
                Explorar motos
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-bsm-border pt-12">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-light text-gold mb-1">{stat.value}</div>
                <div className="text-xs text-bsm-text-muted uppercase tracking-wide">{stat.label}</div>
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
                <div className="h-px w-8 bg-gold" />
                <span className="text-xs text-gold tracking-widest uppercase">Selección destacada</span>
              </div>
              <h2 className="section-title">Vehículos destacados</h2>
            </div>
            <Link href="/coches?destacados=true" className="btn-ghost hidden md:flex">
              Ver todos
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
      <section className="border-t border-b border-bsm-border py-16">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <p className="text-xs text-bsm-text-muted uppercase tracking-[0.3em] text-center mb-10">
            Marcas disponibles en el marketplace
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {BRANDS_SHOWCASE.map((brand) => (
              <Link
                key={brand}
                href={`/coches?marca=${brand.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-bsm-text-muted hover:text-gold transition-colors duration-150 font-medium tracking-wide"
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
                <div className="h-px w-8 bg-gold" />
                <span className="text-xs text-gold tracking-widest uppercase">Últimas incorporaciones</span>
              </div>
              <h2 className="section-title">Recién llegados</h2>
            </div>
            <Link href="/coches?orden=newest" className="btn-ghost hidden md:flex">
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

      {/* WHY SECTION */}
      <section className="bg-surface-elevated border-t border-bsm-border py-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold" />
              <span className="text-xs text-gold tracking-widest uppercase">Por qué elegirnos</span>
              <div className="h-px w-8 bg-gold" />
            </div>
            <h2 className="section-title">El estándar que el mercado merecía</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Curación editorial',
                desc: 'Cada vehículo pasa revisión antes de publicarse. Solo entra lo que cumple el estándar premium.',
              },
              {
                icon: Star,
                title: 'Concesionarios verificados',
                desc: 'Todos los dealers del marketplace están verificados y son profesionales del sector.',
              },
              {
                icon: Zap,
                title: 'Ficha técnica completa',
                desc: 'Datos de motor, performance, equipamiento y hasta 60 fotografías de alta resolución.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8 border border-bsm-border">
                <div className="w-10 h-10 border border-gold/30 flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-medium text-bsm-text-primary mb-3">{title}</h3>
                <p className="text-sm text-bsm-text-secondary leading-relaxed">{desc}</p>
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
                <div className="h-px w-8 bg-gold" />
                <span className="text-xs text-gold tracking-widest uppercase">Concesionarios</span>
              </div>
              <h2 className="section-title">Dealers de referencia</h2>
            </div>
            <Link href="/dealers" className="btn-ghost hidden md:flex">
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
      <section className="border-t border-bsm-border py-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="bg-surface border border-bsm-border p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-gold" />
                <span className="text-xs text-gold tracking-widest uppercase">Para concesionarios</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-bsm-text-primary mb-4">
                Tu inventario merece un escaparate a su altura
              </h2>
              <p className="text-bsm-text-secondary leading-relaxed">
                Desde 149€/mes. Publica tus vehículos premium, gestiona tus leads
                y construye tu marca frente a compradores de alto poder adquisitivo.
              </p>
            </div>
            <div className="flex flex-col gap-4 flex-shrink-0">
              <Link href="/registro" className="btn-gold px-10 py-4 text-base">
                Publicar vehículos
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/precios" className="btn-outline px-10 py-4 text-base justify-center">
                Ver planes y precios
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
