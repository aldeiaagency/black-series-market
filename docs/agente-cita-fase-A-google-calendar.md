# Agente cualificador — Reserva de cita · Fase A (Google Calendar OAuth)

> **Estado:** código **construido y desplegado**, pendiente de credenciales reales de
> Google y de verificación manual con un dealer piloto conectado. La **Fase B**
> (ventanas de disponibilidad manual, sin OAuth) sigue **operativa** y sigue siendo el
> horario base incluso con Google conectado (ver "Qué hay hoy"). El entitlement
> `calendar_integration` permanece en `future` hasta esa verificación manual — es el
> único paso que falta, y solo lo puede dar el dueño del producto (ver §1 y §5).

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

## Qué añade la Fase A (construido)

Conexión **real** del Google Calendar del showroom para: (1) leer su disponibilidad
real (free/busy) y no ofrecer huecos ya ocupados fuera del market, y (2) **crear el
evento automáticamente** en su calendario (con Google Meet e invitación a ambas
partes), además del enlace "añadir a calendario" (que se mantiene como fallback).

### 1. Google Cloud + OAuth — ÚNICO PENDIENTE REAL
- Falta crear el proyecto en Google Cloud Console + **OAuth 2.0 Client (Web)** — esto
  lo tiene que hacer el dueño del producto, no se puede generar por código.
- **Scopes:** `https://www.googleapis.com/auth/calendar.events` (crear/editar eventos)
  y `https://www.googleapis.com/auth/calendar.freebusy` (consultar disponibilidad).
  Son scopes **sensibles** → requieren **verificación de Google** (pantalla de
  consentimiento en revisión; sin verificar funciona con aviso y tope de 100 cuentas,
  válido para piloto). Redirect URI: `https://blacklabelmarket.es/api/calendar/google/callback`.
- Guardar `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` en env de Vercel
  (`GOOGLE_OAUTH_STATE_SECRET` y `GOOGLE_TOKEN_ENCRYPTION_KEY` ya están generados y
  configurados — solo faltan estas dos). Mientras `GOOGLE_OAUTH_CLIENT_ID` no exista,
  el botón "Conectar Google Calendar" permanece oculto en Dashboard → Citas.

### 2. Almacenamiento de tokens — hecho
Migración `074_calendar_google_oauth_tokens.sql` añadió a `showroom_calendar_connections`:
`access_token`, `refresh_token` (cifrados AES-256-GCM en la capa de aplicación,
`lib/google-calendar.ts`), `token_expires_at`, `scope`. El resto de columnas ya
servían: `provider='google_calendar'`, `status` (pending→connected→error/disconnected),
`external_account_email`, `calendar_ref` (calendar id), `last_synced_at`.

### 3. Flujo de conexión (dashboard) — hecho
- En **Dashboard → Citas**, junto a la disponibilidad manual (que sigue siendo la
  plantilla de horario base), sección "Google Calendar" con botón **"Conectar"** →
  `GET /api/calendar/google/connect` (redirige a Google con `state` firmado HMAC =
  dealer_id) → callback `GET /api/calendar/google/callback` intercambia el code por
  tokens, lee el calendario principal (su id = el email de la cuenta) y guarda la
  conexión (`provider='google_calendar'`, `status='connected'`).
- Refresh automático (`getValidAccessToken`, con margen de 5 min) y revocación: si
  Google devuelve `invalid_grant` → `status='error'` + `error_message`, la UI lo
  muestra con opción de reconectar. Botón "Desconectar" revoca en Google (best-effort)
  y limpia los tokens.

### 4. Disponibilidad y reserva — hecho
- `computeSlots` pasó de excluir por instante exacto a excluir por **solapamiento de
  rangos** — necesario porque los bloques de `freebusy` son rangos, no instantes.
- `getDealerBookingContext` prioriza una fila `google_calendar` conectada sobre la
  `manual` para el gating, pero el horario semanal (`availability_rules`) sigue
  saliendo siempre de la fila `manual` — Google solo resta huecos ocupados encima.
- `getBusyRanges` (en `lib/assistant-booking.ts`) combina citas internas + `freeBusy`
  real (`lib/google-calendar.ts::getFreeBusy`, con fallback silencioso a `[]` si falla).
- `POST /api/assistant/book`: si `ctx.provider === 'google_calendar'`, crea el evento
  real (`createEvent`, con `conferenceData` para Meet + `attendees`), guarda
  `external_event_id`/`meeting_url` en la fila de `appointments`. Un fallo de Google
  se traga — la reserva ya hecha en la BD nunca se convierte en error para el comprador.

### 5. Activación — pendiente de verificación manual
- `calendar_integration` sigue en `future` en `plan_features`. Subirlo a `operative`
  es deliberadamente el último paso: solo debe hacerse tras conectar un calendario de
  Google real con un dealer piloto y verificar manualmente que free/busy y la creación
  de eventos funcionan de extremo a extremo (ver checklist de verificación abajo).

## Verificación pendiente (con credenciales reales de Google)
1. Conectar un calendario de prueba desde `/dashboard/citas`.
2. Bloquear un hueco a mano en ese calendario real → confirmar que el widget de
   reserva de la ficha ya no lo ofrece.
3. Reservar una cita desde el agente → confirmar que aparece en el Google Calendar
   conectado, con enlace de Meet, y que `appointments.external_event_id`/`meeting_url`
   se guardaron.
4. Revocar el acceso desde la cuenta de Google → confirmar que el estado pasa a
   `error` con aviso de reconectar, sin romper el resto del flujo de citas (Fase B
   sigue funcionando con la fila `manual`).
5. Solo entonces: flip de `calendar_integration` a `operative` (migración de una línea).

Outlook (Microsoft Graph) sería un paso posterior análogo (el esquema ya admite
`provider='outlook_calendar'`, pero no hay código de esa integración).
