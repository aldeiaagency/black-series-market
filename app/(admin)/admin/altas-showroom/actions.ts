'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import { assertAdmin } from '@/lib/admin-auth'
import { provisionDealerAssistant } from '@/lib/integrations/n8n-assistant-provisioning'
import { generateSetupToken, setupTokenExpiresAt } from '@/lib/onboarding/setup-room'

function passwordSetupUrl(
  appUrl: string,
  properties: { hashed_token: string; verification_type: string },
) {
  const params = new URLSearchParams({
    token_hash: properties.hashed_token,
    type: properties.verification_type,
    next: '/reset-password',
  })
  return `${appUrl}/auth/confirm?${params.toString()}`
}

// Plan que se concede durante el trial: el que el showroom pidió en la solicitud.
// `grupo` (multi-sede, contacto manual) y valores no reconocidos caen a 'essential'.
const TRIAL_PLANS = ['essential', 'professional', 'elite'] as const
type TrialPlan = (typeof TRIAL_PLANS)[number]
function resolveTrialPlan(app: { plan_interest?: string | null; message?: string | null }): TrialPlan {
  let p = (app.plan_interest ?? '').toLowerCase().trim()
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

type AdminClient = ReturnType<typeof createAdminClient>
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

function planNeedsAssistant(plan: TrialPlan) {
  return plan === 'professional' || plan === 'elite'
}

async function findAuthUserByEmail(admin: AdminClient, email: string) {
  // Volumen actual muy bajo; una pagina amplia permite reparar el caso raro en
  // que auth.users existe pero el trigger que crea profiles fallo.
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) return null
  const normalized = email.trim().toLowerCase()
  return data.users.find((user) => user.email?.toLowerCase() === normalized) ?? null
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
      .select('dealer_name, full_name, email, admin_notes')
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

  if (!application || !['new', 'in_review', 'pending_info', 'approval_failed'].includes(application.status)) return

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
  let setupUrl: string

  if (userId) {
    await admin.from('profiles').upsert(
      { id: userId, email: application.email, role: 'dealer', full_name: application.full_name },
      { onConflict: 'id' },
    )

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: application.email,
      options: { redirectTo: `${appUrl}/reset-password` },
    })
    if (linkError || !linkData.properties) {
      await markApprovalFailed(admin, {
        applicationId: id,
        dealerId: application.dealer_id ?? null,
        missing: ['password_setup_url'],
      })
      revalidateAll(id)
      return
    }
    setupUrl = passwordSetupUrl(appUrl, linkData.properties)
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
    setupUrl = passwordSetupUrl(appUrl, authData.properties)
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
        is_founder: application.source === 'visita_agencia',
        // Fundador no es un trial de 30 dias: depende de un gate global de
        // monetizacion con preaviso, nunca de una fecha individual.
        trial_ends_at: application.source === 'visita_agencia'
          ? null
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
  let founderSetupUrl: string | null = null
  if (application.source === 'visita_agencia') {
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
    founderSetupUrl = `${appUrl}/configurar/${encodeURIComponent(token)}`
  }

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

  // Un solo email de bienvenida por alta — nunca los dos. WF2 (bienvenida genérica, autoservicio)
  // y WF-P3 (bienvenida fundador, white-glove) pedían cosas contradictorias sobre el stock cuando
  // se disparaban ambos para la misma alta. Se separan por origen: visita_agencia -> WF-P3
  // (sala de configuracion); market_directo -> WF2 (self-serve, sin promesa de onboarding asistido).
  if (application.source === 'visita_agencia') {
    // WF-P3: invitación fundador a completar la sala de configuración.
    // El enlace de credenciales se genera fresco cuando el fundador envía la configuración.
    const { data: dealerForOnboarding } = await admin.from('dealers').select('slug').eq('id', dealerId).single()
    const fundadorWebhookUrl = process.env.N8N_WEBHOOK_FUNDADOR_ONBOARDING
      ?? 'https://aldeia-n8n.giuxk6.easypanel.host/webhook/bsa/fundador-onboarding'
    fetch(fundadorWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: application.dealer_name,
        email: application.email,
        telefono: application.phone,
        dealer_slug: dealerForOnboarding?.slug ?? '',
        event: 'setup_required',
        setup_url: founderSetupUrl,
        login_url: loginUrl,
        dashboard_url: dashboardUrl,
      }),
    }).catch(() => {})
  } else {
    // WF2: bienvenida genérica autoservicio (altas directas del market, no fundador).
    const webhookUrl = process.env.N8N_WEBHOOK_DEALER_APPROVED
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: id,
          dealer_id: dealerId,
          dealer_name: application.dealer_name,
          full_name: application.full_name,
          email: application.email,
          password_setup_url: setupUrl,
          login_url: loginUrl,
          dashboard_url: dashboardUrl,
          approved_at: new Date().toISOString(),
        }),
      }).catch(() => {})
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
        rejected_at: new Date().toISOString(),
      }),
    }).catch(() => {})
  }

  revalidateAll(id)
}
