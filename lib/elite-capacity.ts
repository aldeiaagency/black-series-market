import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'

export type EliteAvailabilityStatus = 'available' | 'low_availability' | 'waitlist' | 'closed'

export interface EliteCapacityResult {
  status: EliteAvailabilityStatus
  ctaLabel: string
  ctaHref: string
}

// §6: El CTA Elite es dinámico según el estado de capacidad.
// El número interno de plazas NUNCA se expone.
const CTA_MAP: Record<EliteAvailabilityStatus, { label: string; href: string }> = {
  available:        { label: 'Solicitar Elite',          href: '/profesionales/solicitar-acceso?plan=elite' },
  low_availability: { label: 'Consultar disponibilidad', href: '/profesionales/solicitar-acceso?plan=elite&consulta=1' },
  waitlist:         { label: 'Unirse a la lista de espera', href: '/profesionales/solicitar-acceso?plan=elite&waitlist=1' },
  closed:           { label: 'Sin disponibilidad en esta zona', href: '/profesionales/solicitar-acceso?plan=elite&sin_plaza=1' },
}

/**
 * Checks Elite availability for a province + category.
 * Falls back to country-wide rule when no province rule exists.
 * Never exposes internal capacity numbers.
 *
 * IMPORTANTE: solo se lee/aplica el tope PLANO (max_elite_showrooms).
 * max_elite_share (el porcentaje) NUNCA gobierna en vivo — con el número de
 * showrooms activos cerca de cero o inestable, un tope por porcentaje o
 * bloquea toda alta nueva (20% de 0 es 0) o exigiría "quitarle" el plan a
 * alguien que ya paga en cuanto baja el denominador. El share queda solo
 * como dato de referencia para que H revise manualmente, de tanto en tanto,
 * si el tope plano sigue teniendo sentido a medida que crece el negocio —
 * nunca se recalcula ni se aplica automáticamente. Y el tope, sea el que
 * sea, solo bloquea ALTAS NUEVAS: nunca revoca Elite a quien ya lo tiene.
 */
export async function checkEliteAvailability(
  provinceCode?: string | null,
  category = '*'
): Promise<EliteCapacityResult> {
  const admin = createAdminClient()

  // Try province-level rule first, then country fallback
  const queries = provinceCode
    ? [
        admin
          .from('elite_capacity_rules')
          .select('availability_status, max_elite_showrooms, current_elite_showrooms, manual_override')
          .eq('geographic_scope_type', 'province')
          .eq('geographic_scope_id', provinceCode)
          .in('category', [category, '*'])
          .order('category', { ascending: false }) // specific category wins over '*'
          .limit(1)
          .single(),
        admin
          .from('elite_capacity_rules')
          .select('availability_status, max_elite_showrooms, current_elite_showrooms, manual_override')
          .eq('geographic_scope_type', 'country')
          .eq('geographic_scope_id', 'ES')
          .limit(1)
          .single(),
      ]
    : [
        admin
          .from('elite_capacity_rules')
          .select('availability_status, max_elite_showrooms, current_elite_showrooms, manual_override')
          .eq('geographic_scope_type', 'country')
          .eq('geographic_scope_id', 'ES')
          .limit(1)
          .single(),
      ]

  const results = await Promise.all(queries)

  // Use first rule that has data (province > country)
  const rule = results.find((r) => r.data)?.data

  // Default: available when no rule configured
  const status: EliteAvailabilityStatus =
    (rule?.availability_status as EliteAvailabilityStatus) ?? 'available'

  return {
    status,
    ctaLabel: CTA_MAP[status].label,
    ctaHref: CTA_MAP[status].href,
  }
}

/**
 * Increments elite showroom counter after a successful Elite subscription.
 * Called from the Stripe webhook handler.
 *
 * Corregido (2026-09-07): antes solo buscaba una regla de PROVINCIA — como
 * nunca se ha sembrado ninguna (solo existe la fila nacional de fallback),
 * la función siempre hacía no-op y el contador nacional nunca subía. Ahora
 * sigue la misma cascada provincia→país que checkEliteAvailability.
 * Solo aplica el tope PLANO (max_elite_showrooms) — el share nunca gobierna
 * en vivo (ver comentario en checkEliteAvailability). Y esto solo bloquea
 * ALTAS NUEVAS (pasa a 'waitlist'): nunca revoca Elite a quien ya lo tiene.
 */
export async function incrementEliteCounter(provinceCode: string, category = '*') {
  const admin = createAdminClient()

  const queries = [
    admin
      .from('elite_capacity_rules')
      .select('id, current_elite_showrooms, max_elite_showrooms')
      .eq('geographic_scope_type', 'province')
      .eq('geographic_scope_id', provinceCode)
      .in('category', [category, '*'])
      .order('category', { ascending: false }) // categoría específica gana sobre '*'
      .limit(1)
      .maybeSingle(),
    admin
      .from('elite_capacity_rules')
      .select('id, current_elite_showrooms, max_elite_showrooms')
      .eq('geographic_scope_type', 'country')
      .eq('geographic_scope_id', 'ES')
      .limit(1)
      .maybeSingle(),
  ]

  const results = await Promise.all(queries)
  const rule = results.find((r) => r.data)?.data

  if (!rule) return

  const newCount = rule.current_elite_showrooms + 1
  const shouldLimitAvailability = rule.max_elite_showrooms != null && newCount >= rule.max_elite_showrooms

  await admin
    .from('elite_capacity_rules')
    .update({
      current_elite_showrooms: newCount,
      availability_status: shouldLimitAvailability ? 'waitlist' : 'available',
      updated_at: new Date().toISOString(),
    })
    .eq('id', rule.id)
}
