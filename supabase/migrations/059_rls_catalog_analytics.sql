-- Migration 059 — RLS en tablas que estaban ABIERTAS (hallazgo del barrido de la auditoría).
--
-- Estado detectado en producción: brands, models, subscription_plans y analytics_events NO tenían
-- RLS y los roles 'anon'/'authenticated' tenían INSERT/UPDATE/DELETE. Es decir: cualquiera con la
-- anon key pública podía BORRAR el catálogo, ALTERAR precios o falsear analíticas por REST directo.
-- (La 021 pretendía activar RLS en analytics_events pero no está activo en prod; se re-aplica aquí.)
--
-- Nadie en la app escribe brands/models/subscription_plans con el cliente de usuario (se siembran por
-- migración/service role). /api/track SÍ inserta analytics_events con el cliente de usuario → se
-- conserva el INSERT público.

-- ── Catálogo / precios: solo lectura pública ──
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "brands_public_read" ON public.brands;
CREATE POLICY "brands_public_read" ON public.brands FOR SELECT USING (true);

ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "models_public_read" ON public.models;
CREATE POLICY "models_public_read" ON public.models FOR SELECT USING (true);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscription_plans_public_read" ON public.subscription_plans;
CREATE POLICY "subscription_plans_public_read" ON public.subscription_plans FOR SELECT USING (true);

-- ── analytics_events: insert público (tracking), lectura solo del propio dealer ──
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert analytics" ON public.analytics_events;
CREATE POLICY "Public can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Dealers read own analytics" ON public.analytics_events;
CREATE POLICY "Dealers read own analytics" ON public.analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM dealers d WHERE d.id = analytics_events.dealer_id AND d.profile_id = auth.uid())
);
-- Sin policy de UPDATE/DELETE ni de SELECT para anon → escritura/borrado y lectura global reservados
-- al service_role (que bypassa RLS). Con RLS activado, los GRANT de escritura de anon/authenticated
-- quedan neutralizados (RLS deniega al no haber policy permisiva).
