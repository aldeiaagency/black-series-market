-- Migration 020: search_alerts — soporte para alertas anónimas + columna source
-- Purpose:
--   Anonymous (logged-out) search alerts must persist server-side, not only in
--   localStorage. Inserts are performed by the server with the service role, which
--   bypasses RLS; user_id is nullable so anonymous alerts are allowed. We only add a
--   `source` column for provenance and helpful indexes. Existing logged-in alert
--   reads (RLS: auth.uid() = user_id) remain unchanged.
-- Safe to apply: additive only.

ALTER TABLE search_alerts
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';

CREATE INDEX IF NOT EXISTS idx_search_alerts_email      ON search_alerts(email);
CREATE INDEX IF NOT EXISTS idx_search_alerts_is_active  ON search_alerts(is_active);
