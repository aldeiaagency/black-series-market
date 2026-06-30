-- 053 — Plan Grupo: hacerlo asignable y derivarlo de Elite (provisional)
--
-- Contexto: el plan "Grupo" existía en la tabla `plans` pero (a) el enum
-- `subscription_plan` no incluía 'grupo' (solo essential/professional/elite),
-- así que ningún dealer podía asignarse a Grupo por el campo legacy; y (b) no
-- tenía filas en `plan_features` / `plan_limits`, por lo que getEntitlements no
-- resolvía ninguna función (ni el agente cualificador) para un dealer Grupo.
--
-- Según el doc de planes, Grupo es "derivado de Elite". Mientras se cierra su
-- definición final, lo dejamos = Elite (mismas features y límites). Idempotente.

-- (a) Añadir el valor al enum (no se puede usar en la misma tx, pero aquí no se usa).
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'grupo';

-- (b) Copiar las plan_features de Elite a Grupo (solo las que falten).
INSERT INTO plan_features (plan_id, feature_key, included, availability_status, public_visible, display_label)
SELECT g.id, pf.feature_key, pf.included, pf.availability_status, pf.public_visible, pf.display_label
FROM plan_features pf
CROSS JOIN (SELECT id FROM plans WHERE slug = 'grupo') g
WHERE pf.plan_id = (SELECT id FROM plans WHERE slug = 'elite')
  AND NOT EXISTS (
    SELECT 1 FROM plan_features x WHERE x.plan_id = g.id AND x.feature_key = pf.feature_key
  );

-- (c) Copiar los plan_limits de Elite a Grupo (solo los que falten).
INSERT INTO plan_limits (plan_id, key, value_number)
SELECT g.id, pl.key, pl.value_number
FROM plan_limits pl
CROSS JOIN (SELECT id FROM plans WHERE slug = 'grupo') g
WHERE pl.plan_id = (SELECT id FROM plans WHERE slug = 'elite')
  AND NOT EXISTS (
    SELECT 1 FROM plan_limits x WHERE x.plan_id = g.id AND x.key = pl.key
  );
