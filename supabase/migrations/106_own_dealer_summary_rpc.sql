-- Migration 106 — Parte de P0.2 (auditoría de columnas, mapa de Codex 2026-09-02).
--
-- middleware.ts resuelve "¿el usuario logueado es dueño de un dealer, y en qué estado?" con
-- `dealers.select('status').eq('profile_id', user.id)` (y una variante `id, status`). Para poder
-- restringir el SELECT de columnas de `dealers` a una allowlist pública sin exponer `profile_id`
-- como columna legible, se sustituye por esta función: resuelve `auth.uid()` internamente
-- (SECURITY DEFINER) y solo devuelve id/status/slug — nunca profile_id ni ninguna otra columna.
-- No requiere que el rol `authenticated` tenga SELECT sobre `dealers.profile_id` en absoluto.

CREATE OR REPLACE FUNCTION public.get_own_dealer_summary()
RETURNS TABLE (id UUID, slug TEXT, status dealer_status)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT d.id, d.slug, d.status
  FROM public.dealers d
  WHERE d.profile_id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_own_dealer_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_own_dealer_summary() TO authenticated;
