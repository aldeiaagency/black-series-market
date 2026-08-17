import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import {
  loadSetupRoom,
  normalizeStringArray,
  normalizeText,
  passwordSetupUrl,
  planNeedsAssistant,
  sanitizeHttpUrl,
} from '@/lib/onboarding/setup-room'

const SPECIALTIES = ['sport', 'classic', 'premium', 'motorcycle', 'import', 'suv', 'supercar', 'custom'] as const
const SERVICES = ['financing', 'trade_in', 'warranty', 'transport_nat', 'transport_intl', 'own_workshop', 'detailing', 'home_delivery'] as const
const STOCK_MODES = ['feed_url', 'csv', 'loose_files'] as const

type UploadedFileRef = {
  url: string
  path: string
  type?: string
  name?: string
  size?: number
  content_type?: string
}

function normalizeFiles(value: unknown): UploadedFileRef[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((file) => {
    if (!file || typeof file !== 'object') return []
    const f = file as Record<string, unknown>
    const url = sanitizeHttpUrl(f.url)
    const path = normalizeText(f.path, 500)
    if (!url || !path) return []
    return [{
      url,
      path,
      type: normalizeText(f.type, 40) ?? undefined,
      name: normalizeText(f.name, 160) ?? undefined,
      size: typeof f.size === 'number' ? f.size : undefined,
      content_type: normalizeText(f.content_type, 120) ?? undefined,
    }]
  })
}

function normalizeBoolean(value: unknown) {
  return value === true || value === 'true'
}

