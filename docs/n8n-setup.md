# n8n Setup — Black Label Market

## Estado del problema (21 Jun 2026)

La API REST de n8n (`POST /api/v1/workflows`) devuelve **500 Internal Server Error** al intentar crear workflows programáticamente, aunque las peticiones GET funcionan bien. Es un problema del servidor (posiblemente permisos de escritura en la DB SQLite del contenedor EasyPanel). Los workflows se deben importar **manualmente** por la UI.

---

## 1. Importar workflows en n8n (UI)

Abre **https://aldeia-n8n.giuxk6.easypanel.host** y para cada archivo en `n8n-workflows/`:

1. Haz clic en **"New workflow"** (o el botón `+`)
2. Haz clic en el menú `···` (tres puntos, arriba a la derecha)
3. Selecciona **"Import from JSON"**
4. Pega el contenido del archivo o carga el archivo
5. Guarda y **activa** el workflow

### Archivos a importar (en orden):

| Archivo | Nombre en n8n | Webhook path |
|---------|--------------|--------------|
| `wf1-dealer-signup.json` | BLM — 1. Alta Showroom | `blm/dealer-signup` |
| `wf2-dealer-approved.json` | BLM — 2. Aprobación Showroom | `blm/dealer-approved` |
| `wf3-dealer-rejected.json` | BLM — 3. Rechazo Showroom | `blm/dealer-rejected` |
| `wf4-dealer-pending-info.json` | BLM — 4. Solicitar Más Información | `blm/dealer-pending-info` |
| `wf5-events-router.json` | BLM — 5. Router de Eventos | `blm/events` |

---

## 2. Variables de entorno — Contenedor n8n (EasyPanel)

Añade estas variables en la configuración del contenedor n8n en EasyPanel → **Environment Variables**:

### APIs externas

```env
# Resend (email)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Anthropic (Claude para emails generados con IA)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-haiku-4-5-20251001

# Slack (notificaciones internas — crear Incoming Webhook en tu workspace)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXXXX/XXXXX/XXXXX

# Firecrawl (scraping de URLs de showrooms en WF1)
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxxxxxxxxx
```

### Supabase

```env
# URL base de tu proyecto Supabase
SUPABASE_URL=https://iylppoaitwnmbwjaubuy.supabase.co

# Service role key (NO anon key — necesita acceso admin)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Secrets de webhooks (firma HMAC para WF1)

```env
# Debe coincidir con N8N_WEBHOOK_DEALER_SIGNUP_SECRET en Vercel
N8N_WEBHOOK_DEALER_SIGNUP_SECRET=<genera con: openssl rand -hex 32>
```

### Market / Branding

```env
# Dominio público del market
MARKET_URL=https://blacklabelmarket.es

# Remitente de emails (debe estar verificado en Resend)
MAIL_FROM=Black Label Market <no-reply@blacklabelmarket.es>

# Email del admin (para copias internas)
ADMIN_EMAIL=aldeiaceo@gmail.com
```

---

## 3. Variables de entorno — Vercel (Black Label Market)

Añade o comprueba que estas variables existen en el proyecto de Vercel:

```env
# ==== Webhooks de alta de showroom ====
N8N_WEBHOOK_DEALER_SIGNUP=https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/dealer-signup
N8N_WEBHOOK_DEALER_SIGNUP_SECRET=<mismo valor que en n8n>

N8N_WEBHOOK_DEALER_APPROVED=https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/dealer-approved
N8N_WEBHOOK_DEALER_REJECTED=https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/dealer-rejected
N8N_WEBHOOK_DEALER_PENDING_INFO=https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/dealer-pending-info

# ==== Router de eventos genéricos (leads, alertas, vehículos) ====
N8N_WEBHOOK_URL=https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/events

# Opcional: secret para verificar origen en WF5
N8N_WEBHOOK_SECRET=<genera con: openssl rand -hex 32>

# ==== Email (Resend) ====
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=no-reply@blacklabelmarket.es

# ==== Custom Requests (vehículos a la carta) ====
CUSTOM_REQUESTS_INTERNAL_TOKEN=BXo5rzbyCokv6GlopuVBHjZJZmsoNzIGibo2q9l1eo
CUSTOM_REQUESTS_RATE_LIMIT_SALT=eHUkVurZ1lVAEVGZ3UxIqEtamJtp4qVKsb4aU3Evw
```

---

## 4. Activar workflows

Tras importar y configurar las env vars del contenedor n8n, activa cada workflow. La URL de producción del webhook de cada uno será:

```
WF1: https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/dealer-signup
WF2: https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/dealer-approved
WF3: https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/dealer-rejected
WF4: https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/dealer-pending-info
WF5: https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/events
```

---

## 5. Diagnóstico del error 500 en la API de n8n

Si quieres arreglar la creación de workflows via API (opcional), revisa:

1. **Logs del contenedor** en EasyPanel → Contenedor n8n → Logs
2. Busca errores relacionados con la base de datos (SQLite/PostgreSQL)
3. Verifica que el proceso n8n tiene permisos de escritura en `/home/node/.n8n`
4. Reiniciar el contenedor puede resolver estados corruptos temporales

El problema NO está en nuestro JSON — un payload mínimo `{"name":"Test"}` también falla, lo que confirma que es un error de configuración del servidor.

---

## 6. Mapa de eventos → workflows

| Evento en market | Env var en Vercel | Workflow n8n |
|-----------------|-------------------|-------------|
| Formulario alta showroom enviado | `N8N_WEBHOOK_DEALER_SIGNUP` | WF1 → investigación web + email confirmación + Slack |
| Admin aprueba showroom | `N8N_WEBHOOK_DEALER_APPROVED` | WF2 → email bienvenida con Claude + Slack |
| Admin rechaza showroom | `N8N_WEBHOOK_DEALER_REJECTED` | WF3 → email rechazo con Claude + Slack |
| Admin pide más info | `N8N_WEBHOOK_DEALER_PENDING_INFO` | WF4 → email con notas del admin + Slack |
| Lead creado | `N8N_WEBHOOK_URL` | WF5 → email al comprador + email al dealer |
| Vehículo a la carta | `N8N_WEBHOOK_URL` | WF5 → email confirmación al solicitante |
| Alerta de búsqueda guardada | `N8N_WEBHOOK_URL` | WF5 → email confirmación |
| Admin aprueba vehículo | `N8N_WEBHOOK_URL` | WF5 → email al dealer con URL publicada |
| Admin rechaza vehículo | `N8N_WEBHOOK_URL` | WF5 → email al dealer con motivo |
