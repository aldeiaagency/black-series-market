import { NextRequest, NextResponse } from 'next/server'
import { getDealerBookingContext, getBookedStarts } from '@/lib/assistant-booking'
import { computeSlots } from '@/lib/booking'

/**
 * GET /api/assistant/availability?dealer=<id>
 * Huecos de cita disponibles de un showroom (Fase B). Solo devuelve algo si el
 * showroom es Elite/Grupo con `appointment_booking` operativo y tiene la
 * disponibilidad configurada; en otro caso `{ available: false }`.
 */
export async function GET(req: NextRequest) {
  const dealerId = req.nextUrl.searchParams.get('dealer')
  if (!dealerId) return NextResponse.json({ available: false })

  const ctx = await getDealerBookingContext(dealerId)
  if (!ctx.enabled || !ctx.rules || !ctx.settings) {
    return NextResponse.json({ available: false })
  }

  const booked = await getBookedStarts(dealerId)
  const slots = computeSlots(ctx.rules, booked)

  return NextResponse.json({
    available: slots.length > 0,
    dealer_name: ctx.dealer?.name ?? null,
    settings: {
      mode: ctx.settings.mode,
      location_text: ctx.settings.location_text,
      instructions: ctx.settings.instructions,
    },
    slots: slots.map(s => ({ start: s.start, label: s.label, day: s.day })),
  })
}
