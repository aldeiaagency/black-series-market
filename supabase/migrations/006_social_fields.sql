-- Add social link columns to dealers table
ALTER TABLE dealers
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url  TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url   TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Seed default social_links config for Black Label Market
INSERT INTO platform_config (key, value) VALUES
  ('social_links', '{
    "instagram": "",
    "facebook": "",
    "youtube": "",
    "tiktok": "",
    "linkedin": ""
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
