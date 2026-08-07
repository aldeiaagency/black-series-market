# Ajuste 02 - Payload webhook alta showroom

## Archivo modificado

- `app/api/auth/register-dealer/route.ts`

## Cambios

- El payload de `N8N_WEBHOOK_DEALER_SIGNUP` incluye `dealer_application_id`, `application_id`, `showroom_name`, `city`, `province`, `website_url`, `portals`, `status`, `created_at`, `admin_url` al detalle y `source`.
- Se mantienen alias legacy: `application_id`, `dealer_name`, `location_city`, `location_region`, `website` y `portales`.
- `created_at` procede del registro creado en Supabase, con fallback documentado.
- `admin_url` apunta a `/admin/altas-showroom/{id}`.

## Verificacion

- `npm run lint`: correcto, con aviso previo no relacionado.
- `npm run build`: correcto tras el ajuste de `/opengraph-image`.
- `git diff --check`: correcto.
