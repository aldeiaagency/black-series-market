# Auditoría completa — Black Label Market

**Fecha:** 2026-07-01 · **Método:** 4 auditorías especializadas en paralelo (bugs/correctness, seguridad, diseño/UX+accesibilidad, SEO/GEO) leyendo el código real. Todos los hallazgos están verificados contra el código, no especulados.

> Nota de deduplicación: 3 fallos aparecieron simultáneamente en la auditoría de bugs y en la de seguridad (mass-assignment de vehículos, inyección PostgREST y falsificación de leads). Se listan una sola vez, en Seguridad, marcados como **[bug+seguridad]**.

---

## Resumen ejecutivo

La plataforma es madura: buena arquitectura de entitlements, IDOR mitigado en la mayoría de rutas, SEO/schema muy por encima de la media, y una base de design system correcta. **Pero hay una cadena crítica rota en el flujo de dinero y varios agujeros de seguridad explotables que deben resolverse antes de escalar.**

Los 5 fuegos a apagar primero:

1. 🔴 **El pago de planes no rellena `subscriptions`** → entitlements, add-ons y Elite quedan rotos (BUG-1).
2. 🔴 **El boost pagado no destaca el vehículo** (no setea `is_featured`) y, si el cupo está lleno, la webhook lo destaca igual saltándose el tope (BUG-2, BUG-3).
3. 🔴 **Server Actions de admin sin verificar rol** → un usuario cualquiera puede aprobar showrooms/vehículos (SEC-1).
4. 🔴 **Webhooks entrantes fail-open** → si falta el secreto en el entorno, se procesan sin autenticación (SEC-2).
5. 🔴 **Mass-assignment en vehículos** → un dealer se autopublica y autodestaca gratis saltando moderación y Stripe (SEC-3).

---

## 1. BUGS / CORRECCIÓN

### 🔴 Críticos

**BUG-1 — El checkout de planes no escribe en `subscriptions` ni activa Elite**
`app/api/stripe/create-checkout/route.ts:49-54` · `lib/stripe.ts:40-72` · `app/api/stripe/webhooks/route.ts:70,123,141`
`create-checkout` usa la firma **legacy** de `createCheckoutSession` (solo `metadata:{dealer_id, plan}`), sin `organization_id` ni `billing_cycle`. En la webhook, todo el bloque `if (organizationId){…}` se salta → la fila en `subscriptions` nunca se crea y Elite nunca marca `organizations.is_featured`. Como `getEntitlements` lee `subscriptions` primero, add-ons de slots y boosts por ciclo quedan rotos.
**Fix:** resolver la org en `create-checkout` y usar la firma nueva:
```ts
const { data: org } = await admin.from('organizations').select('id').eq('dealer_id', dealer.id).single()
const session = await createCheckoutSession({ customerId, priceId, organizationId: org!.id, dealerId: dealer.id, plan, billingCycle })
```

**BUG-2 — El boost no pone `is_featured=true`**
`lib/boosts.ts:130-134` vs `lib/vehicle-query.ts:60-64` y `app/api/vehicles/route.ts:53-58,64`
`activateBoost` solo actualiza `featured_until`, pero los filtros/orden públicos exigen `is_featured=true AND featured_until>now`. Resultado: el boost solo "funciona" visualmente cuando internamente ha fallado (fallback de la webhook). El camino con crédito válido no destaca nada.
**Fix:** en `activateBoost`, `update({ is_featured:true, featured_until: endsAt })`.

**BUG-3 — El fallback de boost viola el cupo `max_boosted_share`**
`app/api/stripe/webhooks/route.ts:94-108`
Si `activateBoost` falla **por cupo lleno**, la webhook fuerza `is_featured=true` igualmente, saltándose el tope y la lógica de cola.
**Fix:** distinguir el motivo del fallo. Si es cupo lleno, no destacar; dejar el crédito para activar cuando haya hueco. Fallback directo solo para errores inesperados.

### 🟠 Altos

**BUG-4 — [ver SEC-3] Mass-assignment en vehículos** (movido a Seguridad).

