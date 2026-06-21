# Pendientes — Black Label Market al 100%

Documento único de todo lo que falta para considerar el market completamente operativo.
Leyenda: 🟢 listo · 🟡 parcial/manual · 🔴 falta · ⭐ crítico.

Última actualización: **2026-06-21**.

---

## Fases de referencia

| Fase | Objetivo | Cuándo |
|---|---|---|
| **A** | Operar con los primeros 20 showrooms (captación directa, presencial) | Ahora |
| **B** | Abrir captación pública autoservicio | Cuando el market esté lleno |
| **C** | Features Elite avanzadas | Cuando haya base instalada |

---

## 1. n8n — BLOQUEANTE TOTAL ⭐

Sin n8n funcionando, ningún email de negocio ni automatización existe.

| Tarea | Estado | Fase |
|---|---|---|
| Resolver crash loop PostgreSQL (contraseña `Joseleotorres3+` falla) | 🔴 | A |
| Borrar volumen de datos de postgres en EasyPanel | 🔴 | A |
| Reinicializar postgres con contraseña sin caracteres especiales | 🔴 | A |
| Importar WF1–WF5 desde `n8n-workflows/` en la UI de n8n | 🔴 | A |
| Activar los 5 workflows importados | 🔴 | A |
| Generar nueva API key en n8n (la DB se reinicia limpia) | 🔴 | A |

**Variables de entorno a configurar en el contenedor n8n (EasyPanel):**

```
RESEND_API_KEY
ANTHROPIC_API_KEY
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
SLACK_WEBHOOK_URL
FIRECRAWL_API_KEY
SUPABASE_URL=https://iylppoaitwnmbwjaubuy.supabase.co
SUPABASE_SERVICE_KEY
N8N_WEBHOOK_DEALER_SIGNUP_SECRET
MARKET_URL=https://blacklabelmarket.es
MAIL_FROM=Black Label Market <no-reply@blacklabelmarket.es>
ADMIN_EMAIL=aldeiaceo@gmail.com
```

---

## 2. Infraestructura / Vercel / Supabase

| Tarea | Estado | Fase |
|---|---|---|
| Añadir `RESEND_API_KEY` en Vercel | 🔴 | A |
| Añadir `EMAIL_FROM` en Vercel | 🔴 | A |
| Añadir `CRON_SECRET` en Vercel | 🔴 | A |
| Confirmar que `N8N_WEBHOOK_URL` apunta a la URL activa de n8n | 🔴 | A |
| Añadir `N8N_WEBHOOK_DEALER_SIGNUP_SECRET` en Vercel (debe coincidir con n8n) | 🔴 | A |
| Añadir `N8N_WEBHOOK_DEALER_PENDING_INFO` en Vercel | 🔴 | A |
| Confirmar `N8N_WEBHOOK_DEALER_APPROVED`, `_REJECTED`, `_SIGNUP` en Vercel | 🟡 | A |
| Configurar SMTP propio en Supabase (Resend + SPF/DKIM/DMARC) | 🔴 | A |
| Actualizar `SITE_URL` y redirect URLs en Supabase Auth → `blacklabelmarket.es` | 🔴 | A |
| Quitar noindex del dominio `blacklabelmarket.es` cuando esté listo para abrir | 🔴 | A→B |
| Auto-deploy Vercel roto — siempre desplegar con `vercel --prod --yes` | 🟡 workaround | — |
| Aplicar migraciones pendientes con `npx supabase db push` | 🟡 | A |

---

## 3. Servicios externos a contratar/configurar

| Servicio | Para qué | Estado | Fase |
|---|---|---|---|
| **Resend** | SMTP de Supabase + emails del market | 🔴 | A |
| **Resend** | Verificar dominio `blacklabelmarket.es` (SPF/DKIM/DMARC en Hostinger) | 🔴 | A |
| **Slack** | Crear Incoming Webhook para notificaciones internas de n8n | 🔴 | A |
| **Firecrawl** | API key para scraping en WF1 (investigación showrooms) | 🔴 | A |
| **Stripe** | Crear productos y precios por plan | 🔴 | B |
| **Stripe** | Precios add-ons (boost 49€, pack 5×199€, +10v 59€, +25v 99€, feed 99€, diagnóstico 149€) | 🔴 | B |
| **Stripe** | Webhook `/api/stripe/webhooks` dado de alta + secret | 🔴 | B |
| **Stripe Tax** | Configurar cálculo de IVA en checkout | 🔴 | B |

---

## 4. Código pendiente en el market

### 4.1 Flujo de alta de showroom

| Tarea | Estado | Fase |
|---|---|---|
| Email automático al showroom al enviar solicitud (acuse de recibo + whitelist) | 🔴 | A |
| Email al showroom cuando n8n solicita más info (Fase 5 pending_info) | 🔴 | A — vía WF4 |
| Email al showroom cuando es aprobado con acceso + contraseña temporal | 🔴 | A — vía WF2 |
| Email al showroom cuando es rechazado | 🔴 | A — vía WF3 |

### 4.2 Flujos de demanda (vehículos a la carta + alertas)

