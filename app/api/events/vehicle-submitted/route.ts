import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notifyN8n } from '@/lib/integrations/n8n'

/**
 * POST /api/events/vehicle-submitted
 * Emits `vehicle.submitted_for_review` after a dealer publishes a vehicle for review.
 * Secured: the caller must be authenticated AND own the dealer that owns the vehicle,
 * so the endpoint cannot be used to spoof events for arbitrary vehicles.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const vehicleId = body.vehicle_id ? String(body.vehicle_id) : null
  if (!vehicleId) {
    return NextResponse.json({ ok: false, error: 'missing_vehicle' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  // Verify ownership: vehicle → dealer → profile_id === current user.
  const admin = createAdminClient()
  const { data: vehicle } = await admin
    .from('vehicles')
    .select('id, status, brand_name, model_name, year, dealer_id, dealer:dealers(profile_id, name)')
    .eq('id', vehicleId)
    .single()

  const dealerRaw = vehicle?.dealer as any
  const dealer = (Array.isArray(dealerRaw) ? dealerRaw[0] : dealerRaw) as
    | { profile_id?: string; name?: string }
    | undefined
  if (!vehicle || dealer?.profile_id !== user.id) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  await notifyN8n('vehicle.submitted_for_review', {
    entityType: 'vehicle',
    entityId: vehicle.id,
    dealerId: vehicle.dealer_id,
    vehicleId: vehicle.id,
    payload: {
      brand: vehicle.brand_name,
      model: vehicle.model_name,
      year: vehicle.year,
      dealer_name: dealer?.name ?? null,
      status: vehicle.status,
    },
  })

  return NextResponse.json({ ok: true })
}
