# Verificación E2E de tiers — 2026-07-28

> **Actualización 2026-07-29:** F-D-01, F-D-02 y F-D-04 han sido corregidos y reverificados. F-D-03 permanece abierto y fuera del alcance de esta corrección. Véase el anexo al final del documento.

## Alcance y método

Verificación contra producción (`blacklabelmarket.es`) y la base de datos Supabase conectada al entorno local. Stripe se mantuvo en modo test. No se consultaron ni modificaron dealers existentes.

- Se crearon tres showrooms y cuentas de prueba directamente con el cliente de servicio de Supabase. Este camino evitó el workflow de alta y, con ello, cualquier correo o notificación a terceros.
- Cada showroom tiene organización, sede, miembro `owner` y suscripción mensual activa del plan correspondiente. Las suscripciones son registros de prueba, no cobros.
- Se insertaron vehículos de prueba identificables con prefijo `TEST` para comprobar el límite en la barrera real de base de datos (`trg_enforce_active_vehicle_limit`).
- Se verificaron las pantallas Essential autenticadas en producción y se contrastaron todos los gates con el código desplegado y los valores reales de `plans`, `plan_limits` y `plan_features`.
- Se creó una sesión de Stripe Checkout en modo test para el boost Elite. Stripe la devolvió abierta, pero el navegador integrado devolvió “Something went wrong / page not found” al abrir su URL; por tanto no se introdujo la tarjeta de prueba ni se confirmó el pago. No se afirma como E2E completado.

## Resultado ejecutivo

Hay cuatro fallos de lanzamiento y un checkout E2E pendiente:

1. **Crítico — el downgrade no pausa el exceso de inventario.** Con 50 vehículos Professional, cambiar el plan efectivo a Essential mantuvo los 50 en `active`.
2. **Alto — la lista pública de showrooms no materializa el destacado Elite.** El webhook activa `organizations.is_featured`, pero la página pública ordena y etiqueta desde `dealers.is_featured`.
3. **Alto — se muestran o prometen capacidades `future`.** Citas Elite, stock/feed, ventana exclusiva de 24 h y la sugerencia de mejora están expuestas a usuarios pese al documento de planes.
4. **Medio — la navegación muestra enlaces a funciones no incluidas.** El contenido está bloqueado, pero Essential ve CSV, A la carta y Citas en el menú.
5. **Pendiente — boost pagado Stripe.** La sesión test se creó correctamente, pero el checkout no pudo abrirse desde el navegador de prueba; no se verificó `is_featured` ni su expiración por el camino de pago.

## Datos de prueba creados

| Plan | Dealer ID | Organización ID | Suscripción ID | Inventario creado |
|---|---|---|---|---:|
| Essential | `e904f9a1-77af-4763-9c90-b74cf6ccfc16` | `fc759cf6-c584-4361-8fbd-b7a57287a32d` | `d1a7c2c0-41e5-4a7a-94cc-4cebd700e523` | 15 activos + 1 borrador |
| Professional | `2f6b46bc-90d4-441d-8f4d-0c2ccb3013f7` | `ee6f42ce-afb1-4cfa-9170-80c3124759f1` | `9d3478f4-fb6c-4841-89c4-cde5791f4533` | 50 activos + 1 borrador |
| Elite | `2bff7e8c-fcf4-48ed-832e-e6b571c5e92b` | `83f5f402-e901-413f-a857-8e4dba65bac6` | `e6a959c4-3549-49ba-acfd-e2e13f2f0104` | 100 activos + 1 borrador |

Los tres perfiles usan correos `test-verif-tier-<plan>@example.com`. No se han borrado y se deben eliminar, junto con sus vehículos, antes del lanzamiento real si ya no se necesitan.

También quedó en Stripe **test** el cliente `cus_Uy4YFOgvuNVJPM` y una sesión de checkout abierta `cs_test_a1vcMaFzGe5cUMSblqj6ZP6BRXlB7stGWXV0Yqhfn5wgXoGeP2kKrDfZZP` para el vehículo Elite `5cfe5546-6c88-4c55-b194-aea0c89085e5`. No hay pago confirmado ni activación de boost asociada.

## Checklist por plan

