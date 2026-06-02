# Informe de Auditoría — Dashboard Interno Black Label Market

**Fecha:** 2026-06-02
**Rama:** `test/admin-marketplace-dashboard-validation`
**Caso de test:** Claude Motors RS

---

## 1. Resumen ejecutivo

**Veredicto:** APTO CON INCIDENCIAS

El dashboard interno de Black Label Market está funcionalmente operativo para gestión editorial del marketplace. Los flujos principales (alta, activación, aprobación de vehículos, gestión de showroom) están implementados y son funcionales. Se han detectado y corregido dos bugs de impacto medio-alto, y se documentan cuatro incidencias adicionales con propuestas de corrección.

**Riesgos principales:**
- KPI de vistas del marketplace admin mostraba 0 por mismatch de event_type (corregido).
- Contador de vehículos activos en detalle de dealer era incorrecto con >20 vehículos (corregido).
- Botones de gestión de marcas en configuración no funcionales.
- No existe panel de leads ni sección de solicitudes de vehículos a la carta en el admin.

**Bloqueos para producción:**
- Ningún bloqueo técnico crítico tras los fixes aplicados.
- El panel de analíticas del admin necesita que la tabla `analytics_events` esté activa y los eventos de vistas se logueen correctamente desde las fichas públicas.

---

## 2. Estructura del dashboard interno

### Rutas admin auditadas

| Ruta | Función | Estado |
|---|---|---|
| `/admin` | Panel general con KPIs y widgets | Funcional |
| `/admin/dealers` | Listado de todos los dealers con filtros | Funcional |
| `/admin/dealers/[id]` | Detalle completo: estado, plan, vehículos, leads | Funcional |
| `/admin/vehiculos` | Listado de vehículos con filtros por estado | Funcional |
| `/admin/analiticas` | KPIs globales, top vehículos, distribución de planes | Funcional (bug corregido) |
| `/admin/configuracion` | Planes, marcas, criterios, email, SEO | Parcialmente funcional |
| `/admin-login` | Login exclusivo para admins | Funcional |

### Secciones no implementadas (MVP pendiente)

- **Leads / Contactos globales** — No existe vista de leads a nivel admin; solo visible dentro del detalle de cada dealer.
- **Solicitudes de vehículos a la carta** — No existe gestión interna.
- **Usuarios/compradores** — No existe panel de usuarios.
- **Suscripciones/pagos** — Solo gestión manual de plan desde detalle de dealer; no hay vista de Stripe.
- **Soporte/incidencias** — No existe.
- **Moderación de contenidos** — Reportes de anuncios incorrectos solo por email, no gestionable desde admin UI.

---

## 3. Permisos y seguridad

### Protección de rutas admin

```
/admin/layout.tsx → verifica user.id → consulta profiles.role
  → si role !== 'admin' → redirect('/admin-login')
  → sin sesión → redirect('/admin-login')
```

- Admin autenticado → acceso completo.
- Dealer autenticado → bloqueado en `/admin`, redirigido a `/admin-login`.
- Usuario comprador → bloqueado, redirigido a `/admin-login`.
- No autenticado → bloqueado, redirigido a `/admin-login`.
- API routes admin (`/api/admin/*`) → verifican `profiles.role = 'admin'` independientemente.

### Server actions en dealer detail

Las server actions `setDealerStatus`, `setDealerPlan`, `setDealerFeatured`, `approveDealerAccess` usan `createAdminClient()` con service role. Solo se pueden invocar desde el formulario del admin autenticado.

### Validación

| Check | Estado |
|---|---|
| Admin accede: | Sí |
| Dealer bloqueado en /admin: | Sí |
| Comprador bloqueado en /admin: | Sí |
| API admin verifican role: | Sí |
| Server actions protegidas: | Sí |
| Datos cruzados (un dealer ve datos de otro): | Protegido por RLS (pendiente verificar en Supabase dashboard) |

---

## 4. Flujo de alta profesional

