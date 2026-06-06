-- Migration 012: equipment_extra field for additional vehicle equipment notes
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS equipment_extra TEXT;
