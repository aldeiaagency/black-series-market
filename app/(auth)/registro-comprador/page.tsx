'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/brand/Logo'

export default function RegistroCompradorPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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

    // Mark as buyer (profiles row created by trigger)
    await supabase
      .from('profiles')
      .update({ role: 'buyer' })
      .eq('id', authData.user.id)

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Logo width={160} />
          </Link>
        </div>

        <div className="bg-surface border border-bsm-border p-8">
          <h1 className="font-display text-2xl font-light mb-1">Crear cuenta</h1>
          <p className="text-sm text-bsm-text-muted mb-8">
            Guarda favoritos y recibe alertas de búsqueda
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-base">Nombre</label>
              <input
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                placeholder="Tu nombre"
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="label-base">Email</label>
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

            {error && (
              <p className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center mt-2"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratuita'}
            </button>

            <p className="text-[10px] text-bsm-text-muted text-center pt-1 leading-relaxed">
              Al registrarte aceptas nuestros{' '}
              <Link href="/legal/terminos" className="text-gold">términos de uso</Link>
              {' '}y{' '}
              <Link href="/legal/privacidad" className="text-gold">política de privacidad</Link>.
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-bsm-border space-y-3 text-center">
            <p className="text-sm text-bsm-text-muted">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
                Acceder
              </Link>
            </p>
            <p className="text-xs text-bsm-text-muted">
              ¿Eres concesionario?{' '}
              <Link href="/registro" className="text-bsm-text-secondary hover:text-gold transition-colors">
                Acceso profesional
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
