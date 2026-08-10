# Black Label Market — Instrucciones para Claude Code

> Marco estable del proyecto. Para el **estado vivo** (qué está hecho / pendiente) la fuente única es
> [`docs/PENDIENTES.md`](docs/PENDIENTES.md). No duplicar estado aquí; este archivo se mantiene corto y estable.

> **Gobierno**: este producto opera bajo la dirección ejecutiva de Black Series Agency (repo padre
> `black-series-core`, del que este repo cuelga como carpeta anidada desde 2026-08-10 — repos git
> independientes, `black-series-core/.gitignore` ignora esta carpeta). Al abrir sesión aquí, antes de asumir
> prioridades de negocio, leer `../agency/00_estado_ceo.md` y, si la tarea es de dirección/priorización (no
> solo ejecución técnica de este repo), la doctrina en `../.claude/skills/black-series-ceo/SKILL.md`. Si la
> sesión se abre con directorio de trabajo dentro de `black-series-core` (o en esta misma carpeta anidada),
> la skill debería aparecer invocable por comando directamente, al estar ahora dentro del mismo árbol de
> directorios.

## 1. Qué es

Black Label Market (`blacklabelmarket.es`) es un **marketplace B2B de vehículos premium** que conecta **showrooms/operadores de automoción** con **compradores**. Está **en producción**.

Es el **producto propio de Black Series Agency** (anidado dentro del repo padre `black-series-core`, como repo git independiente), no un cliente ni un proyecto externo. La agencia es la matriz; este repo es su producto/activo. La estrategia comercial (planes, servicios, tono) se enmarca en el core; la ejecución del producto vive aquí.

Dos lados:
- **Showrooms (dealers)**: alta con auditoría, publicación de vehículos (con moderación), dashboard de oportunidades/leads (Kanban), solicitudes "a la carta", boosts, planes de suscripción (Essential / Professional / Elite / Grupo).
- **Compradores**: catálogo, buscador, favoritos, comparador, alertas de búsqueda, envío de leads, solicitudes "a la carta", reserva de citas (Elite), asistente IA por ficha.

## 2. Stack real

- **Next.js 14** (App Router, TypeScript) + **Tailwind** + framer-motion + recharts + react-hook-form + zod + react-query.
- **Supabase**: Auth, Postgres (RLS), Storage (bucket público `vehicle-images`). SMTP propio Hostinger en Supabase Auth.
- **Stripe**: suscripciones y boosts. **Hoy en modo TEST** (`acct_1TnfYd…`), no live.
- **Vercel**: hosting/producción (dominio apex canónico, `www`→apex).
- **n8n** (EasyPanel, `aldeia-n8n.giuxk6.easypanel.host`): runtime de workflows **WF1–WF7** (alta showroom, aprobación/rechazo/más-info, router de eventos, matcher de alertas, asistente IA). Emails vía SMTP Hostinger.
- **OpenAI** (asistente IA del comprador) · **Firecrawl** (auditoría de alta).
- **NO se usa GHL ni Cloudflare R2** (fueron suposiciones descartadas; la subida de imágenes va por Supabase Storage).

## 3. Estructura

- `app/` — App Router por grupos: `(public)`, `(auth)`, `(cuenta)` (comprador), `(dashboard)` (showroom), `(admin)`, y `api/`.
- `lib/` — lógica de dominio: `stripe.ts`, `boosts.ts`, `entitlements.ts`, `plans-config.ts`, `elite-capacity.ts`, `vehicle-query.ts`, `booking.ts`, `permissions.ts`, `integrations/n8n.ts`, `supabase/`.
- `supabase/migrations/` — esquema y migraciones (Prisma baselined).
- `n8n-workflows/` — definición de los workflows (workflow-as-code). `docs/` — documentación (ver §7).

## 4. Estado y riesgos (resumen — detalle en PENDIENTES.md)

- **En producción** con catálogo piloto. **`noindex` activo** hasta tener stock real: no quitarlo sin decisión explícita.
- **Auditoría 2026-07-01 sin corregir todavía.** Hay un **Sprint 0 bloqueante** antes de aceptar más pagos reales o abrir al público:
  - Cadena de dinero rota (Stripe: `subscriptions` no se rellena, boosts sin idempotencia).
  - Vulnerabilidades explotables (acciones de admin sin `requireAdmin()`, webhooks fail-open, mass-assignment que salta moderación).
  - Fuente única con `archivo:línea` y fix: [`docs/auditoria-completa-2026-07.md`](docs/auditoria-completa-2026-07.md).
- Stripe en **test**: pasar a live requiere KYC KAZAWEB + cerrar precios Pro/Elite/Grupo (Fase B).

## 5. Reglas de trabajo

- **Producción real, dinero real y datos de terceros.** No ejecutar acciones sobre producción (workflows activos, pagos, emails a leads/alertas reales) sin aprobación. Antes de tests de WF5/WF6, revisar alertas/leads en BD para no escribir a personas reales.
- **Secretos**: nunca escribir tokens/claves en archivos versionados. Valores reales viven en `.env.local`, Vercel y n8n; aquí solo se documenta dónde. `.env.local.example` es la plantilla.
- **Deploy**: el auto-deploy GitHub→Vercel está roto; desplegar con `vercel --prod --yes`.
- **Editar workflows n8n**: no usar `Invoke-RestMethod`/`ConvertTo-Json` de PowerShell (corrompe UTF-8/acentos). Usar Node (`fetch`) con ficheros UTF-8. WF5 ID `mgGKQ9r8wkC3shwz`, API n8n con header `X-N8N-API-KEY`.
- **Migraciones**: cambios de esquema como migración en `supabase/migrations/`, no ediciones manuales sueltas.
- **Marca**: español, tono premium (negro + dorado), sin emojis en el producto. Copy según `docs/guia-copy-black-label.md`. Unificar el dorado (hay 3 tonos divergentes por corregir).
- Si falta un dato, marcar `PENDIENTE` y no inventar métricas, precios ni claims.

## 6. Seguridad — aprobación humana

Requieren aprobación explícita: pagos/Stripe live, borrados masivos, cambios en RLS/permisos, quitar `noindex`, campañas con gasto, tocar datos personales de compradores o dealers, cambios en producción con leads reales.

## 7. Documentos canónicos (no duplicar)

- `docs/PENDIENTES.md` — estado vivo + checklist de la auditoría (**leer siempre al retomar**).
- `docs/auditoria-completa-2026-07.md` — informe con `archivo:línea` y fixes.
- `docs/planes-suscripcion-definitivos.md` — planes y add-ons definitivos.
- `docs/seo-geo-backlog.md` (+`.csv`) — backlog SEO/GEO (gate `noindex`).
- `docs/guia-copy-black-label.md` — tono y copy de marca.
- `docs/monetization-strategy-report.md`, `docs/future-services-roadmap.md` — estrategia.

## 8. Compact instructions

- Black Label Market es el producto propio de Black Series Agency (matriz en `black-series-core`), en producción sobre Next.js 14 + Supabase + Stripe + Vercel + n8n.
- El estado vivo está en `docs/PENDIENTES.md`; este CLAUDE.md se mantiene corto y estable.
- Hay un Sprint 0 de auditoría (dinero + seguridad) SIN corregir: no abrir al público ni aceptar más pagos sin resolverlo.
- `noindex` activo hasta stock real. Stripe en test, no live. No se usa GHL ni R2.
- No tocar producción, secretos ni datos de terceros sin aprobación. Deploy con `vercel --prod --yes`. WF n8n se editan con Node, no PowerShell.
