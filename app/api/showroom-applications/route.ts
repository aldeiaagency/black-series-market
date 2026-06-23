import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { notifyShowroomApplicationCreated } from '@/lib/integrations/n8n'

const schema = z.object({
  name:    z.string().trim().min(2).max(120),
  email:   z.string().trim().email().max(180),
  company: z.string().trim().min(2).max(120),
  phone:   z.string().trim().min(6).max(30),
  city:    z.string().trim().min(2).max(80),
  plan:    z.string().trim().max(40).optional(),
  volume:  z.string().trim().max(80).optional(),
  message: z.string().trim().max(1200).optional(),
}).strict()

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  }

  const { name, email, company, phone, city, plan, volume, message } = parsed.data

  const fullMessage = [
    plan    ? `Plan de interés: ${plan}` : null,
    volume  ? `Volumen inventario: ${volume}` : null,
    message ? message : null,
  ].filter(Boolean).join('\n')

  const admin = createAdminClient()

  // Idempotency: avoid duplicate submissions
  const { count } = await admin
    .from('showroom_applications')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .in('status', ['new', 'in_review', 'pending_info'])

  if ((count ?? 0) > 0) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  const { data, error } = await admin
    .from('showroom_applications')
    .insert({
      full_name:     name,
      email,
      dealer_name:   company,
      phone,
      location_city: city,
      message:       fullMessage || null,
      status:        'new',
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 500 })
  }

  // Awaited so Vercel doesn't kill the process before the webhook fires
  await notifyShowroomApplicationCreated({
    dealer_application_id: data.id,
    full_name:     name,
    dealer_name:   company,
    email,
    phone,
    location_city: city,
    plan_interest: plan ?? null,
    message:       fullMessage || null,
    admin_url:     `${process.env.NEXT_PUBLIC_APP_URL}/admin/altas-showroom/${data.id}`,
  }).catch(() => {})

  return NextResponse.json({ ok: true, id: data.id })
}
