import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const revalidate = 300 // 5 minutes

export async function GET() {
  try {
    const admin = await createAdminClient()
    const { data } = await admin
      .from('platform_config')
      .select('value')
      .eq('key', 'social_links')
      .single()

    const links = data?.value as Record<string, string> | null
    return NextResponse.json(links || {})
  } catch {
    return NextResponse.json({})
  }
}
