import 'server-only'
import type { createAdminClient } from '@/lib/supabase/server'
import { safeFetchWithSizeLimit } from '@/lib/ssrf-guard'

// Normalizadores de valor compartidos por cualquier canal que reciba texto libre (CSV dashboard,
// CSV onboarding, feed/DMS): antes vivían solo en app/api/vehicles/import/route.ts — se mueven
// aquí (migración 110) para que el disparador automático de CSV en la sala de configuración
// (app/api/onboarding/[token]/complete/route.ts) use exactamente la misma normalización, sin
// duplicarla ni arriesgar que diverja.

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

export function toVehicleType(v?: string): 'car' | 'motorcycle' {
  if (!v) return 'car'
  const s = v.toLowerCase().trim()
  return ['moto', 'motorcycle', 'motocicleta', 'moto_clasica'].includes(s) ? 'motorcycle' : 'car'
}

export function toFuel(v?: string): string | null {
  if (!v) return null
  return FUEL_MAP[v.toLowerCase().trim()] ?? null
}

export function toTrans(v?: string): string | null {
  if (!v) return null
  return TRANS_MAP[v.toLowerCase().trim()] ?? null
}

export function toBool(v?: string | boolean): boolean {
  if (typeof v === 'boolean') return v
  if (!v) return false
  return ['si', 'sí', 'yes', 'true', '1'].includes(String(v).toLowerCase().trim())
}

export function toInt(v?: string | number): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10)
  return isNaN(n) ? null : n
}

export function toDecimal(v?: string | number): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = parseFloat(String(v).replace(/[^\d.,]/g, '').replace(',', '.'))
  return isNaN(n) ? null : n
}

export function generateSlug(brand: string, model: string, year: number): string {
  const base = `${brand} ${model} ${year}`
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base}-${Math.random().toString(36).slice(2, 7)}`
}

// ── Image handling (URL externa → nuestro Storage, nunca hotlink) ──────────────

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

/** Descarga cada URL externa (con guardas SSRF), la valida por magic bytes y la aloja en el
 * bucket público del catálogo. `pathNamespace` solo necesita ser único y estable para esta fila
 * — no tiene por qué coincidir con el id final del vehículo en `vehicles`. */
export async function importImagesForVehicle(
  admin: ReturnType<typeof createAdminClient>,
  dealerId: string,
  pathNamespace: string,
  urls: string[],
): Promise<{ url: string; order: number }[]> {
  const results: { url: string; order: number }[] = []
  const capped = urls.slice(0, MAX_IMAGES_PER_VEHICLE)

  for (let i = 0; i < capped.length; i++) {
    try {
      const buf = await safeFetchWithSizeLimit(capped[i], MAX_IMAGE_BYTES, 15000)
      if (!buf || buf.byteLength === 0) continue
      const ext = detectImageExt(buf.slice(0, 12))
      if (!ext) continue // no es una imagen válida (JPG/PNG/WebP) pese a lo que diga la URL

      const path = `${dealerId}/${pathNamespace}/${i}-${Date.now()}.${ext}`
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
