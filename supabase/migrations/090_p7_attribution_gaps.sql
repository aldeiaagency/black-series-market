-- P7 Etapa 0 (F): cierra los huecos de atribución detectados en search_alerts.
-- leads y custom_requests ya tenían dónde guardar acquisition_context (columna dedicada
-- y metadata JSONB respectivamente); search_alerts no tenía ninguna.
ALTER TABLE public.search_alerts
  ADD COLUMN IF NOT EXISTS acquisition_context JSONB NOT NULL DEFAULT '{}'::jsonb;
