'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import Logo from '@/components/brand/Logo'

export default function RegistroPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    dealer_name: '',
    location_city: '',
    location_region: '',
    phone: '',
  })

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })

    if (authError || !authData.user) {
      setError(authError?.message || 'Error al crear la cuenta')
      setLoading(false)
      return
    }

    await supabase.from('profiles').update({ role: 'dealer' }).eq('id', authData.user.id)

    const slug = slugify(form.dealer_name) + '-' + Math.random().toString(36).slice(2, 6)
    const { error: dealerError } = await supabase.from('dealers').insert({
      profile_id: authData.user.id,
      slug,
      name: form.dealer_name,
      location_city: form.location_city,
      location_region: form.location_region,
      phone: form.phone,
      email: form.email,
      status: 'trial',
      vehicle_slots: 5,
    })

    if (dealerError) {
      setError('Error al crear el perfil de concesionario.')
      setLoading(false)
      return
    }

    router.push('/dashboard?welcome=true')
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Logo width={160} />
          </Link>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                ${step >= s ? 'bg-gold text-obsidian' : 'bg-surface border border-bsm-border text-bsm-text-muted'}`}>
                {s}
              </div>
              <span className={`text-xs ${step >= s ? 'text-bsm-text-primary' : 'text-bsm-text-muted'}`}>
                {s === 1 ? 'Cuenta' : 'Concesionario'}
              </span>
              {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-gold' : 'bg-bsm-border'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-surface border border-bsm-border p-8">
          <h1 className="font-display text-2xl font-light mb-1">Registrar concesionario</h1>
          <p className="text-sm text-bsm-text-muted mb-8">
            {step === 1 ? 'Datos de acceso a tu cuenta' : 'Información de tu concesionario'}
          </p>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
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
                  <label className="label-base">Email de acceso</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="tu@email.com"
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label className="label-base">Contraseña</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="input-base"
                    minLength={8}
                    required
                  />
                </div>
                <button type="submit" className="btn-gold w-full justify-center mt-2">
                  Continuar
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="label-base">Nombre del concesionario</label>
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

                {error && (
                  <p className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-outline flex-1 justify-center"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold flex-1 justify-center"
                  >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </div>

                <p className="text-[10px] text-bsm-text-muted text-center pt-2">
                  Al registrarte aceptas nuestros{' '}
                  <Link href="/legal/terminos" className="text-gold">términos de uso</Link>
                  {' '}y{' '}
                  <Link href="/legal/privacidad" className="text-gold">política de privacidad</Link>.
                </p>
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-bsm-border text-center">
            <p className="text-sm text-bsm-text-muted">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
                Acceder
              </Link>
            </p>
          </div>
        </div>

        {/* Plan info */}
        <p className="text-center text-xs text-bsm-text-muted mt-6">
          Empieza con 5 vehículos gratuitos · Sin compromiso · Actualiza cuando quieras
        </p>
      </div>
    </div>
  )
}
