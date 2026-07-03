-- Migration 061 — RPC atómico para incrementar las vistas de un vehículo.
--
-- Motivo: la ficha hacía `UPDATE vehicles SET views = views + 1` (read-modify-write con carrera)
-- como escritura fire-and-forget en el render del Server Component. Eso (a) puede perderse en
-- serverless, (b) tiene condición de carrera y (c) impide cachear la ficha. Con este RPC atómico
-- (SECURITY DEFINER, llamable por anon), el contador se incrementa desde un beacon del cliente
-- vía /api/track, y la ficha queda sin escrituras → cacheable con ISR.

CREATE OR REPLACE FUNCTION public.increment_vehicle_views(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.vehicles SET views = views + 1 WHERE id = p_id AND status = 'active';
$$;

GRANT EXECUTE ON FUNCTION public.increment_vehicle_views(uuid) TO anon, authenticated;
