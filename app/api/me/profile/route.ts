import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'

// Perfil editable del showroom para dashboard/perfil (auditoría de seguridad 2026-09-02, P0.2):
// antes la página leía `dealers.select('*').eq('profile_id', user.id)` directo desde el
// navegador — profile_id deja de ser una columna legible por `authenticated` (allowlist
// pública) y `select('*')` habría expuesto también columnas internas (Stripe, notas admin,
// trial). Esta ruta usa service role y devuelve solo los campos que el formulario de perfil
// edita de verdad.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const access = await getDealerAccess(user.id)
  if (!access) return NextResponse.json({ error: 'no_showroom' }, { status: 404 })

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select(`
      id, name, description, logo_url, cover_url,
      location_city, location_region, location_country, address, postal_code,
      phone, whatsapp, email, attention_note,
      website, instagram, facebook_url, youtube_url, tiktok_url, linkedin_url,
      years_in_business, certifications, services
    `)
    .eq('id', access.dealerId)
    .single()

  if (!dealer) return NextResponse.json({ error: 'no_showroom' }, { status: 404 })

  return NextResponse.json({ dealer })
}
