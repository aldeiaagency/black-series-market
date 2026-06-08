import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { timeAgo } from '@/lib/utils'
import { ClipboardList, Mail, Phone, MapPin, Car, Wallet, Clock } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

const STATUS_FLOW = ['new', 'in_review', 'contacted', 'matched', 'closed', 'discarded'] as const
type ReqStatus = (typeof STATUS_FLOW)[number]

const STATUS_LABEL: Record<ReqStatus, string> = {
  new: 'Nueva', in_review: 'En revisión', contacted: 'Contactado',
  matched: 'Match', closed: 'Cerrada', discarded: 'Descartada',
}
const STATUS_BADGE: Record<ReqStatus, string> = {
  new:       'text-gold bg-gold/10 border-gold/30',
  in_review: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  contacted: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  matched:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  closed:    'text-bsm-text-muted bg-surface-elevated border-bsm-border',
  discarded: 'text-red-400 bg-red-400/10 border-red-400/30',
}

const VEHICLE_TYPE_LABEL: Record<string, string> = {
  car: 'Coche', motorcycle: 'Moto', any: 'Indiferente',
}
const TIMEFRAME_LABEL: Record<string, string> = {
  immediate: 'Inmediata', '1_3_months': '1-3 meses', '3_6_months': '3-6 meses', exploring: 'Explorando',
}

async function updateStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  if (!id || !STATUS_FLOW.includes(status as ReqStatus)) return
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = createAdminClient()
  await supabase.from('custom_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/admin/solicitudes')
}

export default async function AdminSolicitudesPage({ searchParams }: PageProps) {
  const { status: statusFilter } = await searchParams
  const supabase = createAdminClient()

  let query = supabase
    .from('custom_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (statusFilter && STATUS_FLOW.includes(statusFilter as ReqStatus)) {
    query = query.eq('status', statusFilter)
  }

  const [{ data: requests }, { data: allForCounts }] = await Promise.all([
    query,
    supabase.from('custom_requests').select('status'),
  ])

  const counts: Record<string, number> = {}
  for (const r of (allForCounts || []) as any[]) counts[r.status] = (counts[r.status] || 0) + 1
  const total = (allForCounts || []).length

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light mb-1 flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-gold" />
          Solicitudes a la carta
        </h1>
        <p className="text-sm text-bsm-text-muted">
          Búsquedas de vehículos enviadas por compradores · {total} en total
        </p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/solicitudes"
          className={`px-3 py-1.5 text-xs border transition-colors ${
            !statusFilter ? 'border-gold/40 text-gold bg-gold/5' : 'border-bsm-border text-bsm-text-muted hover:text-bsm-text-primary'
          }`}
        >
          Todas ({total})
        </a>
        {STATUS_FLOW.map((s) => (
          <a
            key={s}
            href={`/admin/solicitudes?status=${s}`}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              statusFilter === s ? 'border-gold/40 text-gold bg-gold/5' : 'border-bsm-border text-bsm-text-muted hover:text-bsm-text-primary'
            }`}
          >
            {STATUS_LABEL[s]} ({counts[s] || 0})
          </a>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {(requests || []).length === 0 && (
          <div className="border border-bsm-border bg-surface p-12 text-center">
            <ClipboardList className="w-8 h-8 text-bsm-text-muted/30 mx-auto mb-3" />
            <p className="text-sm text-bsm-text-muted">No hay solicitudes con este estado.</p>
          </div>
        )}

        {(requests || []).map((r: any) => {
          const st = (r.status as ReqStatus) || 'new'
          return (
            <div key={r.id} className="border border-bsm-border bg-surface p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                {/* Left: contact + request */}
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-bsm-text-primary">{r.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 border uppercase tracking-wide ${STATUS_BADGE[st]}`}>
                      {STATUS_LABEL[st]}
                    </span>
                    <span className="text-[11px] text-bsm-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(r.created_at)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-bsm-text-secondary">
                    <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 hover:text-gold">
                      <Mail className="w-3.5 h-3.5 text-bsm-text-muted" /> {r.email}
                    </a>
                    {r.phone && (
                      <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 hover:text-gold">
                        <Phone className="w-3.5 h-3.5 text-bsm-text-muted" /> {r.phone}
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-bsm-text-secondary pt-1">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-bsm-text-muted" />
                      {[VEHICLE_TYPE_LABEL[r.vehicle_type] || r.vehicle_type, r.brand, r.model, r.version]
                        .filter(Boolean).join(' · ') || 'Sin especificar'}
                    </span>
                    {r.budget_text && (
                      <span className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-bsm-text-muted" /> {r.budget_text}
                      </span>
                    )}
                    {r.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-bsm-text-muted" /> {r.location}
                      </span>
                    )}
                    {r.timeframe && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-bsm-text-muted" />
                        {TIMEFRAME_LABEL[r.timeframe] || r.timeframe}
                      </span>
                    )}
                  </div>

                  {r.message && (
                    <p className="text-xs text-bsm-text-muted bg-obsidian border border-bsm-border p-3 leading-relaxed">
                      {r.message}
                    </p>
                  )}
                </div>

                {/* Right: status changer */}
                <form action={updateStatus} className="flex items-center gap-2 flex-shrink-0">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="status" defaultValue={st} className="select-base text-xs py-1.5 w-36">
                    {STATUS_FLOW.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <button type="submit" className="btn-outline text-xs px-3 py-1.5 whitespace-nowrap">
                    Actualizar
                  </button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
