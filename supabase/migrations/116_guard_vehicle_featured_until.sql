-- Protege featured_until independientemente de is_featured. El backend de boosts
-- escribe con service_role; los usuarios no pueden fijar, prolongar ni borrar su fecha.
CREATE OR REPLACE FUNCTION public.guard_vehicles_moderation()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.featured_until := NULL;
    ELSE
      NEW.featured_until := OLD.featured_until;
    END IF;

    IF NEW.is_featured IS TRUE AND (TG_OP = 'INSERT' OR OLD.is_featured IS DISTINCT FROM TRUE) THEN
      NEW.is_featured := FALSE;
    END IF;
    IF NEW.is_editors_pick IS TRUE AND (TG_OP = 'INSERT' OR OLD.is_editors_pick IS DISTINCT FROM TRUE) THEN
      NEW.is_editors_pick := FALSE;
    END IF;
    IF NEW.is_exclusive IS TRUE AND (TG_OP = 'INSERT' OR OLD.is_exclusive IS DISTINCT FROM TRUE) THEN
      NEW.is_exclusive := FALSE;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
