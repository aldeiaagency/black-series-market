CREATE TABLE IF NOT EXISTS platform_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (admin API uses service role key)
CREATE POLICY "Service role only" ON platform_config
  USING (false);

-- Insert defaults
INSERT INTO platform_config (key, value) VALUES
  ('planes', '[
    {"id":"essential","name":"Essential","price":149,"slots":15,"features":["15 vehículos activos","Ficha de concesionario","Leads ilimitados","Estadísticas básicas"],"highlighted":false},
    {"id":"professional","name":"Professional","price":349,"slots":40,"features":["40 vehículos activos","Perfil destacado en búsquedas","Estadísticas avanzadas","Boost de visibilidad mensual"],"highlighted":true},
    {"id":"elite","name":"Elite","price":699,"slots":100,"features":["Hasta 100 vehículos activos","Badge Elite exclusivo","Posición prioritaria","Account manager dedicado"],"highlighted":false}
  ]'::jsonb),
  ('criterios', '{"car_min_price":40000,"moto_min_price":15000,"max_vehicle_age":15,"requires_professional_photo":true,"requires_carfax":false}'::jsonb),
  ('seo', '{"site_name":"Black Series Market","tagline":"El marketplace de vehículos premium","og_image":"","ga_id":"","gtm_id":""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
