import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { timeAgo } from '@/lib/utils'
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Mail, Phone,
  MapPin, ExternalLink, Globe, Instagram, Star, FileText,
} from 'lucide-react'
import { setApplicationStatus, saveNotes, approveApplication, rejectApplication } from '../actions'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Nueva',
  in_review: 'En revisión',
  pending_info: 'Pendiente de info',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

const STATUS_BADGE: Record<string, string> = {
  new: 'text-gold bg-gold/10 border-gold/30',
  in_review: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  pending_info: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  approved: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/30',
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: app } = await admin
    .from('showroom_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!app) notFound()

  const st: string = app.status || 'new'
  const isActionable = st !== 'approved' && st !== 'rejected'
  const isPendingInfo = st === 'pending_info'
  const portales: string[] = Array.isArray(app.portales) ? app.portales : []

  const submittedAt = new Date(app.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const reviewedAt = app.reviewed_at
    ? new Date(app.reviewed_at).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="p-8 max-w-5xl">

      {/* Back + Header */}
      <div className="mb-8">
        <Link
          href="/admin/altas-showroom"
          className="inline-flex items-center gap-1.5 text-xs text-bsm-text-muted hover:text-bsm-text-primary transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Solicitudes
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-light text-bsm-text-primary">{app.dealer_name}</h1>
            <span className={`text-[10px] px-2 py-0.5 border uppercase tracking-wide ${STATUS_BADGE[st]}`}>
              {STATUS_LABEL[st]}
            </span>
            <span className="text-xs text-bsm-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo(app.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ── Left: data ── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Datos de contacto */}
          <section className="bg-surface border border-bsm-border p-6 space-y-4">
            <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Datos del solicitante</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DataRow icon={<FileText className="w-3.5 h-3.5" />} label="Nombre" value={app.full_name} />
              <DataRow
                icon={<Mail className="w-3.5 h-3.5" />}
                label="Email"
                value={
                  <a href={`mailto:${app.email}`} className="hover:text-gold transition-colors">
                    {app.email}
                  </a>
                }
              />
              <DataRow
                icon={<Phone className="w-3.5 h-3.5" />}
                label="Teléfono"
                value={
                  <a href={`tel:${app.phone}`} className="hover:text-gold transition-colors">
                    {app.phone}
                  </a>
                }
              />
              <DataRow
                icon={<MapPin className="w-3.5 h-3.5" />}
                label="Ubicación"
                value={[app.location_city, app.location_region].filter(Boolean).join(', ')}
              />
            </div>

            <div className="border-t border-bsm-border pt-3">
              <p className="text-xs text-bsm-text-muted">
                Solicitud enviada el <span className="text-bsm-text-secondary">{submittedAt}</span>
              </p>
            </div>
          </section>

          {/* Presencia online */}
          <section className="bg-surface border border-bsm-border p-6">
            <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Presencia online</h2>

            <div className="space-y-3">
              {app.google_business_url ? (
                <UrlRow
                  icon={<Star className="w-3.5 h-3.5 text-emerald-400" />}
                  label="Google Business"
                  url={app.google_business_url}
                  colorClass="text-emerald-400"
                />
              ) : (
                <EmptyUrl label="Google Business" />
              )}

              {app.instagram_url ? (
                <UrlRow
                  icon={<Instagram className="w-3.5 h-3.5 text-purple-400" />}
                  label="Instagram"
                  url={app.instagram_url}
                  colorClass="text-purple-400"
                />
              ) : (
                <EmptyUrl label="Instagram" />
              )}

              {app.website ? (
                <UrlRow
                  icon={<Globe className="w-3.5 h-3.5 text-blue-400" />}
                  label="Web oficial"
                  url={app.website}
                  colorClass="text-blue-400"
                />
              ) : (
                <EmptyUrl label="Web oficial" />
              )}
            </div>

            {/* Portales */}
            {portales.length > 0 && (
              <div className="border-t border-bsm-border mt-4 pt-4">
                <p className="text-xs text-bsm-text-muted mb-2 uppercase tracking-widest">Portales</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {portales.map((p: string) => (
                    <span key={p} className="text-xs px-2 py-0.5 border border-gold/30 text-gold bg-gold/5">
                      {p}
                    </span>
                  ))}
                </div>
                {app.portal_url && (
                  <UrlRow
                    icon={<ExternalLink className="w-3.5 h-3.5 text-gold" />}
                    label="Perfil en portal"
                    url={app.portal_url}
                    colorClass="text-gold"
                  />
                )}
              </div>
            )}

            {!app.google_business_url && !app.instagram_url && !app.website && portales.length === 0 && (
              <p className="text-xs text-red-400/70 mt-2">No se proporcionaron URLs de investigación.</p>
            )}
          </section>

          {/* Notas internas */}
          <section className="bg-surface border border-bsm-border p-6">
            <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">Notas internas</h2>
            <form action={saveNotes} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={app.id} />
              <textarea
                name="admin_notes"
                rows={5}
                defaultValue={app.admin_notes || ''}
                placeholder="Resultado de la investigación, observaciones, motivo de decisión..."
                className="w-full bg-obsidian border border-bsm-border text-xs text-bsm-text-secondary p-3 resize-none focus:outline-none focus:border-gold/50 leading-relaxed"
              />
              <button type="submit" className="self-start btn-outline text-xs px-4 py-2">
                Guardar notas
              </button>
            </form>
          </section>
        </div>

        {/* ── Right: actions + metadata ── */}
        <div className="space-y-4">

          {/* Action panel */}
          <div className="bg-surface border border-bsm-border p-5 space-y-3 xl:sticky xl:top-6">
            <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-1">Acciones</h2>

            {isActionable && (
              <>
                {st === 'new' && (
                  <form action={setApplicationStatus}>
                    <input type="hidden" name="id" value={app.id} />
                    <input type="hidden" name="status" value="in_review" />
                    <button type="submit" className="btn-outline w-full justify-center text-xs">
                      Marcar en revisión
                    </button>
                  </form>
                )}

                {isPendingInfo && (
                  <form action={setApplicationStatus}>
                    <input type="hidden" name="id" value={app.id} />
                    <input type="hidden" name="status" value="in_review" />
                    <button type="submit" className="btn-outline w-full justify-center text-xs">
                      Reanudar revisión
                    </button>
                  </form>
                )}

                {!isPendingInfo && (
                  <form action={setApplicationStatus}>
                    <input type="hidden" name="id" value={app.id} />
                    <input type="hidden" name="status" value="pending_info" />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-orange-400/30 text-orange-400 text-xs hover:bg-orange-400/5 transition-colors"
                    >
                      Solicitar más información
                    </button>
                  </form>
                )}

                <form action={approveApplication}>
                  <input type="hidden" name="id" value={app.id} />
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Aprobar y crear acceso
                  </button>
                </form>

                <form action={rejectApplication}>
                  <input type="hidden" name="id" value={app.id} />
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-400/30 text-red-400 text-xs hover:bg-red-400/5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Rechazar solicitud
                  </button>
                </form>
              </>
            )}

            {st === 'approved' && app.dealer_id && (
              <Link
                href={`/admin/dealers/${app.dealer_id}`}
                className="btn-outline w-full justify-center text-xs"
              >
                Ver showroom creado →
              </Link>
            )}

            {st === 'rejected' && (
              <p className="text-xs text-red-400/70 text-center py-2">Solicitud rechazada</p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-surface border border-bsm-border p-5 space-y-3">
            <h2 className="text-xs text-bsm-text-muted uppercase tracking-widest mb-1">Historial</h2>
            <MetaRow label="Enviada" value={submittedAt} />
            {reviewedAt && (
              <MetaRow
                label={st === 'approved' ? 'Aprobada' : 'Revisada'}
                value={reviewedAt}
              />
            )}
            <MetaRow label="ID" value={<span className="font-mono text-[10px]">{app.id.slice(0, 8)}…</span>} />
          </div>
        </div>
      </div>
    </div>
  )
}

function DataRow({
  icon, label, value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-bsm-text-muted mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-bsm-text-muted uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-xs text-bsm-text-secondary">{value}</p>
      </div>
    </div>
  )
}

function UrlRow({
  icon, label, url, colorClass,
}: {
  icon: React.ReactNode
  label: string
  url: string
  colorClass: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-bsm-text-muted uppercase tracking-wide">{label}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs ${colorClass} hover:opacity-80 transition-opacity truncate block max-w-xs`}
        >
          {url}
        </a>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 text-bsm-text-muted hover:text-bsm-text-primary transition-colors"
        aria-label={`Abrir ${label}`}
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  )
}

function EmptyUrl({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 opacity-30">
      <span className="w-3.5 h-3.5 rounded-full border border-bsm-border flex-shrink-0" />
      <p className="text-xs text-bsm-text-muted">{label} — no proporcionado</p>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-bsm-text-muted uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-xs text-bsm-text-secondary">{value}</p>
    </div>
  )
}
