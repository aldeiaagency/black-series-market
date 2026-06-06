-- Migration 013: Convert vehicles.category from ENUM to TEXT
--
-- The vehicle_category ENUM was created with legacy English values
-- (luxury_executive, classics_youngtimers, sport_supersport, etc.)
-- but the dashboard form and public filters use Spanish values
-- (clasicos, deportivos, superdeportivos, suv_premium, lujo_alta_gama,
-- unidades_especiales). This conversion makes the column accept any string
-- while preserving all existing data.

ALTER TABLE vehicles
  ALTER COLUMN category TYPE TEXT USING category::TEXT;