### Ruta: `/registro`

1. Dealer completa formulario 2 pasos (cuenta + datos de negocio).
2. Se crea `auth.user` + `dealers` con `status: 'pending'` y `vehicle_slots: 5`.
3. Se dispara webhook n8n (fire and forget).
4. Dealer es redirigido a `/solicitud-enviada`.
5. Dealer con `status: pending` NO puede acceder al dashboard (redirige a `/solicitud-enviada`).

### Aprobación desde admin

En `/admin/dealers/[id]`:

- **"Aprobar acceso"** (banner amarillo cuando `status = pending`) → cambia status a `'trial'`.
  - Trial: puede acceder al dashboard, NO aparece en listados públicos.
- **Botones de estado** → permite cambiar a: `pending | trial | active | suspended`.
  - **Active**: dealer aparece en `/dealers` y en fichas públicas.

### Estado de plan tras aprobación

- Trial: 5 vehicle_slots.
- Essential: 15 slots.
- Professional: 40 slots.
- Elite: 100 slots.

Admin puede cambiar plan y slots desde el mismo detalle de dealer.

---

## 5. Claude Motors RS — Activación

### Estado inicial detectado en código

Claude Motors RS fue registrado via `/registro`, estado inicial: `status: 'pending'`.

### Cómo activar desde admin UI

```
1. Acceder a /admin-login con credenciales de admin
2. Ir a /admin/dealers
3. Localizar "Claude Motors RS" (filtrar por status=pending si hay muchos)
4. Clic en "Gestionar →"
5. En panel "Estado de cuenta" → clic en el botón "Activo"
6. La server action ejecuta:
   supabase.from('dealers').update({ status: 'active' }).eq('id', dealerId)
7. La página recarga mostrando status = active
```

Tras la activación:
- Dealer aparece en `/dealers` públicamente.
- URL pública del perfil: `/dealers/{slug}` (slug generado en registro).
- El dashboard del dealer ya estaba accesible (si estaba en `trial`).

### Estado final esperado

- `status: 'active'`
- Aparece en `/dealers`
- Perfil en `/dealers/claude-motors-rs-{sufijo-aleatorio}`
- Dashboard accesible en `/dashboard`

**Nota:** La activación no puede confirmarse desde este entorno sin credenciales de Supabase activas. Los pasos están documentados. El código para ejecutarla vía UI admin es funcional y fue auditado.

---

## 6. Incidencias detectadas

### INC-001 — Event type mismatch en admin analytics

| Campo | Valor |
|---|---|
| Ruta | `/admin/analiticas` |
| Severidad | Crítica |
| Descripción | El KPI "Vistas (30d)" consultaba `event_type = 'vehicle_view'`, pero los eventos se insertan como `event_type = 'view'` en `coches/[slug]` y `motos/[slug]`. |
| Impacto | KPI de vistas siempre mostraba 0, incluso con tráfico real. |
| Corrección | Cambiado `'vehicle_view'` → `'view'` en `app/(admin)/admin/analiticas/page.tsx`. |
| Estado | **CORREGIDO** |

### INC-002 — Contador de vehículos activos incorrecto en detalle de dealer

| Campo | Valor |
|---|---|
| Ruta | `/admin/dealers/[id]` |
| Severidad | Alta |
| Descripción | `activeVehicles` se calculaba filtrando el array `vehicles?.filter(v.status === 'active')`, que venía de una query con `.limit(20)`. Con >20 vehículos, el contador era incorrecto. |
| Impacto | El "Slots usados" en el detalle de dealer podía mostrar un número menor al real. |
| Corrección | Añadida query dedicada `{ count: 'exact', head: true }` para `status = 'active'`. |
| Estado | **CORREGIDO** |

### INC-003 — Botones de gestión de marcas no funcionales en Configuración

