// Saneo del payload de escritura de vehículos (POST /api/vehicles y PATCH /api/vehicles/[id]).
//
// Contexto de seguridad: ambas rutas escriben con el admin client (service_role) tras validar
// la propiedad del showroom. El trigger `guard_vehicles_moderation` (migración 060, actualizado
// en 072) NO protege esta vía, porque solo coacciona a los roles `authenticated`/`anon` y el
// service_role se lo salta. Sin este saneo, un dealer podría hacer un POST/PATCH manipulado
// (fuera del formulario real) y escribir cualquier columna del payload — no solo los campos de
// sistema evidentes (destacado, sellos, vistas), sino cualquier columna futura no prevista.
//
// Corrección 2026-09-02 (auditoría de seguridad, P0.4): el saneo anterior era una BLACKLIST
// (copiaba todo el payload y borraba una lista corta de campos) — cualquier columna no listada,
// presente o futura, pasaba sin filtrar. `PATCH` sin `status` en el payload también forzaba
// `active` por accidente (el default no-draft), publicando un borrador sin querer. Se sustituye
// por una ALLOWLIST: solo los campos que el formulario real (`app/(dashboard)/dashboard/
// publicar/page.tsx`) envía de verdad. Cualquier campo fuera de esta lista —incluidos
// `dealer_id`, `id`, `views`, `is_featured`, notas internas o columnas añadidas en el futuro sin
// tocar este archivo— se descarta por defecto.
//
// Decisión 2026-07-17: se retira la moderación manual previa a publicación (el catálogo cerrado
// de marcas/modelos y, en el futuro, un agente de auditoría post-publicación asumen ese control).
// El cliente puede dejar el vehículo en 'draft' o publicarlo directamente ('active').
//
// Corrección 2026-09-04 (pipeline de intake, migración 110): este saneo forzaba CUALQUIER status
// no-draft a 'active', incluido 'pending_review' — el valor que el propio servidor calcula
// (lib/vehicle-intake/intake.ts, resolveStatus()) cuando la revisión de IA encuentra un bloqueo
// real. Sin este fix, ese bloqueo quedaba pisado aquí mismo y el vehículo se publicaba igual.
// pending_review nunca lo puede fijar el dealer por su cuenta con intención maliciosa: es un
// estado MÁS restrictivo que 'active', no un salto de privilegio, así que dejarlo pasar es seguro.

import { publicBrandName } from '@/lib/brand-types'

// Únicos campos que el dealer puede fijar. Todo lo que no esté aquí se descarta, aunque venga en
// el payload. Sincronizar con el `form` de `dashboard/publicar/page.tsx` si se añade un campo ahí.
const ALLOWED_VEHICLE_FIELDS = [
  'vehicle_type', 'brand_name', 'model_name', 'version', 'year', 'mileage_km',
  'fuel_type', 'transmission', 'drive_type', 'body_type',
  'color_exterior', 'color_interior', 'upholstery',
  'power_hp', 'power_kw', 'torque_nm', 'displacement_cc', 'cylinders', 'engine_config',
  'license_type', 'zero_to_hundred', 'top_speed_kmh', 'weight_kg', 'doors', 'seats',
  'registration_year', 'registration_country', 'itv_valid_until', 'num_owners',
  'has_service_history', 'has_carfax', 'condition_type', 'category', 'dgt_label',
  'iva_deducible', 'description', 'equipment', 'equipment_extra', 'images',
  'price', 'price_on_request', 'is_negotiable', 'accepts_trade_in', 'financing_available',
  'has_test_drive', 'national_delivery', 'has_warranty', 'warranty_months', 'video_url',
  'has_abs', 'has_traction_control', 'has_riding_modes', 'has_electronic_suspension', 'has_panniers',
  'slug', 'location_province', 'status', 'published_at',
] as const

/**
 * Filtra el payload a la allowlist de campos editables por el dealer y fija un `status` válido.
 * El cliente puede dejar el vehículo en 'draft' o publicarlo ('active') directamente — ya no hay
 * cola de moderación previa. Cualquier otro valor recibido (o ausente) se trata como publicación,
 * salvo que sea explícitamente 'draft'.
 */
export function sanitizeVehiclePayload<T extends Record<string, unknown>>(payload: T): T {
  const clean: Record<string, unknown> = {}
  for (const f of ALLOWED_VEHICLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, f)) clean[f] = payload[f]
  }
  if (clean.status !== 'draft' && clean.status !== 'pending_review') clean.status = 'active'
  // 'BMW Motorrad' es la marca correcta al elegirla en el desplegable (catálogo de motos), pero
  // la ficha publicada debe mostrar 'BMW' — ver lib/brand-types.ts.
  if (typeof clean.brand_name === 'string') clean.brand_name = publicBrandName(clean.brand_name)
  return clean as T
}
