import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, Bell, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import VehicleCard from '@/components/marketplace/VehicleCard'

export const metadata = { title: 'Vehículos guardados — Black Label Market' }

async function removeSaved(formData: FormData) {
  'use server'
  const vehicleId = formData.get('vehicleId') as string
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !vehicleId) return
  await supabase.from('favorites').delete()
    .eq('profile_id', user.id)
    .eq('vehicle_id', vehicleId)
  revalidatePath('/cuenta/favoritos')
}

export default async function CuentaFavoritosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: favRows } = await supabase
    .from('favorites')
    .select('vehicle_id')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  const vehicleIds = (favRows || []).map((f: { vehicle_id: string }) => f.vehicle_id)

  let vehicles: any[] = []
  if (vehicleIds.length > 0) {
    const { data } = await supabase
      .from('vehicles')
      .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified, subscription_plan)')
      .in('id', vehicleIds)
    // Preserve recency order
    const idIndex = Object.fromEntries(vehicleIds.map((id, i) => [id, i]))
    vehicles = (data || []).sort((a: any, b: any) => idIndex[a.id] - idIndex[b.id])
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 pt-28 pb-20">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Mi cuenta</span>
        </div>
        <h1 className="section-title mb-2">Tus vehículos guardados</h1>
        <p className="text-sm text-bsm-text-muted">
          {vehicles.length > 0
            ? `${vehicles.length} vehículo${vehicles.length !== 1 ? 's' : ''} guardado${vehicles.length !== 1 ? 's' : ''}`
            : 'Guarda coches y motos que te interesen para revisarlos más tarde.'}
        </p>
      </div>

      {/* Subnav */}
      <div className="flex gap-4 mb-10 border-b border-bsm-border">
        <Link
          href="/cuenta/favoritos"
          className="flex items-center gap-2 pb-3 text-sm border-b-2 border-gold text-gold -mb-px"
        >
          <Heart className="w-3.5 h-3.5" />
          Guardados
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
          {vehicles.map((v: any) => (
            <div key={v.id} className="relative group">
              <VehicleCard vehicle={v} />
              {/* Remove button — siempre visible en táctil; en desktop se revela al hover/foco */}
              <form action={removeSaved} className="absolute top-2 right-2 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                <input type="hidden" name="vehicleId" value={v.id} />
                <button
                  type="submit"
                  className="w-7 h-7 flex items-center justify-center bg-[#0A0A0A]/90 border border-bsm-border text-[#9E9E9E] hover:text-red-400 hover:border-red-400/30 focus-visible:opacity-100 focus-visible:text-red-400 transition-colors"
                  title="Quitar de guardados"
                  aria-label="Quitar de guardados"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-bsm-border bg-surface">
          <Heart className="w-12 h-12 text-bsm-border mx-auto mb-5" />
          <h2 className="font-display text-xl font-light text-bsm-text-primary mb-2">
            No tienes vehículos guardados
          </h2>
          <p className="text-sm text-bsm-text-muted mb-8 max-w-xs mx-auto">
            Cuando guardes un coche o una moto, aparecerá aquí para que puedas revisarlo más tarde.
          </p>
          <Link href="/coches" className="btn-gold px-6">
            Ver vehículos
          </Link>
        </div>
      )}
    </div>
  )
}