| Campo | Valor |
|---|---|
| Ruta | `/admin/configuracion` → sección Marcas |
| Severidad | Media |
| Descripción | El botón "Añadir" y los botones eliminar (Trash2) de marcas no tienen handlers. Hacer clic no ejecuta ninguna acción. |
| Impacto | La gestión de marcas desde el admin no funciona. Las marcas solo pueden gestionarse editando el código. |
| Corrección propuesta | Añadir handlers al input/select/botón de añadir y al botón de eliminar en el estado local `brands`, y persistir via `handleSave('marcas')`. |
| Estado | **PENDIENTE** |

### INC-004 — Admin login consulta profiles por email en vez de por ID

| Campo | Valor |
|---|---|
| Ruta | `/admin-login` (app/(auth)/admin-login/page.tsx) |
| Severidad | Leve |
| Descripción | Tras autenticarse, la verificación de role usa `profiles.eq('email', email)` en lugar de `profiles.eq('id', user.id)`. El admin layout lo hace correctamente por ID. |
| Impacto | Mínimo en práctica (emails únicos en auth). Semánticamente incorrecto y menos robusto. |
| Corrección propuesta | Cambiar a `supabase.from('profiles').select('role').eq('id', authUser.id).single()` usando el user.id del objeto authData. |
| Estado | **PENDIENTE** |

### INC-005 — Secciones admin ausentes (limitación MVP)

| Campo | Valor |
|---|---|
| Severidad | Media |
| Descripción | No existen vistas admin para: leads globales, solicitudes de vehículos a la carta, usuarios compradores, suscripciones/pagos, soporte/incidencias. |
| Impacto | El equipo no puede gestionar leads ni solicitudes desde el admin; debe hacerse manualmente o via Supabase dashboard. |
| Corrección propuesta | Implementar como fases futuras: panel de leads, panel de solicitudes a la carta, vista de suscripciones Stripe. |
| Estado | **PENDIENTE — MVP** |

---

## 7. Rendimiento y queries

### Queries potencialmente pesadas

| Query | Ubicación | Observación |
|---|---|---|
| `vehicles.select('brand_name')` sin filtro de limit | `/admin/analiticas` | Trae todas las marcas de todos los vehículos activos para agregar en memoria. Con volumen alto puede ser lento. Mitigar con GROUP BY en DB o función RPC. |
| `leads.select('status')` sin filtro de fechas ni limit | `/admin/analiticas` | Trae todos los leads históricos. Con crecimiento puede ser problemático. |
| `analytics_events` sin paginación en vendor dashboard | `/dashboard/analiticas` y `/dashboard/page.tsx` | Si el dealer tiene muchos eventos en 30 días, podría ser lento. Con Supabase hay un límite de 1000 filas por defecto. |

### Queries correctas (sin límites artificiales en contadores)

- `/admin/page.tsx`: todos los contadores usan `count: 'exact', head: true`. Correcto.
- `/admin/dealers/[id]`: `vehicleCount` usa `count: 'exact'` (total correcto). `activeVehicles` ahora también usa `head: true`. Correcto tras fix.

---

## 8. Gestión de vehículos desde admin

### Operaciones disponibles en `/admin/vehiculos`

| Operación | Disponible | Notas |
|---|---|---|
| Listar con filtros por estado | Sí | Filtros: all, pending_review, active, paused, sold, draft |
| Aprobar vehículo (pending_review → active) | Sí | Botón "Aprobar" con server action. Fija `published_at`. |
| Rechazar vehículo | Sí | API `/api/admin/vehicles/[id]/reject` con motivo obligatorio. |
| Ver ficha pública | Sí | Enlace "Ver →" para vehículos active. |
| Editar vehículo | No | No existe formulario de edición desde admin. Edición solo desde dashboard del dealer. |
| Destacar vehículo | No | BoostButton solo existe en dashboard del dealer. |
| Cambiar dealer/showroom | No | No implementado. |
| Eliminar vehículo | No | No existe acción de eliminación en admin (protege contra borrados). |

### Flujo de aprobación de vehículo

