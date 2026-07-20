'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { CURRENT_PROFESSIONAL_TERMS_VERSION } from '@/lib/legal'

export async function acceptProfessionalTerms() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getDealerAccess(user.id)
  if (!access) redirect('/registro')

  const admin = createAdminClient()
  await admin
    .from('dealers')
    .update({
      terms_accepted_version: CURRENT_PROFESSIONAL_TERMS_VERSION,
      terms_accepted_at: new Date().toISOString(),
    })
    .eq('id', access.dealerId)

  redirect('/dashboard')
}
