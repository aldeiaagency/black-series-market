INSERT INTO brands (name, slug, country, sort_order) VALUES
  ('Cadillac', 'cadillac', 'US', 75),
  ('DS',       'ds',       'FR', 76)
ON CONFLICT (slug) DO NOTHING;
