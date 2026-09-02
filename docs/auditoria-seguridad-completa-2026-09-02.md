# Auditoría completa de seguridad y configuración — 2026-09-02

> Encargo de H: auditoría completa del código del market, seguridad y configuración, con Codex Sol a máximo
> esfuerzo, para tener confianza real antes de escalar. Sustituye como referencia de seguridad más reciente a
> `docs/auditoria-completa-2026-07.md` (julio 2026) — no la elimina, esa sigue teniendo el detalle de Sprint
> 0-2 ya cerrados; esta es la pasada siguiente, más profunda, con foco en RLS/RPC/SSRF/XSS que la de julio no
> cubrió con este nivel de detalle.

## Metodología

1. Codex (`gpt-5.6-sol`, sandbox `read-only`, esfuerzo de razonamiento alto) auditó el repo completo: todas
   las rutas de `app/api/**`, RLS y funciones `SECURITY DEFINER` de las ~100 migraciones de
   `supabase/migrations/`, `next.config.js`, middleware, dependencias, manejo de secretos y errores.
2. Claude verificó de forma independiente contra el código real los hallazgos más graves antes de darlos por
   buenos (disciplina ya vigente en este proyecto: no aceptar un hallazgo de auditoría sin contrastarlo). Dos
   correcciones materiales al informe original de Codex, explicadas abajo.
3. Una ronda de contraste: Claude señaló las dos correcciones, Codex las aceptó y entregó veredicto y lista
   de prioridad revisados.

**Alcance de verificación de Claude — para que quede claro qué está doblemente comprobado y qué no:**
verificados directamente contra el código por Claude: A1 (versión de Next.js + config de imágenes), A2 (XSS
JSON-LD), A3 (mecanismo de RLS de columnas), SEC-4 (policy de leads nunca revocada), y el falso positivo de
`increment_vehicle_views`. El resto de hallazgos (P0.3-P0.6, todo P1 y P2) proceden de la lectura de Codex,
con referencias `archivo:línea` concretas, pero sin una segunda lectura línea a línea de Claude — mismo nivel
de confianza que cualquier auditoría de Codex ya usada en este proyecto, ni más ni menos.

## Aplicación de los fixes — 2026-09-02 (misma sesión)

H autorizó aplicar los 7 P0. Estado real tras aplicarlos, verificado con `tsc --noEmit`, `next lint`
y `next build` completos (limpios los tres) — **nada de esto se ha desplegado a producción todavía**:
migraciones nuevas en `supabase/migrations/` sin aplicar (`supabase db push` pendiente) y código sin
`vercel --prod --yes`. Deploy y aplicación de migraciones quedan como paso explícito siguiente, no
incluido en este "aplica" — son las acciones de mayor blast-radius (RLS, webhooks, producción real).

- **P0.1 (XSS JSON-LD) — ✅ hecho.** Componente único `components/seo/JsonLd.tsx` +
  `lib/json-ld.ts` (escapa `<`, U+2028, U+2029). Sweep mecánico verificado en los 40 archivos que
  usaban el patrón vulnerable — 0 residuos. Pendiente, no bloqueante: quitar `unsafe-inline` de la
  CSP (P2, cambio de arquitectura mayor, requiere nonce por request).
- **P0.2 (columnas internas de `dealers`/`vehicles` expuestas) — ✅ hecho (sesión siguiente,
  2026-09-02).** Ver "Cierre de P0.2" más abajo — se hizo con el mapa completo de consumidores
  reales (Codex), migrando primero los 7 puntos que necesitaban `profile_id`/`subscription_plan`,
  reescribiendo los ~34 `select('*')` contra `dealers`/`vehicles` a listas explícitas (hallazgo
  crítico: `select=*` FALLA con error bajo column-level security, no se estrecha solo — verificado
  contra la documentación oficial de Supabase antes de aplicar nada), y solo entonces revocando el
  SELECT de tabla completo. Build, lint y tsc limpios contra el schema real antes del deploy.
- **P0.3 (SSRF) — ✅ hecho.** `lib/ssrf-guard.ts` (HTTPS + IP pública, sin loopback/RFC1918/
  link-local/metadata, redirects revalidados manualmente, límite de tamaño en streaming) aplicado a
  la importación de imágenes (`vehicles/import/route.ts`). El vector del asistente se cerró en el
  origen: migración `103_lock_assistant_config_service_only.sql` retira la policy que permitía al
  dealer escribir `webhook_url` (verificado por grep: ningún componente cliente leía/escribía esa
  tabla — nunca tuvo uso legítimo directo), más una validación de defensa en profundidad en
  `assistant/message/route.ts`.
