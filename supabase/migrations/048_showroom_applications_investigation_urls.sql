-- Añadir URLs de investigación de reputación a showroom_applications.
-- Sustituye el campo message (texto libre) por campos estructurados
-- que el agente de investigación puede consumir directamente.

ALTER TABLE showroom_applications
  ADD COLUMN IF NOT EXISTS google_business_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url        TEXT,
  ADD COLUMN IF NOT EXISTS portales             TEXT[],
  ADD COLUMN IF NOT EXISTS portal_url           TEXT;
