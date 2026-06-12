-- Migration 029: Seeds v2 — planes, límites, features y addons
-- Datos definitivos de black-label-market-ficha-precios-v2.md
-- ON CONFLICT DO UPDATE → idempotente.

-- ─── PLANES ──────────────────────────────────────────────────────────────────

INSERT INTO plans (slug, name, monthly_price, annual_price, founding_monthly_price, status, sort_order)
VALUES
  ('essential',    'Essential',    179,  1790, 149, 'active', 1),
  ('professional', 'Professional', 449,  4490, 349, 'active', 2),
  ('elite',        'Elite',        899,  8990, 699, 'active', 3),
  ('grupo',        'Grupo',        NULL, NULL, NULL,'active', 4)
ON CONFLICT (slug) DO UPDATE SET
  name                  = EXCLUDED.name,
  monthly_price         = EXCLUDED.monthly_price,
  annual_price          = EXCLUDED.annual_price,
  founding_monthly_price= EXCLUDED.founding_monthly_price,
  sort_order            = EXCLUDED.sort_order,
  updated_at            = NOW();

-- ─── LÍMITES ─────────────────────────────────────────────────────────────────

-- Función auxiliar para upsert por slug + key
WITH p AS (SELECT id, slug FROM plans)
INSERT INTO plan_limits (plan_id, key, value_number)
SELECT p.id, l.key, l.val
FROM p
JOIN (VALUES
  -- essential
  ('essential','max_active_vehicles',   15),
  ('essential','max_users',              1),
  ('essential','max_locations',          1),
  ('essential','included_boosts_month',  0),
  ('essential','analytics_retention_days', 30),
  ('essential','max_extra_vehicle_blocks', 2),
  -- professional
  ('professional','max_active_vehicles', 50),
  ('professional','max_users',            3),
  ('professional','max_locations',        1),
  ('professional','included_boosts_month',1),
  ('professional','analytics_retention_days',180),
  -- elite
  ('elite','max_active_vehicles',      100),
  ('elite','max_users',                 10),
  ('elite','max_locations',              1),
  ('elite','included_boosts_month',      3),
  ('elite','analytics_retention_days', 365),
  -- grupo (por sede)
  ('grupo','max_active_vehicles',      100),
  ('grupo','max_users',                 10),
  ('grupo','max_locations',             99),
  ('grupo','included_boosts_month',      3),
  ('grupo','analytics_retention_days', 365)
) AS l(slug, key, val) ON p.slug = l.slug
ON CONFLICT (plan_id, key) DO UPDATE SET value_number = EXCLUDED.value_number;

-- ─── FEATURES ────────────────────────────────────────────────────────────────

