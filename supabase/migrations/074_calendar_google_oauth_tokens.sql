-- Migración 074 — columnas de token OAuth para la conexión real de Google Calendar (Fase A).
--
-- Contexto: showroom_calendar_connections ya existía para Fase B (horario manual declarado a
-- mano, provider='manual', sin credenciales). Fase A añade la conexión real con Google Calendar:
-- estas columnas guardan el access/refresh token (cifrados en la capa de aplicación con
-- AES-256-GCM, ver lib/google-calendar.ts — nunca en texto plano) y su caducidad.
--
-- Regla de aplicación (no de esquema): ninguna consulta de cara al dealer debe seleccionar
-- estas columnas — solo lib/google-calendar.ts (server-only) las lee/escribe.

alter table showroom_calendar_connections
  add column if not exists access_token     text,
  add column if not exists refresh_token    text,
  add column if not exists token_expires_at timestamptz,
  add column if not exists scope            text;

comment on column showroom_calendar_connections.access_token is
  'Cifrado (AES-256-GCM, lib/google-calendar.ts). Nunca seleccionar en consultas de cara al dealer.';
comment on column showroom_calendar_connections.refresh_token is
  'Cifrado (AES-256-GCM, lib/google-calendar.ts). Nunca seleccionar en consultas de cara al dealer.';
