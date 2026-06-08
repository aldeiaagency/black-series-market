'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Save, Plus, Trash2, ChevronDown } from 'lucide-react'

const DEFAULT_PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    price: 149,
    slots: 15,
    features: ['15 vehículos activos', 'Ficha de concesionario', 'Leads ilimitados', 'Estadísticas básicas'],
    highlighted: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 349,
    slots: 40,
    features: ['40 vehículos activos', 'Perfil destacado en búsquedas', 'Estadísticas avanzadas', 'Boost de visibilidad mensual'],
    highlighted: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 699,
    slots: 100,
    features: ['Hasta 100 vehículos activos', 'Badge Destacado', 'Posición prioritaria', 'Account manager dedicado'],
    highlighted: false,
  },
]

const DEFAULT_BRANDS = [
  { slug: 'ferrari', name: 'Ferrari', tier: 'hypercar' },
  { slug: 'lamborghini', name: 'Lamborghini', tier: 'hypercar' },
  { slug: 'mclaren', name: 'McLaren', tier: 'hypercar' },
  { slug: 'bugatti', name: 'Bugatti', tier: 'hypercar' },
  { slug: 'porsche', name: 'Porsche', tier: 'premium' },
  { slug: 'bmw', name: 'BMW', tier: 'premium' },
  { slug: 'mercedes-benz', name: 'Mercedes-Benz', tier: 'premium' },
  { slug: 'audi', name: 'Audi', tier: 'premium' },
  { slug: 'ducati', name: 'Ducati', tier: 'moto' },
  { slug: 'mv-agusta', name: 'MV Agusta', tier: 'moto' },
]

type SectionKey = 'planes' | 'marcas' | 'criterios' | 'email' | 'seo' | 'social_links'

