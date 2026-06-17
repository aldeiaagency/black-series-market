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
  const { error, count } = await admin
    .from('leads')
    .delete({ count: 'exact' })
    .lt('created_at', cutoff.toISOString())

  if (error) {
    console.error('[cleanup-leads] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`[cleanup-leads] Deleted ${count} leads older than 12 months`)
  return NextResponse.json({ ok: true, deleted: count })
}
