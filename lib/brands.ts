import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Resolve a brand slug (e.g. "mercedes-benz") to its canonical `brand_name`
 * ("Mercedes-Benz") using the `brands` table as the single source of truth.
 *
 * Why: vehicle listings store `brand_name` as denormalized text. Naively turning the
 * slug back into a name with `slug.replace(/-/g, ' ')` breaks brands whose real name
 * contains a hyphen — "mercedes-benz" → "mercedes benz" never matches "Mercedes-Benz".
 * Looking the slug up in `brands` returns the exact stored name and fixes the filter
 * for Mercedes-Benz, Rolls-Royce, Harley-Davidson, etc.
 *
 * Returns the canonical name, or `null` when the slug is unknown (caller can fall back).
 */
export async function resolveBrandNameFromSlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<string | null> {
  if (!slug) return null
  const { data } = await supabase
    .from('brands')
    .select('name')
    .eq('slug', slug)
    .maybeSingle()
  return data?.name ?? null
}
