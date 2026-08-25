import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Marcas con al menos un vehículo activo del tipo indicado.
// Alimenta el filtro de marca "centrado en stock" del buscador.
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') // 'car' | 'motorcycle'
  const vtype = type ? (type === 'car' ? 'car' : 'motorcycle') : null

  const supabase = await createClient()
  let query = supabase.from('vehicles').select('brand_name, dealer:dealers!inner(profile_status)').eq('status', 'active').eq('dealer.profile_status', 'published')
  if (vtype) query = query.eq('vehicle_type', vtype)
  const { data } = await query

  const names = Array.from(
    new Set((data ?? []).map((v: any) => v.brand_name).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'es'))

  return NextResponse.json(names)
}
