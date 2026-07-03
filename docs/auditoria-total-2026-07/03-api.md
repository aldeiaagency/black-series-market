# Auditoría de API — Black Label Market

> Auditoría **desde cero** contra el código real de `app/api/**` (38 `route.ts`) y sus
> helpers en `lib/`. No se apoya en auditorías previas. Análisis estático; sin escrituras
> a producción.
>
> Stack: Next.js 14 (App Router) · Supabase (Auth + Postgres/RLS + Storage) · Stripe (test) · n8n.
> Fecha: 2026-07-02.

Patrón transversal del proyecto: casi todas las rutas de escritura usan `createAdminClient()`
(service-role, que **ignora RLS**) y confían el control de acceso a la capa de aplicación
(`getDealerAccess` + `getPermissions`). Eso concentra el riesgo: cualquier campo no filtrado,
webhook fail-open o falta de rate limit se traduce en escritura real sin barrera de base de datos.

---

## 1. Inventario de endpoints

| # | Método | Ruta | Acceso | Qué hace |
|---|--------|------|--------|----------|
| 1 | POST | `/api/leads` | **Público** | Inserta lead (admin client) + evento `lead.created` a n8n |
| 2 | GET | `/api/vehicles` | Público | Listado de vehículos activos con filtros + paginación |
| 3 | POST | `/api/vehicles` | Privado (dealer, `canEditInventory`) | Crea vehículo; fuerza `dealer_id`, borra `id` |
| 4 | GET | `/api/vehicles/count` | Público | Cuenta de vehículos activos según filtros |
| 5 | GET | `/api/vehicles/[id]` | Privado (dealer dueño/miembro) | Carga vehículo propio para editar |
| 6 | PATCH | `/api/vehicles/[id]` | Privado (dealer dueño/miembro) | Edita vehículo propio |
| 7 | POST | `/api/vehicles/import` | Privado (API key n8n **o** sesión dealer Pro+) | Importa filas CSV como `pending_review` |
| 8 | GET | `/api/brands` | Público | Marcas con stock activo |
| 9 | GET | `/api/models` | Público | Modelos por marca (catálogo + publicados) |
| 10 | GET | `/api/featured-dealers` | Público | Dealers con stock, marcando destacados |
| 11 | GET | `/api/gallery` | Privado (dealer dueño) | Lista imágenes de galería del dealer |
| 12 | DELETE | `/api/gallery?id=` | Privado (dealer dueño) | Borra imagen (verifica propiedad) |
| 13 | PATCH | `/api/gallery` | Privado (dealer dueño) | Reordena imágenes (verifica propiedad) |
| 14 | POST | `/api/upload?type=` | Privado (dealer dueño) | Sube imagen a Storage (tipo/tamaño validados) |
| 15 | POST | `/api/track` | **Público** | Inserta `analytics_events` (event_type en whitelist) |
| 16 | POST | `/api/search-alerts` | **Público** | Crea alerta de búsqueda + evento n8n |
| 17 | POST | `/api/custom-requests` | **Público** (rate-limited) | Solicitud "a la carta" + evento n8n |
| 18 | POST | `/api/custom-requests/email-events` | Privado (Bearer token interno) | Registra emails enviados al comprador |
| 19 | POST | `/api/showroom-applications` | **Público** | Solicitud de alta de showroom (Zod strict) + webhook |
| 20 | POST | `/api/auth/register-dealer` | **Público** | Solicitud de alta de showroom (variante sin Zod) + webhook |
| 21 | POST | `/api/auth/signout` | Sesión | Cierra sesión y redirige |
| 22 | GET | `/api/me/showroom` | Privado (dealer dueño/miembro) | Contexto del showroom del usuario |
| 23 | POST | `/api/team/members` | Privado (`canManageTeam`) | Crea usuario auth + membresía; devuelve contraseña temporal |
| 24 | PATCH | `/api/team/members/[id]` | Privado (`canManageTeam`) | Cambia rol de un miembro de la misma org |
| 25 | DELETE | `/api/team/members/[id]` | Privado (`canManageTeam`) | Elimina membresía + usuario auth |
| 26 | GET | `/api/admin/config` | Privado (admin) | Lee `platform_config` |
| 27 | POST | `/api/admin/config` | Privado (admin) | Upsert `platform_config` (key/value libres) |
| 28 | POST | `/api/admin/vehicles/[id]/reject` | Privado (admin) | Rechaza vehículo (→ draft) + evento n8n |
| 29 | PATCH | `/api/leads/[id]` | Privado (`canManageOpportunities`) | Cambia estado del lead (del propio dealer) |
| 30 | DELETE | `/api/leads/[id]` | Privado (`canManageOpportunities`) | Elimina lead (del propio dealer) |
| 31 | POST | `/api/events/vehicle-submitted` | Privado (dealer dueño del vehículo) | Emite `vehicle.submitted_for_review` |
| 32 | GET | `/api/platform/social-links` | Público (`revalidate=300`) | Enlaces sociales oficiales + overrides |
| 33 | POST | `/api/stripe/create-checkout` | Privado (dealer) | Checkout de suscripción (formData) |
| 34 | POST | `/api/stripe/boost` | Privado (dealer dueño del vehículo) | Checkout de boost (€49) |
| 35 | POST | `/api/stripe/portal` | Privado (dealer) | Portal de facturación Stripe |
| 36 | POST | `/api/stripe/webhooks` | Público (firma Stripe) | Procesa eventos Stripe (checkout/subs/invoices/boost) |
| 37 | POST | `/api/webhooks/dealer-registered` | — | Deprecado, responde 410 |
| 38 | POST | `/api/webhooks/assistant-result` | HMAC (**fail-open**) | Inserta lead cualificado por IA + eventos |
| 39 | POST | `/api/webhooks/appointment-result` | HMAC (**fail-open**) | Inserta `appointments` + avanza lead |
| 40 | POST | `/api/webhooks/hot-lead-alert` | HMAC (**fail-open**) | Inserta `lead_alerts` + evento |
| 41 | POST | `/api/assistant/message` | **Público** | Proxy firmado a webhook IA del dealer |
| 42 | POST | `/api/assistant/session` | **Público** | Inicia sesión de asistente (comprueba entitlement) |
| 43 | GET | `/api/assistant/availability?dealer=` | **Público** | Huecos de cita disponibles del dealer |
| 44 | POST | `/api/assistant/book` | **Público** | Reserva cita (valida hueco real) + lead + evento |
| 45 | GET | `/api/cron/cleanup-leads` | Cron (Bearer `CRON_SECRET`) | Purga leads/custom_requests > 12 meses |

