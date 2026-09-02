import Link from 'next/link'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Acceso profesional para showrooms — Black Label Market',
  description: 'Cómo funciona el acceso profesional a Black Label Market: valoración del showroom, llamada de admisión y alta guiada para concesionarios y especialistas premium.',
  alternates: { canonical: '/para-profesionales' },
  openGraph: {
    title: 'Acceso profesional — Black Label Market',
    description: 'El marketplace más selectivo de coches y motos premium en España. Conoce cómo funciona el acceso antes de solicitarlo.',
    url: 'https://blacklabelmarket.es/para-profesionales',
    siteName: 'Black Label Market',
    type: 'website',
  },
}

const BENEFITS = [
  {
    icon: '◈',
    title: 'Sin comisión por venta',
    body: 'Pagas la suscripción, no un porcentaje. Lo que cierras es tuyo.',
  },
  {
    icon: '◈',
    title: 'Compradores cualificados',
    body: 'Nuestro tráfico es específico: alguien que busca un Porsche 911 GT3 no llega aquí por accidente.',
  },
  {
    icon: '◈',
    title: 'Un catálogo seleccionado',
    body: 'Cada showroom pasa un proceso de admisión y cada vehículo pertenece a nuestro catálogo de marcas. El contexto premium protege el valor de tu stock.',
  },
  {
    icon: '◈',
    title: 'Perfil de showroom completo',
    body: 'Página de marca propia, logo, descripción, ubicación y todos tus vehículos en un solo lugar.',
  },
  {
    icon: '◈',
    title: 'Analítica de rendimiento',
    body: 'Visitas por anuncio, leads recibidos, comparativas con tu sector. Información para tomar decisiones.',
  },
  {
    icon: '◈',
    title: 'Leads cualificados',
    body: 'Los interesados contactan directamente desde la ficha. Recibes el mensaje con el vehículo referenciado.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Conoces el modelo',
    body: 'Lees cómo funciona Black Label Market y comparas las modalidades disponibles. No hace falta dejar ningún dato para esto.',
  },
  {
    n: '02',
    title: 'Solicitas la valoración',
    body: 'Nos cuentas sobre tu showroom: quién eres, dónde estáis y cómo os presentáis públicamente. Revisamos reputación, especialización y catálogo.',
  },
  {
    n: '03',
    title: 'Agendas la llamada',
    body: 'Si encajas con los criterios del market, eliges tú mismo cuándo hablamos. En esa llamada resolvemos dudas y vemos precio y condiciones sin compromiso.',
  },
  {
    n: '04',
    title: 'Empieza el alta',
    body: 'Si decides seguir adelante, abrimos la sala de configuración: perfil, equipo e inventario, antes de publicar.',
  },
]

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/para-profesionales#webpage`,
  url: `${SITE_URL}/para-profesionales`,
  name: 'Acceso profesional — Black Label Market',
  description: 'Cómo funciona el acceso profesional a Black Label Market para showrooms, concesionarios y especialistas premium.',
  inLanguage: 'es-ES',
  isPartOf: { '@id': `${SITE_URL}/#website` },
}

export default function ParaProfesionalesPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-28 pb-24">
      <JsonLd data={webPageJsonLd} />

      {/* Hero */}
      <div className="max-w-2xl mb-20">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Para profesionales</span>
        </div>
        <h1 className="section-title mb-5">
          Llega a compradores que saben exactamente lo que buscan
        </h1>
        <p className="text-bsm-text-secondary leading-relaxed mb-8">
          Black Label Market trabaja con showrooms, concesionarios y especialistas seleccionados —
          no con cualquiera que quiera publicar. Nuestros usuarios no comparan por precio: comparan
          por especificaciones, historial y presentación. Puedes conocer cómo funciona el acceso
          sin dejar ningún dato.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="#proceso-de-acceso" className="btn-gold px-6">
            Cómo funciona el acceso
          </Link>
          <Link href="/profesionales/planes" className="btn-outline px-6">
            Comparar modalidades
          </Link>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="mb-20">
        <h2 className="font-display text-xl text-bsm-text-primary mb-8">
          Lo que incluye tu presencia en Black Label Market
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="border border-bsm-border bg-surface p-6">
              <span className="text-gold text-lg mb-3 block">{b.icon}</span>
              <h3 className="font-semibold text-bsm-text-primary mb-2 text-sm">{b.title}</h3>
              <p className="text-sm text-bsm-text-muted leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Proceso de acceso — las 4 etapas */}
      <div id="proceso-de-acceso" className="mb-20 scroll-mt-24">
        <h2 className="font-display text-xl text-bsm-text-primary mb-2">Cómo funciona el acceso</h2>
        <p className="text-sm text-bsm-text-muted mb-8 max-w-xl">
          No es un alta automática. Así es el proceso, de principio a fin.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="border border-bsm-border bg-surface p-6">
              <span className="text-gold/60 font-display text-2xl font-light block mb-3">{s.n}</span>
              <h3 className="font-semibold text-bsm-text-primary mb-2 text-sm">{s.title}</h3>
              <p className="text-sm text-bsm-text-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Criteria block */}
      <div className="border border-bsm-border bg-surface p-8 mb-20 max-w-2xl">
        <h2 className="font-display text-lg text-bsm-text-primary mb-4">Criterios de publicación</h2>
        <p className="text-sm text-bsm-text-secondary leading-relaxed mb-4">
          Trabajamos con concesionarios especializados, dealers independientes, coleccionistas
          particulares profesionales y preparadores que cumplan nuestros estándares de
          documentación y presentación.
        </p>
        <p className="text-sm text-bsm-text-secondary leading-relaxed mb-4">
          No es un marketplace de volumen. Cada vehículo publicado tiene ficha técnica completa,
          fotografía de calidad y precio visible. Los anuncios sin información suficiente no se
          aprueban.
        </p>
        <Link href="/legal/criterios-publicacion" className="text-sm text-gold hover:text-gold-light transition-colors">
          Leer los criterios completos →
        </Link>
      </div>

      {/* Guía relacionada */}
      <div className="mb-16 p-6 border border-bsm-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gold tracking-widest uppercase mb-1">Lectura recomendada</p>
          <p className="text-sm text-bsm-text-primary font-medium">Cómo vender un coche premium con los compradores correctos</p>
          <p className="text-xs text-bsm-text-muted mt-1">Estrategia, documentación, precio y canales para vendedores de alta gama.</p>
        </div>
        <Link href="/guias/como-vender-coche-premium-profesionales" className="text-sm text-gold hover:text-gold-light transition-colors whitespace-nowrap flex-shrink-0">
          Leer la guía →
        </Link>
      </div>

      {/* CTA final */}
      <div className="border-t border-bsm-border pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-bsm-text-primary font-semibold mb-1">¿Tu showroom encaja con la selección?</p>
          <p className="text-sm text-bsm-text-muted">
            Envíanos su información. La solicitud no crea una cuenta ni implica aceptación automática.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/profesionales/solicitar-acceso" className="btn-gold px-6 whitespace-nowrap">
            Solicitar valoración
          </Link>
          <Link href="/profesionales/planes" className="btn-outline px-6 whitespace-nowrap">
            Comparar modalidades
          </Link>
        </div>
      </div>
    </div>
  )
}
