# Plan de cierre TOTAL del market — corregir TODOS los hallazgos

Tracker. Marca: [ ] pendiente · [~] en curso · [x] hecho. Orden pensado para dejar el market
listo para usuarios reales. Se ejecuta bloque a bloque, con commit+deploy por bloque.
Última actualización: 2026-07-03.

## BLOQUE A — Seguridad al 100% (terminar la capa) — HECHO + DESPLEGADO + VERIFICADO
- [x] A1 · `assertAdmin()` en las 13 acciones inline de admin
- [x] A2 · Circuit breaker en altas (`showroom-applications` + `register-dealer`) protege Firecrawl. `assistant/*` diferido (inerte hoy; rate limit por IP necesita store de edge)
- [x] A3 · SEC-7 upload magic bytes HECHO. SEC-6 (import key por-dealer) y SEC-8 (invitación equipo por email) DIFERIDOS: son feature-work (tabla de keys / flujo de invitación), MEDIA, sin uso en white-glove hoy
- [x] A4 · Cabeceras de seguridad (HSTS/X-Frame/nosniff/Referrer/Permissions) VERIFICADAS en prod · cap `limit`/`offset` (999999→60) VERIFICADO · error genérico sin fuga. CSP estricta diferida (necesita allowlist de Stripe/GTM/Supabase para no romper). `/api/track` (BAJO, pulición analytics) diferido

## BLOQUE B — Cadena de dinero (correctness)
- [ ] B1 · `activateBoost`/`cancel` ponen `is_featured` (hoy el boost pagado no destaca)
- [ ] B2 · Consumo de crédito atómico + eliminar `admin.rpc as never` (código muerto) + comprobar errores
- [ ] B3 · `create-checkout` firma nueva con `organization_id`+`billing_cycle` (rellenar `subscriptions`)
- [ ] B4 · Idempotencia webhook Stripe (`processed_stripe_events`) · `incrementEliteCounter` · fix cupo boost fallback

## BLOQUE C — Rendimiento y cache — MAYORÍA HECHO + DESPLEGADO + VERIFICADO
- [x] C1 · `createPublicClient` (sin cookies) + ISR en home + 23 páginas de catálogo. Categorías/marcas/home cachean (HIT verificado); `/coches`,`/motos` siguen dinámicas por sus filtros (searchParams) pero con cliente rápido
- [x] C2 · Tracking de ficha por beacon (`ViewTracker` → `/api/track`) + RPC atómico `increment_vehicle_views` (061) + ISR/prerender en fichas (HIT verificado)
- [x] C3 · images AVIF + minimumCacheTTL · hero sin quality=100 + priority móvil (VERIFICADO)
- [~] C4 · PENDIENTE (menor): `gtm_id` cacheado · `select` explícito en listados · `count` único · VehicleCard server · Header sin fetch cliente. Optimizaciones finas, no bloqueantes

## BLOQUE D — Accesibilidad y UX — CRÍTICOS + ALTO VALOR HECHOS
- [x] D1 · Tokens de color: grises a AA (#9E9E9E) + dorado unificado (#C6A64B). 31 archivos, DESPLEGADO+VERIFICADO
- [x] D2 · Formularios con label/aria asociados: ContactForm (+ruteo `/api/leads`), QualifiedLeadForm, login, registro (10 campos), registro-comprador. `sr-only`/`htmlFor` + `aria-invalid`/`aria-describedby` + `role=alert`. Pendiente (menor): wizard de publicación
- [x] D3 · Hook `useModalA11y` (role=dialog, focus-trap, Escape, retorno de foco) en SearchAlertModal y LeadModal del kanban. Pendiente (menor): lightbox de galería
- [x] D4 · Teclado: kanban (tarjeta role=button + Enter/Espacio), galería (visor principal role=button + flechas visibles al foco), radios/chips focus-visible. HECHO
- [x] D5 · `prefers-reduced-motion` + `aria-expanded` hamburguesa. Pendiente (menor, no bloqueante): jerarquía h, tipografía cuerpo, tablas admin en móvil, autoguardado wizard

## BLOQUE E — SEO/GEO (preparar el flip de noindex)
- [ ] E1 · Desacoplar `noindex` a un único punto para flip coordinado + `robots` coherente
- [ ] E2 · Sitemap sin `/precios` (301) · guard de vacío en `/marcas/[brand]` · `lastModified` real
- [ ] E3 · Canonical marca-tipo (canibalización) · enlazado interno a `/marcas/[slug]` · thin pages
- [ ] E4 · Metadata contacto/home canonical · FAQ/schema · respuestas citables GEO

## BLOQUE F — QA funcional profundo por rol (EN CURSO)
- [x] F0 · Revisión estática de vías de escritura del showroom. **HALLAZGO CRÍTICO + FIX**: mass-assignment en `POST`/`PATCH /api/vehicles` — usan el admin client (service_role), que se salta el trigger `guard_vehicles_moderation` (060). Un dealer, con un POST/PATCH manipulado (fuera del asistente), podía auto-activarse (saltar moderación), autoasignarse `is_featured`/`featured_until` (boost gratis), `is_editors_pick`/`is_exclusive` (sellos de confianza falsos) e inflar `views`. Cerrado con `lib/vehicle-write.ts` → `sanitizeVehiclePayload` (strip de campos de sistema + clamp de status a draft|pending_review) aplicado a ambas rutas. Verificados seguros: import CSV (`/api/vehicles/import`, lista blanca + cliente authenticated) y `updateVehicleStatus` (cliente authenticated → trigger coacciona). Aprobación de admin (assertAdmin + admin client) intacta.
- [ ] F1 · E2E de escritura por rol (publicar vehículo completo, kanban, lead, alerta, admin aprobar/rechazar) con cuentas de prueba + evidencia

## Registro de deploys/migraciones
- Migraciones aplicadas: 057-060. Próximas: 061 (idempotencia Stripe), 062 (RPC boost atómico / views), etc.
