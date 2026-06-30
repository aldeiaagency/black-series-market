# Black Label Market — PENDIENTES
> Documento único y canónico. Última actualización: **2026-06-26** (sesión 3).
> Elimina y sustituye: `pendientes-configuracion-externa.md`, `deployment-checklist.md`, `n8n-setup.md`, `backlog-alertas-y-vehiculos-a-la-carta.md`, `backlog-marketplace.md`.

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
- 📋 **QA lado comprador — ronda 2 (2026-06-30), hallazgos menores a pulir:** (a) **Comparador**: la barra flotante (localStorage) sigue sobre `/comparar` y su "Quitar" no actualiza la tabla (la tabla se pinta del `?ids=` de la URL) → desincronización confusa. (b) **/cuenta/favoritos**: "Quitar de guardados" persiste en BD pero la lista no refresca al instante (requiere recargar); badge "Alertas" mostró un "3" stale. (c) **/cuenta/alertas**: solo permite **eliminar**, no **pausar** (aunque `is_active` existe en BD). (d) **Buscador `/buscar`**: funciona por marca/modelo pero **NO indexa `version`/acabado ni `title`** → "Weissach"/"Pista"/"GT3"(en versión) dan 0 resultados; añadir esos campos a la búsqueda. (e) **Móvil (390px)**: ✅ sin overflow, hamburguesa y fichas correctas. (Comparador núcleo, favoritos, alertas, auth y buscador: funcionan.)
- ✅ **Asistente IA del comprador (WF7) REPARADO y verificado E2E (2026-06-30).** No funcionaba en prod por 3 bugs: (1) `NextResponse` de fallback declarado a nivel de módulo en `/api/assistant/{session,message}` → body agotado → 200 vacío → widget caía al form clásico [commit f3e083a]; (2) `/api/assistant/session` no enviaba `dealer_id` a nivel raíz → WF7 respondía 400 [commit c0a7724]; (3) nodo OpenAI de WF7 en `contentType: raw` → OpenAI no parseaba el body ("you must provide a model parameter") → pasado a modo JSON. Verificado chat E2E (apertura + turno con respuesta contextual). 🔴 **Gap:** `showroom_assistant_config` está VACÍA → ningún showroom real tiene el asistente activo (todas las fichas usan el form clásico); falta provisión por showroom Pro/Elite (fila con `enabled=true` + `webhook_url`=WF7). Sin paso de onboarding que la cree.
- ✅ Todas las variables de entorno de n8n configuradas (OPENAI, FIRECRAWL, SUPABASE, MAIL_FROM, SMTP Hostinger, etc.)
- ✅ Vercel: `N8N_WEBHOOK_DEALER_APPROVED/REJECTED/PENDING_INFO`, `ASSISTANT_WEBHOOK_SECRET/RESULT`, `NEXT_PUBLIC_APP_URL`
- ✅ Vercel: `N8N_WEBHOOK_URL` + `N8N_WEBHOOK_SECRET` configurados — el market emite eventos en tiempo real a WF5
- ✅ Flujo de alta WF1→WF4 conectado de extremo a extremo (solicitud → auditoría → aprobación/rechazo/más info)
- ✅ Panel admin `/admin/altas-showroom` rediseñado + detalle `/[id]` + sidebar de acciones
- ✅ Bug email duplicado en aprobación resuelto
- ✅ Dominio `blacklabelmarket.es` configurado en Vercel (apex canónico, www→apex)
- ✅ Deploy en producción en `blacklabelmarket.es`
- ✅ Cuenta Firecrawl: `aldeiatools@gmail.com` / `Joseleotorres3+` · API key en n8n
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
| Banner en dashboard dealer: "Trial activo hasta [fecha]" | 🔴 |
| Verificar que vehículos con `status: 'trial'` son visibles en el market (RLS) | 🟡 |
| WF drip trial: emails días 3/10/21/28 | 🔴 |
| WF conversión: email día ~28 con resumen rendimiento + CTA a elegir plan | 🔴 |

---

## FASE C — Features Elite avanzadas (cuando haya base instalada)

Las tablas y endpoints ya están construidos. Solo falta conectar con servicios externos y construir los workflows n8n.

| Feature | Qué falta |
|---|---|
| **Reserva de citas** (tablas `appointments` ✅) | Google Calendar OAuth + workflow n8n de propuesta/confirmación + emails |
| **Lead scoring** (campos `lead_score` en `leads` ✅) | Prompt de scoring + workflow n8n que puntúe y cree alertas |
| **Feed/DMS automático** (feature flag ✅) | Conector feed/DMS + job recurrente de sincronización |
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
- `docs/legal-pending-data.md` — datos legales pendientes de rellenar