WITH p AS (SELECT id, slug FROM plans)
INSERT INTO plan_features (plan_id, feature_key, included, availability_status, public_visible, display_label)
SELECT p.id, f.key, f.inc, f.avail, f.pub_vis, f.label
FROM p
JOIN (VALUES
  -- verified_profile
  ('essential',    'verified_profile',           TRUE,  'operative', TRUE,  NULL),
  ('professional', 'verified_profile',           TRUE,  'operative', TRUE,  NULL),
  ('elite',        'verified_profile',           TRUE,  'operative', TRUE,  NULL),
  -- premium_activation
  ('essential',    'premium_activation',         TRUE,  'operative', TRUE,  NULL),
  ('professional', 'premium_activation',         TRUE,  'operative', TRUE,  NULL),
  ('elite',        'premium_activation',         TRUE,  'operative', TRUE,  NULL),
  -- manual_inventory
  ('essential',    'manual_inventory',           TRUE,  'operative', TRUE,  NULL),
  ('professional', 'manual_inventory',           TRUE,  'operative', TRUE,  NULL),
  ('elite',        'manual_inventory',           TRUE,  'operative', TRUE,  NULL),
  -- csv_recurring
  ('essential',    'csv_recurring',              FALSE, 'operative', TRUE,  NULL),
  ('professional', 'csv_recurring',              TRUE,  'operative', TRUE,  NULL),
  ('elite',        'csv_recurring',              TRUE,  'operative', TRUE,  NULL),
  -- opportunities_inbox
  ('essential',    'opportunities_inbox',        TRUE,  'operative', TRUE,  NULL),
  ('professional', 'opportunities_inbox',        TRUE,  'operative', TRUE,  NULL),
  ('elite',        'opportunities_inbox',        TRUE,  'operative', TRUE,  NULL),
  -- pipeline
  ('essential',    'pipeline',                   FALSE, 'operative', TRUE,  NULL),
  ('professional', 'pipeline',                   TRUE,  'partial',   TRUE,  NULL),
  ('elite',        'pipeline',                   TRUE,  'partial',   TRUE,  NULL),
  -- analytics_basic
  ('essential',    'analytics_basic',            TRUE,  'operative', TRUE,  NULL),
  ('professional', 'analytics_basic',            TRUE,  'operative', TRUE,  NULL),
  ('elite',        'analytics_basic',            TRUE,  'operative', TRUE,  NULL),
  -- analytics_advanced
  ('essential',    'analytics_advanced',         FALSE, 'operative', TRUE,  NULL),
  ('professional', 'analytics_advanced',         TRUE,  'partial',   TRUE,  NULL),
  ('elite',        'analytics_advanced',         TRUE,  'partial',   TRUE,  NULL),
  -- analytics_extended_compare
  ('essential',    'analytics_extended_compare', FALSE, 'operative', TRUE,  NULL),
  ('professional', 'analytics_extended_compare', FALSE, 'operative', TRUE,  NULL),
  ('elite',        'analytics_extended_compare', TRUE,  'partial',   TRUE,  NULL),
  -- vehicles_on_request (a la carta)
  ('essential',    'vehicles_on_request',        TRUE,  'operative', TRUE,  'stock_matches_only'),
  ('professional', 'vehicles_on_request',        TRUE,  'operative', TRUE,  'general_board'),
  ('elite',        'vehicles_on_request',        TRUE,  'operative', TRUE,  'general_board'),
  -- vehicles_on_request_priority (FUTURE — oculto)
  ('essential',    'vehicles_on_request_priority', FALSE,'future',   FALSE, NULL),
  ('professional', 'vehicles_on_request_priority', FALSE,'future',   FALSE, NULL),
  ('elite',        'vehicles_on_request_priority', FALSE,'future',   FALSE, NULL),
  -- showroom_featured (Destacado — solo Elite)
  ('essential',    'showroom_featured',          FALSE, 'operative', TRUE,  NULL),
  ('professional', 'showroom_featured',          FALSE, 'operative', TRUE,  NULL),
  ('elite',        'showroom_featured',          TRUE,  'operative', TRUE,  'Destacado'),
  -- showroom_listing_priority
  ('essential',    'showroom_listing_priority',  FALSE, 'operative', TRUE,  NULL),
  ('professional', 'showroom_listing_priority',  FALSE, 'operative', TRUE,  NULL),
  ('elite',        'showroom_listing_priority',  TRUE,  'operative', TRUE,  'elite_block'),
  -- feed_sync (FUTURE — oculto en Professional; oculto en Elite)
  ('essential',    'feed_sync',                  FALSE, 'future',    FALSE, NULL),
  ('professional', 'feed_sync',                  FALSE, 'future',    FALSE, NULL),
  ('elite',        'feed_sync',                  FALSE, 'future',    FALSE, NULL),
  -- consolidated_view (solo grupo)
  ('essential',    'consolidated_view',          FALSE, 'operative', TRUE,  NULL),
  ('professional', 'consolidated_view',          FALSE, 'operative', TRUE,  NULL),
  ('elite',        'consolidated_view',          FALSE, 'operative', TRUE,  NULL)
) AS f(slug, key, inc, avail, pub_vis, label) ON p.slug = f.slug
ON CONFLICT (plan_id, feature_key) DO UPDATE SET
  included            = EXCLUDED.included,
  availability_status = EXCLUDED.availability_status,
  public_visible      = EXCLUDED.public_visible,
  display_label       = EXCLUDED.display_label;

-- Grupo: consolidated_view activo
UPDATE plan_features pf
SET included = TRUE, display_label = 'partial'
FROM plans p
WHERE p.id = pf.plan_id AND p.slug = 'grupo' AND pf.feature_key = 'consolidated_view';

-- ─── ADDONS ──────────────────────────────────────────────────────────────────

