'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Upload, X } from 'lucide-react'
import DealerGalleryManager from '@/components/dashboard/DealerGalleryManager'

const SPECIALTIES = [
  { value: 'sport',      label: 'Deportivos' },
  { value: 'classic',    label: 'Clásicos y youngtimers' },
  { value: 'premium',    label: 'Premium moderno' },
  { value: 'motorcycle', label: 'Motos premium' },
  { value: 'import',     label: 'Importación' },
  { value: 'suv',        label: 'Luxury SUVs' },
  { value: 'supercar',   label: 'Supercars' },
  { value: 'custom',     label: 'Custom bikes' },
]

const SERVICES = [
  { value: 'financing',     label: 'Financiación' },
  { value: 'trade_in',      label: 'Aceptan vehículos' },
  { value: 'warranty',      label: 'Garantía' },
  { value: 'transport_nat', label: 'Transporte nacional' },
  { value: 'transport_intl',label: 'Transporte internacional' },
  { value: 'own_workshop',  label: 'Taller propio' },
  { value: 'detailing',     label: 'Detailing' },
  { value: 'home_delivery', label: 'Entrega a domicilio' },
]

function sanitizeUrl(value: string | undefined | null): string | null {
  if (!value?.trim()) return null
  try {
    const u = new URL(value.trim())
    if (!['http:', 'https:'].includes(u.protocol)) return null
    return u.toString()
  } catch {
    return null
  }
}

