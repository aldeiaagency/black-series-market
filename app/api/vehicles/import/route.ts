import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getOrganizationIdForUser, can } from '@/lib/entitlements'

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
  /** URLs públicas (feed del dealer) — se descargan y alojan en nuestro Storage, nunca se hotlinkean. */
  image_urls?: string[]
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

// ── Image handling (feed → nuestro Storage, nunca hotlink) ─────────────────────

const IMAGE_BUCKET = 'vehicle-images'
const MAX_IMAGES_PER_VEHICLE = 12
const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB, mismo límite que /api/upload

function detectImageExt(bytes: Uint8Array): 'jpg' | 'png' | 'webp' | null {
  // SEC-7: mismos magic bytes que /api/upload — nunca fiarse del Content-Type que declare la URL externa.
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png'
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'webp'
  return null
}

async function importImagesForVehicle(
  admin: ReturnType<typeof createAdminClient>,
  dealerId: string,
  vehicleId: string,
  urls: string[],
): Promise<{ url: string; order: number }[]> {
  const results: { url: string; order: number }[] = []
  const capped = urls.slice(0, MAX_IMAGES_PER_VEHICLE)

  for (let i = 0; i < capped.length; i++) {
    try {
      const res = await fetch(capped[i], { signal: AbortSignal.timeout(15000) })
      if (!res.ok) continue
      const buf = new Uint8Array(await res.arrayBuffer())
      if (buf.byteLength > MAX_IMAGE_BYTES || buf.byteLength === 0) continue
      const ext = detectImageExt(buf.slice(0, 12))
      if (!ext) continue // no es una imagen válida (JPG/PNG/WebP) pese a lo que diga la URL

      const path = `${dealerId}/${vehicleId}/${i}-${Date.now()}.${ext}`
      const contentType = ext === 'jpg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/webp'
      const { error: uploadError } = await admin.storage.from(IMAGE_BUCKET).upload(path, buf, {
        contentType,
        upsert: true,
      })
      if (uploadError) continue

      const { data: { publicUrl } } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(path)
      results.push({ url: publicUrl, order: i })
    } catch {
      // Imagen individual fallida (timeout, URL caída, etc.) — no bloquea el resto del vehículo.
      continue
    }
  }

  return results
}

// ── Core import logic (shared between API key and session auth) ────────────────

async function runImport(
  rows: ImportRow[],
  dealerId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
  autoApprove: boolean,
): Promise<{ inserted: number; errors: RowError[] }> {
  const errors: RowError[] = []
  let inserted = 0
  const admin = createAdminClient()

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

    // Cliente admin: dealerId ya se validó (ownership por sesión, o slug por API key de confianza)
    // antes de llegar aquí — el insert en sí no depende de RLS de usuario final.
    const { data: inserted_row, error } = await admin.from('vehicles').insert({
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
      // autoApprove SOLO es true cuando la petición vino autenticada con FEED_SYNC_API_KEY —
      // nunca por un valor que el llamante pueda fijar en el body (ver runImport/POST).
      status:          autoApprove ? 'active' : 'pending_review',
    }).select('id').single()

    if (error || !inserted_row) {
      errors.push({ row: rowNum, message: error?.message || 'Error al insertar' })
      continue
    }
    inserted++

    if (r.image_urls?.length) {
      const images = await importImagesForVehicle(admin, dealerId, inserted_row.id, r.image_urls)
      if (images.length) {
        await admin.from('vehicles').update({ images }).eq('id', inserted_row.id)
      }
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
  let autoApprove = false

  // Auth method 1 — API key (for n8n / external automation)
  const authHeader = req.headers.get('authorization') ?? ''
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const importKey = process.env.IMPORT_API_KEY
    const feedSyncKey = process.env.FEED_SYNC_API_KEY

    // Dos niveles de confianza con la MISMA forma de auth, para no reabrir SEC-3:
    // - IMPORT_API_KEY: uso general (white-glove manual) → siempre pending_review.
    // - FEED_SYNC_API_KEY: exclusivo del workflow de sincronización de feed → único caso con auto-aprobación.
    //   autoApprove nunca se lee del body — solo se activa si el token coincide con esta clave concreta.
    if (feedSyncKey && token === feedSyncKey) {
      autoApprove = true
    } else if (!importKey || token !== importKey) {
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
    // Auth method 2 — Supabase session (dashboard upload). Siempre pending_review: input directo del dealer.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sesión no válida. Inicia sesión de nuevo.' }, { status: 401 })
    const { data: dealer } = await supabase.from('dealers').select('id').eq('profile_id', user.id).single()
    if (!dealer) return NextResponse.json({ error: 'No tienes un perfil de showroom activo.' }, { status: 403 })

    // Plan gating: la importación por CSV es de Professional en adelante.
    const orgId = await getOrganizationIdForUser(user.id)
    const allowed = orgId ? await can(orgId, 'import_csv') : false
    if (!allowed) {
      return NextResponse.json(
        { error: 'La importación por CSV está disponible en los planes Professional y Elite. Mejora tu plan para usarla.' },
        { status: 403 },
      )
    }

    dealerId = dealer.id
  }

  if (!dealerId) return NextResponse.json({ error: 'No se pudo identificar el showroom.' }, { status: 403 })
  const result = await runImport(body.rows as ImportRow[], dealerId, supabase, autoApprove)
  return NextResponse.json(result, { status: 200 })
}
