-- Migration 097 — Auditoría completa de grants de RPC tras el hallazgo de 095/096.
--
-- Al verificar que 095 cerraba de verdad la exposición de add_team_member_if_under_limit,
-- se revisaron TODAS las funciones SECURITY DEFINER del proyecto (grep de las 21
-- migraciones que definen funciones) para descartar el mismo patrón en otras. De las
-- funciones no-trigger, 4 ya tenían el REVOKE explícito correcto de anon/authenticated
-- (pause_excess_active_vehicles, sync_dealer_profile_publication x2,
-- record_lead_handoff_event, update_lead_status_with_measurement) — no se tocan.
--
-- 3 tenían el mismo hueco (solo REVOKE FROM PUBLIC, o ningún REVOKE) y se confirmaron
-- ejecutables con la anon key pública contra producción real:
--
-- - trial_dealer_stats(p_dealer_id): sin ningún REVOKE — cualquiera podía leer vistas/
--   leads/vehículos activos de CUALQUIER dealer dando su UUID.
-- - record_followup_response(p_token, p_response): solo REVOKE FROM PUBLIC. El token es
--   aleatorio (no enumerable en la práctica), pero quedaba llamable sin pasar por la
--   ruta pública /api/followups/respond ni su lógica.
-- - confirm_vehicle_freshness(p_vehicle_id, p_dealer_id): solo REVOKE FROM PUBLIC —
--   cualquiera podía reactivar (quitar la pausa automática de frescura) cualquier
--   vehículo dando su id y el de su dealer.
--
-- (increment_vehicle_views SÍ es anon-callable por diseño explícito, documentado en su
-- propia migración 061 — no se toca.)

REVOKE EXECUTE ON FUNCTION public.trial_dealer_stats(UUID) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_followup_response(TEXT, TEXT) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_vehicle_freshness(UUID, UUID) FROM anon, authenticated;
