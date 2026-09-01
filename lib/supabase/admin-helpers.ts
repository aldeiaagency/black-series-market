import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'

export type AdminClient = ReturnType<typeof createAdminClient>

// Volumen actual muy bajo; una pagina amplia permite localizar un usuario de auth
// existente por email sin depender de un endpoint de busqueda dedicado.
export async function findAuthUserByEmail(admin: AdminClient, email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) return null
  const normalized = email.trim().toLowerCase()
  return data.users.find((user) => user.email?.toLowerCase() === normalized) ?? null
}
