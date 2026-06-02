-- Migration 005: Add metadata and user_id to analytics_events
-- Purpose: Enable filter tracking, user-level analysis, and richer event context.
-- Safe to apply: both columns are nullable, no existing rows are affected.
-- Run in: Supabase Dashboard → SQL Editor

ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type_created ON analytics_events(event_type, created_at DESC);

-- Example of what metadata will contain per event type:
-- vehicle_view:           { vehicle_type, brand_name, model_name }
-- vehicle_contact_submit: { vehicle_type, brand_name, model_name }
-- vehicle_whatsapp_click: { vehicle_type, brand_name }
-- vehicle_phone_click:    { vehicle_type }
-- vehicle_saved:          { vehicle_type, brand_name }
-- filter_used:            { filters: { marca, precio_max, año_min, ... }, vehicle_type, page }
-- professional_profile_view: { dealer_name }
-- search_alert_created:   { vehicle_type }
-- vehicle_request_submit: { vehicle_type }
