import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const provincias = searchParams.get('provincias')?.split(',').filter(Boolean) ?? []
  const vehicleType = searchParams.get('type') // 'car' | 'motorcycle' | null

  const supabase = await createClient()

  // Step 1: get dealer_ids that have at least one active vehicle matching filters
  let vq = supabase.from('vehicles').select('dealer_id').eq('status', 'active')
  if (vehicleType) vq = vq.eq('vehicle_type', vehicleType)
  if (provincias.length) vq = vq.in('location_province', provincias)

  const { data: vehicles } = await vq
  if (!vehicles?.length) return NextResponse.json([])

  const dealerIds = Array.from(new Set(vehicles.map((v: { dealer_id: string }) => v.dealer_id)))

  // Step 2: fetch those dealers with featured metadata
  const { data: dealers } = await supabase
    .from('dealers')
    .select('id, name, slug, location_city, location_region, is_featured, subscription_plan')
    .eq('status', 'active')
    .in('id', dealerIds)
    .order('name')

  // Mark featured: is_featured OR elite plan
  const result = (dealers || []).map((d: any) => ({
    ...d,
    isFeatured: d.is_featured === true || d.subscription_plan === 'elite',
  }))

  // Sort: featured first, then alphabetical
  result.sort((a: any, b: any) => {
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1
    return a.name.localeCompare(b.name, 'es')
  })

  return NextResponse.json(result)
}
