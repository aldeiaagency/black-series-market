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

## Lo que está escrito pero NO aplicado (BASE DE DATOS — requiere tu aprobación)

`supabase/migrations/057_security_rls_hardening.sql` — corrige los 2 CRÍTICOS de RLS:
- `profiles`: revoca `UPDATE(role)` a usuarios → no auto-promoción a admin.
- `profiles`: SELECT solo de la propia fila → deja de exponer emails de todos (RGPD).
- `dealers`: revoca `UPDATE` de columnas comerciales (plan, verificación, estado, slots) → no auto-Elite.

**Antes de aplicarla en Supabase (SQL Editor), verificar 2 cosas (están comentadas en la migración):**
1. La página de perfil del dealer (`dashboard/perfil`) actualiza SOLO columnas de perfil, no las revocadas (si envía el objeto entero con `is_verified`/`status`, el UPDATE fallará). 
2. Nada del front lee `profiles` de terceros con la anon key (autor de reseñas, joins).

Herramienta para el punto 7 del gate (barrer RLS del resto de tablas): `supabase/migrations/_rls-audit.sql` (solo lectura; ejecutar en Supabase y revisar organizations/subscriptions/boosts/plans).

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
| 1 | RLS profiles.role | Migración 057 lista (revisar+aplicar) |
| 2 | RLS dealers columnas | Migración 057 lista (revisar+aplicar) |
| 3 | assertAdmin en actions | Hecho en actions.ts; resto documentado (mitigado por middleware) |
| 4 | Secreto en scripts | Scripts retirados; **falta rotar (tú)** |
| 5 | RLS profiles SELECT (RGPD) | Migración 057 lista |
| 6 | Webhooks fail-closed | Hecho (código) |
| 7 | Barrido RLS resto tablas | Query `_rls-audit.sql` lista (ejecutar en Supabase) |