**BUG-5 — `incrementEliteCounter` importado pero nunca llamado**
`app/api/stripe/webhooks/route.ts:5` · `lib/elite-capacity.ts:82`
El contador de plazas Elite por provincia nunca se incrementa → `checkEliteAvailability` nunca pasa a waitlist/closed. La regla de negocio de capacidad Elite (§6) no funciona.
**Fix:** llamar a `incrementEliteCounter(provincia, categoria)` cuando `planSlug==='elite'` (y arreglar antes BUG-6).

**BUG-6 — Escrituras basura `admin.rpc as never` en 3 funciones**
`lib/boosts.ts:81`, `lib/boosts.ts:180`, `lib/elite-capacity.ts:87`
Se escribe/filtra con `admin.rpc as never` como valor real: corrompe `used` y `current_elite_showrooms` antes del read-modify-write posterior; si el proceso muere entre medias, queda mal.
**Fix:** eliminar esas líneas placeholder; hacer la operación atómica con una función RPC de Postgres (`increment_column`).

**BUG-7 — Falta idempotencia real en la webhook de Stripe**
`app/api/stripe/webhooks/route.ts:8-9,26-61`
El comentario promete idempotencia por `event.id` pero no existe ninguna comprobación. Stripe reenvía eventos → boosts/créditos duplicados.
**Fix:** `insert` de `event.id` en tabla `processed_stripe_events` con unique; si choca, responder 200 sin procesar.

### 🟡 Medios

- **BUG-8** — No hay cron que expire boosts ni resetee `is_featured`. El orden `.order('is_featured')` prioriza boosts caducados. → Cron diario que marque `boost_activations.status='expired'` y `vehicles.is_featured=false` donde `featured_until<now`.
- **BUG-9** — Doble reserva en `assistant/book` (race condition): check + insert sin constraint único. → Índice único parcial `appointments(dealer_id, starts_at) where status in ('confirmed','pending')` + 409.
- **BUG-10** — [ver SEC-5] Inyección PostgREST en búsqueda.
- **BUG-11** — [ver SEC-4] `book`/`leads` no validan que `vehicle_id` pertenezca a `dealer_id`.

### 🔵 Bajos
- `lib/entitlements.ts:286-297` / `lib/dealer-access.ts:47-53`: se ordena por `created_at asc` en vez de "owner>admin>others" como dice el comentario → rol/org incorrectos en usuarios multi-org.
- `app/api/team/members/[id]/route.ts:66-67`: `DELETE` borra el usuario de auth globalmente sin comprobar otras membresías.
- `app/api/team/members/route.ts:47-66`: TOCTOU entre conteo y `createUser` puede superar `maxUsers`.
- `lib/boosts.ts:97`: selección de crédito + `used=used+1` no atómico → dos boosts concurrentes consumen el mismo crédito.

---

## 2. SEGURIDAD

### 🔴 Críticos

**SEC-1 — Server Actions de admin sin verificación de rol**
`app/(admin)/admin/altas-showroom/actions.ts` (approve/reject/setStatus/saveNotes) · `app/(admin)/admin/vehiculos/[id]/page.tsx` (approve/rejectVehicle)
Usan `createAdminClient()` (service role) sin comprobar en el cuerpo que el invocante es admin. El middleware protege navegación, no Server Actions (se despachan por Action ID vía POST reproducible). Un usuario autenticado no-admin puede aprobar solicitudes, crear dealers `is_verified:true` con membresía `owner`, y publicar vehículos.
**Fix:** `requireAdmin()` como primera línea de **cada** acción (patrón ya usado en `app/api/admin/config/route.ts`):
```ts
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthorized')
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (p?.role !== 'admin') throw new Error('forbidden')
}
```

**SEC-2 — Webhooks entrantes fail-open (HMAC opcional)**
`app/api/webhooks/{appointment-result,assistant-result,hot-lead-alert}/route.ts`
`if (SECRET && !verifyHmac(...))`: si la env está vacía, no se verifica nada y la petición se procesa. `.env.local.example` los muestra opcionales → estado por defecto inseguro. Un atacante inyecta leads/citas/alertas falsos en cualquier dealer.
**Fix:** secreto obligatorio, fail-closed:
```ts
if (!SECRET) return NextResponse.json({error:'server_misconfigured'}, {status:503})
if (!verifyHmac(raw, sig)) return NextResponse.json({error:'invalid_signature'}, {status:401})
```

