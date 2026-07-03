import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'

// Crear un vehículo (dueño o miembro con permiso de inventario). El dealer_id se fuerza
// al showroom del usuario, nunca se confía en el del payload.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })

  const access = await getDealerAccess(user.id)
  if (!access) return NextResponse.json({ error: 'No tienes un showroom activo.' }, { status: 403 })
  if (!getPermissions(access.role).canEditInventory) {
    return NextResponse.json({ error: 'No tienes permisos para publicar vehículos.' }, { status: 403 })
  }

  let payload: Record<string, unknown>
  try { payload = await request.json() } catch { return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 }) }

  // Seguridad: el dealer_id lo decide el servidor, no el cliente.
  payload.dealer_id = access.dealerId
  delete payload.id

  const admin = createAdminClient()
  const { data, error } = await admin.from('vehicles').insert(payload).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}

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

  // Cota dura: evita respuestas gigantes / DoS por ?limit=1000000.
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '24') || 24, 1), 60)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0') || 0, 0)

  query = query
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('GET /api/vehicles error', error)
    return NextResponse.json({ error: 'No se pudieron cargar los vehículos.' }, { status: 500 })
  }
  return NextResponse.json({ data, count, limit, offset })
}
