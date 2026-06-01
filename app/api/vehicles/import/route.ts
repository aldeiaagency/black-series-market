import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ImportRow {
  vehicle_type?: string
  brand_name?: string
  model_name?: string
  version?: string
  year?: string | number
  mileage_km?: string | number
  price?: string | number
  price_on_request?: string | boolean
  fuel_type?: string
  transmission?: string
  power_hp?: string | number
  color_exterior?: string
  color_interior?: string
  body_type?: string
  description?: string
  vin?: string
}

interface RowError { row: number; message: string }

// ── Value normalisers ──────────────────────────────────────────────────────────

const FUEL_MAP: Record<string, string> = {
  gasolina: 'gasoline', gasoline: 'gasoline',
  diesel: 'diesel', diésel: 'diesel', 'dièsel': 'diesel',
  eléctrico: 'electric', electrico: 'electric', electric: 'electric',
  híbrido: 'hybrid', hibrido: 'hybrid', hybrid: 'hybrid',
  'híbrido enchufable': 'plugin_hybrid', 'plugin hybrid': 'plugin_hybrid', plugin_hybrid: 'plugin_hybrid',
  hidrógeno: 'hydrogen', hidrogeno: 'hydrogen', hydrogen: 'hydrogen',
  otro: 'other', other: 'other',
}

const TRANS_MAP: Record<string, string> = {
  manual: 'manual',
  automático: 'automatic', automatico: 'automatic', auto: 'automatic', automatic: 'automatic',
  'semi-automático': 'semi_automatic', semiautomático: 'semi_automatic', semi_automatic: 'semi_automatic',
  dct: 'dct', cvt: 'cvt',
}

function toVehicleType(v?: string): 'car' | 'motorcycle' {
  if (!v) return 'car'
  const s = v.toLowerCase().trim()
  return ['moto', 'motorcycle', 'motocicleta', 'moto_clasica'].includes(s) ? 'motorcycle' : 'car'
}

function toFuel(v?: string): string | null {
  if (!v) return null
  return FUEL_MAP[v.toLowerCase().trim()] ?? null
}

function toTrans(v?: string): string | null {
  if (!v) return null
  return TRANS_MAP[v.toLowerCase().trim()] ?? null
}

function toBool(v?: string | boolean): boolean {
  if (typeof v === 'boolean') return v
  if (!v) return false
  return ['si', 'sí', 'yes', 'true', '1'].includes(String(v).toLowerCase().trim())
}

function toInt(v?: string | number): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10)
  return isNaN(n) ? null : n
}

function toDecimal(v?: string | number): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = parseFloat(String(v).replace(/[^\d.,]/g, '').replace(',', '.'))
  return isNaN(n) ? null : n
}

function generateSlug(brand: string, model: string, year: number): string {
  const base = `${brand} ${model} ${year}`
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base}-${Math.random().toString(36).slice(2, 7)}`
}

// ── Core import logic (shared between API key and session auth) ────────────────

async function runImport(
  rows: ImportRow[],
  dealerId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ inserted: number; errors: RowError[] }> {
  const errors: RowError[] = []
  let inserted = 0

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const rowNum = i + 1

    // Validate required fields
    if (!r.brand_name?.toString().trim()) {
      errors.push({ row: rowNum, message: 'Campo "marca" obligatorio' }); continue
    }
    if (!r.model_name?.toString().trim()) {
      errors.push({ row: rowNum, message: 'Campo "modelo" obligatorio' }); continue
    }
    const year = toInt(r.year)
    if (!year || year < 1900 || year > new Date().getFullYear() + 1) {
      errors.push({ row: rowNum, message: `Año inválido: ${r.year}` }); continue
    }
    const mileage = toInt(r.mileage_km)
    if (mileage === null || mileage < 0) {
      errors.push({ row: rowNum, message: `Kilometraje inválido: ${r.mileage_km}` }); continue
    }

    const slug = generateSlug(r.brand_name.trim(), r.model_name.trim(), year)

    const { error } = await supabase.from('vehicles').insert({
      dealer_id:       dealerId,
      slug,
      vehicle_type:    toVehicleType(r.vehicle_type?.toString()),
      brand_name:      r.brand_name.trim(),
      model_name:      r.model_name.trim(),
      version:         r.version?.toString().trim() || null,
      year,
      mileage_km:      mileage,
      price:           toDecimal(r.price),
      price_on_request: toBool(r.price_on_request),
      fuel_type:       toFuel(r.fuel_type?.toString()),
      transmission:    toTrans(r.transmission?.toString()),
      power_hp:        toInt(r.power_hp),
      color_exterior:  r.color_exterior?.toString().trim() || null,
      color_interior:  r.color_interior?.toString().trim() || null,
      body_type:       r.body_type?.toString().trim() || null,
      description:     r.description?.toString().trim() || null,
      vin:             r.vin?.toString().trim() || null,
      status:          'pending_review',
    })

    if (error) {
      errors.push({ row: rowNum, message: error.message })
    } else {
      inserted++
    }
  }

  return { inserted, errors }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || !Array.isArray(body.rows)) {
    return NextResponse.json({ error: 'Formato incorrecto. Se esperaba { rows: [...] }' }, { status: 400 })
  }

  const supabase = await createClient()
  let dealerId: string | null = null

  // Auth method 1 — API key (for n8n / external automation)
  const authHeader = req.headers.get('authorization') ?? ''
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const envKey = process.env.IMPORT_API_KEY
    if (!envKey || token !== envKey) {
      return NextResponse.json({ error: 'Clave de API no válida.' }, { status: 401 })
    }
    // Caller must provide dealer_slug to identify the target dealer
    const slug = body.dealer_slug as string | undefined
    if (!slug) {
      return NextResponse.json({ error: 'Se requiere dealer_slug al usar clave de API.' }, { status: 400 })
    }
    const { data: dealer } = await supabase.from('dealers').select('id').eq('slug', slug).single()
    if (!dealer) return NextResponse.json({ error: 'Showroom no encontrado.' }, { status: 404 })
    dealerId = dealer.id
  } else {
    // Auth method 2 — Supabase session (dashboard upload)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sesión no válida. Inicia sesión de nuevo.' }, { status: 401 })
    const { data: dealer } = await supabase.from('dealers').select('id').eq('profile_id', user.id).single()
    if (!dealer) return NextResponse.json({ error: 'No tienes un perfil de showroom activo.' }, { status: 403 })
    dealerId = dealer.id
  }

  if (!dealerId) return NextResponse.json({ error: 'No se pudo identificar el showroom.' }, { status: 403 })
  const result = await runImport(body.rows as ImportRow[], dealerId, supabase)
  return NextResponse.json(result, { status: 200 })
}
