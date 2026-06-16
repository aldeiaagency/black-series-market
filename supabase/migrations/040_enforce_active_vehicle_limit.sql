-- Migration 040: Enforce el límite de vehículos ACTIVOS por plan a nivel de base de datos.
--
-- Por qué un trigger y no solo código de app: el RLS de vehicles es "FOR ALL" para el
-- dueño, así que un dealer podría poner status='active' por REST directo saltándose la app.
-- El trigger es la única barrera que NO se puede saltar.
--
-- Diseño defensivo (para que NUNCA bloquee de forma indebida):
--  · Solo actúa cuando una fila pasa A 'active' (INSERT active o UPDATE no-active -> active).
--    Editar un vehículo que YA estaba activo no consume slot y no se bloquea.
--  · FAIL-OPEN: si no puede resolver el plan o el límite (cuenta mal configurada),
--    deja pasar. Solo bloquea cuando calcula con certeza que se supera el tope.
--  · No toca filas existentes: los que ya estén activos por encima del tope quedan
--    "grandfathered" (coherente con la regla "downgrade pausa, no borra"). Solo se
--    impide ACTIVAR de más a partir de ahora.

CREATE OR REPLACE FUNCTION enforce_active_vehicle_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id    UUID;
  v_plan_slug TEXT;
  v_limit     INT;
  v_extra     INT := 0;
  v_count     INT;
BEGIN
  -- Solo nos importa cuando la fila queda activa.
  IF NEW.status IS DISTINCT FROM 'active' THEN
    RETURN NEW;
  END IF;
  -- En UPDATE, si ya estaba activa no se consume un nuevo slot.
  IF TG_OP = 'UPDATE' AND OLD.status = 'active' THEN
    RETURN NEW;
  END IF;

  -- Resolver organización del dealer (puede no existir → fail-open más abajo).
  SELECT o.id INTO v_org_id
  FROM organizations o
  WHERE o.dealer_id = NEW.dealer_id
  LIMIT 1;

  -- Plan efectivo: suscripción activa manda; si no, el plan legacy del dealer.
  IF v_org_id IS NOT NULL THEN
    SELECT p.slug INTO v_plan_slug
    FROM subscriptions s
    JOIN plans p ON p.id = s.plan_id
    WHERE s.organization_id = v_org_id
      AND s.status IN ('active', 'trialing', 'past_due')
    ORDER BY s.created_at DESC
    LIMIT 1;
  END IF;

  IF v_plan_slug IS NULL THEN
    SELECT d.subscription_plan::text INTO v_plan_slug
    FROM dealers d
    WHERE d.id = NEW.dealer_id;
  END IF;

  -- Sin plan resoluble → fail-open.
  IF v_plan_slug IS NULL THEN
    RETURN NEW;
  END IF;

  -- Límite base del plan.
  SELECT pl.value_number::int INTO v_limit
  FROM plan_limits pl
  JOIN plans p ON p.id = pl.plan_id
  WHERE p.slug = v_plan_slug
    AND pl.key = 'max_active_vehicles';

  -- Sin límite configurado → fail-open.
  IF v_limit IS NULL THEN
    RETURN NEW;
  END IF;

  -- Slots extra por add-ons de bloques de vehículos activos.
  IF v_org_id IS NOT NULL THEN
    SELECT COALESCE(SUM((a.rules->>'slots')::int * sa.quantity), 0) INTO v_extra
    FROM subscription_addons sa
    JOIN addons a ON a.id = sa.addon_id
    JOIN subscriptions s ON s.id = sa.subscription_id
    WHERE s.organization_id = v_org_id
      AND sa.status = 'active'
      AND a.slug IN ('block_10_vehicles', 'block_25_vehicles');
  END IF;

  v_limit := v_limit + COALESCE(v_extra, 0);

  -- Contar activos actuales del dealer, excluyendo esta misma fila.
  SELECT COUNT(*) INTO v_count
  FROM vehicles v
  WHERE v.dealer_id = NEW.dealer_id
    AND v.status = 'active'
    AND v.id <> NEW.id;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'VEHICLE_LIMIT_REACHED: limite de % vehiculos activos alcanzado para el plan %', v_limit, v_plan_slug
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_active_vehicle_limit ON vehicles;
CREATE TRIGGER trg_enforce_active_vehicle_limit
  BEFORE INSERT OR UPDATE OF status ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_active_vehicle_limit();
