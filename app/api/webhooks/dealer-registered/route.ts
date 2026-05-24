import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: false }, { status: 400 })

  const webhookUrl = process.env.N8N_WEBHOOK_DEALER_SIGNUP
  if (!webhookUrl) return NextResponse.json({ ok: true, skipped: true })

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      admin_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dealers`,
      registered_at: new Date().toISOString(),
    }),
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