| Tarea | Estado | Fase |
|---|---|---|
| **Matcher de alertas** ⭐: al aprobar vehículo, cruzar con `search_alerts` activas y emitir evento | 🔴 | A |
| Enlace de baja para alertas anónimas (cumplimiento + UX) | 🔴 | A |
| Emitir evento `custom_request.matched` al marcar solicitud como matched | 🔴 | A |
| Campo en `/admin/solicitudes` para pegar enlace del vehículo encontrado | 🔴 | A |
| Aviso al comprador "lo hemos encontrado" con enlace (automático) | 🔴 | A — vía WF5 |
| Email acuse de recibo al comprador en solicitud a la carta | 🔴 | A — vía WF5 |
| Email confirmación alerta creada al comprador | 🔴 | A — vía WF5 |

### 4.3 Trial y conversión

| Tarea | Estado | Fase |
|---|---|---|
| Banner visible en dashboard del dealer: "Trial activo hasta [fecha]" | 🔴 | B |
| Verificar que vehículos con `status: 'trial'` son visibles en el market (RLS) | 🟡 | B |
| Página pública de precios (Essential / Professional / Elite) | 🔴 | B |
| Integración Stripe en el checkout del market | 🔴 | B |
| Plan Grupo: cerrar definición + construir en código | 🔴 | B |
| Formulario datos fiscales (CIF, razón social) gestionado vía n8n | 🔴 | B |

---

## 5. Workflows n8n pendientes de construir

Los WF1–WF5 están creados en `n8n-workflows/` y listos para importar.
Lo siguiente va después de tenerlos activos y funcionando.

| Workflow | Descripción | Fase |
|---|---|---|
| **WF6 — Matcher de alertas** | Al recibir evento `vehicle.approved`, buscar alertas activas en Supabase que coincidan (marca/modelo/precio/año) y enviar email a los compradores | A |
| **WF7 — Drip trial** | Emails automáticos días 3/10/21/28 del trial (check-in, rendimiento, conversión) | B |
| **WF8 — Conversión/Stripe** | Formulario fiscal + activación de plan en Stripe al elegir suscripción | B |

---

## 6. Features avanzadas Elite (Fase C)

Construidas internamente en el market, pendientes de conectar externamente. No bloquean las fases A y B.

### Reserva de cita (`appointment_booking`)
- 🟢 Tablas `showroom_calendar_connections` y `appointments` creadas
- 🟢 Webhook `/api/webhooks/appointment-result` preparado
- 🔴 OAuth Google Calendar / Outlook
- 🔴 Workflow n8n que proponga/confirme cita
- 🔴 Emails/WhatsApp de confirmación

### Scoring y alertas de lead caliente (`lead_scoring`, `hot_lead_alerts`)
- 🟢 Campos `lead_score`, `score_reason`, `recommended_next_action` en `leads`
- 🟢 Tabla `lead_alerts` y webhook `/api/webhooks/hot-lead-alert`
- 🔴 Prompt/modelo de scoring
- 🔴 Workflow n8n que puntúe leads y cree alertas

### Stock automático / feed-DMS (`feed_sync`)
- 🟢 Feature flag y gating por plan preparados
- 🔴 Conector feed/DMS
- 🔴 Job recurrente de sincronización

### Ventana exclusiva 24h a la carta (`vehicles_on_request_priority`)
- 🟢 Feature visible y concedida en Elite
- 🔴 Matcher/temporizador que reserve 24h antes de abrir al resto
- 🔴 Avisos automáticos al showroom cuando hay una solicitud compatible

### Agente de cualificación (`lead_qualification_assistant`)
- 🟢 Activo y concedido en Professional/Elite
- 🟢 Webhook `/api/webhooks/assistant-result` operativo

---

## Resumen por fase

### Fase A — Para los primeros 20 showrooms

```
□ Arreglar n8n (postgres password → borrar volumen → reiniciar)
□ Configurar env vars en contenedor n8n
□ Importar y activar WF1–WF5
□ Dar de alta Resend + verificar dominio blacklabelmarket.es
□ Configurar SMTP de Resend en Supabase Auth
□ Añadir variables faltantes en Vercel (RESEND_API_KEY, EMAIL_FROM, CRON_SECRET, N8N_*)
□ Actualizar SITE_URL en Supabase Auth → blacklabelmarket.es
□ Crear Slack Incoming Webhook
□ Crear cuenta Firecrawl
□ Construir WF6 (matcher de alertas)
□ Código: matcher en market (gancho vehicle.approved → cruzar search_alerts)
□ Código: campo vehículo encontrado + evento matched en solicitudes a la carta
□ Quitar noindex cuando listos
```

### Fase B — Para captación pública

```
□ Stripe (productos, precios, webhook, IVA)
□ WF7 drip trial + WF8 conversión
□ Página pública de precios en el market
□ Integración Stripe en checkout
□ Plan Grupo (definición + código)
□ Banner trial en dashboard del dealer
□ Verificar RLS de vehículos trial
```

### Fase C — Features Elite avanzadas

```
□ Google Calendar OAuth + WF reserva de cita
□ Scoring de leads + alertas de lead caliente
□ Feed/DMS sincronización automática
□ Ventana exclusiva 24h a la carta
```

---

## Procedimiento al completar una pieza

1. Conectar herramienta externa / credenciales.
2. Validar con un showroom interno o en staging.
3. Marcar la feature como `availability_status = 'operative'` en Supabase.
4. Si procede, cambiar `public_visible = true`.
5. Marcar ítem como 🟢 en este documento y actualizar la fecha.
