-- Add national_delivery field to vehicles
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS national_delivery BOOLEAN NOT NULL DEFAULT FALSE;
