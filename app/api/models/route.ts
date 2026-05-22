import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get('brand')
  const type  = req.nextUrl.searchParams.get('type') // 'car' | 'motorcycle'

  if (!brand) return NextResponse.json([])

  const supabase = await createClient()
  let query = supabase
    .from('vehicles')
    .select('model_name')
    .eq('status', 'active')
    .ilike('brand_name', `%${brand.replace(/-/g, ' ')}%`)

  if (type) query = query.eq('vehicle_type', type === 'car' ? 'car' : 'motorcycle')

  const { data } = await query.order('model_name')

  const unique = Array.from(new Set(data?.map((v: any) => v.model_name) ?? [])).sort()
  return NextResponse.json(unique)
}
