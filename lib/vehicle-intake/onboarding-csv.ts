import 'server-only'
import type { createAdminClient } from '@/lib/supabase/server'
import { parseCSV, normaliseRow, validateRow, splitImageUrls } from './csv-parse'
import {
  toVehicleType, toFuel, toTrans, toBool, toInt, toDecimal, generateSlug, importImagesForVehicle,
} from './normalize'
import { intakeVehiclesBulk, type BulkIntakeRow } from './intake'
import { randomUUID } from 'crypto'

type Admin = ReturnType<typeof createAdminClient>

// Sustituye al antiguo botón manual "Procesar stock inicial con IA" (admin/dealers/[id]/page.tsx,
// retirado 2026-09-04) y al webhook de n8n bsa/stock-inicial-ia al que llamaba: en vez de que un
// humano dispare un pipeline aparte a mano, el CSV que el fundador ya subió en la sala de
// configuración se procesa solo, con el mismo intakeVehiclesBulk() que usan el CSV del dashboard
// y la sync de feed — misma revisión de calidad, misma deduplicación, misma trazabilidad en
// vehicle_import_batches (migración 110).

const PRIVATE_BUCKET = 'onboarding-private'

export interface OnboardingCsvFileRef {
  path: string
  name?: string
}

export interface OnboardingCsvSummary {
  filesProcessed: number
  totalRows: number
  inserted: number
  updated: number
  draftCount: number
  pendingCount: number
  errors: { row: number; message: string }[]
}

function decodeCsvBytes(bytes: Uint8Array): string {
  let text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  if (text.includes('�')) {
    text = new TextDecoder('windows-1252').decode(bytes)
  }
  return text
}

/**
 * Descarga cada CSV directamente del bucket privado con el cliente admin (service role) — nunca
 * a través de la URL firmada de 7 días que ve el navegador durante la sala de configuración, que
 * para entonces puede haber caducado o no ser la forma correcta de leer el archivo desde el
 * servidor. No lanza: un CSV vacío, corrupto o sin filas válidas se registra en `errors` y no
 * bloquea el resto del proceso de completar la sala (lo dispara el propio caller con try/catch).
 */
export async function processOnboardingCsv(
  admin: Admin,
  dealerId: string,
  files: OnboardingCsvFileRef[],
): Promise<OnboardingCsvSummary | null> {
  if (!files.length) return null

  const bulkRows: BulkIntakeRow[] = []
  const errors: { row: number; message: string }[] = []
  // intakeVehiclesBulk() numera sus fallos sobre bulkRows, no sobre las filas originales del CSV
  // (algunas se descartan antes por validateRow) — este array traduce de vuelta.
  const rowNumberByBulkIndex: number[] = []
  let rowOffset = 0

  for (const file of files) {
    const { data: blob, error: downloadError } = await admin.storage.from(PRIVATE_BUCKET).download(file.path)
    if (downloadError || !blob) {
      errors.push({ row: rowOffset + 1, message: `No se pudo leer ${file.name ?? file.path}: ${downloadError?.message ?? 'archivo no encontrado'}` })
      continue
    }

    const bytes = new Uint8Array(await blob.arrayBuffer())
    const { rows } = parseCSV(decodeCsvBytes(bytes))

    for (let i = 0; i < rows.length; i++) {
      const rowNum = rowOffset + i + 1
      const r = normaliseRow(rows[i])
      const rowError = validateRow(r)
      if (rowError) { errors.push({ row: rowNum, message: rowError }); continue }

      const brand = r.brand_name.trim()
      const model = r.model_name.trim()
      const year = toInt(r.year)!
      const mileage = toInt((r.mileage_km ?? '').replace(/\D/g, ''))!

      const storageNamespace = randomUUID()
      const imageUrls = splitImageUrls(r.image_urls)
      const images = imageUrls.length
        ? await importImagesForVehicle(admin, dealerId, storageNamespace, imageUrls)
        : []

      rowNumberByBulkIndex.push(rowNum)
      bulkRows.push({
        slug: generateSlug(brand, model, year),
        vehicle_type: toVehicleType(r.vehicle_type),
        brand_name: brand,
        model_name: model,
        version: r.version?.trim() || null,
        year,
        mileage_km: mileage,
        price: toDecimal(r.price),
        price_on_request: toBool(r.price_on_request),
        fuel_type: toFuel(r.fuel_type),
        transmission: toTrans(r.transmission),
        power_hp: toInt(r.power_hp),
        color_exterior: r.color_exterior?.trim() || null,
        color_interior: r.color_interior?.trim() || null,
        body_type: r.body_type?.trim() || null,
        description: r.description?.trim() || null,
        vin: r.vin?.trim() || null,
        external_ref: r.external_ref?.trim() || null,
        images,
      })
    }

    rowOffset += rows.length
  }

  const result = bulkRows.length
    ? await intakeVehiclesBulk(admin, dealerId, 'csv_onboarding', bulkRows)
    : { inserted: 0, updated: 0, draftCount: 0, pendingCount: 0, failed: [] }

  for (const f of result.failed) {
    const originalRow = rowNumberByBulkIndex[f.row - 1]
    errors.push({ row: originalRow ?? f.row, message: f.reason })
  }

  return {
    filesProcessed: files.length,
    totalRows: rowOffset,
    inserted: result.inserted,
    updated: result.updated,
    draftCount: result.draftCount,
    pendingCount: result.pendingCount,
    errors,
  }
}
