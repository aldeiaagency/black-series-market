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

## Pendiente conocido
- `lead.created` desde el **asistente** (Elite) puede venir sin `vehicle_id`: el
  lookup falla y el email al dealer no se construye (degrada con texto genérico).
  Cuando se active el asistente, añadir fallback de lookup por `dealer_id`.
- Mojibake (`é`→`�`, `€`→`?`) en los nodos de email a **dealers** (Lead/Vehículo
  aprobado/rechazado) y en algunos **nombres** de nodos: limpieza pendiente.
