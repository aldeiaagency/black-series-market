import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Verify admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const { reason } = await req.json()
  if (!reason?.trim()) return NextResponse.json({ error: 'El motivo de rechazo es obligatorio.' }, { status: 400 })

  const admin = await createAdminClient()
  const { error } = await admin
    .from('vehicles')
    .update({ status: 'draft', rejection_reason: reason.trim(), admin_notes: `Rechazado el ${new Date().toLocaleDateString('es-ES')}` })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Error al rechazar el vehículo. Inténtalo de nuevo.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
