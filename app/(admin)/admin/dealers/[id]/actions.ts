'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { assertAdmin } from '@/lib/admin-auth'
import { generateDealerImportApiKey, hashDealerApiKey } from '@/lib/dealer-api-keys'
import { createAdminClient } from '@/lib/supabase/server'

export interface GenerateDealerImportKeyState {
  key?: string
  label?: string
  error?: string
}

export async function generateDealerImportKey(
  _prevState: GenerateDealerImportKeyState,
  formData: FormData,
): Promise<GenerateDealerImportKeyState> {
  await assertAdmin()

  const dealerId = (formData.get('dealerId') as string | null)?.trim()
  const label = ((formData.get('label') as string | null) ?? '').trim()
  if (!dealerId) return { error: 'Falta el showroom.' }

  const admin = createAdminClient()
  const { data: dealer } = await admin.from('dealers').select('id').eq('id', dealerId).maybeSingle()
  if (!dealer) return { error: 'Showroom no encontrado.' }

  const key = generateDealerImportApiKey()
  const { error } = await admin.from('dealer_api_keys').insert({
    dealer_id: dealerId,
    key_hash: hashDealerApiKey(key),
    label: label || null,
  })

  if (error) return { error: 'No se pudo generar la clave.' }

  revalidatePath(`/admin/dealers/${dealerId}`)
  return { key, label: label || 'Sin etiqueta' }
}

export async function revokeDealerImportKey(formData: FormData) {
  await assertAdmin()

  const dealerId = (formData.get('dealerId') as string | null)?.trim()
  const keyId = (formData.get('keyId') as string | null)?.trim()
  if (!dealerId || !keyId) redirect('/admin/dealers')

  const admin = createAdminClient()
  await admin
    .from('dealer_api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('dealer_id', dealerId)
    .is('revoked_at', null)

  revalidatePath(`/admin/dealers/${dealerId}`)
  redirect(`/admin/dealers/${dealerId}`)
}