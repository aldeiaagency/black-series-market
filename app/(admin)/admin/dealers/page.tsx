import { createClient } from '@/lib/supabase/server'
import { DEALER_STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { Search } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>
}

export default async function AdminDealersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { count: pendingCount } = await supabase
    .from('dealers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  let query = supabase
    .from('dealers')
    .select('*, profile:profiles(email)', { count: 'exact' })
    .order('status', { ascending: true }) // pending first
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)
  if (params.search) query = query.ilike('name', `%${params.search}%`)

  const { data: dealers, count } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Concesionarios</h1>
          <p className="text-sm text-bsm-text-muted">{count} registrados</p>
        </div>
        {(pendingCount ?? 0) > 0 && (
          <Link
            href="/admin/dealers?status=pending"
            className="flex items-center gap-2 px-4 py-2.5 border border-amber-400/30 bg-amber-400/5 text-amber-400 text-sm hover:bg-amber-400/10 transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center justify-center">
              {pendingCount}
            </span>
            Solicitud{pendingCount !== 1 ? 'es' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {['all', 'pending', 'trial', 'active', 'suspended'].map((s) => (
          <Link
            key={s}
            href={s === 'all' ? '/admin/dealers' : `/admin/dealers?status=${s}`}
            className={`text-xs px-3 py-1.5 border transition-colors capitalize
              ${(params.status === s || (!params.status && s === 'all'))
                ? 'border-gold text-gold bg-gold/5'
                : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
          >
            {s === 'all' ? 'Todos' : DEALER_STATUS_LABELS[s as keyof typeof DEALER_STATUS_LABELS] || s}
          </Link>
        ))}
      </div>

      <div className="bg-surface border border-bsm-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bsm-border">
              {['Concesionario', 'Email', 'Ciudad', 'Plan', 'Slots', 'Estado', 'Registro', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-bsm-text-muted font-medium uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dealers?.map((d: any) => (
              <tr key={d.id} className="table-row">
                <td className="px-4 py-3 font-medium text-bsm-text-primary">{d.name}</td>
                <td className="px-4 py-3 text-bsm-text-muted text-xs">{d.profile?.email}</td>
                <td className="px-4 py-3 text-bsm-text-muted">{d.location_city || '—'}</td>
                <td className="px-4 py-3 capitalize text-bsm-text-muted">{d.subscription_plan || 'trial'}</td>
                <td className="px-4 py-3 text-bsm-text-muted">{d.vehicle_slots}</td>
                <td className="px-4 py-3">
                  <span className={`badge text-[10px] ${d.status === 'active' ? 'badge-active' : d.status === 'pending' ? 'badge-pending' : 'badge-muted'}`}>
                    {DEALER_STATUS_LABELS[d.status as keyof typeof DEALER_STATUS_LABELS]}
                  </span>
                </td>
                <td className="px-4 py-3 text-bsm-text-muted text-xs">
                  {new Date(d.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/dealers/${d.id}`} className="text-xs text-gold hover:text-gold-light">
                    Gestionar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!dealers || dealers.length === 0) && (
          <div className="p-12 text-center text-sm text-bsm-text-muted">
            Sin concesionarios con este filtro
          </div>
        )}
      </div>
    </div>
  )
}
