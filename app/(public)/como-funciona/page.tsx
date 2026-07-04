import Link from 'next/link'
import { Search, Heart, Bell, GitCompareArrows, MessageSquare, ShieldCheck, Package, BarChart2, X, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Cómo funciona — Black Label Market',
  description: 'Cómo funciona Black Label Market: marketplace de coches y motos premium con profesionales verificados. Para compradores y para concesionarios.',
  alternates: { canonical: '/como-funciona' },
  openGraph: {
    title: 'Cómo funciona — Black Label Market',
    description: 'Marketplace de coches y motos premium con profesionales verificados en España. Compradores: encuentra y contacta. Profesionales: publica y vende.',
    url: 'https://blacklabelmarket.es/como-funciona',
    siteName: 'Black Label Market',
    type: 'website',
  },
}

const FAQ_ITEMS = [
  {
    q: '¿Qué diferencia a Black Label Market de otros portales de coches?',
    a: 'Black Label Market solo admite profesionales verificados (concesionarios, compraventas y especialistas que han pasado revisión previa) y solo publica vehículos con información real, imágenes propias y disponibilidad confirmada. No somos un portal masivo de anuncios; nos centramos en unidades premium, deportivos, clásicos y motos de interés.',
  },
  {
    q: '¿Comprar en Black Label Market tiene algún coste?',
    a: 'No. Para el comprador, Black Label Market es totalmente gratuito: explorar el catálogo, guardar favoritos, comparar vehículos y contactar con los vendedores no tiene ningún coste. El servicio se sostiene con los profesionales que publican su inventario.',
  },
  {
    q: '¿Puedo contactar directamente con el vendedor?',
    a: 'Sí. Black Label Market facilita el contacto directo entre comprador y vendedor. No intervenimos como intermediarios en la operación de compraventa.',
  },
  {
    q: '¿Qué significa que un profesional esté verificado?',
    a: 'Antes de publicar, revisamos la reputación online, la especialización y la calidad de presentación de cada profesional. El badge "verificado" indica que ha superado ese proceso de selección.',
  },
  {
    q: '¿Puedo vender mi vehículo si soy particular?',
    a: 'Black Label Market trabaja únicamente con profesionales verificados: concesionarios, compraventas y especialistas. Si eres particular y quieres vender tu vehículo, lo habitual es hacerlo a través de uno de los profesionales de la plataforma.',
  },
  {
    q: '¿Qué garantías tienen los vehículos publicados?',
    a: 'Cada vehículo indica en su ficha si incluye garantía. Black Label no ofrece garantía propia: la garantía (si existe) la otorga el vendedor. Recomendamos siempre confirmar el estado, historial y documentación directamente con el concesionario antes de formalizar la compra.',
  },
  {
    q: '¿Puedo solicitar un vehículo que no encuentro en el catálogo?',
    a: 'Sí, a través del servicio "Vehículos a la carta". Descríbenos exactamente qué unidad buscas y, si aparece una oportunidad compatible, podemos avisarte.',
  },
  {
    q: '¿Se puede financiar un vehículo a través de Black Label?',
    a: 'Cada profesional puede ofrecer opciones de financiación propias o a través de sus colaboradores. Esto se indica en la ficha del vehículo. Black Label no gestiona financiación directamente.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

const BUYER_STEPS = [
  {
    icon: Search,
    title: 'Explora coches y motos premium',
    desc: 'Filtra por marca, modelo, precio, kilometraje, ubicación y otros criterios útiles para encontrar unidades que encajan con lo que buscas.',
  },
  {
    icon: Heart,
    title: 'Guarda tus vehículos favoritos',
    desc: 'Marca los vehículos que te interesan y vuelve a ellos cuando quieras. Así puedes comparar opciones con calma antes de contactar.',
  },
  {
    icon: GitCompareArrows,
    title: 'Compara hasta 3 vehículos',
    desc: 'Revisa varias unidades en una vista comparativa con datos clave, condiciones, ubicación, vendedor y ficha técnica.',
  },
  {
    icon: Bell,
    title: 'Solicita tu vehículo a la carta',
    desc: 'Si no encuentras la unidad que buscas, dinos qué coche o moto tienes en mente. Si aparece una oportunidad compatible, podremos avisarte.',
  },
  {
    icon: MessageSquare,
    title: 'Contacta con profesionales verificados',
    desc: 'Habla directamente con concesionarios, compraventas y especialistas seleccionados por su reputación, especialización y calidad de atención.',
  },
]

const DEALER_STEPS = [
  {
    icon: ShieldCheck,
    title: 'Solicita acceso',
    desc: 'En Black Label revisamos cada solicitud para mantener un estándar de reputación, presentación y calidad de servicio.',
  },
  {
    icon: Package,
    title: 'Publica tu inventario',
    desc: 'Sube fichas de calidad con imágenes reales, ficha técnica completa, equipamiento y condiciones de venta. El panel de gestión te permite controlar todo el proceso.',
  },
  {
    icon: MessageSquare,
    title: 'Recibe solicitudes más cualificadas',
    desc: 'Las solicitudes llegan con información útil sobre el comprador: plazo, financiación, entrega, preferencias y forma de contacto.',
  },
  {
    icon: BarChart2,
    title: 'Controla el rendimiento de tus publicaciones',
    desc: 'Consulta visitas, contactos recibidos, estado de cada solicitud y señales básicas para entender qué vehículos están generando más interés.',
  },
]

const NOT_BL = [
  'No somos un portal masivo de anuncios',
  'No aceptamos cualquier vendedor ni cualquier unidad',
  'No trabajamos por volumen, sino por encaje y presentación',
  'No intervenimos como parte en la operación de compraventa',
  'No sustituimos las comprobaciones técnicas y documentales del comprador',
]

const howToBuyerJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': `${SITE_URL}/como-funciona#howto-comprador`,
  name: 'Cómo comprar un coche o moto premium en Black Label Market',
  description: 'Pasos para encontrar, comparar y contactar con vendedores verificados de vehículos premium en España.',
  inLanguage: 'es-ES',
  step: BUYER_STEPS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.title,
    text: s.desc,
  })),
}

const howToDealerJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': `${SITE_URL}/como-funciona#howto-profesional`,
  name: 'Cómo publicar vehículos premium como profesional en Black Label Market',
  description: 'Pasos para solicitar acceso, publicar inventario y recibir leads cualificados como concesionario en España.',
  inLanguage: 'es-ES',
  step: DEALER_STEPS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.title,
    text: s.desc,
  })),
}

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToBuyerJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToDealerJsonLd) }} />

      {/* Hero */}
      <div className="mb-16 max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">CÓMO FUNCIONA</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-4 leading-tight">
          Cómo funciona Black Label Market
        </h1>
        <p className="text-bsm-text-secondary leading-relaxed">
          Black Label Market reúne coches y motos premium, deportivos, clásicos y unidades especiales en un entorno más selectivo y especializado que un portal generalista. Solo pueden publicar profesionales revisados y verificados por nosotros y cada unidad debe encajar con nuestro estándar de presentación, información y calidad.
        </p>
      </div>

      {/* Para compradores */}
      <section className="mb-20">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-light mb-2">Para compradores</h2>
          <p className="text-bsm-text-muted text-sm">Encuentra, compara y contacta con más confianza y garantías.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUYER_STEPS.map((step) => (
            <div key={step.title} className="bg-surface border border-bsm-border p-6 hover:border-[#C6A64B]/20 transition-colors">
              <div className="w-9 h-9 flex items-center justify-center border border-[#C6A64B]/20 bg-[#C6A64B]/5 mb-4">
                <step.icon className="w-4 h-4 text-[#C6A64B]" />
              </div>
              <h3 className="font-medium text-bsm-text-primary mb-2 text-sm leading-snug">{step.title}</h3>
              <p className="text-xs text-bsm-text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/coches" className="btn-gold px-6">Explorar coches</Link>
          <Link href="/motos" className="btn-outline px-6">Explorar motos</Link>
          <Link href="/vehiculos-a-la-carta" className="btn-outline px-6">Solicitar vehículos a la carta</Link>
        </div>
      </section>

      {/* Para dealers */}
      <section className="mb-20">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-light mb-2">Para profesionales</h2>
          <p className="text-bsm-text-muted text-sm">Un entorno pensado para presentar mejor tu stock y conectar con compradores más cualificados.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEALER_STEPS.map((step) => (
            <div key={step.title} className="bg-surface border border-bsm-border p-6 hover:border-[#C6A64B]/20 transition-colors">
              <div className="w-9 h-9 flex items-center justify-center border border-[#C6A64B]/20 bg-[#C6A64B]/5 mb-4">
                <step.icon className="w-4 h-4 text-[#C6A64B]" />
              </div>
              <h3 className="font-medium text-bsm-text-primary mb-2 text-sm">{step.title}</h3>
              <p className="text-xs text-bsm-text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/registro" className="btn-gold px-6">Quiero publicar en Black Label</Link>
        </div>
      </section>

      {/* Qué NO es Black Label */}
      <section className="mb-20">
        <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-8">
          <h2 className="font-display text-2xl font-light mb-6 text-bsm-text-primary">
            Qué no es Black Label Market
          </h2>
          <ul className="space-y-3">
            {NOT_BL.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <X className="w-4 h-4 text-[#9E9E9E] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#8A8A8A]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-light text-center mb-8">Preguntas frecuentes</h2>
          {FAQ_ITEMS.map(({ q, a }) => (
            <div key={q} className="border-b border-bsm-border py-5">
              <h3 className="font-medium text-bsm-text-primary mb-2">{q}</h3>
              <p className="text-sm text-bsm-text-secondary leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTAs finales */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-bsm-border p-8">
          <h3 className="font-display text-2xl font-light mb-3">Soy comprador</h3>
          <p className="text-sm text-bsm-text-muted mb-6 leading-relaxed">
            Explora el catálogo, guarda en favoritos y solicita la unidad que buscas si no la encuentras.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/coches" className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors">
              Explorar coches <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/motos" className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors">
              Explorar motos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="border border-[#C6A64B]/20 bg-[#C6A64B]/3 p-8">
          <h3 className="font-display text-2xl font-light mb-3 text-bsm-text-primary">Soy profesional</h3>
          <p className="text-sm text-bsm-text-muted mb-6 leading-relaxed">
            Solicita acceso para publicar tu inventario y llegar a compradores cualificados.
          </p>
          <Link href="/registro" className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors">
            Quiero publicar en Black Label <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