### D1 — Essential

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Máximo 15 vehículos activos | ✅ Confirmado | Se insertaron 15 activos; el 16.º fue rechazado por PostgreSQL: `VEHICLE_LIMIT_REACHED: limite de 15 vehiculos activos alcanzado para el plan essential`. |
| Solo inventario manual, sin CSV/feed | ✅ Confirmado | Producción muestra el bloqueo “Disponible en Professional y Elite” en `/dashboard/importar`; `can(..., 'import_csv')` exige `csv_recurring`. Feed figura `future`. |
| Bandeja simple, no kanban | ✅ Confirmado | `/dashboard/oportunidades` renderiza `LeadsBandeja` cuando `pipeline` no está incluido: [page.tsx](../app/(dashboard)/dashboard/oportunidades/page.tsx:35). |
| Sin agente de cualificación | ✅ Confirmado | `lead_qualification_assistant` está excluido y `future`; [contact-mode.ts](../lib/contact-mode.ts:18) devuelve `classic`. |
| Sin destacado/prioridad | ✅ Confirmado | `showroom_featured` y `showroom_listing_priority` están excluidos en la configuración real del plan. |
| Sin tablón A la carta | ✅ Confirmado | Producción muestra el bloqueo “Disponible en Professional y Elite” en `/dashboard/solicitudes`. |
| Analítica básica de 30 días | ✅ Confirmado | Producción mostró “Básica · 30 días”; [page.tsx](../app/(dashboard)/dashboard/analiticas/page.tsx:113) aplica el límite de fechas en servidor. |
| 1 usuario, 1 sede, 0 boosts incluidos | ✅ Confirmado en entitlements | Los límites de producción son 1/1/0. Los gates de usuario, sede y crédito se resuelven en [entitlements.ts](../lib/entitlements.ts:257). |

### D2 — Professional

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Máximo 50 vehículos activos | ✅ Confirmado | Se insertaron 50 activos; el 51.º fue rechazado por el trigger con límite 50. |
| Manual + CSV | ✅ Confirmado | `csv_recurring` está incluido y operativo; `/api/vehicles/import` rechaza la sesión cuando `can(org, 'import_csv')` es falso: [route.ts](../app/api/vehicles/import/route.ts:319). |
| Pipeline kanban | ✅ Confirmado | `pipeline` está incluido y [oportunidades/page.tsx](../app/(dashboard)/dashboard/oportunidades/page.tsx:59) renderiza `KanbanBoard` para Professional/Elite. |
| Agente de cualificación sin reserva | ⏸️ Confirmado por gate; no activado para el showroom de prueba | `lead_qualification_assistant` está operativo en Professional; la reserva sólo se habilita cuando `appointment_booking` es operativo y existe calendario conectado: [assistant-booking.ts](../lib/assistant-booking.ts:41). El workflow por showroom no se aprovisionó para esta prueba, para no lanzar n8n. |
| Tablón general A la carta | ✅ Confirmado | `vehicles_on_request` usa etiqueta `general_board` y [solicitudes/page.tsx](../app/(dashboard)/dashboard/solicitudes/page.tsx:22) permite Professional. |
| Analítica avanzada de 180 días | ✅ Confirmado | Límite real 180 y tier avanzado por `analytics_advanced`: [analiticas/page.tsx](../app/(dashboard)/dashboard/analiticas/page.tsx:23). |
| 3 usuarios, 1 sede, 1 boost/mes | ✅ Confirmado en entitlements | Valores reales 3/1/1. La provisión de créditos se realiza al `invoice.paid`; no hubo factura real para este registro de prueba. |
| Sin destacado | ✅ Confirmado | `showroom_featured` está excluido. |

