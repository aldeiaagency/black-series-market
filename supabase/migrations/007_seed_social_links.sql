-- Redes sociales de Black Label Market (configurables desde /admin/configuracion)
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
