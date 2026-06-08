import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notifyN8n } from '@/lib/integrations/n8n'

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

  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_contact' }, { status: 400 })
  }

  // Optional session — link the request to the user when logged in.
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {}

  const vehicleType = ['car', 'motorcycle', 'any'].includes(body.vehicle_type) ? body.vehicle_type : null

  const record = {
    request_type: 'custom_vehicle',
    name,
    email,
    phone:        body.phone ? String(body.phone).trim() : null,
    vehicle_type: vehicleType,
    brand:        body.brand ? String(body.brand).trim() : null,
    model:        body.model ? String(body.model).trim() : null,
    version:      body.version ? String(body.version).trim() : null,
    budget_text:  body.budget ? String(body.budget).trim() : null,
    location:     body.location ? String(body.location).trim() : null,
    timeframe:    body.timeline ? String(body.timeline).trim() : null,
    financing:    body.financing ? String(body.financing).trim() : null,
    trade_in:     body.trade_in ? String(body.trade_in).trim() : null,
    message:      body.notes ? String(body.notes).trim() : null,
    status:       'new',
    source:       'web',
    user_id:      userId,
  }

  const admin = createAdminClient()
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
