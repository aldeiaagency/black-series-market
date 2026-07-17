-- Migración 072 — Retira la coerción "active → pending_review" del trigger de moderación.
--
-- Contexto (decisión 2026-07-17): se elimina la cola de moderación previa a publicación. El
-- catálogo cerrado de marcas/modelos y, en el futuro, un agente de auditoría post-publicación
-- asumen ese control en vez de la aprobación manual de un admin. Coherencia con el cambio de
-- capa de aplicación en lib/vehicle-write.ts y app/api/vehicles/import/route.ts: si la app deja
-- publicar en 'active' directamente, este trigger no debe seguir bloqueando lo mismo cuando un
-- dealer escribe por REST directo — sería una inconsistencia arbitraria, no una protección real.
--
-- Lo que SÍ se mantiene (protecciones que siguen siendo del sistema, no del dealer):
--   · is_featured/featured_until → solo un boost pagado real.
--   · is_editors_pick/is_exclusive → sellos de confianza, solo service_role.

CREATE OR REPLACE FUNCTION public.guard_vehicles_moderation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    -- Destacado solo con boost real (lo pone el service_role); nunca por el usuario.
    IF NEW.is_featured IS TRUE AND (TG_OP = 'INSERT' OR OLD.is_featured IS DISTINCT FROM TRUE) THEN
      NEW.is_featured := FALSE;
      NEW.featured_until := NULL;
    END IF;
    -- Sellos de confianza: solo service_role.
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
