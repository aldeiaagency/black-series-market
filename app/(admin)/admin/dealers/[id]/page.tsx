import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createHmac } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { DEALER_STATUS_LABELS, VEHICLE_STATUS_LABELS, getVehicleStatusColor, formatPrice, formatNumber, timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Car, MessageSquare, Eye, MapPin, Mail, Phone, Globe, CheckCircle, Clock, Shield, StickyNote, Trash2, AlertTriangle, Bot } from 'lucide-react'
import { provisionDealerAssistant, deactivateDealerAssistant } from '@/lib/integrations/n8n-assistant-provisioning'
import { pauseExcessActiveVehicles } from '@/lib/plan-transitions'
import DealerApiKeysPanel from './DealerApiKeysPanel'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Corrección 2026-09-04 (hallazgo de Codex, simulación E2E showroom-vs-administrador): de los 3
// eventos que manda wf-p3-onboarding-fundador (setup_required, setup_completed, profile_published),
// solo este último —el email final de "tu perfil ya está publicado"— se enviaba sin firmar y con
// una URL de webhook hardcodeada como fallback si faltaba la variable de entorno. Los otros dos ya
// se corrigieron en la auditoría P0.6 (2026-09-02); a este se le había quedado el patrón antiguo.
async function postJsonWithTimeout(url: string, body: { event: string } & Record<string, unknown>, secret: string) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 12_000)
  const webhookBody = JSON.stringify(body)
  const webhookTimestamp = new Date().toISOString()
  const webhookSignature = createHmac('sha256', secret).update(webhookBody).digest('hex')
  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-blacklabel-event': body.event,
        'x-blacklabel-timestamp': webhookTimestamp,
        'x-blacklabel-signature': `sha256=${webhookSignature}`,
      },
      body: webhookBody,
      signal: ctrl.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}


async function approveDealerAccess(formData: FormData) {
  'use server'
  const { assertAdmin } = await import('@/lib/admin-auth'); await assertAdmin()
  const dealerId   = formData.get('dealerId') as string
  const dealerName = formData.get('dealerName') as string
  const email      = formData.get('email') as string
  const supabase   = await createAdminClient()
  await supabase.from('dealers').update({ status: 'trial' }).eq('id', dealerId)

  const webhookUrl = process.env.N8N_WEBHOOK_DEALER_APPROVED
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dealer_id:    dealerId,
        dealer_name:  dealerName,
        email,
        approved_at:  new Date().toISOString(),
        dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      }),
    }).catch(() => {})
  }
  redirect(`/admin/dealers/${dealerId}`)
}

async function setDealerStatus(dealerId: string, status: string) {
  'use server'
  const { assertAdmin } = await import('@/lib/admin-auth'); await assertAdmin()
  const supabase = await createAdminClient()
  await supabase.from('dealers').update({ status }).eq('id', dealerId)
  revalidatePath(`/admin/dealers/${dealerId}`)
  redirect(`/admin/dealers/${dealerId}`)
}

async function setDealerPlan(dealerId: string, plan: string) {
  'use server'
  const { assertAdmin } = await import('@/lib/admin-auth'); await assertAdmin()
  const supabase = await createAdminClient()
  const slots = plan === 'elite' ? 100 : plan === 'professional' ? 50 : plan === 'essential' ? 15 : 5
  const isElite = plan === 'elite'
  const { data: dealerRow } = await supabase.from('dealers').select('name').eq('id', dealerId).maybeSingle()
  await supabase
    .from('dealers')
    .update({ subscription_plan: plan, vehicle_slots: slots, is_featured: isElite })
    .eq('id', dealerId)

  // Aprovisiona o desactiva el asistente dedicado (workflow n8n) según el plan de destino —
  // antes solo lo hacía la aprobación de alta/Stripe; un cambio de plan manual no lo tocaba.
  if (plan === 'professional' || plan === 'elite') {
    await provisionDealerAssistant(supabase, { dealerId, dealerName: dealerRow?.name || 'Showroom' })
  } else {
    await deactivateDealerAssistant(supabase, dealerId)
  }

  // Sync active subscription so getEntitlements() sees the new plan (subscription wins over legacy fallback)
  const { data: orgRow } = await supabase.from('organizations').select('id').eq('dealer_id', dealerId).single()
  if (orgRow) {
    await supabase
      .from('organizations')
      .update({
        is_featured: isElite,
        featured_since: isElite ? new Date().toISOString() : null,
      })
      .eq('id', orgRow.id)

    const { data: planRow } = await supabase.from('plans').select('id').eq('slug', plan).single()
    if (planRow) {
      await supabase
        .from('subscriptions')
        .update({ plan_id: planRow.id })
        .eq('organization_id', orgRow.id)
        .in('status', ['active', 'trialing', 'past_due'])
    }
  }

  await pauseExcessActiveVehicles(supabase, dealerId, slots)

  revalidatePath(`/admin/dealers/${dealerId}`)
  revalidatePath('/dealers')
  redirect(`/admin/dealers/${dealerId}`)
}

