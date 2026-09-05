import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Sobre nosotros — Black Label Market',
  description:
    'Black Label Market nació para darle al vehículo premium el escaparate que merece. Conoce quiénes somos, cómo verificamos a los profesionales y qué hace diferente a este marketplace.',
  alternates: { canonical: '/sobre-nosotros' },
  openGraph: {
    title: 'Sobre nosotros — Black Label Market',
    description:
      'Black Label Market nació para darle al vehículo premium el escaparate que merece. Conoce quiénes somos y qué nos diferencia.',
    url: `${SITE_URL}/sobre-nosotros`,
    siteName: 'Black Label Market',
    type: 'website',
  },
}

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/sobre-nosotros`,
  url: `${SITE_URL}/sobre-nosotros`,
  name: 'Sobre nosotros — Black Label Market',
  description:
    'Black Label Market es un marketplace de coches y motos premium en España con concesionarios y especialistas verificados y criterio editorial.',
  inLanguage: 'es-ES',
  isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Sobre nosotros' },
  ],
}

export default function SobreNosotrosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-28 pb-24">
      <JsonLd data={aboutPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-10">
        <ol className="flex items-center gap-1.5 text-xs text-bsm-text-muted">
          <li><Link href="/" className="hover:text-gold transition-colors">Inicio</Link></li>
          <li className="text-[#3A3A3A]" aria-hidden="true">/</li>
          <li className="text-bsm-text-secondary" aria-current="page">Sobre nosotros</li>
        </ol>
      </nav>

      {/* Hero */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Sobre nosotros</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-8 leading-tight">
          Compradores que saben lo que buscan. Vendedores que cuidan lo que venden.
        </h1>
        <div className="space-y-4 text-bsm-text-secondary leading-relaxed">
          <p>
            Los vehículos premium tienen un problema de visibilidad que no tiene nada que ver con la oferta.
            El stock existe. Los compradores existen. El problema es el contexto: un Ferrari F8, una Ducati Panigale
            V4R o un Porsche 992 GT3 terminan en los mismos portales que miles de coches convencionales, compitiendo
            por atención con fotos de móvil y fichas sin información útil. No es que esté mal. Es que simplemente
            no tiene sentido.
          </p>
          <p>
            Black Label Market nació de esa convicción. Y también, seamos honestos, porque somos amantes del motor
            premium y queríamos que existiese un sitio así.
          </p>
        </div>
      </div>

      {/* Secciones editoriales */}
      <div className="max-w-3xl space-y-0">

        {/* Por qué existe */}
        <section className="border-t border-[#141414] py-14">
          <h2 className="font-display text-2xl md:text-3xl font-light text-bsm-text-primary mb-6">
            No somos el portal más grande. Somos el que tiene criterio.
          </h2>
          <div className="space-y-4 text-bsm-text-secondary leading-relaxed text-[15px]">
            <p>
              La propuesta no es complicada: un marketplace donde hay un estándar real de entrada, donde cada
              concesionario o compraventa ha sido verificado antes de poder publicar, y donde el comprador llega
              a un catálogo con criterio en lugar de a un buscador de volumen.
            </p>
            <p>
              No buscamos ser excluyentes. La palabra clave no es exclusividad, es coherencia. Un Aston Martin,
              una MV Agusta o un clásico europeo con historial completo merecen aparecer en un entorno que esté a
              su altura. Eso beneficia al comprador, que filtra menos para encontrar lo que busca. Y beneficia al
              vendedor, que llega al perfil de comprador correcto desde el primer contacto.
            </p>
            <p>
              Hemos visto de primera mano, trabajando con concesionarios y especialistas del sector, que el problema
              no siempre es la falta de compradores. El problema es llegar al comprador adecuado con el contexto
              adecuado. Black Label Market es la respuesta práctica a ese problema.
            </p>
          </div>
        </section>

        {/* Para el comprador */}
        <section className="border-t border-[#141414] py-14">
          <h2 className="font-display text-2xl md:text-3xl font-light text-bsm-text-primary mb-6">
            Lo que ganas como comprador
          </h2>
          <div className="space-y-4 text-bsm-text-secondary leading-relaxed text-[15px]">
            <p>
              Cuando llegas a Black Label, el trabajo de filtrado ya está hecho.
            </p>
            <p>
              No hay anuncios sin criterio ni stock que no pertenezca a esta categoría. Cada showroom o compraventa
              que aparece aquí ha pasado por un proceso de verificación real antes de publicar. Cada vehículo tiene
              que cumplir un estándar de presentación: información completa, fotografía de calidad, precio visible.
              Sin esas condiciones, no aparece.
            </p>
          </div>
          <ul className="my-6 space-y-3">
            {[
              'El catálogo tiene criterio aplicado. Sin anuncios fuera de categoría.',
              'Cada concesionario o showroom ha pasado una revisión real antes de publicar.',
              'Cada vehículo cumple un estándar de presentación: información completa, imagen de calidad, precio visible.',
              'Si no encuentras lo que buscas, Vehículos a la carta trabaja para ti.',
            ].map((item) => (
              <li key={item} className="flex gap-3 text-[15px] text-bsm-text-secondary">
                <span className="text-gold flex-shrink-0 mt-0.5">◈</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-bsm-text-secondary leading-relaxed text-[15px]">
            El resultado es concreto: pasas menos tiempo descartando y más tiempo comparando opciones que realmente
            tienen sentido para lo que buscas. Y si no encuentras exactamente lo que quieres, el servicio{' '}
            <Link href="/vehiculos-a-la-carta" className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors">
              Vehículos a la carta
            </Link>{' '}
            trabaja para encontrarlo. El mercado premium europeo es amplio. A veces solo hace falta saber dónde mirar.
          </p>
        </section>

        {/* Para el profesional */}
        <section className="border-t border-[#141414] py-14">
          <h2 className="font-display text-2xl md:text-3xl font-light text-bsm-text-primary mb-6">
            Lo que ganas como profesional
          </h2>
          <div className="space-y-4 text-bsm-text-secondary leading-relaxed text-[15px]">
            <p>
              Publicar stock premium en un portal generalista no es solo un problema estético. El impacto es
              comercial y directo: el perfil equivocado llega con el precio como primera y única palanca, el tiempo
              del equipo se va en filtrar consultas sin cualificación real, y los vehículos de mayor valor quedan
              enterrados entre volumen.
            </p>
            <p>
              Black Label Market es un canal pensado para llegar a compradores que ya han tomado una decisión de
              categoría. No vienen a ver si les gusta un deportivo. Saben que buscan un deportivo, saben cuánto vale
              y saben qué preguntar. Eso cambia la calidad de cada contacto desde el primer momento.
            </p>
            <p>
              Además de la visibilidad en el marketplace, los profesionales de Black Label tienen acceso a
              herramientas operativas desarrolladas por{' '}
              <a
                href="https://blackseriesagency.es"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors"
              >
                Black Series Agency
              </a>
              : gestión de leads, automatización de seguimiento, cualificación y procesos comerciales pensados para
              este segmento. La infraestructura que hay detrás del marketplace es la misma que usamos para que los
              mejores operadores del sector funcionen con menos fuga y más control. No es un portal más donde
              publicar un anuncio. Es un sistema.
            </p>
          </div>
        </section>

        {/* Cómo entra un profesional */}
        <section className="border-t border-[#141414] py-14">
          <h2 className="font-display text-2xl md:text-3xl font-light text-bsm-text-primary mb-6">
            Cómo entra un profesional
          </h2>
          <div className="space-y-4 text-bsm-text-secondary leading-relaxed text-[15px]">
            <p>
              El proceso de verificación no es complicado, pero es real. No es un formulario que alguien llena
              y un sistema aprueba automáticamente.
            </p>
            <p>
              El profesional solicita una valoración, nosotros revisamos su reputación online, el tipo de stock que
              trabaja y la calidad de cómo lo presenta. Miramos cómo trata a sus clientes, qué tipo de negocio es y
              si encaja con lo que Black Label quiere ofrecer. Si cumple el estándar, le invitamos a una llamada
              para explicarle las condiciones y confirmar juntos ese encaje — solo entonces empieza el alta. Si no
              está en el nivel correcto todavía, se lo explicamos sin rodeos.
            </p>
            <p>
              La razón es sencilla: la calidad de lo que un comprador encuentra aquí depende directamente de quién
              está detrás de cada anuncio. Y eso no lo garantiza ningún algoritmo. Lo garantiza decidir bien a
              quién se le da acceso.
            </p>
          </div>
          <div className="mt-8 border border-[#1A1A1A] bg-[#0A0A0A] p-6 inline-flex items-start gap-3">
            <span className="text-gold mt-0.5">◈</span>
            <p className="text-sm text-bsm-text-muted leading-relaxed">
              <span className="text-bsm-text-secondary font-medium">Calidad antes que cantidad.</span>{' '}
              Esa es la única regla que no cambia.
            </p>
          </div>
        </section>

        {/* Black Series Agency */}
        <section className="border-t border-[#141414] py-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-gold" />
            <span className="text-xs text-gold tracking-widest uppercase">El equipo</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-light text-bsm-text-primary mb-6">
            Black Series Agency
          </h2>
          <div className="space-y-4 text-bsm-text-secondary leading-relaxed text-[15px]">
            <p>
              Black Label Market es un proyecto de{' '}
              <a
                href="https://blackseriesagency.es"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors"
              >
                Black Series Agency
              </a>
              , una agencia especializada en el mundo del motor. Trabajamos con inteligencia artificial,
              automatización y marketing digital para operadores de automoción premium: concesionarios, compraventas
              y especialistas que quieren que su operativa funcione mejor, no solo diferente.
            </p>
            <p>
              El trabajo de Black Series no es vender más leads. Es que los que ya entran se pierdan menos,
              se cualifiquen mejor y lleguen al comercial adecuado en el momento adecuado. Revenue Ops, control
              de oportunidades, gestión de inventario, reputación, reporting ejecutivo. Infraestructura comercial
              para negocios que mueven vehículos de alto valor y no pueden permitirse perder oportunidades por
              procesos que no están a la altura.
            </p>
            <p>
              El marketplace nació de ese trabajo directo con el sector. Si llevas años construyendo sistemas para
              que los mejores operadores del mercado premium funcionen mejor, tiene todo el sentido crear también
              el canal donde su stock llega al comprador que lo estaba buscando.
            </p>
          </div>
          <div className="mt-8">
            <a
              href="https://blackseriesagency.es"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors"
            >
              Conoce Black Series Agency <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

      </div>

      {/* CTAs finales */}
      <div className="border-t border-[#141414] pt-12 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-bsm-border p-7">
          <p className="text-xs text-gold tracking-widest uppercase mb-3">Catálogo</p>
          <p className="text-sm text-bsm-text-secondary leading-relaxed mb-5">
            Explora coches y motos premium con criterio de selección real.
          </p>
          <Link
            href="/coches"
            className="inline-flex items-center gap-2 text-sm text-bsm-text-secondary hover:text-gold transition-colors"
          >
            Explorar el catálogo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="border border-gold/20 bg-gold/3 p-7">
          <p className="text-xs text-gold tracking-widest uppercase mb-3">Profesionales</p>
          <p className="text-sm text-bsm-text-secondary leading-relaxed mb-5">
            Publica tu inventario y llega a compradores que ya saben lo que buscan.
          </p>
          <Link
            href="/para-profesionales"
            className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors"
          >
            Acceso para profesionales <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="border border-bsm-border p-7">
          <p className="text-xs text-gold tracking-widest uppercase mb-3">Contacto</p>
          <p className="text-sm text-bsm-text-secondary leading-relaxed mb-5">
            Cualquier pregunta sobre el marketplace o sobre cómo trabajamos.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 text-sm text-bsm-text-secondary hover:text-gold transition-colors"
          >
            Hablar con nosotros <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  )
}
