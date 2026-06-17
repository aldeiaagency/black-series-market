-- Vehicle "Destacado" is a boost-only label.
-- Demo vehicles were seeded with is_featured=true for presentation; normalize them so
-- they only show "Novedad" unless a real boost activation sets featured_until.

UPDATE vehicles v
SET
  is_featured = false,
  featured_until = null,
  updated_at = NOW()
FROM dealers d
WHERE v.dealer_id = d.id
  AND d.email LIKE 'demo+%@blacklabelmarket.es'
  AND v.featured_until IS NULL;
