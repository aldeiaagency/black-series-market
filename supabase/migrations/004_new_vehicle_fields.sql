-- ============================================================
-- Migration 004: New vehicle fields for enhanced filtering
-- ============================================================

-- Estado del vehículo (condition): nuevo, seminuevo, ocasión, etc.
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS condition_type TEXT;

-- IVA deducible (business buyers)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS iva_deducible BOOLEAN DEFAULT FALSE;

-- Vehicle location (denormalized from dealer for efficient filtering)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS location_province TEXT;

-- Indexes for the new filterable columns
CREATE INDEX IF NOT EXISTS idx_vehicles_condition_type    ON vehicles (condition_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_iva_deducible     ON vehicles (iva_deducible);
CREATE INDEX IF NOT EXISTS idx_vehicles_location_province ON vehicles (location_province);

-- ── Normalize existing body_type values to Spanish standard ──────────────────

-- Sedán → Berlina
UPDATE vehicles SET body_type = 'Berlina'
WHERE body_type IN ('Sedán', 'Sedan', 'Berlina') AND body_type != 'Berlina';

-- Hot Hatch → Compacto deportivo
UPDATE vehicles SET body_type = 'Compacto deportivo'
WHERE body_type = 'Hot Hatch';

-- SUV / Crossover → SUV
UPDATE vehicles SET body_type = 'SUV'
WHERE body_type IN ('SUV / Crossover', 'Crossover');

-- Gran Turismo → remains as Coupé or GT depending on context; leave as is for now
-- Deportivo / Clásico are category concepts, not body types — leave for manual admin correction
