'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/brand/Logo'

const PORTALES = ['Coches.net', 'Mobile.de', 'Autoscout24', 'Wallapop', 'Motorflash', 'Otros']

export default function RegistroPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    dealer_name: '',
    location_city: '',
    location_region: '',
    phone: '',
    website: '',
    google_business_url: '',
    instagram_url: '',
    portales: [] as string[],
    portal_url: '',
  })

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function togglePortal(p: string) {
    setForm((f) => ({
      ...f,
      portales: f.portales.includes(p) ? f.portales.filter((x) => x !== p) : [...f.portales, p],
    }))
  }

  function goToStep2(e: React.FormEvent) {
    e.preventDefault()
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // At least one public URL required for the investigation agent
    if (!form.website && !form.google_business_url && !form.instagram_url) {
      setError('Incluye al menos una URL pública (web, Google Business o Instagram) para que podamos revisar tu showroom.')
      return
    }

    setLoading(true)

    const response = await fetch('/api/auth/register-dealer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const result = await response.json()

    if (!response.ok) {
      setError(result.error || 'Error al enviar la solicitud')
      setLoading(false)
      return
    }

    router.push(`/solicitud-enviada?tipo=showroom&email=${encodeURIComponent(result.email || form.email)}`)
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-10">
          <Link href="/"><Logo width={160} /></Link>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                ${step >= s ? 'bg-gold text-obsidian' : 'bg-surface border border-bsm-border text-bsm-text-muted'}`}>
                {s}
              </div>
              <span className={`text-xs ${step >= s ? 'text-bsm-text-primary' : 'text-bsm-text-muted'}`}>
                {s === 1 ? 'Contacto' : 'Tu showroom'}
              </span>
              {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-gold' : 'bg-bsm-border'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-surface border border-bsm-border p-8">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <h1 className="font-display text-2xl font-light mb-1">Registrar showroom</h1>
              <p className="text-sm text-bsm-text-muted mb-8">Datos de contacto para revisar la solicitud</p>

              <form onSubmit={goToStep2} className="space-y-4">
                <div>
                  <label className="label-base">Nombre completo</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    placeholder="Tu nombre y apellidos"
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label className="label-base">Email de contacto</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="tu@email.com"
                    className="input-base"
                    required
                  />
                </div>
                <button type="submit" className="btn-gold w-full justify-center mt-2">
                  Continuar
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-bsm-border text-center">
                <p className="text-sm text-bsm-text-muted">
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/login" className="text-gold hover:text-gold-light transition-colors">Acceder</Link>
                </p>
              </div>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <h1 className="font-display text-2xl font-light mb-1">Tu showroom</h1>
              <p className="text-sm text-bsm-text-muted mb-8">
                Necesitamos revisar tu reputación antes de activar el acceso — solo te pedimos tus presencias públicas.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Basic info */}
                <div className="space-y-4">
                  <div>
                    <label className="label-base">Nombre del showroom</label>
                    <input
                      value={form.dealer_name}
                      onChange={(e) => update('dealer_name', e.target.value)}
                      placeholder="Elite Motors Madrid"
                      className="input-base"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-base">Ciudad</label>
                      <input
                        value={form.location_city}
                        onChange={(e) => update('location_city', e.target.value)}
                        placeholder="Madrid"
                        className="input-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="label-base">Provincia</label>
                      <input
                        value={form.location_region}
                        onChange={(e) => update('location_region', e.target.value)}
                        placeholder="Madrid"
                        className="input-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-base">Teléfono de contacto</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+34 600 000 000"
                      className="input-base"
                      required
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-bsm-border pt-5">
                  <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-4">
                    Tu presencia online · al menos una URL
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="label-base">Google Business</label>
                      <input
                        type="url"
                        value={form.google_business_url}
                        onChange={(e) => update('google_business_url', e.target.value)}
                        placeholder="https://maps.app.goo.gl/..."
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="label-base">Instagram</label>
                      <input
                        type="url"
                        value={form.instagram_url}
                        onChange={(e) => update('instagram_url', e.target.value)}
                        placeholder="https://www.instagram.com/tushowroom"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="label-base">Web oficial</label>
                      <input
                        type="url"
                        value={form.website}
                        onChange={(e) => update('website', e.target.value)}
                        placeholder="https://tushowroom.com"
                        className="input-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Portales */}
                <div className="border-t border-bsm-border pt-5">
                  <p className="text-xs text-bsm-text-muted uppercase tracking-widest mb-3">
                    Presencia en portales · opcional
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PORTALES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePortal(p)}
                        className={`text-xs px-3 py-1.5 border transition-colors ${
                          form.portales.includes(p)
                            ? 'border-gold text-gold bg-gold/5'
                            : 'border-bsm-border text-bsm-text-muted hover:border-bsm-border-light'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  {form.portales.length > 0 && (
                    <div>
                      <label className="label-base">URL de tu perfil en el portal</label>
                      <input
                        type="url"
                        value={form.portal_url}
                        onChange={(e) => update('portal_url', e.target.value)}
                        placeholder="https://www.coches.net/concesionarios/..."
                        className="input-base"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">
                    Atrás
                  </button>
                  <button type="submit" disabled={loading} className="btn-gold flex-1 justify-center">
                    {loading ? 'Enviando solicitud...' : 'Solicitar alta'}
                  </button>
                </div>

                <p className="text-[10px] text-bsm-text-muted text-center leading-relaxed">
                  El envío no crea una cuenta ni implica aceptación automática. Revisamos cada showroom antes de habilitar el acceso.
                </p>
                <p className="text-[10px] text-bsm-text-muted text-center">
                  Al registrarte aceptas nuestros{' '}
                  <Link href="/legal/terminos" className="text-gold">términos de uso</Link>
                  {' '}y{' '}
                  <Link href="/legal/privacidad" className="text-gold">política de privacidad</Link>.
                </p>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
