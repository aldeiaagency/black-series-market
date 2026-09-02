// Listas de columnas públicas seguras para `dealers` y `vehicles` — deben coincidir EXACTAMENTE
// con los GRANT SELECT (columnas) de supabase/migrations/107_column_level_public_grants.sql.
//
// Auditoría de seguridad 2026-09-02 (P0.2): RLS filtra filas, no columnas. `dealers`/`vehicles`
// tenían SELECT de tabla completo para anon/authenticated, exponiendo columnas internas
// (profile_id, stripe_*, admin_notes, VIN...) a cualquiera con la anon key pública.
//
// Importante: una vez aplicado el GRANT por columnas, `select('*')` contra estas tablas FALLA
// con error para anon/authenticated (comportamiento documentado de PostgREST/Supabase — no
// estrecha el wildcard, lo rechaza). Toda query pública debe usar estas listas explícitas, nunca
// `*`, contra `dealers` o `vehicles` directamente.

export const VEHICLE_PUBLIC_COLUMNS = [
  'id', 'dealer_id', 'brand_id', 'slug', 'vehicle_type', 'status',
  'brand_name', 'model_name', 'version', 'year',
  'displacement_cc', 'power_hp', 'power_kw', 'torque_nm', 'fuel_type', 'cylinders', 'engine_config',
  'zero_to_hundred', 'top_speed_kmh',
  'transmission', 'drive_type', 'weight_kg',
  'color_exterior', 'color_interior', 'upholstery', 'body_type',
  'mileage_km', 'registration_year', 'registration_country', 'itv_valid_until',
  'has_carfax', 'has_service_history', 'condition_type', 'location_province',
  'license_type', 'category', 'num_owners', 'has_warranty', 'warranty_months', 'doors', 'seats', 'dgt_label',
  'has_abs', 'has_traction_control', 'has_riding_modes', 'has_electronic_suspension', 'has_panniers',
  'has_test_drive',
  'price', 'price_on_request', 'is_negotiable', 'accepts_trade_in', 'financing_available',
  'iva_deducible', 'national_delivery', 'currency',
  'title', 'description', 'equipment', 'images', 'video_url',
  'is_featured', 'featured_until', 'published_at', 'updated_at',
].join(', ')

export const DEALER_PUBLIC_COLUMNS = [
  'id', 'slug', 'name', 'description', 'logo_url', 'cover_url',
  'location_city', 'location_region', 'address', 'postal_code',
  'phone', 'whatsapp', 'email', 'attention_note',
  'website', 'instagram', 'facebook_url', 'youtube_url', 'tiktok_url', 'linkedin_url',
  'years_in_business', 'certifications', 'services',
  'status', 'profile_status', 'is_featured', 'is_verified',
].join(', ')
