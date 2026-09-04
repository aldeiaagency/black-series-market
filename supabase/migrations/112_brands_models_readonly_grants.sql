-- 112 - brands/models tenian el grant por defecto de Supabase sin estrechar (mismo patron que
-- dealers/vehicles antes de la migracion 107, pero esta pareja quedo fuera de aquel barrido):
-- anon Y authenticated tenian INSERT/UPDATE/DELETE/TRUNCATE ademas de SELECT sobre el catalogo
-- curado de marcas/modelos. TRUNCATE en particular no respeta RLS - cualquiera con la anon key
-- publica podia, en teoria, vaciar el catalogo entero via REST directo.
-- Hallado 2026-09-04 durante la simulacion E2E showroom-vs-administrador (verificacion cruzada
-- con Codex sobre el flujo de alta de Karboceramic).

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.brands, public.models
  FROM anon, authenticated;
