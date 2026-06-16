import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { ok: false, error: 'Webhook deprecated. Dealer signup is handled by /api/auth/register-dealer.' },
    { status: 410 }
  )
}
