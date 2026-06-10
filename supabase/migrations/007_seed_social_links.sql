-- Redes sociales de Black Label Market (configurables desde /admin/configuracion)
INSERT INTO platform_config (key, value)
VALUES (
  'social_links',
  '{
    "instagram": "https://www.instagram.com/blacklabel_premiumcars/",
    "tiktok":    "https://www.tiktok.com/@blacklabelmarket.es",
    "facebook":  "https://www.facebook.com/blacklabel.es",
    "youtube":   "https://www.youtube.com/@BlackLabelPremium"
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE
  SET value      = EXCLUDED.value,
      updated_at = NOW();
