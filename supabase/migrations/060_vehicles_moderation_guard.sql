-- Migration 060 — Guardas de moderación en vehicles (cierra el mass-assignment restante).
--
-- Contexto: el asistente de publicar ya envía status 'pending_review'/'draft' (nunca 'active'),
-- así que la moderación (pending_review → admin aprueba → active) es el modelo intencionado. Pero
-- un dealer puede saltárselo por REST directo (RLS "Dealers manage own vehicles FOR ALL") y ponerse
-- status='active' (salta moderación) o is_featured=true (boost gratis). El trigger lo neutraliza
-- para roles authenticated/anon SIN romper el flujo legítimo (que nunca pone 'active').
--
-- Estrategia: COERCIÓN suave (no RAISE), coherente con el patrón de 040:
--   · Si un dealer intenta dejar la fila 'active' → se fuerza a 'pending_review' (a moderación).
--   · is_featured / featured_until solo los pone el sistema (boost/service_role) → se fuerzan a false/null.
--   · is_verified / is_editors_pick / is_exclusive (sellos de confianza) → solo service_role.
-- El service_role (createAdminClient del servidor: aprobar vehículo, activar boost) NO se ve afectado.

CREATE OR REPLACE FUNCTION public.guard_vehicles_moderation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    -- No auto-activar: cualquier intento de dejarla activa pasa a revisión.
    IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
      NEW.status := 'pending_review';
    END IF;
    -- Destacado solo con boost real (lo pone el service_role); nunca por el usuario.
    IF NEW.is_featured IS TRUE AND (TG_OP = 'INSERT' OR OLD.is_featured IS DISTINCT FROM TRUE) THEN
      NEW.is_featured := FALSE;
      NEW.featured_until := NULL;
    END IF;
    -- Sellos de confianza: solo service_role. (Nota: vehicles NO tiene is_verified; eso es de dealers.)
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

DROP TRIGGER IF EXISTS trg_guard_vehicles_moderation ON public.vehicles;
CREATE TRIGGER trg_guard_vehicles_moderation
  BEFORE INSERT OR UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.guard_vehicles_moderation();
