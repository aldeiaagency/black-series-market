import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const fullName             = clean(body.full_name)
    const email                = clean(body.email).toLowerCase()
    const dealerName           = clean(body.dealer_name)
    const locationCity         = clean(body.location_city)
    const locationRegion       = clean(body.location_region)
    const phone                = clean(body.phone)
    const website              = clean(body.website)
    const googleBusinessUrl    = clean(body.google_business_url)
    const instagramUrl         = clean(body.instagram_url)
    const portales: string[]   = Array.isArray(body.portales) ? body.portales.filter((p: unknown) => typeof p === 'string') : []
    const portalUrl            = clean(body.portal_url)

    if (!fullName || !email || !dealerName || !locationCity || !phone) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para crear la solicitud.' }, { status: 400 })
    }

    if (!website && !googleBusinessUrl && !instagramUrl) {
      return NextResponse.json({ error: 'Incluye al menos una URL pública para revisar el showroom.' }, { status: 400 })
    }

    const admin = createAdminClient()

    const [{ data: existingByEmail }, { data: existingByName }] = await Promise.all([
      admin.from('dealers').select('id').eq('email', email).maybeSingle(),
      admin.from('dealers').select('id').ilike('name', dealerName).maybeSingle(),
    ])

    if (existingByEmail || existingByName) {
      return NextResponse.json({ error: 'Ya existe un showroom registrado con esos datos.' }, { status: 409 })
    }

    const { data: existingApplication } = await admin
      .from('showroom_applications')
      .select('id, status')
      .eq('email', email)
      .in('status', ['new', 'in_review'])
      .maybeSingle()

    if (existingApplication) {
      return NextResponse.json({ error: 'Ya tenemos una solicitud pendiente asociada a ese email.' }, { status: 409 })
    }

    const { data: application, error: applicationError } = await admin
      .from('showroom_applications')
      .insert({
        full_name:            fullName,
        email,
        dealer_name:          dealerName,
        location_city:        locationCity,
        location_region:      locationRegion  || null,
        phone,
        website:              website         || null,
        google_business_url:  googleBusinessUrl || null,
        instagram_url:        instagramUrl    || null,
        portales:             portales.length > 0 ? portales : null,
        portal_url:           portalUrl       || null,
        status:               'new',
      })
      .select('id')
      .single()

    if (applicationError || !application) {
      console.error('register-dealer insert error', applicationError)
      return NextResponse.json({ error: 'No se pudo guardar la solicitud de showroom.' }, { status: 500 })
    }

    // Fire n8n webhook for investigation agent
    const webhookUrl = process.env.N8N_WEBHOOK_DEALER_SIGNUP
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id:       application.id,
          dealer_name:          dealerName,
          full_name:            fullName,
          email,
          location_city:        locationCity,
          location_region:      locationRegion  || null,
          phone,
          website:              website         || null,
          google_business_url:  googleBusinessUrl || null,
          instagram_url:        instagramUrl    || null,
          portales:             portales.length > 0 ? portales : null,
          portal_url:           portalUrl       || null,
          admin_url:            `${process.env.NEXT_PUBLIC_APP_URL}/admin/altas-showroom`,
          registered_at:        new Date().toISOString(),
        }),
      }).catch(() => {})
    }

    return NextResponse.json({
      application_id: application.id,
      dealer_name:    dealerName,
      email,
      location_city:  locationCity,
      phone,
    })
  } catch (error) {
    console.error('register-dealer error', error)
    return NextResponse.json({ error: 'Error inesperado al crear la solicitud.' }, { status: 500 })
  }
}
