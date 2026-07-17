import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerBookingContext, getBusyRanges } from '@/lib/assistant-booking'
import { computeSlots } from '@/lib/booking'
import { notifyN8n } from '@/lib/integrations/n8n'
import { createEvent } from '@/lib/google-calendar'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function pad(n: number) { return String(n).padStart(2, '0') }
/** YYYYMMDDTHHMMSSZ (UTC) para enlaces de calendario. */
function gcalStamp(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
}
function calendarLinks(title: string, start: Date, end: Date, details: string, location: string) {
  const g = new URL('https://calendar.google.com/calendar/render')
  g.searchParams.set('action', 'TEMPLATE')
  g.searchParams.set('text', title)
  g.searchParams.set('dates', `${gcalStamp(start)}/${gcalStamp(end)}`)
  if (details) g.searchParams.set('details', details)
  if (location) g.searchParams.set('location', location)
  const o = new URL('https://outlook.live.com/calendar/0/deeplink/compose')
  o.searchParams.set('subject', title)
  o.searchParams.set('startdt', start.toISOString())
  o.searchParams.set('enddt', end.toISOString())
  if (details) o.searchParams.set('body', details)
  if (location) o.searchParams.set('location', location)
  o.searchParams.set('path', '/calendar/action/compose')
  o.searchParams.set('rru', 'addevent')
  return { google: g.toString(), outlook: o.toString() }
}

