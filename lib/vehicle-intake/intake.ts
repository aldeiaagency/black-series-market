import 'server-only'
import type { createAdminClient } from '@/lib/supabase/server'
import { reviewVehicleIntake } from './review'
import { findExistingVehicle, normalizeVin } from './dedupe'
import { publicBrandName } from '@/lib/brand-types'
import type { IntakeBatchResult, IntakeRowResult, IntakeSource, ReviewResult, VehicleIntakeRow } from './types'

type Admin = ReturnType<typeof createAdminClient>

const MIN_DESCRIPTION_LENGTH = 40

/**
 * Columnas de auditoría de la 110, comunes a cualquier canal. `ai_applied_mode` lo decide
 * cada caller (resolveDescription en bulk; el wizard/vehicle_by_vehicle lo dejan en 'none' —
 * la sugerencia vuelve en la respuesta para que el dealer, presente en tiempo real, decida).
 */
export function buildAiColumns(review: ReviewResult, originalDescription: string | null) {
  return {
    original_description: originalDescription,
    ai_suggested_description: review.suggested_description,
    ai_review_json: review,
    ai_confidence: review.confidence,
    ai_review_model: review.model,
    ai_reviewed_at: new Date().toISOString(),
  }
}

/**
 * Status final tras la revisión. Sin foto manda siempre (regla previa a este pipeline: nunca
 * se publica un vehículo sin al menos una imagen real). Si hay foto, un issue blocking=true de
 * la IA (dato objetivo ausente o incumplimiento grave de marca) fuerza pending_review — el
 * resto de casos respeta el status que pedía el canal (decisión 2026-07-17 de retirar la
 * moderación previa por defecto sigue vigente; esto añade una excepción puntual, no la revierte).
 */
export function resolveStatus(requested: 'draft' | 'active', hasPhotos: boolean, review: ReviewResult): 'draft' | 'active' | 'pending_review' {
  if (requested === 'draft') return 'draft'
  if (!hasPhotos) return 'draft'
  if (review.decision === 'needs_review') return 'pending_review'
  return requested
}

/**
 * Aplica la sugerencia de la IA como descripción solo si el dealer no había escrito nada real
 * y el canal permite auto-aplicar (`allowAutoSafe`: CSV/feed, sin dealer presente confirmando
 * en el momento — mismo criterio que ya regía el relleno de descripciones vacías antes de este
 * pipeline). El wizard y el alta vehículo a vehículo nunca auto-aplican con allowAutoSafe=false:
 * la sugerencia solo queda guardada en ai_suggested_description para que el propio dealer, que
 * está delante, decida aceptarla o no.
 */
export function resolveDescription(
  original: string | null,
  review: ReviewResult,
  allowAutoSafe: boolean,
): { description: string | null; appliedMode: 'none' | 'auto_safe' } {
  const hasRealText = Boolean(original && original.trim().length >= MIN_DESCRIPTION_LENGTH)
  if (!hasRealText && allowAutoSafe && review.suggested_description) {
    return { description: review.suggested_description, appliedMode: 'auto_safe' }
  }
  return { description: original, appliedMode: 'none' }
}

export interface BulkIntakeRow extends VehicleIntakeRow {
  slug: string
  images: { url: string; order: number }[]
}

/**
 * Orquestador único de alta masiva (CSV dashboard, CSV onboarding, feed/DMS diario). El caller
 * ya dejó cada fila normalizada a tipos reales y las imágenes descargadas/alojadas en Storage —
 * esta función solo decide qué hacer con esa fila: revisar calidad, deduplicar contra el
 * catálogo del dealer (VIN → external_ref → aproximación) e insertar o actualizar.
 *
 * No lanza por fila individual: un fallo (constraint, red, review caído) se registra en
 * `failed` y se sigue con la siguiente — un CSV de 200 filas no debe perderse entero por una
 * fila mala. `vehicle_import_batches` (migración 110) guarda la corrida completa.
 */
