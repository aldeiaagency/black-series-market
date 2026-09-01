# Black Label Market — PENDIENTES
> Documento único y canónico **de deuda técnica general del producto** (Sprint 0/1/2, Stripe, DNS, backups).
> Para deuda técnica y backlog específico de growth marketing (instrumentación de eventos, formularios de
> captura, handoff/K22, advocacy/UGC), ver `agency/backlog_unificado_growth.md` — no duplicar aquí, es la
> fuente única de eso desde 2026-08-28. Un ítem compartido: "unificar `ContactForm`/`QualifiedLeadForm`"
> (bloque B4-B11 abajo) se relaciona con varios hallazgos de `QualifiedLeadForm` en ese otro documento.
> Última actualización: **2026-08-27** (bloque "día a día" del roadmap de
> market al 100% cerrado a falta de pruebas reales: ventana 24h en panel, reportes P4/P5/P6 saneados,
> Programa Fundador y gap de Stripe corregidos — quedan abiertos dentro de este mismo bloque: lead scoring
> (pausado a propósito), soporte/trust-safety (sin decidir canal) y onboarding white-glove (sin tocar)).
> Actualización anterior: 2026-08-26 (cadena de alta lista a falta de pruebas con showrooms reales; import
> CSV/feed sin fotos ya no publica en falso). Anterior: 2026-08-10 (limpieza del catálogo demo).
> Elimina y sustituye: `pendientes-configuracion-externa.md`, `deployment-checklist.md`, `n8n-setup.md`, `backlog-alertas-y-vehiculos-a-la-carta.md`, `backlog-marketplace.md`.

> **🧹 Limpieza del catálogo demo — 2026-08-10.** El market se dejó presentable para enseñarlo en visitas
> comerciales: 12 showrooms y 61 vehículos, **0 fichas públicas sin foto** (antes 166 de 271, el 61 %) y
> **0 fotos genéricas de Unsplash**. Se corrigió además un fallo que afectaba al **100 % del catálogo**: las
> categorías de los vehículos no existían en la taxonomía pública, así que ninguna ficha aparecía en las
> páginas de categoría ni en los filtros.
> Detalle, cifras y trampas operativas: [`docs/limpieza-catalogo-demo-2026-08-10.md`](limpieza-catalogo-demo-2026-08-10.md).
> Auditoría que lo originó: [`docs/auditoria-perfiles-demo-2026-08-10.md`](auditoria-perfiles-demo-2026-08-10.md).
>
> **Dos cosas que recordar antes de tocar el catálogo otra vez:** (1) filtrar por `status = 'active'` **no
> basta** — la ficha pública de showroom muestra también `paused` y `sold`; (2) la caché ISR es de 5 minutos,
> los cambios en base de datos tardan en verse en la web.

> **✅ Corrección de claims de verificación/moderación — 2026-08-27.** El copy público afirmaba en varios
> sitios (FAQ de `/profesionales/precios`, portada, `/como-funciona`, una guía) que los vehículos pasan
> "revisión editorial" individual antes de publicarse, o que se confirma "disponibilidad"/"imágenes propias" —
> falso desde que se retiró la moderación manual por unidad (2026-07-17, ver SEC-3 arriba y el comentario en
> `lib/vehicle-write.ts`) y sin que exista enforcement técnico real de esos otros dos puntos. La FAQ de
> `revisión editorial en <24h` de `app/(public)/precios/page.tsx` (ruta hoy inalcanzable, redirige a
> `/profesionales/precios`) también se limpió aunque no era código vivo. Corregidas las 5 instancias
> encontradas (`profesionales/precios`, home, `como-funciona`, guía "cómo comprar un supercar", `precios`
> muerto) para afirmar solo lo cierto: el profesional pasa un proceso de admisión antes de poder publicar, y
> los vehículos deben pertenecer al catálogo cerrado de marcas/modelos.
>
> **Decisión de negocio de H (2026-08-27):** todo showroom con perfil publicado en BLM está verificado,
> siempre, por defecto — no es una opción ni un estado aparte; se verifica antes de aceptar la solicitud de
> alta. Ajustado el badge "Verificado" en `components/marketplace/DealerCard.tsx` y `DealerInlineCard.tsx`,
> que antes lo condicionaban a `dealer.is_verified` (campo que se crea en `false` al aprobar el alta —
> `admin/altas-showroom/actions.ts` — y depende de un checklist interno en `admin/dealers/[id]` hoy
> "orientativo", sin bloqueo real). Ahora se muestra siempre para cualquier perfil publicado, coherente con
> la regla de negocio real. `VehicleDetailContent.tsx` y la ficha pública de showroom ya lo mostraban sin
> condición — coincidían con la regla correcta por casualidad, no por diseño.
>
> **Backlog, no bloqueante:** `dealers.is_verified` y su checklist en `admin/dealers/[id]` quedan
> desacoplados de lo que ve el comprador — decidir si se elimina el toggle/checklist o se reconvierte en
> seguimiento interno de calidad, sin urgencia.
>
> **Moderación de vehículos a futuro (no construido, solo referencia de diseño — H pide no explicar
> públicamente el mecanismo en ningún sitio):** el comentario de `lib/vehicle-write.ts` (decisión 2026-07-17)
> ya declara la intención de sustituir la moderación manual por un futuro "agente de auditoría
> post-publicación". No existe ningún documento de diseño de ese agente todavía — esta es la única
> referencia. Candidato a especificar cuando se priorice; hoy el control real es el catálogo cerrado de
> marcas/modelos seleccionables al publicar.

---

## 🔍 Auditoría completa 2026-07-01 — Correcciones pendientes