/**
 * POST /api/assistant/book — reserva una cita (Fase B).
 * Crea el lead + la appointment (confirmed), avanza el lead a `appointment` y
 * dispara `appointment.created` (emails + Slack). Valida el hueco contra la
 * disponibilidad real del showroom para evitar horas arbitrarias o solapes.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, any>
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 }) }

  const dealerId = body.dealer_id ? String(body.dealer_id) : ''
  const vehicleId = body.vehicle_id ? String(body.vehicle_id) : null
  const sessionId = body.session_id ? String(body.session_id) : null
  const startIso = body.start ? String(body.start) : ''
  const buyerName = String(body.buyer_name || '').trim()
  const buyerEmail = String(body.buyer_email || '').trim()
  const buyerPhone = body.buyer_phone ? String(body.buyer_phone).trim() : null

  if (!dealerId || buyerName.length < 2 || !EMAIL_RE.test(buyerEmail) || !startIso) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  }
  const startDate = new Date(startIso)
  if (isNaN(startDate.getTime())) return NextResponse.json({ ok: false, error: 'invalid_start' }, { status: 400 })

  // Gating + reglas del showroom.
  const ctx = await getDealerBookingContext(dealerId)
  if (!ctx.enabled || !ctx.rules || !ctx.settings || !ctx.dealer) {
    return NextResponse.json({ ok: false, error: 'booking_unavailable' }, { status: 403 })
  }

  // El hueco solicitado debe seguir disponible (evita horas inventadas y solapes).
  const busy = await getBusyRanges(dealerId, ctx)
  const slots = computeSlots(ctx.rules, busy)
  const chosen = slots.find(s => new Date(s.start).getTime() === startDate.getTime())
  if (!chosen) return NextResponse.json({ ok: false, error: 'slot_unavailable' }, { status: 409 })

  const endDate = new Date(startDate.getTime() + ctx.rules.slot_minutes * 60_000)

  // Perfil del comprador si está logueado.
  let buyerProfileId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    buyerProfileId = user?.id ?? null
  } catch {}

  const admin = createAdminClient()

  // Datos del vehículo y email del dealer (para los avisos).
  const [{ data: vehicle }, { data: dealerRow }] = await Promise.all([
    vehicleId
      ? admin.from('vehicles').select('brand_name, model_name, year, slug, vehicle_type').eq('id', vehicleId).single()
      : Promise.resolve({ data: null }),
    admin.from('dealers').select('email, slug').eq('id', dealerId).single(),
  ])
  const vehicleTitle = vehicle ? `${vehicle.brand_name ?? ''} ${vehicle.model_name ?? ''} ${vehicle.year ?? ''}`.trim() : 'el vehículo'

  // 1) Lead.
  const { data: lead, error: leadErr } = await admin
    .from('leads')
    .insert({
      vehicle_id: vehicleId,
      dealer_id: dealerId,
      buyer_profile_id: buyerProfileId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone,
      message: `Cita solicitada: ${chosen.label} · ${vehicleTitle}`,
      source_channel: 'ficha_assistant',
    })
    .select('id')
    .single()
  if (leadErr || !lead) return NextResponse.json({ ok: false, error: 'lead_failed' }, { status: 500 })

  // 2) Appointment.
  const { data: appt, error: apptErr } = await admin
    .from('appointments')
    .insert({
      lead_id: lead.id,
      vehicle_id: vehicleId,
      dealer_id: dealerId,
      starts_at: startDate.toISOString(),
      status: 'confirmed',
      provider: ctx.provider ?? 'manual',
      location_text: ctx.settings.mode !== 'video' ? ctx.settings.location_text : null,
      workflow_ref: sessionId,
      metadata: { source: 'assistant_booking', mode: ctx.settings.mode, slot_label: chosen.label, session_id: sessionId },
    })
    .select('id')
    .single()
  if (apptErr || !appt) {
    // El índice único parcial (dealer_id, starts_at sobre proposed|confirmed) cierra la carrera
    // check-then-insert: si otra reserva tomó el hueco entre medias, el insert falla con
    // unique_violation (23505). Compensamos el lead recién creado y devolvemos 409.
    await admin.from('leads').delete().eq('id', lead.id)
    if ((apptErr as { code?: string } | null)?.code === '23505') {
      return NextResponse.json({ ok: false, error: 'slot_unavailable' }, { status: 409 })
    }
    return NextResponse.json({ ok: false, error: 'appointment_failed' }, { status: 500 })
  }

  // 3) Si el dealer tiene Google Calendar conectado, crear el evento real ahí.
  // createEvent nunca lanza — un fallo de Google se traga: la cita ya guardada en
  // nuestra BD nunca se convierte en un error de cara al comprador.
  let googleEvent: { id: string; meetingUrl: string | null; htmlLink: string } | null = null
  if (ctx.provider === 'google_calendar') {
    googleEvent = await createEvent(admin, dealerId, {
      summary: `Visita · ${vehicleTitle} · ${buyerName}`,
      description: [`Cita reservada desde el agente IA de Black Label Market.`, ctx.settings.instructions || ''].filter(Boolean).join('\n'),
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
      attendeeEmail: buyerEmail,
      attendeeName: buyerName,
    })
    if (googleEvent) {
      await admin.from('appointments')
        .update({ external_event_id: googleEvent.id, meeting_url: googleEvent.meetingUrl })
        .eq('id', appt.id)
    }
  }

  // 4) Avanzar el lead + evento.
  await Promise.all([
    admin.from('leads').update({ status: 'appointment' }).eq('id', lead.id),
    admin.from('lead_events').insert({
      lead_id: lead.id, dealer_id: dealerId, type: 'appointment_confirmed',
      payload: { appointment_id: appt.id, starts_at: startDate.toISOString(), provider: ctx.provider ?? 'manual', source: 'assistant_booking' },
    }),
  ])

  // 5) Notificación (emails + Slack) vía n8n.
  const title = `Visita · ${vehicleTitle} · Black Label Market`
  const details = [`Cita para ver ${vehicleTitle} en ${ctx.dealer.name}.`, ctx.settings.instructions || '']
    .filter(Boolean).join('\n')
  const location = googleEvent?.meetingUrl
    || (ctx.settings.mode === 'video' ? 'Videollamada' : (ctx.settings.location_text || ctx.dealer.name))
  const links = calendarLinks(title, startDate, endDate, details, location)

  await notifyN8n('appointment.created', {
    entityType: 'appointment',
    entityId: appt.id,
    dealerId,
    vehicleId,
    payload: {
      contact: { name: buyerName, email: buyerEmail, phone: buyerPhone },
      dealer: { name: ctx.dealer.name, email: dealerRow?.email ?? null, profile_url: dealerRow?.slug ? `/dealers/${dealerRow.slug}` : null },
      appointment: {
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        label: chosen.label,
        mode: ctx.settings.mode,
        location_text: location,
        instructions: ctx.settings.instructions || null,
        meeting_url: googleEvent?.meetingUrl ?? null,
      },
      vehicle: vehicle ? { title: vehicleTitle, slug: vehicle.slug } : null,
      calendar_links: links,
    },
  })

  return NextResponse.json({
    ok: true,
    appointment_id: appt.id,
    label: chosen.label,
    calendar_links: links,
    meeting_url: googleEvent?.meetingUrl ?? null,
  })
}
