# Black Label Market — PENDIENTES
> Documento único y canónico. Última actualización: **2026-07-21** (auditoría contra código y migraciones en disco — correcciones marcadas inline con fecha).
> Elimina y sustituye: `pendientes-configuracion-externa.md`, `deployment-checklist.md`, `n8n-setup.md`, `backlog-alertas-y-vehiculos-a-la-carta.md`, `backlog-marketplace.md`.

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
- [ ] **B1** — Header con **gradiente marrón** que rompe la identidad "negro premium" → gradiente negro + acento dorado. `Header.tsx:125-129`
- [ ] **B3** — Tablas de admin/dashboard rotas en móvil (8 col con scroll) → patrón card apilada. `admin/dealers/page.tsx`
- [ ] **B2** — Hero con 3 CTAs dorados compitiendo → 1 primario + secundarios. `app/(public)/page.tsx:112-129`

### 🟢 Sprint 2 — Pulido premium + SEO
- [ ] **BUG-bajos** — orden de membresía owner>admin (no `created_at`); `DELETE` de miembro borra auth global; TOCTOU en `maxUsers`; consumo de crédito no atómico.
- [ ] **A4-A7** — Labels/errores accesibles en formularios; foco visible en galería; radios con check no-cromático.
- [ ] **A8-A12** — `aria-label` en iconos header, `aria-expanded` hamburguesa, jerarquía h1→h3, `prefers-reduced-motion`, placeholder de imagen legible.
- [x] Unificar los 3 dorados (`#C6A64B`/`#C9A84C`/`#BFA14A`) — resuelto: solo `#C6A64B` existe en el código hoy (verificado 2026-07-21, sin rastro de los otros dos).
- [ ] **B4-B11** (resto) — Tipografía de cuerpo más grande; autoguardado wizard publicar; kanban usable en móvil; tokens de borde; loading/skeletons; "precio a consultar" con jerarquía; breadcrumb legible; unificar `ContactForm`/`QualifiedLeadForm`.
- [ ] **SEO-3/4/5/6** — `mileageFromOdometer` con guarda de null; OG de fichas con `url`+dimensiones; respuesta directa citable (GEO) + `FAQPage` en landings de categoría/marca.
- [ ] **SEO-7/8/9** — `priority={activeIndex===0}` en galería; breadcrumb con nivel categoría + marca→`/marcas/[slug]`; silo horizontal entre categorías.
- [ ] **SEO-10/11/12** — fecha visible derivada de `dateModified`; título de dealer con ciudad; enlaces al split `/marcas/[brand]/coches|motos`.
- [ ] **SEC-9/10/11** — Cabeceras de seguridad (CSP/HSTS/X-Frame-Options) en `next.config.js`; validar/rate-limit `/api/track`; no devolver errores crudos de PostgREST.
- [ ] **SEO-backlog** — cerrar en `seo-geo-backlog.md` P01, P02, P03, P04, O2-07/P07 (ya implementadas, marcadas pendientes por error).

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
- [ ] **Revisión legal** con asesor RGPD/LSSI antes de publicar

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

### Resto Fase B

| Tarea | Estado |
|---|---|
| Página `/precios` actualizada con precios reales (Essential/Professional/Elite) | 🔴 |
| Integración checkout Stripe en el flujo de suscripción | 🔴 |
| Plan Grupo: cerrar definición + construir en código (derivado de Elite) | 🔴 |
| Banner en dashboard dealer: "Trial activo hasta [fecha]" | ✅ HECHO (2026-07-14) — migraciones 067/068/069, workflow n8n `BLM - 8. Trial drip y conversión`. Detalle y checklist de verificación en `docs/ciclo-vida-trial-verificacion.md` |
| Dealers `status='trial'` visibles en perfil/listado/vehículos (RLS) — antes solo se veían al pasar a `active` (primer vehículo), dejando al fundador sin nada que enseñar durante todo el onboarding | ✅ HECHO (2026-07-14) — migración `067_trial_dealers_public_visibility.sql`. De paso se cerró un hueco real: un dealer `suspended` seguía teniendo sus vehículos públicamente visibles (RLS nunca comprobaba el dealer) |
| WF drip trial: emails días 3/10/21/28 | ✅ HECHO y probado E2E las 4 etapas (2026-07-14) — `BLM - 8. Trial drip y conversión`, n8n |
| WF conversión: email día ~28 con resumen rendimiento + CTA a elegir plan | ✅ HECHO — misma etapa 4 del workflow anterior, con datos reales vía RPC `trial_dealer_stats` |

---

## FASE C — Features Elite avanzadas (cuando haya base instalada)

Las tablas y endpoints ya están construidos. Solo falta conectar con servicios externos y construir los workflows n8n.

| Feature | Qué falta |
|---|---|
| **Reserva de citas** (tablas `appointments` ✅) | Fase B (horario manual) operativa. Fase A (Google Calendar OAuth real) **confirmada código-completo 2026-07-21**: cifrado de tokens, freebusy, creación de eventos con Meet, UI de conectar en `CitasConfig.tsx`, `computeSlots` ya con solapamiento de rangos. Solo falta que el dueño del producto cree el proyecto Google Cloud + OAuth client (`GOOGLE_OAUTH_CLIENT_ID/SECRET/GOOGLE_TOKEN_ENCRYPTION_KEY/GOOGLE_OAUTH_STATE_SECRET`, ninguna configurada hoy) y la verificación manual con un dealer piloto antes de subir `calendar_integration` a operative. Detalle en `docs/agente-cita-fase-A-google-calendar.md` |
| **Lead scoring** (campos `lead_score` en `leads` ✅) | **Confirmado 2026-07-21: solo la mitad construida.** `app/api/webhooks/assistant-result/route.ts` ya recibe `qualification.score` y rellena `lead_score`/`score_reason`/etc., pero `n8n-workflows/wf7-ai-assistant.json` no tiene ningún nodo de scoring ni llama a esa ruta — falta el prompt de scoring + el workflow n8n que lo dispare. |
| **Feed/DMS automático** (feature flag ✅) | **Confirmado 2026-07-21: solo columna y flag.** `dealers.feed_url`/`feed_last_synced_at` (migración 065) no los lee ni escribe ningún archivo de código, y no hay workflow n8n que mencione "feed". Falta el conector real y el job recurrente. |
| **Ventana exclusiva 24h a la carta** (feature flag ✅) | Matcher/temporizador 24h + aviso automático al showroom |

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