- **P0.4 (mass assignment en vehículos) — ✅ hecho.** `lib/vehicle-write.ts` pasa de blacklist a
  allowlist real, construida desde los campos que envía de verdad el único formulario real
  (`dashboard/publicar/page.tsx`). Reabre y cierra SEC-3.
- **P0.5 (Stripe webhook) — 🟡 parcial, a propósito.** Ver nota abajo — no se reescribió todo el
  manejador a transacciones atómicas (fuera de alcance seguro para esta sesión), pero se corrigió el
  bug concreto más grave: un fallo real ya no se traga con 200 — responde 500 para que Stripe
  reintente — y las dos escrituras que activan el servicio de verdad (`subscriptions` upsert,
  sync de `dealers`) ahora comprueban el error y lanzan si fallan.
- **P0.6 (onboarding) — ✅ hecho.** Bucket privado nuevo (`onboarding-private`, migración 104) para
  `document`/`stock_csv`/`stock_bulk` — antes iban al bucket público sin expiración. Se sirven con
  signed URL de 7 días en vez de `getPublicUrl()`. `logo`/`cover`/`gallery` siguen en el bucket
  público (correcto, son datos públicos del perfil). El webhook a n8n de finalización de onboarding
  ahora firma HMAC-SHA256 + timestamp (mismo esquema que el resto de webhooks salientes del
  proyecto) y falla cerrado sin URL/secreto en vez de caer a una URL hardcodeada — **requiere
  configurar `N8N_WEBHOOK_FUNDADOR_ONBOARDING` y `N8N_WEBHOOK_FUNDADOR_ONBOARDING_SECRET` en Vercel
  antes de desplegar**, o el último paso del onboarding de un fundador real se rompe.
- **P0.7 (leads INSERT anónimo) — ✅ hecho.** Migración `102_revoke_anon_leads_insert.sql`.
  Verificado que no existe ningún INSERT cliente/anónimo real a `leads` en todo el código — el único
  camino real (`/api/leads`) usa el service role, no se ve afectado.

### Cierre de P0.2 (2026-09-02, sesión siguiente)

Se abordó en una sesión dedicada, en el orden seguro planteado inicialmente:

1. **Mapa completo de consumidores reales (Codex, solo lectura)**: cada uso de `createClient()`
   (dashboard/cuenta) y `createPublicClient()` (páginas públicas) contra `dealers`/`vehicles`,
   columna por columna, distinguiendo lo que la query pide de lo que el componente consume de
   verdad. Resultado: **ningún consumidor público necesita más columnas que otro** — el propio
   dueño gestiona su perfil completo por rutas service-role, no por lectura directa ampliada.
2. **Migrados los 7 puntos que dependían de `profile_id` o `subscription_plan` públicos**:
   `dashboard/perfil/page.tsx` → nueva ruta `GET /api/me/profile` (service role);
   `Header.tsx`/`middleware.ts` → nueva RPC `get_own_dealer_summary()` (`SECURITY DEFINER`,
   resuelve `auth.uid()` internamente, nunca expone `profile_id`); `inventario/actions.ts` y
   `api/gallery/route.ts` (×3) → `getDealerAccess()` con service role (mejora colateral: ahora
   reconocen también a miembros del equipo, no solo al dueño directo — con el permiso correcto
   revalidado, `canEditInventory`/`canEditProfile`); `resolveContactMode` → recibe `dealer_id` en
   vez de `dealer.profile_id`, con `getOrganizationIdForDealer()` nueva; ranking público por
   `subscription_plan` (coches/motos/dealers listados, `/api/featured-dealers`) → sustituido por
   `is_featured` (pierde el desempate professional > essential dentro de una misma página; el
   caso elite, que es is_featured=true, sigue funcionando igual).
3. **Hallazgo crítico verificado antes de tocar nada**: `select=*` contra una tabla con
   column-level security **falla con error**, no se estrecha a las columnas permitidas —
   confirmado contra la documentación oficial de Supabase (no es el comportamiento que se había
   asumido inicialmente). Esto obligó a reescribir los ~34 `select('*', ...)`/`select('*')` reales
   contra `dealers`/`vehicles` en páginas públicas a listas explícitas
   (`lib/public-columns.ts`: `VEHICLE_PUBLIC_COLUMNS`, `DEALER_PUBLIC_COLUMNS`, coinciden
   exactamente con los `GRANT` de la migración 107) — `brands`, `models` y `search_alerts` no son
   tablas restringidas, sus `select('*')` se dejaron tal cual.
