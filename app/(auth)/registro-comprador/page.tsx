'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/brand/Logo'
import PasswordInput from '@/components/auth/PasswordInput'
import { checkPassword } from '@/lib/password'
import { Mail } from 'lucide-react'

function translateAuthError(msg: string): string {
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Este email ya tiene una cuenta. Prueba a iniciar sesión o recuperar la contraseña.'
  if (msg.includes('Signups not allowed'))
    return 'El registro está temporalmente desactivado. Inténtalo más tarde.'
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.'
  if (msg.includes('Invalid email') || msg.includes('invalid email'))
    return 'El formato del email no es válido.'
  return msg || 'Ha ocurrido un error. Inténtalo de nuevo.'
}

export default function RegistroCompradorPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const check = checkPassword(form.password)
    if (!check.ok) {
      setError(check.error ?? 'La contraseña no cumple los requisitos.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })

    setLoading(false)

    if (authError) {
      setError(translateAuthError(authError.message))
      return
    }

    // If user was created, mark as buyer (profile row created by trigger)
    if (authData.user) {
      await supabase.from('profiles').update({ role: 'buyer' }).eq('id', authData.user.id)
    }

    // Whether email needs confirmation or was already registered (Supabase hides the difference),
    // always show the "check your email" screen — avoids exposing account existence.
    setSent(true)
  }

  // ── Email sent confirmation ───────────────────────────────────────────────
  if (sent) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-10">
            <Link href="/"><Logo width={160} /></Link>
          </div>
          <div className="bg-surface border border-bsm-border p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-5 h-5 text-gold" />
            </div>
            <h1 className="font-display text-2xl font-light mb-2">Revisa tu email</h1>
            <p className="text-sm text-bsm-text-muted mb-1">
              Hemos enviado un enlace de confirmación a:
            </p>
            <p className="text-sm text-bsm-text-primary font-medium mb-6">{form.email}</p>
            <p className="text-xs text-bsm-text-muted leading-relaxed mb-6">
              Haz clic en el enlace para activar tu cuenta. Si no ves el email, revisa la carpeta de spam.
              El enlace caduca en 24 horas.
            </p>
            <p className="text-xs text-bsm-text-muted">
              ¿Email incorrecto?{' '}
              <button onClick={() => setSent(false)} className="text-gold hover:text-gold-light transition-colors">
                Volver e intentarlo de nuevo
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Link href="/"><Logo width={160} /></Link>
        </div>

        <div className="bg-surface border border-bsm-border p-8">
          <h1 className="font-display text-2xl font-light mb-1">Crear cuenta</h1>
          <p className="text-sm text-bsm-text-muted mb-8">
            Guarda favoritos y recibe alertas de búsqueda
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-base" htmlFor="reg-buyer-name">Nombre</label>
              <input
                id="reg-buyer-name"
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                placeholder="Tu nombre"
                className="input-base"
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="label-base" htmlFor="reg-buyer-email">Email</label>
              <input
                id="reg-buyer-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="tu@email.com"
                className="input-base"
                autoComplete="email"
                required
              />
            </div>
            <PasswordInput
              id="reg-buyer-password"
              value={form.password}
              onChange={(v) => update('password', v)}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              showStrength
              minLength={8}
              required
            />

            {error && (
              <p role="alert" className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
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
              <Link href="/registro" className="text-gold hover:text-gold-light transition-colors font-medium">
                Acceso profesional
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
