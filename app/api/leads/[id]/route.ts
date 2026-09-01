import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions } from '@/lib/permissions'
import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES = ['new', 'contacted', 'negotiating', 'appointment', 'reserved', 'closed', 'lost', 'discarded']
const VALID_FULFILLMENT_EVENTS = [
  'handoff_acknowledged',
  'handoff_accepted',
  'handoff_rejected',
  'handoff_first_contact',
]

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })

  const access = await getDealerAccess(user.id)
  if (!access) return NextResponse.json({ error: 'No tienes un perfil de showroom activo.' }, { status: 403 })
  if (!getPermissions(access.role).canManageOpportunities) {
    return NextResponse.json({ error: 'No tienes permisos para gestionar oportunidades.' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const status = typeof body.status === 'string' ? body.status : null
  const fulfillmentEvent = typeof body.fulfillment_event === 'string' ? body.fulfillment_event : null
  if ((status ? 1 : 0) + (fulfillmentEvent ? 1 : 0) !== 1) {
    return NextResponse.json({ error: 'invalid_operation' }, { status: 400 })
  }

  const admin = createAdminClient()
  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 })
    }
    const { error } = await admin.rpc('update_lead_status_with_measurement', {
      p_lead_id: id,
      p_dealer_id: access.dealerId,
      p_status: status,
      p_mark_first_contact: status === 'contacted',
      p_payload: { source: 'manual_status_change', actor_user_id: user.id },
    })
    if (error) {
      const conflict = error.code === '23514'
      return NextResponse.json(
        { error: conflict ? 'invalid_handoff_transition' : 'update_failed' },
        { status: conflict ? 409 : 500 },
      )
    }
  } else {
    if (!VALID_FULFILLMENT_EVENTS.includes(fulfillmentEvent!)) {
      return NextResponse.json({ error: 'invalid_fulfillment_event' }, { status: 400 })
    }
    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 500) : null
    const { error } = await admin.rpc('record_lead_handoff_event', {
      p_lead_id: id,
      p_dealer_id: access.dealerId,
      p_event_type: fulfillmentEvent,
      p_payload: { source: 'manual_dashboard', actor_user_id: user.id, reason },
    })
    if (error) {
      const conflict = error.code === '23514'
      return NextResponse.json(
        { error: conflict ? 'invalid_handoff_transition' : 'update_failed' },
        { status: conflict ? 409 : 500 },
      )
    }
  }

  const { data: handoff } = await admin.from('lead_handoffs')
    .select('delivery_confirmed_at, acknowledged_at, decision, first_contact_at')
    .eq('lead_id', id).eq('dealer_id', access.dealerId).maybeSingle()
  return NextResponse.json({
    ok: true,
    opportunity_status: status,
    handoff: handoff ? { ...handoff, recovery_required: handoff.decision === 'rejected' } : null,
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })

  const access = await getDealerAccess(user.id)
  if (!access) return NextResponse.json({ error: 'No tienes un perfil de showroom activo.' }, { status: 403 })
  if (!getPermissions(access.role).canManageOpportunities) {
    return NextResponse.json({ error: 'No tienes permisos para gestionar oportunidades.' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('leads').delete()
    .eq('id', id).eq('dealer_id', access.dealerId)
  if (error) return NextResponse.json({ error: 'Error al eliminar el lead.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
