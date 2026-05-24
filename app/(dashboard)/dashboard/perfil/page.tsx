'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Upload, X } from 'lucide-react'

export default function PerfilPage() {
  const [dealer, setDealer] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    }
    load()
  }, [router])

  function update(key: string, value: string) {
    setForm((f: any) => ({ ...f, [key]: value }))
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoError(null)
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload?type=logo', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { setLogoError(json.error || 'Error al subir el logo'); return }
      setLogoUrl(json.url)
    } catch {
      setLogoError('Error de conexión al subir el logo')
    } finally {
      setLogoUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoveLogo() {
    const supabase = createClient()
    await supabase.from('dealers').update({ logo_url: null }).eq('id', dealer.id)
    setLogoUrl(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('dealers').update({
      name:             form.name,
      description:      form.description,
      location_city:    form.location_city,
      location_region:  form.location_region,
      address:          form.address,
      phone:            form.phone,
      whatsapp:         form.whatsapp,
      email:            form.email,
      website:          form.website,
      instagram:        form.instagram,
      years_in_business: form.years_in_business ? parseInt(form.years_in_business) : null,
    }).eq('id', dealer.id)
    setLoading(false)
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
        <h1 className="font-display text-3xl font-light mb-1">Perfil del concesionario</h1>
        <p className="text-sm text-bsm-text-muted">
          Esta información es visible en tu página pública del marketplace.
        </p>
      </div>

      {/* Logo upload */}
      <div className="bg-surface border border-bsm-border p-6 mb-6">
        <h2 className="font-medium text-bsm-text-primary mb-1">Logo del concesionario</h2>
        <p className="text-xs text-bsm-text-muted mb-5">
          Se muestra en las tarjetas de vehículos y en tu página de showroom. JPG, PNG o WebP, máx. 2 MB.
        </p>

        <div className="flex items-center gap-5">
          {/* Preview */}
          <div className="w-16 h-16 flex-shrink-0 bg-[#0D0D0D] border border-bsm-border flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="font-display text-2xl font-light text-[#C6A64B]/40 select-none">
                {initial}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleLogoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="btn-outline text-sm px-4 py-2 flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              {logoUploading ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="flex items-center gap-1.5 text-xs text-bsm-text-muted hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
                Eliminar logo
              </button>
            )}
          </div>
        </div>

        {logoError && (
          <p className="mt-3 text-xs text-red-400">{logoError}</p>
        )}
        {logoUrl && !logoUploading && (
          <p className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" />
            Logo guardado correctamente
          </p>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-surface border border-bsm-border p-6 space-y-4">
          <h2 className="font-medium text-bsm-text-primary mb-4">Información básica</h2>

          <div>
            <label className="label-base">Nombre del concesionario</label>
            <input value={form.name || ''} onChange={(e) => update('name', e.target.value)} className="input-base" required />
          </div>
          <div>
            <label className="label-base">Descripción</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              className="input-base resize-none"
              placeholder="Describe tu concesionario, especialización, años de experiencia..."
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
            <input value={form.address || ''} onChange={(e) => update('address', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="label-base">Años en el sector</label>
            <input type="number" min="0" max="100" value={form.years_in_business || ''} onChange={(e) => update('years_in_business', e.target.value)} className="input-base" />
          </div>
        </div>

        <div className="bg-surface border border-bsm-border p-6 space-y-4">
          <h2 className="font-medium text-bsm-text-primary mb-4">Contacto</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-base">Teléfono</label>
              <input type="tel" value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} placeholder="+34 600 000 000" className="input-base" />
            </div>
            <div>
              <label className="label-base">WhatsApp</label>
              <input type="tel" value={form.whatsapp || ''} onChange={(e) => update('whatsapp', e.target.value)} placeholder="+34600000000" className="input-base" />
            </div>
          </div>
          <div>
            <label className="label-base">Email de contacto</label>
            <input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="label-base">Web</label>
            <input type="url" value={form.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="https://tuconcesionario.com" className="input-base" />
          </div>
          <div>
            <label className="label-base">Instagram (@)</label>
            <input value={form.instagram || ''} onChange={(e) => update('instagram', e.target.value)} placeholder="@tuconcesionario" className="input-base" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn-gold">
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Guardado correctamente
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
