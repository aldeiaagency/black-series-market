# Plan de cierre TOTAL del market — corregir TODOS los hallazgos

Tracker. Marca: [ ] pendiente · [~] en curso · [x] hecho. Orden pensado para dejar el market
listo para usuarios reales. Se ejecuta bloque a bloque, con commit+deploy por bloque.
Última actualización: 2026-07-03.

## BLOQUE A — Seguridad al 100% (terminar la capa)
- [ ] A1 · `assertAdmin()` en las 13 acciones inline de admin (vehiculos/page, vehiculos/[id]/page, solicitudes/page, dealers/[id]/page)
- [ ] A2 · Rate limit + saneo en `assistant/{session,message,book}` y en `register-dealer`/`showroom-applications` (unificar el duplicado)
- [ ] A3 · SEC-6 import API key por-dealer/scoping · SEC-7 upload magic bytes · SEC-8 contraseña temporal fuera del JSON (invitación)
- [ ] A4 · Cabeceras de seguridad en `next.config` (CSP/HSTS/X-Frame/X-Content-Type/Referrer/Permissions) · cap de `limit`/`offset` en `/api/vehicles` · no devolver `error.message` crudo · validar/limitar `/api/track`

## BLOQUE B — Cadena de dinero (correctness)
- [ ] B1 · `activateBoost`/`cancel` ponen `is_featured` (hoy el boost pagado no destaca)
- [ ] B2 · Consumo de crédito atómico + eliminar `admin.rpc as never` (código muerto) + comprobar errores
- [ ] B3 · `create-checkout` firma nueva con `organization_id`+`billing_cycle` (rellenar `subscriptions`)
- [ ] B4 · Idempotencia webhook Stripe (`processed_stripe_events`) · `incrementEliteCounter` · fix cupo boost fallback

## BLOQUE C — Rendimiento y cache
- [ ] C1 · Cliente Supabase sin cookies para lecturas públicas + ISR (`revalidate`) en catálogo/ficha/categorías/marcas/dealers + invalidación
- [ ] C2 · Sacar el tracking del render de la ficha (beacon/`after`) + `views` con RPC atómico
- [ ] C3 · `next.config` images (AVIF + `minimumCacheTTL`) · hero sin `quality=100` + `priority` en móvil
- [ ] C4 · `gtm_id` cacheado · `select` explícito en listados · `count` único · VehicleCard server component · Header sin fetch cliente

## BLOQUE D — Accesibilidad y UX
- [ ] D1 · Tokens de color: subir grises a AA + unificar los 3 dorados (`tailwind.config` + reemplazos)
- [ ] D2 · Formularios: labels asociadas + `aria-invalid`/`aria-describedby` + `role="alert"` (ContactForm, QualifiedLeadForm, login, registro, SearchAlertModal, wizard)
- [ ] D3 · Hook `useModalA11y` (role=dialog, focus-trap, Escape, retorno de foco) en modales + galería
- [ ] D4 · Kanban operable por teclado · flechas de galería visibles a foco · radios `focus-visible`
- [ ] D5 · `aria-label` iconos header · `aria-expanded` hamburguesa · jerarquía h1→h3 · `prefers-reduced-motion` · tipografía de cuerpo · tablas admin en móvil (card) · autoguardado wizard

## BLOQUE E — SEO/GEO (preparar el flip de noindex)
- [ ] E1 · Desacoplar `noindex` a un único punto para flip coordinado + `robots` coherente
- [ ] E2 · Sitemap sin `/precios` (301) · guard de vacío en `/marcas/[brand]` · `lastModified` real
- [ ] E3 · Canonical marca-tipo (canibalización) · enlazado interno a `/marcas/[slug]` · thin pages
- [ ] E4 · Metadata contacto/home canonical · FAQ/schema · respuestas citables GEO

## BLOQUE F — QA funcional profundo por rol
- [ ] F1 · E2E de escritura por rol (publicar vehículo completo, kanban, lead, alerta, admin aprobar/rechazar) con cuentas de prueba + evidencia

## Registro de deploys/migraciones
- Migraciones aplicadas: 057-060. Próximas: 061 (idempotencia Stripe), 062 (RPC boost atómico / views), etc.
