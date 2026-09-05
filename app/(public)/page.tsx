import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Star, Zap, Diamond, BadgeCheck, CarFront, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createPublicClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import DealerCard from '@/components/marketplace/DealerCard'
import SearchBar from '@/components/marketplace/SearchBar'
import FaqSection, { type FaqItem } from '@/components/marketplace/FaqSection'
import { VEHICLE_PUBLIC_COLUMNS, DEALER_PUBLIC_COLUMNS } from '@/lib/public-columns'

// Preguntas frecuentes de la home. Objetivo doble: (1) resolver las dudas iniciales del
// comprador y (2) posicionar (SEO/GEO) con respuestas citables — definición del servicio,
// consulta "dónde comprar…", coste, confianza, contacto y cobertura nacional.
const HOME_FAQ: FaqItem[] = [
  {
    q: '¿Qué es Black Label Market?',
    a: 'Black Label Market es un marketplace de coches y motos premium en España: deportivos, clásicos, SUV de gama alta, motos premium y unidades especiales. A diferencia de un portal masivo de anuncios, solo admite profesionales verificados (concesionarios, compraventas y especialistas que superan nuestro proceso de admisión) y publica únicamente vehículos de nuestro catálogo de marcas y modelos seleccionados.',
  },
  {
    q: '¿Dónde puedo comprar un coche o una moto premium de segunda mano en España?',
    a: 'En Black Label Market. Reúne en un solo sitio deportivos, clásicos, SUV premium y motos de gama alta de concesionarios y especialistas verificados de toda España. Puedes filtrar por marca, modelo, versión, año, kilometraje, precio y provincia, y contactar directamente con el vendedor desde la ficha del vehículo.',
  },
  {
    q: '¿Comprar tiene algún coste para mí?',
    a: 'No. Para el comprador es totalmente gratuito: explorar el catálogo, guardar favoritos, comparar vehículos, crear alertas de búsqueda y contactar con los vendedores no cuesta nada. La plataforma se sostiene con los profesionales que publican su inventario.',
  },
  {
    q: '¿Los vendedores son de fiar? ¿Qué significa que un profesional esté verificado?',
    a: 'Antes de dejar publicar, revisamos la reputación online, la especialización y la calidad de presentación de cada concesionario, compraventa o especialista. El distintivo "verificado" indica que ha superado ese proceso. Black Label no es intermediario en la compraventa: facilita el contacto directo entre comprador y vendedor.',
  },
  {
    q: '¿Puedo contactar directamente con el vendedor?',
    a: 'Sí. Desde cada ficha de vehículo o desde el perfil del profesional puedes contactar directamente con el vendedor para resolver dudas, pedir más información o concertar una visita. No intervenimos en la operación.',
  },
  {
    q: '¿Y si no encuentro la unidad que busco?',
    a: 'Puedes usar el servicio "Vehículos a la carta": nos dices marca, modelo, versión, presupuesto y preferencias, y si aparece una oportunidad compatible dentro de nuestra red de profesionales, te avisamos. También puedes crear una alerta de búsqueda y recibir aviso cuando se publique un vehículo que encaje.',
  },
  {
    q: '¿Puedo comprar desde cualquier punto de España?',
    a: 'Sí. El catálogo es de ámbito nacional y puedes filtrar por provincia para encontrar vehículos cerca de ti. Algunos profesionales ofrecen transporte nacional del vehículo; cuando es así, se indica en la ficha.',
  },
  {
    q: 'Soy concesionario o compraventa, ¿cómo publico mi stock?',
    a: 'El acceso profesional es bajo solicitud, con revisión de reputación y una llamada donde explicamos precios y condiciones antes del alta. Puedes conocer cómo funciona el proceso y comparar las modalidades sin dejar ningún dato.',
  },
]



// ISR: la home solo lee catálogo público → se cachea en CDN y se revalida cada 5 min.
export const revalidate = 300

const BRANDS_SHOWCASE = [
  'Ferrari', 'Lamborghini', 'McLaren', 'Bugatti', 'Porsche', 'Bentley',
  'Rolls-Royce', 'Aston Martin', 'Maserati', 'BMW', 'Mercedes-Benz', 'Ducati',
]

