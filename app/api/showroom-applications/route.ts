import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { notifyShowroomApplicationCreated } from '@/lib/integrations/n8n'
import { isGlobalRateLimited } from '@/lib/rate-limit'

// Mismas listas cerradas que /dashboard/perfil (dealers.certifications / dealers.services) —
// la investigación pre-visita solo puede marcar estos valores, nunca texto libre.
const SPECIALTY_VALUES = ['sport', 'classic', 'premium', 'motorcycle', 'import', 'suv', 'supercar', 'custom'] as const
const SERVICE_VALUES = ['financing', 'trade_in', 'warranty', 'transport_nat', 'transport_intl', 'own_workshop', 'detailing', 'home_delivery'] as const

const schema = z.object({
  name:    z.string().trim().min(2).max(120),
  email:   z.string().trim().email().max(180),
  company: z.string().trim().min(2).max(120),
  phone:   z.string().trim().min(6).max(30),
  city:    z.string().trim().min(2).max(80),
  plan:    z.string().trim().max(40).optional(),
  volume:  z.string().trim().max(80).optional(),
  message: z.string().trim().max(1200).optional(),
  // Web propia del showroom, capturada en la investigación pre-visita — opcional, se copia
  // a dealers.website en la aprobación (approveApplication ya lee application.website).
  website: z.string().trim().url().max(300).optional(),
  // Logo capturado en la investigación pre-visita (skill informe-previsita) — opcional, se copia
  // al perfil del dealer en la aprobación (ver approveApplication).
  logo_url: z.string().trim().url().max(500).optional(),
  // Descripción del showroom redactada por la misma investigación, solo con datos observados
  // (nunca inventados) — se copia a dealers.description en la aprobación.
  profile_description: z.string().trim().max(2000).optional(),
  // Origen de la solicitud: 'visita_agencia' (checklist de visita, reputación ya auditada por
  // la skill informe-previsita) salta la auditoría online de WF1; por defecto 'market_directo'.
  source: z.enum(['market_directo', 'visita_agencia']).optional(),
  // Todo lo siguiente: capturado por la investigación pre-visita SOLO con evidencia pública
  // (Google Business Profile, web propia) — nunca inventado. Se copia a dealers en la aprobación.
  address: z.string().trim().max(300).optional(),
  years_in_business: z.number().int().min(0).max(200).optional(),
  instagram_url: z.string().trim().url().max(300).optional(),
  facebook_url: z.string().trim().url().max(300).optional(),
  youtube_url: z.string().trim().url().max(300).optional(),
  tiktok_url: z.string().trim().url().max(300).optional(),
  linkedin_url: z.string().trim().url().max(300).optional(),
  // Inferidas con evidencia observable (p. ej. taller propio → own_workshop), no autodeclaradas.
  specialties: z.array(z.enum(SPECIALTY_VALUES)).max(8).optional(),
  services: z.array(z.enum(SERVICE_VALUES)).max(8).optional(),
  // Aceptación de /legal/condiciones-profesionales (checkbox en el formulario público). Opcional
  // aquí a propósito: las altas con source='visita_agencia' (watcher, sin checkbox) no lo mandan
  // y se resuelven en el primer acceso al dashboard (ver app/(auth)/aceptar-condiciones).
  terms_accepted: z.literal(true).optional(),
  terms_version: z.string().trim().max(20).optional(),
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

  const {
    name, email, company, phone, city, plan, volume, message, logo_url, profile_description, source, website,
    address, years_in_business, instagram_url, facebook_url, youtube_url, tiktok_url, linkedin_url, specialties, services,
    terms_accepted, terms_version,
  } = parsed.data

  const fullMessage = [
    plan    ? `Plan de interés: ${plan}` : null,
    volume  ? `Volumen inventario: ${volume}` : null,
    message ? message : null,
  ].filter(Boolean).join('\n')

  const admin = createAdminClient()

  // Circuit breaker: protege el presupuesto de Firecrawl (WF1 audita cada alta nueva) ante un
  // flood con emails variados. 30 altas/hora es holgado para el volumen real.
  if (await isGlobalRateLimited(admin, 'showroom_applications', 30, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  // Idempotency: avoid duplicate submissions
  const { count } = await admin
    .from('showroom_applications')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .in('status', ['new', 'in_review', 'pending_info', 'approval_failed'])

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
      plan_interest: plan ?? null,
      message:       fullMessage || null,
      logo_url:      logo_url ?? null,
      profile_description: profile_description ?? null,
      website:       website ?? null,
      source:        source ?? 'market_directo',
      address:            address ?? null,
      years_in_business:  years_in_business ?? null,
      instagram_url:      instagram_url ?? null,
      facebook_url:       facebook_url ?? null,
      youtube_url:        youtube_url ?? null,
      tiktok_url:         tiktok_url ?? null,
      linkedin_url:       linkedin_url ?? null,
      specialties:        specialties ?? null,
      services:           services ?? null,
      terms_accepted_version: terms_accepted ? (terms_version ?? null) : null,
      terms_accepted_at:      terms_accepted ? new Date().toISOString() : null,
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
    source:        source ?? 'market_directo',
    admin_url:     `${process.env.NEXT_PUBLIC_APP_URL}/admin/altas-showroom/${data.id}`,
  }).catch(() => {})

  return NextResponse.json({ ok: true, id: data.id })
}
