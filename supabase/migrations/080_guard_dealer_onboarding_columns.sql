-- 080 - Protege las nuevas senales de fundador/publicacion frente a escrituras
-- directas del cliente. La guarda original (058) usa una deny-list explicita y
-- por tanto no cubre automaticamente columnas anadidas despues.

CREATE OR REPLACE FUNCTION public.guard_dealer_onboarding_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') AND (
       NEW.is_founder      IS DISTINCT FROM OLD.is_founder
    OR NEW.profile_status  IS DISTINCT FROM OLD.profile_status
    OR NEW.trial_ends_at   IS DISTINCT FROM OLD.trial_ends_at
    OR NEW.trial_email_stage IS DISTINCT FROM OLD.trial_email_stage
  ) THEN
    RAISE EXCEPTION 'columnas de onboarding de dealers no editables por el usuario'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_dealer_onboarding_columns ON public.dealers;
CREATE TRIGGER trg_guard_dealer_onboarding_columns
  BEFORE UPDATE ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION public.guard_dealer_onboarding_columns();
