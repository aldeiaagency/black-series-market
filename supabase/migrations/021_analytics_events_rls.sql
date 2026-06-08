-- Migration 021: RLS para analytics_events
-- Purpose:
--   analytics_events was created without RLS, leaving it world-readable/writable.
--   We enable RLS while preserving the two legitimate access patterns:
--     1. Public/anon tracking INSERTs (vehicle views, clicks) keep working.
--     2. A dealer can read ONLY their own dealer's events (dashboard analytics).
--   Public SELECT of global metrics is blocked. UPDATE/DELETE are blocked for everyone
--   except the service role (which bypasses RLS and powers the admin analytics).
-- Safe to apply: does not modify existing rows.

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Tracking: anyone (anon or authenticated) may insert events. The set of allowed
-- event_type values is enforced at the application layer (/api/track + server pages).
DROP POLICY IF EXISTS "Public can insert analytics" ON analytics_events;
CREATE POLICY "Public can insert analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- A dealer may read the analytics events that belong to their own dealer record.
-- This powers the seller dashboard without exposing cross-dealer or global metrics.
DROP POLICY IF EXISTS "Dealers read own analytics" ON analytics_events;
CREATE POLICY "Dealers read own analytics"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dealers d
      WHERE d.id = analytics_events.dealer_id
        AND d.profile_id = auth.uid()
    )
  );

-- No SELECT policy for anonymous users → global metrics are not publicly readable.
-- No UPDATE/DELETE policies → mutation is reserved to the service role.
