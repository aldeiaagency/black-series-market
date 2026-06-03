-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: redes sociales ficticias para ver el diseño visual
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Requiere: migración 006_social_fields.sql aplicada previamente
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Redes sociales de Black Label Market (aparecen en header y footer)
INSERT INTO platform_config (key, value)
VALUES (
  'social_links',
  '{
    "instagram": "https://www.instagram.com/blacklabelmarket",
    "facebook":  "https://www.facebook.com/blacklabelmarket",
    "youtube":   "https://www.youtube.com/@blacklabelmarket",
    "tiktok":    "https://www.tiktok.com/@blacklabelmarket",
    "linkedin":  "https://www.linkedin.com/company/blacklabelmarket"
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE
  SET value      = EXCLUDED.value,
      updated_at = NOW();

-- 2. Redes sociales del dealer "Black Series Premium Cars"
UPDATE dealers
SET
  instagram    = 'https://www.instagram.com/blackseriespremiumcars',
  facebook_url = 'https://www.facebook.com/blackseriespremiumcars',
  youtube_url  = 'https://www.youtube.com/@blackseriespremiumcars',
  tiktok_url   = 'https://www.tiktok.com/@blackseriespremiumcars',
  linkedin_url = 'https://www.linkedin.com/company/blackseriespremiumcars',
  website      = 'https://www.blackseriespremiumcars.com'
WHERE slug = 'black-series-premium-cars';
