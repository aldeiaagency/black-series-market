# Fixes del GATE — preparados para revisar (NO aplicados a producción)

Fecha: 2026-07-03 · Estado: código commiteado (NO desplegado; auto-deploy roto → despliegue manual `vercel --prod`), migración escrita (NO aplicada a Supabase). Nada toca producción hasta tu OK.

## Lo que YA está hecho en el repo (código)

| Fix | Archivo | Qué hace |
|-----|---------|----------|
| Webhooks fail-closed | `app/api/webhooks/{hot-lead-alert,assistant-result,appointment-result}/route.ts` | Si falta el secreto → `503`; exige firma válida siempre (antes: sin secreto se aceptaba todo). |
| Guard admin (helper) | `lib/admin-auth.ts` (nuevo) | `assertAdmin()`: verifica rol admin dentro de la action; redirige si no. |
| Guard admin (aplicado) | `app/(admin)/admin/altas-showroom/actions.ts` | `assertAdmin()` en las 4 actions (aprobar/rechazar/estado/notas). |
| Retirar secreto | `scripts/*.mjs` (6, eliminados del repo) | Sacados del árbol por posible `service_role` embebido. |

Estos cambios son seguros de desplegar (solo endurecen). **Requieren tu OK para `vercel --prod`.**

## BASE DE DATOS — APLICADO Y VERIFICADO EN PRODUCCIÓN (2026-07-03)

Los 2 CRÍTICOS de RLS están cerrados en la BD de producción (aplicado vía Management API, con las 2 verificaciones de call-sites hechas antes: el perfil del dealer solo actualiza columnas de perfil; todas las lecturas de `profiles` son de la propia fila).

- `057_security_rls_hardening.sql` — **SELECT de `profiles` restringido a la propia fila** (RGPD): APLICADO y verificado (`pg_policies` muestra solo "Users view own profile" `auth.uid()=id`).
  - ⚠️ El `REVOKE UPDATE(columna)` de 057 fue **INEFECTIVO** (no se puede revocar un subconjunto de columnas de un GRANT de tabla). Sustituido por 058.
- `058_security_column_guards.sql` — **triggers** que bloquean el cambio de columnas sensibles para roles `authenticated`/`anon`: APLICADO y **verificado con test real** como usuario authenticated:
  - `UPDATE profiles SET role='admin'` → BLOQUEADO ✅
  - `UPDATE dealers SET subscription_plan='elite', vehicle_slots=9999, is_verified=true` → BLOQUEADO ✅
  - `UPDATE dealers SET name=...` (control) → permitido ✅ (no se rompió la edición de perfil).

Pendiente del punto 7 del gate (barrer RLS del resto de tablas): ejecutar `supabase/migrations/_rls-audit.sql` en Supabase y revisar organizations/subscriptions/boosts/plans.

## Acciones manuales tuyas (no puedo hacerlas yo)

- [ ] **Rotar** la clave de los scripts eliminados si era `service_role` (el historial de git la conserva). En Supabase → Settings → API → regenerar. Actualizar la env donde se use.
- [ ] Aplicar `057` en Supabase tras las 2 verificaciones.
- [ ] Desplegar el código: `vercel --prod --yes`.
- [ ] Confirmar que los 3 secretos de webhook (`HOT_LEAD_ALERT_SECRET`, `ASSISTANT_RESULT_SECRET`, `APPOINTMENT_RESULT_SECRET`) están en Vercel (si no, con fail-closed los webhooks devolverán 503).

## Recomendado en el mismo sprint (defense-in-depth, ALTA — no bloqueante)

- Replicar `assertAdmin()` en las acciones inline de admin: `vehiculos/page.tsx`, `vehiculos/[id]/page.tsx`, `solicitudes/page.tsx`, `dealers/[id]/page.tsx` (13 acciones). Mitigado por `middleware.ts` (gatea `/admin/*`), por eso es endurecimiento, no agujero abierto.
- Migración `058` (2ª ola): trigger de moderación en `vehicles` (forzar `pending_review`; `is_featured` solo con boost activo).

## Estado de los 7 puntos del GATE

| # | Punto | Estado |
|---|-------|--------|
| 1 | RLS profiles.role | ✅ APLICADO Y VERIFICADO (058, trigger; test: auto-admin bloqueado) |
| 2 | RLS dealers columnas | ✅ APLICADO Y VERIFICADO (058, trigger; test: auto-Elite bloqueado) |
| 3 | assertAdmin en actions | Hecho en actions.ts; resto documentado (mitigado por middleware) · falta deploy |
| 4 | Secreto en scripts | Scripts retirados del repo; **falta ROTAR la clave (tú) — ver abajo** |
| 5 | RLS profiles SELECT (RGPD) | ✅ APLICADO (057; profiles solo legible por su dueño) |
| 6 | Webhooks fail-closed | Hecho en código · **falta deploy** (`vercel --prod`) |
| 7 | Barrido RLS resto tablas | Query `_rls-audit.sql` lista (ejecutar en Supabase) |
