import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { timeAgo } from '@/lib/utils'
import { ArrowRight, Clock } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

const STATUS_FLOW = ['new', 'in_review', 'pending_info', 'approved', 'rejected'] as const
type ApplicationStatus = (typeof STATUS_FLOW)[number]

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  new: 'Nueva',
  in_review: 'En revisión',
  pending_info: 'Pend. info',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  new: 'text-gold bg-gold/10 border-gold/30',
  in_review: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  pending_info: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  approved: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/30',
}

export default async function AdminShowroomApplicationsPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const admin = createAdminClient()

  let query = admin
    .from('showroom_applications')
    .select('id, dealer_name, full_name, email, location_city, location_region, status, created_at, website, google_business_url, instagram_url, portales, portal_url')
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
  const pending = (counts['new'] || 0) + (counts['in_review'] || 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Altas de showroom</h1>
          <p className="text-sm text-bsm-text-muted">
            {total} solicitudes en total
            {pending > 0 && (
              <span className="ml-2 text-gold font-medium">· {pending} pendiente{pending !== 1 ? 's' : ''} de revisión</span>
            )}
          </p>
        </div>
      </div>

      {/* Status filters */}
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

      {/* List */}
      <div className="border border-bsm-border divide-y divide-bsm-border">
        {(applications || []).length === 0 && (
          <div className="p-12 text-center">
            <Clock className="w-8 h-8 text-bsm-text-muted/30 mx-auto mb-3" />
            <p className="text-sm text-bsm-text-muted">No hay solicitudes con este estado.</p>
          </div>
        )}

        {(applications || []).map((app: any) => {
          const st = (app.status as ApplicationStatus) || 'new'
          const hasGoogle = !!app.google_business_url
          const hasIG = !!app.instagram_url
          const hasWeb = !!app.website
          const hasPortal = Array.isArray(app.portales) ? app.portales.length > 0 : !!app.portal_url
          const urlCount = [hasGoogle, hasIG, hasWeb, hasPortal].filter(Boolean).length

          return (
            <Link
              key={app.id}
              href={`/admin/altas-showroom/${app.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-surface/60 transition-colors group"
            >
              {/* Status badge */}
              <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 border uppercase tracking-wide ${STATUS_BADGE[st]}`}>
                {STATUS_LABEL[st]}
              </span>

              {/* Name + contact */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-bsm-text-primary truncate group-hover:text-gold transition-colors">
                  {app.dealer_name}
                </p>
                <p className="text-xs text-bsm-text-muted truncate">
                  {app.full_name} · {[app.location_city, app.location_region].filter(Boolean).join(', ')}
                </p>
              </div>

              {/* Email */}
              <span className="hidden lg:block text-xs text-bsm-text-secondary truncate max-w-[200px]">
                {app.email}
              </span>

              {/* URL indicators */}
              <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                {urlCount === 0 ? (
                  <span className="text-[10px] text-red-400/60 border border-red-400/20 px-1.5 py-0.5">sin URLs</span>
                ) : (
                  <>
                    {hasGoogle && <span className="text-[10px] px-1.5 py-0.5 border border-emerald-400/30 text-emerald-400 bg-emerald-400/5">G</span>}
                    {hasIG    && <span className="text-[10px] px-1.5 py-0.5 border border-purple-400/30 text-purple-400 bg-purple-400/5">IG</span>}
                    {hasWeb   && <span className="text-[10px] px-1.5 py-0.5 border border-blue-400/30 text-blue-400 bg-blue-400/5">W</span>}
                    {hasPortal && <span className="text-[10px] px-1.5 py-0.5 border border-gold/30 text-gold bg-gold/5">P</span>}
                  </>
                )}
              </div>

              {/* Time */}
              <span className="flex-shrink-0 text-xs text-bsm-text-muted">{timeAgo(app.created_at)}</span>

              <ArrowRight className="w-3.5 h-3.5 text-bsm-text-muted/40 group-hover:text-gold transition-colors flex-shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
