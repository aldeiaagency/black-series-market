import Link from 'next/link'
import { CheckCircle, Clock, ExternalLink, LinkIcon, AlertTriangle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { approveStockSync, markAntifugaDelivered } from './actions'

interface PageProps {
  searchParams: Promise<{ status?: string; error?: string }>
}

const STATUS_LABEL: Record<string, string> = {
  pending_activation: 'Pendiente',
  active: 'Activo',
  delivered: 'Entregado',
  canceled: 'Cancelado',
  payment_failed: 'Pago fallido',
}

const STATUS_BADGE: Record<string, string> = {
  pending_activation: 'border-amber-400/30 text-amber-400 bg-amber-400/5',
  active: 'border-emerald-400/30 text-emerald-400 bg-emerald-400/5',
  delivered: 'border-blue-400/30 text-blue-400 bg-blue-400/5',
  canceled: 'border-bsm-border text-bsm-text-muted',
  payment_failed: 'border-red-400/30 text-red-400 bg-red-400/5',
}

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function formatMoney(amountCents: number | null | undefined) {
  if (amountCents == null) return '-'
  return `${(amountCents / 100).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} EUR`
}

export default async function AdminComplementosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = params.status || 'pending_activation'
  const admin = createAdminClient()

  let query = admin
    .from('addon_orders')
    .select(`
      id, status, manual_activation_type, feed_url, admin_notes, amount_cents, created_at, current_period_end,
      addon:addons(slug, name),
      dealer:dealers(id, name, email, feed_url, subscription_plan),
      organization:organizations(id, name)
    `)
    .not('manual_activation_type', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200)

  if (status !== 'all') query = query.eq('status', status)

  const [{ data: orders }, { data: allForCounts }] = await Promise.all([
    query,
    admin.from('addon_orders').select('status').not('manual_activation_type', 'is', null),
  ])

  const counts: Record<string, number> = {}
  for (const item of (allForCounts ?? []) as { status: string }[]) {
    counts[item.status] = (counts[item.status] ?? 0) + 1
  }
  const total = (allForCounts ?? []).length
  const pending = counts.pending_activation ?? 0

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-light mb-1">Complementos</h1>
          <p className="text-sm text-bsm-text-muted">
            {total} compras manuales en total
            {pending > 0 && <span className="ml-2 text-gold font-medium">· {pending} pendiente{pending !== 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      {params.error === 'feed_url_required' && (
        <div className="flex items-start gap-3 border border-red-400/30 bg-red-400/5 p-4">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
          <p className="text-sm text-red-400">No se activo Stock automatizado: falta una URL de feed valida.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          ['pending_activation', 'Pendientes'],
          ['active', 'Activos'],
          ['delivered', 'Entregados'],
          ['payment_failed', 'Pago fallido'],
          ['canceled', 'Cancelados'],
          ['all', 'Todos'],
        ].map(([key, label]) => (
          <Link
            key={key}
            href={key === 'pending_activation' ? '/admin/complementos' : `/admin/complementos?status=${key}`}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              status === key
                ? 'border-gold/40 text-gold bg-gold/5'
                : 'border-bsm-border text-bsm-text-muted hover:text-bsm-text-primary'
            }`}
          >
            {label} ({key === 'all' ? total : counts[key] ?? 0})
          </Link>
        ))}
      </div>

      <div className="border border-bsm-border divide-y divide-bsm-border">
        {(orders ?? []).length === 0 && (
          <div className="p-12 text-center">
            <Clock className="w-8 h-8 text-bsm-text-muted/30 mx-auto mb-3" />
            <p className="text-sm text-bsm-text-muted">No hay complementos con este estado.</p>
          </div>
        )}

        {(orders ?? []).map((order: any) => {
          const addon = relationOne(order.addon as { slug: string; name: string } | null)
          const dealer = relationOne(order.dealer as { id: string; name: string; email: string | null; feed_url: string | null; subscription_plan: string | null } | null)
          const org = relationOne(order.organization as { id: string; name: string } | null)
          const isStockSync = addon?.slug === 'feed_sync'
          const isAntifuga = addon?.slug === 'antifuga_express'
          const isPending = order.status === 'pending_activation'

          return (
            <div key={order.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] border px-2 py-0.5 uppercase tracking-wide ${STATUS_BADGE[order.status] ?? 'border-bsm-border text-bsm-text-muted'}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <span className="text-[10px] text-bsm-text-muted uppercase tracking-wide">{formatMoney(order.amount_cents)}</span>
                  </div>
                  <p className="text-sm font-medium text-bsm-text-primary">{addon?.name ?? 'Complemento'}</p>
                  <p className="text-xs text-bsm-text-muted mt-0.5">
                    {dealer?.name ?? org?.name ?? order.id}
                    {dealer?.subscription_plan && ` · ${dealer.subscription_plan}`}
                    {' · '}{new Date(order.created_at).toLocaleDateString('es-ES')}
                    {order.current_period_end && ` · renueva ${new Date(order.current_period_end).toLocaleDateString('es-ES')}`}
                  </p>
                  {dealer?.email && <p className="text-xs text-bsm-text-muted mt-1">{dealer.email}</p>}
                  {dealer?.id && (
                    <Link href={`/admin/dealers/${dealer.id}`} className="inline-flex items-center gap-1 text-xs text-gold hover:underline mt-2">
                      <ExternalLink className="w-3 h-3" /> Ver showroom
                    </Link>
                  )}
                </div>

                {isStockSync && isPending && (
                  <form action={approveStockSync} className="w-full lg:w-96 space-y-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <div>
                      <label className="text-[10px] text-bsm-text-muted uppercase tracking-wide">URL del feed</label>
                      <div className="mt-1 flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5 text-bsm-text-muted" />
                        <input
                          name="feed_url"
                          defaultValue={order.feed_url || dealer?.feed_url || ''}
                          placeholder="https://..."
                          className="w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors"
                        />
                      </div>
                    </div>
                    <textarea
                      name="admin_notes"
                      rows={2}
                      defaultValue={order.admin_notes || ''}
                      placeholder="Notas internas"
                      className="w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary p-2 resize-none focus:outline-none focus:border-gold/50 transition-colors"
                    />
                    <button type="submit" className="btn-gold text-xs px-4 py-2">
                      Activar stock automatizado
                    </button>
                  </form>
                )}

                {isAntifuga && isPending && (
                  <form action={markAntifugaDelivered} className="w-full lg:w-96 space-y-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <textarea
                      name="admin_notes"
                      rows={3}
                      defaultValue={order.admin_notes || ''}
                      placeholder="Fecha agendada, responsable o notas de entrega"
                      className="w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary p-2 resize-none focus:outline-none focus:border-gold/50 transition-colors"
                    />
                    <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Marcar entregado/agendado
                    </button>
                  </form>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
