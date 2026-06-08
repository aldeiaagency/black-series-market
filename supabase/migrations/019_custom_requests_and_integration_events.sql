-- Migration 019: custom_requests (vehículos a la carta) + integration_events (outbox n8n)
-- Purpose:
--   1. Persist "vehículos a la carta" requests server-side (previously localStorage-only).
--   2. Durable outbox of business events so n8n can consume them reliably.
-- Safe to apply: only creates new tables, no changes to existing data.

-- ── Vehículos a la carta ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_requests (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_type  TEXT NOT NULL DEFAULT 'custom_vehicle',
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  vehicle_type  TEXT,
  brand         TEXT,
  model         TEXT,
  version       TEXT,
  budget_min    NUMERIC,
  budget_max    NUMERIC,
  budget_text   TEXT,
  location      TEXT,
  timeframe     TEXT,
  financing     TEXT,
  trade_in      TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'in_review', 'contacted', 'matched', 'closed', 'discarded')),
  source        TEXT DEFAULT 'web',
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_requests_status      ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at  ON custom_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_user_id     ON custom_requests(user_id);

ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

-- Inserts happen server-side with the service role (which bypasses RLS), so no public
-- INSERT policy is needed. A logged-in user may read their own requests; admins read via
-- the service role. No public SELECT.
CREATE POLICY "Users view own custom requests"
  ON custom_requests FOR SELECT
  USING (auth.uid() = user_id);

-- ── Outbox de eventos para n8n / automatizaciones ────────────────────────────
CREATE TABLE IF NOT EXISTS integration_events (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type   TEXT NOT NULL,
  entity_type  TEXT,
  entity_id    UUID,
  payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'sent', 'failed')),
  attempts     INTEGER NOT NULL DEFAULT 0,
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_integration_events_status      ON integration_events(status);
CREATE INDEX IF NOT EXISTS idx_integration_events_event_type  ON integration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_integration_events_created_at  ON integration_events(created_at DESC);

-- Fully private: only the service role (admin client) reads/writes this table.
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;
