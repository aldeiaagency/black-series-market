import 'server-only'
import { buildIntakeReviewPrompt, buildIntakeUserPrompt } from './prompt'
import type { ReviewResult, VehicleIntakeRow } from './types'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_MODEL = 'gpt-4o-mini'
const TIMEOUT_MS = 20000

// Fallback neutro: si el LLM falla o tarda, el vehículo sigue su camino sin bloquear
// al dealer — la revisión de calidad nunca debe convertirse en un punto de fallo que
// impida publicar. Se marca confidence=0 para que quede claro que no hubo revisión real.
function fallbackResult(): ReviewResult {
  return {
    quality_score: 50,
    decision: 'ok_with_suggestions',
    issues: [],
    suggested_description: null,
    confidence: 0,
    model: 'none (fallback)',
  }
}

function photoCount(row: VehicleIntakeRow): number {
  return Array.isArray(row.images) ? row.images.length : 0
}

/**
 * Revisa un vehículo contra la guía de marca y las reglas duras de veracidad.
 * No persiste nada — solo analiza. intakeVehicles() decide qué hacer con el resultado.
 */
export async function reviewVehicleIntake(row: VehicleIntakeRow): Promise<ReviewResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return fallbackResult()

  const { system, developer } = buildIntakeReviewPrompt()
  const user = buildIntakeUserPrompt({
    vehicle_type: row.vehicle_type,
    brand_name: row.brand_name,
    model_name: row.model_name,
    version: row.version,
    year: row.year,
    mileage_km: row.mileage_km,
    price: row.price,
    price_on_request: row.price_on_request,
    fuel_type: row.fuel_type,
    transmission: row.transmission,
    description: row.description,
    photo_count: photoCount(row),
  })

  const model = process.env.OPENAI_MODEL_VEHICLE_INTAKE || DEFAULT_MODEL

  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'system', content: developer },
          { role: 'user', content: user },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return fallbackResult()

    const data = await res.json().catch(() => null) as { choices?: { message?: { content?: string } }[] } | null
    const raw = data?.choices?.[0]?.message?.content
    if (!raw) return fallbackResult()

    const parsed = JSON.parse(raw)
    const decision = ['ok', 'ok_with_suggestions', 'needs_review'].includes(parsed.decision) ? parsed.decision : 'ok_with_suggestions'
    const issues = Array.isArray(parsed.issues)
      ? parsed.issues
          .filter((i: unknown): i is Record<string, unknown> => Boolean(i) && typeof i === 'object')
          .map((i: Record<string, unknown>) => ({
            field: String(i.field ?? 'general'),
            severity: ['low', 'medium', 'high'].includes(i.severity as string) ? i.severity : 'low',
            code: String(i.code ?? 'unspecified'),
            message: String(i.message ?? ''),
            blocking: i.blocking === true,
          }))
      : []

    return {
      quality_score: typeof parsed.quality_score === 'number' ? Math.max(0, Math.min(100, parsed.quality_score)) : 50,
      decision,
      issues,
      suggested_description: typeof parsed.suggested_description === 'string' && parsed.suggested_description.trim()
        ? parsed.suggested_description.trim()
        : null,
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      model,
    }
  } catch {
    return fallbackResult()
  }
}
