-- Migration 094 — Alta atómica de miembro de equipo bajo el límite del plan.
--
-- Motivo: POST /api/team/members hacía check-then-act (contar organization_members,
--   comparar con maxUsers, luego INSERT en pasos separados). Dos altas concurrentes
--   de la misma organización podían leer el mismo count antes de que ninguna
--   insertara, y las dos pasar el check → superar el límite del plan.
-- Solución: pg_advisory_xact_lock serializa las llamadas de la MISMA organización
--   (la segunda espera a que la primera termine su transacción); la comparación con
--   maxUsers y el INSERT quedan así dentro de una única sección crítica. Se usa
--   hashtextextended (hash de 64 bits) en vez de hashtext (32 bits) para reducir el
--   riesgo de colisión entre organization_id distintos que comparten la misma clave
--   de advisory lock. maxUsers sigue calculándose en la app (lib/entitlements.ts,
--   depende de plan + add-ons) y se pasa como parámetro: no se duplica esa lógica
--   de negocio en SQL.

CREATE OR REPLACE FUNCTION public.add_team_member_if_under_limit(
  p_organization_id uuid,
  p_user_id         uuid,
  p_role            text,
  p_max_users       int
)
RETURNS uuid -- id de la fila creada en organization_members, o NULL si se alcanzó el límite
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count  int;
  v_new_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_organization_id::text, 0));

  SELECT count(*) INTO v_count
  FROM public.organization_members
  WHERE organization_id = p_organization_id;

  IF v_count >= p_max_users THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (p_organization_id, p_user_id, p_role)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- Igual que consume_boost_credit: solo la llama el servidor. Revocar el default de
-- PUBLIC por higiene y conceder explícitamente a service_role (defensivo: en este
-- proyecto service_role ya viene con acceso amplio, pero un GRANT explícito no tiene
-- coste y evita depender de esa configuración implícita si cambiara).
REVOKE ALL ON FUNCTION public.add_team_member_if_under_limit(uuid, uuid, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_team_member_if_under_limit(uuid, uuid, text, int) TO service_role;
