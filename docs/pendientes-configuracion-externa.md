# Pendientes de configuración externa

> Registro de las funcionalidades que **ya están concedidas por plan y visibles** en el
> market (web pública + dashboard del showroom), pero cuyo **funcionamiento real depende
> de herramientas externas, webhooks, OAuth o procesos que aún no están conectados**.
>
> Decisión (2026-06-16): todo lo que vive dentro del market se configura por plan y se
> muestra sin etiquetas de "Próximamente". Lo único que queda pendiente es el enganche
> externo que se lista aquí. Cuando se conecte cada pieza, **no hace falta tocar el gating**
> (la feature ya está marcada como incluida en su plan): solo conectar la herramienta y,
> si procede, marcar su `availability_status` como `operative` en `plan_features`.

Última actualización: **2026-06-16**.

---

## Cómo funciona el gating (contexto)

- La **fuente de verdad** de qué incluye cada plan vive en Supabase: `plans`, `plan_limits`,
  `plan_features`. El helper `lib/entitlements.ts` lo lee y la UI lo consume.
- **La visibilidad/acceso se decide por `plan_features.included` por plan**, NO por
  `availability_status`. El campo `availability_status` (`operative` | `partial` | `future`)
  es **solo informativo**: indica si el backend de esa feature está realmente conectado.
  Sirve para este doc y para que el admin lo muestre, pero no oculta nada al showroom.

---

## Pendiente de enganche externo

| Feature (`feature_key`) | Planes que la incluyen | Qué falta conectar | Estado |
|---|---|---|---|
| `lead_qualification_assistant` — Agente de cualificación en la ficha | Professional, Elite | Proveedor de IA conversacional (prompt + endpoint) y, si aplica, webhook n8n que reciba la conversación y escriba la cualificación en `leads.qualification`. | Visible y concedido por plan · backend de IA pendiente |
| `appointment_booking` — Agente con reserva de cita | Elite | OAuth de Google Calendar por showroom (alta de credenciales + flujo de consentimiento) y escritura del evento en el calendario del showroom. Outlook posterior. | Visible y concedido por plan · OAuth pendiente |
| `feed_sync` — Stock automatizado (feed/DMS) | Elite (incluido) · Essential/Professional (add-on de pago) | Conector de feed/DMS (formatos por proveedor) + job de sincronización recurrente. | Visible y concedido por plan · conector pendiente |
| `vehicles_on_request_priority` — Ventana exclusiva de 24 h en vehículos a la carta | Elite | Lógica de matcher/temporizador que reserva 24 h la oportunidad al showroom Elite antes de abrirla al resto (proceso/cron interno + avisos). | Visible y concedido por plan · matcher pendiente |

---

## Notas

- Los **avisos por email** (lead caliente sin atender, nuevas oportunidades a la carta, etc.)
  dependen del envío transaccional y de flujos n8n: ver `docs/backlog-alertas-y-vehiculos-a-la-carta.md`.
- Cuando se conecte una pieza: marcar su `availability_status = 'operative'` en `plan_features`
  (vía migración o panel admin) y quitarla de esta tabla.
