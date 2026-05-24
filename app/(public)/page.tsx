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
        .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified)')
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(6),
      supabase
        .from('vehicles')
        .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified)')
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
                href="/busqueda-privada"
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
                <div className="text-[11px] text-[#8A8A8A] uppercase tracking-[0.18em] leading-relaxed">
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
            <Link href="/coches?destacados=true" className="btn-ghost hidden md:flex text-[#8A8A8A] hover:text-[#C9C9C9]">
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
          <p className="text-[10px] text-[#737373] uppercase tracking-[0.35em] text-center mb-8">
            Selección por marca
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {BRANDS_SHOWCASE.map((brand) => (
              <Link
                key={brand}
                href={`/coches?marca=${brand.toLowerCase().replace(/ /g, '-')}`}
                className="text-[13px] text-[#808080] hover:text-[#C9C9C9] transition-colors duration-150 tracking-wide"
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
            <Link href="/coches?orden=newest" className="btn-ghost hidden md:flex text-[#8A8A8A] hover:text-[#C9C9C9]">
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

      {/* DIFFERENTIAL POSITIONING */}
      <section className="bg-[#080808] border-t border-[#141414] py-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-[#C6A64B]/40" />
              <span className="text-[10px] text-[#C6A64B]/60 tracking-[0.3em] uppercase">
                Nuestro criterio
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA] tracking-tight mb-4">
              No publicamos volumen.<br />
              <span className="text-[#9A9A9A]">Seleccionamos unidades con criterio.</span>
            </h2>
            <p className="text-[13px] text-[#8A8A8A] leading-relaxed max-w-xl">
              Cualquier portal puede publicar 300.000 anuncios. Nosotros preferimos publicar los correctos.
              Unidades con algo especial, vendidas por profesionales con los que vale la pena hablar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Selección antes que volumen',
                desc: 'No publicamos todo lo que entra. Cada unidad pasa por un criterio editorial mínimo: tipo de vehículo, presentación, información real.',
              },
              {
                icon: Star,
                title: 'Profesionales identificados',
                desc: 'Revisamos el perfil de cada concesionario o compraventa antes de darles acceso. No es una verificación total, pero es un filtro real.',
              },
              {
                icon: Zap,
                title: 'Un entorno diseñado para buscar bien',
                desc: 'Menos ruido, más criterio. Explora vehículos premium en un entorno más claro y menos masificado que un portal generalista.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8 border border-[#181818] hover:border-[#242424] transition-colors duration-300">
                <div className="w-9 h-9 border border-[#C6A64B]/20 flex items-center justify-center mb-6">
                  <Icon className="w-4 h-4 text-[#C6A64B]/60" />
                </div>
                <h3 className="font-medium text-[#D4D4D4] mb-3 tracking-wide">{title}</h3>
                <p className="text-[13px] text-[#8A8A8A] leading-relaxed">{desc}</p>
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
            <Link href="/dealers" className="btn-ghost hidden md:flex text-[#8A8A8A] hover:text-[#C9C9C9]">
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

      {/* QUÉ NOS DIFERENCIA */}
      <section className="border-t border-[#141414] py-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C6A64B]/40" />
              <span className="text-[10px] text-[#C6A64B]/60 tracking-[0.3em] uppercase">Por qué Black Label</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA]">
              Qué nos diferencia
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px border border-[#161616] bg-[#161616]">
            {[
              {
                n: '01',
                title: 'Selección antes que volumen',
                desc: 'No publicamos todo. Hay un criterio editorial mínimo para cada unidad publicada.',
              },
              {
                n: '02',
                title: 'Profesionales identificados',
                desc: 'Acceso por solicitud. Revisamos el perfil de cada vendedor antes de darle acceso a la plataforma.',
              },
              {
                n: '03',
                title: 'Solicitudes con contexto',
                desc: 'El formulario de contacto cualificado envía al vendedor información real: plazo, financiación, entrega.',
              },
              {
                n: '04',
                title: 'Búsqueda privada',
                desc: 'Registra lo que buscas. Si aparece una oportunidad compatible, te lo comunicamos discretamente.',
              },
              {
                n: '05',
                title: 'Base operativa Black Series',
                desc: 'Impulsado por Black Series, agencia de referencia en el mundo del motor de alto rendimiento.',
              },
            ].map((item) => (
              <div key={item.n} className="bg-[#0A0A0A] p-6 md:p-8">
                <div className="font-display text-xs text-[#C6A64B]/40 mb-4 tracking-[0.2em]">{item.n}</div>
                <h3 className="text-[13px] font-medium text-[#C9C9C9] mb-3 leading-snug">{item.title}</h3>
                <p className="text-[12px] text-[#808080] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUYER BLOCK */}
      <section className="border-t border-[#141414] py-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="bg-[#080808] border border-[#1A1A1A] p-12 md:p-16 flex flex-col lg:flex-row items-start justify-between gap-12">
            <div className="max-w-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#C6A64B]/40" />
                <span className="text-[10px] text-[#C6A64B]/60 tracking-[0.3em] uppercase">Para compradores</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA] mb-5">
                Menos ruido.<br />
                <span className="text-[#9A9A9A]">Más criterio.</span>
              </h2>
              <ul className="space-y-3 mb-8">
                {[
                  'Filtra por marca, modelo, precio, kilómetros y más de 10 criterios adicionales',
                  'Cada unidad publicada por un profesional con perfil revisado',
                  'Formulario de contacto que incluye tu contexto real de compra',
                  'Búsqueda privada si no encuentras lo que buscas en el catálogo',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="text-[#C6A64B]/60 mt-0.5 flex-shrink-0">—</span>
                    <span className="text-[13px] text-[#8A8A8A] leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/coches" className="btn-gold px-6 py-3 text-sm">
                  Explorar coches
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/busqueda-privada" className="btn-outline px-6 py-3 text-sm">
                  Búsqueda privada
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 w-full lg:w-auto">
              <div className="border border-[#1E1E1E] bg-[#0D0D0D] p-6 min-w-[260px]">
                <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-4">¿No lo encuentras?</p>
                <p className="text-sm text-[#8A8A8A] leading-relaxed mb-5">
                  Cuéntanos qué buscas. Si aparece una oportunidad compatible, te lo comunicamos.
                </p>
                <Link href="/busqueda-privada" className="flex items-center gap-2 text-xs text-gold hover:text-gold-light transition-colors">
                  Registrar búsqueda privada <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL BLOCK */}
      <section className="border-t border-[#141414] py-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#C6A64B]/30" />
                <span className="text-[10px] text-[#C6A64B]/50 tracking-[0.3em] uppercase">Para profesionales</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-light text-[#F4F1EA] mb-4">
                Un canal pensado para<br />
                <span className="text-[#9A9A9A]">oportunidades reales.</span>
              </h2>
              <p className="text-[13px] text-[#8A8A8A] leading-relaxed mb-6">
                Si trabajas con vehículos premium, deportivos, clásicos o unidades especiales,
                Black Label es un canal diferente al generalista.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Acceso por solicitud — no es un portal de alta masiva',
                  'Solicitudes cualificadas con contexto de compra real',
                  'Entorno diseñado para mostrar bien lo que tienes',
                  'Base operativa con criterio editorial, no solo técnico',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="text-[#C6A64B]/60 mt-0.5 flex-shrink-0">—</span>
                    <span className="text-[13px] text-[#8A8A8A] leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
              <Link href="/registro" className="btn-outline px-8 py-3 text-sm inline-flex">
                Solicitar acceso profesional
              </Link>
            </div>
            <div className="flex-shrink-0 border border-[#1E1E1E] bg-[#080808] p-8 min-w-[280px] max-w-xs">
              <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-4">Criterios de acceso</p>
              <ul className="space-y-3">
                {[
                  'Vehículos con algo especial — no stock genérico',
                  'Información real y presentación cuidada',
                  'Disponibilidad verificada en el momento de publicación',
                  'Perfil profesional identificable',
                ].map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-[12px] text-[#808080] leading-relaxed">
                    <span className="text-[#C6A64B]/40 mt-0.5 flex-shrink-0">→</span>
                    {c}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-[#141414]">
                <Link
                  href="/como-funciona"
                  className="flex items-center gap-1.5 text-xs text-[#808080] hover:text-gold transition-colors"
                >
                  Cómo funciona para profesionales <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POWERED BY BLACK SERIES */}
      <section className="border-t border-[#0E0E0E] py-12">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[11px] text-[#8A8A8A] tracking-[0.15em] uppercase">
              Powered by Black Series
            </p>
            <p className="text-[12px] text-[#8A8A8A] max-w-md text-center md:text-right leading-relaxed">
              Black Label Market es una iniciativa de Black Series, agencia especializada en el mundo
              del motor de alto rendimiento. No somos un portal anónimo.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
