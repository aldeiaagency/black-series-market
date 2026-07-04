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

## BLOQUE D — Accesibilidad y UX (EN CURSO)
- [x] D1 · Tokens de color: grises a AA (#9E9E9E) + dorado unificado (#C6A64B). 31 archivos, DESPLEGADO+VERIFICADO
- [~] D2 · Formularios: ContactForm HECHO (labels/aria + BONUS: ruteado por /api/leads, antes insertaba directo saltándose rate limit + n8n). QualifiedLeadForm ya usa /api/leads (falta labels). Pendientes: SearchAlertModal, login, registro, wizard
- [x] D3 · Hook `useModalA11y` (role=dialog, focus-trap, Escape, retorno de foco) creado + aplicado a SearchAlertModal y LeadModal del kanban. Pendiente: galería, otros modales
- [x] D4 · Kanban operable por teclado (tarjeta role=button + Enter/Espacio + focus-visible) HECHO. Pendiente: flechas de galería a foco, radios focus-visible
- [~] D5 · `prefers-reduced-motion` (globals.css) + `aria-expanded` hamburguesa HECHO. Pendiente (menor): jerarquía h, tipografía de cuerpo, tablas admin móvil, autoguardado wizard, labels login/registro/QualifiedLeadForm

## BLOQUE E — SEO/GEO (preparar el flip de noindex)
- [ ] E1 · Desacoplar `noindex` a un único punto para flip coordinado + `robots` coherente
- [ ] E2 · Sitemap sin `/precios` (301) · guard de vacío en `/marcas/[brand]` · `lastModified` real
- [ ] E3 · Canonical marca-tipo (canibalización) · enlazado interno a `/marcas/[slug]` · thin pages
- [ ] E4 · Metadata contacto/home canonical · FAQ/schema · respuestas citables GEO

## BLOQUE F — QA funcional profundo por rol
- [ ] F1 · E2E de escritura por rol (publicar vehículo completo, kanban, lead, alerta, admin aprobar/rechazar) con cuentas de prueba + evidencia

## Registro de deploys/migraciones
- Migraciones aplicadas: 057-060. Próximas: 061 (idempotencia Stripe), 062 (RPC boost atómico / views), etc.
