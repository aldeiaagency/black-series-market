'use server'

import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import { assertAdmin } from '@/lib/admin-auth'
import { provisionDealerAssistant } from '@/lib/integrations/n8n-assistant-provisioning'

function temporaryPassword() {
  return `BLM-${randomBytes(10).toString('base64url')}`
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

  if (!application || application.status === 'approved') return

  const trialPlan = resolveTrialPlan(application)

  // Reuse existing profile if the email was already registered (e.g. as a buyer)
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', application.email)
    .maybeSingle()

  let userId: string
  let password: string | null = null

  if (existingProfile) {
    userId = existingProfile.id
    await admin
      .from('profiles')
      .update({ role: 'dealer', full_name: application.full_name })
      .eq('id', userId)
  } else {
    password = temporaryPassword()
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: application.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: application.full_name },
    })

    if (authError || !authData.user) {
      await admin
        .from('showroom_applications')
        .update({
          admin_notes: `${application.admin_notes ?? ''}\nError al aprobar: ${authError?.message ?? 'No se pudo crear el usuario.'}`.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      revalidateAll(id)
      return
    }

    userId = authData.user.id
    await admin.from('profiles').upsert(
      { id: userId, email: application.email, full_name: application.full_name, role: 'dealer' },
      { onConflict: 'id' }
    )
  }

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
        is_verified: true,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single()

    if (dealerError || !dealer) {
      if (!existingProfile) await admin.auth.admin.deleteUser(userId)
      await admin
        .from('showroom_applications')
        .update({
          admin_notes: `${application.admin_notes ?? ''}\nError al aprobar: no se pudo crear el showroom.`.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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
        is_verified: true,
      })
      .select('id')
      .single()
    orgId = org?.id ?? null
  }

  if (orgId) {
    const { data: existingMember } = await admin
      .from('organization_members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .maybeSingle()
    if (!existingMember) {
      await admin
        .from('organization_members')
        .insert({ organization_id: orgId, user_id: userId, role: 'owner' })
    }
  }

  // Auto-provisionar el asistente IA (workflow dedicado clonado por dealer, ver
  // lib/integrations/n8n-assistant-provisioning.ts) para planes Professional/Elite. Mismo helper
  // se llama desde el webhook de Stripe (handleCheckoutCompleted) y desde setDealerPlan — los
  // fundadores del programa entran por esta vía (aprobación directa, sin Stripe).
  if (trialPlan === 'professional' || trialPlan === 'elite') {
    await provisionDealerAssistant(admin, { dealerId, dealerName: application.dealer_name })
  }

  const reviewedBy = await currentAdminId()
  await admin
    .from('showroom_applications')
    .update({
      status: 'approved',
      dealer_id: dealerId,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

  // Un solo email de bienvenida por alta — nunca los dos. WF2 (bienvenida genérica, autoservicio)
  // y WF-P3 (bienvenida fundador, white-glove) pedían cosas contradictorias sobre el stock cuando
  // se disparaban ambos para la misma alta. Se separan por origen: visita_agencia → WF-P3 (lleva
  // credenciales); market_directo → WF2 (self-serve, sin promesa de onboarding asistido).
  if (application.source === 'visita_agencia') {
    // WF-P3: bienvenida de fundador (credenciales + qué hemos completado ya + una sola vía de stock).
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
        temporary_password: password,
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
          temporary_password: password,
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
