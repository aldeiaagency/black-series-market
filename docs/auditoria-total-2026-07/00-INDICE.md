# Auditoría TOTAL de Black Label Market — 2026-07-02/03

> Auditoría profunda, por capas, DESDE CERO. Regla: no se apoya en auditorías/QA anteriores
> (`auditoria-completa-2026-07.md`, `qa-final-report.md`, `admin-dashboard-validation-report.md` se
> ignoran como fuente). La única verdad es el código real y el producto en producción.
> Objetivo: cerrar el market antes de captar showrooms reales. Gate: cero hallazgos bloqueantes.

## Estado de las capas

| # | Capa | Agente | Informe | Estado |
|---|---|---|---|---|
| 01 | Seguridad e infra (authz, RLS por tabla, webhooks, secretos, rate-limit, source maps, SSL/headers) | hecho en hilo principal | `01-seguridad.md` | HECHO — 11 hallazgos (**4 CRÍTICOS**, 4 alto, 3 medio) |
| 02 | Código y arquitectura | hecho en hilo principal | `02-codigo-arquitectura.md` | HECHO — 9 hallazgos (4 alto · 3 medio · 2 bajo) |
| 03 | API (endpoints, validación, cross-tenant, idempotencia) | API Tester | `03-api.md` | HECHO — 19 hallazgos (0 crít · 4 alto · 8 medio · 7 bajo) |
| 04 | Rendimiento y cache | Performance Benchmarker | `04-rendimiento-cache.md` | HECHO — 13 hallazgos (0 bloq · 4 alto · 7 medio · 2 bajo) |
| 05 | UX y accesibilidad | Accessibility Auditor | `05-ux-accesibilidad.md` | HECHO — 24 hallazgos (3 crít · 7 serio · 8 mod · 6 menor) · WCAG AA NO CONFORMA |
| 06 | SEO/GEO | SEO Specialist | `06-seo-geo.md` | HECHO — 19 hallazgos (5 alto · 6 medio · 8 bajo) · base sólida, problemas de lanzamiento/silo |
| 07 | Funcional por rol (visitante/showroom/admin) | hecho en hilo principal | `07-funcional-por-rol.md` | HECHO — 8 hallazgos (0 bloq · 4 alto · 3 medio · 1 bajo) |
| 00 | Veredicto consolidado + plan de fixes | consolidación | `00-veredicto-consolidado.md` | PENDIENTE (tras completar capas) |

## Motivo del corte

Ejecutar 7 agentes pesados en paralelo agotó la cuota de subagentes (límite de sesión, reset 00:40 Madrid). 5 de 7 agentes completaron el análisis pero el límite cortó la escritura de su archivo. Sus hallazgos NO se han perdido de forma recuperable por el hilo principal; se relanzan o se rehacen.

## Hallazgos CRÍTICOS (gate) — de la capa de seguridad

La auditoría de seguridad desde cero encontró **escaladas de privilegio explotables hoy** (peor que lo que veían las auditorías previas). Estos bloquean abrir a dealers reales:

1. **CRÍTICO — Auto-promoción a admin.** RLS de `profiles` UPDATE sin guard de columna: un comprador registrado se pone `role='admin'` por REST directo (JWT + anon key) → panel admin completo. (`001_initial.sql:249`)
2. **CRÍTICO — Auto-concesión de plan Elite/verificado.** RLS de `dealers` UPDATE sin guard de columna: un dealer se pone `subscription_plan='elite'`, `vehicle_slots=9999`, `is_verified=true` por REST. (`001_initial.sql:253`)
3. **CRÍTICO — Server Actions de admin sin `requireAdmin()`.** Cualquier autenticado aprueba/rechaza showrooms. (`app/(admin)/admin/altas-showroom/actions.ts`)
4. **CRÍTICO (verificar) — Posible service_role key embebida en `scripts/*.mjs`** versionados. Rotar si se confirma.

## Hallazgos ALTA (dinero + seguridad + rendimiento)

1. **Mass-assignment en vehículos** (API `vehicles/route.ts:23` y RLS): `status='active'` salta moderación; `is_featured` gratis (el trigger 040 solo limita conteo; 044 es backfill, no guardia).
2. **Webhooks entrantes fail-open** (`webhooks/{assistant-result,appointment-result,hot-lead-alert}`).
3. **Fuga RGPD**: `profiles` SELECT `USING(true)` expone email/rol de todos.
4. **Stripe sin idempotencia** + **cadena de suscripción rota** (`subscriptions` nunca se rellena).
5. **Rendimiento: sitio público 100% sin cache** + hero LCP a `quality=100`.

Detalle y fixes en `01-seguridad.md`, `03-api.md`, `04-rendimiento-cache.md`, `05-ux-accesibilidad.md`.
