import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, Bell, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/marketplace/VehicleCard'

export const metadata = { title: 'Mis favoritos — Black Label Market' }

export default async function CuentaFavoritosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: favRows } = await supabase
    .from('favorites')
    .select('vehicle_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const vehicleIds = (favRows || []).map((f: { vehicle_id: string }) => f.vehicle_id)

  let vehicles: any[] = []
  if (vehicleIds.length > 0) {
    const { data } = await supabase
      .from('vehicles')
      .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified, subscription_plan)')
      .in('id', vehicleIds)
    // Preserve recency order (favorites order)
    const idIndex = Object.fromEntries(vehicleIds.map((id, i) => [id, i]))
    vehicles = (data || []).sort((a: any, b: any) => idIndex[a.id] - idIndex[b.id])
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">

      {/* Header */}
      <div className="mb-10">
        <Link href="/coches" className="flex items-center gap-1.5 text-sm text-bsm-text-muted hover:text-gold transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Explorar vehículos
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Mi cuenta</span>
        </div>
        <h1 className="section-title mb-2">Mis favoritos</h1>
        <p className="text-sm text-bsm-text-muted">
          {vehicles.length > 0
            ? `${vehicles.length} vehículo${vehicles.length !== 1 ? 's' : ''} guardado${vehicles.length !== 1 ? 's' : ''}`
            : 'Guarda unidades que te interesen para encontrarlas rápidamente'}
        </p>
      </div>

      {/* Subnav */}
      <div className="flex gap-4 mb-10 border-b border-bsm-border">
        <Link
          href="/cuenta/favoritos"
          className="flex items-center gap-2 pb-3 text-sm border-b-2 border-gold text-gold -mb-px"
        >
          <Heart className="w-3.5 h-3.5" />
          Favoritos
          {vehicles.length > 0 && (
            <span className="text-xs bg-gold/15 text-gold px-1.5 py-0.5 rounded-sm">{vehicles.length}</span>
          )}
        </Link>
        <Link
          href="/cuenta/alertas"
          className="flex items-center gap-2 pb-3 text-sm text-bsm-text-muted hover:text-bsm-text-primary transition-colors"
        >
          <Bell className="w-3.5 h-3.5" />
          Alertas
        </Link>
      </div>

      {/* Content */}
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((v: any) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      ) : (
        <div className="text-center py-24 border border-bsm-border bg-surface">
          <Heart className="w-12 h-12 text-[#2A2A2A] mx-auto mb-5" />
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-2">
            Aún no has guardado ningún vehículo
          </h2>
          <p className="text-sm text-bsm-text-muted mb-8 max-w-xs mx-auto">
            Pulsa el corazón en cualquier ficha de vehículo para guardarlo aquí.
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
    </div>
  )
}
