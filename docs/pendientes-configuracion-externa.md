# Pendientes de configuración externa

> Registro de las funcionalidades que **ya están concedidas por plan y visibles** en el
> market (web pública + dashboard del showroom), pero cuyo **funcionamiento real depende
> de herramientas externas, webhooks, OAuth, despliegues o procesos que aún no están
> conectados**. Cuando se complete cada tarea de aquí, la funcionalidad queda perfecta.
>
> Decisión (2026-06-16): todo lo que vive dentro del market se configura por plan y se
> muestra sin etiquetas de "Próximamente". Lo único que queda pendiente es lo de aquí.
> Al conectar cada pieza **no hace falta tocar el gating** (la feature ya está incluida en
> su plan): solo conectar la herramienta y marcar su `availability_status = 'operative'`.

Última actualización: **2026-06-16**.

---

## Cómo funciona el gating (contexto)

- La **fuente de verdad** de qué incluye cada plan vive en Supabase: `plans`, `plan_limits`,
  `plan_features`. `lib/entitlements.ts` lo lee y la UI lo consume.
- **El acceso se decide por `plan_features.included` por plan**, NO por `availability_status`.
  `availability_status` (`operative` | `partial` | `future`) es **solo informativo**: indica
  si el backend de esa feature está realmente conectado. No oculta nada al showroom.
- El **límite de vehículos activos** se aplica en BD con el trigger `enforce_active_vehicle_limit`
  (migración 040): es la barrera real e imposible de saltar, con diseño fail-open.

---

## 0. Despliegue / infraestructura (hacer primero)

| Tarea | Herramienta | Detalle |
|---|---|---|
| Aplicar migraciones pendientes | Supabase CLI | `npx supabase db push` — incluye 038 (clasificación features), 040 (trigger límite vehículos) y las previas no aplicadas. Revisar que 039 (otro trabajo) entra en orden. |
| Desplegar a producción | Vercel CLI | El auto-deploy GitHub→Vercel está roto: desplegar con `vercel --prod --yes`. |
| Verificar variables de entorno | Vercel | Claves Supabase, Stripe, `NEXT_PUBLIC_APP_URL`, `IMPORT_API_KEY`. |

---

## 1. Stripe (cobro de suscripciones y add-ons)

| Tarea | Detalle |
|---|---|
| Crear productos y precios por plan | Essential 197 € · Professional 449 € · Elite 899 € (mensual, sin IVA — el IVA lo añade Stripe Tax o se configura aparte). Guardar los `price_id` en `plans.stripe_monthly_price_id` y en env (`STRIPE_PRICE_*_MONTHLY`). |
| Crear precios de add-ons | Boost 49 €, Pack 5 boosts 199 €, Bloque +10 (59 €/mes), Bloque +25 (99 €/mes), Stock automatizado (149 €/mes), Diagnóstico (149 €). |
| Webhook de Stripe | Endpoint `/api/stripe/webhooks` dado de alta en Stripe con el secret correcto; eventos de checkout/subscription. |
| Stripe Tax / IVA | Configurar el cálculo de IVA en el checkout (los precios se muestran "+ IVA"). |

---

## 2. Agente de cualificación en la ficha (`lead_qualification_assistant`)

- **Planes:** Professional, Elite. **Estado:** visible y concedido · backend de IA pendiente.
- **Tareas:**
  - Proveedor de IA conversacional (prompt de cualificación: intención, presupuesto, plazo).
  - Endpoint que reciba la conversación de la ficha y escriba el resultado en `leads.qualification`
    (estructura ya consumida por `oportunidades`: `score`, `intent`, `budget_range`, `timeline`, `summary`).
  - Flujo n8n opcional para orquestar y registrar.
  - Activar por showroom (`assistant_feature_flags`) y marcar `availability_status='operative'`.

---

## 3. Reserva de cita del agente (`appointment_booking`)

- **Planes:** Elite. **Estado:** visible y concedido · OAuth pendiente.
- **Tareas:**
  - OAuth de Google Calendar por showroom (alta de credenciales + flujo de consentimiento).
  - Escritura del evento en el calendario del showroom desde la conversación cualificada.
  - (Posterior) soporte Outlook.

---

## 4. Stock automatizado / feed-DMS (`feed_sync`)

- **Planes:** Elite (incluido) · Essential/Professional (add-on de pago).
- **Tareas:**
  - Conector de feed/DMS por proveedor (formatos de inventario).
  - Job de sincronización recurrente (cron/n8n) que cree/actualice vehículos.
  - Validación técnica del feed en el alta del add-on.

---

## 5. Ventana exclusiva de 24 h en vehículos a la carta (`vehicles_on_request_priority`)

- **Planes:** Elite. **Estado:** visible y concedido · matcher pendiente.
- **Tareas:**
  - Lógica de matcher/temporizador que reserve 24 h la oportunidad al showroom Elite antes
    de abrirla al resto (proceso/cron interno).
  - Avisos al showroom (ver sección 6).

---

## 6. Avisos por email y flujos n8n

- **Tareas:**
  - Proveedor de email transaccional (lead caliente sin atender, nuevas oportunidades a la
    carta, confirmación de cita, vehículo aprobado/rechazado).
  - Flujos n8n que reaccionen a los webhooks ya emitidos (`vehicle.approved`, etc.).
  - Ver `docs/backlog-alertas-y-vehiculos-a-la-carta.md` para el detalle de alertas y matcher.

---

## Procedimiento al completar una pieza

1. Conectar la herramienta/credenciales.
2. Marcar `availability_status = 'operative'` en `plan_features` (migración o panel admin).
3. Quitar la fila correspondiente de este documento.
