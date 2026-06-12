-- Migration 030: Dealer gallery images
-- Adds facility photos gallery for each showroom (max 6 per dealer)

CREATE TABLE dealer_gallery_images (
  id          UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  dealer_id   UUID         REFERENCES dealers(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT        NOT NULL,
  position    INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dealer_gallery_dealer_pos
  ON dealer_gallery_images (dealer_id, position);

ALTER TABLE dealer_gallery_images ENABLE ROW LEVEL SECURITY;

-- Public: read images for active dealers only
CREATE POLICY "gallery_select_active_dealers"
  ON dealer_gallery_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dealers d
      WHERE d.id = dealer_gallery_images.dealer_id
        AND d.status = 'active'
    )
  );

-- Dealers: full access to their own images
CREATE POLICY "gallery_dealer_manage_own"
  ON dealer_gallery_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM dealers d
      WHERE d.id = dealer_gallery_images.dealer_id
        AND d.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dealers d
      WHERE d.id = dealer_gallery_images.dealer_id
        AND d.profile_id = auth.uid()
    )
  );

-- Trigger: keep updated_at current
CREATE OR REPLACE FUNCTION update_dealer_gallery_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER dealer_gallery_images_updated_at
  BEFORE UPDATE ON dealer_gallery_images
  FOR EACH ROW EXECUTE FUNCTION update_dealer_gallery_updated_at();
