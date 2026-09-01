import { createHash, randomBytes, timingSafeEqual } from 'crypto'

// Dealer import keys are long-lived and revocable, so store a per-key salt with the digest.
const HASH_PREFIX = 'sha256'
const SALT_BYTES = 16
const KEY_BYTES = 32

export function generateDealerImportApiKey(): string {
  return `blm_import_${randomBytes(KEY_BYTES).toString('base64url')}`
}

export function hashDealerApiKey(token: string): string {
  const salt = randomBytes(SALT_BYTES).toString('hex')
  const digest = createHash('sha256').update(`${salt}:${token}`).digest('hex')
  return `${HASH_PREFIX}:${salt}:${digest}`
}

export function verifyDealerApiKeyHash(token: string, storedHash: string): boolean {
  const [prefix, salt, digest] = storedHash.split(':')
  if (prefix !== HASH_PREFIX || !salt || !digest) return false

  const nextDigest = createHash('sha256').update(`${salt}:${token}`).digest('hex')
  const stored = Buffer.from(digest, 'hex')
  const next = Buffer.from(nextDigest, 'hex')
  return stored.length === next.length && timingSafeEqual(stored, next)
}