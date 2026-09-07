-- Corrige el tope de plazas Elite: el porcentaje (max_elite_share) nunca debe
-- ser el mecanismo que gobierna en vivo — con el número de showrooms activos
-- cerca de cero o inestable, un tope por porcentaje o bloquea toda alta nueva
-- (20% de 0 es 0) o fuerza a "quitarle" el plan a alguien que ya paga en
-- cuanto baja el denominador. El único número que se aplica en vivo es el
-- tope plano (max_elite_showrooms). El share queda solo como referencia para
-- revisión manual periódica de H, nunca para cálculo automático.
--
-- Fija el tope plano nacional en 50 (ya documentado en
-- docs/planes-suscripcion-definitivos.md, nunca aplicado de verdad: la fila
-- se insertó con max_elite_showrooms = NULL en 029_seeds_v2.sql).

UPDATE elite_capacity_rules
SET max_elite_showrooms = 50
WHERE geographic_scope_type = 'country'
  AND geographic_scope_id = 'ES'
  AND category = '*'
  AND max_elite_showrooms IS NULL;
