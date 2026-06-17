# Configuración de email (SMTP) — Black Label Market

> Guía operativa para dejar el envío de emails de Black Label Market funcionando de forma
> fiable en producción. Cubre **todos** los emails del proyecto: los de Supabase Auth
> (recuperación de contraseña, confirmación de registro, cambio de email) y los
> transaccionales de negocio (lead caliente, oportunidades a la carta, citas, vehículo
> aprobado/rechazado) que se enviarán vía n8n.
>
> Estado actual (2026-06-17): **SMTP propio NO configurado** (`smtp_host = null`). Supabase
> usa su SMTP por defecto → ~2-3 emails/hora y dominio genérico que cae en spam. El flujo de
> recuperación de contraseña está construido y desplegado, pero no entrega de forma fiable
> hasta completar esta guía.

---

## 0. Por qué hace falta SMTP propio

El SMTP por defecto de Supabase **no es para producción**:

- Límite de ~2-3 emails/hora (un puñado de usuarios lo agotan).
- Remite desde un dominio de Supabase → SPF/DKIM no son de `blacklabelmarket.es` → spam.
- Sin control sobre la reputación del dominio ni métricas de entrega.

Con SMTP propio (Resend / Postmark / SendGrid) los emails salen desde
`blacklabelmarket.es`, autenticados (SPF + DKIM + DMARC), con entregabilidad real.

---

## 1. Elegir proveedor

| Proveedor | Free tier | Notas |
|---|---|---|
| **Resend** (recomendado) | 3.000 emails/mes, 100/día | API y SMTP simples, buena entregabilidad, pensado para devs. Integra fácil con n8n. |
| Postmark | 100 emails/mes (luego de pago) | Entregabilidad excelente, orientado a transaccional. |
| SendGrid | 100 emails/día | Más veterano, panel más pesado. |

> Recomendación: **Resend**. El mismo proveedor sirve para Supabase Auth (vía SMTP) y para
> los emails transaccionales de n8n (vía API), así centralizamos dominio y reputación.

---

## 2. Verificar el dominio (DNS en Hostinger)

El dominio `blacklabelmarket.es` está en Hostinger (DNS apuntando a Vercel). Hay que añadir
los registros de autenticación de email que dé el proveedor. Con Resend:

1. En Resend → **Domains** → Add Domain → `blacklabelmarket.es`.
2. Resend genera 3 registros. Añadirlos en Hostinger (zona DNS), **sin tocar** los registros
   A/CNAME que apuntan a Vercel:

   | Tipo | Nombre (host) | Valor | Para qué |
   |---|---|---|---|
   | TXT | `send` (o el que indique) | `v=spf1 include:...` | **SPF** — autoriza al proveedor a enviar |
   | TXT/CNAME | `resend._domainkey` | (clave que da Resend) | **DKIM** — firma criptográfica |
   | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:aldeiaceo@gmail.com` | **DMARC** — política y reportes |

3. Esperar propagación (minutos–horas) y pulsar **Verify** en Resend.

> Nota: usar un **subdominio de envío** (p. ej. `send.blacklabelmarket.es` o
> `mail.blacklabelmarket.es`) como remitente es buena práctica para aislar la reputación
> del correo transaccional del dominio principal. Resend lo soporta directamente.

---

## 3. Configurar SMTP custom en Supabase Auth

Una vez verificado el dominio, conectar el SMTP del proveedor a Supabase. Dos vías:

### Opción A — Dashboard (más simple)
Supabase → **Authentication → SMTP Settings** → Enable Custom SMTP, y rellenar:

- **Host:** `smtp.resend.com`
- **Port:** `465` (SSL) o `587` (TLS)
- **Username:** `resend`
- **Password:** la **API key** de Resend (`re_...`)
- **Sender email:** `no-reply@blacklabelmarket.es` (o `no-reply@send.blacklabelmarket.es`)
- **Sender name:** `Black Label Market`

### Opción B — Management API (reproducible)
```powershell
$body = @{
  smtp_host        = "smtp.resend.com"
  smtp_port        = 465
  smtp_user        = "resend"
  smtp_pass        = "re_XXXXXXXXXXXX"   # API key de Resend
  smtp_sender_name = "Black Label Market"
  smtp_admin_email = "no-reply@blacklabelmarket.es"
} | ConvertTo-Json -Compress
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
Invoke-RestMethod `
  -Uri "https://api.supabase.com/v1/projects/iylppoaitwnmbwjaubuy/config/auth" `
  -Method PATCH `
  -Headers @{ "Authorization" = "Bearer <SUPABASE_PAT>"; "Content-Type" = "application/json; charset=utf-8" } `
  -Body $bytes