async function setDealerFeatured(dealerId: string, featured: boolean) {
  'use server'
  const { assertAdmin } = await import('@/lib/admin-auth'); await assertAdmin()
  const supabase = await createAdminClient()
  await supabase.from('dealers').update({ is_featured: featured }).eq('id', dealerId)
  revalidatePath(`/admin/dealers/${dealerId}`)
  redirect(`/admin/dealers/${dealerId}`)
}

async function saveAdminNotes(formData: FormData) {
  'use server'
  const { assertAdmin } = await import('@/lib/admin-auth'); await assertAdmin()
  const dealerId = formData.get('dealerId') as string
  const notes    = formData.get('admin_notes') as string
  const supabase = await createAdminClient()
  await supabase.from('dealers').update({ admin_notes: notes }).eq('id', dealerId)
  redirect(`/admin/dealers/${dealerId}`)
}

async function setVerification(formData: FormData) {
  'use server'
  const { assertAdmin } = await import('@/lib/admin-auth'); await assertAdmin()
  const dealerId    = formData.get('dealerId') as string
  const isVerified  = formData.get('is_verified') === 'true'
  const supabase    = await createAdminClient()
  await supabase.from('dealers').update({ is_verified: !isVerified }).eq('id', dealerId)
  revalidatePath(`/admin/dealers/${dealerId}`)
  redirect(`/admin/dealers/${dealerId}`)
}

async function publishDealerProfile(formData: FormData) {
  'use server'
  const { assertAdmin } = await import('@/lib/admin-auth'); await assertAdmin()
  const dealerId = formData.get('dealerId') as string
  const supabase = await createAdminClient()

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id, name, slug, logo_url, profile_status, email, profile:profiles(email, full_name)')
    .eq('id', dealerId)
    .maybeSingle()
  const { count: activeWithPhotoCount } = await supabase
    .from('vehicles')
    .select('id', { count: 'exact', head: true })
    .eq('dealer_id', dealerId)
    .eq('status', 'active')
    .not('images', 'eq', '[]')

  if (dealer?.profile_status === 'pending_review' && dealer.logo_url && (activeWithPhotoCount ?? 0) > 0) {
    const { error: publishError } = await supabase
      .from('dealers')
      .update({ profile_status: 'published', updated_at: new Date().toISOString() })
      .eq('id', dealerId)

    if (!publishError) {
      const profile = Array.isArray(dealer.profile) ? dealer.profile[0] : dealer.profile
      const email = dealer.email || profile?.email || null
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'
      const webhookUrl = process.env.N8N_WEBHOOK_FUNDADOR_ONBOARDING
      const webhookSecret = process.env.N8N_WEBHOOK_FUNDADOR_ONBOARDING_SECRET
      if (!webhookUrl || !webhookSecret) {
        console.error('profile_published webhook not sent: missing N8N_WEBHOOK_FUNDADOR_ONBOARDING(_SECRET)', { dealerId })
      } else {
        const payload = {
          event: 'profile_published',
          dealer_id: dealerId,
          dealer_name: dealer.name,
          email,
          dealer_slug: dealer.slug,
          public_url: `${appUrl}/dealers/${dealer.slug}`,
          // Mismo mecanismo que la llamada de admisión (markQualifiedAwaitingCall): vacío hasta
          // conectar el Google Calendar del market, sin bloquear el envío del email mientras tanto.
          booking_url: process.env.SHOWROOM_ADMISSION_CALL_BOOKING_URL ?? null,
        }

        try {
          const res = await postJsonWithTimeout(webhookUrl, payload, webhookSecret)
          if (!res.ok) console.error('profile_published webhook failed', { dealerId, status: res.status })
        } catch (error) {
          console.error('profile_published webhook failed', { dealerId, error })
        }
      }
    }
  }

  revalidatePath(`/admin/dealers/${dealerId}`)
  revalidatePath('/dealers')
  redirect(`/admin/dealers/${dealerId}`)
}

