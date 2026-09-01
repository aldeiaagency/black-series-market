import { redirect } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/brand/Logo'
import { createClient } from '@/lib/supabase/server'
import { changeTemporaryPassword } from './actions'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const ERROR_MESSAGES: Record<string, string> = {
  policy: 'La contrasena debe tener al menos 8 caracteres, una letra y un numero.',
  mismatch: 'Las contrasenas no coinciden.',
  update: 'No se pudo actualizar la contrasena. Vuelve a intentarlo.',
}

export default async function CambiarPasswordTemporalPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.must_change_password !== true) redirect('/dashboard')

  const { error } = await searchParams
  const errorCode = typeof error === 'string' ? error : ''
  const errorMessage = ERROR_MESSAGES[errorCode]

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Link href="/"><Logo width={160} /></Link>
        </div>

        <div className="bg-surface border border-bsm-border p-8">
          <h1 className="font-display text-2xl font-light mb-1">Cambia tu contrasena</h1>
          <p className="text-sm text-bsm-text-muted mb-8">
            Esta cuenta se creo con una contrasena temporal. Define una nueva antes de acceder al panel.
          </p>

          <form action={changeTemporaryPassword} className="space-y-4">
            <div>
              <label className="label-base" htmlFor="password">Nueva contrasena</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base" htmlFor="confirm">Repetir contrasena</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="input-base"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
                {errorMessage}
              </p>
            )}

            <button type="submit" className="btn-gold w-full justify-center">
              Guardar y continuar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}