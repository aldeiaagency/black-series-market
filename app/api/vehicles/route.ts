import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  let query = supabase
    .from('vehicles')
    .select('*, dealer:dealers(name, slug, location_city, logo_url, is_verified, subscription_plan)', { count: 'exact' })
    .eq('status', 'active')

  const type = searchParams.get('type')
  if (type) query = query.eq('vehicle_type', type)

  const brand = searchParams.get('brand')
  if (brand) query = query.ilike('brand_name', brand)

  const priceMin = searchParams.get('price_min')
  if (priceMin) query = query.gte('price', parseInt(priceMin))

  const priceMax = searchParams.get('price_max')
  if (priceMax) query = query.lte('price', parseInt(priceMax))

  const featured = searchParams.get('featured')
  if (featured === 'true') {
    query = query
      .eq('is_featured', true)
      .gt('featured_until', new Date().toISOString())
  }

  const limit = parseInt(searchParams.get('limit') || '24')
  const offset = parseInt(searchParams.get('offset') || '0')

  query = query
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, limit, offset })
}
