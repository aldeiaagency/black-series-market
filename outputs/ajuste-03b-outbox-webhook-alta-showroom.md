# Ajuste 03b - Outbox webhook alta showroom

## Archivos modificados

- `app/api/auth/register-dealer/route.ts`
- `lib/integrations/n8n.ts`

## Cambios

- Se crea `notifyShowroomApplicationCreated`.
- Cada alta de showroom registra evento en `integration_events` con:
  - `event_type = showroom_application.created`
  - `entity_type = showroom_application`
  - `entity_id = application.id`
  - `payload = payload completo enviado a n8n`
  - `status = pending`
- Si el webhook responde OK, el evento pasa a `sent` con `sent_at` y `attempts = 1`.
- Si el webhook falla, el evento pasa a `failed` con `attempts = 1` y `last_error`.
- Si falta URL o secret, queda `pending` para retry futuro.

## Verificacion

- `npm run lint`: correcto, con aviso previo no relacionado.
- `npm run build`: correcto tras el ajuste de `/opengraph-image`.
- `git diff --check`: correcto.
