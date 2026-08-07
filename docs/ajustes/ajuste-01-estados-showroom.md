# Ajuste 01 - Estados showroom

## Archivos modificados

- `supabase/migrations/049_showroom_applications_pending_info_status.sql`
- `app/api/auth/register-dealer/route.ts`

## Cambios

- Se permite `pending_info` en `showroom_applications.status`.
- El indice unico parcial de solicitudes pendientes por email incluye `pending_info`.
- La deteccion de duplicados en el registro de showroom considera `new`, `in_review` y `pending_info`.

## Verificacion

- `npm run lint`: correcto, con aviso previo no relacionado.
- `npm run build`: correcto tras el ajuste de `/opengraph-image`.
- `git diff --check`: correcto.
