-- Migration 031: Dealer services
-- Adds a services array to dealers for showcasing offered services

ALTER TABLE dealers ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}';
