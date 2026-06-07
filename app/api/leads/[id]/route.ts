import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES = ['new', 'contacted', 'negotiating', 'appointment', 'reserved', 'closed', 'lost', 'discarded']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida. Inicia sesión de nuevo.' }, { status: 401 })

  const { data: dealer } = await supabase
    .from('dealers').select('id').eq('profile_id', user.id).single()
  if (!dealer) return NextResponse.json({ error: 'No tienes un perfil de showroom activo.' }, { status: 403 })

  const { status } = await req.json()
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado no válido.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
    .eq('dealer_id', dealer.id)

  if (error) return NextResponse.json({ error: 'Error al actualizar el lead. Inténtalo de nuevo.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
