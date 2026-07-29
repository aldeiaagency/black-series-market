-- 076 — Pausar inventario excedente al bajar o cancelar un plan.
--
-- La operación vive en Postgres para que contar y pausar ocurra en la misma
-- transacción. Se conservan activos los anuncios más recientes y se pausan
-- primero los más antiguos: así el showroom mantiene visible su stock más
-- fresco sin borrar ninguna ficha ni perder su histórico.

CREATE OR REPLACE FUNCTION public.pause_excess_active_vehicles(
  p_dealer_id UUID,
  p_new_limit INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_count INTEGER;
  v_to_pause     INTEGER;
  v_paused       INTEGER;
BEGIN
  IF p_dealer_id IS NULL THEN
    RAISE EXCEPTION 'dealer_id is required';
  END IF;

  IF p_new_limit IS NULL OR p_new_limit < 0 THEN
    RAISE EXCEPTION 'new_limit must be zero or greater';
  END IF;

  -- Serializa transiciones concurrentes del mismo showroom dentro de esta tx.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_dealer_id::text, 0));

  SELECT COUNT(*)
  INTO v_active_count
  FROM vehicles
  WHERE dealer_id = p_dealer_id
    AND status = 'active';

  v_to_pause := GREATEST(v_active_count - p_new_limit, 0);
  IF v_to_pause = 0 THEN
    RETURN 0;
  END IF;

  WITH excess AS (
    SELECT id
    FROM vehicles
    WHERE dealer_id = p_dealer_id
      AND status = 'active'
    ORDER BY
      COALESCE(published_at, created_at) ASC,
      created_at ASC,
      id ASC
    LIMIT v_to_pause
    FOR UPDATE
  )
  UPDATE vehicles v
  SET
    status = 'paused',
    updated_at = NOW()
  FROM excess
  WHERE v.id = excess.id;

  GET DIAGNOSTICS v_paused = ROW_COUNT;
  RETURN v_paused;
END;
$$;

REVOKE ALL ON FUNCTION public.pause_excess_active_vehicles(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pause_excess_active_vehicles(UUID, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.pause_excess_active_vehicles(UUID, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.pause_excess_active_vehicles(UUID, INTEGER) TO service_role;

