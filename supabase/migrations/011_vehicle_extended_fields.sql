-- Migration 011: Extended vehicle fields (dashboard publicar form)
-- All columns use ADD COLUMN IF NOT EXISTS — safe to run multiple times.

ALTER TABLE vehicles
  -- Moto: carnet requerido
  ADD COLUMN IF NOT EXISTS license_type              TEXT,

  -- Categoría del vehículo (sport_performance, classic, etc.)
  ADD COLUMN IF NOT EXISTS category                  TEXT,

  -- Historial: número de propietarios anteriores
  ADD COLUMN IF NOT EXISTS num_owners                INTEGER,

  -- Garantía
  ADD COLUMN IF NOT EXISTS has_warranty              BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS warranty_months           INTEGER,

  -- Carrocería: puertas y plazas
  ADD COLUMN IF NOT EXISTS doors                     INTEGER,
  ADD COLUMN IF NOT EXISTS seats                     INTEGER,

  -- Etiqueta medioambiental DGT
  ADD COLUMN IF NOT EXISTS dgt_label                 TEXT,

  -- Electrónica de moto
  ADD COLUMN IF NOT EXISTS has_abs                   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_traction_control      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_riding_modes          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_electronic_suspension BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_panniers              BOOLEAN DEFAULT FALSE,

  -- Prueba disponible
  ADD COLUMN IF NOT EXISTS has_test_drive            BOOLEAN DEFAULT FALSE;
