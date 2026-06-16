import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const fullName = clean(body.full_name)
    const email = clean(body.email).toLowerCase()
    const password = clean(body.password)
    const dealerName = clean(body.dealer_name)
    const locationCity = clean(body.location_city)
    const locationRegion = clean(body.location_region)
    const phone = clean(body.phone)

    if (!fullName || !email || !password || !dealerName || !locationCity || !phone) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para crear la solicitud.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (authError || !authData.user) {
      const message = authError?.message || 'No se pudo crear la cuenta.'
      const isDuplicate = /already|registered|exists/i.test(message)

      return NextResponse.json(
        { error: isDuplicate ? 'Ya existe una cuenta con ese email.' : message },
        { status: isDuplicate ? 409 : 400 }
      )
    }

    const userId = authData.user.id

    const { error: profileError } = await admin.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
      role: 'dealer',
    }, { onConflict: 'id' })

    if (profileError) {
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'No se pudo preparar el perfil profesional.' }, { status: 500 })
    }

    const slug = `${slugify(dealerName)}-${Math.random().toString(36).slice(2, 8)}`
    const { data: dealerData, error: dealerError } = await admin.from('dealers').insert({
      profile_id: userId,
      slug,
      name: dealerName,
      location_city: locationCity,
      location_region: locationRegion || null,
      phone,
      email,
      status: 'pending',
      vehicle_slots: 0,
    }).select('id').single()

    if (dealerError || !dealerData) {
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'No se pudo crear la solicitud de showroom.' }, { status: 500 })
    }

    return NextResponse.json({
      dealer_id: dealerData.id,
      dealer_name: dealerName,
      email,
      location_city: locationCity,
      phone,
    })
  } catch (error) {
    console.error('register-dealer error', error)
    return NextResponse.json({ error: 'Error inesperado al crear la solicitud.' }, { status: 500 })
  }
}
