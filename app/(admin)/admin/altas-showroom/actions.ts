'use server'

import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

function temporaryPassword() {
  return `BLM-${randomBytes(10).toString('base64url')}`
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
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  if (!id || !['new', 'in_review', 'pending_info'].includes(status)) return

  const admin = createAdminClient()
  await admin
    .from('showroom_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidateAll(id)
}

export async function saveNotes(formData: FormData) {
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
  const id = formData.get('id') as string
  if (!id) return

  const admin = createAdminClient()
  const { data: application } = await admin
    .from('showroom_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!application || application.status === 'approved') return

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
        status: 'trial',
        vehicle_slots: 0,
        is_verified: true,
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
        login_url: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        approved_at: new Date().toISOString(),
      }),
    }).catch(() => {})
  }

  revalidateAll(id)
  revalidatePath('/admin/dealers')
}

export async function rejectApplication(formData: FormData) {
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
