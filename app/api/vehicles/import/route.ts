import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getOrganizationIdForUser, can } from '@/lib/entitlements'
import { verifyDealerApiKeyHash } from '@/lib/dealer-api-keys'
import { intakeVehiclesBulk, type BulkIntakeRow } from '@/lib/vehicle-intake/intake'
import type { IntakeSource } from '@/lib/vehicle-intake/types'
import { splitImageUrls } from '@/lib/vehicle-intake/csv-parse'
import {
  toVehicleType, toFuel, toTrans, toBool, toInt, toDecimal, generateSlug, importImagesForVehicle,
} from '@/lib/vehicle-intake/normalize'
import { randomUUID } from 'crypto'

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
  /** Id de anuncio propio del feed/DMS del dealer, cuando lo ofrece — clave de deduplicación
   * preferente tras el VIN (lib/vehicle-intake/dedupe.ts) para que la sync diaria actualice en
   * vez de duplicar. */
  external_ref?: string
  /** URLs públicas (feed del dealer, o celda de CSV separada por "|") — se descargan y alojan en
   * nuestro Storage, nunca se hotlinkean. Un CSV parseado en el cliente entrega texto plano, no
   * array; splitImageUrls() (lib/vehicle-intake/csv-parse.ts) normaliza ambas formas. */
  image_urls?: string[] | string
}

interface RowError { row: number; message: string }

// ── Core import logic (shared between API key and session auth) ────────────────
//
// Corrección 2026-09-04 (pipeline de intake, migración 110): antes, este import insertaba a
// ciegas fila a fila (sin dedupe: repetir un CSV o correr la sync diaria dos veces duplicaba el
// catálogo entero) y mejoraba descripciones vía un webhook de n8n sin reglas de marca ni de
// veracidad. Ambas cosas se sustituyen por intakeVehiclesBulk() (lib/vehicle-intake/intake.ts):
// revisa cada fila contra la guía de marca (con reglas duras anti-invención), deduplica por
// VIN → external_ref → aproximación, e inserta o actualiza en un único paso, dejando trazabilidad
// en vehicle_import_batches. Esta función solo se ocupa ahora de lo específico del formato CSV/
// feed: validar campos obligatorios, normalizar valores y descargar/alojar imágenes.

