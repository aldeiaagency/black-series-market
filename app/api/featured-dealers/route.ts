import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const provincias = searchParams.get('provincias')?.split(',').filter(Boolean) ?? []
  const vehicleType = searchParams.get('type') // 'car' | 'motorcycle' | null

  const supabase = await createClient()

  // Step 1: get dealer_ids that have at least one active vehicle matching filters
  let vq = supabase.from('vehicles').select('dealer_id, dealer:dealers!inner(profile_status)').eq('status', 'active').eq('dealer.profile_status', 'published')
  if (vehicleType) vq = vq.eq('vehicle_type', vehicleType)
  if (provincias.length) vq = vq.in('location_province', provincias)

  const { data: vehicles } = await vq
  if (!vehicles?.length) return NextResponse.json([])

  const dealerIds = Array.from(new Set(vehicles.map((v: { dealer_id: string }) => v.dealer_id)))

  // Step 2: fetch those dealers with featured metadata
  // Auditoría de seguridad 2026-09-02 (P0.2): quitado subscription_plan del select — is_featured
  // ya lo refleja siempre (el webhook de Stripe fija is_featured=true exactamente cuando el plan
  // es elite), así que la comprobación era redundante, no una necesidad real.
  const { data: dealers } = await supabase
    .from('dealers')
    .select('id, name, slug, location_city, location_region, is_featured')
    .eq('status', 'active')
    .eq('profile_status', 'published')
    .in('id', dealerIds)
    .order('name')

  const result = (dealers || []).map((d: any) => ({
    ...d,
    isFeatured: d.is_featured === true,
  }))

  // Sort: featured first, then alphabetical
  result.sort((a: any, b: any) => {
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1
    return a.name.localeCompare(b.name, 'es')
  })

  return NextResponse.json(result)
}
