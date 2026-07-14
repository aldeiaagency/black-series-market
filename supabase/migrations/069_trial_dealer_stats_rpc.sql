-- Resumen de rendimiento de un dealer durante su trial, usado por el email de conversión
-- (día 21/28 del trial drip, n8n). Devuelve JSON plano (no TABLE) para que la llamada RPC
-- de PostgREST entregue un objeto directo, sin envolver en array.
CREATE OR REPLACE FUNCTION trial_dealer_stats(p_dealer_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'vistas', (
      SELECT COUNT(*) FROM analytics_events
      WHERE dealer_id = p_dealer_id AND event_type IN ('vehicle_view', 'view', 'professional_profile_view')
    ),
    'leads', (
      SELECT COUNT(*) FROM leads WHERE dealer_id = p_dealer_id
    ),
    'vehiculosActivos', (
      SELECT COUNT(*) FROM vehicles WHERE dealer_id = p_dealer_id AND status = 'active'
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION trial_dealer_stats(UUID) TO service_role;