### D3 — Elite

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Máximo 100 vehículos activos | ✅ Confirmado | Se insertaron 100 activos; el 101.º fue rechazado con límite 100. |
| Destacado y prioridad en listados | ❌ Falla en el listado público principal | La API `/api/featured-dealers` reconoce el Elite de prueba como `isFeatured:true`, pero la fila `dealers.is_featured` sigue en `false`. [dealers/page.tsx](../app/(public)/dealers/page.tsx:58) ordena por esa columna y separa el bloque “Showrooms destacados” con ella. El webhook sólo actualiza `organizations.is_featured`: [route.ts](../app/api/stripe/webhooks/route.ts:160). |
| Boost pagado con Stripe test; activa y expira | ⏸️ Pendiente | Se creó una sesión Stripe test abierta para un vehículo Elite de prueba. El navegador de QA no pudo cargar Checkout y no se confirmó el pago, de modo que no se verificaron webhook, `is_featured`, `featured_until` ni el cron de expiración. El código sí asigna ambos campos al activar: [boosts.ts](../lib/boosts.ts:128). |
| Analítica de 365 días y comparativas | ✅ Confirmado | Límite real 365 y `analytics_extended_compare` incluido; el server limita la fecha solicitada: [analiticas/page.tsx](../app/(dashboard)/dashboard/analiticas/page.tsx:113). |
| 10 usuarios, 1 sede, 3 boosts/mes | ✅ Confirmado en entitlements | Valores reales 10/1/3. |
| Feed de stock sólo si operativo; si no, `future` | ❌ Se publicita antes de estar operativo | La base de datos marca `feed_sync` como incluido pero `future`; el estado vivo confirma que no hay conector ni job. Sin embargo, [plans-config.ts](../lib/plans-config.ts:116) lo muestra como “Gestión del stock automatizado” incluida y su texto promete conexión de feed/DMS. |
| Google Calendar, scoring y alertas no mostrados mientras son `future` | ❌ Falla | El enlace de Citas está visible para todos y la página Elite promete reserva: [citas/page.tsx](../app/(dashboard)/dashboard/citas/page.tsx:36). Además, el plan público promete “sugerencia de mejora” en [plans-config.ts](../lib/plans-config.ts:129). En producción, `calendar_integration`, `lead_scoring` y `hot_lead_alerts` están marcados `future`; Google OAuth no está configurado. |

## Comprobaciones transversales

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Sólo `active` consume plaza | ✅ Confirmado | Cada showroom conserva un vehículo `draft` adicional sin afectar el conteo. El trigger y [entitlements.ts](../lib/entitlements.ts:153) cuentan exclusivamente `status = 'active'`. |
| Upgrade/downgrade pausa exceso, no borra | ❌ Falla | Con Professional en 50 activos, se cambió su suscripción efectiva a Essential: quedaron 50 activos, 0 pausados. Después se restauró Professional. El cambio manual [setDealerPlan](../app/(admin)/admin/dealers/[id]/page.tsx:49) sólo cambia plan y slots; el webhook de actualización tampoco pausa. |

## Hallazgos accionables

### F-D-01 — Downgrade deja vehículos por encima del límite activos

- **Severidad:** crítica de negocio.
- **Archivos:** [app/api/stripe/webhooks/route.ts:205](../app/api/stripe/webhooks/route.ts:205), [app/(admin)/admin/dealers/[id]/page.tsx:49](../app/(admin)/admin/dealers/[id]/page.tsx:49).
- **Fallo:** ninguno de los dos caminos de cambio de plan detecta el exceso y pausa vehículos. El comentario en `handleSubscriptionDeleted` dice que lo hará un trigger/cron, pero no existe esa implementación en el repositorio.
- **Fix sugerido:** crear una función transaccional `pause_excess_active_vehicles(dealer_id, limit)` que conserve los más recientes/definidos por negocio, y llamarla tras cualquier downgrade de plan (admin, checkout y `customer.subscription.updated`). Registrar la acción en `audit_log`.

### F-D-02 — Destacado Elite no se materializa en el listado público principal

- **Severidad:** alta.
- **Archivos:** [app/api/stripe/webhooks/route.ts:160](../app/api/stripe/webhooks/route.ts:160), [app/(public)/dealers/page.tsx:58](../app/(public)/dealers/page.tsx:58).
- **Fallo:** la compra/alta Elite escribe `organizations.is_featured`; la página pública consulta `dealers.is_featured`. En consecuencia, el showroom puede ser Elite pero quedar fuera del bloque “Showrooms destacados”.
- **Fix sugerido:** elegir una sola fuente de verdad. Preferible: actualizar también `dealers.is_featured` en el webhook y revocarlo al abandonar Elite; alternativamente, cambiar el listado público para derivar el destacado de la organización/entitlement.

### F-D-03 — Funciones `future` expuestas o prometidas

