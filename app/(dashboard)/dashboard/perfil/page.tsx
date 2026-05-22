'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'

export default function PerfilPage() {
  const [dealer, setDealer] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('dealers').select('*').eq('profile_id', user.id).single()
      setDealer(data)
      setForm(data || {})
    }
    load()
  }, [router])

  function update(key: string, value: string) {
    setForm((f: any) => ({ ...f, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('dealers').update({
      name: form.name,
      description: form.description,
      location_city: form.location_city,
      location_region: form.location_region,
      address: form.address,
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      website: form.website,
      instagram: form.instagram,
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

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">Perfil del concesionario</h1>
        <p className="text-sm text-bsm-text-muted">
          Esta información es visible en tu página pública del marketplace.
        </p>
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
