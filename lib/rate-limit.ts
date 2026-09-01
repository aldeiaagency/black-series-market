import 'server-only'
import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'

/** IP del cliente (cabecera de Vercel/proxy). */
export function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return fwd || req.headers.get('x-real-ip')?.trim() || null
}

export function hashIdentifier(value: string): string {
  const salt = process.env.CUSTOM_REQUESTS_RATE_LIMIT_SALT || 'black-series-market'
  return createHash('sha256').update(`${salt}:${value}`).digest('hex')
}

/**
 * Rate limit sencillo basado en recuento de filas recientes de una tabla por el valor de una
 * columna (p. ej. email) dentro de una ventana temporal. Sirve para endpoints públicos que
 * escriben en una tabla con `created_at`. Devuelve true si se ha superado el límite.
 *
 * Nota: es un límite por-valor (email). Para límite por-IP robusto a escala conviene un store
 * dedicado (Upstash/edge); esto cubre el abuso básico sin infraestructura extra.
 */
export async function isCountRateLimited(
  admin: { from: (t: string) => any },
  table: string,
  column: string,
  value: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  if (!value) return false
  const since = new Date(Date.now() - windowMs).toISOString()
  const { count, error } = await admin
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(column, value)
    .gte('created_at', since)
  if (error) return false // ante fallo del contador, no bloquear (fail-open del rate limit, no de la seguridad)
  return (count ?? 0) >= limit
}

/**
 * Circuit breaker global: bloquea si en `windowMs` se han creado ya `limit` filas en la tabla
 * (sin importar quién). Protege presupuestos externos (p. ej. Firecrawl en las altas) frente a
 * un flood con datos variados, cuando no hay columna de IP para limitar por origen.
 */
export async function isGlobalRateLimited(
  admin: { from: (t: string) => any },
  table: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const since = new Date(Date.now() - windowMs).toISOString()
  const { count, error } = await admin
    .from(table)
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
  if (error) return false
  return (count ?? 0) >= limit
}

/**
 * Límite por-IP vía `analytics_events` (mismo mecanismo ya probado en `/api/track`, SEC-10) —
 * sin infraestructura extra. Pensado para endpoints que no tienen su propia tabla con columna
 * de IP (p. ej. `/api/assistant/*`, que solo reenvía a un webhook externo de n8n/OpenAI y no
 * escribe nada propio salvo esto). Registra el intento SIEMPRE (incluso si se va a bloquear),
 * para que el propio flood quede contado y no pueda evadir el límite fallando rápido.
 */
export async function isIpEventRateLimited(
  admin: { from: (t: string) => any },
  eventType: string,
  ipHash: string | null,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  if (!ipHash) return false // sin IP no hay por dónde limitar; no bloquear tráfico legítimo sin cabecera
  const since = new Date(Date.now() - windowMs).toISOString()
  const { count, error } = await admin
    .from('analytics_events')
    .select('id', { count: 'exact', head: true })
    .eq('event_type', eventType)
    .eq('metadata->>ip_hash', ipHash)
    .gte('created_at', since)

  admin.from('analytics_events').insert({ event_type: eventType, metadata: { ip_hash: ipHash } }).then(() => {}, () => {})

  if (error) return false // fail-open del contador, no de la seguridad de negocio
  return (count ?? 0) >= limit
}
