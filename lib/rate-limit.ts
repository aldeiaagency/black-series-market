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
