-- Migration 098 — Re-aplica el revoke de trial_dealer_stats y fuerza recarga de PostgREST.
--
-- trial_dealer_stats siguió siendo llamable por anon después de aplicarse 097 (verificado
-- contra producción), mientras que las otras 2 funciones de esa misma migración
-- (record_followup_response, confirm_vehicle_freshness) sí quedaron bloqueadas. El REVOKE
-- en sí es idéntico en forma a los otros dos que sí funcionaron — la sospecha es caché de
-- esquema de PostgREST, no un fallo del REVOKE. Re-emitido por si acaso (idempotente, no
-- rompe nada si ya estaba aplicado) + NOTIFY explícito para forzar recarga inmediata en
-- vez de esperar al ciclo de refresco propio de PostgREST.

REVOKE EXECUTE ON FUNCTION public.trial_dealer_stats(UUID) FROM anon, authenticated;

NOTIFY pgrst, 'reload schema';