export default function AdminConfiguracionPage() {
  const [saved, setSaved] = useState<SectionKey | null>(null)
  const [saving, setSaving] = useState(false)
  const [openSection, setOpenSection] = useState<SectionKey>('planes')

  useEffect(() => {
    fetch('/api/admin/config')
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.planes) setPlans(cfg.planes)
        if (cfg.criterios) setCriteria(cfg.criterios)
        if (cfg.seo) setSeo((s) => ({ ...s, ...cfg.seo }))
        if (cfg.social_links) setSocialLinks((s) => ({ ...s, ...cfg.social_links }))
      })
      .catch(() => {})
  }, [])

  const [plans, setPlans] = useState(DEFAULT_PLANS)
  const [brands, setBrands] = useState(DEFAULT_BRANDS)

  const [criteria, setCriteria] = useState({
    car_min_price: 40000,
    moto_min_price: 15000,
    max_vehicle_age: 15,
    requires_professional_photo: true,
    requires_carfax: false,
  })

  const [email, setEmail] = useState({
    from_name: 'Black Series Market',
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

  async function handleSave(section: SectionKey) {
    const valueMap: Record<SectionKey, any> = {
      planes: plans,
      marcas: brands,
      criterios: criteria,
      email,
      seo,
      social_links: socialLinks,
    }
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

  function updatePlan(id: string, key: string, value: string | number | boolean) {
    setPlans((prev) => prev.map((p) => p.id === id ? { ...p, [key]: value } : p))
  }

  function toggle(section: SectionKey) {
    setOpenSection((prev) => (prev === section ? section : section))
  }

  const SECTIONS: { key: SectionKey; label: string; description: string }[] = [
    { key: 'planes', label: 'Planes de suscripción', description: 'Precios y características de cada plan' },
    { key: 'marcas', label: 'Marcas del marketplace', description: 'Gestión del catálogo de marcas permitidas' },
    { key: 'criterios', label: 'Criterios de admisión', description: 'Reglas editoriales para publicación de vehículos' },
    { key: 'email', label: 'Configuración de emails', description: 'Plantillas y remitente de notificaciones' },
    { key: 'seo', label: 'SEO y analíticas', description: 'Metadatos globales, Google Analytics, Tag Manager' },
    { key: 'social_links', label: 'Redes sociales de Black Label', description: 'URLs de las redes sociales propias del marketplace' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Configuración</h1>
        <p className="text-sm text-bsm-text-muted">Ajustes globales del marketplace</p>
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
                {/* Plans */}
                {key === 'planes' && (
                  <div className="p-5 space-y-5">
                    {plans.map((plan) => (
                      <div key={plan.id} className="border border-bsm-border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium capitalize">{plan.name}</h3>
                          <label className="flex items-center gap-2 text-xs text-bsm-text-muted">
                            <input
                              type="checkbox"
                              checked={plan.highlighted}
                              onChange={(e) => updatePlan(plan.id, 'highlighted', e.target.checked)}
                              className="accent-gold"
                            />
                            Destacado
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label-base">Precio (€/mes)</label>
                            <input
                              type="number"
                              value={plan.price}
                              onChange={(e) => updatePlan(plan.id, 'price', parseInt(e.target.value))}
                              className="input-base"
                            />
                          </div>
                          <div>
                            <label className="label-base">Slots de vehículos</label>
                            <input
                              type="number"
                              value={plan.slots}
                              onChange={(e) => updatePlan(plan.id, 'slots', parseInt(e.target.value))}
                              className="input-base"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="label-base">Características (una por línea)</label>
                          <textarea
                            value={plan.features.join('\n')}
                            onChange={(e) => updatePlan(plan.id, 'features', e.target.value.split('\n').filter(Boolean) as any)}
                            rows={4}
                            className="input-base resize-none text-xs font-mono"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <button onClick={() => handleSave('planes')} className="btn-gold flex items-center gap-2">
                        {saved === 'planes' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === 'planes' ? 'Guardado' : 'Guardar planes'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Brands */}
                {key === 'marcas' && (
                  <div className="p-5">
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      {brands.map((brand) => (
                        <div key={brand.slug} className="flex items-center justify-between py-2 border-b border-bsm-border last:border-0">
                          <div>
                            <span className="text-sm font-medium text-bsm-text-primary">{brand.name}</span>
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 border border-bsm-border text-bsm-text-muted capitalize">{brand.tier}</span>
                          </div>
                          <button className="text-xs text-bsm-text-muted hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <input placeholder="Nombre de marca..." className="input-base flex-1" />
                      <select className="select-base w-36">
                        <option value="hypercar">Hypercar</option>
                        <option value="premium">Premium</option>
                        <option value="moto">Moto</option>
                      </select>
                      <button className="btn-outline flex items-center gap-1.5 text-xs px-3 py-2">
                        <Plus className="w-3.5 h-3.5" />Añadir
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => handleSave('marcas')} className="btn-gold flex items-center gap-2">
                        {saved === 'marcas' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === 'marcas' ? 'Guardado' : 'Guardar marcas'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Criteria */}
                {key === 'criterios' && (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-base">Precio mínimo coches (€)</label>
                        <input
                          type="number"
                          value={criteria.car_min_price}
                          onChange={(e) => setCriteria((c) => ({ ...c, car_min_price: parseInt(e.target.value) }))}
                          className="input-base"
                        />
                      </div>
                      <div>
                        <label className="label-base">Precio mínimo motos (€)</label>
                        <input
                          type="number"
                          value={criteria.moto_min_price}
                          onChange={(e) => setCriteria((c) => ({ ...c, moto_min_price: parseInt(e.target.value) }))}
                          className="input-base"
                        />
                      </div>
                      <div>
                        <label className="label-base">Antigüedad máxima (años)</label>
                        <input
                          type="number"
                          value={criteria.max_vehicle_age}
                          onChange={(e) => setCriteria((c) => ({ ...c, max_vehicle_age: parseInt(e.target.value) }))}
                          className="input-base"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={criteria.requires_professional_photo}
                          onChange={(e) => setCriteria((c) => ({ ...c, requires_professional_photo: e.target.checked }))}
                          className="accent-gold"
                        />
                        <span className="text-sm text-bsm-text-secondary">Exigir fotografía profesional mínima</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={criteria.requires_carfax}
                          onChange={(e) => setCriteria((c) => ({ ...c, requires_carfax: e.target.checked }))}
                          className="accent-gold"
                        />
                        <span className="text-sm text-bsm-text-secondary">Exigir informe Carfax / historial verificado</span>
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => handleSave('criterios')} className="btn-gold flex items-center gap-2">
                        {saved === 'criterios' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === 'criterios' ? 'Guardado' : 'Guardar criterios'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Email */}
                {key === 'email' && (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-base">Nombre del remitente</label>
                        <input
                          value={email.from_name}
                          onChange={(e) => setEmail((em) => ({ ...em, from_name: e.target.value }))}
                          className="input-base"
                        />
                      </div>
                      <div>
                        <label className="label-base">Email del remitente</label>
                        <input
                          type="email"
                          value={email.from_email}
                          onChange={(e) => setEmail((em) => ({ ...em, from_email: e.target.value }))}
                          className="input-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label-base">Asunto — Notificación de lead</label>
                      <input
                        value={email.lead_subject}
                        onChange={(e) => setEmail((em) => ({ ...em, lead_subject: e.target.value }))}
                        className="input-base font-mono text-xs"
                      />
                      <p className="text-[10px] text-bsm-text-muted mt-1">Variables: {'{buyer_name}'}, {'{vehicle}'}, {'{dealer_name}'}</p>
                    </div>
                    <div>
                      <label className="label-base">Asunto — Bienvenida concesionario</label>
                      <input
                        value={email.welcome_subject}
                        onChange={(e) => setEmail((em) => ({ ...em, welcome_subject: e.target.value }))}
                        className="input-base font-mono text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-bsm-text-secondary">
                        <input
                          type="checkbox"
                          checked={email.lead_notification}
                          onChange={(e) => setEmail((em) => ({ ...em, lead_notification: e.target.checked }))}
                          className="accent-gold"
                        />
                        Notificar leads a dealers
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-bsm-text-secondary">
                        <input
                          type="checkbox"
                          checked={email.welcome_dealer}
                          onChange={(e) => setEmail((em) => ({ ...em, welcome_dealer: e.target.checked }))}
                          className="accent-gold"
                        />
                        Email de bienvenida
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => handleSave('email')} className="btn-gold flex items-center gap-2">
                        {saved === 'email' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === 'email' ? 'Guardado' : 'Guardar emails'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Social links */}
                {key === 'social_links' && (
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-bsm-text-muted">
                      Introduce las URLs completas. Solo se mostrarán los iconos de las redes con URL configurada.
                    </p>
                    {([
                      { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/blacklabelmarket' },
                      { key: 'facebook',  label: 'Facebook',  placeholder: 'https://www.facebook.com/blacklabelmarket' },
                      { key: 'youtube',   label: 'YouTube',   placeholder: 'https://www.youtube.com/@blacklabelmarket' },
                      { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://www.tiktok.com/@blacklabelmarket' },
                      { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://www.linkedin.com/company/blacklabelmarket' },
                    ] as const).map(({ key: sk, label, placeholder }) => (
                      <div key={sk}>
                        <label className="label-base">{label}</label>
                        <input
                          type="url"
                          value={socialLinks[sk]}
                          onChange={(e) => setSocialLinks((s) => ({ ...s, [sk]: e.target.value }))}
                          placeholder={placeholder}
                          className="input-base"
                        />
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <button onClick={() => handleSave('social_links')} className="btn-gold flex items-center gap-2">
                        {saved === 'social_links' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === 'social_links' ? 'Guardado' : 'Guardar redes'}
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
                        <input
                          value={seo.site_name}
                          onChange={(e) => setSeo((s) => ({ ...s, site_name: e.target.value }))}
                          className="input-base"
                        />
                      </div>
                      <div>
                        <label className="label-base">Tagline</label>
                        <input
                          value={seo.tagline}
                          onChange={(e) => setSeo((s) => ({ ...s, tagline: e.target.value }))}
                          className="input-base"
                        />
                      </div>
                      <div>
                        <label className="label-base">Google Analytics ID</label>
                        <input
                          value={seo.ga_id}
                          onChange={(e) => setSeo((s) => ({ ...s, ga_id: e.target.value }))}
                          placeholder="G-XXXXXXXXXX"
                          className="input-base font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="label-base">Google Tag Manager ID</label>
                        <input
                          value={seo.gtm_id}
                          onChange={(e) => setSeo((s) => ({ ...s, gtm_id: e.target.value }))}
                          placeholder="GTM-XXXXXXX"
                          className="input-base font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label-base">URL imagen OG (social sharing)</label>
                      <input
                        value={seo.og_image}
                        onChange={(e) => setSeo((s) => ({ ...s, og_image: e.target.value }))}
                        placeholder="https://..."
                        className="input-base"
                      />
                    </div>
                    <div className="bg-surface-elevated border border-bsm-border p-4 text-xs text-bsm-text-muted">
                      Los cambios de Analytics/GTM requieren actualizar las variables de entorno en el servidor y redesplegar.
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => handleSave('seo')} className="btn-gold flex items-center gap-2">
                        {saved === 'seo' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === 'seo' ? 'Guardado' : 'Guardar SEO'}
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
