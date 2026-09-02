-- Migration 107 — Cierra P0.2 de la auditoría de seguridad 2026-09-02.
--
-- RLS filtra FILAS, no columnas. `dealers` y `vehicles` tenían SELECT de tabla completo
-- concedido a `anon`/`authenticated` (el grant por defecto de Supabase), así que cualquiera con
-- la anon key pública podía leer TODAS las columnas de cualquier fila pública vía
-- `GET /rest/v1/dealers?select=*` — incluidos profile_id (UUID de Auth), stripe_customer_id,
-- stripe_subscription_id, admin_notes, vehicle_slots, y en vehicles: VIN, admin_notes,
-- rejection_reason, moderation_notes.
--
-- Fix: GRANT SELECT a nivel de columna, allowlist única para anon Y authenticated (ningún
-- usuario público necesita más que otro; el propio dueño gestiona su perfil completo por rutas
-- con service_role — ver /api/me/profile, /api/me/showroom, y la RPC
-- get_own_dealer_summary de la migración 106).
--
-- Requisito previo (ya aplicado en el código de esta sesión, antes de esta migración):
--   - Ninguna query pública/autenticada de la app pide ya `profile_id` ni `subscription_plan`
--     explícitamente (mapeado archivo por archivo — ver
--     docs/auditoria-seguridad-completa-2026-09-02.md P0.2).
--   - `SELECT *` sigue funcionando: PostgREST expande `*` solo a las columnas con grant real
--     para el rol que hace la petición, no falla ni expone las demás.
--   - Los UPDATE (perfil, vehículos) siguen intactos: RLS evalúa profile_id internamente en la
--     policy sin necesitar que el rol tenga SELECT sobre esa columna.

-- ── dealers ──────────────────────────────────────────────────────────────────
REVOKE SELECT ON public.dealers FROM anon, authenticated;
GRANT SELECT (
  id, slug, name, description, logo_url, cover_url,
  location_city, location_region, address, postal_code,
  phone, whatsapp, email, attention_note,
  website, instagram, facebook_url, youtube_url, tiktok_url, linkedin_url,
  years_in_business, certifications, services,
  status, profile_status, is_featured, is_verified
) ON public.dealers TO anon, authenticated;

-- ── vehicles ─────────────────────────────────────────────────────────────────
REVOKE SELECT ON public.vehicles FROM anon, authenticated;
GRANT SELECT (
  id, dealer_id, brand_id, slug, vehicle_type, status,
  brand_name, model_name, version, year,
  displacement_cc, power_hp, power_kw, torque_nm, fuel_type, cylinders, engine_config,
  zero_to_hundred, top_speed_kmh,
  transmission, drive_type, weight_kg,
  color_exterior, color_interior, upholstery, body_type,
  mileage_km, registration_year, registration_country, itv_valid_until,
  has_carfax, has_service_history, condition_type, location_province,
  license_type, category, num_owners, has_warranty, warranty_months, doors, seats, dgt_label,
  has_abs, has_traction_control, has_riding_modes, has_electronic_suspension, has_panniers,
  has_test_drive,
  price, price_on_request, is_negotiable, accepts_trade_in, financing_available,
  iva_deducible, national_delivery, currency,
  title, description, equipment, images, video_url,
  is_featured, featured_until, published_at, updated_at
) ON public.vehicles TO anon, authenticated;

-- ── dealer_gallery_images (misma familia de problema, menor sensibilidad) ─────
REVOKE SELECT ON public.dealer_gallery_images FROM anon, authenticated;
GRANT SELECT (id, dealer_id, storage_path, position)
  ON public.dealer_gallery_images TO anon, authenticated;
