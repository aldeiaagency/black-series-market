-- Migration 103 — Cierra la mitad de P0.3 de la auditoría de seguridad 2026-09-02 (SSRF vía
-- webhook_url del asistente).
--
-- La policy "assistant_config_dealer_all" (032_lead_qualification.sql:110) daba a cualquier
-- dealer FOR ALL (select/insert/update/delete) sobre su propia fila de
-- showroom_assistant_config, incluida `webhook_url`. app/api/assistant/message/route.ts lee esa
-- columna con el service role y hace fetch(cfg.webhook_url), devolviendo la respuesta al
-- navegador — un dealer con la anon key + su JWT podía escribir un `webhook_url` propio por
-- PostgREST directo y convertir el endpoint público del asistente en un proxy SSRF hacia
-- cualquier destino, además de poder activar `enabled=true` saltándose el entitlement del plan.
--
-- Verificado (grep en todo el repo): ningún componente de dashboard cliente lee ni escribe esta
-- tabla directamente — las 15 referencias reales son todas server-side (API routes con
-- createAdminClient, acciones de admin, provisioning de n8n). La tabla nunca tuvo un uso legítimo
-- de escritura/lectura directa por el dealer; se deja service-only.

DROP POLICY IF EXISTS "assistant_config_dealer_all" ON public.showroom_assistant_config;
