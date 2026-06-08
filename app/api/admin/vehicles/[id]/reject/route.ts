import { createAdminClient, createClient } from '@/lib/supabase/server'
import { notifyN8n } from '@/lib/integrations/n8n'
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
  const { data: updated, error } = await admin
    .from('vehicles')
    .update({ status: 'draft', rejection_reason: reason.trim(), admin_notes: `Rechazado el ${new Date().toLocaleDateString('es-ES')}` })
    .eq('id', id)
    .select('id, brand_name, model_name, year, dealer_id')
    .single()

  if (error) return NextResponse.json({ error: 'Error al rechazar el vehículo. Inténtalo de nuevo.' }, { status: 500 })

  await notifyN8n('vehicle.rejected', {
    entityType: 'vehicle',
    entityId: id,
    dealerId: updated?.dealer_id ?? null,
    vehicleId: id,
    payload: { brand: updated?.brand_name, model: updated?.model_name, year: updated?.year, reason: reason.trim() },
  })

  return NextResponse.json({ ok: true })
}
