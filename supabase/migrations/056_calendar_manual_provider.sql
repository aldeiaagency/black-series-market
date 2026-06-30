-- 056 — Permitir el proveedor 'manual' en citas y conexiones de calendario.
-- El esquema original solo contemplaba Google/Outlook (Fase A, OAuth real). La
-- Fase B (ventanas de disponibilidad sin OAuth) usa provider='manual'.

ALTER TABLE showroom_calendar_connections DROP CONSTRAINT IF EXISTS showroom_calendar_connections_provider_check;
ALTER TABLE showroom_calendar_connections ADD CONSTRAINT showroom_calendar_connections_provider_check
  CHECK (provider = ANY (ARRAY['manual'::text, 'google_calendar'::text, 'outlook_calendar'::text]));

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_provider_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_provider_check
  CHECK (provider IS NULL OR provider = ANY (ARRAY['manual'::text, 'google_calendar'::text, 'outlook_calendar'::text]));
