import { createAdminClient } from '@/lib/supabase/server'
import { timeAgo } from '@/lib/utils'
import { Bell, Mail, Phone, MapPin, Car, Wallet, Clock, User, Globe } from 'lucide-react'

const VEHICLE_TYPE_LABEL: Record<string, string> = {
  car: 'Coche', motorcycle: 'Moto', any: 'Indiferente',
}
const TIMELINE_LABEL: Record<string, string> = {
  immediate: 'Inmediata', '1_3_months': '1-3 meses', '3_6_months': '3-6 meses', exploring: 'Explorando',
}

export default async function AdminAlertasPage() {
  const supabase = createAdminClient()

  const { data: alerts } = await supabase
    .from('search_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)

  const list = alerts || []
  const anonCount = list.filter((a: any) => !a.user_id).length

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light mb-1 flex items-center gap-3">
          <Bell className="w-7 h-7 text-gold" />
          Alertas de búsqueda
        </h1>
        <p className="text-sm text-bsm-text-muted">
          Señales de demanda de compradores · {list.length} en total · {anonCount} anónimas
        </p>
      </div>

      {list.length === 0 ? (
        <div className="border border-bsm-border bg-surface p-12 text-center">
          <Bell className="w-8 h-8 text-bsm-text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-bsm-text-muted">Aún no hay alertas registradas.</p>
        </div>
      ) : (
        <div className="border border-bsm-border bg-surface divide-y divide-bsm-border">
          {list.map((a: any) => (
            <div key={a.id} className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap text-xs">
                  <span className="flex items-center gap-1.5 text-bsm-text-secondary">
                    {a.user_id
                      ? <><User className="w-3.5 h-3.5 text-emerald-400" /> Registrado</>
                      : <><Globe className="w-3.5 h-3.5 text-blue-400" /> Anónimo</>}
                  </span>
                  {a.email && (
                    <a href={`mailto:${a.email}`} className="flex items-center gap-1.5 text-bsm-text-secondary hover:text-gold">
                      <Mail className="w-3.5 h-3.5 text-bsm-text-muted" /> {a.email}
                    </a>
                  )}
                  {a.phone && (
                    <span className="flex items-center gap-1.5 text-bsm-text-secondary">
                      <Phone className="w-3.5 h-3.5 text-bsm-text-muted" /> {a.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-bsm-text-muted">
                    <Clock className="w-3 h-3" /> {timeAgo(a.created_at)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-bsm-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    {[VEHICLE_TYPE_LABEL[a.vehicle_type] || a.vehicle_type, a.brand, a.model]
                      .filter(Boolean).join(' · ') || 'Cualquiera'}
                  </span>
                  {a.budget_max && (
                    <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> {a.budget_max}</span>
                  )}
                  {a.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {a.location}</span>
                  )}
                  {a.timeline && (
                    <span>{TIMELINE_LABEL[a.timeline] || a.timeline}</span>
                  )}
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 border uppercase tracking-wide flex-shrink-0 ${
                a.is_active ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-bsm-text-muted border-bsm-border'
              }`}>
                {a.is_active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
