-- 083 — Activar la sincronización automática de feed (Elite/Grupo).
--
-- El sincronizador real (workflow n8n "BLM - Stock inicial y sync de feed (IA)": lee
-- dealers.feed_url, parsea el CSV, redacta descripciones con IA cuando faltan, importa
-- con auto-aprobación vía FEED_SYNC_API_KEY) ya está construido y verificado de extremo
-- a extremo con datos reales. Hasta ahora feed_sync estaba en 'future' para todos los
-- planes porque, aunque la columna y el flag existían desde la migración 065, ningún
-- código los leía ni escribía (ver docs/PENDIENTES.md, confirmado 2026-07-21).

UPDATE plan_features pf
SET included = true, availability_status = 'operative'
FROM plans p
WHERE pf.plan_id = p.id
  AND p.slug IN ('elite', 'grupo')
  AND pf.feature_key = 'feed_sync';
