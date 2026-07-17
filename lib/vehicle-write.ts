// Saneo del payload de escritura de vehículos (POST /api/vehicles y PATCH /api/vehicles/[id]).
//
// Contexto de seguridad: ambas rutas escriben con el admin client (service_role) tras validar
// la propiedad del showroom. El trigger `guard_vehicles_moderation` (migración 060, actualizado
// en 072) NO protege esta vía, porque solo coacciona a los roles `authenticated`/`anon` y el
// service_role se lo salta. Sin este saneo, un dealer podría hacer un POST/PATCH manipulado
// (fuera del asistente) y:
//   · is_featured/featured_until → boost destacado gratis y permanente,
//   · is_editors_pick/is_exclusive → sellos de confianza falsos mostrados al comprador,
//   · views                      → inflar el contador de vistas.
// Aquí replicamos —en la capa de aplicación— exactamente la protección del trigger para la vía
// service_role.
//
// Decisión 2026-07-17: se retira la moderación manual previa a publicación (el catálogo cerrado
// de marcas/modelos y, en el futuro, un agente de auditoría post-publicación asumen ese control).
// El cliente puede dejar el vehículo en 'draft' o publicarlo directamente ('active'); lo único que
// sigue sin poder tocar son los campos de sistema de arriba (destacado, sellos, vistas).

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
 * Elimina los campos reservados al sistema y fija un `status` válido.
 * El cliente puede dejar el vehículo en 'draft' o publicarlo ('active') directamente — ya no hay
 * cola de moderación previa. Cualquier otro valor recibido (o ausente) se trata como publicación.
 */
export function sanitizeVehiclePayload<T extends Record<string, unknown>>(payload: T): T {
  const clean: Record<string, unknown> = { ...payload }
  for (const f of SYSTEM_VEHICLE_FIELDS) delete clean[f]
  if (clean.status !== 'draft') clean.status = 'active'
  return clean as T
}
