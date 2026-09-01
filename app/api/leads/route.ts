import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notifyN8n } from '@/lib/integrations/n8n'
import { isCountRateLimited } from '@/lib/rate-limit'

const ACQUISITION_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'referrer', 'landing_path', 'entry_point', 'cep',
] as const

function sanitizeAcquisition(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const source = value as Record<string, unknown>
  const result: Record<string, string> = {}
  for (const key of ACQUISITION_KEYS) {
    if (typeof source[key] !== 'string') continue
    const max = key === 'referrer' || key === 'landing_path' ? 1000 : 200
    const cleaned = source[key].trim().slice(0, max)
    if (cleaned) result[key] = cleaned
  }
  return result
}

function sanitizeQualification(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const source = value as Record<string, unknown>
  const allowed: Record<string, readonly string[]> = {
    purchase_timeline: ['immediate', '1_3_months', '3_6_months', 'exploring'],
    financing: ['yes', 'no', 'maybe'],
    trade_in: ['yes', 'no'],
    contact_preference: ['call', 'whatsapp', 'email'],
  }
  return Object.fromEntries(Object.entries(allowed).flatMap(([key, values]) =>
    typeof source[key] === 'string' && values.includes(source[key] as string)
      ? [[key, source[key] as string]]
      : []
  ))
}

/**
 * POST /api/leads
 * Single server-side insert of a buyer contact (table: leads) + `lead.created` event
 * for n8n. Centralising the insert here (instead of a client-side insert) lets us
 * attach the buyer's profile when logged in and emit the automation event reliably,
 * without ever duplicating the lead.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const vehicleId = body.vehicle_id ? String(body.vehicle_id) : null
  const dealerId = body.dealer_id ? String(body.dealer_id) : null
  const buyerName = String(body.buyer_name || '').trim()
  const buyerEmail = String(body.buyer_email || '').trim()
  const message = String(body.message || '').trim() || 'Solicitud de información'

  const acquisitionContext = sanitizeAcquisition(body.acquisition_context)
  const qualification = sanitizeQualification(body.qualification)
  const sessionId = typeof body.session_id === 'string'
    ? body.session_id.trim().slice(0, 100) || null
    : null

  if (!dealerId || buyerName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
    return NextResponse.json({ ok: false, error: 'invalid_lead' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Rate limit por email (evita spam de leads + email-bombing vía n8n).
  if (await isCountRateLimited(admin, 'leads', 'buyer_email', buyerEmail, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  // Validar pertenencia: el dealer debe existir y, si hay vehículo, ser suyo.
  // Evita atribuir leads a un dealer_id arbitrario y disparar emails a terceros.
  const { data: dealer } = await admin.from('dealers').select('id').eq('id', dealerId).maybeSingle()
  if (!dealer) {
    return NextResponse.json({ ok: false, error: 'invalid_lead' }, { status: 400 })
  }
  if (vehicleId) {
    const { data: veh } = await admin
      .from('vehicles').select('id').eq('id', vehicleId).eq('dealer_id', dealerId).maybeSingle()
    if (!veh) {
      return NextResponse.json({ ok: false, error: 'vehicle_dealer_mismatch' }, { status: 400 })
    }
  }

  // Optional session — attach buyer profile when logged in.
  let buyerProfileId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    buyerProfileId = user?.id ?? null
  } catch {}

  const { data, error } = await admin
    .from('leads')
    .insert({
      vehicle_id:       vehicleId,
      dealer_id:        dealerId,
      buyer_profile_id: buyerProfileId,
      buyer_name:       buyerName,
      buyer_email:      buyerEmail,
      buyer_phone:      body.buyer_phone ? String(body.buyer_phone).trim() : null,
      message,
      source_channel:   'ficha_form',
      qualification,
      acquisition_context: acquisitionContext,
      session_id:       sessionId,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 500 })
  }

  await notifyN8n('lead.created', {
    entityType: 'lead',
    entityId: data.id,
    dealerId,
    vehicleId,
    payload: {
      contact: { name: buyerName, email: buyerEmail, phone: body.buyer_phone || null },
      vehicle_id: vehicleId,
      acquisition_context: acquisitionContext,
    },
  })

  return NextResponse.json({ ok: true, id: data.id, status: 'lead_persisted' })
}
