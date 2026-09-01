-- Migration 100 — Tercer intento sobre trial_dealer_stats: revokes separados por rol.
--
-- trial_dealer_stats sigue siendo llamable por anon después de 097 (REVOKE ... FROM
-- anon, authenticated en una sola sentencia) y 098 (repetido + NOTIFY pgrst reload
-- schema) — ambos confirmados aplicados en remoto (099, que va detrás en el mismo
-- push que 098, sí bloqueó consume/refund_boost_credit). pause_excess_active_vehicles
-- (migración 076) es la única función de este proyecto que SÍ quedó bloqueada para
-- anon/authenticated desde su propia migración original, y usa 3 sentencias REVOKE
-- separadas (FROM PUBLIC / FROM anon / FROM authenticated) en vez de una combinada.
-- Replicando ese patrón exacto por si la combinación en una sola sentencia se
-- comporta distinto.

REVOKE ALL ON FUNCTION public.trial_dealer_stats(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trial_dealer_stats(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.trial_dealer_stats(UUID) FROM authenticated;

NOTIFY pgrst, 'reload schema';
