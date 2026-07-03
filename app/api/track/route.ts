import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_EVENTS = new Set([
  'vehicle_view',
  'vehicle_contact_submit',
  'vehicle_whatsapp_click',
  'vehicle_phone_click',
  'vehicle_saved',
  'vehicle_unsaved',
  'vehicle_request_submit',
  'search_alert_created',
  'filter_used',
  'professional_profile_view',
])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, vehicle_id, dealer_id } = body

    if (!event_type || !ALLOWED_EVENTS.has(event_type)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const supabase = await createClient()
    await supabase.from('analytics_events').insert({
      event_type,
      vehicle_id:  vehicle_id  || null,
      dealer_id:   dealer_id   || null,
    })

    // Vista de vehículo: incrementar el contador de forma ATÓMICA (RPC SECURITY DEFINER).
    // Sustituye al read-modify-write que se hacía en el render de la ficha.
    if (event_type === 'vehicle_view' && vehicle_id) {
      await supabase.rpc('increment_vehicle_views', { p_id: vehicle_id })
    }

    return NextResponse.json({ ok: true })
  } catch {
    // Silently fail — analytics must never break the UX
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
