import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { slugify, timeAgo } from '@/lib/utils'
import { CheckCircle, Clock, ExternalLink, Mail, MapPin, Phone, XCircle } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

const STATUS_FLOW = ['new', 'in_review', 'approved', 'rejected'] as const
type ApplicationStatus = (typeof STATUS_FLOW)[number]

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  new: 'Nueva',
  in_review: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  new: 'text-gold bg-gold/10 border-gold/30',
  in_review: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  approved: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/30',
}

function temporaryPassword() {
  return `BLM-${randomBytes(10).toString('base64url')}`
}

async function currentAdminId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

async function setApplicationStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  if (!id || !['new', 'in_review'].includes(status)) return

  const admin = createAdminClient()
  await admin
    .from('showroom_applications')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/admin/altas-showroom')
}

async function saveNotes(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const adminNotes = formData.get('admin_notes') as string
  if (!id) return

  const admin = createAdminClient()
  await admin
    .from('showroom_applications')
    .update({ admin_notes: adminNotes, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin/altas-showroom')
}

async function approveApplication(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  if (!id) return

  const admin = createAdminClient()
  const { data: application } = await admin
    .from('showroom_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!application || application.status === 'approved') return

  const password = temporaryPassword()
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
        admin_notes: `${application.admin_notes || ''}\nError al aprobar: ${authError?.message || 'No se pudo crear el usuario.'}`.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    revalidatePath('/admin/altas-showroom')
    return
  }

  const userId = authData.user.id
  const slug = `${slugify(application.dealer_name)}-${Math.random().toString(36).slice(2, 8)}`

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    email: application.email,
    full_name: application.full_name,
    role: 'dealer',
  }, { onConflict: 'id' })

  const { data: dealer, error: dealerError } = profileError
    ? { data: null, error: profileError }
    : await admin.from('dealers').insert({
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
      }).select('id').single()

  if (dealerError || !dealer) {
    await admin.auth.admin.deleteUser(userId)
    await admin
      .from('showroom_applications')
      .update({
        admin_notes: `${application.admin_notes || ''}\nError al aprobar: no se pudo crear el showroom.`.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    revalidatePath('/admin/altas-showroom')
    return
  }

  const reviewedBy = await currentAdminId()
  await admin
    .from('showroom_applications')
    .update({
      status: 'approved',
      dealer_id: dealer.id,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  const webhookUrl = process.env.N8N_WEBHOOK_DEALER_APPROVED
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: id,
        dealer_id: dealer.id,
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

  revalidatePath('/admin/altas-showroom')
  revalidatePath('/admin/dealers')
}

async function rejectApplication(formData: FormData) {
  'use server'
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
    await fetch(webhookUrl, {
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

  revalidatePath('/admin/altas-showroom')
}

export default async function AdminShowroomApplicationsPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const admin = createAdminClient()

  let query = admin
    .from('showroom_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (status && STATUS_FLOW.includes(status as ApplicationStatus)) {
    query = query.eq('status', status)
  }

  const [{ data: applications }, { data: allForCounts }] = await Promise.all([
    query,
    admin.from('showroom_applications').select('status'),
  ])

  const counts: Record<string, number> = {}
  for (const item of (allForCounts || []) as { status: string }[]) {
    counts[item.status] = (counts[item.status] || 0) + 1
  }
  const total = (allForCounts || []).length

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light mb-1">Altas de showroom</h1>
        <p className="text-sm text-bsm-text-muted">
          Solicitudes profesionales pendientes de revisión manual · {total} en total
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/altas-showroom"
          className={`px-3 py-1.5 text-xs border transition-colors ${
            !status ? 'border-gold/40 text-gold bg-gold/5' : 'border-bsm-border text-bsm-text-muted hover:text-bsm-text-primary'
          }`}
        >
          Todas ({total})
        </Link>
        {STATUS_FLOW.map((item) => (
          <Link
            key={item}
            href={`/admin/altas-showroom?status=${item}`}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              status === item ? 'border-gold/40 text-gold bg-gold/5' : 'border-bsm-border text-bsm-text-muted hover:text-bsm-text-primary'
            }`}
          >
            {STATUS_LABEL[item]} ({counts[item] || 0})
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {(applications || []).length === 0 && (
          <div className="border border-bsm-border bg-surface p-12 text-center">
            <Clock className="w-8 h-8 text-bsm-text-muted/30 mx-auto mb-3" />
            <p className="text-sm text-bsm-text-muted">No hay solicitudes con este estado.</p>
          </div>
        )}

        {(applications || []).map((application: any) => {
          const st = (application.status as ApplicationStatus) || 'new'
          return (
            <div key={application.id} className="border border-bsm-border bg-surface p-5">
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-base font-medium text-bsm-text-primary">{application.dealer_name}</h2>
                    <span className={`text-[10px] px-2 py-0.5 border uppercase tracking-wide ${STATUS_BADGE[st]}`}>
                      {STATUS_LABEL[st]}
                    </span>
                    <span className="text-[11px] text-bsm-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(application.created_at)}
                    </span>
                  </div>

                  <div className="grid gap-2 text-xs text-bsm-text-secondary sm:grid-cols-2 lg:grid-cols-4">
                    <span>{application.full_name}</span>
                    <a href={`mailto:${application.email}`} className="flex items-center gap-1.5 hover:text-gold">
                      <Mail className="w-3.5 h-3.5 text-bsm-text-muted" /> {application.email}
                    </a>
                    <a href={`tel:${application.phone}`} className="flex items-center gap-1.5 hover:text-gold">
                      <Phone className="w-3.5 h-3.5 text-bsm-text-muted" /> {application.phone}
                    </a>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-bsm-text-muted" />
                      {[application.location_city, application.location_region].filter(Boolean).join(', ')}
                    </span>
                  </div>

                  {application.website && (
                    <a
                      href={application.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light"
                    >
                      Revisar presencia online <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {application.message && (
                    <p className="text-xs text-bsm-text-muted bg-obsidian border border-bsm-border p-3 leading-relaxed">
                      {application.message}
                    </p>
                  )}

                  <form action={saveNotes} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={application.id} />
                    <textarea
                      name="admin_notes"
                      rows={3}
                      defaultValue={application.admin_notes || ''}
                      placeholder="Notas internas de investigación..."
                      className="w-full bg-obsidian border border-bsm-border text-xs text-bsm-text-secondary p-3 resize-none focus:outline-none focus:border-gold/50"
                    />
                    <button type="submit" className="self-start btn-outline text-xs px-3 py-1.5">
                      Guardar notas
                    </button>
                  </form>
                </div>

                <div className="flex flex-col gap-2 xl:w-52">
                  {st === 'new' && (
                    <form action={setApplicationStatus}>
                      <input type="hidden" name="id" value={application.id} />
                      <input type="hidden" name="status" value="in_review" />
                      <button type="submit" className="btn-outline w-full justify-center text-xs">
                        Marcar en revisión
                      </button>
                    </form>
                  )}

                  {st !== 'approved' && st !== 'rejected' && (
                    <>
                      <form action={approveApplication}>
                        <input type="hidden" name="id" value={application.id} />
                        <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Aprobar y crear acceso
                        </button>
                      </form>
                      <form action={rejectApplication}>
                        <input type="hidden" name="id" value={application.id} />
                        <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-400/30 text-red-400 text-xs hover:bg-red-400/5 transition-colors">
                          <XCircle className="w-3.5 h-3.5" />
                          Rechazar
                        </button>
                      </form>
                    </>
                  )}

                  {application.dealer_id && (
                    <Link href={`/admin/dealers/${application.dealer_id}`} className="btn-outline w-full justify-center text-xs">
                      Ver showroom creado
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
