-- Migration 045: Professional plan alignment
-- Keeps Supabase plan data aligned with docs/planes-suscripcion-definitivos.md.

-- Current definitive monthly pricing. Annual and founding prices are no longer
-- part of the commercial offer.
UPDATE plans
SET
  monthly_price = CASE slug
    WHEN 'essential' THEN 197
    WHEN 'professional' THEN 449
    WHEN 'elite' THEN 899
    ELSE monthly_price
  END,
  annual_price = NULL,
  founding_monthly_price = NULL,
  updated_at = NOW()
WHERE slug IN ('essential', 'professional', 'elite');

-- Definitive limits for Professional, mirroring the Elite structure but with
-- the Professional-specific allowance.
WITH p AS (SELECT id, slug FROM plans)
INSERT INTO plan_limits (plan_id, key, value_number)
SELECT p.id, l.key, l.val
FROM p
JOIN (VALUES
  ('professional', 'max_active_vehicles', 50),
  ('professional', 'max_users', 3),
  ('professional', 'max_locations', 1),
  ('professional', 'included_boosts_month', 1),
  ('professional', 'analytics_retention_days', 180)
) AS l(slug, key, val) ON p.slug = l.slug
ON CONFLICT (plan_id, key) DO UPDATE
SET value_number = EXCLUDED.value_number;

-- Professional feature matrix.
WITH p AS (SELECT id, slug FROM plans WHERE slug = 'professional')
INSERT INTO plan_features (plan_id, feature_key, included, availability_status, public_visible, display_label)
SELECT p.id, f.key, f.inc, f.status, f.visible, f.label
FROM p
JOIN (VALUES
  ('verified_profile', true, 'operative', true, null),
  ('premium_activation', true, 'operative', true, null),
  ('manual_inventory', true, 'operative', true, null),
  ('csv_recurring', true, 'operative', true, null),
  ('opportunities_inbox', true, 'operative', true, null),
  ('pipeline', true, 'operative', true, null),
  ('analytics_basic', true, 'operative', true, null),
  ('analytics_advanced', true, 'operative', true, null),
  ('analytics_extended_compare', false, 'operative', true, null),
  ('vehicles_on_request', true, 'operative', true, 'general_board'),
  ('vehicles_on_request_priority', false, 'future', false, null),
  ('showroom_featured', false, 'operative', true, null),
  ('showroom_listing_priority', false, 'operative', true, null),
  ('feed_sync', false, 'future', false, null),
  ('lead_qualification_assistant', true, 'operative', true, null),
  ('appointment_booking', false, 'future', false, null),
  ('consolidated_view', false, 'operative', true, null)
) AS f(key, inc, status, visible, label) ON true
ON CONFLICT (plan_id, feature_key) DO UPDATE
SET
  included = EXCLUDED.included,
  availability_status = EXCLUDED.availability_status,
  public_visible = EXCLUDED.public_visible,
  display_label = EXCLUDED.display_label;

-- Elite already exposes the same qualification agent experience. Keep it
-- operative so Professional can follow the same connected composition.
WITH p AS (SELECT id FROM plans WHERE slug = 'elite')
UPDATE plan_features pf
SET included = true, availability_status = 'operative', public_visible = true
FROM p
WHERE pf.plan_id = p.id
  AND pf.feature_key = 'lead_qualification_assistant';

-- Add-ons definitive cleanup.
UPDATE addons
SET
  name = '+10 vehiculos publicados',
  description = 'Amplia el limite de inventario publicado en bloques de 10 vehiculos. Disponible en Essential y Professional.',
  price = 59,
  recurrence = 'recurring',
  billing_unit = 'month',
  status = 'active',
  public_visible = true,
  rules = '{"slots": 10}'::jsonb
WHERE slug = 'block_10_vehicles';

UPDATE addons
SET
  name = '+25 vehiculos publicados',
  description = 'Bloques de 25 vehiculos adicionales para inventarios Elite.',
  price = 99,
  recurrence = 'recurring',
  billing_unit = 'month',
  status = 'active',
  public_visible = true,
  rules = '{"slots": 25}'::jsonb
WHERE slug = 'block_25_vehicles';

UPDATE addons
SET
  name = 'Stock automatizado',
  description = 'Conexion con feed o DMS para mantener el inventario sincronizado automaticamente. Incluido en Elite.',
  price = 99,
  recurrence = 'recurring',
  billing_unit = 'month',
  status = 'active',
  public_visible = true
WHERE slug = 'feed_sync';

UPDATE addons
SET
  name = 'Diagnostico Anti-Fuga Express',
  description = 'Mini-auditoria que detecta 3 fugas de oportunidades del showroom con recomendaciones priorizadas. Incluido en Elite una vez al semestre.',
  price = 149,
  recurrence = 'one_time',
  billing_unit = null,
  status = 'active',
  public_visible = true
WHERE slug = 'antifuga_express';

-- Retire add-ons that no longer belong to the definitive plan ladder.
UPDATE addons
SET status = 'archived', public_visible = false
WHERE slug IN ('extra_user', 'extra_location', 'advanced_migration', 'editorial_slot');

-- Rebuild compatibility for the definitive add-ons touched here.
DELETE FROM addon_plan_compatibility
WHERE addon_id IN (
  SELECT id FROM addons
  WHERE slug IN ('block_10_vehicles', 'block_25_vehicles', 'feed_sync', 'antifuga_express')
);

WITH
  a AS (SELECT id, slug FROM addons),
  p AS (SELECT id, slug FROM plans)
INSERT INTO addon_plan_compatibility (addon_id, plan_id)
SELECT a.id, p.id
FROM a, p
WHERE (a.slug, p.slug) IN (
  ('block_10_vehicles', 'essential'),
  ('block_10_vehicles', 'professional'),
  ('block_25_vehicles', 'elite'),
  ('feed_sync', 'essential'),
  ('feed_sync', 'professional'),
  ('antifuga_express', 'essential'),
  ('antifuga_express', 'professional')
)
ON CONFLICT DO NOTHING;
