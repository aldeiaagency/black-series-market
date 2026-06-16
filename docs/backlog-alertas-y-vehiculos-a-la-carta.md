# Backlog — Vehículos a la carta y Mis alertas

> Configuraciones pendientes para dejar **perfectamente definidos y conectados** los dos
> flujos de captación de demanda. Última revisión: **2026-06-16**.
> Leyenda: 🟢 montado · 🟡 parcial/manual · 🔴 falta.

---

## 0. Infraestructura común (afecta a los dos flujos)

Los dos flujos ya **registran** los datos y **emiten un evento** a una bandeja de salida
(`integration_events`). El problema es la entrega:

- 🟢 Bandeja de salida `integration_events` — se escribe siempre (duradera).
- 🔴 **Webhook a n8n sin configurar** — falta la variable de entorno `N8N_WEBHOOK_URL`
  (y `N8N_WEBHOOK_SECRET`). Sin ella no hay entrega en tiempo real.
- 🔴 **Nadie consume la bandeja** — no hay poller/cron ni workflow que lea los eventos
  `pending`. Hoy los eventos se quedan guardados y **no salen a ningún sitio**.

**Eventos que ya emite la plataforma:** `lead.created`, `custom_request.created`,
`search_alert.created`, `vehicle.submitted_for_review`, `vehicle.approved`,
`vehicle.rejected`.

**Decisión pendiente (tooling):** no se usará GHL. La capa de automatización/avisos se
hará con **n8n + Airtable**. Dos formas de conectar el flujo de eventos:
- **(a)** configurar `N8N_WEBHOOK_URL` → entrega en tiempo real, o
- **(b)** que n8n/Airtable **lea periódicamente** la bandeja `integration_events`.

---

## 1. Vehículos a la carta

Petición puntual tipo concierge. Gestión prevista: **manual por el equipo interno**.

### Flujo paso a paso
```
[1] Formulario web (/vehiculos-a-la-carta) ..................... 🟢
[2] Se guarda en `custom_requests` (estado: new) .............. 🟢
[3] Confirmación en pantalla (/solicitud-enviada) ............. 🟢
[4] Evento `custom_request.created` → bandeja de salida ....... 🟢
[5] Email "hemos recibido tu solicitud" al comprador ......... 🔴
[6] Equipo ve la solicitud en /admin/solicitudes ............. 🟢
[7] Gestión de estados: new → in_review → contacted .......... 🟢 (manual)
[8] MATCH → marca la solicitud como `matched` ................ 🟢 (solo cambia estado)
      ├─ emite evento al hacer match ......................... 🔴
      └─ campo para enlazar el vehículo encontrado ........... 🔴
[9] Aviso al comprador "lo hemos encontrado" ................. 🟡 manual / 🔴 automático
[10] Cierre: closed / discarded .............................. 🟢
```

### Aviso a los showrooms (nueva solicitud)
- 🔴 **No existe ningún proceso.** Los dealers no ven las solicitudes a la carta
  (su panel "Oportunidades" solo muestra sus propios leads de ficha, no estas solicitudes),
  no reciben notificación ni hay evento dirigido a ellos.
- 🟡 Hoy el contacto al showroom es **manual y fuera de la plataforma** (el equipo decide a
  qué showrooms escribir).
- Niveles para montarlo en el futuro: (1) feed en el dashboard del dealer con solicitudes
  compatibles por marca/tipo · (2) notificación automática a dealers compatibles ·
  (3) mixto: el equipo valida y luego lo lanza a los dealers seleccionados (recomendado).

### Pendiente
**Plataforma (código):**
- [ ] Emitir evento `custom_request.matched` (o `status_changed`) al cambiar de estado.
- [ ] Campo en `/admin/solicitudes` para pegar el **enlace del vehículo encontrado** (va en el evento).

**Automatización (Airtable + n8n):**
- [ ] Conectar la salida de eventos (webhook o lectura de la bandeja).
- [ ] Email de **acuse de recibo** al comprador (paso 5).
- [ ] Email de **"lo hemos encontrado"** con enlace (paso 9 automático).
- [ ] (Opcional) Tablero en Airtable espejo de las solicitudes.

---

## 2. Mis alertas (search alerts)

Búsqueda guardada que **debería avisar sola** cuando aparece un coche que encaja.
Función automática por naturaleza.

### Flujo paso a paso
```
[1] Crear alerta (buscador /coches o /motos) ................. 🟢 (logueado o anónimo)
[2] Se guarda en `search_alerts` ............................. 🟢
[3] Evento `search_alert.created` → bandeja de salida ........ 🟢
[4] Evento sale a n8n ........................................ 🔴 (webhook sin configurar)
[5] Email "alerta creada correctamente" ...................... 🔴
[6] Gestión de la alerta:
      ├─ logueado → ve/borra en /cuenta/alertas .............. 🟢
      └─ anónimo → sin gestión ni enlace de baja ............. 🔴
[7] CRUCE coche nuevo ↔ alerta (matcher) ⭐ .................. 🔴  ← pieza clave, no existe
[8] Email "ha aparecido un coche que coincide" (con enlace) .. 🔴
[9] Admin ve todas las alertas (/admin/alertas) .............. 🟢
```

### Pendiente
**Plataforma (código):**
- [ ] **Matcher** (paso 7): al aprobarse/publicarse un vehículo, cruzarlo contra las alertas
      activas y generar el aviso (o emitir `search_alert.matched`). *Es lo más importante:
      hoy guardas una alerta y nunca te llega nada.* Gancho previsto: evento `vehicle.approved`.
- [ ] Enlace de **baja** para alertas anónimas (cumplimiento + UX).

**Automatización (Airtable + n8n):**
- [ ] Conectar la salida de eventos (webhook o lectura de la bandeja).
- [ ] Email de **confirmación** de alerta (paso 5).
- [ ] Email de **"coche encontrado"** con enlace (paso 8).

---

## Resumen ejecutivo

| | Captura | Almacenamiento | Gestión interna | Aviso al usuario | Conexión n8n/Airtable |
|---|---|---|---|---|---|
| **Vehículos a la carta** | 🟢 | 🟢 | 🟢 | 🟡 manual / 🔴 auto | 🔴 |
| **Mis alertas** | 🟢 | 🟢 | 🟢 (logueado) | 🔴 (no hay matcher) | 🔴 |

**Lo construido:** captura, almacenamiento y gestión interna de los dos flujos.
**Lo que falta:** la **capa de avisos** (emails) y, en alertas, el **cruce automático**;
todo apoyado en conectar la salida de eventos a **n8n + Airtable**.
