# Pendientes de configuracion externa

Registro de funcionalidades que ya estan preparadas o concedidas por plan dentro del market, pero cuyo funcionamiento real depende de herramientas externas, webhooks, OAuth, despliegues o procesos que aun no estan conectados.

Ultima actualizacion: **2026-06-17**.

---

## Contexto de gating

- La fuente de verdad de cada plan vive en Supabase: `plans`, `plan_limits`, `plan_features`.
- El acceso se decide por `plan_features.included`.
- `availability_status` (`operative`, `partial`, `future`) indica si la pieza externa esta conectada.
- `public_visible=false` mantiene una feature oculta aunque este preparada internamente.
- El limite de vehiculos publicados se aplica en BD con el trigger `enforce_active_vehicle_limit`.

---

## 0. Despliegue / infraestructura

| Tarea | Herramienta | Detalle |
|---|---|---|
| Aplicar migraciones pendientes | Supabase CLI | `npx supabase db push`: incluye 045 y 046, ademas de las previas pendientes. |
| Desplegar a produccion | Vercel CLI | El auto-deploy GitHub a Vercel esta roto: desplegar con `vercel --prod --yes`. |
| Verificar variables | Vercel | Supabase, Stripe, `NEXT_PUBLIC_APP_URL`, `IMPORT_API_KEY` y secretos de webhooks. |

---

## 1. Stripe

| Tarea | Detalle |
|---|---|
| Crear productos y precios por plan | Essential 197 EUR, Professional 449 EUR, Elite 899 EUR, mensual sin IVA. |
| Crear precios de add-ons | Boost 49 EUR, Pack 5 boosts 199 EUR, +10 vehiculos 59 EUR/mes, +25 vehiculos 99 EUR/mes, Stock automatizado 99 EUR/mes, Diagnostico 149 EUR. |
| Webhook de Stripe | Endpoint `/api/stripe/webhooks` dado de alta en Stripe con el secret correcto. |
| Stripe Tax / IVA | Configurar calculo de IVA en checkout. |

---

## 2. Agente de cualificacion (`lead_qualification_assistant`)

- **Planes:** Professional, Elite.
- **Estado:** activo y concedido.
- **Ya preparado:** el webhook `/api/webhooks/assistant-result` crea leads desde conversaciones del agente y guarda `qualification`.
- **Nota:** cualquier ajuste futuro del proveedor de IA debe hacerse sin cambiar el gating comercial del plan.

---

## 3. Reserva de cita (`appointment_booking`)

- **Planes:** Elite.
- **Estado:** concedido internamente, oculto y en `future` hasta conectar calendarios.
- **Ya preparado en el market:**
  - Feature flag `appointment_booking`.
  - Tabla `showroom_calendar_connections` para proveedor, estado, calendario y reglas de disponibilidad.
  - Tabla `appointments` ampliada con proveedor, evento externo, enlace de reunion, ubicacion y referencia de workflow.
  - Webhook `/api/webhooks/appointment-result` para recibir confirmaciones desde n8n.
- **Pendiente externo:**
  - OAuth Google Calendar / Outlook.
  - Workflow n8n que proponga o confirme cita.
  - Emails/WhatsApp de confirmacion.
  - Marcar `appointment_booking` como `operative`.

---

## 4. Scoring, alertas y seguimiento comercial Elite

- **Planes:** Elite.
- **Estado:** concedido internamente, oculto y en `future` hasta conectar IA/n8n.
- **Features internas preparadas:** `lead_scoring`, `hot_lead_alerts`, `calendar_integration`.
- **Ya preparado en el market:**
  - Campos en `leads`: `lead_score`, `score_reason`, `score_confidence`, `recommended_next_action`, `scored_at`, `last_commercial_touch_at`, `next_follow_up_at`.
  - Tabla `lead_alerts` para lead caliente sin atender, cita proxima o follow-up pendiente.
  - Webhook `/api/webhooks/hot-lead-alert` para que n8n cree alertas.
  - `/api/webhooks/assistant-result` acepta score, motivo, confianza y proxima accion.
- **Pendiente externo:**
  - Prompt/modelo de scoring.
  - Workflow n8n que puntue leads, cree alertas y marque follow-ups.
  - Activar flags solo cuando el flujo este validado.

---

## 5. Stock automatizado / feed-DMS (`feed_sync`)

- **Planes:** Elite incluido; Essential/Professional como add-on.
- **Pendiente externo:**
  - Conector feed/DMS.
  - Job recurrente de sincronizacion.
  - Validacion tecnica del feed.

---

## 6. Ventana exclusiva 24 h a la carta (`vehicles_on_request_priority`)

- **Planes:** Elite.
- **Estado:** visible y concedido; matcher pendiente.
- **Pendiente externo:**
  - Matcher/temporizador que reserve 24 h antes de abrir al resto del market.
  - Avisos al showroom.

---

## 7. Avisos por email y flujos n8n

- Proveedor de email transaccional.
- Flujos n8n para vehiculo aprobado/rechazado, nuevas oportunidades a la carta, citas y lead caliente sin atender.
- Ver `docs/backlog-alertas-y-vehiculos-a-la-carta.md`.

---

## 8. SMTP propio para Auth

- **Estado:** flujo de recuperacion construido (`/recuperar` -> `/auth/confirm` -> `/reset-password`).
- **Pendiente:** configurar SMTP propio en Supabase para evitar limite del SMTP por defecto.
- Guia: `docs/configuracion-email-smtp.md`.

---

## Procedimiento al completar una pieza

1. Conectar herramienta externa / credenciales.
2. Validar workflow en staging o con showroom interno.
3. Marcar la feature como `availability_status='operative'`.
4. Si procede, cambiar `public_visible=true`.
5. Quitar o actualizar la fila de este documento.
