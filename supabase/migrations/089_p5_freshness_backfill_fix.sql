-- 089: corrige el backfill de 087 — arranca el plazo de frescura HOY, no en la fecha de
-- publicación original. Con el backfill de 087 (COALESCE(published_at, created_at)), 61 de 61
-- vehículos activos ya habrían nacido "caducados" bajo la regla nueva de 14 días — el cron de
-- pausa automática los habría retirado todos del catálogo público sin ningún motivo real.
-- Detectado y corregido antes de que el cron llegara a ejecutarse (workflow desactivado a
-- tiempo). El plazo de 14 días es una política nueva que empieza a contar desde que existe,
-- no desde que cada vehículo se publicó.

BEGIN;

UPDATE vehicles
SET last_confirmed_at = NOW()
WHERE status = 'active';

COMMIT;
