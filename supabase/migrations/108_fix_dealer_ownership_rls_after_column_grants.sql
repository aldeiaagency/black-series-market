-- Migration 108 — HOTFIX urgente tras la migración 107.
--
-- La 107 revocó SELECT de tabla completa sobre `dealers` para anon/authenticated y concedió solo
-- columnas seguras (sin profile_id). Pero MUCHAS policies RLS de OTRAS tablas hacen internamente
-- `EXISTS(SELECT 1 FROM dealers d WHERE d.id = X.dealer_id AND d.profile_id = auth.uid())` para
-- comprobar "¿es el dueño?". Postgres evalúa TODAS las policies SELECT permisivas de una tabla
-- (se combinan con OR) en cada query, independientemente de qué rama acabaría ganando — así que
-- para poder evaluar la expresión necesita que el rol que hace la consulta tenga privilegio
-- SELECT sobre `profile_id`, aunque esa rama vaya a dar `false` para un anónimo. Sin ese
-- privilegio, la CONSULTA ENTERA falla con "permission denied for table dealers" (42501) — no solo
-- la rama del dueño, TODA la tabla, para TODOS los roles. Confirmado en producción real: las
-- fichas de vehículo (`vehicles`) dejaron de cargar inmediatamente tras desplegar la 107.
--
-- Fix: función SECURITY DEFINER que resuelve la comprobación de propiedad con los privilegios del
-- dueño de la función (bypassa por completo el grant del rol que llama), y se sustituye la
-- subconsulta directa por esta función en las 13 policies afectadas (barrido completo de todas las
-- policies del proyecto con este patrón, no solo la de vehicles que se detectó primero).

CREATE OR REPLACE FUNCTION public.is_own_dealer(check_dealer_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.dealers WHERE id = check_dealer_id AND profile_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_own_dealer(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_own_dealer(UUID) TO anon, authenticated;

-- ── vehicles ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Active vehicles viewable" ON vehicles;
CREATE POLICY "Active vehicles viewable" ON vehicles
  FOR SELECT USING (
    (status = 'active' AND EXISTS(
      SELECT 1 FROM dealers d WHERE d.id = vehicles.dealer_id AND d.status IN ('trial', 'active')
    ))
    OR public.is_own_dealer(vehicles.dealer_id)
  );

DROP POLICY IF EXISTS "Dealers manage own vehicles" ON vehicles;
CREATE POLICY "Dealers manage own vehicles" ON vehicles FOR ALL
  USING (public.is_own_dealer(vehicles.dealer_id));

-- ── leads ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Dealers view own leads" ON leads;
CREATE POLICY "Dealers view own leads" ON leads FOR SELECT
  USING (public.is_own_dealer(leads.dealer_id));

DROP POLICY IF EXISTS "Dealers update own leads" ON leads;
CREATE POLICY "Dealers update own leads" ON leads FOR UPDATE
  USING (public.is_own_dealer(leads.dealer_id));

-- ── analytics_events ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Dealers read own analytics" ON public.analytics_events;
CREATE POLICY "Dealers read own analytics" ON public.analytics_events FOR SELECT
  USING (public.is_own_dealer(analytics_events.dealer_id));

-- ── dealer_gallery_images ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "gallery_dealer_manage_own" ON dealer_gallery_images;
CREATE POLICY "gallery_dealer_manage_own" ON dealer_gallery_images FOR ALL
  USING (public.is_own_dealer(dealer_gallery_images.dealer_id))
  WITH CHECK (public.is_own_dealer(dealer_gallery_images.dealer_id));

-- ── lead_events ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "lead_events_dealer_select" ON lead_events;
CREATE POLICY "lead_events_dealer_select" ON lead_events FOR SELECT
  USING (public.is_own_dealer(lead_events.dealer_id));

DROP POLICY IF EXISTS "lead_events_dealer_insert" ON lead_events;
CREATE POLICY "lead_events_dealer_insert" ON lead_events FOR INSERT
  WITH CHECK (public.is_own_dealer(lead_events.dealer_id));

-- ── appointments ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "appointments_dealer_select" ON appointments;
CREATE POLICY "appointments_dealer_select" ON appointments FOR SELECT
  USING (public.is_own_dealer(appointments.dealer_id));

-- ── analytics_daily ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "analytics_daily_dealer_select" ON analytics_daily;
CREATE POLICY "analytics_daily_dealer_select" ON analytics_daily FOR SELECT
  USING (public.is_own_dealer(analytics_daily.dealer_id));

-- ── showroom_calendar_connections ────────────────────────────────────────────
DROP POLICY IF EXISTS "calendar_connections_dealer_select" ON showroom_calendar_connections;
CREATE POLICY "calendar_connections_dealer_select" ON showroom_calendar_connections FOR SELECT
  USING (public.is_own_dealer(showroom_calendar_connections.dealer_id));

-- ── lead_alerts ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "lead_alerts_dealer_select" ON lead_alerts;
CREATE POLICY "lead_alerts_dealer_select" ON lead_alerts FOR SELECT
  USING (public.is_own_dealer(lead_alerts.dealer_id));

-- ── lead_handoffs ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS lead_handoffs_dealer_select ON public.lead_handoffs;
CREATE POLICY lead_handoffs_dealer_select ON public.lead_handoffs FOR SELECT
  USING (public.is_own_dealer(lead_handoffs.dealer_id));
