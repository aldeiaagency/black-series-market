-- Migration 102 — Cierra P0.7 de la auditoría de seguridad 2026-09-02.
--
-- La policy "Anyone can create lead" (001_initial.sql:260, WITH CHECK (true)) permitía
-- insertar en `leads` directamente vía REST con la anon key pública, saltándose por
-- completo la validación de relación dealer/vehículo y el rate-limit de /api/leads
-- (app/api/leads/route.ts), que ya usa el service role y nunca dependió de esta policy.
-- Verificado con grep en las 12 migraciones que tocan `leads`: nunca se eliminó ni se
-- revocó. Verificado también que no existe ningún INSERT anónimo/cliente a `leads` en
-- el código — toda la creación real pasa por /api/leads con el service role, que no se
-- ve afectado por este REVOKE.

DROP POLICY IF EXISTS "Anyone can create lead" ON public.leads;
REVOKE INSERT ON public.leads FROM anon, authenticated;
