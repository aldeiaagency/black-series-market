import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'

// Contexto del showroom para componentes cliente (publicar, etc.): resuelve el dealer
// del usuario (dueño o miembro) y su permiso de edición de inventario.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const access = await getDealerAccess(user.id)
  if (!access) return NextResponse.json({ error: 'no_showroom' }, { status: 404 })

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select('id, location_city, location_region, subscription_plan')
    .eq('id', access.dealerId)
    .single()

  if (!dealer) return NextResponse.json({ error: 'no_showroom' }, { status: 404 })

  return NextResponse.json({
    dealerId: dealer.id,
    locationProvince: dealer.location_region || dealer.location_city || null,
    plan: dealer.subscription_plan || null,
    role: access.role,
    canEditInventory: getPermissions(access.role).canEditInventory,
  })
}