```
Dealer publica → status: pending_review
                    ↓
Admin: /admin/vehiculos → botón "Aprobar"
  → status: active, published_at: now()
                    ↓
Aparece en /coches o /motos + en perfil showroom
```

---

## 9. Analíticas del marketplace

### Queries auditadas en `/admin/analiticas`

| KPI | Query | Estado post-fix |
|---|---|---|
| Vistas (30d) | `analytics_events WHERE event_type='view'` | Correcto tras fix |
| Leads (30d) | `leads WHERE created_at >= 30d ago` + count | Correcto |
| Dealers nuevos (30d) | `dealers WHERE created_at >= 30d ago` + count | Correcto |
| Top vehículos por vistas | `vehicles.order('views').limit(10)` | Correcto (display list, no contador) |
| Distribución de planes | `dealers.select('subscription_plan').eq('status','active')` | Correcto |
| Estado de leads | `leads.select('status')` sin filtro de fechas | Puede crecer. Aceptable MVP. |
| Top marcas | `vehicles.select('brand_name').eq('status','active')` | Puede crecer. Aceptable MVP. |

---

## 10. Suscripciones y planes

### Gestión de plan por dealer

Desde `/admin/dealers/[id]`:
- Admin puede cambiar plan (trial/essential/professional/elite).
- Al cambiar plan, el servidor actualiza `subscription_plan` y `vehicle_slots` automáticamente.
- Slots: trial=5, essential=15, professional=40, elite=100.

### Gestión de pagos

No existe panel de Stripe en el admin. Las suscripciones vía Stripe (checkout, webhooks, portal) están implementadas en API routes pero no hay vista admin para monitorización. Stripe Dashboard es la fuente de verdad para pagos.

---

## 11. Validación técnica

| Check | Resultado |
|---|---|
| `npm run lint` | OK — 0 errores (2 warnings preexistentes en `page.tsx`) |
| `npm run build` | OK — 51 páginas, 0 errores nuevos |
| Tests | No existe suite de tests configurada |

---

## 12. Resumen de cambios de código

| Archivo | Cambio | Impacto |
|---|---|---|
| `app/(admin)/admin/analiticas/page.tsx` | `event_type: 'vehicle_view'` → `'view'` | KPI de vistas admin ahora muestra datos reales |
| `app/(admin)/admin/dealers/[id]/page.tsx` | Añadida query `count: 'exact', head: true` para `activeVehicles` | Contador correcto independiente del limit(20) |

---

## 13. Estado final de Claude Motors RS

| Campo | Valor |
|---|---|
| Status inicial | `pending` (creado via /registro) |
| Status esperado tras activación | `active` |
| Activación confirmada desde código | No — requiere acceso Supabase activo |
| UI para activar | Funcional en `/admin/dealers/[id]` → panel "Estado de cuenta" → botón "Activo" |
| URL pública esperada | `/dealers/claude-motors-rs-{sufijo}` |
| Dashboard dealer | `/dashboard` (accesible tras status ≠ pending) |
| Vehículos activos | 0 hasta que se publiquen y aprueben desde el admin |

**Pasos exactos para activar desde admin UI:**
1. Login en `/admin-login`
2. `/admin/dealers` → localizar Claude Motors RS
3. Clic en "Gestionar →"
4. Panel izquierdo "Estado de cuenta" → clic en botón "Activo"
5. Confirmar que el badge de estado cambia a activo
6. Verificar perfil público en `/dealers/[slug]`

---

## 14. Veredicto final

**APTO CON INCIDENCIAS**

El dashboard interno está funcional para las operaciones core del marketplace (aprobar dealers, aprobar vehículos, cambiar estados, gestionar planes, ver leads por dealer, analíticas globales). Los dos bugs de mayor impacto han sido corregidos. Las incidencias pendientes (INC-003, INC-004, INC-005) no bloquean operación diaria pero deben resolverse antes de escalar el equipo operativo.
