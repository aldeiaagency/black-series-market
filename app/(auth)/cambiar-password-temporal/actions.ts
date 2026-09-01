'use server'

import { redirect } from 'next/navigation'
import { checkPassword } from '@/lib/password'
import { createClient } from '@/lib/supabase/server'

export async function changeTemporaryPassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.must_change_password !== true) redirect('/dashboard')

  const password = ((formData.get('password') as string | null) ?? '').trim()
  const confirm = ((formData.get('confirm') as string | null) ?? '').trim()

  const passwordCheck = checkPassword(password)
  if (!passwordCheck.ok) redirect('/cambiar-password-temporal?error=policy')
  if (password !== confirm) redirect('/cambiar-password-temporal?error=mismatch')

  const { error } = await supabase.auth.updateUser({
    password,
    data: {
      ...user.user_metadata,
      must_change_password: false,
    },
  })

  if (error) redirect('/cambiar-password-temporal?error=update')
  redirect('/dashboard')
}