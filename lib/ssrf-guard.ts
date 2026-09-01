// Protección SSRF para cualquier fetch server-side hacia una URL controlada por un tercero
// (import de imágenes por feed, webhook de asistente configurable por dealer). Auditoría de
// seguridad 2026-09-02, P0.3.
//
// Sin esto, un dealer (o quien robe una API key de importación / manipule su config de
// asistente) puede hacer que el servidor solicite `http://127.0.0.1:...`,
// `http://169.254.169.254/...` (metadata de nube) o una URL pública que redirija a una IP
// privada — el servidor hace la petición desde dentro de la infraestructura de Vercel.
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const MAX_REDIRECTS = 3

function isPrivateOrReservedIp(ip: string): boolean {
  const version = isIP(ip)
  if (version === 4) {
    const [a, b] = ip.split('.').map(Number)
    if (a === 10) return true // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
    if (a === 192 && b === 168) return true // 192.168.0.0/16
    if (a === 127) return true // loopback
    if (a === 169 && b === 254) return true // link-local + metadata cloud (169.254.169.254)
    if (a === 0) return true // "this network"
    if (a >= 224) return true // multicast/reserved
    return false
  }
  if (version === 6) {
    const lower = ip.toLowerCase()
    if (lower === '::1') return true // loopback
    if (lower.startsWith('fe80:') || lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true // link-local fe80::/10
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true // fc00::/7 (ULA)
    if (lower.startsWith('::ffff:')) return isPrivateOrReservedIp(lower.replace('::ffff:', ''))
    return false
  }
  return true // no se pudo parsear como IP → tratar como no seguro
}

async function assertHostnameResolvesToPublicIp(hostname: string): Promise<void> {
  // Si el hostname ya es una IP literal, valida directamente sin resolver DNS.
  if (isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) throw new Error('ssrf_blocked_ip')
    return
  }
  const results = await lookup(hostname, { all: true, verbatim: true })
  if (results.length === 0) throw new Error('ssrf_dns_no_result')
  for (const { address } of results) {
    if (isPrivateOrReservedIp(address)) throw new Error('ssrf_blocked_ip')
  }
}

/** Valida protocolo (HTTPS obligatorio) y que el hostname no resuelva a una IP privada/reservada. */
export async function assertSafeRemoteUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('ssrf_invalid_url')
  }
  if (url.protocol !== 'https:') throw new Error('ssrf_https_required')
  await assertHostnameResolvesToPublicIp(url.hostname)
  return url
}

/**
 * fetch() endurecido contra SSRF: valida la URL (y cada redirect, manualmente, sin dejar que
 * fetch los siga solo) antes de conectar, y aplica un límite de tamaño en streaming en vez de
 * cargar el body completo antes de comprobarlo.
 */
export async function safeFetchWithSizeLimit(
  rawUrl: string,
  maxBytes: number,
  timeoutMs: number,
): Promise<Uint8Array | null> {
  let currentUrl = rawUrl
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    await assertSafeRemoteUrl(currentUrl)
    const res = await fetch(currentUrl, {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'manual',
    })
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) return null
      currentUrl = new URL(location, currentUrl).toString()
      continue
    }
    if (!res.ok || !res.body) return null

    const contentLength = res.headers.get('content-length')
    if (contentLength && Number(contentLength) > maxBytes) return null

    const reader = res.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        total += value.byteLength
        if (total > maxBytes) {
          await reader.cancel()
          return null
        }
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }
    const out = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
      out.set(chunk, offset)
      offset += chunk.byteLength
    }
    return out
  }
  return null // demasiados redirects
}
