import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notifyN8n } from '@/lib/integrations/n8n'

const CUSTOM_VEHICLE_EMAIL_LIMIT_24H = 3
const CUSTOM_VEHICLE_IP_LIMIT_1H = 8

const optionalText = (max: number) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) return undefined
    const text = String(value).trim()
    return text.length > 0 ? text : undefined
  }, z.string().max(max).optional())

const requestSchema = z.object({
  request_type: z.enum(['custom_vehicle', 'dealer_access']).optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: optionalText(30),
  vehicle_type: z.enum(['car', 'motorcycle', 'any']).optional(),
  brand: optionalText(80),
  model: optionalText(80),
  version: optionalText(120),
  budget: optionalText(80),
  location: optionalText(120),
  timeline: z.enum(['immediate', '1_3_months', '3_6_months', 'exploring']).optional(),
  financing: z.enum(['yes', 'no', 'maybe']).optional(),
  trade_in: z.enum(['yes', 'no']).optional(),
  notes: optionalText(1200),
  message: optionalText(1200),
  metadata: z.record(z.unknown()).optional(),
}).strict()

function hasUnsafeText(value: string | undefined) {
  if (!value) return false
  const withoutAllowedWhitespace = value.replace(/[\r\n\t]/g, '')
  return /<[^>]*>|https?:\/\/|www\.|[\u0000-\u001F]/i.test(withoutAllowedWhitespace)
}

function isValidPhone(value: string | undefined) {
  if (!value) return true
  return /^[+\d\s().-]{6,30}$/.test(value)
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwardedFor || req.headers.get('x-real-ip')?.trim() || null
}

function hashIdentifier(value: string) {
  const salt = process.env.CUSTOM_REQUESTS_RATE_LIMIT_SALT || 'black-series-market'
  return createHash('sha256').update(`${salt}:${value}`).digest('hex')
}

async function isCustomVehicleRateLimited(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  ipHash: string | null,
) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count: emailCount, error: emailError } = await admin
    .from('custom_requests')
    .select('id', { count: 'exact', head: true })
    .eq('request_type', 'custom_vehicle')
    .eq('email', email)
    .gte('created_at', oneDayAgo)

  if (!emailError && (emailCount ?? 0) >= CUSTOM_VEHICLE_EMAIL_LIMIT_24H) return true

  if (!ipHash) return false

  const { count: ipCount, error: ipError } = await admin
    .from('custom_requests')
    .select('id', { count: 'exact', head: true })
    .eq('request_type', 'custom_vehicle')
    .eq('metadata->>ip_hash', ipHash)
    .gte('created_at', oneHourAgo)

  return !ipError && (ipCount ?? 0) >= CUSTOM_VEHICLE_IP_LIMIT_1H
}

/**
 * POST /api/custom-requests
 * Persists a "vehículo a la carta" request server-side (table: custom_requests) and
 * emits a `custom_request.created` event for n8n. Replaces the previous
 * localStorage-only behaviour that silently lost every request.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  }

  const input = parsed.data
  const requestType = input.request_type ?? 'custom_vehicle'
  const name = input.name
  const email = input.email

  if (!isValidPhone(input.phone)) {
    return NextResponse.json({ ok: false, error: 'invalid_phone' }, { status: 400 })
  }

  const textValues = [
    input.name,
    input.phone,
    input.brand,
    input.model,
    input.version,
    input.budget,
    input.location,
    input.notes,
    input.message,
  ]
  if (textValues.some(hasUnsafeText)) {
    return NextResponse.json({ ok: false, error: 'invalid_content' }, { status: 400 })
  }

  if (requestType === 'custom_vehicle') {
    const hasSearchCriteria = Boolean(input.brand || input.model || input.version || input.notes)
    if (!input.vehicle_type || !input.timeline || !input.financing || !input.trade_in || !hasSearchCriteria) {
      return NextResponse.json({ ok: false, error: 'insufficient_vehicle_details' }, { status: 400 })
    }
  }

  // Optional session — link the request to the user when logged in.
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {}

  const admin = createAdminClient()
  const clientIp = getClientIp(req)
  const ipHash = clientIp ? hashIdentifier(clientIp) : null

  if (requestType === 'custom_vehicle' && await isCustomVehicleRateLimited(admin, email, ipHash)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  const vehicleType = input.vehicle_type ?? null

  const record = {
    request_type: requestType,
    name,
    email,
    phone:        input.phone ?? null,
    vehicle_type: vehicleType,
    brand:        input.brand ?? null,
    model:        input.model ?? null,
    version:      input.version ?? null,
    budget_text:  input.budget ?? null,
    location:     input.location ?? null,
    timeframe:    input.timeline ?? null,
    financing:    input.financing ?? null,
    trade_in:     input.trade_in ?? null,
    message:      requestType === 'dealer_access' ? input.message ?? null : input.notes ?? null,
    status:       'new',
    source:       'web',
    user_id:      userId,
    metadata:     {
      ...(input.metadata ?? {}),
      ip_hash: ipHash,
      submitted_at: new Date().toISOString(),
    },
  }

  const { data, error } = await admin
    .from('custom_requests')
    .insert(record)
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 500 })
  }

  // Non-blocking for the user: failure here never fails the request.
  await notifyN8n('custom_request.created', {
    entityType: 'custom_request',
    entityId: data.id,
    payload: {
      request_type: requestType,
      vehicle_type: vehicleType,
      brand: record.brand,
      model: record.model,
      budget: record.budget_text,
      location: record.location,
      timeframe: record.timeframe,
      contact: { name, email, phone: record.phone },
    },
  })

  return NextResponse.json({ ok: true, id: data.id })
}