const PILLARS: { label: string; icon: LucideIcon }[] = [
  { label: 'Selección premium',    icon: Diamond    },
  { label: 'Vendedores verificados', icon: BadgeCheck },
  { label: 'Coches y motos',       icon: CarFront   },
  { label: 'Vehículos a la carta',    icon: Search     },
]

export default async function HomePage() {
  const supabase = createPublicClient()

  const [{ data: featuredVehicles }, { data: newVehicles }, { data: featuredDealers }] =
    await Promise.all([
      supabase
        .from('vehicles')
        .select((`${VEHICLE_PUBLIC_COLUMNS}, dealer:dealers!inner(name, slug, location_city, logo_url, is_verified)`) as string)
        .eq('status', 'active')
        .eq('dealer.profile_status', 'published')
        .eq('is_featured', true)
        .gt('featured_until', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(8),
      supabase
        .from('vehicles')
        .select((`${VEHICLE_PUBLIC_COLUMNS}, dealer:dealers!inner(name, slug, location_city, logo_url, is_verified)`) as string)
        .eq('status', 'active')
        .eq('dealer.profile_status', 'published')
        .order('published_at', { ascending: false })
        .limit(8),
      supabase
        .from('dealers')
        .select(DEALER_PUBLIC_COLUMNS)
        .eq('status', 'active')
        .eq('profile_status', 'published')
        .eq('is_featured', true)
        .limit(4),
    ])

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#050505]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_25%_45%,rgba(198,166,75,0.05)_0%,transparent_65%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050505] to-transparent" />
        </div>

        {/* ── Hero image — desktop: vertically centered right panel ── */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[56%]">
          {/* Image centered vertically inside the full-height panel */}
          <div className="absolute inset-0 flex flex-col justify-center">
            <Image
              src="/images/hero/black-label-hero-gt3rs-ducati.webp"
              alt="Porsche GT3 RS negro mate y Ducati Panigale V4 Corsa tricolor en showroom oscuro premium"
              width={1365}
              height={716}
              priority
              className="w-full h-auto block"
              sizes="(max-width: 1280px) 56vw, 860px"
            />
          </div>
          {/* Left fade — blends into text column */}
          <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none" />
          {/* Top fade */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none" />
          {/* Bottom fade — fills dark space below the image */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none" />
          {/* Right edge vignette */}
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#050505]/40 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 pt-36 pb-20 w-full">

          {/* Text — constrained to left 50% on desktop */}
          <div className="w-full lg:w-1/2 lg:pr-8">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-10 bg-gold/60" />
              <span className="text-[10px] text-gold/80 tracking-[0.35em] uppercase font-medium">
                ENCUENTRA EL VEHÍCULO DE TUS SUEÑOS
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-light text-[#F4F1EA] leading-[1.02] mb-8"
              style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5rem)' }}
            >
              Selección exclusiva de coches y motos premium
            </h1>

            {/* Subclaim */}
            <p className="text-[#858585] text-[17px] leading-relaxed mb-10 max-w-xl">
              Encuentra coches deportivos, clásicos, motos premium y unidades especiales publicadas por concesionarios, compraventas y especialistas seleccionados por su seriedad y reputación.
            </p>

            <SearchBar size="hero" className="max-w-xl mb-10" />

            <div className="flex flex-wrap gap-3">
              <Link href="/coches" className="btn-gold">
                Explorar coches
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/motos" className="btn-outline">
                Explorar motos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/vehiculos-a-la-carta"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm text-[#9A9A9A]
                  border border-bsm-border hover:border-[#3A3A3A] hover:text-[#C9C9C9]
                  transition-all duration-200 tracking-wide"
              >
                ¿No encuentras tu vehículo?
              </Link>
            </div>
          </div>

          {/* Mobile image — below CTAs, full natural 16:9 ratio */}
          <div className="lg:hidden mt-10 -mx-6 relative overflow-hidden">
            <Image
              src="/images/hero/black-label-hero-gt3rs-ducati.webp"
              alt="Porsche GT3 RS negro mate y Ducati Panigale V4 Corsa tricolor en showroom oscuro premium"
              width={1365}
              height={716}
              priority
              className="w-full h-auto block"
              sizes="100vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#050505]/70 to-transparent pointer-events-none" />
          </div>

          {/* Pillars */}
          <div className="mt-16 lg:mt-24 grid grid-cols-2 md:grid-cols-4 gap-px border border-[#161616] bg-[#161616]">
            {PILLARS.map(({ label, icon: Icon }) => (
              <div key={label} className="bg-[#0A0A0A] px-6 py-8 flex flex-col items-center text-center">
                <Icon className="w-6 h-6 text-gold/60 mb-4" strokeWidth={1.25} />
                <div className="h-px w-8 bg-gold/40 mb-4" />
                <div className="text-[11px] text-[#8A8A8A] uppercase tracking-[0.18em] leading-relaxed">
                  {label}
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
                <div className="h-px w-8 bg-gold/50" />
                <span className="text-[10px] text-gold/70 tracking-[0.3em] uppercase">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredVehicles.map((v: any) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>
      )}

      {/* BRANDS */}
      <section className="border-t border-b border-[#141414] py-14">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <p className="text-[10px] text-[#9E9E9E] uppercase tracking-[0.35em] text-center mb-8">
            Marcas populares
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {BRANDS_SHOWCASE.map((brand) => (
              <Link
                key={brand}
                href={`/coches?marca=${brand.toLowerCase().replace(/ /g, '-')}`}
                className="text-[13px] text-[#9E9E9E] hover:text-[#C9C9C9] transition-colors duration-150 tracking-wide"
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
                <div className="h-px w-8 bg-gold/50" />
                <span className="text-[10px] text-gold/70 tracking-[0.3em] uppercase">
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
              <div className="h-px w-8 bg-gold/40" />
              <span className="text-[10px] text-gold/60 tracking-[0.3em] uppercase">
                NUESTRO ESTÁNDAR
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA] tracking-tight mb-4">
              Qué nos hace diferentes.<br />
            </h2>
            <p className="text-[13px] text-[#8A8A8A] leading-relaxed max-w-xl">
              Cuando buscas un deportivo, un clásico, una moto premium o una unidad exclusiva, necesitas un espacio especializado y profesionales con buena reputación, verificada, que inspiran confianza.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Vehículos premium',
                desc: 'Deportivos, clásicos, motos premium y unidades exclusivas. El vehículo con el que sueñas, en una selección dedicada solo a este tipo de vehículos.',
              },
              {
                icon: Star,
                title: 'Profesionales verificados',
                desc: 'Antes de publicar, auditamos la reputación de cada concesionario, compraventa o especialista. Esa buena reputación, verificada, es la que te da la confianza para comprar.',
              },
              {
                icon: Zap,
                title: 'Una búsqueda más fácil',
                desc: 'Aquí solo encontrarás vehículos premium, sin mezclarse con el resto de fichas de un portal generalista. Menos ruido, más lo que buscas.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8 border border-[#181818] hover:border-[#242424] transition-colors duration-300">
                <div className="w-9 h-9 border border-gold/20 flex items-center justify-center mb-6">
                  <Icon className="w-4 h-4 text-gold/60" />
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
                <div className="h-px w-8 bg-gold/50" />
                <span className="text-[10px] text-gold/70 tracking-[0.3em] uppercase">
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

   {/* CÓMO TE AYUDA BLACK LABEL */}
<section className="border-t border-[#141414] py-20">
  <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-gold/40" />
        <span className="text-[10px] text-gold/60 tracking-[0.3em] uppercase">
          Cómo te ayuda Black Label
        </span>
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA]">
        Una forma más fácil de encontrar exactamente lo que buscas
      </h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px border border-[#161616] bg-[#161616]">
      {[
        {
          n: '01',
          title: 'Menos ruido. Solo vehículos premium',
          desc: 'No queremos que pierdas tiempo entre miles de resultados. Black Label reúne los coches y motos que estás buscando.',
        },
        {
          n: '02',
          title: 'Profesionales verificados',
          desc: 'Trabajamos solo con concesionarios, compraventas y especialistas cuya reputación y nivel de servicio estén a la altura del vehículo que ofrecen.',
        },
        {
          n: '03',
          title: 'Información clara para decidir mejor',
          desc: 'Cada vehículo muestra la información esencial para entender rápido qué ofrece, quién lo publica y en qué condiciones está disponible.',
        },
        {
          n: '04',
          title: 'Vehículos a la carta',
          desc: 'Si no encuentras la unidad que quieres, puedes decirnos qué buscas y activaremos una búsqueda para localizar oportunidades compatibles.',
        },
        {
          n: '05',
          title: 'Contacto directo con el vendedor',
          desc: 'Puedes contactar directamente desde la ficha del vehículo o desde el perfil del vendedor para resolver dudas y avanzar con más contexto.',
        },
      ].map((item) => (
        <div key={item.n} className="bg-[#0A0A0A] p-6 md:p-8">
          <div className="font-display text-xs text-gold/40 mb-4 tracking-[0.2em]">
            {item.n}
          </div>
          <h3 className="text-[13px] font-medium text-[#C9C9C9] mb-3 leading-snug">
            {item.title}
          </h3>
          <p className="text-[12px] text-[#9E9E9E] leading-relaxed">
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>

    {/* VEHÍCULOS A LA CARTA */}
<section className="border-t border-[#141414] py-20">
  <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-stretch">
      <div className="max-w-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold/40" />
          <span className="text-[10px] text-gold/60 tracking-[0.3em] uppercase">
            Vehículos a la carta
          </span>
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-light text-[#F4F1EA] mb-5">
          ¿No encuentras la unidad<br />
          <span className="text-[#9A9A9A]">que estás buscando?</span>
        </h2>

        <p className="text-[14px] text-[#8A8A8A] leading-relaxed mb-8">
          Dinos qué coche o moto tienes en mente. Si aparece una oportunidad compatible
          dentro de nuestra red de profesionales, podremos avisarte con discreción.
        </p>

        <ul className="space-y-3 mb-8">
          {[
            'Define marca, modelo, versión y presupuesto',
            'Indica si buscas coche, moto, clásico, deportivo o una unidad especial',
            'Cuéntanos tus preferencias de color, kilometraje, ubicación o plazo de compra',
            'Recibe aviso si aparece una oportunidad compatible con lo que estás buscando',
          ].map((point) => (
            <li key={point} className="flex items-start gap-3">
              <span className="text-gold/60 mt-0.5 flex-shrink-0">—</span>
              <span className="text-[13px] text-[#8A8A8A] leading-relaxed">
                {point}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 max-w-md">
          <Link href="/vehiculos-a-la-carta" className="btn-gold w-full">
            Solicitar vehículo a la carta
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/coches" className="btn-outline w-full">
              Explorar coches
            </Link>
            <Link href="/motos" className="btn-outline w-full">
              Explorar motos
            </Link>
          </div>
        </div>
      </div>

      <div className="relative w-full min-h-[440px] lg:min-h-[500px] border border-bsm-border-light bg-[#080808] overflow-hidden">
        <Image
          src="/images/hero/vehicle-concierge-black-label.webp"
          alt="Búsqueda personalizada de coche o moto premium en Black Label"
          fill
          className="object-cover opacity-90"
          loading="lazy"
          sizes="(max-width: 1024px) 100vw, 55vw"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/30 via-[#080808]/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/85 via-[#080808]/10 to-[#080808]/20" />

        <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-7 lg:p-8">
          <div className="w-full max-w-lg border border-bsm-border-light bg-[#080808]/72 backdrop-blur-sm p-5 md:p-6">
            <p className="text-[10px] text-[#9E9E9E] uppercase tracking-widest mb-4">
              ¿Buscas algo muy concreto?
            </p>

            <p className="text-sm text-[#9A9A9A] leading-relaxed mb-5">
              Algunas unidades no aparecen todos los días. Registra tu búsqueda y
              cuéntanos exactamente qué estás intentando encontrar.
            </p>

            <Link
              href="/vehiculos-a-la-carta"
              className="flex items-center gap-2 text-xs text-gold hover:text-gold-light transition-colors"
            >
              Solicitar vehículo a la carta <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* PROFESSIONAL BLOCK */}
<section className="border-t border-[#141414] py-20">
  <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-stretch">

      {/* Imagen — izquierda en desktop, arriba en mobile */}
      <div className="relative w-full min-h-[440px] lg:min-h-[500px] border border-bsm-border-light bg-[#080808] overflow-hidden order-first">
        <Image
          src="/images/hero/professional-showroom-black-label.webp"
          alt="Showroom profesional premium con vehículo revisado para Black Label"
          fill
          className="object-cover opacity-90"
          loading="lazy"
          sizes="(max-width: 1024px) 100vw, 55vw"
        />

        <div className="absolute inset-0 bg-gradient-to-l from-[#080808]/35 via-[#080808]/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/85 via-[#080808]/15 to-[#080808]/20" />

        <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-7 lg:p-8">
          <div className="w-full max-w-lg border border-bsm-border-light bg-[#080808]/72 backdrop-blur-sm p-5 md:p-6">
            <p className="text-[10px] text-[#9E9E9E] uppercase tracking-widest mb-4">
              Qué queremos publicar
            </p>

            <ul className="space-y-3">
              {[
                'Vehículos con historia, configuración, versión o atractivo real',
                'Fotos cuidadas, información clara y disponibilidad actualizada',
                'Concesionarios, compraventas y especialistas con buena reputación online',
                'Stock premium, deportivo, clásico, enthusiast o unidades especiales',
              ].map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-2.5 text-[12px] text-[#9A9A9A] leading-relaxed"
                >
                  <span className="text-gold/50 mt-0.5 flex-shrink-0">→</span>
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t border-[#1A1A1A]">
              <Link
                href="/para-profesionales"
                className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors"
              >
                Conocer el acceso profesional <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Texto — derecha en desktop */}
      <div className="max-w-xl lg:py-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold/30" />
          <span className="text-[10px] text-gold/50 tracking-[0.3em] uppercase">
            Para showrooms, concesionarios y especialistas
          </span>
        </div>

        <h2 className="font-display text-2xl md:text-3xl font-light text-[#F4F1EA] mb-4">
          Un vehículo premium no debe competir<br />
          <span className="text-[#9A9A9A]">
            en el mismo lugar que todos los demás.
          </span>
        </h2>

        <p className="text-[13px] text-[#8A8A8A] leading-relaxed mb-6">
          Un vehículo premium merece presentarse en un entorno a su altura.
          Black Label ofrece una experiencia visual más cuidada, fichas con
          información clara y un contexto pensado para que tu stock llegue a
          compradores que saben lo que buscan.
        </p>

        <ul className="space-y-3 mb-8">
          {[
            'Acceso bajo solicitud, revisión de reputación',
            'Tu stock aparece en un entorno alineado con su valor',
            'El comprador entiende mejor qué vendes y por qué merece atención',
            'Un canal exclusivo para convertir vehículos especiales en oportunidades mejor presentadas',
            'Tu propio perfil profesional: catálogo completo, ubicación y contacto directo del comprador',
          ].map((point) => (
            <li key={point} className="flex items-start gap-3">
              <span className="text-gold/60 mt-0.5 flex-shrink-0">—</span>
              <span className="text-[13px] text-[#8A8A8A] leading-relaxed">
                {point}
              </span>
            </li>
          ))}
        </ul>

        <Link href="/para-profesionales" className="btn-outline px-8 py-3 text-sm inline-flex">
          Conocer el acceso profesional
        </Link>
      </div>
    </div>
  </div>
</section>

      {/* FAQ — dudas del comprador + posicionamiento GEO */}
      <FaqSection items={HOME_FAQ} heading="Preguntas frecuentes" eyebrow="Antes de empezar" />

    </>
  )
}