**SEC-3 — [bug+seguridad] Mass-assignment en vehículos**
`app/api/vehicles/route.ts` (POST) · `app/api/vehicles/[id]/route.ts` (PATCH)
Fuerzan `dealer_id` pero pasan el payload entero a `insert/update`. El dealer controla `status`, `is_featured`, `featured_until`, `is_verified`, `admin_notes`… → se autopublica activo y destacado, saltando `pending_review` y el boost de €49.
**Fix:** allowlist de columnas escribibles + forzar `status='pending_review'` y nunca aceptar `is_featured/featured_until/is_verified` del cliente. Validar además el límite de plan antes del insert.

### 🟠 Altos

**SEC-4 — [bug+seguridad] Falsificación de leads y citas**
`app/api/leads/route.ts` (POST público) + webhooks de SEC-2
Acepta `dealer_id`/`vehicle_id` arbitrarios sin validar pertenencia ni existencia, sin rate limiting. POST masivo inunda la bandeja de un competidor y dispara automatizaciones (emails/Slack).
**Fix:** validar que `dealer_id` existe y `vehicle.dealer_id===dealer_id AND status='active'`; añadir rate limiting por IP+email (patrón ya en `custom-requests`). En webhooks, validar pertenencia tras HMAC.

**SEC-5 — [bug+seguridad] Inyección de operadores PostgREST en búsqueda**
`lib/vehicle-query.ts:85` · `app/(public)/buscar/page.tsx:25`
`query.or(\`brand_name.ilike.%${search}%,model_name.ilike.%${search}%\`)` con input crudo. Comas/paréntesis/puntos son estructurales en el DSL de `.or()` → se pueden inyectar condiciones y exponer filas no activas (borradores, en revisión).
**Fix:**
```ts
const safe = search.replace(/[,()"\\%]/g,' ').trim().slice(0,60)
query = query.or(`brand_name.ilike."%${safe}%",model_name.ilike."%${safe}%"`)
```
Mejor: `textSearch` con `to_tsquery` o RPC parametrizada. Aplicar también a los `.ilike` de `vehicle-query.ts:33,36,37,48` y `app/api/models/route.ts:39`.

### 🟡 Medios
- **SEC-6** — Import por API key global sin scoping: `IMPORT_API_KEY` acepta cualquier `dealer_slug` y no aplica plan-gating → escritura cross-tenant si la clave se filtra. `app/api/vehicles/import/route.ts`. → Claves por-dealer (tabla `api_keys` con hash), mismos límites que la rama de sesión, rotar clave.
- **SEC-7** — Upload confía `file.type` y extensión del nombre, sin magic bytes. `app/api/upload/route.ts`. → Validar magic bytes, re-encodear con sharp, `nosniff`+`Content-Disposition`, nunca `image/svg+xml`. (El path está bien: prefijado por `dealer.id`, sin traversal.)
- **SEC-8** — Contraseña temporal devuelta en el JSON de respuesta + sufijo fijo `7a` predecible. `app/api/team/members/route.ts`. → Invitación por email/magic link; si se mantiene, forzar cambio en primer login y entropía plena.

### 🔵 Bajos / Hardening
- **SEC-9** — Faltan cabeceras de seguridad (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy). `next.config.js` no define `headers()`. → Añadir `async headers()`.
- **SEC-10** — `/api/track` inserta `vehicle_id`/`dealer_id` sin validar ni rate limiting → envenenamiento de métricas.
- **SEC-11** — Errores crudos de PostgREST devueltos al cliente (fuga de esquema) → mensaje genérico.

**Correctamente resuelto (no romper):** Stripe webhook fail-closed e idempotente en firma; IDOR mitigado en `/api/vehicles/[id]`, `/api/leads/[id]`, `/api/gallery`, `/api/team/members/[id]`, `/api/stripe/boost`; `.env.local` fuera de git; service-role y Stripe secret solo en servidor; Zod `.strict()`+rate limit en `custom-requests`/`showroom-applications`; crons con bearer secreto.

---

## 3. DISEÑO / UX + ACCESIBILIDAD (WCAG 2.2 AA)

### Accesibilidad

