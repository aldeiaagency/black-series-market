'use server'

import { revalidatePath } from 'next/cache'
import { createHmac } from 'crypto'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { findAuthUserByEmail, type AdminClient } from '@/lib/supabase/admin-helpers'
import { slugify } from '@/lib/utils'
import { assertAdmin } from '@/lib/admin-auth'
import { provisionDealerAssistant } from '@/lib/integrations/n8n-assistant-provisioning'
import { generateSetupToken, setupTokenExpiresAt } from '@/lib/onboarding/setup-room'


// Plan que se concede durante el trial: el que el showroom pidió en la solicitud.
// `grupo` (multi-sede, contacto manual) y valores no reconocidos caen a 'essential'.
const TRIAL_PLANS = ['essential', 'professional', 'elite'] as const
type TrialPlan = (typeof TRIAL_PLANS)[number]
function resolveTrialPlan(app: { agreed_plan?: string | null; plan_interest?: string | null; message?: string | null }): TrialPlan {
  // Prioridad: modalidad acordada en la llamada de admisión (decisión informada, con precio ya
  // conocido) > plan_interest declarado antes de la llamada (referencia orientativa) > mensaje libre.
  let p = (app.agreed_plan ?? '').toLowerCase().trim()
  if (!(TRIAL_PLANS as readonly string[]).includes(p)) {
    p = (app.plan_interest ?? '').toLowerCase().trim()
  }
  if (!(TRIAL_PLANS as readonly string[]).includes(p)) {
    // Solicitudes antiguas guardaban el plan dentro del texto del mensaje.
    const m = (app.message ?? '').match(/plan de inter[eé]s:\s*([a-zñ]+)/i)
    p = (m?.[1] ?? '').toLowerCase()
  }
  return (TRIAL_PLANS as readonly string[]).includes(p) ? (p as TrialPlan) : 'essential'
}

async function currentAdminId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

function revalidateAll(id: string) {
  revalidatePath('/admin/altas-showroom')
  revalidatePath(`/admin/altas-showroom/${id}`)
}

type ApprovalPiece =
  | 'auth_user'
  | 'profile'
  | 'dealer'
  | 'organization'
  | 'organization_owner'
  | 'showroom_assistant_config'
  | 'setup_room_token'
  | 'password_setup_url'
  | 'application_status'
  | 'founder_setup_notification'

function planNeedsAssistant(plan: TrialPlan) {
  return plan === 'professional' || plan === 'elite'
}

async function verifyApprovalPieces(
  admin: AdminClient,
  input: { userId: string | null; dealerId: string | null; plan: TrialPlan },
): Promise<ApprovalPiece[]> {
  const missing: ApprovalPiece[] = []

  if (!input.userId) {
    missing.push('auth_user', 'profile')
  } else {
    const [{ data: authData }, { data: profile }] = await Promise.all([
      admin.auth.admin.getUserById(input.userId),
      admin.from('profiles').select('id, role').eq('id', input.userId).maybeSingle(),
    ])
    if (!authData.user) missing.push('auth_user')
    if (!profile || profile.role !== 'dealer') missing.push('profile')
  }

  if (!input.dealerId) {
    missing.push('dealer', 'organization', 'organization_owner')
    if (planNeedsAssistant(input.plan)) missing.push('showroom_assistant_config')
    return missing
  }

  const [{ data: dealer }, { data: organization }, { data: assistantConfig }] = await Promise.all([
    admin.from('dealers').select('id').eq('id', input.dealerId).maybeSingle(),
    admin.from('organizations').select('id').eq('dealer_id', input.dealerId).maybeSingle(),
    planNeedsAssistant(input.plan)
      ? admin.from('showroom_assistant_config').select('id').eq('dealer_id', input.dealerId).maybeSingle()
      : Promise.resolve({ data: { id: 'not-required' } }),
  ])

  if (!dealer) missing.push('dealer')
  if (!organization) {
    missing.push('organization', 'organization_owner')
  } else if (input.userId) {
    const { data: owner } = await admin
      .from('organization_members')
      .select('id')
      .eq('organization_id', organization.id)
      .eq('user_id', input.userId)
      .eq('role', 'owner')
      .maybeSingle()
    if (!owner) missing.push('organization_owner')
  } else {
    missing.push('organization_owner')
  }

  if (planNeedsAssistant(input.plan) && !assistantConfig) {
    missing.push('showroom_assistant_config')
  }

  return missing
}