(38 archivos `route.ts`; 45 handlers HTTP.)

---

## 2. Hallazgos

Severidad: **CRÍTICA** (explotable con impacto grave e inmediato) · **ALTA** · **MEDIA** · **BAJA**.

| Sev | Archivo:línea | Descripción | Impacto | Fix |
|-----|---------------|-------------|---------|-----|
| **ALTA** | `app/api/vehicles/route.ts:23-27` · `app/api/vehicles/[id]/route.ts:54-57` | **Mass-assignment sin whitelist.** El `payload` del cliente se pasa entero a `insert`/`update` (solo se fuerza `dealer_id` y se borra `id`). El cliente puede fijar `status:'active'` (salta la moderación `pending_review`), `is_featured:true` + `featured_until` lejano (boost gratuito y permanente, sin pago ni consumir `boost_credits`), `published_at`, `slug`, etc. El trigger `040` solo limita el **número** de activos, no la moderación ni el featured. | Un dealer publica sin revisión y se auto-destaca gratis; se rompe el modelo de moderación y de monetización de boosts. | Whitelist explícita de columnas editables; `status`, `is_featured`, `featured_until`, `is_verified`, `published_at` solo por servidor/moderación. |
| **ALTA** | `app/api/webhooks/assistant-result/route.ts:23` · `appointment-result/route.ts:22` · `hot-lead-alert/route.ts:24` | **Webhooks fail-open.** El guard es `if (SECRET && !verifyHmac(...))`. Si la variable de entorno del secreto está vacía/ausente, la verificación HMAC se **omite entera** y el endpoint acepta escrituras anónimas. | Sin el secreto configurado, cualquiera inyecta `leads`, `appointments` y `lead_alerts` para cualquier `dealer_id` (spam, datos falsos, disparo de emails/Slack a dealers reales). | Fail-closed: si falta el secreto, `500`/`503` y rechazar. Nunca aceptar el cuerpo sin firma válida. |
| **ALTA** | `app/api/stripe/webhooks/route.ts:8-9, 65-109` | **Webhook Stripe sin idempotencia real.** El comentario afirma guardar `event.id` en `platform_config`, pero **no hay ninguna comprobación** en el código. `checkout.session.completed` de tipo boost inserta un `boost_credit` y activa un boost en **cada** entrega; Stripe reintenta/duplica entregas. | Boost/créditos duplicados por reintento o reenvío de Stripe; posible doble cargo de valor. | Tabla `stripe_events(event_id PK)`; insertar al inicio y salir si ya existe (idempotencia por `event.id`). |
| **ALTA** | `app/api/stripe/create-checkout/route.ts:49-54` → `lib/stripe.ts:62-72` + `app/api/stripe/webhooks/route.ts:123, 255-261` | **Cadena de suscripción rota.** `create-checkout` invoca la firma **legacy** de `createCheckoutSession` → la `metadata` de la sesión no lleva `organization_id` ni `billing_cycle`. En el webhook, el upsert a `subscriptions` está tras `if (organizationId)` (se salta) y `handleInvoicePaid` busca la fila en `subscriptions` (no existe) → no se aprovisionan boosts incluidos ni addons. | La tabla `subscriptions` nunca se rellena en el flujo estándar; los planes Pro/Elite no reciben sus boosts mensuales ni bloques extra. Ciclo anual tratado como mensual. | Usar la firma nueva (`CheckoutOptions`) pasando `organization_id` y `billing_cycle`; resolver la organización del dealer antes de crear la sesión. |
| **MEDIA** | `app/api/leads/route.ts:12-68` | `POST /api/leads` **sin rate limit** ni verificación de que `vehicle_id`/`dealer_id` existan o estén relacionados. `dealer_id` arbitrario. Cada request dispara `lead.created` → emails de n8n a dealers reales. | Spam de leads atribuibles a cualquier dealer + email bombing a terceros reales + coste de ejecuciones n8n. Crítico al abrir a dealers reales. | Rate limit por IP/email (como en `custom-requests`); validar que el vehículo pertenece al dealer; captcha en el formulario público. |
| **MEDIA** | `app/api/assistant/message/route.ts:11-51` · `app/api/assistant/session/route.ts:14-52` | **Proxy IA sin auth ni rate limit.** Ambos reenvían al webhook n8n del dealer (respaldado por OpenAI) sin autenticar al llamante ni limitar frecuencia. | Amplificación de coste / DoS de tokens: cualquiera bombardea el asistente de cualquier dealer habilitado. | Rate limit por IP + `dealer_id`; validar `session_id` emitido por `/session`; límite de mensajes por sesión. |
| **MEDIA** | `lib/vehicle-query.ts:84-86` (usado por `/api/vehicles/count` y listados) | **Inyección de filtros PostgREST.** `params.search` se interpola crudo en `.or(\`brand_name.ilike.%${params.search}%,model_name.ilike.%${params.search}%\`)`. Comas/paréntesis/`.` permiten inyectar condiciones o referenciar otras columnas. | Alteración de la query, enumeración booleana de datos o queries costosas (DoS). El filtro `status='active'` va aparte (AND), lo que acota el impacto pero no lo elimina. | Escapar/validar `search` (whitelist de caracteres) o usar `textSearch`/RPC parametrizado en vez de construir el string `.or()` a mano. |
| **MEDIA** | `app/api/vehicles/route.ts:60-66` | `limit`/`offset` sin cota máxima. `?limit=1000000` → `.range(0, 999999)`: respuesta enorme y carga de DB/memoria. | DoS por consumo de recursos / respuestas gigantes. | Cota dura (`Math.min(limit, 60)`), `offset >= 0`, y `count` con `head` si no hace falta el total. |
| **MEDIA** | `app/api/assistant/book/route.ts:38-104` · `app/api/webhooks/appointment-result/route.ts:62-101` | Creación de citas **sin idempotencia** y con `buyer_email` controlado por el atacante que se usa para emails de confirmación/calendario. `book` es **público**. | Relay de email a víctimas (confirmaciones a direcciones arbitrarias) + spam de citas que consumen huecos reales de dealers Elite (denegación de agenda). | Rate limit; idempotencia por `session_id`; no enviar confirmación a emails no verificados; límite de citas por IP/sesión. |
| **MEDIA** | `app/api/auth/register-dealer/route.ts:9` · `app/api/showroom-applications/route.ts:17` | Dos endpoints públicos de alta **sin rate limit ni captcha**; disparan webhooks n8n (auditoría Firecrawl + emails a admin). Solo dedupe por email/nombre. | Spam de solicitudes y coste (auditorías Firecrawl, emails). Variando el email se evade el dedupe. | Rate limit por IP; captcha; unificar ambos endpoints (redundantes). |
| **MEDIA** | `app/api/search-alerts/route.ts:11-77` | Público, **sin rate limit** y **sin el saneo de texto** que sí tiene `custom-requests`. `email` controlado por atacante dispara `search_alert.created` (emails n8n). | Spam de alertas + email relay + coste n8n. | Rate limit por IP/email; reutilizar `hasUnsafeText`/validación de `custom-requests`. |
| **MEDIA** | `app/api/stripe/webhooks/route.ts:54-58` | Ante error del handler se devuelve **200** (`received:true`) para evitar reintentos infinitos, pero **no hay outbox** para eventos de dinero. Un fallo transitorio de DB pierde el evento para siempre. | Una suscripción/pago puede no registrarse nunca si el write falla de forma transitoria. | Distinguir errores transitorios (devolver 5xx para que Stripe reintente) de permanentes; persistir el evento crudo antes de procesar. |
| BAJA | `app/api/vehicles/route.ts:28,70` · `vehicles/[id]/route.ts:36,58` · `vehicles/import/route.ts:145` · `admin/config/route.ts:19,38` | Se devuelve `error.message` de Supabase/PostgREST tal cual al cliente. | Fuga de nombres de columnas/constraints y detalles internos. | Mensaje genérico al cliente; `console.error` del detalle en servidor. |
| BAJA | Varias rutas | **Contrato de respuesta inconsistente:** conviven `{ok:true}`, `{data}`, arrays desnudos (`brands`, `models`, `featured-dealers`), `{error}` y `{ok:false,error}`. | Cliente frágil; manejo de errores dispar. | Estándar único de sobre de respuesta (p. ej. `{ ok, data?, error? }`). |
| BAJA | `app/api/brands/route.ts` · `models` · `vehicles` · `featured-dealers` · `vehicles/count` | GET públicos y cacheables sin `Cache-Control`; además usan el cliente con `cookies()` → ruta dinámica, sin caché de CDN. Cada request golpea la DB. | Coste/latencia innecesarios en catálogo público. | Cliente sin cookies + `revalidate`/`Cache-Control: s-maxage` en respuestas de catálogo. |
| BAJA | `app/api/track/route.ts:17-33` | Sin auth ni rate limit; inserta `analytics_events` con `vehicle_id`/`dealer_id` arbitrarios (solo `event_type` en whitelist). | Contaminación de analíticas / inflado de métricas. | Rate limit ligero; validar existencia de `vehicle_id`/`dealer_id`. |
| BAJA | `app/api/auth/signout/route.ts:4-7` | POST de signout sin protección CSRF. | Un tercero puede forzar el cierre de sesión (impacto bajo). | Verificar origen/CSRF token o requerir acción del usuario. |
| BAJA | `app/api/assistant/availability/route.ts:11-33` | Público y sin rate limit; expone la disponibilidad/agenda del dealer. | Enumeración de agenda; ligera fuga de negocio. | Rate limit; considerar exigir sesión de asistente iniciada. |
| BAJA | `lib/boosts.ts:81, 180-181` | Queries muertas/rotas: `.lt('used', admin.rpc as never)` y `.update({ used: admin.rpc as never })` emiten requests malformadas (el resultado se descarta por el fallback). | Fragilidad; requests inútiles a Postgres en la ruta de boost del webhook. | Eliminar el código muerto; usar comparación `used < quantity` correcta o un RPC real. |
| BAJA | `app/api/custom-requests/route.ts:47-50` | El rate limit por IP usa `x-forwarded-for` sin fijar el IP de confianza; el header es manipulable. | El límite por IP (8/h) es evadible falseando la cabecera. | Usar el IP de confianza de Vercel (`request.ip`) o el índice correcto de `x-forwarded-for`. |

