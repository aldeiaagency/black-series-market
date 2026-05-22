import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LEAD_STATUS_LABELS, getLeadStatusColor, timeAgo } from '@/lib/utils'
import { Phone, Mail, MessageCircle } from 'lucide-react'

export default async function MensajesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dealer } = await supabase
    .from('dealers').select('id').eq('profile_id', user.id).single()
  if (!dealer) redirect('/registro')

  const { data: leads } = await supabase
    .from('leads')
    .select(`*, vehicle:vehicles(brand_name, model_name, year, slug, images)`)
    .eq('dealer_id', dealer.id)
    .order('created_at', { ascending: false })

  const newCount = leads?.filter((l: any) => l.status === 'new').length || 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Mensajes y leads</h1>
        <p className="text-sm text-bsm-text-muted">
          {newCount} leads nuevos · {leads?.length || 0} total
        </p>
      </div>

      {leads && leads.length > 0 ? (
        <div className="space-y-3">
          {leads.map((lead: any) => (
            <div
              key={lead.id}
              className={`bg-surface border ${lead.status === 'new' ? 'border-gold/20' : 'border-bsm-border'} p-6`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Left: Contact */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-medium text-bsm-text-primary">{lead.buyer_name}</h3>
                      <p className="text-xs text-bsm-text-muted mt-0.5">{timeAgo(lead.created_at)}</p>
                    </div>
                    <span className={`badge text-[10px] ${getLeadStatusColor(lead.status)}`}>
                      {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS]}
                    </span>
                  </div>

                  {lead.vehicle && (
                    <div className="flex items-center gap-2 mb-3 text-xs text-bsm-text-muted">
                      <span>Sobre:</span>
                      <span className="text-gold">
                        {lead.vehicle.brand_name} {lead.vehicle.model_name} {lead.vehicle.year}
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-bsm-text-secondary leading-relaxed mb-4">
                    {lead.message}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`mailto:${lead.buyer_email}`}
                      className="flex items-center gap-1.5 text-xs text-bsm-text-muted hover:text-gold transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {lead.buyer_email}
                    </a>
                    {lead.buyer_phone && (
                      <a
                        href={`tel:${lead.buyer_phone}`}
                        className="flex items-center gap-1.5 text-xs text-bsm-text-muted hover:text-gold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {lead.buyer_phone}
                      </a>
                    )}
                    {lead.buyer_whatsapp && (
                      <a
                        href={`https://wa.me/${lead.buyer_whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Vehicle thumb */}
                {lead.vehicle?.images?.[0] && (
                  <div className="w-24 h-16 flex-shrink-0 overflow-hidden bg-surface-elevated">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lead.vehicle.images[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-bsm-border p-16 text-center">
          <p className="text-sm text-bsm-text-muted">No has recibido leads todavía.</p>
          <p className="text-xs text-bsm-text-muted mt-2">
            Los leads aparecerán aquí cuando compradores contacten con tus vehículos.
          </p>
        </div>
      )}
    </div>
  )
}
