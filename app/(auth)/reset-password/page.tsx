'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/brand/Logo'
import PasswordInput from '@/components/auth/PasswordInput'
import { checkPassword } from '@/lib/password'
import { ShieldCheck, AlertTriangle } from 'lucide-react'

type SessionState = 'checking' | 'valid' | 'invalid'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [sessionState, setSessionState] = useState<SessionState>('checking')
  const router = useRouter()

  // El enlace de recovery (vía /auth/confirm) ya estableció una sesión temporal.
  // Verificamos que exista; si no, el enlace es inválido o se entró directo.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setSessionState(data.user ? 'valid' : 'invalid')
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const check = checkPassword(password)
    if (!check.ok) {
      setError(check.error ?? 'La contraseña no cumple los requisitos.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message || 'No se pudo actualizar la contraseña. Solicita un enlace nuevo.')
      setLoading(false)
      return
    }

    // Forzamos re-login con la nueva contraseña por seguridad.
    await supabase.auth.signOut()
    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/login'), 2500)
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
          {/* Estado: comprobando sesión */}
          {sessionState === 'checking' && (
            <p className="text-sm text-bsm-text-muted text-center py-8">Verificando enlace...</p>
          )}

          {/* Estado: enlace inválido */}
          {sessionState === 'invalid' && !done && (
            <div className="text-center">
              <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-5 h-5 text-gold" />
              </div>
              <h1 className="font-display text-2xl font-light mb-2">Enlace no válido</h1>
              <p className="text-sm text-bsm-text-muted leading-relaxed mb-6">
                Este enlace de recuperación ha caducado o ya se ha usado. Solicita uno nuevo.
              </p>
              <Link href="/recuperar" className="btn-gold w-full justify-center">
                Solicitar nuevo enlace
              </Link>
            </div>
          )}

          {/* Estado: contraseña actualizada */}
          {done && (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="font-display text-2xl font-light mb-2">Contraseña actualizada</h1>
              <p className="text-sm text-bsm-text-muted leading-relaxed mb-6">
                Ya puedes acceder con tu nueva contraseña. Redirigiendo...
              </p>
              <Link href="/login" className="btn-outline w-full justify-center">
                Ir a acceder
              </Link>
            </div>
          )}

          {/* Estado: formulario */}
          {sessionState === 'valid' && !done && (
            <>
              <h1 className="font-display text-2xl font-light mb-1">Nueva contraseña</h1>
              <p className="text-sm text-bsm-text-muted mb-8">
                Crea una contraseña segura para tu cuenta.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordInput
                  id="reset-password-new"
                  label="Nueva contraseña"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  showStrength
                  required
                />
                <PasswordInput
                  id="reset-password-confirm"
                  label="Repetir contraseña"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                  placeholder="Repite la contraseña"
                  required
                />

                {error && (
                  <p role="alert" className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className="btn-gold w-full justify-center mt-2">
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