INSERT INTO addons (slug, name, description, price, price_max, recurrence, billing_unit, status, is_consultive, public_visible, sort_order, rules)
VALUES
  ('boost_7d',
   'Boost 7 días',
   'Posiciona un vehículo en primer lugar de resultados durante 7 días.',
   49, NULL, 'one_time', NULL, 'active', FALSE, TRUE, 1, '{}'),

  ('pack_5_boosts',
   'Pack 5 Boosts',
   '5 boosts con caducidad de 180 días desde la compra.',
   199, NULL, 'one_time', NULL, 'active', FALSE, TRUE, 2,
   '{"quantity": 5, "expiry_days": 180}'),

  ('block_10_vehicles',
   '+10 vehículos activos',
   'Bloque de 10 slots adicionales de vehículos activos. Essential: máx. 2 bloques.',
   59, NULL, 'recurring', 'month', 'active', FALSE, TRUE, 3,
   '{"slots": 10}'),

  ('block_25_vehicles',
   '+25 vehículos activos',
   'Bloque de 25 slots para Elite. Para inventarios superiores a 200 activos se revisa el encaje editorial.',
   99, NULL, 'recurring', 'month', 'active', FALSE, TRUE, 4,
   '{"slots": 25}'),

  ('extra_user',
   'Usuario adicional',
   'Añade un miembro al equipo. Disponible en Professional y Elite.',
   19, NULL, 'recurring', 'seat', 'active', FALSE, TRUE, 5, '{}'),

  ('extra_location',
   'Sede adicional',
   'Al 50% del precio del plan base. Para el modelo Grupo. Gestión consultiva.',
   NULL, NULL, 'recurring', 'month', 'active', TRUE, TRUE, 6,
   '{"price_factor": 0.5}'),

  ('advanced_migration',
   'Migración avanzada de inventario',
   'Importación y normalización de catálogo existente. Desde 290 € (precio final según volumen).',
   290, NULL, 'one_time', NULL, 'active', TRUE, TRUE, 7, '{}'),

  ('feed_sync',
   'Sincronización de feed',
   'Conexión automática con tu DMS o portal de origen. 99 €/mes + setup.',
   99, NULL, 'recurring', 'month', 'future', FALSE, FALSE, 8,
   '{"setup_fee": true}'),

  ('editorial_slot',
   'Espacio editorial',
   'Aparición en contenido editorial del mercado (guías, selecciones). Sujeto a aprobación editorial. 150-300 €.',
   150, 300, 'one_time', NULL, 'active', TRUE, TRUE, 9, '{}'),

  ('antifuga_express',
   'Diagnóstico Anti-Fuga Express',
   'Análisis y plan de acción para reducir abandono de fichas. Servicio de Black Series Agency.',
   149, NULL, 'one_time', NULL, 'active', TRUE, TRUE, 10, '{}')

ON CONFLICT (slug) DO UPDATE SET
  name         = EXCLUDED.name,
  description  = EXCLUDED.description,
  price        = EXCLUDED.price,
  price_max    = EXCLUDED.price_max,
  recurrence   = EXCLUDED.recurrence,
  billing_unit = EXCLUDED.billing_unit,
  status       = EXCLUDED.status,
  is_consultive= EXCLUDED.is_consultive,
  public_visible=EXCLUDED.public_visible,
  sort_order   = EXCLUDED.sort_order,
  rules        = EXCLUDED.rules;

-- Compatibilidad addons ↔ planes
-- block_10_vehicles → essential, professional
-- block_25_vehicles → elite, grupo
-- extra_user → professional, elite, grupo
-- boost_7d, pack_5_boosts → professional, elite, grupo (essential no tiene boosts incluidos pero puede comprar)
-- advanced_migration, editorial_slot, antifuga_express → todos
-- feed_sync → professional (future)

WITH
  a AS (SELECT id, slug FROM addons),
  p AS (SELECT id, slug FROM plans)
INSERT INTO addon_plan_compatibility (addon_id, plan_id)
SELECT a.id, p.id FROM a, p WHERE (a.slug, p.slug) IN (
  ('boost_7d',           'essential'),
  ('boost_7d',           'professional'),
  ('boost_7d',           'elite'),
  ('boost_7d',           'grupo'),
  ('pack_5_boosts',      'essential'),
  ('pack_5_boosts',      'professional'),
  ('pack_5_boosts',      'elite'),
  ('pack_5_boosts',      'grupo'),
  ('block_10_vehicles',  'essential'),
  ('block_10_vehicles',  'professional'),
  ('block_25_vehicles',  'elite'),
  ('block_25_vehicles',  'grupo'),
  ('extra_user',         'professional'),
  ('extra_user',         'elite'),
  ('extra_user',         'grupo'),
  ('extra_location',     'grupo'),
  ('advanced_migration', 'essential'),
  ('advanced_migration', 'professional'),
  ('advanced_migration', 'elite'),
  ('advanced_migration', 'grupo'),
  ('feed_sync',          'professional'),
  ('editorial_slot',     'essential'),
  ('editorial_slot',     'professional'),
  ('editorial_slot',     'elite'),
  ('editorial_slot',     'grupo'),
  ('antifuga_express',   'essential'),
  ('antifuga_express',   'professional'),
  ('antifuga_express',   'elite'),
  ('antifuga_express',   'grupo')
)
ON CONFLICT DO NOTHING;

-- ─── ELITE CAPACITY — regla inicial ──────────────────────────────────────────
-- Máx. 3 Elite por provincia+categoría; ≤20% de los showrooms activos del ámbito.
-- Regla nacional como fallback.

INSERT INTO elite_capacity_rules
  (geographic_scope_type, geographic_scope_id, category, max_elite_showrooms, max_elite_share, availability_status)
VALUES
  ('country', 'ES', '*', NULL, 0.20, 'available')
ON CONFLICT DO NOTHING;
