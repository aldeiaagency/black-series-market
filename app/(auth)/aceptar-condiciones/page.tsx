import { redirect } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/brand/Logo'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { CURRENT_PROFESSIONAL_TERMS_VERSION } from '@/lib/legal'
import { acceptProfessionalTerms } from './actions'

export default async function AceptarCondicionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.must_change_password === true) redirect('/cambiar-password-temporal')

  const access = await getDealerAccess(user.id)
  if (!access) redirect('/registro')

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select('name, terms_accepted_at')
    .eq('id', access.dealerId)
    .single()

  if (!dealer) redirect('/registro')
  if (dealer.terms_accepted_at) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-10">
          <Link href="/"><Logo width={160} /></Link>
        </div>

        <div className="bg-surface border border-bsm-border p-8">
          <h1 className="font-display text-2xl font-light mb-1">Antes de continuar</h1>
          <p className="text-sm text-bsm-text-muted mb-8">
            {dealer.name} necesita aceptar las Condiciones para Profesionales para acceder al panel.
          </p>

          <form action={acceptProfessionalTerms} className="space-y-5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-0.5 accent-gold w-4 h-4 shrink-0"
              />
              <span className="text-xs text-bsm-text-secondary leading-relaxed">
                He leído y acepto, en nombre de {dealer.name}, las{' '}
                <Link href="/legal/condiciones-profesionales" target="_blank" className="text-gold hover:underline">
                  Condiciones para Profesionales
                </Link>
                {' '}(versión {CURRENT_PROFESSIONAL_TERMS_VERSION}), el{' '}
                <Link href="/legal/terminos" target="_blank" className="text-gold hover:underline">aviso de términos de uso</Link>
                {' '}y la{' '}
                <Link href="/legal/privacidad" target="_blank" className="text-gold hover:underline">política de privacidad</Link>.
              </span>
            </label>

            <button type="submit" className="btn-gold w-full justify-center">
              Aceptar y continuar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