4. **Hueco adicional encontrado de paso**: la policy pública de `dealer_gallery_images` no exigía
   `dealers.profile_status='published'` — un dealer en trial/active pero con perfil aún no
   publicado tenía su galería consultable igual (migración 105).
5. **Migración final (107)**: `REVOKE SELECT` de tabla completa + `GRANT SELECT (columnas)` para
   `anon`/`authenticated` en `dealers`, `vehicles` y `dealer_gallery_images`. Las escrituras
   (INSERT/UPDATE) no se tocan — siguen protegidas por RLS como antes, que evalúa `profile_id`
   internamente sin necesitar que el rol tenga SELECT sobre esa columna.

**Verificado**: `tsc --noEmit`, `next lint` y `next build` completos limpios — el build ejecuta de
verdad las ~90 páginas SSG/ISR contra el schema real de producción (con los grants todavía sin
restringir en el momento del build), confirmando que las columnas explícitas elegidas son
suficientes para renderizar cada página. Revisión final dirigida: `VehicleDetailContent.tsx`,
`DealerCard.tsx`, `DealerInlineCard.tsx` y `VehicleCard.tsx` no referencian ninguna columna
excluida. **No verificado en vivo contra los grants ya restringidos** (requeriría desplegar
primero) — el build/lint/tsc es la verificación disponible antes del deploy.

#### Incidente real tras el deploy (mismo día, corregido en la propia verificación post-deploy)

Al hacer el smoke-check en vivo tras desplegar, **las fichas de vehículo dejaron de cargar**
(`notFound()`, ficha genérica en vez del vehículo real). Diagnosticado con `curl` directo contra la
API REST de Supabase con la anon key: `permission denied for table dealers` (42501).

**Causa real**: la migración 107 revocó el `SELECT` de tabla completa sobre `dealers`, pero **13
policies RLS de otras 9 tablas** (`vehicles`, `leads`, `analytics_events`,
`dealer_gallery_images`, `lead_events`, `appointments`, `analytics_daily`,
`showroom_calendar_connections`, `lead_alerts`, `lead_handoffs`) hacen internamente
`EXISTS(SELECT 1 FROM dealers d WHERE d.id = X.dealer_id AND d.profile_id = auth.uid())` para
comprobar "¿es el dueño?". Postgres evalúa **todas** las policies SELECT permisivas de una tabla
(se combinan con OR) en cada consulta, así que necesita poder evaluar esa expresión aunque la rama
del dueño vaya a dar `false` para un anónimo — y sin privilegio `SELECT` sobre `profile_id`, la
consulta **entera** falla, no solo esa rama. No se detectó en el build/lint/tsc previo porque esos
no ejecutan contra los grants ya restringidos (solo existen tras aplicar la migración).

**Fix (migración 108, misma sesión)**: función `is_own_dealer(dealer_id)` `SECURITY DEFINER` que
resuelve la comprobación con los privilegios del dueño de la función, bypassando el grant del rol
que llama. Sustituida la subconsulta directa en las 13 policies (barrido completo del patrón en
todo el proyecto vía grep, no solo `vehicles`, que fue la primera detectada). Verificado arreglado
con `curl` directo a la API real y con smoke-check completo del sitio en vivo (home, catálogo,
categorías, ficha de vehículo, ficha de dealer, buscador, comparador, favoritos) — todo con
contenido real, no vacío ni en estado de error. Redeploy adicional necesario para forzar la
regeneración de las páginas ISR que habían quedado cacheadas en el estado roto (`revalidate = 300`
en la mayoría de páginas públicas).

**Ventana de exposición**: entre el deploy de la migración 107 y la aplicación de la 108 (~10-15
minutos), el catálogo público habría servido fichas de vehículo como "no encontrado" a cualquier
visitante real. Detectado y corregido en la propia verificación post-deploy de esta sesión, no
reportado por un usuario externo. **Lección para futuras migraciones de RLS/permisos en este
proyecto**: revocar columnas usadas por una tabla no basta con auditar los consumidores de ESA
tabla — hay que grepear el proyecto entero por referencias cruzadas a esa columna desde políticas
de OTRAS tablas antes de aplicar el REVOKE, no después.

