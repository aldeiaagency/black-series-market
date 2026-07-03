-- Migration 058 — Guardas de columnas sensibles por trigger (corrige 057).
--
-- Por qué: el REVOKE UPDATE(columna) de 057 fue INEFECTIVO. El rol 'authenticated' tiene un
-- GRANT UPDATE a nivel de TABLA (default de Supabase) y PostgreSQL no permite revocar un
-- subconjunto de columnas de un grant de tabla. (El SELECT restringido de profiles de 057 SÍ
-- se aplicó y se mantiene.)
--
-- Solución robusta y no frágil: triggers BEFORE UPDATE que rechazan cambios a columnas sensibles
-- cuando el rol de conexión es 'authenticated' o 'anon' (los roles de PostgREST para usuarios y
-- anónimos). El servidor (createAdminClient) conecta como 'service_role' → no le afecta; los
-- contextos SECURITY DEFINER y superusuario tampoco. Deny-list explícita: si se añade una nueva
-- columna sensible, hay que sumarla aquí.

-- ── profiles.role ──
CREATE OR REPLACE FUNCTION public.guard_profiles_columns()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon')
     AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'profiles.role no es editable por el usuario'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profiles_columns ON public.profiles;
CREATE TRIGGER trg_guard_profiles_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profiles_columns();

-- ── dealers: columnas comerciales / de confianza ──
CREATE OR REPLACE FUNCTION public.guard_dealers_columns()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') AND (
       NEW.is_verified           IS DISTINCT FROM OLD.is_verified
    OR NEW.is_featured           IS DISTINCT FROM OLD.is_featured
    OR NEW.status                IS DISTINCT FROM OLD.status
    OR NEW.subscription_plan     IS DISTINCT FROM OLD.subscription_plan
    OR NEW.subscription_start_at IS DISTINCT FROM OLD.subscription_start_at
    OR NEW.subscription_end_at   IS DISTINCT FROM OLD.subscription_end_at
    OR NEW.stripe_customer_id    IS DISTINCT FROM OLD.stripe_customer_id
    OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
    OR NEW.vehicle_slots         IS DISTINCT FROM OLD.vehicle_slots
  ) THEN
    RAISE EXCEPTION 'columnas comerciales de dealers no editables por el usuario'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_dealers_columns ON public.dealers;
CREATE TRIGGER trg_guard_dealers_columns
  BEFORE UPDATE ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION public.guard_dealers_columns();
