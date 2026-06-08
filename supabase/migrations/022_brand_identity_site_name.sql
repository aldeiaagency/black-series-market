-- Migration 022: brand identity — fix stored SEO site_name
-- Purpose:
--   The marketplace's public name is "Black Label Market" (the agency behind it is
--   "Black Series"). Early config seeded site_name as "Black Series Market". This
--   corrects the stored value in place. Non-destructive: only updates the brand string
--   when it still holds the old value; all other SEO settings are preserved.

UPDATE platform_config
SET value = jsonb_set(value, '{site_name}', '"Black Label Market"'),
    updated_at = NOW()
WHERE key = 'seo'
  AND value->>'site_name' = 'Black Series Market';
