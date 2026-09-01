-- Migration 104 — Cierra la mitad de P0.6 de la auditoría de seguridad 2026-09-02.
--
-- app/api/onboarding/[token]/upload/route.ts guardaba TODOS los tipos de subida de onboarding
-- —incluidos `document` (contratos/DNI/lo que suba el fundador) y `stock_csv` (inventario
-- completo)— en el bucket público `vehicle-images` y devolvía getPublicUrl() sin expiración.
-- Si alguien obtiene o filtra esa URL, el documento queda accesible para siempre sin
-- autenticación. `logo`/`cover`/`gallery` SÍ deben ser públicos (se muestran en el perfil
-- público del showroom) — se quedan en vehicle-images. `document`/`stock_csv`/`stock_bulk` pasan
-- a este bucket privado; la ruta sirve una signed URL con expiración en vez de una URL pública.
--
-- Solo el service_role necesita acceso (todas las escrituras/lecturas van por
-- createAdminClient(), que bypassa RLS/policies de storage) — sin policies adicionales de
-- storage.objects para anon/authenticated.

INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding-private', 'onboarding-private', false)
ON CONFLICT (id) DO NOTHING;
