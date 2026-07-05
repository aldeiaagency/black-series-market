// Saneo del payload de escritura de vehículos (POST /api/vehicles y PATCH /api/vehicles/[id]).
//
// Contexto de seguridad: ambas rutas escriben con el admin client (service_role) tras validar
// la propiedad del showroom. El trigger `guard_vehicles_moderation` (migración 060) NO protege
// esta vía, porque solo coacciona a los roles `authenticated`/`anon` y el service_role se lo salta.
// Sin este saneo, un dealer podría hacer un POST/PATCH manipulado (fuera del asistente) y:
//   · status='active'            → auto-publicarse saltándose la moderación editorial,
//   · is_featured/featured_until → boost destacado gratis y permanente,
//   · is_editors_pick/is_exclusive → sellos de confianza falsos mostrados al comprador,
//   · views                      → inflar el contador de vistas.
// Aquí replicamos —en la capa de aplicación— exactamente la protección del trigger para la vía
// service_role. El asistente de publicación legítimo solo envía 'draft' | 'pending_review' y nunca
// estos campos, así que el flujo real no cambia.

// Campos que solo puede fijar el sistema (moderación de admin / activateBoost / RPC de vistas).
const SYSTEM_VEHICLE_FIELDS = [
  'is_featured', 'featured_until',   // destacado: solo lo pone un boost pagado real
  'is_editors_pick', 'is_exclusive', // sellos editoriales de confianza
  'is_verified',                     // (no existe en vehicles; defensivo)
  'views',                           // contador: solo el RPC increment_vehicle_views
  'moderated_at', 'moderated_by', 'rejection_reason', 'moderation_notes',
  'created_at', 'updated_at',
  'id',
] as const

/**
 * Elimina los campos reservados al sistema y fuerza un `status` seguro.
 * El cliente solo puede dejar el vehículo en 'draft' o en cola de revisión ('pending_review');
 * la activación ('active') es potestad exclusiva de la moderación de admin.
 */
export function sanitizeVehiclePayload<T extends Record<string, unknown>>(payload: T): T {
  const clean: Record<string, unknown> = { ...payload }
  for (const f of SYSTEM_VEHICLE_FIELDS) delete clean[f]
  if (clean.status !== 'draft') clean.status = 'pending_review'
  return clean as T
}
