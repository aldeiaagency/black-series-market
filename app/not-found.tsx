import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Página no encontrada — Black Label Market',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-12 bg-gold/40" />
          <span className="text-[10px] text-gold/60 tracking-[0.3em] uppercase">404</span>
          <div className="h-px w-12 bg-gold/40" />
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-light text-[#F4F1EA] mb-4">
          Página no encontrada
        </h1>
        <p className="text-[14px] text-[#8A8A8A] leading-relaxed mb-10 max-w-md mx-auto">
          La URL que buscas no existe o ha sido movida. Puedes explorar el catálogo o volver al inicio.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link href="/" className="btn-gold px-6 py-3 text-sm">
            Volver al inicio
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/coches" className="btn-outline px-6 py-3 text-sm">
            Explorar coches
          </Link>
          <Link href="/motos" className="btn-outline px-6 py-3 text-sm">
            Explorar motos
          </Link>
        </div>

        <div className="border-t border-[#141414] pt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#5A5A5A]">
          <Link href="/dealers" className="hover:text-gold transition-colors">Showrooms</Link>
          <Link href="/marcas" className="hover:text-gold transition-colors">Marcas</Link>
          <Link href="/vehiculos-a-la-carta" className="hover:text-gold transition-colors">Vehículos a la carta</Link>
          <Link href="/guias" className="hover:text-gold transition-colors">Guías</Link>
          <Link href="/contacto" className="hover:text-gold transition-colors">Contacto</Link>
        </div>

      </div>
    </div>
  )
}
