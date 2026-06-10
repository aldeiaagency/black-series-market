import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const revalidate = 300 // 5 minutes

const OFFICIAL_LINKS: Record<string, string> = {
  instagram: 'https://www.instagram.com/blacklabel_premiumcars/',
  tiktok:    'https://www.tiktok.com/@blacklabelmarket.es',
  facebook:  'https://www.facebook.com/blacklabel.es',
  youtube:   'https://www.youtube.com/@BlackLabelPremium',
}

export async function GET() {
  try {
    const admin = await createAdminClient()
    const { data } = await admin
      .from('platform_config')
      .select('value')
      .eq('key', 'social_links')
      .single()

    const overrides = data?.value as Record<string, string> | null
    return NextResponse.json({ ...OFFICIAL_LINKS, ...overrides })
  } catch {
    return NextResponse.json(OFFICIAL_LINKS)
  }
}
