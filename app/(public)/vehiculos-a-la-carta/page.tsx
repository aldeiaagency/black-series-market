import type { Metadata } from 'next'
import PrivateSearchForm from '@/components/marketplace/PrivateSearchForm'
import { AlertCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export const metadata: Metadata = {
  title: 'Vehículos a la carta — Encuentra el coche o moto premium que buscas',
  description: 'Describe el vehículo premium que buscas y conectamos con especialistas verificados cuando aparezca una unidad compatible. Porsche, Ferrari, Ducati, McLaren y más.',
  alternates: { canonical: '/vehiculos-a-la-carta' },
}

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/vehiculos-a-la-carta#webpage`,
  url: `${SITE_URL}/vehiculos-a-la-carta`,
  name: 'Vehículos a la carta — Black Label Market',
  description: 'Describe el vehículo premium que buscas y conectamos con especialistas verificados cuando aparezca una unidad compatible.',
  inLanguage: 'es-ES',
  isPartOf: { '@id': `${SITE_URL}/#website` },
}

const EXAMPLES = [
  'Porsche 911 manual, hasta 90.000 €, nacional, menos de 80.000 km',
  'Ducati Panigale V4 S, garantía activa, con historial completo',
  'Ferrari California T, color claro, transmisión DCT, menos de 40.000 km',
  'BMW M3 Competition xDrive, paquete carbon, entrega de vehículo',
]

export default function VehiculosALaCartaPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

      {/* Header */}
      <div className="mb-14 max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Servicio premium</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-4 leading-tight">
          Vehículos a la carta
        </h1>
        <p className="text-bsm-text-secondary leading-relaxed">
          Si no encuentras la unidad que buscas, Black Label puede registrar tu demanda
          y conectarla con profesionales seleccionados cuando aparezca una oportunidad compatible.
        </p>
        <div className="flex items-start gap-2 mt-5 p-4 border border-[#1A1A1A] bg-[#0A0A0A]">
          <AlertCircle className="w-4 h-4 text-[#737373] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#808080] leading-relaxed">
            Registramos tu demanda y la conectamos con profesionales verificados. Te avisamos cuando aparezca una oportunidad compatible.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Form */}
        <div className="lg:col-span-7">
          <div className="bg-surface border border-bsm-border p-8">
            <h2 className="font-display text-2xl font-light mb-6 pb-4 border-b border-bsm-border">
              Tu búsqueda
            </h2>
            <PrivateSearchForm />
          </div>
        </div>

        {/* Sidebar info */}
        <div className="lg:col-span-5 space-y-6">

          {/* Examples */}
          <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-6">
            <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-4">
              Ejemplos de búsquedas
            </p>
            <ul className="space-y-3">
              {EXAMPLES.map((ex) => (
                <li key={ex} className="flex items-start gap-2.5 text-xs text-[#8A8A8A] leading-relaxed">
                  <span className="text-[#C6A64B] mt-0.5">→</span>
                  {ex}
                </li>
              ))}
            </ul>
          </div>

          {/* How it works */}
          <div className="border border-[#1A1A1A] p-6">
            <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-4">Cómo funciona</p>
            <ol className="space-y-4">
              {[
                'Rellenas el formulario con tus criterios de búsqueda.',
                'Nuestro equipo lo revisa y lo registra en el sistema.',
                'Si aparece una unidad compatible, te contactamos.',
                'Tú decides si quieres que te presentemos la oportunidad.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-display text-sm text-gold flex-shrink-0 w-5">{i + 1}.</span>
                  <span className="text-xs text-[#8A8A8A] leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 pt-5 border-t border-[#141414]">
              <Link
                href="/como-funciona"
                className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors"
              >
                Cómo funciona Black Label Market
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* While waiting */}
          <div className="border border-[#1A1A1A] p-6">
            <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-4">
              Mientras tanto
            </p>
            <div className="space-y-3">
              {[
                { href: '/coches', label: 'Explorar coches disponibles' },
                { href: '/motos', label: 'Explorar motos disponibles' },
                { href: '/dealers', label: 'Ver showrooms verificados' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between text-sm text-[#8A8A8A] hover:text-[#C9C9C9] transition-colors"
                >
                  {label}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
