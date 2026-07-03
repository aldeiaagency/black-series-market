# 01 — Seguridad e infraestructura — Black Label Market

> Auditoría DESDE CERO contra el código y las migraciones reales (2026-07-03). No se apoya en
> auditorías previas. Realizada en el hilo principal (los subagentes agotaron cuota). Alcance
> verificado: RLS core (001) + policies añadidas/reescritas (019, 021, 030, 032), server actions de
> admin, `next.config.js`, triggers 040/044, escaneo de secretos. NO se modificó código.
>
> Modelo de amenaza: (a) comprador registrado con su JWT + la anon key pública, atacando PostgREST
> directamente; (b) dealer malicioso; (c) visitante anónimo; (d) clave filtrada.

## Resumen ejecutivo

El control de acceso del market descansa casi por completo en la **capa de aplicación** (rutas que
usan `createAdminClient()`/service-role, que **ignora RLS**). Pero la anon key y el JWT del usuario
son públicos (van en el navegador), así que **cualquiera puede llamar a la API REST de Supabase
saltándose la aplicación**. Y ahí las políticas RLS son permisivas: **un usuario puede auto-promoverse
a admin y un dealer puede auto-concederse plan Elite, verificación y destacados**, todo por REST
directo. Son escaladas de privilegio explotables hoy con una cuenta gratuita de comprador.

**Veredicto: NO apto para abrir a dealers reales sin corregir los 3 CRÍTICOS.** No es teoría: la
única barrera que falla es la que separa a un comprador de ser administrador.

Nota positiva (apuntes del operador ya cubiertos): **los source maps NO se exponen** en producción
(`productionBrowserSourceMaps` no está activado → default `false`); **SSL** es automático en Vercel
(apex + www); `serverActions.allowedOrigins` está configurado (mitiga CSRF cross-origin en actions).

## Hallazgos

