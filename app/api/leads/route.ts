import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notifyN8n } from '@/lib/integrations/n8n'

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

  if (!dealerId || buyerName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
    return NextResponse.json({ ok: false, error: 'invalid_lead' }, { status: 400 })
  }

  // Optional session — attach buyer profile when logged in.
  let buyerProfileId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    buyerProfileId = user?.id ?? null
  } catch {}

  const admin = createAdminClient()
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
    },
  })

  return NextResponse.json({ ok: true, id: data.id })
}
