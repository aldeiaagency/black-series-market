import { NextRequest, NextResponse } from 'next/server'
import { getDealerBookingContext, getBusyRanges } from '@/lib/assistant-booking'
import { computeSlots } from '@/lib/booking'
import { createAdminClient } from '@/lib/supabase/server'
import { getClientIp, hashIdentifier, isIpEventRateLimited } from '@/lib/rate-limit'

// Solo lectura, pero calcula huecos reales contra el calendario — 60/10min por IP es holgado
// para el widget consultando disponibilidad varias veces durante una conversación.
const AVAILABILITY_IP_LIMIT = 60
const AVAILABILITY_IP_WINDOW_MS = 10 * 60 * 1000

/**
 * GET /api/assistant/availability?dealer=<id>
 * Huecos de cita disponibles de un showroom (Fase B). Solo devuelve algo si el
 * showroom es Elite/Grupo con `appointment_booking` operativo y tiene la
 * disponibilidad configurada; en otro caso `{ available: false }`.
 */
export async function GET(req: NextRequest) {
  const dealerId = req.nextUrl.searchParams.get('dealer')
  if (!dealerId) return NextResponse.json({ available: false })

  const admin = createAdminClient()
  const clientIp = getClientIp(req)
  const ipHash = clientIp ? hashIdentifier(clientIp) : null
  if (await isIpEventRateLimited(admin, 'assistant_availability', ipHash, AVAILABILITY_IP_LIMIT, AVAILABILITY_IP_WINDOW_MS)) {
    return NextResponse.json({ available: false })
  }

  const ctx = await getDealerBookingContext(dealerId)
  if (!ctx.enabled || !ctx.rules || !ctx.settings) {
    return NextResponse.json({ available: false })
  }

  const busy = await getBusyRanges(dealerId, ctx)
  const slots = computeSlots(ctx.rules, busy)

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
