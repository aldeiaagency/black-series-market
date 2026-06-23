# Black Label Market — PENDIENTES
> Documento único y canónico. Última actualización: **2026-06-23**.
> Elimina y sustituye: `pendientes-configuracion-externa.md`, `deployment-checklist.md`, `n8n-setup.md`, `backlog-alertas-y-vehiculos-a-la-carta.md`, `backlog-marketplace.md`.

---

## Estado actual (lo que ya está hecho)

- ✅ n8n activo con WF1–WF7 operativos (signup, aprobación, rechazo, más info, eventos, alertas, agente IA)
- ✅ Todas las variables de entorno de n8n configuradas (OPENAI, FIRECRAWL, SUPABASE, MAIL_FROM, SMTP Hostinger, etc.)
- ✅ Vercel: `N8N_WEBHOOK_DEALER_APPROVED/REJECTED/PENDING_INFO`, `ASSISTANT_WEBHOOK_SECRET/RESULT`, `NEXT_PUBLIC_APP_URL`
- ✅ Flujo de alta WF1→WF4 conectado de extremo a extremo (solicitud → auditoría → aprobación/rechazo/más info)
- ✅ Panel admin `/admin/altas-showroom` rediseñado + detalle `/[id]` + sidebar de acciones
- ✅ Bug email duplicado en aprobación resuelto
- ✅ Dominio `blacklabelmarket.es` configurado en Vercel (apex canónico, www→apex)
- ✅ Deploy en producción en `blacklabelmarket.es`
- ✅ Cuenta Firecrawl: `aldeiatools@gmail.com` / `Joseleotorres3+` · API key en n8n

---

## FASE A — Para operar con los primeros 20 showrooms

### 🔴 1. SMTP propio en Supabase Auth ⭐ CRÍTICO
Sin esto los emails de confirmación de cuenta y reset de contraseña salen con dominio `supabase.co`, lo que perjudica la confianza y entregabilidad.

**Qué hacer:**
- Configurar Hostinger SMTP en Supabase Auth dashboard → Authentication → Email templates → SMTP Settings
  - Host: `smtp.hostinger.com` · Puerto: `465` (SSL) o `587` (TLS)
  - Usuario: `hola@blacklabelmarket.es`
  - Contraseña: la del buzón Hostinger
- Actualizar `SITE_URL` en Supabase Auth → `https://blacklabelmarket.es`
- Actualizar las URL de redirección permitidas para incluir `https://blacklabelmarket.es/**`
- Guía detallada: `docs/configuracion-email-smtp.md`

---

### 🔴 2. R2 Cloudflare — subida de imágenes de vehículos ⭐ CRÍTICO
Los dealers no pueden subir fotos de vehículos desde el dashboard. La ruta `/api/upload` existe en el código pero no tiene credenciales de bucket.

**Qué hacer:**
- Crear cuenta Cloudflare (gratuita) o usar la existente
- Crear bucket R2 `blm-vehicles`
- Añadir a Vercel:
  ```
  R2_ACCOUNT_ID=
  R2_ACCESS_KEY_ID=
  R2_SECRET_ACCESS_KEY=
  R2_BUCKET_NAME=blm-vehicles
  R2_PUBLIC_URL=https://...
  ```

---

### 🔴 3. N8N_WEBHOOK_URL en Vercel — eventos del market → WF5
Sin esta variable, cuando el market emite eventos (`vehicle.approved`, `lead.created`, `search_alert.created`, `custom_request.created`) no llegan a n8n y por tanto WF5→WF6 (matcher de alertas) nunca se activa.

**Qué añadir en Vercel:**
```
N8N_WEBHOOK_URL=https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/events
N8N_WEBHOOK_SECRET=<generar con: openssl rand -hex 32>
```

> Nota: el market ya emite eventos a `integration_events` (tabla) pero la entrega en tiempo real al webhook de n8n depende de estas variables.

---

### 🟡 4. WF1 — acuse de recibo automático al solicitante
Cuando alguien envía la solicitud de alta, no recibe ningún email de confirmación automático. Solo hay texto en pantalla diciéndole que mire el spam.

**Qué hacer:** añadir nodo en WF1 (después del webhook de entrada) que envíe email al showroom confirmando recepción de su solicitud + instrucción de whitelist.

---

### 🟡 5. WF1 — notificación interna al equipo
El admin no recibe aviso cuando llega una solicitud nueva. Todo es manual: hay que entrar a `/admin/altas-showroom` a ver si hay algo.

**Qué hacer:** añadir nodo en WF1 que envíe email/Slack al equipo con resumen de la solicitud + enlace directo al panel de detalle.

Requiere primero resolver el punto 6 si se quiere vía Slack.

---

### 🟡 6. Slack Incoming Webhook (SLACK_WEBHOOK_URL)
Variable actualmente con valor `PENDIENTE` en n8n. Necesaria para notificaciones internas (punto 5 y otras).

**Qué hacer:**
- Crear Incoming Webhook en Slack (o Telegram si se prefiere)
- Actualizar `SLACK_WEBHOOK_URL` en n8n EasyPanel → Entorno → Guardar → Implementar

---

### 🟡 7. Verificar WF5→WF6 end-to-end (vehicle.approved → matcher → email comprador)
WF5 está configurado para llamar a WF6 cuando recibe un evento `vehicle.approved`. WF6 (matcher) busca alertas activas y debería enviar email al comprador. Pendiente de probar de extremo a extremo con un vehículo real.

