import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Barrido de expiración de boosts. Vercel Cron lo llama cada hora.
// Un boost dura BOOST_DURATION_DAYS; al vencer hay que:
//   1. cerrar la activación (status 'expired') para contabilidad,
//   2. revertir el destacado del vehículo (is_featured=false, featured_until=null),
//      porque activateBoost pone is_featured=true y nada lo apaga solo. El badge
//      "Destacado" ya se guarda por featured_until>now, pero el `.order('is_featured')`
//      del catálogo seguiría sesgado sin este reset.
// Vercel envía Authorization: Bearer <CRON_SECRET>.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const nowIso = new Date().toISOString()

  // 1. Cerrar activaciones vencidas.
  const activations = await admin
    .from('boost_activations')
    .update({ status: 'expired' }, { count: 'exact' })
    .eq('status', 'active')
    .lt('ends_at', nowIso)

  if (activations.error) {
    console.error('[expire-boosts] activations error:', activations.error.message)
    return NextResponse.json({ error: activations.error.message }, { status: 500 })
  }

  // 2. Revertir el destacado en los vehículos cuyo boost ya venció.
  const vehicles = await admin
    .from('vehicles')
    .update({ is_featured: false, featured_until: null }, { count: 'exact' })
    .eq('is_featured', true)
    .lt('featured_until', nowIso)

  if (vehicles.error) {
    console.error('[expire-boosts] vehicles error:', vehicles.error.message)
    return NextResponse.json({ error: vehicles.error.message }, { status: 500 })
  }

  console.log(`[expire-boosts] expired ${activations.count} activations, unfeatured ${vehicles.count} vehicles`)
  return NextResponse.json({ ok: true, expired_activations: activations.count, unfeatured_vehicles: vehicles.count })
}