async function runImport(
  rows: ImportRow[],
  dealerId: string,
  source: Extract<IntakeSource, 'csv_dashboard' | 'feed_sync'>,
): Promise<{ inserted: number; updated: number; errors: RowError[]; draftNoPhotos: number; pendingReview: number }> {
  const admin = createAdminClient()
  const errors: RowError[] = []
  const bulkRows: BulkIntakeRow[] = []
  const rowNumberByBulkIndex: number[] = []

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const rowNum = i + 1

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

    const brand = r.brand_name.trim()
    const model = r.model_name.trim()

    // Namespace de Storage para las fotos de esta fila. No tiene por qué coincidir con el id
    // final en `vehicles` (intakeVehiclesBulk puede resolver esta fila como UPDATE de un
    // vehículo ya existente vía dedupe) — solo necesita ser único y estable para esta fila.
    const storageNamespace = randomUUID()
    const imageUrls = splitImageUrls(r.image_urls)
    const images = imageUrls.length
      ? await importImagesForVehicle(admin, dealerId, storageNamespace, imageUrls)
      : []

    rowNumberByBulkIndex.push(rowNum)
    bulkRows.push({
      slug: generateSlug(brand, model, year),
      vehicle_type: toVehicleType(r.vehicle_type?.toString()),
      brand_name: brand,
      model_name: model,
      version: r.version?.toString().trim() || null,
      year,
      mileage_km: mileage,
      price: toDecimal(r.price),
      price_on_request: toBool(r.price_on_request),
      fuel_type: toFuel(r.fuel_type?.toString()),
      transmission: toTrans(r.transmission?.toString()),
      power_hp: toInt(r.power_hp),
      color_exterior: r.color_exterior?.toString().trim() || null,
      color_interior: r.color_interior?.toString().trim() || null,
      body_type: r.body_type?.toString().trim() || null,
      description: r.description?.toString().trim() || null,
      vin: r.vin?.toString().trim() || null,
      external_ref: r.external_ref?.toString().trim() || null,
      images,
    })
  }

  const result = await intakeVehiclesBulk(admin, dealerId, source, bulkRows)

  // Los índices de fila de intakeVehiclesBulk corren sobre bulkRows, no sobre `rows` original
  // (algunas filas se descartaron antes por formato) — se traducen de vuelta para que el error
  // siga señalando la fila real del CSV/feed subido.
  for (const f of result.failed) {
    const originalRow = rowNumberByBulkIndex[f.row - 1]
    errors.push({ row: originalRow ?? f.row, message: f.reason })
  }

  return {
    inserted: result.inserted,
    updated: result.updated,
    errors,
    draftNoPhotos: result.draftCount,
    pendingReview: result.pendingCount,
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────


type DealerApiKeyRow = { id: string; dealer_id: string; key_hash: string }

async function getDealerIdForScopedImportKey(
  admin: ReturnType<typeof createAdminClient>,
  token: string,
): Promise<string | null> {
  const { data: keys, error } = await admin
    .from('dealer_api_keys')
    .select('id, dealer_id, key_hash')
    .is('revoked_at', null)

  if (error || !keys?.length) return null

  const match = (keys as DealerApiKeyRow[]).find((key) => verifyDealerApiKeyHash(token, key.key_hash))
  if (!match) return null

  await admin
    .from('dealer_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', match.id)

  return match.dealer_id
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || !Array.isArray(body.rows)) {
    return NextResponse.json({ error: 'Formato incorrecto. Se esperaba { rows: [...] }' }, { status: 400 })
  }

  const supabase = await createClient()
  let dealerId: string | null = null
  // Único dato que decide `source` es CON QUÉ CLAVE autenticó la petición, nunca algo leído del
  // body — es lo que queda escrito en vehicle_import_batches.source e intake_source por fila.
  let source: Extract<IntakeSource, 'csv_dashboard' | 'feed_sync'> = 'csv_dashboard'

  // Auth method 1 - API key (for n8n / external automation)
  const authHeader = req.headers.get('authorization') ?? ''
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const importKey = process.env.IMPORT_API_KEY
    const feedSyncKey = process.env.FEED_SYNC_API_KEY

    // Dos niveles de confianza con la MISMA forma de auth, para no reabrir SEC-3:
    // - IMPORT_API_KEY / dealer_api_keys: uso general (white-glove manual o integración propia
    //   del dealer) -> mismo trato que un CSV subido a mano (source='csv_dashboard').
    // - FEED_SYNC_API_KEY: exclusivo del workflow de sincronización de feed diario.
    if (feedSyncKey && token === feedSyncKey) {
      source = 'feed_sync'

      // Caller must provide dealer_slug to identify the target dealer
      const slug = body.dealer_slug as string | undefined
      if (!slug) {
        return NextResponse.json({ error: 'Se requiere dealer_slug al usar clave de API.' }, { status: 400 })
      }
      const { data: dealer } = await supabase.from('dealers').select('id').eq('slug', slug).single()
      if (!dealer) return NextResponse.json({ error: 'Showroom no encontrado.' }, { status: 404 })
      dealerId = dealer.id
    } else {
      const admin = createAdminClient()
      const scopedDealerId = await getDealerIdForScopedImportKey(admin, token)

      if (scopedDealerId) {
        dealerId = scopedDealerId

        const slug = body.dealer_slug as string | undefined
        if (slug) {
          const { data: dealer } = await admin.from('dealers').select('id').eq('slug', slug).maybeSingle()
          if (!dealer) return NextResponse.json({ error: 'Showroom no encontrado.' }, { status: 404 })
          if (dealer.id !== dealerId) {
            return NextResponse.json({ error: 'La clave no pertenece al showroom indicado.' }, { status: 403 })
          }
        }
      } else {
        // Legacy, usar dealer_api_keys para nuevas integraciones. Mantener IMPORT_API_KEY
        // durante la transicion para no romper automatizaciones existentes.
        if (!importKey || token !== importKey) {
          return NextResponse.json({ error: 'Clave de API no valida.' }, { status: 401 })
        }

        // Caller must provide dealer_slug to identify the target dealer
        const slug = body.dealer_slug as string | undefined
        if (!slug) {
          return NextResponse.json({ error: 'Se requiere dealer_slug al usar clave de API.' }, { status: 400 })
        }
        const { data: dealer } = await supabase.from('dealers').select('id').eq('slug', slug).single()
        if (!dealer) return NextResponse.json({ error: 'Showroom no encontrado.' }, { status: 404 })
        dealerId = dealer.id
      }
    }
  } else {
    // Auth method 2 — Supabase session (dashboard upload). source se queda en su default 'csv_dashboard'.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sesión no válida. Inicia sesión de nuevo.' }, { status: 401 })
    // Corrección 2026-09-04: la migración 107 (P0.2) revocó la lectura directa de
    // dealers.profile_id para 'authenticated' — este .eq('profile_id', ...) llevaba desde el
    // 2026-09-02 sin devolver nunca fila, bloqueando la importación CSV del dashboard.
    const { data: dealerRows } = await supabase.rpc('get_own_dealer_summary')
    const dealer = dealerRows?.[0] ?? null
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
  const result = await runImport(body.rows as ImportRow[], dealerId, source)
  return NextResponse.json(result, { status: 200 })
}
