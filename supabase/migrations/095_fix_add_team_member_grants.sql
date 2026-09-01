-- Migration 095 — Cierra una exposición real de add_team_member_if_under_limit.
--
-- Hallazgo (verificado contra producción tras aplicar la migración 094, llamando la
-- RPC con la anon key pública): `REVOKE ALL ... FROM PUBLIC` NO bastaba. Supabase
-- concede EXECUTE en funciones del schema public a `anon`/`authenticated` por defecto
-- (ALTER DEFAULT PRIVILEGES del propio proyecto, un grant directo a esos roles, no
-- heredado de PUBLIC) — revocar PUBLIC no lo toca. Resultado real: cualquiera con la
-- anon key (pública, embebida en el cliente) podía llamar la RPC directamente y
-- añadirse a sí mismo — o a cualquier user_id que conociera — como miembro de
-- CUALQUIER organización, saltándose por completo la autorización de
-- app/api/team/members/route.ts (getPermissions(access.role).canManageTeam).
-- Confirmado con una llamada real: la función ejecutó hasta el INSERT (folló contra
-- una FK inexistente a propósito), no un error de permiso — o sea, sí era ejecutable.
--
-- Fix: revocar EXECUTE explícitamente de anon y authenticated (no solo de PUBLIC).
-- service_role sigue pudiendo ejecutarla (concedido en 094) y es el único llamador
-- real (admin.rpc(...) desde el servidor, con el service role key).

REVOKE EXECUTE ON FUNCTION public.add_team_member_if_under_limit(uuid, uuid, text, int) FROM anon, authenticated;