| Sev | Ubicación | Descripción | Impacto | Fix |
|-----|-----------|-------------|---------|-----|
| **CRÍTICA** | `001_initial.sql:249` (policy "Users update own profile") | La política `UPDATE` sobre `profiles` es `USING (auth.uid() = id)` **sin `WITH CHECK` ni restricción de columnas**. La columna `role` (`buyer/dealer/admin`) es actualizable por el propio usuario. Ninguna migración posterior lo corrige (verificado). | **Escalada a admin.** Un comprador registrado hace `PATCH /rest/v1/profiles?id=eq.<su_id>` con `{"role":"admin"}` usando su JWT + anon key. El `AdminLayout` solo comprueba `profile.role==='admin'` → obtiene el panel de administración completo. Control total. | Quitar `role` (y `email`) del alcance del usuario: política `UPDATE ... WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()))`, o trigger `BEFORE UPDATE` que impida cambiar `role`, o mover `role` a una tabla separada solo-service-role. |
| **CRÍTICA** | `001_initial.sql:253` (policy "Dealers update own record") | `UPDATE` sobre `dealers` es `USING (auth.uid() = profile_id)` **sin restricción de columnas**. Campos sensibles editables por el dealer: `is_verified`, `is_featured`, `status`, `subscription_plan`, `vehicle_slots`, `subscription_end_at`, `stripe_*`. | **Auto-concesión de plan y confianza.** Un dealer hace `PATCH /rest/v1/dealers?id=eq.<suyo>` y se pone `subscription_plan='elite'`, `vehicle_slots=9999`, `is_verified=true`, `status='active'`. Rompe el plan-gating y la monetización sin pagar, y falsea la insignia de confianza que ven los compradores. | `WITH CHECK` que congele las columnas de plan/verificación/estado (comparándolas con la fila actual), o trigger que solo permita editar campos de perfil (nombre, descripción, contacto). Las columnas comerciales solo por service-role/webhook Stripe. |
| **ALTA** (corregido; ver nota) | `app/(admin)/admin/altas-showroom/actions.ts` + acciones inline en `vehiculos/page.tsx`, `vehiculos/[id]/page.tsx`, `solicitudes/page.tsx`, `dealers/[id]/page.tsx` | Las Server Actions de admin **no verifican rol admin** dentro de la propia action (operan con `createAdminClient()` service-role). **Mitigación existente:** `middleware.ts:64-75` YA gatea `/admin/*` por pathname, y los server actions POST-ean a la ruta de su página → el middleware los intercepta en el caso normal. **Riesgo residual:** Next.js documenta que las actions deben autorizarse por sí mismas (defense-in-depth); existe un bypass sofisticado posteando la action a una ruta no-`/admin` con su ID interno. No es "cualquier comprador con un clic". | Defense-in-depth: `await assertAdmin()` como primera línea de cada action de `app/(admin)/**`. **Estado: aplicado** en `actions.ts`; recomendado replicar en las 4 páginas con acciones inline (dealers plan/verificación son las más sensibles). |
| **CRÍTICA (a verificar)** | `scripts/*.mjs` (6 archivos: `fix-remaining-4`, `fix-double-corruption`, `fix-vehicle-encoding-final`, `diagnose-encoding`, `fix-vehicle-encoding-pass2`, `fix-vehicle-encoding`) | El escaneo detecta patrón de credencial (JWT `eyJ...`) embebido en scripts versionados. No he leído el valor (política de secretos). Si es la **service_role key**, es control total de la BD saltándose RLS, y está en el historial de git. | Filtración de clave con superpoderes en el repo (aunque privado). | Verificar (humano): si es service_role, **rotarla ya** en Supabase, retirarla de los scripts (leer de `process.env`), y añadir los scripts a `.gitignore` o purgar. Si es la anon key, riesgo bajo pero igualmente sacarla a env. |
| **ALTA** | `app/api/webhooks/{assistant-result,appointment-result,hot-lead-alert}/route.ts` | Guard HMAC `if (SECRET && !verify(...))`: si la env del secreto falta/está vacía, se **omite la verificación** y se aceptan escrituras anónimas (fail-open). | Sin el secreto configurado, cualquiera inyecta `leads`, `appointments` y `lead_alerts` para cualquier `dealer_id` (spam + emails/Slack a dealers reales). | Fail-closed: si falta el secreto → `503` y abortar. Verificar firma SIEMPRE. |
| **ALTA** | `001_initial.sql:257` + `040_...sql` + `044_...sql` | RLS de `vehicles` es `FOR ALL` para el dueño sin guardia de columnas. El trigger `040` solo limita el **número** de activos; `044` es un **backfill de datos** (UPDATE puntual), **no** un trigger que exija boost para `is_featured`. | Un dealer, por REST directo, publica `status='active'` (salta la moderación `pending_review`, solo topado por el conteo del plan) y se pone `is_featured=true`/`featured_until` lejano → **boost gratis y permanente**. Mismo efecto que el mass-assignment de la API, pero también por PostgREST. | Trigger `BEFORE INSERT/UPDATE` en `vehicles` que fuerce `status='pending_review'` en altas de dealer y que rechace `is_featured=true` sin un boost activo asociado. |
| **ALTA** | `001_initial.sql:248` (policy "Public profiles viewable" `USING (true)`) | Cualquiera con la anon key puede `GET /rest/v1/profiles?select=email,full_name,role` y **volcar el email, nombre y rol de todos los usuarios** (compradores, dealers, admins). | Fuga masiva de datos personales (RGPD) + enumeración de quién es admin (facilita el ataque CRÍTICO 1). | Restringir SELECT: exponer solo lo público de dealers vía la tabla `dealers`; `profiles` legible solo por el propio usuario (`auth.uid() = id`) y service-role. |
| **ALTA** | `001_initial.sql:260` (policy "Anyone can create lead") + `app/api/leads/route.ts` | `INSERT` en `leads` con `WITH CHECK (true)` y endpoint público sin rate limit ni validación de pertenencia `vehicle_id`↔`dealer_id`. | Spam de leads atribuibles a cualquier dealer + email-bombing a terceros vía `lead.created` (n8n). | Rate limit por IP/email; validar que el vehículo es del dealer; captcha en el form público. |
| **MEDIA** | `next.config.js` (todo el archivo) | **Sin cabeceras de seguridad**: no hay `headers()` → falta `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. | Exposición a clickjacking, sniffing MIME, fugas de referrer y ausencia de HSTS. | Añadir `async headers()` con el set estándar; CSP al menos en `report-only` al principio. |
| **MEDIA** | `dealer_reviews` (001:246, sin políticas) | RLS activado pero **sin ninguna policy** → deny-all salvo service-role. | La feature de reseñas queda inaccesible por cliente (o depende 100% del admin client sin control fino). Revisar si está roto o es intencional. | Definir políticas explícitas (lectura de aprobadas pública; escritura del comprador autenticado). |
| **MEDIA** | (heredado de capa API) `stripe/webhooks`, `vehicles/import`, `team/members` | Sin idempotencia real en webhook Stripe; `IMPORT_API_KEY` global sin scoping por dealer; contraseña temporal devuelta en el JSON de respuesta. | Duplicación de boosts; escritura cross-tenant si la key se filtra; credencial en tránsito/logs. | Ver fixes en `03-api.md` (idempotencia por `event.id`, keys por-dealer, invitación por email). |

## Conteo por severidad

| Severidad | Nº |
|-----------|----|
| CRÍTICA | 3 (uno a verificar: secretos en scripts) |
| ALTA | 5 |
| MEDIA | 3 |
| **Total** | **11** |

Nota de corrección (2026-07-03): el hallazgo de "server actions de admin sin rol" se rebajó de CRÍTICA a ALTA al verificar que `middleware.ts` ya gatea `/admin/*` (incluidos los POST de server actions). Los 3 CRÍTICOS reales son los que saltan la aplicación entera vía PostgREST: RLS de `profiles.role`, RLS de columnas de `dealers`, y (a verificar) el posible `service_role` en scripts.

## Mapa de RLS por tabla (lo verificado)

| Tabla | RLS | Lectura | Escritura | Veredicto |
|-------|-----|---------|-----------|-----------|
| `profiles` | ON | `USING(true)` — TODO público ⚠️ | UPDATE own **sin guard de columna** 🔴 (role editable) | CRÍTICO |
| `dealers` | ON | activo u own | UPDATE own **sin guard de columna** 🔴 (plan/verified/slots) | CRÍTICO |
| `vehicles` | ON | activo u own | FOR ALL own; trigger 040 limita conteo; is_featured sin guardia 🟠 | ALTO |
| `leads` | ON | own (dealer) | INSERT `true` ⚠️; UPDATE own | ALTO |
| `favorites` | ON | own | own | OK |
| `dealer_reviews` | ON | sin policy → deny-all | sin policy | Revisar |
| `analytics_events` | ON (021) | service-role | INSERT público | OK-ish |
| `custom_requests`, `integration_events`, `platform_config` | ON | service-role | service-role | OK |
| `organizations`, `subscriptions`, `plans`, `addons`, `boosts`, `subscription_addons` | — | NO verificado en detalle | NO verificado | **Pendiente**: revisar que no tengan policies permisivas que permitan a un usuario leer/alterar su plan por REST |

## Recomendación de orden de corrección (gate)

1. CRÍTICOS 1-3 (RLS profiles, RLS dealers, requireAdmin en actions) — **bloquean el go-live**.
2. Verificar CRÍTICO 4 (secretos en scripts) y rotar si procede.
3. ALTA 5-8 (webhooks fail-closed, trigger de moderación/featured, RLS profiles SELECT, rate-limit leads).
4. Revisar RLS de las tablas de plan/orgs/boosts (fila "Pendiente") — probable que haya más de lo mismo.
5. MEDIA (headers, reviews, idempotencia/import/passwords).

## Alcance no cubierto (honestidad)

No se leyeron en detalle las 56 migraciones; se auditó el RLS core y las reescrituras detectadas por
grep. Las tablas de plan/organización/boost quedan marcadas como "pendiente de revisar" — dado el
patrón encontrado (políticas `own` sin guard de columna), es probable que compartan el mismo defecto.
Recomendado: un barrido RLS tabla por tabla en Supabase (`SELECT * FROM pg_policies`) como parte del fix.