async function postJsonWithTimeout(url: string, body: unknown) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 12_000)
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const admin = createAdminClient()
  const setup = await loadSetupRoom(admin, params.token)
  if (!setup) {
    return NextResponse.json({ error: 'El enlace de configuración no es válido o ya ha caducado.' }, { status: 401 })
  }

  const body = await req.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Solicitud no válida.' }, { status: 400 })

  const profile = (body.profile && typeof body.profile === 'object' ? body.profile : {}) as Record<string, unknown>
  const assistant = (body.assistant && typeof body.assistant === 'object' ? body.assistant : {}) as Record<string, unknown>
  const stock = (body.stock && typeof body.stock === 'object' ? body.stock : {}) as Record<string, unknown>
  const assets = (body.assets && typeof body.assets === 'object' ? body.assets : {}) as Record<string, unknown>

  const dealerUpdate = {
    name: normalizeText(profile.name, 160) || setup.dealer.name,
    description: normalizeText(profile.description, 2400),
    location_city: normalizeText(profile.location_city, 120),
    location_region: normalizeText(profile.location_region, 120),
    address: normalizeText(profile.address, 240),
    phone: normalizeText(profile.phone, 80),
    whatsapp: normalizeText(profile.whatsapp, 80),
    website: sanitizeHttpUrl(profile.website),
    instagram: sanitizeHttpUrl(profile.instagram),
    facebook_url: sanitizeHttpUrl(profile.facebook_url),
    youtube_url: sanitizeHttpUrl(profile.youtube_url),
    tiktok_url: sanitizeHttpUrl(profile.tiktok_url),
    linkedin_url: sanitizeHttpUrl(profile.linkedin_url),
    years_in_business: typeof profile.years_in_business === 'number' ? profile.years_in_business : null,
    certifications: normalizeStringArray(profile.certifications, SPECIALTIES),
    services: normalizeStringArray(profile.services, SERVICES),
    logo_url: sanitizeHttpUrl(assets.logo_url) ?? setup.dealer.logo_url,
    cover_url: sanitizeHttpUrl(assets.cover_url) ?? setup.dealer.cover_url,
    updated_at: new Date().toISOString(),
  }

  const { error: dealerError } = await admin.from('dealers').update(dealerUpdate).eq('id', setup.dealer.id)
  if (dealerError) {
    return NextResponse.json({ error: 'No se pudo guardar el perfil del showroom.' }, { status: 500 })
  }

  const stockMode = STOCK_MODES.includes(String(stock.mode) as typeof STOCK_MODES[number]) ? String(stock.mode) : null
  const setupContext = {
    profile_confirmed_at: new Date().toISOString(),
    financing: {
      available: normalizeBoolean(assistant.financing_available),
      conditions: normalizeText(assistant.financing_terms, 500),
    },
    services: normalizeStringArray(assistant.services, SERVICES),
    attention_hours: normalizeText(assistant.attention_hours, 280),
    negotiation_style: normalizeText(assistant.negotiation_style, 500),
    whatsapp_number: normalizeText(assistant.whatsapp_number, 80) ?? dealerUpdate.whatsapp,
    documents: normalizeFiles(assets.documents),
    stock: {
      mode: stockMode,
      feed_url: sanitizeHttpUrl(stock.feed_url),
      notes: normalizeText(stock.notes, 700),
      csv_files: normalizeFiles(stock.csv_files),
      bulk_files: normalizeFiles(stock.bulk_files),
    },
  }

  const existingContext = setup.assistantConfig?.context ?? {}
  const context = { ...existingContext, setup_room: setupContext }
  const needsAssistant = planNeedsAssistant(setup.dealer.subscription_plan)

  const { data: googleConn } = await admin
    .from('showroom_calendar_connections')
    .select('calendar_ref')
    .eq('dealer_id', setup.dealer.id)
    .eq('provider', 'google_calendar')
    .eq('status', 'connected')
    .maybeSingle()

  const { error: assistantError } = await admin
    .from('showroom_assistant_config')
    .upsert({
      dealer_id: setup.dealer.id,
      context,
      whatsapp_number: setupContext.whatsapp_number,
      calendar_provider: googleConn ? 'google_calendar' : setup.assistantConfig ? undefined : null,
      calendar_ref: googleConn?.calendar_ref ?? undefined,
      enabled: needsAssistant ? true : false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'dealer_id' })
  if (assistantError) {
    return NextResponse.json({ error: 'No se pudo guardar el contexto del asistente.' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const email = setup.dealer.profile?.email || setup.dealer.email || setup.application?.email
  if (!appUrl || !email) {
    return NextResponse.json({ error: 'No se pudo generar el enlace de acceso.' }, { status: 500 })
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${appUrl}/reset-password` },
  })
  if (linkError || !linkData.properties) {
    return NextResponse.json({ error: 'No se pudo generar el enlace de acceso.' }, { status: 500 })
  }
  const recoveryUrl = passwordSetupUrl(appUrl, linkData.properties)

  const { data: usedToken, error: usedError } = await admin
    .from('dealer_setup_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', setup.token.id)
    .is('used_at', null)
    .select('id')
    .maybeSingle()
  if (usedError || !usedToken) {
    return NextResponse.json({ error: 'Este enlace ya se ha utilizado.' }, { status: 409 })
  }

  const webhookUrl = process.env.N8N_WEBHOOK_FUNDADOR_ONBOARDING
    ?? 'https://aldeia-n8n.giuxk6.easypanel.host/webhook/bsa/fundador-onboarding'
  const payload = {
    event: 'setup_completed',
    dealer_id: setup.dealer.id,
    dealer_slug: setup.dealer.slug,
    dealer_name: dealerUpdate.name,
    full_name: setup.application?.full_name ?? setup.dealer.profile?.full_name ?? null,
    email,
    phone: dealerUpdate.phone,
    whatsapp: setupContext.whatsapp_number,
    password_setup_url: recoveryUrl,
    login_url: `${appUrl}/login`,
    dashboard_url: `${appUrl}/dashboard`,
    admin_url: `${appUrl}/admin/dealers/${setup.dealer.id}`,
    public_preview_url: `${appUrl}/dealers/${setup.dealer.slug}`,
    setup_context: setupContext,
    completed_at: new Date().toISOString(),
  }

  let webhookSent = false
  try {
    const res = await postJsonWithTimeout(webhookUrl, payload)
    webhookSent = res.ok
  } catch {
    webhookSent = false
  }

  revalidatePath(`/admin/dealers/${setup.dealer.id}`)
  revalidatePath('/admin/dealers')
  revalidatePath(`/dealers/${setup.dealer.slug}`)

  return NextResponse.json({ ok: true, webhook_sent: webhookSent })
}
