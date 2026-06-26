# Black Label Market — PENDIENTES
> Documento único y canónico. Última actualización: **2026-06-26**.
> Elimina y sustituye: `pendientes-configuracion-externa.md`, `deployment-checklist.md`, `n8n-setup.md`, `backlog-alertas-y-vehiculos-a-la-carta.md`, `backlog-marketplace.md`.

---

## Checklist para dejar lista la web (Fase A completa)

### 🔴 Bloqueantes operativos inmediatos
- [ ] **SMTP Supabase Auth** — emails de confirmación y reset salen con dominio supabase.co (punto 1 abajo)
- [ ] **R2 Cloudflare** — dealers no pueden subir fotos (punto 2 abajo)
- [x] **CRON_SECRET** en Vercel — ya configurado
- [ ] **DNS: SPF + DKIM + DMARC** en Hostinger para `blacklabelmarket.es` — sin esto los emails van a spam
- [ ] **Textos legales** en Supabase — páginas `/legal/aviso-legal` y `/legal/privacidad` tienen emails placeholder visibles

### 🟡 Antes del primer showroom real
- [x] **CUSTOM_REQUESTS_INTERNAL_TOKEN** en Vercel — configurado (2026-06-26)
- [ ] **Redes sociales** en `/admin/configuracion` — footer vacío (Instagram, YouTube, etc.)
- [ ] **Emails a compradores** en WF5 (punto 8 abajo) — acuse de recibo al crear alerta / enviar solicitud a la carta
- [ ] **Slack Incoming Webhook** (punto 6 abajo) — opcional si se prefiere recibir avisos por email

### 🟡 Antes de captación pública
- [ ] **Quitar noindex** (punto 9 abajo) — cuando el catálogo tenga vehículos reales
- [ ] **GTM** en `/admin/configuracion` — para analytics; Consent Mode v2 ya está montado en el código
- [ ] **Revisión legal** con asesor RGPD/LSSI antes de publicar

### 🔵 Cuando haya dealers / stock real
- [x] **IMPORT_API_KEY** en Vercel — configurado (2026-06-26)
- [ ] **Stripe** completo — Fase B (ver sección más abajo)

### 🔵 Features Elite (Fase C)
- [x] **HOT_LEAD_ALERT_SECRET** en Vercel — configurado (2026-06-26)
- [x] **APPOINTMENT_RESULT_SECRET** en Vercel — configurado (2026-06-26)

---

## Estado actual (lo que ya está hecho)

- ✅ n8n activo con WF1–WF7 operativos (signup, aprobación, rechazo, más info, eventos, alertas, agente IA)
- ✅ Todas las variables de entorno de n8n configuradas (OPENAI, FIRECRAWL, SUPABASE, MAIL_FROM, SMTP Hostinger, etc.)
- ✅ Vercel: `N8N_WEBHOOK_DEALER_APPROVED/REJECTED/PENDING_INFO`, `ASSISTANT_WEBHOOK_SECRET/RESULT`, `NEXT_PUBLIC_APP_URL`
- ✅ Vercel: `N8N_WEBHOOK_URL` + `N8N_WEBHOOK_SECRET` configurados — el market emite eventos en tiempo real a WF5
- ✅ Flujo de alta WF1→WF4 conectado de extremo a extremo (solicitud → auditoría → aprobación/rechazo/más info)
- ✅ Panel admin `/admin/altas-showroom` rediseñado + detalle `/[id]` + sidebar de acciones
- ✅ Bug email duplicado en aprobación resuelto
- ✅ Dominio `blacklabelmarket.es` configurado en Vercel (apex canónico, www→apex)
- ✅ Deploy en producción en `blacklabelmarket.es`
- ✅ Cuenta Firecrawl: `aldeiatools@gmail.com` / `Joseleotorres3+` · API key en n8n
- ✅ WF5 pipeline completo: recibe los 6 tipos de evento → los 6 devuelven HTTP 200 → emails salen por Hostinger SMTP
- ✅ WF5 → WF6 (vehicle.approved): vehicleId se pasa correctamente → Supabase query OK → matcher de alertas operativo
- ✅ SMTP Hostinger en n8n funcionando (credential recreado, `N8N_ENCRYPTION_KEY` fijada para evitar rotación futura)
- ✅ Todos los workflows BLM (WF1–WF6) actualizados con la nueva credencial SMTP
- ✅ WF1 pipeline completo end-to-end: acuse al solicitante + informe interno al admin + Firecrawl + Claude + Supabase (exec #41 success, 250 Ok: queued)

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

### ✅ 3. N8N_WEBHOOK_URL en Vercel — HECHO (2026-06-25)
Configurado y desplegado. El market emite eventos en tiempo real a WF5.

---

### ✅ 4. WF1 — acuse de recibo automático al solicitante — HECHO (2026-06-26)
Email de confirmación al solicitante conectado y verificado (exec #41, `250 Ok: queued`). El showroom recibe confirmación inmediata en el mismo email que usó en el formulario.

---

### ✅ 5. WF1 — notificación interna al equipo — HECHO (2026-06-26)
Email interno al admin (`aldeiaceo@gmail.com`) con resumen de la solicitud y enlace al panel `/admin/altas-showroom/[id]`. Ejecutado en el mismo exec #41.

---

### 🟡 6. Slack Incoming Webhook (SLACK_WEBHOOK_URL)
Variable actualmente con valor `PENDIENTE` en n8n. Necesaria para notificaciones internas (punto 5 y otras).

**Qué hacer:**
- Crear Incoming Webhook en Slack (o Telegram si se prefiere)
- Actualizar `SLACK_WEBHOOK_URL` en n8n EasyPanel → Entorno → Guardar → Implementar

---

### ✅ 7. WF5→WF6 end-to-end — HECHO (2026-06-25)
Pipeline verificado: `vehicle.approved` → WF5 (email dealer OK) → WF6 (Supabase query OK, alertas matcher OK). SMTP Hostinger entrega emails con `250 Ok: queued`.

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
N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET, N8N_WEBHOOK_EVENTS,
N8N_WEBHOOK_DEALER_SIGNUP, N8N_WEBHOOK_DEALER_SIGNUP_SECRET,
N8N_WEBHOOK_DEALER_APPROVED, N8N_WEBHOOK_DEALER_REJECTED, N8N_WEBHOOK_DEALER_PENDING_INFO,
ASSISTANT_WEBHOOK_SECRET, ASSISTANT_RESULT_SECRET, APPOINTMENT_RESULT_SECRET,
CRON_SECRET, HOT_LEAD_ALERT_SECRET, IMPORT_API_KEY,
CUSTOM_REQUESTS_INTERNAL_TOKEN, CUSTOM_REQUESTS_RATE_LIMIT_SALT,
N8N_MCP_URL, N8N_MCP_AUTHORIZATION
```
**Pendientes en Vercel (necesitan valor real):**
```
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ESSENTIAL, STRIPE_PRICE_PROFESSIONAL, STRIPE_PRICE_ELITE
```
(STRIPE_* y R2_* tienen placeholders — se activan en Fase B)

---

## Docs del repo que siguen siendo válidos
- `docs/configuracion-email-smtp.md` — guía paso a paso para configurar SMTP en Supabase
- `docs/planes-suscripcion-definitivos.md` — definición definitiva de planes y add-ons
- `docs/seo-geo-backlog.md` + `seo-geo-backlog.csv` — backlog SEO/GEO (independiente)
- `docs/guia-copy-black-label.md` — guía de tono y copy de la marca
- `docs/legal-pending-data.md` — datos legales pendientes de rellenar
