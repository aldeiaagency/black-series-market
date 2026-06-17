-- Migration 046: Elite future commercial automation infrastructure
-- Prepares lead scoring, hot lead alerts and calendar booking without exposing
-- them while external workflows are still disconnected.

-- Hidden future feature flags. Access remains governed by included/status in
-- plan_features; public_visible=false keeps the commercial UI quiet until ready.
WITH p AS (SELECT id, slug FROM plans)
INSERT INTO plan_features (plan_id, feature_key, included, availability_status, public_visible, display_label)
SELECT p.id, f.key, f.included, f.status, false, f.label
FROM p
JOIN (VALUES
  ('essential',    'lead_scoring',         false, 'future', null),
  ('professional', 'lead_scoring',         false, 'future', null),
  ('elite',        'lead_scoring',         true,  'future', 'elite_lead_scoring'),
  ('essential',    'hot_lead_alerts',      false, 'future', null),
  ('professional', 'hot_lead_alerts',      false, 'future', null),
  ('elite',        'hot_lead_alerts',      true,  'future', 'elite_hot_lead_alerts'),
  ('essential',    'calendar_integration', false, 'future', null),
  ('professional', 'calendar_integration', false, 'future', null),
  ('elite',        'calendar_integration', true,  'future', 'elite_calendar')
) AS f(slug, key, included, status, label) ON p.slug = f.slug
ON CONFLICT (plan_id, feature_key) DO UPDATE
SET
  included = EXCLUDED.included,
  availability_status = EXCLUDED.availability_status,
  public_visible = false,
  display_label = EXCLUDED.display_label;

-- Keep appointment booking granted only to Elite, but hidden/future until
-- Google Calendar / Outlook and n8n are connected end to end.
WITH p AS (SELECT id, slug FROM plans)
INSERT INTO plan_features (plan_id, feature_key, included, availability_status, public_visible, display_label)
SELECT p.id, 'appointment_booking', p.slug = 'elite', 'future', false,
       CASE WHEN p.slug = 'elite' THEN 'elite_calendar_booking' ELSE null END
FROM p
WHERE p.slug IN ('essential', 'professional', 'elite')
ON CONFLICT (plan_id, feature_key) DO UPDATE
SET
  included = EXCLUDED.included,
  availability_status = 'future',
  public_visible = false,
  display_label = EXCLUDED.display_label;

-- Structured scoring columns. qualification JSONB remains the flexible payload,
-- these fields are for sorting/filtering/alerts once workflows are active.
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS lead_score TEXT CHECK (lead_score IN ('hot', 'warm', 'cold')),
  ADD COLUMN IF NOT EXISTS score_reason TEXT,
  ADD COLUMN IF NOT EXISTS score_confidence NUMERIC(4,3) CHECK (score_confidence IS NULL OR (score_confidence >= 0 AND score_confidence <= 1)),
  ADD COLUMN IF NOT EXISTS recommended_next_action TEXT,
  ADD COLUMN IF NOT EXISTS scored_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_commercial_touch_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_dealer_score
  ON leads(dealer_id, lead_score, scored_at DESC)
  WHERE lead_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up
  ON leads(dealer_id, next_follow_up_at)
  WHERE next_follow_up_at IS NOT NULL;

-- Calendar connection metadata. No OAuth secrets are stored here; external
-- token storage belongs to the integration provider / encrypted secret store.
CREATE TABLE IF NOT EXISTS showroom_calendar_connections (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id              UUID REFERENCES dealers(id) ON DELETE CASCADE NOT NULL,
  provider               TEXT NOT NULL CHECK (provider IN ('google_calendar', 'outlook_calendar')),
  status                 TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'connected', 'disconnected', 'error')),
  external_account_email TEXT,
  calendar_ref           TEXT,
  availability_rules     JSONB NOT NULL DEFAULT '{}',
  booking_settings       JSONB NOT NULL DEFAULT '{}',
  last_synced_at         TIMESTAMPTZ,
  connected_at           TIMESTAMPTZ,
  disconnected_at        TIMESTAMPTZ,
  error_message          TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dealer_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_calendar_connections_dealer
  ON showroom_calendar_connections(dealer_id, status);

ALTER TABLE showroom_calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_connections_dealer_select" ON showroom_calendar_connections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dealers d
    WHERE d.id = showroom_calendar_connections.dealer_id AND d.profile_id = auth.uid()
  ));

CREATE POLICY "calendar_connections_service_all" ON showroom_calendar_connections FOR ALL
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_calendar_connections_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_calendar_connections_updated_at ON showroom_calendar_connections;
CREATE TRIGGER trg_calendar_connections_updated_at
  BEFORE UPDATE ON showroom_calendar_connections
  FOR EACH ROW EXECUTE FUNCTION update_calendar_connections_updated_at();

-- Appointment metadata needed by Google Calendar / Outlook workflows.
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS provider TEXT CHECK (provider IS NULL OR provider IN ('google_calendar', 'outlook_calendar')),
  ADD COLUMN IF NOT EXISTS external_event_id TEXT,
  ADD COLUMN IF NOT EXISTS meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS location_text TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_reason TEXT,
  ADD COLUMN IF NOT EXISTS workflow_ref TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_appointments_external_event
  ON appointments(provider, external_event_id)
  WHERE external_event_id IS NOT NULL;

-- Hot lead alerts generated by future n8n/IA workflows.
CREATE TABLE IF NOT EXISTS lead_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id         UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  dealer_id       UUID REFERENCES dealers(id) ON DELETE CASCADE NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('hot_lead_unattended', 'appointment_due', 'follow_up_due')),
  severity        TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  message         TEXT,
  due_at          TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  workflow_ref    TEXT,
  payload         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_alerts_dealer_status
  ON lead_alerts(dealer_id, status, severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_alerts_lead
  ON lead_alerts(lead_id);

ALTER TABLE lead_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_alerts_dealer_select" ON lead_alerts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dealers d
    WHERE d.id = lead_alerts.dealer_id AND d.profile_id = auth.uid()
  ));

CREATE POLICY "lead_alerts_service_all" ON lead_alerts FOR ALL
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_lead_alerts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_lead_alerts_updated_at ON lead_alerts;
CREATE TRIGGER trg_lead_alerts_updated_at
  BEFORE UPDATE ON lead_alerts
  FOR EACH ROW EXECUTE FUNCTION update_lead_alerts_updated_at();

-- Extend lead event vocabulary for future commercial automation.
ALTER TABLE lead_events DROP CONSTRAINT IF EXISTS lead_events_type_check;
ALTER TABLE lead_events
  ADD CONSTRAINT lead_events_type_check CHECK (type IN (
    'form_submitted','assistant_started','assistant_message',
    'assistant_completed','assistant_abandoned','whatsapp_handoff',
    'whatsapp_click','phone_click','appointment_proposed',
    'appointment_confirmed','appointment_cancelled','appointment_rescheduled',
    'lead_scored','hot_lead_alert_created','hot_lead_alert_resolved',
    'calendar_connected','calendar_disconnected',
    'status_changed','note_added'
  ));
