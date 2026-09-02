-- Migration 105 — Hallazgo de la auditoría de columnas (P0.2, 2026-09-02, mapa de Codex).
--
-- La policy pública de dealer_gallery_images (067_trial_dealers_public_visibility.sql:16) exige
-- que el dealer esté en status 'trial'/'active', pero NO exige dealers.profile_status='published'
-- — a diferencia de las queries públicas reales (todas filtran profile_status='published' en
-- aplicación). Un dealer en trial/active pero con profile_status='draft'/'pending_review' (perfil
-- todavía no publicado) tenía su galería consultable igualmente por REST directo.

DROP POLICY IF EXISTS "gallery_select_active_dealers" ON dealer_gallery_images;
CREATE POLICY "gallery_select_active_dealers"
  ON dealer_gallery_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dealers d
      WHERE d.id = dealer_gallery_images.dealer_id
        AND d.status IN ('trial', 'active')
        AND d.profile_status = 'published'
    )
  );
