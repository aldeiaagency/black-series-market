-- 111 - vehicles.last_confirmed_at quedo NOT NULL sin DEFAULT en la 087 (el backfill de esa
-- migracion solo cubrio las filas existentes en su momento). Desde entonces, cualquier INSERT
-- en vehicles que no fije la columna explicitamente viola el constraint - bug latente desde la
-- 087, hallado ahora al reactivar el alta vehiculo a vehiculo de la sala de configuracion
-- (2026-09-04, simulacro E2E Karboceramic). "Recien creado" es un momento razonable para
-- considerar la unidad confirmada por primera vez - mismo criterio que ya usaba el backfill
-- (COALESCE(published_at, created_at)).

ALTER TABLE vehicles ALTER COLUMN last_confirmed_at SET DEFAULT NOW();
