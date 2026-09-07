import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createPublicClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'
import { loadRecentVehicles } from '@/lib/vehicle-query'

// ISR: mismo patrón que /coches y /motos — catálogo público, cache CDN, revalida cada 5 min.
export const revalidate = 300

// Hub ligero, no un tercer catálogo: sin filtros, sin paginación propia, sin FAQ/JSON-LD.
// Arreglado tras un desajuste real detectado el 07-09-2026 — el CTA "Ver todos" de la home
// mostraba coches+motos mezclados pero enlazaba solo a /coches, y con un parámetro
// (orden=newest) que /coches ni siquiera lee (lee sort=newest) — el orden nunca funcionó.
// noindex a propósito: mismo contenido que /coches+/motos combinados, sin intención de
// búsqueda propia — se evita competir por las mismas keywords. follow sí, para que el
// link equity llegue a las fichas reales.
export const metadata: Metadata = {
  title: 'Novedades',
  description: 'Las últimas unidades publicadas en Black Label Market: coches y motos premium, deportivos, clásicos y unidades especiales.',
  robots: { index: false, follow: true },
}

const LIMIT = 24

export default async function NovedadesPage() {
  const supabase = createPublicClient()

  const vehicles = await loadRecentVehicles(supabase, { limit: LIMIT, windowDays: 30, minCount: 8 })

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Novedades</span>
        </div>
        <h1 className="section-title mb-3">Últimas unidades publicadas</h1>
        <p className="text-sm text-bsm-text-muted max-w-2xl">
          Coches y motos premium recién llegados al catálogo. ¿Buscas solo uno de los dos?
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/coches?sort=newest" className="btn-outline px-5 inline-flex items-center gap-2">
            Ver todos los coches <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/motos?sort=newest" className="btn-outline px-5 inline-flex items-center gap-2">
            Ver todas las motos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {vehicles && vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-bsm-border bg-surface">
          <p className="text-sm text-bsm-text-muted">No hay unidades publicadas todavía.</p>
        </div>
      )}
    </div>
  )
}
