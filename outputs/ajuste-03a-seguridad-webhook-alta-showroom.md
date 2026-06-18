# Ajuste 03a - Seguridad webhook alta showroom

## Archivos modificados

- `app/api/auth/register-dealer/route.ts`
- `.env.local.example`

## Cambios

- Se anade `N8N_WEBHOOK_DEALER_SIGNUP_SECRET=`.
- El webhook se firma con HMAC SHA-256 sobre el mismo string JSON enviado en el body.
- Headers enviados:
  - `content-type: application/json`
  - `x-blacklabel-event: showroom_application.created`
  - `x-blacklabel-timestamp`
  - `x-blacklabel-signature: sha256=<firma>`
- Si falta URL, no se envia nada.
- Si falta secret, no se envia webhook y se registra warning seguro.

## Verificacion

- `npm run lint`: correcto, con aviso previo no relacionado.
- `npm run build`: correcto tras el ajuste de `/opengraph-image`.
- `git diff --check`: correcto.
