-- Migration 099 — Cierra la misma exposición real en consume_boost_credit/refund_boost_credit.
--
-- Numerada 099 y no 096 (donde se escribió originalmente) porque el archivo se creó
-- pero no se commiteó/empujó a tiempo — 097 y 098 ya se habían aplicado en remoto
-- cuando se detectó el olvido, y `supabase db push` rechaza insertar una migración
-- fuera de orden sin --include-all. Renumerada para que aplique después de esas dos.
--
-- Hallazgo (verificado contra producción, mismo método que 095): estas dos funciones
-- (migración 062) también son ejecutables directamente con la anon key pública —
-- REVOKE ALL FROM PUBLIC nunca bastó, por el mismo motivo que 095 (Supabase concede
-- EXECUTE en funciones de public a anon/authenticated por defecto, un grant directo a
-- esos roles que no depende de PUBLIC). Confirmado con llamadas reales: ambas
-- ejecutaron sin error de permiso.
--
-- Impacto real: cualquiera con la anon key podía llamar consume_boost_credit/
-- refund_boost_credit con cualquier credit_id, manipulando el contador `used` de
-- boost_credits de cualquier organización sin pasar por lib/boosts.ts ni por Stripe.
--
-- Fix: mismo patrón que 095 — revocar EXECUTE explícito de anon y authenticated.
-- service_role (el único llamador real, desde lib/boosts.ts) no se ve afectado.

REVOKE EXECUTE ON FUNCTION public.consume_boost_credit(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refund_boost_credit(uuid) FROM anon, authenticated;
