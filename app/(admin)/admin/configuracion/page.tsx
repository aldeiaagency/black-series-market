'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Save, ChevronDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type SectionKey = 'email' | 'seo' | 'social_links'

export default function AdminConfiguracionPage() {
  const [saved, setSaved] = useState<SectionKey | null>(null)
  const [saving, setSaving] = useState(false)
  const [openSection, setOpenSection] = useState<SectionKey>('social_links')

  const [email, setEmail] = useState({
    from_name: 'Black Label Market',
    from_email: 'hola@blacklabelmarket.es',
    lead_notification: true,
    welcome_dealer: true,
    lead_subject: 'Nueva consulta de {buyer_name} sobre {vehicle}',
    welcome_subject: 'Bienvenido a Black Series Market, {dealer_name}',
  })

  const [seo, setSeo] = useState({
    site_name: 'Black Series Market',
    tagline: 'El marketplace de vehículos premium',
    og_image: '',
    ga_id: '',
    gtm_id: '',
  })

  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    youtube: '',
    tiktok: '',
    linkedin: '',
  })

  useEffect(() => {
    fetch('/api/admin/config')
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.seo) setSeo((s) => ({ ...s, ...cfg.seo }))
        if (cfg.social_links) setSocialLinks((s) => ({ ...s, ...cfg.social_links }))
      })
      .catch(() => {})
  }, [])

  async function handleSave(section: SectionKey) {
    const valueMap: Record<SectionKey, any> = { email, seo, social_links: socialLinks }
    setSaving(true)
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: section, value: valueMap[section] }),
      })
      setSaved(section)
      setTimeout(() => setSaved(null), 2500)
    } finally {
      setSaving(false)
    }
  }

  const SECTIONS: { key: SectionKey; label: string; description: string }[] = [
    { key: 'email',        label: 'Configuración de emails',          description: 'Plantillas y remitente de notificaciones' },
    { key: 'seo',          label: 'SEO y analíticas',                 description: 'Metadatos globales, Google Analytics, Tag Manager' },
    { key: 'social_links', label: 'Redes sociales de Black Label',    description: 'URLs de las redes sociales propias del marketplace' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Configuración</h1>
        <p className="text-sm text-bsm-text-muted">Ajustes globales del marketplace</p>
      </div>

      {/* Quick links to plan/subscription management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Link href="/admin/plans"
          className="flex items-center justify-between p-4 border border-bsm-border bg-surface hover:border-gold/30 transition-colors group">
          <div>
            <p className="text-sm font-medium text-bsm-text-primary">Planes y precios</p>
            <p className="text-xs text-bsm-text-muted mt-0.5">Gestionar planes, límites y features en la BD</p>
          </div>
          <ExternalLink className="w-4 h-4 text-bsm-text-muted group-hover:text-gold transition-colors flex-shrink-0" />
        </Link>
        <Link href="/admin/subscriptions"
          className="flex items-center justify-between p-4 border border-bsm-border bg-surface hover:border-gold/30 transition-colors group">
          <div>
            <p className="text-sm font-medium text-bsm-text-primary">Suscripciones activas</p>
            <p className="text-xs text-bsm-text-muted mt-0.5">Ver y gestionar suscripciones de showrooms</p>
          </div>
          <ExternalLink className="w-4 h-4 text-bsm-text-muted group-hover:text-gold transition-colors flex-shrink-0" />
        </Link>
      </div>

      <div className="max-w-3xl space-y-4">
        {SECTIONS.map(({ key, label, description }) => (
          <div key={key} className="bg-surface border border-bsm-border">
            <button
              type="button"
              onClick={() => setOpenSection(key)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-elevated transition-colors"
            >
              <div>
                <h2 className="font-medium text-bsm-text-primary">{label}</h2>
                <p className="text-xs text-bsm-text-muted mt-0.5">{description}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-bsm-text-muted transition-transform ${openSection === key ? 'rotate-180' : ''}`} />
            </button>

            {openSection === key && (
              <div className="border-t border-bsm-border">

                {/* Email */}
                {key === 'email' && (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-base">Nombre del remitente</label>
                        <input value={email.from_name} onChange={(e) => setEmail((em) => ({ ...em, from_name: e.target.value }))} className="input-base" />
                      </div>
                      <div>
                        <label className="label-base">Email del remitente</label>
                        <input type="email" value={email.from_email} onChange={(e) => setEmail((em) => ({ ...em, from_email: e.target.value }))} className="input-base" />
                      </div>
                    </div>
                    <div>
                      <label className="label-base">Asunto — Notificación de lead</label>
                      <input value={email.lead_subject} onChange={(e) => setEmail((em) => ({ ...em, lead_subject: e.target.value }))} className="input-base font-mono text-xs" />
                      <p className="text-[10px] text-bsm-text-muted mt-1">Variables: {'{buyer_name}'}, {'{vehicle}'}, {'{dealer_name}'}</p>
                    </div>
                    <div>
                      <label className="label-base">Asunto — Bienvenida concesionario</label>
                      <input value={email.welcome_subject} onChange={(e) => setEmail((em) => ({ ...em, welcome_subject: e.target.value }))} className="input-base font-mono text-xs" />
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-bsm-text-secondary">
                        <input type="checkbox" checked={email.lead_notification} onChange={(e) => setEmail((em) => ({ ...em, lead_notification: e.target.checked }))} className="accent-gold" />
                        Notificar leads a dealers
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-bsm-text-secondary">
                        <input type="checkbox" checked={email.welcome_dealer} onChange={(e) => setEmail((em) => ({ ...em, welcome_dealer: e.target.checked }))} className="accent-gold" />
                        Email de bienvenida
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => handleSave('email')} disabled={saving} className="btn-gold flex items-center gap-2">
                        {saved === 'email' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === 'email' ? 'Guardado' : 'Guardar emails'}
                      </button>
                    </div>
                  </div>
                )}

                {/* SEO */}
                {key === 'seo' && (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-base">Nombre del sitio</label>
                        <input value={seo.site_name} onChange={(e) => setSeo((s) => ({ ...s, site_name: e.target.value }))} className="input-base" />
                      </div>
                      <div>
                        <label className="label-base">Tagline</label>
                        <input value={seo.tagline} onChange={(e) => setSeo((s) => ({ ...s, tagline: e.target.value }))} className="input-base" />
                      </div>
                      <div>
                        <label className="label-base">Google Analytics ID</label>
                        <input value={seo.ga_id} onChange={(e) => setSeo((s) => ({ ...s, ga_id: e.target.value }))} placeholder="G-XXXXXXXXXX" className="input-base font-mono text-xs" />
                      </div>
                      <div>
                        <label className="label-base">Google Tag Manager ID</label>
                        <input value={seo.gtm_id} onChange={(e) => setSeo((s) => ({ ...s, gtm_id: e.target.value }))} placeholder="GTM-XXXXXXX" className="input-base font-mono text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="label-base">URL imagen OG (social sharing)</label>
                      <input value={seo.og_image} onChange={(e) => setSeo((s) => ({ ...s, og_image: e.target.value }))} placeholder="https://..." className="input-base" />
                    </div>
                    <div className="bg-surface-elevated border border-bsm-border p-4 text-xs text-bsm-text-muted">
                      Los cambios de Analytics/GTM requieren actualizar las variables de entorno en el servidor y redesplegar.
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => handleSave('seo')} disabled={saving} className="btn-gold flex items-center gap-2">
                        {saved === 'seo' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === 'seo' ? 'Guardado' : 'Guardar SEO'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Social links */}
                {key === 'social_links' && (
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-bsm-text-muted">Introduce las URLs completas. Solo se mostrarán los iconos de las redes con URL configurada.</p>
                    {([
                      { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/blacklabelmarket' },
                      { key: 'facebook',  label: 'Facebook',  placeholder: 'https://www.facebook.com/blacklabelmarket' },
                      { key: 'youtube',   label: 'YouTube',   placeholder: 'https://www.youtube.com/@blacklabelmarket' },
                      { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://www.tiktok.com/@blacklabelmarket' },
                      { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://www.linkedin.com/company/blacklabelmarket' },
                    ] as const).map(({ key: sk, label, placeholder }) => (
                      <div key={sk}>
                        <label className="label-base">{label}</label>
                        <input type="url" value={socialLinks[sk]} onChange={(e) => setSocialLinks((s) => ({ ...s, [sk]: e.target.value }))} placeholder={placeholder} className="input-base" />
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <button onClick={() => handleSave('social_links')} disabled={saving} className="btn-gold flex items-center gap-2">
                        {saved === 'social_links' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === 'social_links' ? 'Guardado' : 'Guardar redes'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