**🔴 A1 — Contraste insuficiente en el texto gris más usado**
`tailwind.config.ts:41` · transversal
`bsm-text-muted #8A8A8A` sobre `#0A0A0A` = **4.02:1** (falla AA). Variantes hardcodeadas peores: `#808080`=3.54:1, `#737373`=2.93:1, `#757575` nav header. Es el fallo más extendido (home, fichas, cards, header, dashboard).
**Fix:** subir `bsm-text-muted` → `#A0A0A0` (~4.6:1); sustituir literales `#808080/#737373/#757575` por `text-bsm-text-secondary` (`#9A9A9A`). Grises <4.5:1 solo para decoración.

**🔴 A2 — Modal de leads sin `role="dialog"`/`aria-modal`/focus trap** `LeadsBandeja.tsx:126-133` (y `KanbanBoard.tsx:199`). → añadir rol, `aria-labelledby`, mover foco al abrir, atrapar Tab, restaurar foco al cerrar.

**🟠 A3** — `SearchAlertModal` y lightbox/vídeo de galería sin focus trap ni Escape. → hook compartido `useModalA11y(ref,onClose)` reutilizado en los 4 modales.
**🟠 A4** — Inputs de `ContactForm`/`QualifiedLeadForm`/`SearchBar` solo con `placeholder`, sin `<label>`/`aria-label`. → `<label class="sr-only">` o `aria-label`.
**🟠 A5** — Flechas de galería solo visibles en `group-hover` (invisibles con teclado). → `group-focus-within:opacity-100` + `focus-visible:ring`.
**🟠 A6** — Errores de formulario no anunciados (`aria-invalid`/`aria-describedby`/`role="alert"` ausentes). → asociar error al input y envolver error general en `role="alert"`.
**🟠 A7** — Radios `sr-only` que comunican selección solo por color, sin foco visible. → check visible + `has-[:focus-visible]:ring`.

**🟡 Moderados:** A8 iconos header con `title` en vez de `aria-label` · A9 hamburguesa sin `aria-expanded`, submenú "Marcas" solo hover · A10 jerarquía de encabezados (h1→h3) en ficha · A11 sin `prefers-reduced-motion` en `globals.css` · A12 placeholder de imagen `text-[#2A2A2A]` ilegible (1.2:1).

### Diseño / UX

**🔴 B1 — Header con gradiente marrón/dorado que rompe la identidad "negro premium"**
`Header.tsx:125-129,294` usa `rgba(58,45,36,…)` (marrón tierra) mientras todo el sitio es `#0A0A0A`. Es el elemento más visible en todas las páginas. → gradiente negro con velo dorado sutil + `border-gold/10`; dorado solo como acento.

**🔴 B2 — Hero con 3 CTAs dorados compitiendo** `page.tsx:112-129`. Dos `btn-gold` idénticos = parálisis. → un primario "Explorar catálogo", motos secundario `btn-outline`, "a la carta" como enlace de texto.

**🔴 B3 — Tablas de admin/dashboard rotas en móvil** (8 columnas con scroll horizontal) `admin/dealers/page.tsx:111-151` y resto de vistas admin/inventario. → patrón "tabla → card apilada" por debajo de `md`.

**🟠 Serios:** B4 tipografía de cuerpo demasiado pequeña/gris (`text-[10-12px]` gris) para producto premium · B5 fricción alta en "Publicar vehículo" (5 pasos, ~40 campos, sin autoguardado por paso, mínimo 10 fotos bloqueante) · B6 Kanban no usable en móvil/teclado (popover `position:fixed` que no se reancla al hacer scroll) · B7 inconsistencia de tokens (múltiples grises de borde hardcodeados; **tres dorados distintos**: `#C6A64B`/`#C9A84C`/`#BFA14A`).

**🟡 Moderados:** B8 "Precio a consultar" pierde jerarquía en la parrilla · B9 sin estados de loading/skeleton en listados (existe `.shimmer` sin usar) → añadir `loading.tsx` · B10 breadcrumb casi invisible · B11 `ContactForm` y `QualifiedLeadForm` con comportamiento distinto para la misma acción.

**✅ Bien (preservar):** `SearchAlertModal` con rol/aria/alert correctos; `alt` descriptivo en imágenes; overlay de card con `tabIndex=-1 aria-hidden`; sistema `btn-gold`/`input-base` con `focus:ring`.

