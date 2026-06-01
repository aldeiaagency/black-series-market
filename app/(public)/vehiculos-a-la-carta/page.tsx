import type { Metadata } from 'next'
import PrivateSearchForm from '@/components/marketplace/PrivateSearchForm'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Vehículos a la carta',
  description: 'No encuentras lo que buscas. Cuéntanos qué coche o moto tienes en mente y revisamos opciones compatibles entre profesionales verificados.',
}

export default function VehiculosALaCartaPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-28 pb-20">

      {/* Header */}
      <div className="mb-14 max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Búsqueda personalizada</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-bsm-text-primary mb-4 leading-tight">
          ¿No encuentras el vehículo que buscas?
        </h1>
        <p className="text-bsm-text-secondary leading-relaxed">
          Cuéntanos qué coche o moto tienes en mente y revisaremos opciones compatibles entre profesionales verificados.
        </p>
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

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-6">

          <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-6">
            <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-4">Ejemplos de búsquedas</p>
            <ul className="space-y-3">
              {[
                'Porsche 911 manual, hasta 90.000 €, nacional, menos de 80.000 km',
                'Ducati Panigale V4 S, garantía activa, con historial completo',
                'Ferrari California T, color claro, menos de 40.000 km',
                'BMW M3 Competition xDrive, paquete carbon, entrega de vehículo',
              ].map((ex) => (
                <li key={ex} className="flex items-start gap-2.5 text-xs text-[#8A8A8A] leading-relaxed">
                  <span className="text-[#C6A64B] mt-0.5">→</span>
                  {ex}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-[#1A1A1A] p-6">
            <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-4">Cómo funciona</p>
            <ol className="space-y-4">
              {[
                'Rellenas el formulario con lo que buscas.',
                'Revisamos opciones entre profesionales verificados.',
                'Si aparece una unidad compatible, te avisamos.',
                'Tú decides si quieres saber más.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-display text-sm text-gold flex-shrink-0 w-5">{i + 1}.</span>
                  <span className="text-xs text-[#8A8A8A] leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 pt-5 border-t border-[#141414]">
              <Link href="/como-funciona" className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors">
                Cómo funciona Black Label Market
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="border border-[#1A1A1A] p-6">
            <p className="text-[10px] text-bsm-text-muted uppercase tracking-widest mb-4">Mientras tanto</p>
            <div className="space-y-3">
              {[
                { href: '/coches', label: 'Ver coches disponibles' },
                { href: '/motos',  label: 'Ver motos disponibles' },
                { href: '/dealers',label: 'Ver showrooms verificados' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="flex items-center justify-between text-sm text-[#8A8A8A] hover:text-[#C9C9C9] transition-colors">
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
