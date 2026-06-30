# Agente cualificador — Reserva de cita · Fase A (Google Calendar OAuth)

> **Estado:** plan para el futuro. La **Fase B** (ventanas de disponibilidad manual,
> sin OAuth) ya está **operativa** (ver más abajo "Qué hay hoy"). La Fase A añade la
> sincronización real con el Google Calendar del showroom. El entitlement
> `calendar_integration` permanece en `future` hasta construir esta fase.

## Qué hay hoy (Fase B, operativa)

- Entitlement `appointment_booking` = **operativo** en Elite/Grupo (migración 054).
- El showroom define su disponibilidad en **Dashboard → Citas** (`/dashboard/citas`),
  que escribe en `showroom_calendar_connections` con `provider='manual'`,
  `status='connected'`, `availability_rules` y `booking_settings`.
- El agente de la ficha (Elite/Grupo) muestra **"Reservar visita"**; los huecos se
  calculan de la disponibilidad (`GET /api/assistant/availability`) y la reserva se
  crea en `POST /api/assistant/book` → fila en `appointments` (`provider='manual'`,
  `status='confirmed'`) + `lead` a estado `appointment` + evento `appointment.created`
  a n8n → **email al comprador y al showroom con enlaces "Añadir a Google/Outlook
  Calendar"** + aviso Slack. Sin OAuth: los enlaces de calendario los añade el usuario
  con un clic.

## Qué añade la Fase A

Conexión **real** del Google Calendar del showroom para: (1) leer su disponibilidad
real (free/busy) y no ofrecer huecos ya ocupados fuera del market, y (2) **crear el
evento automáticamente** en su calendario (con Google Meet e invitación a ambas
partes), en lugar de un enlace "añadir a calendario".

### 1. Google Cloud + OAuth
- Crear proyecto en Google Cloud Console + **OAuth 2.0 Client (Web)**.
- **Scopes:** `https://www.googleapis.com/auth/calendar.events` (crear/editar eventos)
  y `https://www.googleapis.com/auth/calendar.freebusy` (consultar disponibilidad).
  Son scopes **sensibles** → requieren **verificación de Google** (pantalla de
  consentimiento en revisión; sin verificar funciona con aviso y tope de 100 cuentas,
  válido para piloto). Redirect URI: `https://blacklabelmarket.es/api/calendar/google/callback`.
- Guardar `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` en env de Vercel.

### 2. Almacenamiento de tokens (falta en el esquema)
La tabla `showroom_calendar_connections` ya existe pero **no tiene columnas para
tokens**. Añadir (migración nueva), cifrados (pgcrypto/Supabase Vault o cifrado a
nivel de app): `access_token`, `refresh_token`, `token_expires_at`, `scope`.
El resto de columnas ya sirven: `provider='google_calendar'`, `status` (pending→
connected→error/disconnected), `external_account_email`, `calendar_ref` (calendar id),
`last_synced_at`.

### 3. Flujo de conexión (dashboard)
- En **Dashboard → Citas**, junto a la opción "manual", botón **"Conectar Google
  Calendar"** → `GET /api/calendar/google/connect` (redirige a Google con `state`
  firmado = dealer_id) → callback `GET /api/calendar/google/callback` intercambia el
  code por tokens, guarda la conexión (`provider='google_calendar'`, `status='connected'`,
  email + calendar id), y permite elegir el calendario destino.
- Manejo de **refresh** (renovar access_token con el refresh_token) y de **revocación**
  (si Google devuelve `invalid_grant` → `status='error'`, avisar al showroom).

### 4. Disponibilidad y reserva (cambios)
- `getDealerBookingContext`: si la conexión es `google_calendar`, calcular huecos =
  ventanas de `availability_rules` **menos** los `busy` reales (Calendar `freebusy`).
- Al reservar: en vez de (o además de) el enlace, **crear el evento** vía Google
  Calendar API (`events.insert`, con `conferenceData` para Meet y `attendees` =
  comprador + showroom). Guardar `external_event_id` en `appointments` (la columna ya
  existe). La llamada a Google puede hacerse desde el market o delegarse a **n8n**
  (que ya tiene el webhook `appointment-result` para persistir el resultado:
  `provider='google_calendar'`, `external_event_id`, `meeting_url`).
- `appointments.provider` y el webhook `appointment-result` ya contemplan
  `google_calendar` (no requieren cambios de esquema).

### 5. Activación
- Poner `calendar_integration` = **operative** en Elite/Grupo (`plan_features`) cuando
  esté construido y verificado. (`appointment_booking` ya está operativo desde la Fase B.)

## Resumen de lo que falta para la Fase A
1. Proyecto Google Cloud + OAuth client + verificación de scopes.
2. Migración: columnas de token cifradas en `showroom_calendar_connections`.
3. Rutas `/api/calendar/google/{connect,callback}` + refresh/revocación.
4. UI en Dashboard → Citas: "Conectar Google Calendar" + selección de calendario.
5. free/busy real en el cálculo de huecos + creación de evento (market o n8n).
6. Flip de `calendar_integration` a operative.

Outlook (Microsoft Graph) sería un paso posterior análogo (el esquema ya admite
`provider='outlook_calendar'`).