async function deleteDealer(formData: FormData) {
  'use server'
  const { assertAdmin } = await import('@/lib/admin-auth'); await assertAdmin()
  const dealerId     = formData.get('dealerId') as string
  const profileId    = formData.get('profileId') as string
  const expectedName = (formData.get('expectedName') as string || '').trim()
  const confirmName  = (formData.get('confirmName') as string || '').trim()

  if (!dealerId || !profileId || !expectedName || confirmName !== expectedName) {
    redirect(`/admin/dealers/${dealerId}?deleteError=1`)
  }

  const supabase = await createAdminClient()
  // Borra el usuario de auth — el resto (profiles, dealers, vehicles, leads, galería,
  // analytics, organización...) cae en cascada por las FK ON DELETE CASCADE del esquema.
  // No hay vuelta atrás: borra también su historial como comprador si lo tuviera.
  const { error } = await supabase.auth.admin.deleteUser(profileId)
  if (error) redirect(`/admin/dealers/${dealerId}?deleteError=1`)

  redirect('/admin/dealers')
}

async function saveProfile(formData: FormData) {
  'use server'
  const { assertAdmin } = await import('@/lib/admin-auth'); await assertAdmin()
  const dealerId = formData.get('dealerId') as string
  const supabase = await createAdminClient()
  await supabase.from('dealers').update({
    name:          (formData.get('name') as string)?.trim() || undefined,
    description:   (formData.get('description') as string)?.trim() || null,
    logo_url:      (formData.get('logo_url') as string)?.trim() || null,
    email:         (formData.get('email') as string)?.trim() || null,
    phone:         (formData.get('phone') as string)?.trim() || null,
    website:       (formData.get('website') as string)?.trim() || null,
    location_city: (formData.get('location_city') as string)?.trim() || null,
  }).eq('id', dealerId)
  revalidatePath(`/admin/dealers/${dealerId}`)
  redirect(`/admin/dealers/${dealerId}`)
}

