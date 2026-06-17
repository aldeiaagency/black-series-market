'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Shield } from 'lucide-react'
import PasswordInput from '@/components/auth/PasswordInput'

export default function AdminLoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Credenciales incorrectas.')
      setLoading(false)
      return
    }

    // Verify admin role server-side on next request
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email)
      .single()

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('No tienes permisos de administrador.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-surface border border-bsm-border flex items-center justify-center mx-auto mb-4">
            <Shield className="w-5 h-5 text-gold" />
          </div>
          <div className="font-display text-xl font-light tracking-[0.15em] text-bsm-text-primary">
            BLACK SERIES
          </div>
          <div className="text-[10px] tracking-[0.4em] text-gold uppercase mt-0.5">
            Administración
          </div>
        </div>

        <div className="bg-surface border border-bsm-border p-8">
          <h1 className="font-display text-xl font-light mb-1">Acceso restringido</h1>
          <p className="text-xs text-bsm-text-muted mb-8">Solo personal autorizado</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label-base">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <PasswordInput
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
              <p className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center mt-2"
            >
              {loading ? 'Verificando...' : 'Acceder'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-bsm-text-muted mt-6">
          ¿Eres concesionario?{' '}
          <a href="/login" className="text-gold hover:text-gold-light transition-colors">
            Accede aquí
          </a>
        </p>
      </div>
    </div>
  )
}
