'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import VehicleCard from '@/components/marketplace/VehicleCard'
import { useFavorites } from '@/hooks/useFavorites'
import type { Vehicle } from '@/lib/types'

export default function MisFavoritosPage() {
  const { favorites, mounted, isAuthenticated } = useFavorites()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mounted) return

    if (favorites.length === 0) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    supabase
      .from('vehicles')
      .select('*, dealer:dealers!inner(name, slug, location_city, logo_url)')
      .in('id', favorites)
      .eq('status', 'active')
      .eq('dealer.profile_status', 'published')
      .then(({ data }) => {
        setVehicles((data as Vehicle[]) || [])
        setLoading(false)
      })
  }, [mounted, favorites])

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-10">
        <Link href="/coches" className="flex items-center gap-1.5 text-sm text-bsm-text-muted hover:text-gold transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Explorar vehículos
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Guardados</span>
        </div>
        <h1 className="section-title mb-2">Mis favoritos</h1>
        <p className="text-sm text-bsm-text-muted">
          Crea alertas y guarda unidades para revisarlas después
        </p>
      </div>

      {!mounted || loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-bsm-border">
              <div className="aspect-[16/10] shimmer" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-20 bg-surface-elevated shimmer" />
                <div className="h-5 w-40 bg-surface-elevated shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      ) : (
        <div className="text-center py-24 border border-bsm-border bg-surface">
          <Heart className="w-12 h-12 text-bsm-border mx-auto mb-5" />
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-2">
            Aún no has guardado ningún vehículo
          </h2>
          <p className="text-sm text-bsm-text-muted mb-8 max-w-xs mx-auto">
            Guarda unidades que te interesen para encontrarlas rápidamente cuando vuelvas.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/coches" className="btn-gold px-6">
              Explorar coches
            </Link>
            <Link href="/motos" className="btn-outline px-6">
              Explorar motos
            </Link>
          </div>
        </div>
      )}

      {vehicles.length > 0 && !isAuthenticated && (
        <div className="mt-10 p-4 border border-[#1A1A1A] bg-[#0A0A0A] text-[11px] text-[#9E9E9E] text-center">
          Los favoritos se guardan en este dispositivo.{' '}
          <a href="/registro-comprador" className="text-gold hover:underline">
            Crea una cuenta gratuita
          </a>{' '}
          para sincronizarlos en todos tus dispositivos.
        </div>
      )}
    </div>
  )
}
