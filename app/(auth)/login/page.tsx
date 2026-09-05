'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/brand/Logo'
import PasswordInput from '@/components/auth/PasswordInput'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !data.user) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
      return
    }

    // Route by role: dealer → dashboard, buyer → homepage.
    // Corrección 2026-09-04: la auditoría de seguridad P0.2 (2026-09-02) revocó la lectura directa
    // de dealers.profile_id para 'authenticated' y migró middleware.ts a esta misma RPC — esta
    // página se quedó con el .eq('profile_id', ...) viejo, que desde entonces no devolvía nunca
    // ninguna fila (sin error visible), así que todo dealer que iniciaba sesión aquí caía siempre
    // a home en vez de a su dashboard. Hallado en el simulacro E2E Karboceramic.
    const { data: dealerRows } = await supabase.rpc('get_own_dealer_summary')
    const dealer = dealerRows?.[0] ?? null

    router.push(dealer ? '/dashboard' : '/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Logo width={160} />
          </Link>
        </div>

        <div className="bg-surface border border-bsm-border p-8">
          <h1 className="font-display text-2xl font-light mb-1">Acceder</h1>
          <p className="text-sm text-bsm-text-muted mb-8">Accede a tu cuenta</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label-base" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-base"
                autoComplete="email"
                aria-invalid={!!error}
                required
              />
            </div>
            <div>
              <PasswordInput
                id="login-password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                required
              />
              <div className="text-right mt-2">
                <Link href="/recuperar" className="text-xs text-bsm-text-muted hover:text-gold transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center mt-6"
            >
              {loading ? 'Accediendo...' : 'Acceder'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-bsm-border space-y-3 text-center">
            <p className="text-sm text-bsm-text-muted">
              ¿Sin cuenta?{' '}
              <Link href="/registro-comprador" className="text-gold hover:text-gold-light transition-colors">
                Crear cuenta gratuita
              </Link>
            </p>
            <p className="text-xs text-bsm-text-muted">
              ¿Eres concesionario?{' '}
              <Link href="/profesionales" className="text-bsm-text-secondary hover:text-gold transition-colors">
                Conocer el acceso profesional
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