> **Informe completo con `archivo:línea` y fix concreto de cada punto:** [`docs/auditoria-completa-2026-07.md`](auditoria-completa-2026-07.md).
> 4 auditorías especializadas (bugs, seguridad, UX/accesibilidad, SEO/GEO) sobre el código real. Aquí solo el checklist accionable; el porqué y el snippet de corrección están en el informe.
>
> **⚠️ ACTUALIZACIÓN 2026-07 (cierre total):** gran parte de este checklist YA está corregido, desplegado y verificado. Fuente detallada y estado por bloque: [`docs/auditoria-total-2026-07/PLAN-CIERRE-TOTAL.md`](auditoria-total-2026-07/PLAN-CIERRE-TOTAL.md).
> Resumen de lo cerrado: **Sprint 0** — SEC-1 (assertAdmin), SEC-2 (webhooks fail-closed), **SEC-3 (mass-assignment vehículos → `sanitizeVehiclePayload`)**, SEC-4 (leads validados+rate-limit), BUG-1 (create-checkout→subscriptions), BUG-2 (boost `is_featured`), BUG-3 (fallback cupo→`bypassCap`), BUG-7 (idempotencia webhook, tabla `processed_stripe_events`). **Sprint 1** — BUG-5 (incrementEliteCounter cableado), BUG-6 (`admin.rpc as never` x3 eliminados), BUG-8 (cron `expire-boosts`), SEC-7 (magic bytes), A1 (contraste AA), A2/A3 (modales `useModalA11y`). **Migraciones aplicadas en prod:** 057-075 (ver lista completa más abajo; 073 asistente IA dedicado por dealer, 074 tokens Google Calendar, 075 aceptación de condiciones profesionales). **Verificado también cerrado:** SEC-5 (el buscador ya sanea `,()*%\` + cap 60 en el `.or()` de PostgREST, y el cliente anónimo tiene RLS a `active`), **BUG-9** (doble-reserva en `assistant/book` — constraint único `uniq_appointment_dealer_slot` en migración 064 + manejo `409` en código, verificado 2026-07-21 contra el código, el checkbox de abajo estaba desfasado).
> **⚠️ CORRECCIÓN 2026-07-21 (auditoría contra código, no contra el checklist):** **B1 (header dorado) NO está corregido** — `Header.tsx:125-129` sigue usando un gradiente marrón (`rgba(58,45,36,...)` = `#3A2D24`), pese a que el resumen de arriba lo daba por cerrado en una versión anterior. Se corrige aquí: B1 sigue abierto, ver Sprint 1. En cambio, **"unificar los 3 dorados" (Sprint 2) SÍ está resuelto**: solo existe `#C6A64B` en todo el código (`tailwind.config.ts`), no hay rastro de `#C9A84C` ni `#BFA14A`. **Pendientes reales confirmados:** SEC-6/8 (feature-work diferido, siguen abiertos), F1-escritura E2E en vivo, E4 (FAQ/GEO), resto de 🟢 Sprint 2 (pulido). El `noindex` **sigue activo** a propósito.

### 🔴 Sprint 0 — Antes de aceptar más pagos reales / abrir al público
Cadena de dinero rota + seguridad explotable. **CERRADO (ver nota 2026-07 arriba) — checkboxes actualizadas 2026-07-09, desfasadas respecto al resumen desde su cierre real.**
- [x] **BUG-1** — `create-checkout` usa firma legacy → **`subscriptions` nunca se rellena** ni se activa Elite. Resolver `organization_id` y usar la firma nueva de `createCheckoutSession`. `app/api/stripe/create-checkout/route.ts` + `lib/stripe.ts`
- [x] **BUG-2** — El boost pagado **no pone `is_featured=true`** (solo `featured_until`) → no destaca. `lib/boosts.ts:130-134`
- [x] **BUG-3** — Fallback de boost destaca **saltándose el cupo** `max_boosted_share` cuando la activación falla por cupo lleno. `app/api/stripe/webhooks/route.ts:94-108`
- [x] **BUG-7** — Webhook Stripe **sin idempotencia** real (el comentario la promete pero no existe) → boosts/créditos duplicados en reenvíos. Tabla `processed_stripe_events` con unique. `app/api/stripe/webhooks/route.ts`
- [x] **SEC-1** 🔴 — **Server Actions de admin sin verificar rol** → cualquier usuario autenticado puede aprobar showrooms/vehículos. Añadir `requireAdmin()` como 1ª línea de cada acción. `app/(admin)/admin/altas-showroom/actions.ts` + `app/(admin)/admin/vehiculos/[id]/page.tsx`
- [x] **SEC-2** 🔴 — **Webhooks entrantes fail-open**: HMAC solo se comprueba si el secreto está en el entorno. Hacerlo obligatorio (fail-closed). `app/api/webhooks/{appointment-result,assistant-result,hot-lead-alert}/route.ts`
- [x] **SEC-3** 🔴 — **Mass-assignment en vehículos**: dealer se autopublica activo/destacado saltando moderación y el boost de €49. Allowlist de columnas + forzar `status='pending_review'`. `app/api/vehicles/route.ts` + `[id]/route.ts`
- [x] **SEC-4** — **Falsificación de leads/citas**: `dealer_id`/`vehicle_id` arbitrarios sin validar pertenencia, sin rate-limit. `app/api/leads/route.ts` + webhooks
- [x] **SEC-5** — **Inyección de operadores PostgREST** en el buscador (`.or()` con input crudo) → expone borradores/no-activos. `lib/vehicle-query.ts:85`
- [ ] **SEO-1/SEO-2** — (solo si se levanta el gate noindex) `/sobre-nosotros` y `/coches/berlinas` en el sitemap+footer pueden ser 404. Auditar 1:1 rutas del sitemap. `app/sitemap.ts` — condicional, no aplica mientras `noindex` siga activo.

### 🟡 Sprint 1 — Calidad y confianza
- [x] **BUG-5** — `incrementEliteCounter` importado pero **nunca llamado** → capacidad Elite por provincia no se limita. `app/api/stripe/webhooks/route.ts`
- [x] **BUG-6** — 3 escrituras basura `admin.rpc as never` que corrompen `used`/`current_elite_showrooms`. `lib/boosts.ts:81,180` + `lib/elite-capacity.ts:87`
- [x] **BUG-8** — Sin cron que expire boosts ni resetee `is_featured` → el orden prioriza boosts caducados.
- [x] **BUG-9** — Doble-reserva en `assistant/book` (check+insert sin constraint único). Resuelto: migración `064_appointment_slot_unique.sql` (índice único parcial `uniq_appointment_dealer_slot`) + `app/api/assistant/book/route.ts` captura `23505` y devuelve `409` con rollback del lead. Verificado 2026-07-21.
- [ ] **SEC-6** — Import por API key global sin scoping (`IMPORT_API_KEY` acepta cualquier `dealer_slug`, sin plan-gating). `app/api/vehicles/import/route.ts` — diferido.
- [x] **SEC-7** — Upload confía `file.type`/extensión del cliente, sin magic bytes. `app/api/upload/route.ts`
- [ ] **SEC-8** — Contraseña temporal devuelta en el JSON de respuesta + sufijo fijo `7a`. Invitación por email. `app/api/team/members/route.ts` — diferido.
- [x] **A1** 🎨 — **Contraste AA falla en el texto gris más usado** (`bsm-text-muted` 4.02:1). Resuelto: `tailwind.config.ts:41` sube `text-muted` a `#979797` ("subido de #8A8A8A para pasar AA sobre superficies elevadas"). Verificado 2026-07-21.
- [ ] **A2/A3** — Modales sin `role="dialog"`/focus-trap/Escape (hook `useModalA11y` compartido). `LeadsBandeja.tsx`, `KanbanBoard.tsx`, `SearchAlertModal.tsx`, `VehicleGallery.tsx`
- [x] **B1** — Header con **gradiente marrón** que rompe la identidad "negro premium" → gradiente negro + acento dorado. `components/layout/Header.tsx:125-129`. **Resuelto 2026-08-31**: gradiente marrón (`rgba(58,45,36,...)`) sustituido por negro real (`obsidian` `rgba(10,10,10,...)`→`rgba(5,5,5,...)`), borde inferior pasa de marrón (`#2A1E16`) a dorado sutil (`border-gold/20`). **Corregida también una segunda instancia no documentada**: el menú móvil (línea ~295) tenía el mismo gradiente marrón hardcodeado, no capturado en la auditoría original — mismo fix aplicado ahí.
- [x] **B3** — Tablas de admin/dashboard rotas en móvil (8 col con scroll) → patrón card apilada. `app/(admin)/admin/dealers/page.tsx`. **Resuelto 2026-08-31**: tabla original queda `hidden lg:block` (sin tocar desktop); nueva vista `lg:hidden` con tarjetas apiladas (nombre+email, badge de estado, plan/ciudad/vehículos/fecha en grid 2 columnas), mismas clases de badge y tokens ya existentes en el archivo. Verificado por build limpio (`tsc`+`next build`, ruta `/admin/dealers` compila) — **no verificado visualmente logueado** (la ruta exige login de admin, sin credenciales disponibles en esta sesión).
- [x] **B2** — Hero con 3 CTAs dorados compitiendo → 1 primario + secundarios. `app/(public)/page.tsx:112-129`. **Resuelto 2026-08-31**: en el código real solo había 2 botones `btn-gold` compitiendo ("Explorar coches"/"Explorar motos"), no 3 — la cifra del hallazgo original no coincidía con el código actual. "Explorar coches" queda como primario (`btn-gold`), "Explorar motos" pasa a `btn-outline` (clase ya existente en el proyecto). Verificado visualmente con Playwright contra el dev server.

### 🟢 Sprint 2 — Pulido premium + SEO
- [x] **BUG-bajos** — **Resuelto 2026-08-31/09-01**, debatido con Codex (2 rondas) antes de implementar:
  - Orden de membresía owner>admin (no `created_at`): `app/(dashboard)/dashboard/equipo/page.tsx` — `ROLE_RANK` ahora deriva de `ASSIGNABLE_ROLES` (jerarquía real), no de un sort owner-only. De paso, corregido un bug de tipos real (`ROLE_RANK` no cubría `group_admin`/`location_manager`, un `as Record<OrgRole,number>` mentía sobre las claves presentes) — `lib/permissions.ts` ahora exporta `AssignableRole` con el tipo preciso de `ASSIGNABLE_ROLES`.
  - `DELETE` de miembro borraba el usuario de auth global (`admin.auth.admin.deleteUser`), lo que —por `ON DELETE CASCADE` en `organization_members.user_id`— le quitaba el acceso a **todas** sus organizaciones, no solo la actual. `app/api/team/members/[id]/route.ts`: ahora solo borra la fila de `organization_members` de esta organización. `POST /api/team/members` reutiliza el usuario de auth existente si el email ya tiene cuenta (`lib/supabase/admin-helpers.ts`, `findAuthUserByEmail` — extraído de `altas-showroom/actions.ts` para no duplicarlo), en vez de fallar con "email ya existe". `TeamManager.tsx` actualizado para el caso "cuenta existente, sin contraseña nueva".
  - TOCTOU en `maxUsers`: nueva RPC `add_team_member_if_under_limit` (migración `094_add_team_member_atomic.sql`) con `pg_advisory_xact_lock(hashtextextended(org_id::text, 0))` — serializa altas concurrentes de la misma organización dentro de una sola sección crítica. `maxUsers` se sigue calculando en la app (`lib/entitlements.ts`) y se pasa como parámetro, sin duplicar esa lógica en SQL.
  - Consumo de crédito de boost no atómico: **ya estaba resuelto** (migración `062_consume_boost_credit.sql`, `UPDATE ... WHERE used < quantity` + `GET DIAGNOSTICS`) — verificado leyendo la migración real, no tocado esta sesión.
  - **Auditoría cruzada de Codex sobre este código** (no solo el diseño): 5 hallazgos reales aplicados — `GRANT EXECUTE ... TO service_role` explícito en la RPC (defensivo); condición de carrera real detectada (el pre-check de membresía duplicada queda fuera del lock) → mapeado el código Postgres `23505` a un 409 limpio en vez de 500; logging del rollback de `deleteUser` si el propio borrado falla (antes se ignoraba en silencio).
  - **Pendiente de aplicar**: la migración 094 se aplica sola vía CI (`migrate.yml` → `supabase db push --linked`) al hacer push a `main` — no aplicada aún, ver cierre de sesión.
- [x] **A4-A7** — Labels/errores accesibles en formularios; foco visible en galería; radios con check no-cromático. **Resuelto**: formularios accesibles en `login`/`registro` (ya lo estaban) y corregidos `recuperar`, `reset-password`, `admin-login`, `contacto`, `TeamManager` (label`htmlFor`+`id`, `aria-invalid`, `role="alert"` en errores) — foco visible en `VehicleGallery` ya resuelto en sesión previa — radios de `QualifiedLeadForm` con icono `Check` (`aria-hidden`, espacio reservado vía `opacity-0`→`peer-checked:opacity-100`, no solo color).
- [x] **A8-A12** — `aria-label` en iconos header (resuelto en sesión previa) · jerarquía h1→h3 (resuelto en sesión previa) · **placeholder de imagen legible: resuelto 2026-09-01**, con hallazgo real — `VehicleCard.tsx` usaba `text-bsm-border` (#2A2A2A) sobre fondo #111111 (contraste ≈1.3:1, prácticamente invisible) en vez de `text-bsm-text-muted` (#979797, ≈6.5:1, AA); `VehicleGallery.tsx`'s `NoImagePlaceholder` ya usaba el token correcto pero lo diluía con `opacity-40`/`opacity-60` adicional (contraste efectivo ≈2-3:1) — opacidad reducida a valores que no anulan el contraste del token. **Pendiente**: `aria-expanded` en hamburguesa, `prefers-reduced-motion`.
- [x] Unificar los 3 dorados (`#C6A64B`/`#C9A84C`/`#BFA14A`) — resuelto: solo `#C6A64B` existe en el código hoy (verificado 2026-07-21, sin rastro de los otros dos).
- [x] **B4-B11** (resto) — **Resuelto 2026-09-01** salvo dos: tipografía de descripción `text-sm`→`text-base` en `VehicleDetailContent.tsx` · loading/skeletons reales en `/coches`, `/motos` y sus `[slug]` (no había ningún `loading.tsx` en el proyecto) · tokens de borde: sweep mecánico de 273 instancias de `#2A2A2A`/`#1E1E1E`/`#C6A64B` sueltos → `bsm-border`/`bsm-border-light`/`gold` en 46 archivos (script Node dedicado, verificado con `tsc`+`next build`) · breadcrumb legible: unificado el patrón `<nav aria-label><ol>` en `VehicleDetailContent.tsx` (antes `<div>` plano) · unificar `ContactForm`/`QualifiedLeadForm`: `ContactForm.tsx` **eliminado** (0 imports reales, código muerto confirmado por grep) — `QualifiedLeadForm` es el único formulario de contacto en producción. **Pendiente**: autoguardado del wizard de publicar, jerarquía visual de "precio a consultar".
- [x] **SEO-3/4/5/6** — `mileageFromOdometer` con guarda de null (resuelto en sesión previa) · OG de fichas con `url` real (resuelto en sesión previa) — **sin dimensiones deliberadamente**: `VehicleImage` no captura ancho/alto al subir, inventarlas violaría la regla de no fabricar datos · **respuesta directa citable (GEO) + `FAQPage` en landings de categoría/marca: construido 2026-09-01** — ver detalle abajo.
- [x] **SEO-7/8/9** — breadcrumb con nivel categoría + marca→`/marcas/[slug]` (resuelto 2026-09-01, `VehicleDetailContent.tsx` + ambos `[slug]/page.tsx`) · silo horizontal entre categorías (resuelto 2026-09-01, ver detalle abajo). **Pendiente**: `priority={activeIndex===0}` en galería.
- [x] **SEO-10/11/12** — fecha visible derivada de `dateModified` (`VehicleDetailContent.tsx`, "Actualizado en [mes] de [año]") · título de dealer con ciudad (`dealers/[slug]/page.tsx:77`) · enlaces al split `/marcas/[brand]/coches|motos` (nav "Todos los X · Coches · Motos" en la página hub + enlaces "ver todos" al final de cada grid) + dropdown "Marcas" del Header y lista de marcas del Footer corregidos para enlazar a `/marcas/[slug]` reales en vez de `/coches?marca=X` (Footer tenía el mismo bug que el Header: "BMW M"/"Mercedes AMG" generaban slugs inventados `bmw-m`/`mercedes-amg` en vez de los reales `bmw`/`mercedes-benz` — hallado con Playwright, no estaba en ningún checklist). **Todos 2026-08-31/09-01.**
- [x] **SEC-9/10/11** — Cabeceras de seguridad (CSP/HSTS/X-Frame-Options) en `next.config.js`; validar/rate-limit `/api/track`; no devolver errores crudos de PostgREST. **Resuelto 2026-08-31 (noche):**
  - **SEC-9**: HSTS/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy **ya existían** (el audit de 2026-07 estaba desactualizado). Solo faltaba **CSP real**, que no existía en ningún sitio. Añadida con dominios verificados en código (GTM/GA4, Supabase, YouTube embed) — `script-src` usa `'unsafe-inline'` (el layout raíz tiene 3 `<script>` inline sin nonce, incluido el bootstrap de Consent Mode v2) y en dev añade `'unsafe-eval'` (React Fast Refresh, no existe en producción). Clarity (`*.clarity.ms`) añadido tras encontrarlo con una prueba real en navegador — GTM lo inyecta desde su propio contenedor, invisible a cualquier grep del código.
  - **SEC-10**: `/api/track` sin ningún límite. Añadido rate-limit por IP (300/5min, vía el `ip_hash` en `metadata` — mismo patrón ya usado en `custom_requests`, sin migración nueva) reutilizando `lib/rate-limit.ts` ya existente.
  - **SEC-11**: verificado con 3 búsquedas distintas en todo `app/api/` — no se encontró ningún endpoint devolviendo `error.message`/`.details`/`.hint` ni el objeto de error crudo. Ya estaba resuelto (probablemente efecto colateral de reescrituras anteriores de esta sesión), sin cambio necesario.
  
  **Verificado de verdad, no solo "no rompe el build":** CSP probada con Playwright en dev Y en `next build`+`next start` (producción real, sin `unsafe-eval`) — home, catálogo y ficha de vehículo, con consentimiento aceptado (GTM+GA4+Clarity cargando) — 0 errores de consola en ambos modos. Rate-limit probado con 301 peticiones reales contra el servidor de producción local (petición #300 → 200, #301 → 429, límite exacto) — las 300 filas de prueba insertadas en `analytics_events` (marcadas con `session_id` distintivo) se borraron después, verificado en 0 filas restantes.
- [x] **SEO-backlog** — cerrado en `seo-geo-backlog.md` P01, P02, P03, P04, O2-07/P07 (ya implementadas, estaban marcadas pendientes por error) — resuelto en sesión previa.

#### GEO — FAQPage dinámica + enlazado cruzado (nuevo, 2026-09-01)

Construido por decisión explícita del usuario ("lo dejo en vuestras manos... entre tu y Codex ejecutar todo"), informado por investigación de un agente sobre cómo lo hacen Classic.com, Chrono24, Classic Driver, PistonHeads, Bring a Trailer y JamesEdition, más verificación directa del inventario real de producción. Debatido con Codex en 2 rondas (contenido/arquitectura, y código de la capa de agregación) antes y después de implementar.

- **`FaqSection` (ya existente, sin cambios)** reutilizado en las 15 landings de categoría (6 coches + 9 motos) y en `/marcas/[brand]` (marcas con editorial en `lib/brand-editorial.ts`, ~90).
- **`lib/category-faq.ts`** (nuevo): 2-3 preguntas cualitativas fijas por categoría (33 en total, contenido real anclado en campos de la ficha y normativa DGT verificada por WebSearch el 2026-08-31 — 30 años + exención ITV >60 años, marco 2024) + hasta 3 preguntas dinámicas con umbral doble: rango de precios + nº de unidades desde `pricedCount>=3`, precio medio solo desde `pricedCount>=5` (una media con 3-4 muestras no es representativa, sobre todo en "deportivos" que mezcla deportivos+superdeportivos). Con el inventario real de hoy (36 coches / 25 motos activos), `scooter` y `entusiastas` están a 0 unidades y `ediciones-especiales`/`clasicas` a 1 — el fallback a solo-cualitativas **no es un edge case, es el caso común hoy**, verificado en producción real vía Playwright.
- **`lib/brand-faq.ts`** (nuevo): mismo criterio de doble umbral; 2 preguntas fijas de confianza (verificación de vendedores, cómo comprar) con wording que nunca promete stock que no existe ("cuando esa información está disponible", "explorar el catálogo... en cada momento" en vez de afirmar unidades ahora mismo).
- **`lib/related-categories.ts`** (nuevo) + **`components/marketplace/RelatedCategories.tsx`** (nuevo): sección "Sigue explorando" al final de cada categoría — mapa estático de categorías relacionadas (puente cronológico clásicos↔deportivos, banda de posicionamiento lujo↔suv↔especiales, cruce coches↔motos) más widget dinámico de marcas con stock real en esa categoría (`GROUP BY brand_name`, top 6, enlaza a `/coches?categoria=X&marca=Y` reutilizando filtros ya existentes — sin `categoria=` solo en "deportivos", la única categoría de ruta que agrupa 2 valores reales de columna, donde ese filtro infrarrepresentaría el resultado).
- Verificado: `tsc`+`next build` limpios, Playwright en 4 páginas reales (categoría con stock, categoría a 0 stock, marca, ficha) sin errores de consola, comportamiento del umbral y omisión de secciones vacías confirmado contra datos reales de producción.

---

## Checklist para dejar lista la web (Fase A completa)

### 🔴 Bloqueantes operativos inmediatos
- [x] **SMTP Supabase Auth** — configurado vía API (2026-06-26): smtp.hostinger.com:587, hola@blacklabelmarket.es, rate_limit=30/h
- [x] **Subida de fotos** — ✅ verificado (2026-06-26): NO usa R2; usa Supabase Storage (bucket `vehicle-images`, público). Probado upload+lectura pública+borrado end-to-end. R2 era una suposición errónea del doc (punto 2 abajo)
- [x] **CRON_SECRET** en Vercel — ya configurado
- [x] **DNS: SPF + DKIM + DMARC** en Hostinger para `blacklabelmarket.es` — ✅ verificado (2026-06-26): SPF y DKIM (3 CNAMEs) ya existían; DMARC tenía `p=none`, se le añadió `rua`/`ruf`/`fo` vía API
- [x] **Textos legales** — ✅ verificado (2026-06-26): NO están en Supabase, están hardcodeados en `app/(public)/legal/[slug]/page.tsx`. **Sin placeholders**: razón social KAZAWEB S.L.U., NIF B42761254, domicilio, registro mercantil y emails reales (`hola@` y `privacidad@blacklabelmarket.es`) ya rellenos. Buzón `privacidad@blacklabelmarket.es` ✅ creado como **alias** de `hola@` (las solicitudes RGPD llegan a la bandeja de `hola@` y se puede responder desde `privacidad@`)

### 🟡 Antes del primer showroom real
- [x] **CUSTOM_REQUESTS_INTERNAL_TOKEN** en Vercel — configurado (2026-06-26)
- [x] **Redes sociales** — ✅ verificado en producción (2026-06-26): NO está vacío. Header (barra menú) y footer muestran los 4 iconos (Instagram `blacklabel_premiumcars`, TikTok `@blacklabelmarket.es`, Facebook `blacklabel.es`, YouTube `@BlackLabelPremium`). Guardados en `platform_config.social_links` + fallback hardcodeado en `/api/platform/social-links`. Editable en `/admin/configuracion`. (LinkedIn: campo disponible, sin URL — añadir si procede)
- [x] **Emails de acuse a compradores** en WF5 (punto 8 abajo) — ✅ alerta + a la carta + lead.created funcionando y verificados E2E (2026-06-26). El aviso "lo hemos encontrado" se descartó por diseño (el contacto con el comprador lo hacen los showrooms/plataforma directamente, no un email automático).
- [x] **Slack Incoming Webhook** (punto 6 abajo) — ✅ HECHO (2026-06-26): `SLACK_WEBHOOK_URL` fijado en n8n; WF1–WF4 (showroom) + WF5 (leads/a la carta) postean a Slack. Verificado E2E.

### 🟡 Antes de captación pública
- [ ] **Quitar noindex** (punto 9 abajo) — cuando el catálogo tenga vehículos reales
- [ ] **GTM** en `/admin/configuracion` — para analytics; Consent Mode v2 ya está montado en el código
- [x] **Auditoría legal RGPD/LSSI-CE/DSA/P2B (Codex, `gpt-5.6-sol`) + corrección de las páginas legales** — 2026-08-27.
  `app/(public)/legal/[slug]/page.tsx` ampliado con las cláusulas P2B (preaviso 15 días cambios de condiciones,
  preaviso motivado 30 días + revisión humana antes de suspender/terminar), mecanismo de notificación DSA,
  plazo RGPD corregido (1+2 meses, no 3), sustitución del enlace ODR muerto, ranking/clasificación explicado.
  Corregido también en código: GTM ya no carga sin consentimiento (`components/legal/ConsentManagedGtm.tsx`),
  `/politica-de-cookies` redirige a `/legal/cookies`. Detalle completo en `agency/registro_decisiones.md`
  2026-08-27. **3 puntos dejados como decisión pendiente de H** (no auto-resueltos): microempresa DSA art. 19,
  aplicabilidad de la verificación KYBC del art. 30 DSA, y confirmación de que el texto de garantía legal es
  informativo — ver `docs/legal-pendiente-decision-h.md` (nuevo).
- [ ] **Revisión legal con asesor profesional RGPD/LSSI/DSA** antes de publicar — el trabajo de arriba es
  investigación de apoyo (Codex + Claude), no sustituye asesoramiento legal profesional

### 🔵 Cuando haya dealers / stock real
- [x] **IMPORT_API_KEY** en Vercel — configurado (2026-06-26)
- [ ] **Stripe** completo — Fase B (ver sección más abajo)

### 🔵 Features Elite (Fase C)
- [x] **HOT_LEAD_ALERT_SECRET** en Vercel — configurado (2026-06-26)
- [x] **APPOINTMENT_RESULT_SECRET** en Vercel — configurado (2026-06-26)

---

## Estado actual (lo que ya está hecho)

- ✅ n8n activo con WF1–WF7 operativos (signup, aprobación, rechazo, más info, eventos, alertas, agente IA)
- ✅ **QA lado comprador — ronda 2 (2026-06-30): RE-VERIFICADO 2026-07-14, los 4 hallazgos ya estaban corregidos en el código (el doc no se había actualizado).** (a) **Comparador**: `components/marketplace/CompareBar.tsx` sincroniza la URL `?ids=` al quitar/limpiar estando en `/comparar` (comentario explícito en el código documentando el fix) → confirmado sin desincronización. (b) **/cuenta/favoritos**: usa Server Action + `revalidatePath`, arquitectura estándar de Next.js App Router que refresca sin recarga manual; el contador de "Guardados"/"Alertas" se calcula en cada render server-side, no puede quedar stale. (c) **/cuenta/alertas**: `toggleAlert` (Server Action) ya implementa pausar/reactivar con iconos Pause/Play — confirmado construido y funcional. (d) **Buscador**: `lib/vehicle-query.ts` indexa `brand_name`, `model_name`, `version` y `title` en el `.or()` — verificado en producción: `search=Weissach` devuelve 2 resultados reales. (e) Móvil: sin cambios, seguía OK.
- ✅ **Asistente IA del comprador (WF7) REPARADO y verificado E2E (2026-06-30).** No funcionaba en prod por 3 bugs: (1) `NextResponse` de fallback declarado a nivel de módulo en `/api/assistant/{session,message}` → body agotado → 200 vacío → widget caía al form clásico [commit f3e083a]; (2) `/api/assistant/session` no enviaba `dealer_id` a nivel raíz → WF7 respondía 400 [commit c0a7724]; (3) nodo OpenAI de WF7 en `contentType: raw` → OpenAI no parseaba el body ("you must provide a model parameter") → pasado a modo JSON. Verificado chat E2E (apertura + turno con respuesta contextual).
- ✅ **Asistente IA dedicado por dealer — RESUELTO (2026-07-17).** El gap anterior ("`showroom_assistant_config` vacía, sin provisión automática") ya no aplica: `lib/integrations/n8n-assistant-provisioning.ts` clona el workflow WF7 por dealer (migración 073, `n8n_workflow_id`) y se llama desde `approveApplication`, el webhook de Stripe (checkout completado y `handleSubscriptionDeleted`) y `setDealerPlan` (subir y bajar de plan). **Gap nuevo detectado (2026-07-21, no corregido):** `handleSubscriptionUpdated` (evento `customer.subscription.updated`, se dispara si el dealer cambia de plan desde el portal de facturación de Stripe) solo sincroniza `status`, no llama a `provisionDealerAssistant`/`deactivateDealerAssistant` — un cambio de plan por esa vía deja el asistente desincronizado del plan real.
- ✅ Todas las variables de entorno de n8n configuradas (OPENAI, FIRECRAWL, SUPABASE, MAIL_FROM, SMTP Hostinger, etc.)
- ✅ Vercel: `N8N_WEBHOOK_DEALER_APPROVED/REJECTED/PENDING_INFO`, `ASSISTANT_WEBHOOK_SECRET/RESULT`, `NEXT_PUBLIC_APP_URL`
- ✅ Vercel: `N8N_WEBHOOK_URL` + `N8N_WEBHOOK_SECRET` configurados — el market emite eventos en tiempo real a WF5
- ✅ Flujo de alta WF1→WF4 conectado de extremo a extremo (solicitud → auditoría → aprobación/rechazo/más info)
- ✅ Panel admin `/admin/altas-showroom` rediseñado + detalle `/[id]` + sidebar de acciones
- ✅ Bug email duplicado en aprobación resuelto
- ✅ Dominio `blacklabelmarket.es` configurado en Vercel (apex canónico, www→apex)
- ✅ Deploy en producción en `blacklabelmarket.es`
- ✅ Cuenta Firecrawl: operativa · credenciales en `CREDENTIALS.local.md` (privado, no versionado) · API key en n8n
- ✅ WF5 pipeline completo: recibe los 6 tipos de evento → los 6 devuelven HTTP 200 → emails salen por Hostinger SMTP
- ✅ WF5 → WF6 (vehicle.approved): vehicleId se pasa correctamente → Supabase query OK → matcher de alertas operativo
- ✅ SMTP Hostinger en n8n funcionando (credential recreado, `N8N_ENCRYPTION_KEY` fijada para evitar rotación futura)
- ✅ Todos los workflows BLM (WF1–WF6) actualizados con la nueva credencial SMTP
- ✅ WF1 pipeline completo end-to-end: acuse al solicitante + informe interno al admin + Firecrawl + Claude + Supabase (exec #41 success, 250 Ok: queued)

---

## FASE A — Para operar con los primeros 20 showrooms

### ✅ 0. DNS: SPF + DKIM + DMARC para blacklabelmarket.es — HECHO (2026-06-26)

Verificado contra la API de Hostinger. **Los tres ya estaban configurados** (Hostinger los crea al dar de alta el buzón `hola@blacklabelmarket.es`):

```
SPF    TXT  @       "v=spf1 include:_spf.mail.hostinger.com ~all"           ✅ (include actual de Hostinger, mejor que el _spf.hostinger.com antiguo)
DKIM   CNAME hostingermail-a/b/c._domainkey → *.dkim.mail.hostinger.com     ✅ (3 selectores)
DMARC  TXT  _dmarc  "v=DMARC1; p=none; rua=...; ruf=...; fo=1"               ✅ (se añadió rua/ruf/fo el 2026-06-26)
```

El `rua`/`ruf` apunta a `hola@blacklabelmarket.es` (mismo dominio → los informes llegan sin necesidad de registro de autorización cross-domain que sí exigiría un `gmail.com`).

**Notas de método (para futuras sesiones):**
- El MCP `hostinger-dns` no siempre arranca (cold start de `npx`). Fallback fiable: API directa con el token de `~/.claude.json`.
- **Base URL real: `https://developers.hostinger.com/api`** (en plural; `developer.hostinger.com` y `api.hostinger.com` NO sirven).
- GET zona: `GET /dns/v1/zones/{domain}` · Actualizar: `PUT /dns/v1/zones/{domain}` con `{overwrite:true, zone:[...]}` (overwrite afecta solo a los pares name+type incluidos) · Validar: `POST /dns/v1/zones/{domain}/validate`.

**Impacto:** Supabase Auth (reset contraseña, confirmación), n8n WF1–WF4 (emails a showrooms), deliverability general. Deliverability ya cubierta.

**Pendiente opcional (cuando lleve semanas en marcha):** subir DMARC de `p=none` a `p=quarantine` tras revisar informes.

---

### ✅ 1. SMTP propio en Supabase Auth — HECHO (2026-06-26)
Configurado vía Supabase Management API:
- Host: `smtp.hostinger.com` · Puerto: `587` (TLS)
- Usuario/remitente: `hola@blacklabelmarket.es` · Nombre: "Black Label Market"
- Rate limit subido de 2 → 30 emails/hora
- `SITE_URL` y `uri_allow_list` ya estaban correctos desde 2026-06-17
- Test enviado a `aldeiaceo@gmail.com` — debe llegar desde `hola@blacklabelmarket.es`

---

### ✅ 2. Subida de imágenes de vehículos — HECHO (2026-06-26)

**R2 NO se usa.** La ruta `/api/upload` (y `/api/gallery`) usa **Supabase Storage** con el bucket `vehicle-images` (vía service role / `createAdminClient`, así que RLS no bloquea). El doc original asumía R2 por error.

Estado verificado contra Supabase:
- Bucket `vehicle-images` existe y es **público** (creado 2026-05-22). También existe `dealer-logos` (público, actualmente sin uso — los logos van a `vehicle-images/logos/...`).
- Prueba end-to-end OK: upload con service role → `200`; lectura de la URL pública anónima → `200 image/png`; borrado → OK.

**No hace falta ninguna cuenta ni variable de Cloudflare.** Las `R2_*` que figuraban como pendientes en Vercel son innecesarias.

---

### ✅ 3. N8N_WEBHOOK_URL en Vercel — HECHO (2026-06-25)
Configurado y desplegado. El market emite eventos en tiempo real a WF5.

---

### ✅ 4. WF1 — acuse de recibo automático al solicitante — HECHO (2026-06-26)
Email de confirmación al solicitante conectado y verificado (exec #41, `250 Ok: queued`). El showroom recibe confirmación inmediata en el mismo email que usó en el formulario.

---

### ✅ 5. WF1 — notificación interna al equipo — HECHO (2026-06-26)
Email interno al admin (`aldeiaceo@gmail.com`) con resumen de la solicitud y enlace al panel `/admin/altas-showroom/[id]`. Ejecutado en el mismo exec #41.

---

### ✅ 6. Slack Incoming Webhook (SLACK_WEBHOOK_URL) — HECHO (2026-06-26)
- Incoming Webhook creado (app Slack "Black Label Market", canal del usuario).
- `SLACK_WEBHOOK_URL` fijado en el servicio Swarm `aldeia_n8n` vía `docker service update --env-add` (SSH). ⚠️ **Durabilidad:** persiste en Swarm; si algún día se pulsa **Deploy** en EasyPanel para n8n, hay que re-fijarlo (o mirrorearlo en EasyPanel → n8n → Environment).
- WF1–WF4 ya tenían nodos Slack (alta/aprobación/rechazo/más-info de showroom) → ahora activos.
- **Añadidos avisos en WF5** (`Lead - Slack aviso` y `Custom Request - Slack aviso`) para leads de comprador y solicitudes a la carta, en paralelo a los emails. Verificado E2E: exec #48/#49, Slack `ok`.

---

### ✅ 7. WF5→WF6 end-to-end — HECHO (2026-06-25) · matcher con alerta real VERIFICADO (2026-06-29)
Pipeline verificado: `vehicle.approved` → WF5 (email dealer OK) → WF6 (Supabase query OK, alertas matcher OK). SMTP Hostinger entrega emails con `250 Ok: queued`.

**2026-06-29 — Matcher probado con una alerta REAL en BD** (lo que faltaba): comprador creó alerta Porsche 911 (año≥2020, ≤300.000€) por la UI → al aprobar un Porsche 911 2021 (139.000€) y disparar `vehicle.approved`: WF5 exec 61 + **WF6 exec 62** → 1 match → **email al comprador `250 OK`** ("¡Encontramos tu Porsche 911 2021!") + `search_alerts.last_matched_at`/`matched_vehicle_ids` actualizados. WF6 carga TODAS las alertas activas y compara marca/modelo/año_min/budget_max; el precio lo toma de la query a Supabase (el payload de `vehicle.approved` no lo trae). El nodo de email se llama "Resend" pero usa SMTP Hostinger. ⚠️ Operativo: al emailear a cada alerta activa que matchee, comprobar las alertas en BD antes de tests para no escribir a terceros.

**Lado comprador + tableros showroom verificados E2E el mismo día**: alerta+acuse, favorito, match+email, lead (`lead.created` exec 63, emails+Slack) y solicitud a la carta (`custom_request.created` exec 64). En el dashboard del showroom: el lead aparece en **Oportunidades/Kanban** (mover Nueva→Contactada persiste) y la solicitud en **A la carta** (badge "Acceso anticipado 24h", contacto del comprador visible). Hallazgos menores a pulir: forms (alerta/lead/a-la-carta) no pre-rellenan nombre/email del usuario logueado; el contador "X nueva" del Kanban no se refresca al mover; `leads.updated_at` no se bumpea al cambiar estado; hay datos basura de QA previo en el board a-la-carta. Detalle en memoria `project_showroom_onboarding_process`.

---

### 8. Emails a compradores — vehículos a la carta y alertas

- [x] **Acuse al crear alerta** (`search_alert.created`) — ✅ HECHO (2026-06-26). El nodo "Alerta - Preparar confirmación" leía `d.user_email`/`d.email` pero el market envía el email en `d.contact.email` → `emailPayload` salía `null` y **no se enviaba nada**. Corregido (lee `d.contact.email` + `d.budget_max`, acentos limpios). Verificado E2E: exec #42 `success`, SMTP `250 2.0.0 Ok: queued`.
- [x] **Acuse al enviar solicitud a la carta** (`custom_request.created`) — ✅ ya funcionaba (tenía fallback `d.contact?.email`); se limpió el mojibake del texto y se humanizó el plazo (immediate→"Lo antes posible", etc.).
- [~] **Aviso "lo hemos encontrado"** — ❌ DESCARTADO POR DISEÑO (2026-06-26). No se hace como email automático de la plataforma: el contacto con el comprador lo hacen **personas**. En **leads**, el showroom ve `buyer_email`/`phone`/`whatsapp` en `/dashboard/oportunidades` y contacta directo. En **a la carta**, los showrooms Pro/Elite ven la solicitud con el contacto del comprador en `/dashboard/solicitudes` (`SolicitudesBoard`, `mailto:`/`tel:`) y el CTA "Tengo este vehículo" avisa a `hola@` para que la plataforma conecte comprador↔showroom; el admin gestiona el estado en `/admin/solicitudes`. **No** se construye `custom_request.matched` ni nodo WF5: duplicaría el contacto humano directo.

**Hallazgos colaterales (reportados):**
- [x] 🔴 **`lead.created`** — ✅ ARREGLADO (2026-06-26). WF5 leía `d.buyer_email`/`d.dealer_email`/`d.vehicle_title` que el market no envía (solo manda `data.contact.{name,email}` + `vehicle_id`/`dealer_id`) → ni comprador ni dealer recibían email. Se añadió un nodo **"Lead - Buscar vehiculo y dealer"** (httpRequest a Supabase, query embebida `vehicles?...select=...,dealer:dealers(name,email)`) entre el Router y "Lead - Preparar emails", y se reescribió el prep para leer `data.contact.*` + el lookup. Verificado E2E con dealer piloto (test seguro, email mutado y revertido): exec #44 `success`, **ambos emails 250** (comprador "Hemos enviado tu consulta — Aston Martin DBS 2023" + dealer "Nueva consulta: …"). Código en `n8n-workflows/wf5-nodes/`. _Limitación: leads del asistente sin `vehicle_id` degradan a texto genérico (añadir fallback por dealer_id cuando se active el asistente)._
- [x] 🟡 **Mojibake en emails a dealer/vehículo** — ✅ LIMPIADO (2026-06-26). Reescrito el contenido (jsCode) de "Vehículo aprobado/rechazado - Preparar email" con UTF-8 correcto (Lead/Alerta/Custom ya se limpiaron al arreglarlos). Verificado E2E: exec #45 (aprobado) y #47 (rechazado), ambos `250`, asuntos con acentos correctos. Escáner confirma 0 nodos con `�` en jsCode. _Quedan los **nombres** de algunos nodos con mojibake, pero son internos (no salen en emails) y renombrarlos obligaría a reescribir las conexiones — sin valor para el usuario._

> Método para tocar WF5 sin romper acentos: **NO** usar `Invoke-RestMethod`+`ConvertTo-Json` de PowerShell (lento/corrompe UTF-8). Usar **Node** (`fetch` nativo) con el jsCode en ficheros UTF-8. WF5 ID: `mgGKQ9r8wkC3shwz` · API n8n: `https://aldeia-n8n.giuxk6.easypanel.host/api/v1/workflows/{id}` (header `X-N8N-API-KEY`).

---

### 🔴 9. Quitar noindex
El sitio está invisible para buscadores. Hacerlo cuando el catálogo tenga vehículos reales publicados.

**Dónde:** buscar `noindex` en `app/layout.tsx` o `next.config.js` y eliminar la meta tag / header.

---

## FASE B — Para captación pública (cuando el market tenga stock)

### Stripe — productos y pagos

> **Cuenta creada en MODO TEST (2026-06-29): `acct_1TnfYdIhKdMKTEnw`** (email `aldeiatools@gmail.com`, ES/EUR). Flujo verificado E2E: checkout creado OK + webhook valida firma en producción (200) y rechaza inválidas (400). Credenciales y price IDs en memoria/`.env.local`.

| Tarea | Estado |
|---|---|
| Crear cuenta Stripe | ✅ creada en **test** · falta **activar** (KYC: datos KAZAWEB + cuenta bancaria) para modo **live** |
| Producto Essential (197€/mes) | ✅ creado en test (`price_1Tnfev…U87PufaV`) |
| Producto Professional (449€/mes) | ✅ creado en test (`price_1Tnfev…pX15UMNs`) — **precio provisional, cerrar definitivo** |
| Producto Elite (899€/mes) | ✅ creado en test (`price_1Tnfew…EUKa9fg8`) — **precio provisional, cerrar definitivo** |
| Add-ons: boost, pack 5, +10v, +25v, feed, diagnóstico | 🔴 no creados aún |
| Webhook Stripe → `/api/stripe/webhooks` | ✅ creado + verificado en test (`we_1Tnfew…`, 5 eventos) |
| Stripe Tax (cálculo IVA automático) | 🔴 pendiente |
| Vercel env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_{ESSENTIAL,PROFESSIONAL,ELITE}_MONTHLY` | ✅ fijadas (test) + redeploy hecho |

**Para pasar a LIVE (cuando se vaya a cobrar):** activar la cuenta (datos fiscales KAZAWEB + banco), **cerrar precios Pro/Elite/Grupo**, sustituir claves `sk_test/pk_test/whsec` por las `live`, crear add-ons, y (opcional) Stripe Tax para el IVA. Verificación más profunda pendiente: completar un checkout de test con tarjeta `4242…` para confirmar el `checkout.session.completed` → actualización del dealer (requiere un dealer de prueba con `metadata.dealer_id`).
**Decisión 2026-08-27 (H): activación LIVE queda marcada como pendiente a propósito** — se configura cuando arranque la actividad oficial con el market, no antes.

### Resto Fase B

| Tarea | Estado |
|---|---|
| Precios Essential/Professional/Elite en `/precios` | **✅ DEFINITIVOS (decisión 2026-08-27, H)** — los que ya aparecen en la web (197/449/899€/mes) son los precios finales, no provisionales. Revisado el código (`lib/plans-config.ts` + `app/(public)/precios/page.tsx`): coincide con `docs/planes-suscripcion-definitivos.md`. |
| Integración checkout Stripe en el flujo de suscripción | **✅ Ya construido — este documento estaba desactualizado.** `app/(dashboard)/dashboard/suscripcion/page.tsx` ya tiene el botón "Cambiar a [plan]" que llama a `/api/stripe/create-checkout`, que crea cliente Stripe si no existe, resuelve el price ID y crea la sesión de checkout real (`lib/stripe.ts`). Funciona ya en modo test. No verificado con un checkout de prueba real end-to-end (tarjeta `4242…`) — pendiente si se quiere confirmar antes de ir a live. |
| Plan Grupo: cerrar definición + construir en código (derivado de Elite) | **Propuesta entregada 2026-08-27** — ver `agency/registro_decisiones.md`. Sin construir en código todavía (no existe en `PLANS`/`ADDONS` de `lib/plans-config.ts`) — pendiente de que H apruebe la propuesta antes de construirlo. |
| **Add-ons — automatización de activación** (hallazgo real 2026-08-27) | De los 6 add-ons (`lib/plans-config.ts`), solo el boost (`action: 'inventory'`) tiene un camino ya automatizado (Stripe + `lib/boosts.ts`). Los otros 5 (pack de boosts, +10/+25 vehículos, stock sync, Diagnóstico Anti-Fuga) usan `action: 'request'` → un `mailto:` a `hola@blacklabelmarket.es`, sin automatización real. Plan: automatizar pack de boosts/+10/+25 (compra→activación automática vía Stripe, sin criterio humano) y dejar stock sync/Diagnóstico con validación manual del admin (si requieren criterio humano) — código delegado a Codex, pendiente de autorización del plan concreto. |
| Banner en dashboard dealer: "Trial activo hasta [fecha]" | ✅ HECHO (2026-07-14) — migraciones 067/068/069, workflow n8n `BLM - 8. Trial drip y conversión`. Detalle y checklist de verificación en `docs/ciclo-vida-trial-verificacion.md` |
| Dealers `status='trial'` visibles en perfil/listado/vehículos (RLS) — antes solo se veían al pasar a `active` (primer vehículo), dejando al fundador sin nada que enseñar durante todo el onboarding | ✅ HECHO (2026-07-14) — migración `067_trial_dealers_public_visibility.sql`. De paso se cerró un hueco real: un dealer `suspended` seguía teniendo sus vehículos públicamente visibles (RLS nunca comprobaba el dealer) |
| WF drip trial: emails días 3/10/21/28 | ✅ HECHO y probado E2E las 4 etapas (2026-07-14) — `BLM - 8. Trial drip y conversión`, n8n |
| WF conversión: email día ~28 con resumen rendimiento + CTA a elegir plan | ✅ HECHO — misma etapa 4 del workflow anterior, con datos reales vía RPC `trial_dealer_stats` |

---

## FASE C — Features Elite avanzadas (cuando haya base instalada)

Las tablas y endpoints ya están construidos. Solo falta conectar con servicios externos y construir los workflows n8n.

| Feature | Qué falta |
|---|---|
| **Reserva de citas** (tablas `appointments` ✅) | **Decisión 2026-08-25: Fase A (Google Calendar OAuth) queda en backlog indefinido, no es necesaria.** Fase B (horario manual, sin OAuth) es la vía definitiva — verificada de extremo a extremo con datos reales el 2026-08-26 (disponibilidad, reserva, sin solapes, lead+cita en BD, emails de confirmación a comprador y showroom). El código de Fase A sigue completo y dormido para una futura reactivación si algún día compensa (ver `docs/agente-cita-fase-A-google-calendar.md`), pero no bloquea nada del alta de fundadores. |
| **Lead scoring** (campos `lead_score` en `leads` ✅) | **Confirmado 2026-07-21: solo la mitad construida.** `app/api/webhooks/assistant-result/route.ts` ya recibe `qualification.score` y rellena `lead_score`/`score_reason`/etc., pero `n8n-workflows/wf7-ai-assistant.json` no tiene ningún nodo de scoring ni llama a esa ruta — falta el prompt de scoring + el workflow n8n que lo dispare. **Pausado a propósito 2026-08-27** — decisión explícita de H de no tocarlo en esta ronda del día a día. |
| **Soporte y trust/safety** (sin construir) | **Discutido 2026-08-27, sin decidir ni construir.** Sin canal formal hoy (todo ad-hoc por Slack). Se validó WhatsApp como canal razonable, pero quedan 2 cosas por resolver: (1) confirmar si existe o hay que crear un número de WhatsApp Business propio de BLM (el de la agencia sigue bloqueado por el pago de Meta), (2) decidir el registro mínimo (Airtable) para no perder trazabilidad/urgencia si todo vive en WhatsApp. |
| **Onboarding white-glove — watcher de Drive y dedupe de VIN** (sin construir) | **Sin tocar en la ronda de día a día de 2026-08-27** — sigue exactamente como estaba: alguien revisa a mano la carpeta de Drive del cliente, sin dedupe automático de VIN al importar. |
| **Feed/DMS automático** (feature flag ✅) | **RESUELTO 2026-08-25/26.** Nuevo workflow n8n "BLM - Stock inicial y sync de feed (IA)" parsea CSV/feed, redacta descripciones con OpenAI cuando faltan, e importa con auto-aprobación vía `FEED_SYNC_API_KEY` (ya configurada en Vercel, antes existía vacía desde hacía 43 días). `dealers.feed_url` ahora sí se rellena desde la sala de configuración. Feature flag `feed_sync` subido a `operative` en Elite/Grupo. Verificado con datos reales (importación de 3 vehículos vía botón de admin real, sync programado verificado por lógica de elegibilidad con datos reales, no por el disparo real del cron de las 6:00). Pendiente: archivos sueltos (fotos sin datos estructurados) no se auto-importan — genera tarea manual, correcto por diseño (no hay visión artificial en el pipeline). **Corregido 2026-08-26:** los CSV no traen fotos (no hay columna en la plantilla) y el import los publicaba activos con 0 imágenes. Ahora `/api/vehicles/import` deja en `draft` cualquier vehículo importado sin al menos 1 foto real (no aparece en el catálogo público) y avisa al showroom: email automático (import por feed/admin, vía n8n+Resend) y aviso en pantalla en `/dashboard/importar` (import manual). Ver `agency/registro_decisiones.md` 2026-08-26. |
| **Asistente IA sin contexto real** (nuevo hallazgo, cerrado 2026-08-26) | El asistente conocía solo datos del vehículo y nombre/ciudad/WhatsApp del showroom — la financiación, horario y estilo de negociación que el cliente rellena en la sala de configuración nunca llegaban a la conversación. Conectado y verificado con una conversación real (preguntó por financiación y horario de sábados, respondió con los datos exactos configurados, no genéricos). |
| **Videollamada de bienvenida en el onboarding fundador** (pendiente futuro, no ahora) | **Decisión 2026-08-27, sin construir a propósito.** Hoy la visita y el onboarding se hacen en persona — no hace falta una videollamada mientras esto siga siendo así. Queda documentado para cuando se empiece a operar "oficialmente" (onboarding remoto, sin visita presencial): la llamada iría **justo después de completar la sala de configuración, antes de publicar el perfil** — motivo funcional real ("repasamos juntos el perfil antes de publicarlo", no solo cortesía), corrige en vivo cualquier cosa floja antes de salir a producción, y refuerza la imagen de exclusividad ("no publicamos nada sin repasarlo con vosotros"). Implementación futura: enlace para agendar en el email de "configuración recibida" (`WF-P3`, evento `setup_completed`), publicación del perfil al final de la llamada. |
| **Ventana exclusiva 24h a la carta** (feature flag ✅) | **Parcialmente resuelto 2026-08-27.** El filtro de 24h ya funcionaba solo (por fecha en la propia consulta, sin cron necesario). Decisión de H: en vez de email/Slack por solicitud (no escala — 100 solicitudes/día serían 100 emails), se construyó un **aviso visible en el propio panel**: la sidebar del dashboard (`components/dashboard/Sidebar.tsx` + `app/(dashboard)/layout.tsx`) muestra ahora un badge numérico junto a "A la carta" con el nº de solicitudes activas visibles para ese showroom (mismo cálculo Elite/Professional que ya usaba la página). Pendiente, según cómo respondan los showrooms: decidir si además hace falta un aviso proactivo (email/digest agrupado) — ver `registro_decisiones.md` 2026-08-27. |

---

## Variables de entorno — resumen estado

### n8n (EasyPanel) — todas configuradas ✅
```
WEBHOOK_URL, DB_TYPE, DB_POSTGRESDB_*, OPENAI_API_KEY, MAIL_FROM,
SUPABASE_URL, SUPABASE_SERVICE_KEY, MARKET_URL, ADMIN_EMAIL,
N8N_WEBHOOK_DEALER_SIGNUP_SECRET, FIRECRAWL_API_KEY,
ASSISTANT_WEBHOOK_SECRET, ASSISTANT_RESULT_SECRET
```
**Pendientes en n8n:** ninguna · ✅ `SLACK_WEBHOOK_URL` ya fijado (2026-06-26) — ver punto 6 (durabilidad: re-fijar si se hace Deploy de n8n en EasyPanel)

### Vercel — configuradas ✅
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
SUPABASE_ACCESS_TOKEN, NEXT_PUBLIC_APP_URL (=https://blacklabelmarket.es),
N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET, N8N_WEBHOOK_EVENTS,
N8N_WEBHOOK_DEALER_SIGNUP, N8N_WEBHOOK_DEALER_SIGNUP_SECRET,
N8N_WEBHOOK_DEALER_APPROVED, N8N_WEBHOOK_DEALER_REJECTED, N8N_WEBHOOK_DEALER_PENDING_INFO,
ASSISTANT_WEBHOOK_SECRET, ASSISTANT_RESULT_SECRET, APPOINTMENT_RESULT_SECRET,
CRON_SECRET, HOT_LEAD_ALERT_SECRET, IMPORT_API_KEY,
CUSTOM_REQUESTS_INTERNAL_TOKEN, CUSTOM_REQUESTS_RATE_LIMIT_SALT,
N8N_MCP_URL, N8N_MCP_AUTHORIZATION
```
**Pendientes en Vercel (necesitan valor real):**
```
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ESSENTIAL, STRIPE_PRICE_PROFESSIONAL, STRIPE_PRICE_ELITE
```
(STRIPE_* tienen placeholders — se activan en Fase B)
~~R2_*~~ — **no aplica**: la subida de imágenes usa Supabase Storage, no Cloudflare R2.

---

## Docs del repo que siguen siendo válidos
- `docs/configuracion-email-smtp.md` — guía paso a paso para configurar SMTP en Supabase
- `docs/planes-suscripcion-definitivos.md` — definición definitiva de planes y add-ons
- `docs/seo-geo-backlog.md` + `seo-geo-backlog.csv` — backlog SEO/GEO (independiente)
- `docs/guia-copy-black-label.md` — guía de tono y copy de la marca
- `docs/legal-pending-data.md` — investigación legal del alta de profesionales (clickwrap, DSA art. 30, RGPD responsable/encargado) + datos legales pendientes de rellenar. Borrador para revisión de abogado (extendido 2026-07-20)
- `docs/agente-cita-fase-A-google-calendar.md` — diseño de la Fase A de Google Calendar, ya construida (ver tabla Fase C arriba)
- `docs/ciclo-vida-trial-verificacion.md` — checklist de verificación del ciclo de vida del trial (banner + drip WF)
- `docs/auditoria-total-2026-07/` — 13 documentos de la auditoría total (seguridad, código, API, rendimiento, UX/accesibilidad, SEO/GEO, funcional por rol, E2E autenticado) + veredicto consolidado
- `docs/admin-dashboard-validation-report.md`, `docs/qa-final-report.md`, `docs/repair-migration-procedure.md` — reportes puntuales de validación/QA, no bloqueantes
- `docs/verificacion-tiers-2026-07-28.md` — verificación de los 3 tiers (Codex, 2026-07-28): límites de vehículos/paneles/CSV/analítica/boosts confirmados correctos; 4 hallazgos (F-D-01/02/04 corregidos y reverificados 2026-07-29, F-D-03 abierto a propósito)
