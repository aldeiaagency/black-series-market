-- Migration 057 — Endurecimiento de seguridad RLS (GATE de la auditoría total 2026-07-03).
--
-- Corrige escaladas de privilegio explotables vía PostgREST con la anon key pública + el JWT
-- del usuario (ambos van en el navegador). No es teoría: hoy un comprador puede hacerse admin
-- y un dealer auto-concederse Elite.
--
-- ⚠️ NO APLICAR EN PRODUCCIÓN A CIEGAS. Antes:
--   1. Backup / snapshot de la BD.
--   2. Verificar los call-sites de UPDATE (ver notas) para que la app no actualice las columnas
--      revocadas con el cliente de usuario (rompería con "permission denied").
--   3. Aplicar y ejecutar la verificación del final.
--
-- Modelo de roles Supabase: 'anon' (sin login), 'authenticated' (con login). 'service_role'
-- (createAdminClient del servidor) BYPASSA RLS y los column grants → la app sigue pudiendo
-- escribir estas columnas desde el servidor con control de acceso propio.

BEGIN;

-- ── CRÍTICO 1 — profiles.role no editable por el usuario (auto-promoción a admin) ──
-- La política UPDATE "Users update own profile" (USING auth.uid()=id, sin WITH CHECK) deja
-- cambiar CUALQUIER columna de la propia fila, incluida `role` → 'admin'. Se corrige revocando
-- el privilegio de UPDATE sobre la columna `role` (independiente de la política de fila).
REVOKE UPDATE (role) ON public.profiles FROM authenticated, anon;

-- ── ALTA (RGPD) — profiles deja de ser un directorio público ──
-- "Public profiles viewable" USING (true) expone email/full_name/role de TODOS los usuarios.
-- Se restringe a la propia fila. Lo público de un dealer se lee de la tabla `dealers`.
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
-- NOTA a verificar: si algo del front leía profiles de terceros con la anon key (autor de
-- reseñas, nombre en algún join), moverlo a `dealers` o a una vista pública acotada.

-- ── CRÍTICO 2 — dealers no puede auto-concederse plan/verificación/estado ──
-- "Dealers update own record" (USING auth.uid()=profile_id, sin restricción de columnas) deja
-- a un dealer ponerse is_verified / is_featured / status / subscription_plan / vehicle_slots.
-- Se revoca el UPDATE de esas columnas comerciales; el dealer conserva la edición de su perfil
-- (nombre, descripción, contacto, logo, etc.).
REVOKE UPDATE (
  is_verified,
  is_featured,
  status,
  subscription_plan,
  subscription_start_at,
  subscription_end_at,
  stripe_customer_id,
  stripe_subscription_id,
  vehicle_slots
) ON public.dealers FROM authenticated, anon;
-- NOTA a verificar: la página de perfil del dealer (dashboard/perfil) debe actualizar SOLO
-- columnas permitidas (no enviar is_verified/status/etc. en el .update, ni un objeto entero
-- con esas columnas). Si las envía, el UPDATE fallará por permiso denegado → ajustar el update
-- a los campos de perfil antes de aplicar esta migración.

COMMIT;

-- ── Verificación posterior (ejecutar tras aplicar) ──
-- SELECT grantee, privilege_type, column_name
--   FROM information_schema.column_privileges
--   WHERE table_schema='public' AND table_name IN ('profiles','dealers') AND privilege_type='UPDATE'
--   ORDER BY table_name, column_name;
-- Debe NO aparecer 'role' para profiles ni las columnas comerciales para dealers (grantee authenticated/anon).
--
-- Pendiente en 058 (2ª ola): trigger de moderación en `vehicles` (forzar pending_review en altas
-- de dealer y exigir boost activo para is_featured). No va aquí porque el dealer sí necesita
-- controlar status draft/paused/sold, y eso requiere lógica de trigger, no un REVOKE de columna.