```
(El PAT de Supabase está en `.env.local` → `SUPABASE_ACCESS_TOKEN`.)

### Subir el rate limit
Con SMTP propio ya se puede subir el límite de envío (hoy `rate_limit_email_sent = 2`):
```powershell
# dentro del mismo PATCH o en otro:
rate_limit_email_sent = 30   # o el que convenga
```

---

## 4. Lo que YA está configurado (no rehacer)

Estas piezas se dejaron listas el 2026-06-17 y **no hay que tocarlas**:

- **Política de contraseñas:** `password_min_length = 8`, `password_required_characters`
  = letras + números.
- **Site URL:** `https://blacklabelmarket.es`.
- **Redirect URLs** (`uri_allow_list`): apex + `www` + `localhost:3000`.
- **Plantilla de email de recovery:** asunto "Restablece tu contraseña - Black Label Market"
  y cuerpo apuntando a:
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
  (fuente versionada en `supabase/email-templates/recovery.html`).
- **Código del flujo:** `/recuperar`, `/auth/confirm` (route handler con `verifyOtp`),
  `/reset-password`. Todo desplegado.

---

## 5. Plantillas de email pendientes de personalizar

Supabase tiene varias plantillas; solo se ha personalizado la de **recovery**. Cuando haya
SMTP conviene revisar/marcar el resto con identidad Black Label (mismo estilo charcoal+gold):

| Plantilla | Asunto sugerido | Estado |
|---|---|---|
| Recovery (reset contraseña) | Restablece tu contraseña… | ✅ Hecha |
| Confirm signup (confirmación de registro) | Confirma tu cuenta… | ⬜ Por personalizar |
| Magic Link | — | ⬜ (no se usa hoy) |
| Change Email Address | Confirma tu nuevo email… | ⬜ Por personalizar |
| Invite User | — | ⬜ (si se usa para invitar equipo) |

> Todas deben usar el patrón `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<tipo>&next=<ruta>`
> para que funcione el route handler `/auth/confirm` (no depende del code-verifier en cookie →
> funciona aunque el email se abra en otro dispositivo). El route handler ya soporta cualquier
> `type` de `EmailOtpType` (signup, recovery, email_change, etc.).

> ⚠️ Al editar plantillas vía Management API desde PowerShell 5.1, enviar el body como
> **bytes UTF-8** (`[System.Text.Encoding]::UTF8.GetBytes(...)`) o las tildes/ñ se corrompen
> (se vio el 2026-06-17). Mejor: guardar el HTML en `supabase/email-templates/*.html` y leerlo
> con `[System.IO.File]::ReadAllText(path, UTF8)`.

---

## 6. Emails transaccionales de negocio (vía n8n)

Independientes de Supabase Auth. Cuando se monten los flujos n8n (ver
`docs/backlog-alertas-y-vehiculos-a-la-carta.md` y la sección 6 de
`docs/pendientes-configuracion-externa.md`), usar el **mismo proveedor** (Resend API) para:

- Lead caliente sin atender.
- Nuevas oportunidades de vehículos a la carta.
- Confirmación de cita.
- Vehículo aprobado / rechazado.

Así el dominio remitente y su reputación están centralizados.

---

## 7. Verificación final (checklist)

Tras configurar SMTP:

- [ ] Dominio verificado en el proveedor (SPF + DKIM + DMARC en verde).
- [ ] SMTP custom activo en Supabase (Opción A o B).
- [ ] `rate_limit_email_sent` subido.
- [ ] Probar `/recuperar` con un email real → llega el correo desde `blacklabelmarket.es`
      (no de Supabase) y **no** cae en spam.
- [ ] El enlace abre `/auth/confirm` → redirige a `/reset-password` → se cambia la contraseña.
- [ ] Probar registro de comprador → llega el email de confirmación.
- [ ] Quitar la **sección 7** de `docs/pendientes-configuracion-externa.md` (queda resuelta).