export default function PerfilPage() {
  const [dealer, setDealer] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('dealers').select('*').eq('profile_id', user.id).single()
      setDealer(data)
      setForm(data || {})
      setLogoUrl(data?.logo_url || null)
      setCoverUrl(data?.cover_url || null)
    }
    load()
  }, [router])

  function update(key: string, value: any) {
    setForm((f: any) => ({ ...f, [key]: value }))
  }

  function toggleSpecialty(value: string) {
    setForm((f: any) => {
      const current: string[] = f.certifications || []
      return {
        ...f,
        certifications: current.includes(value)
          ? current.filter((s) => s !== value)
          : [...current, value],
      }
    })
  }

  function toggleService(value: string) {
    setForm((f: any) => {
      const current: string[] = f.services || []
      return {
        ...f,
        services: current.includes(value)
          ? current.filter((s) => s !== value)
          : [...current, value],
      }
    })
  }

  async function handleImageUpload(
    file: File,
    type: 'logo' | 'cover',
    setUploading: (v: boolean) => void,
    setError: (v: string | null) => void,
    setUrl: (v: string) => void,
  ) {
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/upload?type=${type}`, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Error al subir la imagen'); return }
      setUrl(json.url)
    } catch {
      setError('Error de conexión al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemoveImage(field: 'logo_url' | 'cover_url', setUrl: (v: null) => void) {
    const supabase = createClient()
    await supabase.from('dealers').update({ [field]: null }).eq('id', dealer.id)
    setUrl(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaveError(null)
    const supabase = createClient()

    const baseFields = {
      name:              form.name,
      description:       form.description,
      location_city:     form.location_city,
      location_region:   form.location_region,
      address:           form.address,
      postal_code:       form.postal_code   || null,
      phone:             form.phone         || null,
      whatsapp:          form.whatsapp      || null,
      email:             form.email         || null,
      attention_note:    form.attention_note || null,
      website:           sanitizeUrl(form.website),
      instagram:         sanitizeUrl(form.instagram),
      years_in_business: form.years_in_business ? parseInt(form.years_in_business) : null,
      certifications:    form.certifications || [],
      services:          form.services          || [],
    }

    const socialFields = {
      facebook_url: sanitizeUrl(form.facebook_url),
      youtube_url:  sanitizeUrl(form.youtube_url),
      tiktok_url:   sanitizeUrl(form.tiktok_url),
      linkedin_url: sanitizeUrl(form.linkedin_url),
    }

    // Try full save including new social columns
    let { error } = await supabase.from('dealers').update({
      ...baseFields,
      ...socialFields,
    }).eq('id', dealer.id)

    // If new columns don't exist yet (migration pending), fall back to base fields only
    if (error && error.message?.includes('column')) {
      const fallback = await supabase.from('dealers').update(baseFields).eq('id', dealer.id)
      error = fallback.error
      if (!fallback.error) {
        setSaveError('Guardado parcialmente. Las redes sociales (Facebook, YouTube, TikTok, LinkedIn) requieren aplicar la migración 006 en Supabase para guardarse.')
      }
    }

    setLoading(false)

    if (error) {
      setSaveError(`Error al guardar: ${error.message}`)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!dealer) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-6 h-6 border border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const initial = dealer.name?.[0]?.toUpperCase() || '?'

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Perfil del showroom</h1>
        <p className="text-sm text-bsm-text-muted">
          Esta información es visible en tu página pública del marketplace.
        </p>
      </div>

      {/* Logo */}
      <div className="bg-surface border border-bsm-border p-6 mb-6">
        <h2 className="font-medium text-bsm-text-primary mb-1">Logo</h2>
        <p className="text-xs text-bsm-text-muted mb-5">
          Se muestra en las tarjetas de vehículos y en tu página de showroom. JPG, PNG o WebP, máx. 10 MB.
        </p>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 flex-shrink-0 bg-[#0D0D0D] border border-bsm-border flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="font-display text-2xl font-light text-[#C6A64B]/40 select-none">{initial}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, 'logo', setLogoUploading, setLogoError, setLogoUrl)
                if (logoInputRef.current) logoInputRef.current.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="btn-outline text-sm px-4 py-2 flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              {logoUploading ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={() => handleRemoveImage('logo_url', () => setLogoUrl(null))}
                className="flex items-center gap-1.5 text-xs text-bsm-text-muted hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />Eliminar logo
              </button>
            )}
          </div>
        </div>
        {logoError && <p className="mt-3 text-xs text-red-400">{logoError}</p>}
        {logoUrl && !logoUploading && (
          <p className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" />Logo guardado
          </p>
        )}
      </div>

      {/* Imagen de portada */}
      <div className="bg-surface border border-bsm-border p-6 mb-6">
        <h2 className="font-medium text-bsm-text-primary mb-1">Imagen de portada</h2>
        <p className="text-xs text-bsm-text-muted mb-5">
          Aparece como fondo en tu recuadro de perfil dentro de las fichas de vehículo. Recomendado: 1200×400 px, formato horizontal. JPG, PNG o WebP, máx. 10 MB.
        </p>
        <div className="flex flex-col gap-4">
          {coverUrl && (
            <div className="w-full h-28 overflow-hidden border border-bsm-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="Portada" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, 'cover', setCoverUploading, setCoverError, setCoverUrl)
                if (coverInputRef.current) coverInputRef.current.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="btn-outline text-sm px-4 py-2 flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              {coverUploading ? 'Subiendo...' : coverUrl ? 'Cambiar portada' : 'Subir portada'}
            </button>
            {coverUrl && (
              <button
                type="button"
                onClick={() => handleRemoveImage('cover_url', () => setCoverUrl(null))}
                className="flex items-center gap-1.5 text-xs text-bsm-text-muted hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />Eliminar
              </button>
            )}
          </div>
        </div>
        {coverError && <p className="mt-3 text-xs text-red-400">{coverError}</p>}
        {coverUrl && !coverUploading && (
          <p className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" />Portada guardada
          </p>
        )}
      </div>

      {/* Galería de instalaciones */}
      <DealerGalleryManager />

      <form onSubmit={handleSave} className="space-y-6">

        {/* Información básica */}
        <div className="bg-surface border border-bsm-border p-6 space-y-4">
          <h2 className="font-medium text-bsm-text-primary mb-4">Información básica</h2>
          <div>
            <label className="label-base">Nombre del showroom</label>
            <input value={form.name || ''} onChange={(e) => update('name', e.target.value)} className="input-base" required />
          </div>
          <div>
            <label className="label-base">Descripción</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              className="input-base resize-none"
              placeholder="Describe tu especialización, años de experiencia, qué tipo de vehículos trabajas..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-base">Ciudad</label>
              <input value={form.location_city || ''} onChange={(e) => update('location_city', e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="label-base">Provincia / Región</label>
              <input value={form.location_region || ''} onChange={(e) => update('location_region', e.target.value)} className="input-base" />
            </div>
          </div>
          <div>
            <label className="label-base">Dirección completa</label>
            <input value={form.address || ''} onChange={(e) => update('address', e.target.value)} placeholder="Calle, número, piso..." className="input-base" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-base">Código postal</label>
              <input value={form.postal_code || ''} onChange={(e) => update('postal_code', e.target.value)} placeholder="36619" className="input-base" />
            </div>
            <div>
              <label className="label-base">País</label>
              <input value={form.location_country || 'España'} onChange={(e) => update('location_country', e.target.value)} className="input-base" />
            </div>
          </div>
          <div>
            <label className="label-base">Años en el sector</label>
            <input type="number" min="0" max="100" value={form.years_in_business || ''} onChange={(e) => update('years_in_business', e.target.value)} className="input-base" />
          </div>
        </div>

        {/* Especialidades */}
        <div className="bg-surface border border-bsm-border p-6">
          <h2 className="font-medium text-bsm-text-primary mb-1">Especialidades</h2>
          <p className="text-xs text-bsm-text-muted mb-4">Selecciona las categorías en las que te especializas. Aparecen como badges en tu perfil público.</p>
          <div className="grid grid-cols-2 gap-2">
            {SPECIALTIES.map(({ value, label }) => {
              const selected = (form.certifications || []).includes(value)
              return (
                <label
                  key={value}
                  className={`flex items-center gap-2.5 px-3 py-2.5 border cursor-pointer transition-colors
                    ${selected
                      ? 'border-gold/40 bg-gold/5 text-gold'
                      : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSpecialty(value)}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Servicios */}
        <div className="bg-surface border border-bsm-border p-6">
          <h2 className="font-medium text-bsm-text-primary mb-1">Servicios</h2>
          <p className="text-xs text-bsm-text-muted mb-4">Selecciona los servicios que ofreces. Aparecen como badges en tu perfil público.</p>
          <div className="grid grid-cols-2 gap-2">
            {SERVICES.map(({ value, label }) => {
              const selected = (form.services || []).includes(value)
              return (
                <label
                  key={value}
                  className={`flex items-center gap-2.5 px-3 py-2.5 border cursor-pointer transition-colors
                    ${selected
                      ? 'border-gold/40 bg-gold/5 text-gold'
                      : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleService(value)}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Datos de contacto y ubicación */}
        <div className="bg-surface border border-bsm-border p-6 space-y-4">
          <div>
            <h2 className="font-medium text-bsm-text-primary mb-1">Datos de contacto y ubicación</h2>
            <p className="text-xs text-bsm-text-muted mb-4">Visible en tu perfil público. Solo introduce datos que quieras mostrar a compradores.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-base">Teléfono público</label>
              <input type="tel" value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} placeholder="+34 600 000 000" className="input-base" />
            </div>
            <div>
              <label className="label-base">WhatsApp</label>
              <input type="tel" value={form.whatsapp || ''} onChange={(e) => update('whatsapp', e.target.value)} placeholder="+34600000000" className="input-base" />
            </div>
          </div>
          <div>
            <label className="label-base">Email público</label>
            <input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} placeholder="contacto@tushowroom.com" className="input-base" />
          </div>
          <div>
            <label className="label-base">Información de atención <span className="text-bsm-text-muted font-normal">(opcional)</span></label>
            <input
              value={form.attention_note || ''}
              onChange={(e) => update('attention_note', e.target.value)}
              placeholder="Visitas bajo cita previa"
              className="input-base"
              maxLength={120}
            />
            <p className="text-[10px] text-bsm-text-muted mt-1">Ej: Visitas bajo cita previa · Lunes a viernes 10–19h…</p>
          </div>
        </div>

        {/* Redes y enlaces */}
        <div className="bg-surface border border-bsm-border p-6 space-y-4">
          <div>
            <h2 className="font-medium text-bsm-text-primary mb-1">Redes y enlaces</h2>
            <p className="text-xs text-bsm-text-muted mb-4">
              Se mostrarán como iconos en tu perfil público. Usa URLs completas (https://…). Los campos son opcionales.
            </p>
          </div>
          {[
            { key: 'website',      label: 'Web oficial',  placeholder: 'https://tushowroom.com' },
            { key: 'instagram',    label: 'Instagram',    placeholder: 'https://www.instagram.com/tushowroom' },
            { key: 'facebook_url', label: 'Facebook',     placeholder: 'https://www.facebook.com/tushowroom' },
            { key: 'youtube_url',  label: 'YouTube',      placeholder: 'https://www.youtube.com/@tushowroom' },
            { key: 'tiktok_url',   label: 'TikTok',       placeholder: 'https://www.tiktok.com/@tushowroom' },
            { key: 'linkedin_url', label: 'LinkedIn',     placeholder: 'https://www.linkedin.com/company/tushowroom' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label-base">{label}</label>
              <input
                type="url"
                value={form[key] || ''}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                className="input-base"
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <button type="submit" disabled={loading} className="btn-gold">
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && !saveError && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Guardado correctamente
              </div>
            )}
          </div>
          {saveError && (
            <p className="text-xs text-amber-400 leading-relaxed max-w-lg">{saveError}</p>
          )}
        </div>
      </form>
    </div>
  )
}
