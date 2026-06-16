import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const fullName = clean(body.full_name)
    const email = clean(body.email).toLowerCase()
    const dealerName = clean(body.dealer_name)
    const locationCity = clean(body.location_city)
    const locationRegion = clean(body.location_region)
    const phone = clean(body.phone)
    const website = clean(body.website)
    const message = clean(body.message)

    if (!fullName || !email || !dealerName || !locationCity || !phone) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para crear la solicitud.' }, { status: 400 })
    }

    const admin = createAdminClient()

    const [{ data: existingDealerByEmail }, { data: existingDealerByName }] = await Promise.all([
      admin.from('dealers').select('id').eq('email', email).maybeSingle(),
      admin.from('dealers').select('id').ilike('name', dealerName).maybeSingle(),
    ])

    if (existingDealerByEmail || existingDealerByName) {
      return NextResponse.json({ error: 'Ya existe un showroom registrado con esos datos.' }, { status: 409 })
    }

    const { data: existingApplication } = await admin
      .from('showroom_applications')
      .select('id,status')
      .eq('email', email)
      .in('status', ['new', 'in_review'])
      .maybeSingle()

    if (existingApplication) {
      return NextResponse.json({ error: 'Ya tenemos una solicitud pendiente asociada a ese email.' }, { status: 409 })
    }

    const { data: application, error: applicationError } = await admin.from('showroom_applications').insert({
      full_name: fullName,
      email,
      dealer_name: dealerName,
      location_city: locationCity,
      location_region: locationRegion || null,
      phone,
      website: website || null,
      message: message || null,
      status: 'new',
    }).select('id').single()

    if (applicationError || !application) {
      return NextResponse.json({ error: 'No se pudo guardar la solicitud de showroom.' }, { status: 500 })
    }

    const webhookUrl = process.env.N8N_WEBHOOK_DEALER_SIGNUP
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: application.id,
          dealer_name: dealerName,
          full_name: fullName,
          email,
          location_city: locationCity,
          location_region: locationRegion || null,
          phone,
          website: website || null,
          message: message || null,
          admin_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/altas-showroom`,
          registered_at: new Date().toISOString(),
        }),
      }).catch(() => {})
    }

    return NextResponse.json({
      application_id: application.id,
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
