import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Called daily by Vercel Cron at 03:00 UTC.
// Vercel sends Authorization: Bearer <CRON_SECRET> — verify it before acting.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 1)

  const admin = createAdminClient()
  const cutoffIso = cutoff.toISOString()

  const [leadsResult, requestsResult] = await Promise.all([
    admin.from('leads').delete({ count: 'exact' }).lt('created_at', cutoffIso),
    admin.from('custom_requests').delete({ count: 'exact' }).lt('created_at', cutoffIso),
  ])

  if (leadsResult.error) {
    console.error('[cleanup] leads error:', leadsResult.error.message)
    return NextResponse.json({ error: leadsResult.error.message }, { status: 500 })
  }
  if (requestsResult.error) {
    console.error('[cleanup] custom_requests error:', requestsResult.error.message)
    return NextResponse.json({ error: requestsResult.error.message }, { status: 500 })
  }

  console.log(`[cleanup] Deleted ${leadsResult.count} leads + ${requestsResult.count} custom_requests older than 12 months`)
  return NextResponse.json({ ok: true, deleted_leads: leadsResult.count, deleted_requests: requestsResult.count })
}
