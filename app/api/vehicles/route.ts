import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'
import { sanitizeVehiclePayload } from '@/lib/vehicle-write'

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

  // Seguridad: quita campos reservados al sistema (moderación/destacado/sellos/contador) y
  // fuerza status a draft|pending_review. El admin client se salta el trigger 060, así que el
  // saneo va aquí. El dealer_id lo decide el servidor, no el cliente.
  const clean = sanitizeVehiclePayload(payload)
  clean.dealer_id = access.dealerId

  const admin = createAdminClient()
  const { data, error } = await admin.from('vehicles').insert(clean).select('id').single()
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
