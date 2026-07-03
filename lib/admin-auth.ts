import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Guard de administración para Server Actions y handlers.
 *
 * El guard de `AdminLayout` solo protege el RENDER de la página (GET). NO protege la
 * ejecución de una Server Action, que es un POST directo al endpoint de la action y no
 * re-ejecuta el layout. Por eso cada Server Action bajo `app/(admin)/**` debe llamar a
 * `assertAdmin()` como PRIMERA línea; si no, cualquier usuario autenticado (p. ej. un
 * comprador) puede invocarla.
 *
 * Devuelve el id del admin autenticado (útil para sellar `reviewed_by`, etc.).
 * Redirige a `/admin-login` si no hay sesión o el rol no es admin (aborta la action).
 */
export async function assertAdmin(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin-login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin-login')
  return user.id
}
