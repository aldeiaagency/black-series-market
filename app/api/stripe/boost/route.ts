import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

const BOOST_PRICE_EUR = 4900 // €49 in cents

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida. Inicia sesión de nuevo.' }, { status: 401 })

  const { vehicleId } = await req.json()
  if (!vehicleId) return NextResponse.json({ error: 'Vehículo no especificado.' }, { status: 400 })

  const { data: dealer } = await supabase
    .from('dealers')
    .select('id, stripe_customer_id, email')
    .eq('profile_id', user.id)
    .single()
  if (!dealer) return NextResponse.json({ error: 'No tienes un perfil de showroom activo.' }, { status: 403 })

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, brand_name, model_name, year, dealer_id')
    .eq('id', vehicleId)
    .eq('dealer_id', dealer.id)
    .single()
  if (!vehicle) return NextResponse.json({ error: 'Vehículo no encontrado.' }, { status: 404 })

  let customerId = dealer.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dealer.email || user.email,
      metadata: { dealer_id: dealer.id, user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('dealers').update({ stripe_customer_id: customerId }).eq('id', dealer.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: BOOST_PRICE_EUR,
        product_data: {
          name: `Boost 7 días — ${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year}`,
          description: 'Tu vehículo aparecerá destacado en la parte superior de los resultados durante 7 días.',
        },
      },
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inventario?boost=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inventario`,
    metadata: { type: 'boost', vehicle_id: vehicleId, dealer_id: dealer.id },
  })

  return NextResponse.json({ url: session.url })
}
