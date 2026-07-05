-- Migration 062 — Consumo atómico de créditos de boost.
--
-- Motivo: activateBoost hacía read-modify-write sobre boost_credits.used
--   (leer used → escribir used+1). Dos boosts concurrentes de la misma organización
--   podían leer el mismo `used` y gastar un solo crédito dos veces → boost gratis.
-- Solución: decremento con guard `used < quantity` en una única sentencia UPDATE
--   (atómica). consume devuelve true solo si logró consumir; refund compensa si la
--   activación posterior falla. Solo las llama el service_role (lib/boosts.ts).

CREATE OR REPLACE FUNCTION public.consume_boost_credit(p_credit_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.boost_credits
  SET used = used + 1
  WHERE id = p_credit_id AND used < quantity;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_boost_credit(p_credit_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.boost_credits
  SET used = GREATEST(used - 1, 0)
  WHERE id = p_credit_id;
$$;

-- No se conceden a anon/authenticated: consumir/reembolsar créditos es potestad del
-- servidor (service_role, que ignora los GRANT). Revocar el default de PUBLIC por higiene.
REVOKE ALL ON FUNCTION public.consume_boost_credit(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refund_boost_credit(uuid) FROM PUBLIC;
