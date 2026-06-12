-- Migration 034: Analytics daily rollup + fix feature flag statuses
-- 1. Fix analytics_advanced and analytics_extended_compare from 'partial' → 'operative'
-- 2. Create analytics_daily rollup table (dealer-level daily aggregates for evolution charts)
-- 3. Trigger to maintain rollup on analytics_events INSERT
-- 4. Backfill existing data from analytics_events

-- ─── 1. Fix feature flag statuses ─────────────────────────────────────────────

UPDATE plan_features
SET availability_status = 'operative'
WHERE feature_key IN ('analytics_advanced', 'analytics_extended_compare')
  AND availability_status = 'partial';

-- ─── 2. analytics_daily rollup ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS analytics_daily (
  date      DATE NOT NULL,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  views     INTEGER NOT NULL DEFAULT 0,
  contacts  INTEGER NOT NULL DEFAULT 0,
  saved     INTEGER NOT NULL DEFAULT 0,
  whatsapp  INTEGER NOT NULL DEFAULT 0,
  phone     INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT analytics_daily_pkey PRIMARY KEY (date, dealer_id)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_dealer
  ON analytics_daily (dealer_id, date DESC);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_daily_dealer_select" ON analytics_daily FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dealers d
    WHERE d.id = analytics_daily.dealer_id AND d.profile_id = auth.uid()
  ));

CREATE POLICY "analytics_daily_service_all" ON analytics_daily FOR ALL
  USING (auth.role() = 'service_role');

-- ─── 3. Trigger function ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_analytics_daily_upsert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.dealer_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO analytics_daily (date, dealer_id, views, contacts, saved, whatsapp, phone)
  VALUES (
    NEW.created_at::date,
    NEW.dealer_id,
    CASE WHEN NEW.event_type IN ('vehicle_view','view')                  THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type IN ('vehicle_contact_submit','contact')     THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'vehicle_saved'                          THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'vehicle_whatsapp_click'                 THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'vehicle_phone_click'                    THEN 1 ELSE 0 END
  )
  ON CONFLICT (date, dealer_id) DO UPDATE SET
    views    = analytics_daily.views    + EXCLUDED.views,
    contacts = analytics_daily.contacts + EXCLUDED.contacts,
    saved    = analytics_daily.saved    + EXCLUDED.saved,
    whatsapp = analytics_daily.whatsapp + EXCLUDED.whatsapp,
    phone    = analytics_daily.phone    + EXCLUDED.phone;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_analytics_daily ON analytics_events;
CREATE TRIGGER trg_analytics_daily
  AFTER INSERT ON analytics_events
  FOR EACH ROW EXECUTE FUNCTION fn_analytics_daily_upsert();

-- ─── 4. Backfill from existing analytics_events ───────────────────────────────

INSERT INTO analytics_daily (date, dealer_id, views, contacts, saved, whatsapp, phone)
SELECT
  created_at::date                                                                     AS date,
  dealer_id,
  COUNT(*) FILTER (WHERE event_type IN ('vehicle_view','view'))                        AS views,
  COUNT(*) FILTER (WHERE event_type IN ('vehicle_contact_submit','contact'))           AS contacts,
  COUNT(*) FILTER (WHERE event_type = 'vehicle_saved')                                 AS saved,
  COUNT(*) FILTER (WHERE event_type = 'vehicle_whatsapp_click')                        AS whatsapp,
  COUNT(*) FILTER (WHERE event_type = 'vehicle_phone_click')                           AS phone
FROM analytics_events
WHERE dealer_id IS NOT NULL
GROUP BY 1, 2
ON CONFLICT (date, dealer_id) DO UPDATE SET
  views    = EXCLUDED.views,
  contacts = EXCLUDED.contacts,
  saved    = EXCLUDED.saved,
  whatsapp = EXCLUDED.whatsapp,
  phone    = EXCLUDED.phone;
