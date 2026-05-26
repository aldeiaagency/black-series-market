import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dealers')
    .select('id, name, slug, location_city, subscription_plan')
    .eq('status', 'active')
    .or('is_featured.eq.true,subscription_plan.eq.elite')
    .order('name')

  return NextResponse.json(data || [])
}