export default async function AdminDealerDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { deleteError } = await searchParams
  // createAdminClient bypasses RLS for cross-showroom data access
  const supabase = await createAdminClient()

  const { data: dealer } = await supabase
    .from('dealers')
    .select('*, profile:profiles(email, created_at)')
    .eq('id', id)
    .single()

  if (!dealer) notFound()

  const { data: assistantConfig } = await supabase
    .from('showroom_assistant_config')
    .select('enabled, n8n_workflow_id, context')
    .eq('dealer_id', id)
    .maybeSingle()

  const { data: dealerApiKeys } = await supabase
    .from('dealer_api_keys')
    .select('id, label, created_at, last_used_at, revoked_at')
    .eq('dealer_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const d30 = thirtyDaysAgo.toISOString()

  const [
    { data: vehicles, count: vehicleCount },
    { count: activeCount },
    { count: pendingCount },
    { count: pausedCount },
    { count: soldCount },
    { count: draftCount },
    { data: leads, count: leadCount },
    { count: leads30dCount },
    { count: totalViews30d },
  ] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id, brand_name, model_name, year, price, status, views, vehicle_type, slug, created_at, images', { count: 'exact' })
      .eq('dealer_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('dealer_id', id).eq('status', 'active'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('dealer_id', id).eq('status', 'pending_review'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('dealer_id', id).eq('status', 'paused'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('dealer_id', id).eq('status', 'sold'),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('dealer_id', id).eq('status', 'draft'),
    supabase
      .from('leads')
      .select('id, buyer_name, buyer_email, status, created_at, vehicle:vehicles(brand_name, model_name)', { count: 'exact' })
      .eq('dealer_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('dealer_id', id).gte('created_at', d30),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true })
      .eq('dealer_id', id)
      .in('event_type', ['vehicle_view', 'view'])
      .gte('created_at', d30),
  ])

  const totalViews = vehicles?.reduce((sum: number, v: any) => sum + (v.views || 0), 0) || 0
  const firstActiveVehicle = vehicles?.find((v: any) => v.status === 'active' && v.images?.[0]?.url)

  const PLAN_OPTIONS = [
    { value: 'trial',        label: 'Trial (5 vehículos publicados)' },
    { value: 'essential',    label: 'Essential (15 vehículos publicados)' },
    { value: 'professional', label: 'Professional (50 vehículos publicados)' },
    { value: 'elite',        label: 'Elite (100 vehículos publicados)' },
  ]

  const STATUS_OPTIONS = [
    { value: 'pending',   label: 'Pendiente' },
    { value: 'trial',     label: 'Trial' },
    { value: 'active',    label: 'Activo' },
    { value: 'suspended', label: 'Suspendido' },
  ]

  const LEAD_STATUS_LABEL: Record<string, string> = {
    new:          'Nuevo',
    contacted:    'Contactado',
    negotiating:  'Contactado',
    appointment:  'Cita',
    reserved:     'Cita',
    closed:       'Ganado',
    lost:         'Perdido',
    discarded:    'Archivado',
  }
  const LEAD_STATUS_COLOR: Record<string, string> = {
    new:          'badge-gold',
    contacted:    'badge-muted',
    negotiating:  'badge-muted',
    appointment:  'badge-muted',
    reserved:     'badge-active',
    closed:       'badge-active',
    lost:         'badge-muted',
    discarded:    'badge-muted',
  }

  return (
    <div className="p-8">

      {/* Pending approval banner */}
      {dealer.status === 'pending' && (
        <div className="flex items-center justify-between gap-6 p-5 mb-8 border border-amber-400/30 bg-amber-400/5">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400 mb-0.5">Solicitud pendiente de aprobación</p>
              <p className="text-xs text-bsm-text-muted">
                {dealer.name} ha solicitado acceso. Verifica su reputación antes de aprobar.
                {dealer.profile?.email && (
                  <> Email: <a href={`mailto:${dealer.profile.email}`} className="text-gold hover:underline">{dealer.profile.email}</a></>
                )}
              </p>
            </div>
          </div>
          <form action={approveDealerAccess}>
            <input type="hidden" name="dealerId" value={id} />
            <input type="hidden" name="dealerName" value={dealer.name} />
            <input type="hidden" name="email" value={dealer.profile?.email || ''} />
            <button type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors flex-shrink-0">
              <CheckCircle className="w-4 h-4" />
              Aprobar acceso
            </button>
          </form>
        </div>
      )}

      {/* Profile publication review */}
      {dealer.profile_status === 'pending_review' && (
        <div className="mb-8 border border-gold/35 bg-gold/5 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              {dealer.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dealer.logo_url} alt={dealer.name} className="h-14 w-14 bg-obsidian object-contain p-2 border border-gold/20" />
              ) : (
                <AlertTriangle className="mt-1 h-5 w-5 text-amber-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gold">Perfil listo para revisión humana</p>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-bsm-text-muted">
                  El gate mínimo ya se cumple: logo y al menos una unidad activa con fotografía. Revisa el perfil y la primera unidad antes de publicar la página del showroom.
                </p>
                {firstActiveVehicle && (
                  <div className="mt-3 flex items-center gap-3 text-xs text-bsm-text-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={firstActiveVehicle.images[0].url} alt="" className="h-10 w-14 object-cover border border-bsm-border" />
                    <span>{firstActiveVehicle.brand_name} {firstActiveVehicle.model_name} · {firstActiveVehicle.year}</span>
                    <Link href={`/admin/vehiculos?dealer=${id}&status=active`} className="text-gold hover:text-gold-light">Ver inventario →</Link>
                  </div>
                )}
              </div>
            </div>
            <form action={publishDealerProfile}>
              <input type="hidden" name="dealerId" value={id} />
              <button type="submit" className="btn-gold px-5 py-2.5 text-sm">
                <CheckCircle className="h-4 w-4" /> Publicar perfil
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/dealers" className="flex items-center gap-1.5 text-sm text-bsm-text-muted hover:text-gold transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a showrooms
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {dealer.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dealer.logo_url} alt={dealer.name} className="w-16 h-16 object-contain bg-surface-elevated border border-bsm-border p-2" />
            ) : (
              <div className="w-16 h-16 bg-surface-elevated border border-bsm-border flex items-center justify-center">
                <span className="font-display text-2xl text-gold">{dealer.name?.[0]}</span>
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl font-light mb-1">{dealer.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-bsm-text-muted">
                {dealer.location_city && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{dealer.location_city}</span>
                )}
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{dealer.email || dealer.profile?.email}</span>
                {dealer.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{dealer.phone}</span>
                )}
                {dealer.website && (
                  <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gold">
                    <Globe className="w-3.5 h-3.5" />Web
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`badge text-[10px] ${dealer.status === 'active' ? 'badge-active' : dealer.status === 'pending' ? 'badge-pending' : 'badge-muted'}`}>
                  {DEALER_STATUS_LABELS[dealer.status as keyof typeof DEALER_STATUS_LABELS] || dealer.status}
                </span>
                <span className="badge badge-muted text-[10px] capitalize">{dealer.subscription_plan || 'trial'}</span>
                {dealer.is_featured && <span className="badge badge-gold text-[10px]">Destacado</span>}
                {dealer.is_verified && <span className="badge badge-active text-[10px]">✓ Verificado</span>}
                <Link href={`/dealers/${dealer.slug}`} target="_blank" className="text-xs text-gold hover:text-gold-light">
                  Ver perfil público →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 flex-wrap">
            {[
              { icon: Car,           value: vehicleCount || 0,  label: 'Vehículos' },
              { icon: Eye,           value: totalViews,          label: 'Vistas totales' },
              { icon: MessageSquare, value: leadCount || 0,      label: 'Contactos' },
              { icon: MessageSquare, value: leads30dCount || 0,  label: 'Contactos 30d' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-bsm-text-muted mb-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="font-display text-2xl font-light">{formatNumber(value)}</div>
                <div className="text-[10px] text-bsm-text-muted uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Controls */}
        <div className="space-y-5">

          {/* Status */}
          <div className="bg-surface border border-bsm-border p-5">
            <h3 className="text-xs font-medium mb-4 uppercase tracking-wide text-bsm-text-muted">Estado de cuenta</h3>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => (
                <form key={opt.value} action={setDealerStatus.bind(null, id, opt.value)}>
                  <button type="submit"
                    className={`w-full text-left text-sm px-3 py-2 border transition-colors
                      ${dealer.status === opt.value
                        ? 'border-gold text-gold bg-gold/5'
                        : 'border-bsm-border text-bsm-text-secondary hover:border-bsm-border-light'}`}>
                    {opt.label}
                  </button>
                </form>
              ))}
            </div>
          </div>

          {/* Plan */}
          <div className="bg-surface border border-bsm-border p-5">
            <h3 className="text-xs font-medium mb-4 uppercase tracking-wide text-bsm-text-muted">Plan de suscripción</h3>
            <div className="space-y-2">
              {PLAN_OPTIONS.map((opt) => (
                <form key={opt.value} action={setDealerPlan.bind(null, id, opt.value)}>
                  <button type="submit"
                    className={`w-full text-left text-sm px-3 py-2 border transition-colors
                      ${dealer.subscription_plan === opt.value || (!dealer.subscription_plan && opt.value === 'trial')
                        ? 'border-gold text-gold bg-gold/5'
                        : 'border-bsm-border text-bsm-text-secondary hover:border-bsm-border-light'}`}>
                    {opt.label}
                  </button>
                </form>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-bsm-border text-xs text-bsm-text-muted">
              Vehículos publicados: <span className="text-bsm-text-primary">{activeCount ?? 0} / {dealer.vehicle_slots ?? '—'}</span>
            </div>
          </div>

          <DealerApiKeysPanel dealerId={id} keys={dealerApiKeys ?? []} />

          {/* Asistente IA — solo lectura */}
          <div className="bg-surface border border-bsm-border p-5">
            <h3 className="text-xs font-medium mb-3 uppercase tracking-wide text-bsm-text-muted">Asistente de cualificación</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge text-[10px] ${assistantConfig?.enabled ? 'badge-active' : 'badge-muted'}`}>
                {assistantConfig?.enabled ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {assistantConfig?.n8n_workflow_id ? (
              <a
                href={`https://aldeia-n8n.giuxk6.easypanel.host/workflow/${assistantConfig.n8n_workflow_id}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gold hover:text-gold-light"
              >
                <Bot className="w-3.5 h-3.5" />
                Ver workflow dedicado en n8n
              </a>
            ) : (
              <p className="text-xs text-bsm-text-muted">Usando el agente compartido (sin workflow propio todavía).</p>
            )}
          </div>

          {/* Featured + Verified */}
          <div className="bg-surface border border-bsm-border p-5 space-y-3">
            <h3 className="text-xs font-medium mb-1 uppercase tracking-wide text-bsm-text-muted">Visibilidad y verificación</h3>
            <form action={setDealerFeatured.bind(null, id, !dealer.is_featured)}>
              <button type="submit"
                className={`w-full text-sm px-3 py-2 border transition-colors
                  ${dealer.is_featured
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-bsm-border text-bsm-text-secondary hover:border-bsm-border-light'}`}>
                {dealer.is_featured ? '★ Quitar destacado' : '☆ Marcar como destacado'}
              </button>
            </form>
            <form action={setVerification}>
              <input type="hidden" name="dealerId" value={id} />
              <input type="hidden" name="is_verified" value={String(dealer.is_verified)} />
              <button type="submit"
                className={`w-full text-sm px-3 py-2 border transition-colors
                  ${dealer.is_verified
                    ? 'border-emerald-400/50 text-emerald-400 bg-emerald-400/5'
                    : 'border-bsm-border text-bsm-text-secondary hover:border-bsm-border-light'}`}>
                {dealer.is_verified ? '✓ Verificado Black Label' : 'Marcar como verificado'}
              </button>
            </form>
          </div>

          {/* Verification checklist */}
          <div className="bg-surface border border-bsm-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-gold/60" />
              <h3 className="text-xs font-medium uppercase tracking-wide text-bsm-text-muted">Checklist de verificación</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { key: 'identity',   label: 'Identidad comercial revisada' },
                { key: 'address',    label: 'Dirección verificada' },
                { key: 'contact',    label: 'Teléfono/email públicos' },
                { key: 'web',        label: 'Web o presencia online' },
                { key: 'stock',      label: 'Tipo de stock validado' },
                { key: 'photos',     label: 'Calidad de fotos aceptable' },
                { key: 'reputation', label: 'Reputación online revisada' },
              ].map((item) => {
                const certs: string[] = dealer.certifications || []
                const checked = certs.includes(item.key)
                return (
                  <div key={item.key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0
                      ${checked ? 'border-emerald-400 bg-emerald-400/20' : 'border-bsm-border'}`}>
                      {checked && <CheckCircle className="w-2 h-2 text-emerald-400" />}
                    </div>
                    <span className={`text-xs ${checked ? 'text-bsm-text-secondary' : 'text-bsm-text-muted'}`}>
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-[10px] text-bsm-text-muted mt-3">
              El estado &quot;verificado&quot; se gestiona con el botón de arriba. Este checklist es orientativo.
            </p>
          </div>

          {/* Admin notes */}
          <div className="bg-surface border border-bsm-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-gold/60" />
              <h3 className="text-xs font-medium uppercase tracking-wide text-bsm-text-muted">Notas internas</h3>
            </div>
            <form action={saveAdminNotes}>
              <input type="hidden" name="dealerId" value={id} />
              <textarea
                name="admin_notes"
                rows={4}
                defaultValue={dealer.admin_notes || ''}
                placeholder="Solo visible para admins..."
                className="w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary p-2 resize-none focus:outline-none focus:border-gold/50 transition-colors"
              />
              <button type="submit"
                className="mt-2 text-xs px-3 py-1.5 border border-bsm-border text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-colors">
                Guardar notas
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="bg-surface border border-bsm-border p-5 space-y-3 text-sm">
            <h3 className="text-xs font-medium mb-1 uppercase tracking-wide text-bsm-text-muted">Información</h3>
            <div className="flex justify-between">
              <span className="text-bsm-text-muted text-xs">Registrado</span>
              <span className="text-bsm-text-primary text-xs">{new Date(dealer.created_at).toLocaleDateString('es-ES')}</span>
            </div>
            {dealer.years_in_business && (
              <div className="flex justify-between">
                <span className="text-bsm-text-muted text-xs">Años en negocio</span>
                <span className="text-bsm-text-primary text-xs">{dealer.years_in_business}</span>
              </div>
            )}
            {dealer.stripe_customer_id && (
              <div className="flex justify-between">
                <span className="text-bsm-text-muted text-xs">Stripe ID</span>
                <span className="text-[11px] text-bsm-text-muted font-mono">{dealer.stripe_customer_id.slice(0, 14)}…</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-bsm-text-muted text-xs">Vistas 30d</span>
              <span className="text-bsm-text-primary text-xs">{formatNumber(totalViews30d || 0)}</span>
            </div>
          </div>
        </div>

        {/* Right: Vehicles & Contacts */}
        <div className="lg:col-span-2 space-y-6">

          {/* Inventory breakdown */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: 'Activos',   count: activeCount  ?? 0, color: 'text-emerald-400', status: 'active' },
              { label: 'Revisión',  count: pendingCount ?? 0, color: 'text-amber-400',   status: 'pending_review' },
              { label: 'Reservado', count: pausedCount  ?? 0, color: 'text-gold',         status: 'paused' },
              { label: 'Vendidos',  count: soldCount    ?? 0, color: 'text-bsm-text-muted', status: 'sold' },
              { label: 'Borradores',count: draftCount   ?? 0, color: 'text-bsm-text-muted', status: 'draft' },
            ].map((item) => (
              <Link
                key={item.label}
                href={`/admin/vehiculos?status=${item.status}&dealer=${id}`}
                className="bg-surface border border-bsm-border p-3 text-center hover:border-gold/20 transition-colors"
              >
                <div className={`font-display text-xl font-light ${item.color}`}>{item.count}</div>
                <div className="text-[10px] text-bsm-text-muted mt-0.5">{item.label}</div>
              </Link>
            ))}
          </div>

          {/* Vehicles table */}
          <div className="bg-surface border border-bsm-border">
            <div className="flex items-center justify-between p-5 border-b border-bsm-border">
              <h2 className="font-medium">Inventario ({vehicleCount})</h2>
              <Link href={`/admin/vehiculos?dealer=${id}`} className="text-xs text-gold">
                Ver todos →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bsm-border">
                    {['Vehículo', 'Precio', 'Estado', 'Vistas', 'Fecha'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles?.map((v: any) => (
                    <tr key={v.id} className="table-row">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-8 bg-surface-elevated overflow-hidden flex-shrink-0">
                            {v.images?.[0] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={v.images[0].url} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-bsm-text-primary">{v.brand_name} {v.model_name}</p>
                            <p className="text-xs text-bsm-text-muted">{v.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-bsm-text-primary">{formatPrice(v.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[10px] ${getVehicleStatusColor(v.status)}`}>
                          {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-bsm-text-muted">{formatNumber(v.views || 0)}</td>
                      <td className="px-4 py-3 text-bsm-text-muted text-xs">{timeAgo(v.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!vehicles || vehicles.length === 0) && (
                <div className="p-8 text-center text-sm text-bsm-text-muted">Sin vehículos publicados</div>
              )}
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-surface border border-bsm-border">
            <div className="flex items-center justify-between p-5 border-b border-bsm-border">
              <h2 className="font-medium">Contactos recientes ({leadCount ?? 0})</h2>
              <Link href={`/admin/contactos?dealer=${id}`} className="text-xs text-gold">
                Ver todos →
              </Link>
            </div>
            <div className="divide-y divide-bsm-border">
              {leads?.map((lead: any) => (
                <div key={lead.id} className="flex items-start justify-between px-5 py-3.5 gap-4">
                  <div>
                    <p className="text-sm font-medium text-bsm-text-primary">{lead.buyer_name}</p>
                    <p className="text-xs text-bsm-text-muted">{lead.buyer_email}</p>
                    {lead.vehicle && (
                      <p className="text-xs text-bsm-text-muted mt-0.5">
                        → {lead.vehicle.brand_name} {lead.vehicle.model_name}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`badge text-[10px] ${LEAD_STATUS_COLOR[lead.status] || 'badge-muted'}`}>
                      {LEAD_STATUS_LABEL[lead.status] || lead.status}
                    </span>
                    <p className="text-[10px] text-bsm-text-muted mt-1">{timeAgo(lead.created_at)}</p>
                  </div>
                </div>
              ))}
              {(!leads || leads.length === 0) && (
                <div className="p-8 text-center text-sm text-bsm-text-muted">Sin contactos registrados</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile editor */}
      <div className="mt-8 bg-surface border border-bsm-border">
        <div className="p-5 border-b border-bsm-border">
          <h2 className="font-medium text-sm">Editar perfil del showroom</h2>
          <p className="text-xs text-bsm-text-muted mt-0.5">Datos visibles en la ficha pública · los cambios son inmediatos</p>
        </div>
        <form action={saveProfile} className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <input type="hidden" name="dealerId" value={id} />
          <div>
            <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Nombre del showroom</label>
            <input type="text" name="name" defaultValue={dealer.name || ''} required
              className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Email de contacto</label>
            <input type="email" name="email" defaultValue={dealer.email || ''}
              className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Teléfono</label>
            <input type="text" name="phone" defaultValue={dealer.phone || ''}
              className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Web</label>
            <input type="text" name="website" defaultValue={dealer.website || ''}
              className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Ciudad</label>
            <input type="text" name="location_city" defaultValue={dealer.location_city || ''}
              className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">URL del logo</label>
            <input type="text" name="logo_url" defaultValue={dealer.logo_url || ''}
              className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors" />
          </div>
          <div className="lg:col-span-2">
            <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">Descripción</label>
            <textarea name="description" rows={4} defaultValue={dealer.description || ''}
              className="mt-1 w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary p-2.5 resize-none focus:outline-none focus:border-gold/50 transition-colors" />
          </div>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit"
              className="text-xs px-4 py-2 border border-bsm-border text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-colors">
              Guardar perfil
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone — borrado permanente */}
      <div className="mt-8 border border-red-500/30 bg-red-500/5">
        <div className="p-5 border-b border-red-500/20 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="font-medium text-sm text-red-400">Zona de peligro</h2>
        </div>
        <div className="p-5">
          {deleteError && (
            <p className="text-xs text-red-400 mb-4">
              El nombre escrito no coincide (o faltó algún dato) — no se ha borrado nada. Inténtalo de nuevo.
            </p>
          )}
          <p className="text-xs text-bsm-text-muted mb-4 max-w-2xl">
            Elimina permanentemente esta cuenta: usuario, perfil, showroom, vehículos, contactos, galería y estadísticas
            asociadas. <strong className="text-red-400">No se puede deshacer.</strong> Úsalo solo para dar de baja
            cuentas de prueba o showrooms que se van definitivamente — no para pausar una cuenta (usa el estado
            &quot;Suspendido&quot; arriba para eso).
          </p>
          <form action={deleteDealer} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input type="hidden" name="dealerId" value={id} />
            <input type="hidden" name="profileId" value={dealer.profile_id} />
            <input type="hidden" name="expectedName" value={dealer.name || ''} />
            <div>
              <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">
                Escribe &quot;{dealer.name}&quot; para confirmar
              </label>
              <input type="text" name="confirmName" required autoComplete="off"
                className="mt-1 w-full sm:w-72 bg-surface-elevated border border-red-500/30 text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-red-400 transition-colors" />
            </div>
            <button type="submit"
              className="flex items-center gap-2 px-4 py-2 mt-1 sm:mt-5 bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar showroom definitivamente
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
