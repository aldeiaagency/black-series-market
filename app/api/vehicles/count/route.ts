import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyVehicleFilters } from '@/lib/vehicle-query'

/**
 * GET /api/vehicles/count?type=car&<filters>
 * Returns { count } of active vehicles matching the given filters. Powers the live
 * "Ver N" counter in the filter drawer. Uses the exact same filter logic as the
 * listing pages so the count never diverges from the grid.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type: 'car' | 'motorcycle' = searchParams.get('type') === 'motorcycle' ? 'motorcycle' : 'car'

  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    if (key !== 'type' && value) params[key] = value
  })

  try {
    const supabase = await createClient()
    let query = supabase
      .from('vehicles')
      .select('id, dealer:dealers!inner(profile_status)', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('dealer.profile_status', 'published')
      .eq('vehicle_type', type)

    query = (await applyVehicleFilters(supabase, query, params, type)).query
    const { count } = await query

    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: null }, { status: 200 })
  }
}