export async function intakeVehiclesBulk(
  admin: Admin,
  dealerId: string,
  source: Extract<IntakeSource, 'csv_dashboard' | 'csv_onboarding' | 'feed_sync'>,
  rows: BulkIntakeRow[],
  opts: { requestedStatus?: 'draft' | 'active' } = {},
): Promise<IntakeBatchResult> {
  const requestedStatus = opts.requestedStatus ?? 'active'

  const { data: batch } = await admin
    .from('vehicle_import_batches')
    .insert({ dealer_id: dealerId, source, total_rows: rows.length })
    .select('id')
    .single()
  const batchId = batch?.id ?? null

  const results: IntakeRowResult[] = []
  const failedRows: { row: number; reason: string }[] = []
  let inserted = 0, updated = 0, draftCount = 0, pendingCount = 0

  for (let i = 0; i < rows.length; i++) {
    // 'BMW Motorrad' es válido como marca de origen (feed/CSV del dealer), pero la ficha
    // publicada debe mostrar 'BMW' — ver lib/brand-types.ts. Se normaliza antes de revisar y
    // deduplicar para que ambos vean el mismo nombre que acabará guardado.
    const row = { ...rows[i], brand_name: publicBrandName(rows[i].brand_name) }
    const rowNum = i + 1
    try {
      const vin = normalizeVin(row.vin)
      const hasPhotos = row.images.length > 0

      const review = await reviewVehicleIntake(row)
      const { description, appliedMode } = resolveDescription(row.description ?? null, review, true)
      const existing = await findExistingVehicle(admin, dealerId, { ...row, vin })

      // Una unidad ya vendida no la reabre una sync automática, aunque el feed la siga trayendo.
      const status = existing?.status === 'sold' ? 'sold' : resolveStatus(requestedStatus, hasPhotos, review)

      const record = {
        dealer_id: dealerId,
        vehicle_type: row.vehicle_type,
        brand_name: row.brand_name,
        model_name: row.model_name,
        version: row.version ?? null,
        year: row.year,
        mileage_km: row.mileage_km,
        price: row.price ?? null,
        price_on_request: row.price_on_request ?? false,
        fuel_type: row.fuel_type ?? null,
        transmission: row.transmission ?? null,
        color_exterior: row.color_exterior ?? null,
        color_interior: row.color_interior ?? null,
        body_type: row.body_type ?? null,
        power_hp: row.power_hp ?? null,
        description,
        images: row.images,
        vin: row.vin ?? null,
        vin_normalized: vin,
        external_ref: row.external_ref ?? null,
        status,
        intake_source: source,
        ai_applied_mode: appliedMode,
        ...buildAiColumns(review, row.description ?? null),
      }

      if (existing) {
        const { error } = await admin.from('vehicles').update(record).eq('id', existing.id)
        if (error) throw new Error(error.message)
        updated++
        results.push({ row: rowNum, outcome: 'updated', vehicleId: existing.id, status, review })
      } else {
        const { data: insertedRow, error } = await admin
          .from('vehicles')
          .insert({ ...record, slug: row.slug })
          .select('id')
          .single()
        if (error || !insertedRow) throw new Error(error?.message || 'Error al insertar')
        inserted++
        results.push({ row: rowNum, outcome: 'inserted', vehicleId: insertedRow.id, status, review })
      }

      if (status === 'draft') draftCount++
      if (status === 'pending_review') pendingCount++
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'Error desconocido'
      failedRows.push({ row: rowNum, reason })
      results.push({ row: rowNum, outcome: 'failed', reason })
    }
  }

  if (batchId) {
    await admin
      .from('vehicle_import_batches')
      .update({
        inserted, updated, draft_count: draftCount, pending_count: pendingCount,
        failed_rows: failedRows, finished_at: new Date().toISOString(),
      })
      .eq('id', batchId)
  }

  return { batchId, total: rows.length, inserted, updated, draftCount, pendingCount, failed: failedRows, rows: results }
}
