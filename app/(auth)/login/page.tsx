'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/brand/Logo'

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

    // Route by role: dealer → dashboard, buyer → homepage
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('profile_id', data.user.id)
      .single()

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
              <label className="label-base">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="label-base">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base"
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
