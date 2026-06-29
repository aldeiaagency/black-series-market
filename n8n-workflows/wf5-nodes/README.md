# WF5 — código canónico de los nodos de email (Router de Eventos)

> **El workflow vivo en n8n es la fuente de verdad** (ID `mgGKQ9r8wkC3shwz`).
> `../wf5-events-router.json` es una referencia histórica **divergida** (usa nodos
> Resend; el vivo usa `emailSend` con SMTP Hostinger, credential `89HQYy0shv3FbifN`).
> Estos ficheros contienen el `jsCode` corregido de los nodos de preparación, tal
> como están desplegados en producción (verificados E2E el 2026-06-26).

## Cómo editar WF5 sin romper UTF-8
NO usar PowerShell `Invoke-RestMethod` + `ConvertTo-Json` (lento y corrompe acentos →
mojibake). Usar **Node** (`fetch` nativo): GET workflow → reemplazar
`node.parameters.jsCode` (leído de fichero UTF-8) → `PUT` solo
`{ name, nodes, connections, settings }`. API: `GET/PUT /api/v1/workflows/{id}`,
header `X-N8N-API-KEY`.

## Nodos de preparación (code)
| Fichero | Nodo n8n | Evento del market |
|---|---|---|
| `alert-prep.js` | Alerta - Preparar confirmación | `search_alert.created` |
| `custom-request-prep.js` | Custom Request - Preparar confirmación | `custom_request.created` |
| `lead-prep.js` | Lead - Preparar emails | `lead.created` |
| `veh-approved-prep.js` | Vehículo aprobado - Preparar email | `vehicle.approved` |
| `veh-rejected-prep.js` | Vehículo rechazado - Preparar email | `vehicle.rejected` |

`vehicle.approved`/`vehicle.rejected` los emite la server action de
`app/(admin)/admin/vehiculos/[id]/page.tsx`, que **sí** incluye `dealer_email`,
`vehicle_title` y `vehicle_slug` en el payload (no necesitan lookup). La API
`app/api/admin/vehicles/[id]/reject/route.ts` es una vía alterna que NO manda
`dealer_email` — si se usa, el email de rechazo no saldría (revisar si está en uso).

El market envía el contacto del comprador en **`data.contact.{name,email,phone}`**
(no en `data.email`). Ese fue el bug que impedía enviar los acuses de alerta y de lead.

## Nodo de lookup para `lead.created`
`lead.created` solo trae `vehicle_id` + `dealer_id`. El nodo **"Lead - Buscar
vehiculo y dealer"** (`httpRequest`, justo entre el Router salida 0 y "Lead -
Preparar emails") resuelve título del vehículo + nombre/email del dealer con una
sola query embebida de PostgREST:

- **Method**: GET
- **URL**: `={{ $env.SUPABASE_URL + '/rest/v1/vehicles?id=eq.' + $json.vehicleId + '&select=brand_name,model_name,year,slug,dealer:dealers(name,email)' }}`
- **Headers**: `apikey: {{ $env.SUPABASE_SERVICE_KEY }}` · `Authorization: Bearer {{ $env.SUPABASE_SERVICE_KEY }}` · `Accept: application/vnd.pgrst.object+json`
- `continueOnFail: true`

⚠️ Con ese `Accept`, n8n recibe un content-type que no parsea como JSON, así que el
cuerpo llega como **string** en `$json.data`. Por eso `lead-prep.js` hace
`JSON.parse(look.data)` antes de leer los campos.

## Avisos a Slack (WF5)
Los prep de **lead** y **a la carta** generan también un campo `slackPayload` (`{ text }`).
Dos nodos `httpRequest` ("Lead - Slack aviso" y "Custom Request - Slack aviso"), en
paralelo a los emails, hacen `POST {{ $env.SLACK_WEBHOOK_URL }}` con
`body = {{ JSON.stringify($json.slackPayload) }}` y `continueOnFail: true`.
Mismo patrón que los nodos Slack de WF1–WF4. `SLACK_WEBHOOK_URL` se fija en el
servicio `aldeia_n8n` (env). Verificado E2E (Slack responde `ok`).

## Pendiente conocido
- `lead.created` desde el **asistente** (Elite) puede venir sin `vehicle_id`: el
  lookup falla y el email al dealer no se construye (degrada con texto genérico).
  Cuando se active el asistente, añadir fallback de lookup por `dealer_id`.
- ✅ Mojibake en el **contenido** de los emails: limpiado en todos los nodos
  (2026-06-26, verificado: ningún `jsCode` contiene `�`). Los **nombres** de
  algunos nodos aún tienen mojibake, pero son internos y no aparecen en los emails
  (renombrarlos exigiría reescribir `connections`; sin beneficio para el usuario).