---

## Veredicto ejecutivo (revisado tras contraste)

**No activar Stripe live ni ampliar la incorporación de datos de terceros reales hasta cerrar los 7 puntos
P0.** No es una alarma de "servidor comprometible ahora mismo" (la lectura inicial de Codex sobre Next.js/AVIF
era más grave de lo que aplica a este despliegue concreto — ver corrección 1 abajo) — es una lista concreta y
acotada de vías reales de XSS, fuga de datos internos, SSRF y falta de fiabilidad en Stripe, verificables una
por una y cerrables sin rehacer arquitectura.

## Correcciones al informe original de Codex

**1. Next.js 14.2.25 + AVIF — bajado de "crítico/NO-GO" a "hardening recomendado, no bloqueante en este
despliegue".** `package.json` fija `next@14.2.25` y `next.config.js:23-27` habilita `image/avif` con
`remotePatterns` incluyendo el wildcard `*.supabase.co` — eso es exacto. Existe una vulnerabilidad real y
crítica (CVE-2026-75604 / GHSA-2xp9-vwfh-vxw4, RCE no autenticado vía optimización de AVIF, parcheada por
Vercel en agosto de 2026) que afecta a las versiones de Next.js instaladas aquí. **Pero el market se
despliega en Vercel** (`vercel --prod --yes`, confirmado en `CLAUDE.md`), y el changelog oficial de Vercel
declara explícitamente que las aplicaciones alojadas en su plataforma gestionada están protegidas a nivel de
infraestructura (Vercel desactivó la optimización AVIF en su servicio de Image Optimization) **sin necesidad
de actualizar código ni redesplegar**. La variante de path traversal del mismo aviso es específica de
filesystem Windows y no aplica a la infraestructura Linux de Vercel. Sigue siendo buena práctica actualizar
Next.js (no depender indefinidamente de una mitigación de la plataforma de hosting, y por si algún día se
migra fuera de Vercel) y sustituir el wildcard `*.supabase.co` por el hostname exacto del proyecto propio —
pero no es una emergencia de RCE activa hoy. Fuentes: [advisory de Next.js](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4), [changelog de Vercel](https://vercel.com/changelog/nextjs-august-2026-security-release).

**2. `increment_vehicle_views` — retirado como hallazgo de seguridad, era un falso positivo.** Codex lo
marcó como RPC vulnerable por conceder `EXECUTE` a `anon`/`authenticated`. Es diseño explícito, ya auditado y
aceptado en este mismo proyecto: la migración `097_fix_remaining_rpc_grants.sql:22-23` lo dice literalmente
("SÍ es anon-callable por diseño explícito... no se toca"), y `061_increment_vehicle_views_rpc.sql` explica
el motivo — antes era un `UPDATE` fire-and-forget con condición de carrera en cada render, se convirtió en
RPC atómico de alcance mínimo (`SET views = views + 1 WHERE id = p_id AND status = 'active'`, una sola
columna, sin retorno) específicamente para poder cachear la ficha con ISR. Como mucho, permite inflar de
forma artificial el contador de vistas de un vehículo activo — molestia de métrica, no vulnerabilidad.

---

## P0 — Bloqueantes reales (cerrar antes de Stripe live / más datos de terceros)

### P0.1 — XSS persistente vía JSON-LD sin escapar — Alto — **verificado por Claude**

`dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}` no neutraliza `</script>`. Presente en
decenas de páginas públicas con campos controlados por dealers (descripción, marca, modelo, nombre/
dirección/email del dealer):
- `app/(public)/coches/[slug]/page.tsx:188-189` (verificado línea a línea por Claude)
- `app/(public)/motos/[slug]/page.tsx:122,190`
- `app/(public)/dealers/[slug]/page.tsx:213,236`
- `app/(public)/coches/page.tsx:182,198` y decenas más de JSON-LD de categorías/marcas/guías.

**Escenario:** un dealer introduce en su descripción `</script><script>fetch('/api/admin/config',
{credentials:'include'})...</script>`. Al visitar la ficha, el navegador cierra el script JSON-LD y ejecuta
el segundo. La CSP actual permite `script-src 'unsafe-inline'` (`next.config.js:55`), así que no lo bloquea.
Si un admin visita esa ficha autenticado, el código corre con su sesión.

**Fix:** un único componente `JsonLd` que escape `<`, `>`, `&`, ` `, ` ` antes de serializar (o una
librería dedicada), migrar todos los usos, tests con `</script><script>` como input, y retirar
`unsafe-inline` de `script-src` a favor de nonce/hash por request.

### P0.2 — Columnas internas de `dealers`/`vehicles` expuestas por completo vía REST — Alto — **verificado por Claude**

RLS de Postgres filtra **filas**, no columnas. La policy pública (`067_trial_dealers_public_visibility.sql`)
permite `SELECT` de dealers `trial`/`active` y de vehículos activos de esos dealers — pero no hay vista
intermedia ni `REVOKE` de columnas específicas sobre las tablas base, así que `GET
/rest/v1/dealers?select=*` con la anon key pública devuelve también `profile_id`, `stripe_customer_id`,
`stripe_subscription_id`, `admin_notes`, y en vehículos VIN, `admin_notes`, `rejection_reason`, contadores
internos. Definiciones base: `001_initial.sql:28` (dealers), `001_initial.sql:86` (vehicles).

**Fix:** no exponer las tablas base a `anon` (`REVOKE SELECT ... FROM anon`); crear vistas públicas con
columnas explícitas (`security_invoker`) o RPC de lectura acotada; no usar `select('*')` en superficies
públicas del propio código tampoco.

**Verificación de producción pendiente:** confirmar con una consulta REST anon real qué columnas devuelve
hoy — ver bloque de verificaciones abajo.

### P0.3 — SSRF: importación de imágenes remotas y `webhook_url` del asistente controlable por el dealer — Alto

- **Importación:** `app/api/vehicles/import/route.ts:117-131` acepta una URL de imagen y hace `fetch()` sin
  validar protocolo, hostname, DNS ni redirects, y lee el `arrayBuffer()` completo antes de comprobar el
  límite de 10 MB. Un dealer (o quien robe una API key de importación) puede apuntar a `127.0.0.1`,
  `169.254.169.254` (metadata de nube) o una URL que redirija a IP privada.
- **Asistente:** la policy `assistant_config_dealer_all` (`032_lead_qualification.sql:94,110`) permite al
  dealer escribir directamente `webhook_url`/`enabled` de su fila de configuración. `app/api/assistant/
  message/route.ts:34,49,58` lee esos valores con service role, hace `fetch(cfg.webhook_url)` y devuelve la
  respuesta al navegador — un dealer con acceso a PostgREST puede convertir el endpoint público del
  asistente en un proxy hacia cualquier destino interno.

**Fix:** en importación — solo HTTPS, resolver DNS y bloquear loopback/RFC1918/link-local/metadata,
revalidar redirects, leer en streaming con abort al superar el límite, allowlist de orígenes. En el
asistente — eliminar la policy que permite al dealer escribir `webhook_url`, dejar la tabla service-only,
exponer solo los campos editables que corresponden vía API con allowlist.

### P0.4 — Mass assignment en escritura de vehículos — Alto (reabre SEC-3, dado por cerrado en `PENDIENTES.md`)

El "sanitizador" de `lib/vehicle-write.ts:20,35-38` es una **blacklist** (copia todo el payload y borra solo
algunos campos), no una allowlist — cualquier columna nueva añadida en el futuro queda expuesta por
defecto. Además, si `status` no es exactamente `"draft"` (incluso si falta), se fuerza a `"active"` — un
`PATCH` parcial que omita `status` publica un borrador sin querer. Rutas: `app/api/vehicles/route.ts:20-32`
(POST), `app/api/vehicles/[id]/route.ts:51-61` (PATCH).

**Fix:** esquema Zod `.strict()` con allowlist explícita de columnas editables por el dealer, tipos/rangos
validados, y todos los campos operativos (contadores, fechas de publicación/caducidad, badges, notas)
derivados server-side, nunca aceptados del payload.

### P0.5 — Webhook de Stripe: puede dejar estados financieros parciales y responde 200 tras fallo — Alto

`app/api/stripe/webhooks/route.ts`: inserta el id de evento antes de procesarlo (línea 78) y si esa
inserción falla por algo distinto de duplicado, continúa igual (84-90); si el handler lanza excepción,
responde HTTP 200 (118-124) — Stripe no reintenta un evento fallido; varias escrituras a Supabase no
comprueban `error` (196-253); la provisión de créditos/boost no es una única transacción (148-181).

**Escenario:** Stripe confirma un pago, se actualiza `subscriptions` pero falla el update de `dealers` o la
provisión del add-on — como Supabase devuelve `{error}` sin lanzar, el evento queda marcado como procesado y
Stripe no reintenta. El cliente pagó, el servicio queda a medias.

**Fix:** procesar cada evento en una transacción/RPC, comprobar y lanzar ante cualquier `error`, ledger con
estados `processing/succeeded/failed`, responder 5xx ante fallos transitorios para forzar reintento de
Stripe, idempotencia por `event.id`/objeto Stripe. **No pasar Stripe a live sin esto.**

### P0.6 — Onboarding: documentos en bucket público + recovery link enviado sin firma a n8n — Alto

`app/api/onboarding/[token]/upload/route.ts`: todos los tipos de archivo de onboarding, incluidos
`document` y `stock_csv`, se guardan en el bucket `vehicle-images` (línea 5, paths 116-125) y se devuelve
`getPublicUrl()` (línea 131). Al completar el onboarding, `app/api/onboarding/[token]/complete/route.ts`
genera un recovery link de Supabase (línea 194) y lo envía junto con PII a un webhook de n8n **sin
autenticación ni firma** (helper 51-60), con una URL hardcodeada como fallback si falta la variable de
entorno (205-206).

**Fix:** bucket privado separado para onboarding con signed URLs de minutos; no devolver `getPublicUrl()`
para documentos; no mandar el recovery link a n8n (usar el flujo de recovery gestionado de Supabase
directamente); HMAC con timestamp+event ID en el webhook de onboarding; eliminar el fallback hardcodeado.
**Verificación de producción pendiente:** si el bucket `vehicle-images` no es público, la fuga por URL no se
materializa hoy — pero el diseño es incorrecto igualmente y el recovery link sí se transmite sin protección.

### P0.7 — Inserción anónima directa de leads salta toda la validación — Alto — **verificado por Claude**

La migración inicial crea `CREATE POLICY "Anyone can create lead" ON leads FOR INSERT WITH CHECK (true)`
(`001_initial.sql:260`) y **ninguna migración posterior la elimina ni la revoca** (comprobado con grep en
las 12 migraciones que tocan `leads`) — aunque `app/api/leads/route.ts:78` ya valida la relación
dealer/vehículo desde julio. Con la anon key pública, un INSERT directo a `/rest/v1/leads` evita la
validación de la API, el rate limit, y permite elegir cualquier `dealer_id`/`vehicle_id` e insertar PII
falsa o masiva.

**Fix:** `DROP POLICY "Anyone can create lead" ON leads; REVOKE INSERT ON leads FROM anon, authenticated;` —
toda creación de lead pasa por el servidor o una RPC estrecha que valide relación y tamaños de campo.

---

## P1 — Cerrar antes de escalar (no bloqueante hoy, sí antes de crecer)

- **Credenciales y controles de tenant**: rotar y confirmar revocada la `service_role` histórica que consta
  en el historial de git (`PENDIENTES.md:190`); verificar en producción los grants RPC realmente desplegados
  (ver consultas SQL abajo); añadir timestamp+event-id anti-replay a los webhooks de n8n
  (`appointment-result`, `hot-lead-alert`, `assistant-result` — HMAC correcto pero sin protección de
  replay); verificar que `lead_id`/`dealer_id`/`vehicle_id` pertenecen a la misma relación antes de escribir
  (hoy `app/api/assistant/book/route.ts:94-98` busca el vehículo solo por `id`, sin comprobar que pertenezca
  al `dealerId` de la reserva); cerrar la carrera de doble uso del token de onboarding (se valida al
  principio pero no se marca usado hasta el final del proceso — dos peticiones concurrentes pasan ambas);
  sustituir la devolución de contraseñas temporales en JSON (`app/api/team/members/route.ts:154-155`,
  mostrada en `TeamManager.tsx:92`) por invitación de un solo uso.
- **Claves de importación globales**: `IMPORT_API_KEY`/`FEED_SYNC_API_KEY` pueden seleccionar cualquier
  dealer por `dealer_slug` (`app/api/vehicles/import/route.ts:334-341,364-371`) pese a existir ya claves con
  scope por dealer que sí verifican el slug — retirar las globales, usar solo claves por dealer con
  expiración/revocación/cuota.
- **Rate limiting no atómico y con fail-open**: `lib/rate-limit.ts` confía en el primer valor de
  `X-Forwarded-For` (línea 5), no limita si no hay IP (línea 77), cuenta y luego inserta sin atomicidad
  (79-86), y falla abierto si el contador da error (línea 88). Importación sin máximo de filas por dealer;
  `/buscar` sigue insertando texto crudo en `.or()` de PostgREST sin el saneo ya aplicado en
  `lib/vehicle-query.ts:88` (`app/(public)/buscar/page.tsx:18-26`) — riesgo de inyección de filtro/DoS, no
  fuga de drafts confirmada (los filtros de estado siguen aplicándose como AND).
- **`subscriptions` legible por cualquier miembro de la organización** sin restricción de rol
  (`025_subscriptions_v2.sql:51-56`) — incluye IDs de Stripe y metadata de facturación; restringir a
  `owner`/`admin`/`group_admin` o exponer una vista sin esos campos a roles no financieros.
- **Mensajes de error crudos de Postgres/Storage** devueltos al cliente en varios endpoints (`admin/config`,
  crons de limpieza/expiración, upload, vehicles) — respuesta genérica + `error_id`, detalle solo en logs.

## P2 — Hardening recomendado (no bloqueante hoy bajo Vercel)

- Actualizar Next.js (mínimo `>=15.5.24`/`>=16.3.3`) y sustituir el wildcard `*.supabase.co` por el hostname
  exacto — no depender indefinidamente de la mitigación de infraestructura de Vercel.
- Retirar `unsafe-inline` de la CSP una vez cerrado P0.1 (nonce/hash por request).
- Cookies de Supabase: confirmar `secure: true` en producción real, evaluar si conviene una arquitectura
  auth server-only para `HttpOnly`; añadir `import 'server-only'` a `lib/supabase/server.ts`.
- `.env.local.example` incompleto — variables usadas en código y no documentadas (`APPOINTMENT_RESULT_SECRET`,
  `ASSISTANT_RESULT_SECRET`, `CRON_SECRET`, `FEED_SYNC_API_KEY`, `HOT_LEAD_ALERT_SECRET`,
  `NEWSLETTER_HASH_SALT`, `N8N_WEBHOOK_*`, `BREVO_API_KEY`, `NEXT_PUBLIC_SITE_INDEXABLE`,
  `STRIPE_PRICE_*` y otras — lista completa en el hilo de auditoría) y variables documentadas sin uso real
  (`EMAIL_FROM`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`).
- `X-Powered-By: Next.js` visible (falta `poweredByHeader: false`); script de seed con contraseña por
  defecto que además se imprime en consola (`scripts/seed-demo-dealer.mjs:28,1063`) — quitar el valor por
  defecto y no imprimir credenciales.

---

## Verificaciones imprescindibles contra producción real (no se pueden cerrar solo con el código)

Ejecutar en el SQL Editor de Supabase, proyecto de producción:

```sql
-- Grants reales de todas las funciones SECURITY DEFINER
SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args, p.prosecdef,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_exec,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_exec
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef
ORDER BY p.proname, args;

-- Policies y grants de tabla reales
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

SELECT grantee, table_name, privilege_type FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- Visibilidad del bucket de onboarding/imágenes
SELECT id, public FROM storage.buckets WHERE id IN ('vehicle-images');
```

Además: confirmar `Set-Cookie` real tras login/refresh en producción; confirmar que la `service_role`
histórica ya no funciona; revisar webhooks/workflows vivos de n8n (WF1 y clones antiguos de WF7, ya
señalados en `PENDIENTES.md` SEC-14); confirmar claves y eventos pendientes de Stripe test antes de
cualquier cambio a live.

## Lo que sí sigue cerrado de verdad (verificado contra el código, no solo contra el checklist)

SEC-1 (Server Actions/admin con `assertAdmin()`), SEC-2 (los 3 webhooks entrantes fail-closed con
`timingSafeEqual`), SEC-7 (magic bytes en las 3 rutas de subida), SEC-9 (cabeceras de seguridad cubren
también `/api` vía `source: '/:path*'`), y 10 de las 11 RPC `SECURITY DEFINER` no-trigger con revokes
correctos verificados en migraciones (la única excepción real, `increment_vehicle_views`, es diseño
intencional, no un hueco — ver corrección 2 arriba). IDOR revisado en las rutas autenticadas principales
(vehículos, leads, equipo, galería, boost checkout) sin hallazgo, salvo `assistant/book` (P1).