---

## 4. SEO / GEO

> Contexto: sitio en `noindex` gating pre-lanzamiento (intencional). Base técnica y de schema **excelente** (8 olas ya ejecutadas). Hallazgos = refinamiento, no emergencia.

### 🔴 Bloqueantes antes de levantar el gate (G01)
- **SEO-1** — `sitemap.ts:39` incluye `/sobre-nosotros` (que el backlog marca inexistente) y el footer la enlaza → 404 en sitemap+footer. **Verificar/crear la página** antes de indexar.
- **SEO-2** — `sitemap.ts:51` lista `/coches/berlinas` (no aparece en ninguna ola) → auditar 1:1 las 15 rutas de categoría del sitemap contra carpetas reales; retirar las que no tengan `page.tsx`.

### 🟠 Alto impacto
- **SEO-3** — `mileageFromOdometer` se emite siempre → `value:null` cuando falta km (warning en Rich Results). `coches/[slug]:138`. → spread condicional `...(mileage_km != null && {…})`. Añadir `manufacturer`.
- **SEO-4** — OG de fichas con `type:'website'` sin `url` ni dimensiones, e `images:[]` en vez de heredar la global. `coches`+`motos/[slug]:38`.
- **SEO-5 (GEO)** — Landings de categoría abren con copy de marketing en vez de una respuesta directa citable → anteponer 1-2 frases factuales con la entidad (para ChatGPT/Perplexity/Gemini).

### 🟡 Medio
- **SEO-6 (GEO)** — Falta `FAQPage` en landings de categoría y marca (alto ROI para PAA/snippets).
- **SEO-7** — `VehicleGallery.tsx:192` marca `priority` en la imagen activa (no solo la 0) → `priority={activeIndex===0}` para no dañar el LCP.
- **SEO-8** — Breadcrumb de ficha salta la categoría (`/coches` directo) y el nivel marca apunta a filtro `?marca=` en vez de `/marcas/[slug]`. Añadir nivel categoría intermedio.
- **SEO-9** — Landings de categoría no enlazan entre sí (falta silo horizontal "otras categorías").

### 🔵 Bajo
- SEO-10 fecha "Actualizado en junio 2026" hardcodeada vs `dateModified` dinámico (`guias/[slug]:116`) → derivarla con `Intl.DateTimeFormat`.
- SEO-11 título de dealer sin ciudad/keyword transaccional · SEO-12 `/marcas/[brand]` no enlaza al split `/coches|/motos`.

**Limpieza del backlog:** cerrar P01, P02, P03, P04, O2-07/P07 — ya implementadas en código pero marcadas pendientes.

---

## Plan de acción priorizado

### Sprint 0 — Antes de aceptar más pagos reales / abrir al público
1. BUG-1 checkout→subscriptions · BUG-2/BUG-3 boost is_featured + cupo · BUG-7 idempotencia Stripe
2. SEC-1 auth en Server Actions admin · SEC-2 webhooks fail-closed · SEC-3 mass-assignment vehículos
3. SEC-4 falsificación de leads · SEC-5 inyección PostgREST
4. SEO-1/SEO-2 (solo si se va a levantar el gate)

### Sprint 1 — Calidad y confianza
5. BUG-5/BUG-6 Elite counter + `admin.rpc as never` · BUG-8/BUG-9 cron expiración + doble reserva
6. SEC-6/SEC-7/SEC-8 import scoping, upload magic bytes, contraseñas
7. A1 contraste (1 cambio de tokens + find/replace) · A2/A3 modales accesibles · B1 header · B3 tablas móvil · B2 CTA hero

### Sprint 2 — Pulido premium + SEO
8. A4-A7 formularios/galería accesibles · B4-B7 tipografía, wizard, kanban móvil, tokens/dorado unificado
9. SEO-3/4/5/6 schema+OG+GEO · SEC-9/10/11 hardening
10. Resto de 🔵 y limpieza de backlog SEO

---

*Auditoría generada con agentes especializados (Code Reviewer, Security Engineer, Accessibility Auditor, SEO Specialist) sobre el código real del repositorio.*
