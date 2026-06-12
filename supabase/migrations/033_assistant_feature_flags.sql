-- Migration 033: Feature flags for lead qualification assistant and appointment booking
-- Status: 'future' (off) on all plans — activate per showroom when feature is ready.
-- To enable for a showroom: update availability_status to 'operative' for its plan.

WITH p AS (SELECT id, slug FROM plans WHERE slug IN ('essential','professional','elite'))
INSERT INTO plan_features (plan_id, feature_key, included, availability_status, public_visible, display_label)
SELECT p.id, f.key, f.inc, f.avail, FALSE, NULL
FROM p
JOIN (VALUES
  ('essential',    'lead_qualification_assistant', FALSE, 'future'),
  ('professional', 'lead_qualification_assistant', TRUE,  'future'),
  ('elite',        'lead_qualification_assistant', TRUE,  'future'),
  ('essential',    'appointment_booking',          FALSE, 'future'),
  ('professional', 'appointment_booking',          FALSE, 'future'),
  ('elite',        'appointment_booking',          TRUE,  'future')
) AS f(slug, key, inc, avail) ON p.slug = f.slug
ON CONFLICT (plan_id, feature_key) DO UPDATE SET
  included            = EXCLUDED.included,
  availability_status = EXCLUDED.availability_status,
  public_visible      = EXCLUDED.public_visible;