async function postJsonWithTimeout(url: string, body: { event: string } & Record<string, unknown>, secret?: string) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 12_000)
  // Auditoría de seguridad 2026-09-02 (P0.6): firma HMAC igual que el resto de webhooks salientes
  // del proyecto — este emisor apuntaba al mismo webhook que app/api/onboarding/[token]/complete/
  // route.ts sin firmar y sin exigir el secreto; se había corregido uno de los dos emisores, no
  // este. Mismo esquema: timestamp + sha256=hmac(secret, body).
  const webhookBody = JSON.stringify(body)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Corrección 2026-09-04: quedó fijo en 'setup_completed' desde el principio, aunque el
    // único emisor que usa esta función siempre manda event='setup_required' — n8n lee el
    // body, no la cabecera, así que no rompía nada hoy, pero era una cabecera que mentía
    // sobre el propio evento que llevaba dentro (hallazgo de Codex, simulación E2E).
    'x-blacklabel-event': body.event,
  }
  // secret es opcional (2026-09-04, simulación E2E alta online): el lado n8n que recibe estos
  // webhooks NO verifica realmente la firma HMAC todavía — el sandbox de los nodos Code de n8n
  // bloquea require("crypto"), ver nota en el nodo "Validar firma y payload" de WF1. Firmar aquí
  // cuando hay secreto configurado no hace daño y deja el emisor listo para cuando se implemente
  // la verificación real (nodo nativo n8n-nodes-base.crypto, pendiente — ver docs/PENDIENTES.md);
  // no lo exigimos (fail-closed) para no bloquear un pipeline en producción por una firma que hoy
  // nadie comprueba al otro lado.
  if (secret) {
    const webhookTimestamp = new Date().toISOString()
    const webhookSignature = createHmac('sha256', secret).update(webhookBody).digest('hex')
    headers['x-blacklabel-timestamp'] = webhookTimestamp
    headers['x-blacklabel-signature'] = `sha256=${webhookSignature}`
  }
  try {
    return await fetch(url, {
      method: 'POST',
      headers,
      body: webhookBody,
      signal: ctrl.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

async function markApprovalNotificationFailed(
  admin: AdminClient,
  input: { applicationId: string; dealerId: string | null; missing: ApprovalPiece[] },
) {
  await admin.from('showroom_applications').update({
    status: 'approval_failed',
    dealer_id: input.dealerId,
    approval_missing_pieces: input.missing,
    reviewed_at: new Date().toISOString(),
    reviewed_by: await currentAdminId(),
    updated_at: new Date().toISOString(),
  }).eq('id', input.applicationId)
}
async function markApprovalFailed(
  admin: AdminClient,
  input: { applicationId: string; dealerId: string | null; missing: ApprovalPiece[] },
) {
  if (input.dealerId) {
    // Doble barrera fail-closed: aunque el trigger de contenido llegue a marcar
    // published, status=pending lo mantiene fuera de todas las rutas publicas.
    await admin.from('dealers').update({ status: 'pending', profile_status: 'draft' }).eq('id', input.dealerId)
  }

  await admin.from('showroom_applications').update({
    status: 'approval_failed',
    dealer_id: input.dealerId,
    approval_missing_pieces: input.missing,
    reviewed_at: new Date().toISOString(),
    reviewed_by: await currentAdminId(),
    updated_at: new Date().toISOString(),
  }).eq('id', input.applicationId)
}

export async function setApplicationStatus(formData: FormData) {
  await assertAdmin()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  if (!id || !['new', 'in_review', 'pending_info'].includes(status)) return

  const admin = createAdminClient()

  if (status === 'pending_info') {
    const { data: application } = await admin
      .from('showroom_applications')
      .select('dealer_name, full_name, email, admin_notes, source')
      .eq('id', id)
      .single()

    await admin
      .from('showroom_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    const webhookUrl = process.env.N8N_WEBHOOK_DEALER_PENDING_INFO
    if (webhookUrl && application) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: id,
          dealer_name: application.dealer_name,
          full_name: application.full_name,
          email: application.email,
          source: application.source,
          admin_notes: application.admin_notes ?? '',
          admin_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/altas-showroom/${id}`,
        }),
      }).catch(() => {})
    }
  } else {
    await admin
      .from('showroom_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  revalidateAll(id)
}

// Nuevo paso del embudo (precios ocultos + llamada de admisión, 2026-09-02): la solicitud cumple
// los criterios del market pero todavía NO recibe acceso — se le invita a auto-agendar una llamada
// (Google Calendar) donde se explican precios y condiciones reales. Solo `market_directo`; la
// visita presencial de la agencia ya cubre ese rol para `visita_agencia`.
export async function markQualifiedAwaitingCall(formData: FormData) {
  await assertAdmin()
  const id = formData.get('id') as string
  if (!id) return

  const admin = createAdminClient()
  const { data: application } = await admin
    .from('showroom_applications')
    .select('dealer_name, full_name, email, phone, source, status, admin_notes')
    .eq('id', id)
    .single()

  if (!application || application.source === 'visita_agencia') return
  // Gate añadido 2026-09-04 (hallazgo Codex, simulación E2E alta online): antes el botón "Cumple
  // criterios" era clicable en cualquier estado no cualificado, incluido 'new' — un admin podía
  // invitar a la llamada antes de que el informe automático de WF1 (Firecrawl+Claude) llegara
  // siquiera a admin_notes. La vista por defecto de /admin/altas-showroom enseña 'new'
  // directamente (no solo tras la notificación por Slack/email del informe), así que el riesgo
  // era real, no solo teórico.
  if (application.status !== 'in_review') return

  // Enlace de auto-agenda: placeholder hasta conectar el Google Calendar del market. El env var
  // vacío no bloquea marcar la solicitud como cualificada — solo el envío del email queda pendiente.
  const bookingUrl = process.env.SHOWROOM_ADMISSION_CALL_BOOKING_URL
  const webhookUrl = process.env.N8N_WEBHOOK_DEALER_QUALIFIED
  const webhookSecret = process.env.N8N_WEBHOOK_DEALER_QUALIFIED_SECRET

  // Corrección 2026-09-04 (hallazgo Codex): antes era fetch().catch(()=>{}) sin esperar la
  // respuesta ni registrar el fallo — el admin veía "cumple criterios" como si la invitación
  // hubiera salido aunque n8n o el SMTP fallaran en silencio. Ahora se espera la respuesta y, si
  // falla, queda constancia en admin_notes (mismo campo que ya lee el admin, sin migración
  // nueva) para que se contacte al showroom manualmente.
  let notifyError: string | null = null
  if (!webhookUrl) {
    notifyError = 'N8N_WEBHOOK_DEALER_QUALIFIED no está configurado en Vercel.'
  } else {
    try {
      const res = await postJsonWithTimeout(webhookUrl, {
        event: 'dealer_qualified',
        application_id: id,
        dealer_name: application.dealer_name,
        full_name: application.full_name,
        email: application.email,
        phone: application.phone,
        booking_url: bookingUrl ?? null,
        admin_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/altas-showroom/${id}`,
      }, webhookSecret)
      if (!res.ok) notifyError = `n8n respondió ${res.status}`
    } catch (err) {
      notifyError = err instanceof Error ? err.message : 'fetch falló'
    }
  }

  const now = new Date().toISOString()
  await admin
    .from('showroom_applications')
    .update({
      status: 'qualified_awaiting_call',
      admin_notes: notifyError
        ? `${(application.admin_notes ?? '').trim()}\n\n---\n[Aviso automático ${now}]\nNo se pudo notificar la invitación a llamada: ${notifyError}\nContactar al showroom manualmente.`.trim()
        : application.admin_notes,
      qualified_at: now,
      updated_at: now,
    })
    .eq('id', id)

  revalidateAll(id)
}

export async function saveNotes(formData: FormData) {
  await assertAdmin()
  const id = formData.get('id') as string
  const adminNotes = formData.get('admin_notes') as string
  if (!id) return

  const admin = createAdminClient()
  await admin
    .from('showroom_applications')
    .update({ admin_notes: adminNotes, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidateAll(id)
}

export async function approveApplication(formData: FormData) {
  await assertAdmin()
  const id = formData.get('id') as string
  if (!id) return

  const admin = createAdminClient()
  const { data: application } = await admin
    .from('showroom_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!application) return
  // Nuevo embudo (2026-09-02): market_directo solo puede aprobarse tras pasar por la llamada de
  // admisión (markQualifiedAwaitingCall) — sin eso no ha conocido precio ni condiciones todavía.
  // visita_agencia no cambia: la visita presencial ya cumplió ese rol antes de esta solicitud.
  const requiredStatuses = application.source === 'visita_agencia'
    ? ['new', 'in_review', 'pending_info', 'approval_failed']
    : ['qualified_awaiting_call', 'approval_failed']
  if (!requiredStatuses.includes(application.status)) return

  // Corrección 2026-09-04 (simulación E2E alta online, hallazgo antes de la propia simulación de
  // Codex): resolveTrialPlan() ya sabía leer agreed_plan con prioridad sobre plan_interest, pero
  // no existía ningún formulario en todo el admin que lo escribiera — cada market_directo
  // aprobado caía siempre a 'essential' por defecto, sin importar qué modalidad se hubiera
  // acordado realmente en la llamada de admisión. El selector nuevo en la página de detalle manda
  // este campo; se persiste aquí antes de resolver el plan.
  if (application.source !== 'visita_agencia') {
    const agreedPlanInput = String(formData.get('agreed_plan') ?? '').trim().toLowerCase()
    // Corrección 2026-09-05 (hallazgo Codex): el <select required> del cliente no es un contrato
    // real — si agreed_plan llega ausente o inválido, antes se aprobaba igual y resolveTrialPlan()
    // caía en silencio a plan_interest/mensaje/essential, sin reflejar lo acordado en la llamada.
    // Ahora se exige en servidor, igual que ya se exige requiredStatuses arriba.
    if (!(TRIAL_PLANS as readonly string[]).includes(agreedPlanInput)) return
    application.agreed_plan = agreedPlanInput
    await admin.from('showroom_applications').update({ agreed_plan: agreedPlanInput }).eq('id', id)
  }

  // El programa fundador concede Elite por contrato; no debe degradarse a
  // Essential si el watcher de visitas omite el plan_interest opcional.
  const trialPlan: TrialPlan = application.source === 'visita_agencia'
    ? 'elite'
    : resolveTrialPlan(application)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    await markApprovalFailed(admin, {
      applicationId: id,
      dealerId: application.dealer_id ?? null,
      missing: ['password_setup_url'],
    })
    revalidateAll(id)
    return
  }

  // Reuse existing profile if the email was already registered (e.g. as a buyer)
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', application.email)
    .maybeSingle()

  const existingAuthUser = existingProfile ? null : await findAuthUserByEmail(admin, application.email)
  let userId: string | null = existingProfile?.id ?? existingAuthUser?.id ?? null

  if (userId) {
    await admin.from('profiles').upsert(
      { id: userId, email: application.email, role: 'dealer', full_name: application.full_name },
      { onConflict: 'id' },
    )

    // Valida que el sistema de auth puede generar credenciales para este usuario ya existente
    // (misma comprobación fail-closed de antes) — el enlace en sí ya no se usa: el embudo nuevo
    // genera el de recuperación fresco al completar la sala de configuración, no aquí.
    const { error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: application.email,
      options: { redirectTo: `${appUrl}/reset-password` },
    })
    if (linkError) {
      await markApprovalFailed(admin, {
        applicationId: id,
        dealerId: application.dealer_id ?? null,
        missing: ['password_setup_url'],
      })
      revalidateAll(id)
      return
    }
  } else {
    // generateLink(invite) crea el usuario sin contraseña y devuelve un enlace
    // de un solo uso; el email lo entrega n8n dentro de la bienvenida.
    const { data: authData, error: authError } = await admin.auth.admin.generateLink({
      type: 'invite',
      email: application.email,
      options: {
        data: { full_name: application.full_name },
        redirectTo: `${appUrl}/reset-password`,
      },
    })

    if (authError || !authData.user || !authData.properties) {
      const missing = await verifyApprovalPieces(admin, { userId: null, dealerId: null, plan: trialPlan })
      await markApprovalFailed(admin, {
        applicationId: id,
        dealerId: null,
        missing: [...missing, 'password_setup_url'],
      })
      revalidateAll(id)
      return
    }

    userId = authData.user.id
    await admin.from('profiles').upsert(
      { id: userId, email: application.email, full_name: application.full_name, role: 'dealer' },
      { onConflict: 'id' }
    )
  }

  if (!userId) return

  // Idempotent: reuse dealer if already created for this profile
  const { data: existingDealer } = await admin
    .from('dealers')
    .select('id')
    .eq('profile_id', userId)
    .maybeSingle()

  let dealerId: string

  if (existingDealer) {
    dealerId = existingDealer.id
    // Corrección 2026-09-05 (hallazgo Codex): esta rama reutiliza el dealer creado en un intento
    // previo (reintento tras approval_failed, típicamente) pero nunca sincronizaba plan/destacado
    // con el trialPlan resuelto en ESTE intento — si el admin corrigió agreed_plan al reintentar,
    // el dealer se quedaba con el plan equivocado de la primera vez en silencio.
    await admin.from('dealers').update({
      subscription_plan: trialPlan,
      is_featured: trialPlan === 'elite',
    }).eq('id', dealerId)
  } else {
    const slug = `${slugify(application.dealer_name)}-${Math.random().toString(36).slice(2, 8)}`
    const { data: dealer, error: dealerError } = await admin
      .from('dealers')
      .insert({
        profile_id: userId,
        slug,
        name: application.dealer_name,
        location_city: application.location_city,
        location_region: application.location_region,
        phone: application.phone,
        whatsapp: application.whatsapp,
        email: application.email,
        website: application.website,
        logo_url: application.logo_url || null,
        description: application.profile_description || null,
        // Capturado en automático por la investigación pre-visita, solo con evidencia pública.
        address: application.address || null,
        years_in_business: application.years_in_business ?? null,
        instagram: application.instagram_url || null,
        facebook_url: application.facebook_url || null,
        youtube_url: application.youtube_url || null,
        tiktok_url: application.tiktok_url || null,
        linkedin_url: application.linkedin_url || null,
        certifications: application.specialties || null,
        services: application.services || null,
        source_prospecto_id: application.source_prospecto_id || null,
        // Aceptación de /legal/condiciones-profesionales — si vino del formulario público con
        // checkbox, se copia aquí. Si es NULL (alta gestionada por la agencia, sin checkbox),
        // el layout del dashboard pedirá aceptarlas en el primer acceso.
        terms_accepted_version: application.terms_accepted_version || null,
        terms_accepted_at: application.terms_accepted_at || null,
        status: 'trial',
        subscription_plan: trialPlan,
        vehicle_slots: 0,
        // Aprobar la cuenta no equivale a verificar reputacion ni a publicar el perfil.
        is_verified: false,
        profile_status: 'draft',
        // 2026-09-04: materializa is_featured en la aprobación (cierra gap "Destacado" de docs/PENDIENTES.md) — sin condición de status.
        is_featured: trialPlan === 'elite',
        is_founder: application.source === 'visita_agencia',
        // Fundador no es un trial con fecha fija: depende de un gate global de
        // monetizacion con preaviso, nunca de una fecha individual.
        // 2026-09-05: trial de market_directo ampliado de 30 a 90 dias (3 meses) — promocion de
        // lanzamiento, decision de H. Ver tambien "Calcular etapa" en el workflow n8n "BLM - 8.
        // Trial drip y conversion" (n8n-workflows/wf8-trial-drip.json), que recalcula dias
        // transcurridos asumiendo esta misma duracion — cambiar ambos siempre juntos.
        trial_ends_at: application.source === 'visita_agencia'
          ? null
          : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single()

    if (dealerError || !dealer) {
      const missing = await verifyApprovalPieces(admin, { userId, dealerId: null, plan: trialPlan })
      await markApprovalFailed(admin, { applicationId: id, dealerId: null, missing })
      revalidateAll(id)
      return
    }
    dealerId = dealer.id
  }

  // Provisionar organización + membresía owner. El sistema de entitlements/plan-gating
  // (getDealerAccess.orgId, getOrganizationIdForUser, can(), getEntitlements) depende de
  // estos registros; sin ellos un dealer aprobado no desbloquea las features de su plan
  // (kanban, import CSV, etc.). Idempotente: reutiliza si ya existen.
  const { data: existingOrg } = await admin
    .from('organizations')
    .select('id')
    .eq('dealer_id', dealerId)
    .maybeSingle()

  let orgId = existingOrg?.id ?? null
  if (!orgId) {
    const orgSlug = `${slugify(application.dealer_name)}-${Math.random().toString(36).slice(2, 8)}`
    const { data: org } = await admin
      .from('organizations')
      .insert({
        dealer_id: dealerId,
        name: application.dealer_name,
        slug: orgSlug,
        status: 'active',
        is_verified: false,
      })
      .select('id')
      .single()
    orgId = org?.id ?? null
  }

  if (orgId) {
    const { data: existingMember } = await admin
      .from('organization_members')
      .select('id, role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .maybeSingle()
    if (!existingMember) {
      await admin
        .from('organization_members')
        .insert({ organization_id: orgId, user_id: userId, role: 'owner' })
    } else if (existingMember.role !== 'owner') {
      await admin
        .from('organization_members')
        .update({ role: 'owner' })
        .eq('id', existingMember.id)
    }
  }

  // Auto-provisionar el asistente IA (workflow dedicado clonado por dealer, ver
  // lib/integrations/n8n-assistant-provisioning.ts) para planes Professional/Elite. Mismo helper
  // se llama desde el webhook de Stripe (handleCheckoutCompleted) y desde setDealerPlan — los
  // fundadores del programa entran por esta vía (aprobación directa, sin Stripe).
  if (planNeedsAssistant(trialPlan)) {
    const { data: existingAssistantConfig } = await admin
      .from('showroom_assistant_config')
      .select('id')
      .eq('dealer_id', dealerId)
      .maybeSingle()
    if (!existingAssistantConfig) {
      await provisionDealerAssistant(admin, { dealerId, dealerName: application.dealer_name })
    }
  }

  const missing = await verifyApprovalPieces(admin, { userId, dealerId, plan: trialPlan })
  if (missing.length > 0) {
    await markApprovalFailed(admin, { applicationId: id, dealerId, missing })
    revalidateAll(id)
    revalidatePath('/admin/dealers')
    return
  }

  const reviewedBy = await currentAdminId()
  const { error: dealerStatusError } = await admin.from('dealers').update({ status: 'trial' }).eq('id', dealerId)
  if (dealerStatusError) {
    await markApprovalFailed(admin, { applicationId: id, dealerId, missing: ['dealer'] })
    revalidateAll(id)
    return
  }
  await admin.rpc('sync_dealer_profile_publication', { p_dealer_id: dealerId })
  // Nuevo embudo (2026-09-02): la sala de configuración ya no es exclusiva de visita_agencia.
  // market_directo llega aquí solo después de la llamada de admisión (ver guardia de arriba), así
  // que también recibe el mismo onboarding asistido — ya no hay una vía "autoservicio directo".
  const { token, tokenHash } = generateSetupToken()
  const { error: tokenError } = await admin.from('dealer_setup_tokens').insert({
    dealer_id: dealerId,
    token_hash: tokenHash,
    expires_at: setupTokenExpiresAt(),
  })
  if (tokenError) {
    await markApprovalFailed(admin, { applicationId: id, dealerId, missing: ['setup_room_token'] })
    revalidateAll(id)
    return
  }
  const founderSetupUrl = `${appUrl}/configurar/${encodeURIComponent(token)}`

  const { data: approvedApplication, error: approvalUpdateError } = await admin
    .from('showroom_applications')
    .update({
      status: 'approved',
      dealer_id: dealerId,
      approval_missing_pieces: [],
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, status')
    .single()

  if (approvalUpdateError || approvedApplication?.status !== 'approved') {
    await markApprovalFailed(admin, { applicationId: id, dealerId, missing: ['application_status'] })
    revalidateAll(id)
    return
  }

  const loginUrl = `${appUrl}/login`
  const dashboardUrl = `${appUrl}/dashboard`

  // Nuevo embudo (2026-09-02): un único email de invitación a la sala de configuración para
  // cualquier alta aprobada, sea fundador (visita_agencia) o showroom que pasó la llamada de
  // admisión (market_directo) — ambos reciben ahora el mismo onboarding asistido, ya no hay una
  // vía de autoservicio directo. `is_founder` en el payload permite que n8n adapte el tono si hace
  // falta, sin ser dos webhooks distintos con copy contradictorio entre sí.
  {
    const { data: dealerForOnboarding } = await admin.from('dealers').select('slug').eq('id', dealerId).single()
    // Auditoría de seguridad 2026-09-02 (P0.6): sin URL/secreto de entorno, falla cerrado en vez
    // de caer a una URL hardcodeada — mismo principio que app/api/onboarding/[token]/complete.
    const fundadorWebhookUrl = process.env.N8N_WEBHOOK_FUNDADOR_ONBOARDING
    const fundadorWebhookSecret = process.env.N8N_WEBHOOK_FUNDADOR_ONBOARDING_SECRET
    if (!fundadorWebhookUrl || !fundadorWebhookSecret) {
      await markApprovalNotificationFailed(admin, {
        applicationId: id,
        dealerId,
        missing: ['founder_setup_notification'],
      })
      revalidateAll(id)
      revalidatePath('/admin/dealers')
      return
    }
    const founderPayload = {
      nombre: application.dealer_name,
      email: application.email,
      telefono: application.phone,
      dealer_slug: dealerForOnboarding?.slug ?? '',
      event: 'setup_required',
      setup_url: founderSetupUrl,
      login_url: loginUrl,
      dashboard_url: dashboardUrl,
      is_founder: application.source === 'visita_agencia',
      // Cierra la trazabilidad de vuelta al Prospecto de Airtable que originó esta visita
      // (hallazgo de auditoría 2026-08-17). NULL si la alta no vino de una visita con Prospecto
      // enlazado, o si es una alta market_directo.
      prospecto_id: application.source_prospecto_id ?? null,
    }
    let founderNotificationSent = false
    try {
      const res = await postJsonWithTimeout(fundadorWebhookUrl, founderPayload, fundadorWebhookSecret)
      founderNotificationSent = res.ok
    } catch {
      founderNotificationSent = false
    }
    if (!founderNotificationSent) {
      await markApprovalNotificationFailed(admin, {
        applicationId: id,
        dealerId,
        missing: ['founder_setup_notification'],
      })
      revalidateAll(id)
      revalidatePath('/admin/dealers')
      return
    }
  }

  revalidateAll(id)
  revalidatePath('/admin/dealers')
}

export async function retryApprovalRepair(formData: FormData) {
  // approveApplication es idempotente: consulta cada pieza y solo crea o corrige
  // las que faltan antes de repetir la verificacion fail-closed.
  return approveApplication(formData)
}

export async function rejectApplication(formData: FormData) {
  await assertAdmin()
  const id = formData.get('id') as string
  if (!id) return

  const admin = createAdminClient()
  const { data: application } = await admin
    .from('showroom_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!application || application.status === 'approved') return

  const reviewedBy = await currentAdminId()
  await admin
    .from('showroom_applications')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  const webhookUrl = process.env.N8N_WEBHOOK_DEALER_REJECTED
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: id,
        dealer_name: application.dealer_name,
        full_name: application.full_name,
        email: application.email,
        source: application.source,
        rejected_at: new Date().toISOString(),
      }),
    }).catch(() => {})
  }

  revalidateAll(id)
}