**Qué verificar:**
- Que `N8N_WEBHOOK_URL` dispara WF5 correctamente (depende del punto 3)
- Que WF6 encuentra alertas y genera los emails
- Que el comprador recibe el aviso con enlace al vehículo

---

### 🟡 8. Emails a compradores — vehículos a la carta y alertas
- Acuse de recibo al comprador cuando crea una alerta en "Mis alertas"
- Acuse de recibo al comprador cuando envía solicitud en "Vehículos a la carta"
- Aviso "lo hemos encontrado" cuando el equipo marca una solicitud como matched

Estos emails deben salir desde WF5 (o un workflow dedicado). Pendiente de construir los nodos correspondientes.

---

### 🔴 9. Quitar noindex
El sitio está invisible para buscadores. Hacerlo cuando el catálogo tenga vehículos reales publicados.

**Dónde:** buscar `noindex` en `app/layout.tsx` o `next.config.js` y eliminar la meta tag / header.

---

## FASE B — Para captación pública (cuando el market tenga stock)

### Stripe — productos y pagos reales

| Tarea | Estado |
|---|---|
| Crear cuenta Stripe en modo live | 🔴 |
| Crear producto Essential (197€/mes + IVA) | 🔴 |
| Crear producto Professional (449€/mes + IVA) | 🔴 |
| Crear producto Elite (899€/mes + IVA) | 🔴 |
| Crear add-ons: boost 49€, pack 5×199€, +10v 59€/mes, +25v 99€/mes, feed 99€/mes, diagnóstico 149€ | 🔴 |
| Configurar webhook Stripe → `/api/stripe/webhooks` | 🔴 |
| Configurar Stripe Tax (cálculo IVA automático) | 🔴 |
| Añadir a Vercel: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ESSENTIAL/PROFESSIONAL/ELITE` | 🔴 |

### Resto Fase B

| Tarea | Estado |
|---|---|
| Página `/precios` actualizada con precios reales (Essential/Professional/Elite) | 🔴 |
| Integración checkout Stripe en el flujo de suscripción | 🔴 |
| Plan Grupo: cerrar definición + construir en código (derivado de Elite) | 🔴 |
| Banner en dashboard dealer: "Trial activo hasta [fecha]" | 🔴 |
| Verificar que vehículos con `status: 'trial'` son visibles en el market (RLS) | 🟡 |
| WF drip trial: emails días 3/10/21/28 | 🔴 |
| WF conversión: email día ~28 con resumen rendimiento + CTA a elegir plan | 🔴 |

---

## FASE C — Features Elite avanzadas (cuando haya base instalada)

Las tablas y endpoints ya están construidos. Solo falta conectar con servicios externos y construir los workflows n8n.

| Feature | Qué falta |
|---|---|
| **Reserva de citas** (tablas `appointments` ✅) | Google Calendar OAuth + workflow n8n de propuesta/confirmación + emails |
| **Lead scoring** (campos `lead_score` en `leads` ✅) | Prompt de scoring + workflow n8n que puntúe y cree alertas |
| **Feed/DMS automático** (feature flag ✅) | Conector feed/DMS + job recurrente de sincronización |
| **Ventana exclusiva 24h a la carta** (feature flag ✅) | Matcher/temporizador 24h + aviso automático al showroom |

---

## Variables de entorno — resumen estado

### n8n (EasyPanel) — todas configuradas ✅
```
WEBHOOK_URL, DB_TYPE, DB_POSTGRESDB_*, OPENAI_API_KEY, MAIL_FROM,
SUPABASE_URL, SUPABASE_SERVICE_KEY, MARKET_URL, ADMIN_EMAIL,
N8N_WEBHOOK_DEALER_SIGNUP_SECRET, FIRECRAWL_API_KEY,
ASSISTANT_WEBHOOK_SECRET, ASSISTANT_RESULT_SECRET
```
**Pendientes en n8n:** `SLACK_WEBHOOK_URL` (actualmente "PENDIENTE")

### Vercel — configuradas ✅
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
SUPABASE_ACCESS_TOKEN, NEXT_PUBLIC_APP_URL (=https://blacklabelmarket.es),
N8N_WEBHOOK_DEALER_SIGNUP, N8N_WEBHOOK_DEALER_SIGNUP_SECRET,
N8N_WEBHOOK_DEALER_APPROVED, N8N_WEBHOOK_DEALER_REJECTED, N8N_WEBHOOK_DEALER_PENDING_INFO,
ASSISTANT_WEBHOOK_SECRET, ASSISTANT_RESULT_SECRET,
N8N_MCP_URL, N8N_MCP_AUTHORIZATION
```
**Pendientes en Vercel:**
```
N8N_WEBHOOK_URL=https://aldeia-n8n.giuxk6.easypanel.host/webhook/blm/events
N8N_WEBHOOK_SECRET=<generar>
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ESSENTIAL, STRIPE_PRICE_PROFESSIONAL, STRIPE_PRICE_ELITE
```
(STRIPE_* y R2_* usan placeholders actualmente)

---

## Docs del repo que siguen siendo válidos
- `docs/configuracion-email-smtp.md` — guía paso a paso para configurar SMTP en Supabase
- `docs/planes-suscripcion-definitivos.md` — definición definitiva de planes y add-ons
- `docs/seo-geo-backlog.md` + `seo-geo-backlog.csv` — backlog SEO/GEO (independiente)
- `docs/guia-copy-black-label.md` — guía de tono y copy de la marca
- `docs/legal-pending-data.md` — datos legales pendientes de rellenar
