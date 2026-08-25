import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get('brand')
  const type  = req.nextUrl.searchParams.get('type') // 'car' | 'motorcycle'

  if (!brand) return NextResponse.json([])

  const supabase = await createClient()
  const vtype = type ? (type === 'car' ? 'car' : 'motorcycle') : null

  // 1) Catálogo curado de modelos de la marca (tabla `models`) — se muestra
  //    aunque no haya stock, para no dejar marcas sin modelos en el buscador.
  const { data: brandRow } = await supabase
    .from('brands')
    .select('id')
    .eq('slug', brand)
    .maybeSingle()

  let catalog: { name: string }[] = []
  if (brandRow) {
    let catQuery = supabase
      .from('models')
      .select('name')
      .eq('brand_id', brandRow.id)
      .eq('is_active', true)
    if (vtype) catQuery = catQuery.eq('vehicle_type', vtype)
    const { data } = await catQuery
    catalog = data ?? []
  }

  // 2) Modelos realmente publicados (incluye marcas/modelos "Otro" fuera de
  //    catálogo, para no esconder nunca stock real).
  let pubQuery = supabase
    .from('vehicles')
    .select('model_name, dealer:dealers!inner(profile_status)')
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .ilike('brand_name', `%${brand.replace(/-/g, ' ')}%`)
  if (vtype) pubQuery = pubQuery.eq('vehicle_type', vtype)
  const { data: published } = await pubQuery

  const names = Array.from(
    new Set(
      [
        ...catalog.map((m) => m.name),
        ...(published ?? []).map((v: any) => v.model_name),
      ].filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'es'))

  return NextResponse.json(names)
}
