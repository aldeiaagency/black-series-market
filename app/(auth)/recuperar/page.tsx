'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/brand/Logo'
import { MailCheck } from 'lucide-react'

export default function RecuperarPage() {
  return (
    <Suspense fallback={null}>
      <RecuperarContent />
    </Suspense>
  )
}

function RecuperarContent() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const searchParams = useSearchParams()
  const linkError = searchParams.get('error') === 'enlace_invalido'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    })

    // No revelamos si el email existe o no (anti-enumeración): siempre mostramos éxito.
    if (resetError && resetError.status === 429) {
      setError('Demasiados intentos. Espera unos minutos antes de volver a probar.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-5">
                <MailCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="font-display text-2xl font-light mb-2">Revisa tu correo</h1>
              <p className="text-sm text-bsm-text-muted leading-relaxed mb-6">
                Si existe una cuenta asociada a <span className="text-bsm-text-secondary">{email}</span>,
                recibirás un enlace para restablecer tu contraseña. El enlace caduca en 1 hora.
              </p>
              <p className="text-xs text-bsm-text-muted mb-6">
                ¿No lo ves? Revisa la carpeta de spam o correo no deseado.
              </p>
              <Link href="/login" className="btn-outline w-full justify-center">
                Volver a acceder
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-light mb-1">Recuperar contraseña</h1>
              <p className="text-sm text-bsm-text-muted mb-8">
                Introduce tu email y te enviaremos un enlace para crear una nueva contraseña.
              </p>

              {linkError && (
                <p className="text-sm text-[#C6A64B] bg-[#C6A64B]/5 border border-[#C6A64B]/20 px-4 py-3 mb-4">
                  El enlace ha caducado o no es válido. Solicita uno nuevo.
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-base">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input-base"
                    autoComplete="email"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className="btn-gold w-full justify-center mt-2">
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-bsm-border text-center">
                <p className="text-sm text-bsm-text-muted">
                  ¿Recordaste tu contraseña?{' '}
                  <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
                    Acceder
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