- **Severidad:** alta comercial.
- **Archivos:** [lib/plans-config.ts:116](../lib/plans-config.ts:116), [lib/plans-config.ts:129](../lib/plans-config.ts:129), [lib/plans-config.ts:134](../lib/plans-config.ts:134), [app/(dashboard)/dashboard/citas/page.tsx:36](../app/(dashboard)/dashboard/citas/page.tsx:36), [app/(dashboard)/dashboard/solicitudes/page.tsx:49](../app/(dashboard)/dashboard/solicitudes/page.tsx:49).
- **Fallo:** feed/DMS, sugerencia de mejora/scoring, reservas Google Calendar y la ventana Elite de 24 h se anuncian o funcionan visualmente pese a estar `future` en la fuente de verdad.
- **Fix sugerido:** filtrar toda fila/CTA por `included && availability_status === 'operative'`; ocultar las filas future de precios y las rutas de dashboard hasta su activación explícita. Alinear `plan_features` de producción con el documento si la reserva manual no debe formar parte de la oferta todavía.

### F-D-04 — Navegación muestra capacidades no contratadas

- **Severidad:** media de UX.
- **Archivo:** [components/dashboard/Sidebar.tsx:15](../components/dashboard/Sidebar.tsx:15).
- **Fallo:** Essential ve CSV, A la carta y Citas en el menú, aunque sus páginas muestran correctamente el bloqueo. Esto contradice la expectativa de “sin acceso” y añade fricción.
- **Fix sugerido:** pasar al sidebar el conjunto de entitlements operativos y ocultar los enlaces no disponibles, o diferenciarlos visualmente como mejora de plan.

## Verificación técnica adicional

`npm run lint` finalizó correctamente. Sólo queda un warning preexistente de dependencia de `useEffect` en `app/(dashboard)/dashboard/publicar/page.tsx:223`.

## Anexo de corrección — 2026-07-29

### Estado

| Hallazgo | Estado | Resultado de la reverificación |
|---|---|---|
| F-D-01 — Downgrade | ✅ Corregido | El dealer Professional de prueba pasó temporalmente de 50 vehículos activos a Essential: quedaron exactamente 15 `active` y 35 `paused`, sin borrar ninguno. Una segunda ejecución pausó 0 vehículos, confirmando idempotencia. Después se restauró el dealer a Professional y sus 50 activos. |
| F-D-02 — Destacado Elite | ✅ Corregido | Los cambios de plan por administración y Stripe sincronizan `organizations.is_featured` y `dealers.is_featured`, incluida su revocación. El Elite de prueba quedó destacado y apareció dentro del bloque «Showrooms destacados» de `/dealers`. |
| F-D-03 — Funciones `future` | ⏸️ Sin cambios | Permanece abierto por indicación expresa; no se modificaron las funciones futuras. |
| F-D-04 — Navegación | ✅ Corregido | El menú se filtra en servidor según los entitlements reales y su estado operativo. En sesión Essential no aparecen Importar CSV, A la carta ni Citas; Inventario permanece visible. |

### Cambios aplicados

- Se añadió la función transaccional `pause_excess_active_vehicles`, accesible únicamente con `service_role`. Pausa el exceso y nunca elimina vehículos.
- La función se ejecuta al bajar de plan desde administración, en `customer.subscription.updated` y al procesar `customer.subscription.deleted`.
- La activación o revocación de Elite mantiene sincronizado el destacado de organización y dealer en los caminos de administración, checkout, actualización y cancelación de suscripción.
- El layout del dashboard entrega al sidebar únicamente las secciones incluidas y operativas para el plan efectivo.

### Validación técnica

- Migración `076_pause_excess_vehicles_on_downgrade.sql` aplicada correctamente a Supabase.
- `npm run lint`: correcto; se mantiene únicamente el warning preexistente de `useEffect` en `app/(dashboard)/dashboard/publicar/page.tsx:223`.
- `npm run build`: compilación y comprobación de tipos correctas. El proceso de generación estática terminó después por un fallo del worker de Next.js en Windows (`3221226505`), sin error de código o tipos.
- No se creó ni eliminó ningún dealer, no se enviaron correos y no se reintentó ni modificó el boost de Stripe.
