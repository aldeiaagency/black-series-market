'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateVehicleStatus(vehicleId: string, status: 'active' | 'paused' | 'sold') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!dealer) throw new Error('Perfil de concesionario no encontrado')

  await supabase
    .from('vehicles')
    .update({ status })
    .eq('id', vehicleId)
    .eq('dealer_id', dealer.id)

  revalidatePath('/dashboard/inventario')
}