---

## 3. Conteo por severidad

| Severidad | Nº |
|-----------|----|
| CRÍTICA | 0 |
| ALTA | 4 |
| MEDIA | 8 |
| BAJA | 7 |
| **Total** | **19** |

---

## 4. Notas de contexto (no hallazgos)

- **Bien resuelto:** aislamiento multi-tenant en las rutas de dashboard (`vehicles`, `leads/[id]`,
  `gallery`, `team/members`) — todas fuerzan `dealer_id`/`organization_id` desde el servidor y
  verifican pertenencia (`.eq('dealer_id', access.dealerId)`), evitando IDOR por parámetro.
- **Bien resuelto:** `custom-requests` (Zod `.strict()`, saneo de texto, rate limit por email+IP) y
  `showroom-applications`/`email-events` (Zod `.strict()`, Bearer fail-closed) son el estándar a
  replicar en `leads` y `search-alerts`.
- **Bien resuelto:** `assistant/book` valida el hueco contra la disponibilidad real (evita horas
  inventadas y solapes); `assistant-result` sí es idempotente por `session_id`.
- **Moderación por DB:** el trigger `040` impide superar el límite de activos por REST directo, pero
  **no** impide fijar `status='active'` saltándose la revisión (ver hallazgo ALTA de mass-assignment).
- La verificación de admin (`admin/config`, `admin/vehicles/[id]/reject`) sí comprueba
  `profiles.role === 'admin'` con el cliente de sesión; no se detectó acción de admin sin control en
  `app/api/`.
