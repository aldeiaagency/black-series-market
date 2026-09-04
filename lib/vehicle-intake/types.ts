// Tipos del pipeline único de intake de vehículos (lib/vehicle-intake/).
// Sustituye la lógica repetida en el wizard, /api/vehicles/import y wf-stock-ia.json.

export type IntakeSource = 'wizard' | 'csv_dashboard' | 'csv_onboarding' | 'feed_sync' | 'vehicle_by_vehicle'

export type IssueSeverity = 'low' | 'medium' | 'high'

export interface ReviewIssue {
  field: string
  severity: IssueSeverity
  code: string
  message: string
  /** true solo para datos objetivamente incompletos (año, fotos). Un issue de estilo nunca bloquea. */
  blocking: boolean
}

/**
 * Salida de reviewVehicleIntake(). `decision` NO es el status final del vehículo —
 * intakeVehicles() lo traduce a status según la política del canal (ver policy.ts).
 */
export interface ReviewResult {
  quality_score: number // 0-100
  decision: 'ok' | 'ok_with_suggestions' | 'needs_review'
  issues: ReviewIssue[]
  /** Solo presente si hay una sugerencia real que ofrecer. Nunca afirma datos no dados. */
  suggested_description: string | null
  confidence: number // 0-1
  model: string
}

export interface VehicleIntakeRow {
  vehicle_type?: 'car' | 'motorcycle'
  brand_name: string
  model_name: string
  version?: string | null
  year: number
  mileage_km: number
  price?: number | null
  price_on_request?: boolean
  fuel_type?: string | null
  transmission?: string | null
  color_exterior?: string | null
  color_interior?: string | null
  body_type?: string | null
  power_hp?: number | null
  description?: string | null
  vin?: string | null
  external_ref?: string | null
  images?: { url: string; order: number }[]
  [key: string]: unknown
}

export interface IntakeRowResult {
  row: number
  outcome: 'inserted' | 'updated' | 'failed'
  vehicleId?: string
  status?: string
  reason?: string
  review?: ReviewResult
}

export interface IntakeBatchResult {
  batchId: string | null
  total: number
  inserted: number
  updated: number
  draftCount: number
  pendingCount: number
  failed: { row: number; reason: string }[]
  rows: IntakeRowResult[]
}
