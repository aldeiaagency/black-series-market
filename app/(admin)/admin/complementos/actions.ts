'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function revalidateAddonAdmin() {
  revalidatePath('/admin')
  revalidatePath('/admin/complementos')
}

export async function approveStockSync(formData: FormData) {
  const adminId = await assertAdmin()
  const orderId = formData.get('orderId') as string
  const feedUrlInput = ((formData.get('feed_url') as string | null) ?? '').trim()
  const notes = ((formData.get('admin_notes') as string | null) ?? '').trim()
  if (!orderId) return

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('addon_orders')
    .select('id, organization_id, dealer_id, status, addon:addons(slug), dealer:dealers(feed_url)')
    .eq('id', orderId)
    .maybeSingle()

  const addon = relationOne(order?.addon as unknown as { slug: string } | null)
  const dealer = relationOne(order?.dealer as unknown as { feed_url: string | null } | null)
  if (!order || addon?.slug !== 'feed_sync' || !['pending_activation', 'active'].includes(order.status)) {
    revalidateAddonAdmin()
    redirect('/admin/complementos')
  }

  const feedUrl = feedUrlInput || dealer?.feed_url || ''
  if (!feedUrl) {
    redirect('/admin/complementos?error=feed_url_required')
  }

  if (feedUrlInput) {
    await admin.from('dealers').update({ feed_url: feedUrlInput, updated_at: new Date().toISOString() }).eq('id', order.dealer_id)
  }

  await admin
    .from('organization_feature_overrides')
    .update({ status: 'canceled', ends_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('organization_id', order.organization_id)
    .eq('feature_key', 'feed_sync')
    .eq('status', 'active')

  await admin.from('organization_feature_overrides').insert({
    organization_id: order.organization_id,
    feature_key: 'feed_sync',
    included: true,
    availability_status: 'operative',
    status: 'active',
    source_addon_order_id: order.id,
  })

  await admin.from('addon_orders').update({
    status: 'active',
    feed_url: feedUrl,
    admin_notes: notes || null,
    approved_at: new Date().toISOString(),
    approved_by: adminId,
    updated_at: new Date().toISOString(),
  }).eq('id', order.id)

  revalidateAddonAdmin()
  revalidatePath('/dashboard/suscripcion')
  redirect('/admin/complementos?status=pending_activation')
}

export async function markAntifugaDelivered(formData: FormData) {
  const adminId = await assertAdmin()
  const orderId = formData.get('orderId') as string
  const notes = ((formData.get('admin_notes') as string | null) ?? '').trim()
  if (!orderId) return

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('addon_orders')
    .select('id, addon:addons(slug)')
    .eq('id', orderId)
    .maybeSingle()

  const addon = relationOne(order?.addon as unknown as { slug: string } | null)
  if (!order || addon?.slug !== 'antifuga_express') {
    revalidateAddonAdmin()
    redirect('/admin/complementos')
  }

  await admin.from('addon_orders').update({
    status: 'delivered',
    admin_notes: notes || null,
    delivered_at: new Date().toISOString(),
    delivered_by: adminId,
    updated_at: new Date().toISOString(),
  }).eq('id', order.id)

  revalidateAddonAdmin()
  redirect('/admin/complementos?status=pending_activation')
}
