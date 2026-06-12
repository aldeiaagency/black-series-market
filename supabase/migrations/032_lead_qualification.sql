-- Migration 032: Lead qualification schema
-- Extends leads table + creates lead_events, appointments, showroom_assistant_config

-- ─── Extend leads ────────────────────────────────────────────────────────────

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS qualification   JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source_channel  TEXT  CHECK (source_channel IN (
    'ficha_form','ficha_assistant','whatsapp_click','phone_click'
  )),
  ADD COLUMN IF NOT EXISTS assigned_to     UUID  REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS loss_reason     TEXT  CHECK (loss_reason IN (
    'price','already_bought','no_response','financing','other'
  ));

-- ─── lead_events ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lead_events (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id    UUID        REFERENCES leads(id)   ON DELETE CASCADE NOT NULL,
  dealer_id  UUID        REFERENCES dealers(id) ON DELETE CASCADE NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN (
               'form_submitted','assistant_started','assistant_message',
               'assistant_completed','assistant_abandoned','whatsapp_handoff',
               'whatsapp_click','phone_click','appointment_proposed',
               'appointment_confirmed','status_changed','note_added'
             )),
  payload    JSONB       DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id   ON lead_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_dealer_dt ON lead_events(dealer_id, created_at DESC);

ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_events_dealer_select" ON lead_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dealers d
    WHERE d.id = lead_events.dealer_id AND d.profile_id = auth.uid()
  ));

CREATE POLICY "lead_events_dealer_insert" ON lead_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM dealers d
    WHERE d.id = lead_events.dealer_id AND d.profile_id = auth.uid()
  ));

CREATE POLICY "lead_events_service_all" ON lead_events FOR ALL
  USING (auth.role() = 'service_role');

-- ─── appointments ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS appointments (
  id                   UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id              UUID        REFERENCES leads(id)    ON DELETE CASCADE   NOT NULL,
  vehicle_id           UUID        REFERENCES vehicles(id) ON DELETE SET NULL,
  dealer_id            UUID        REFERENCES dealers(id)  ON DELETE CASCADE   NOT NULL,
  starts_at            TIMESTAMPTZ,
  status               TEXT        NOT NULL DEFAULT 'proposed'
                                   CHECK (status IN ('proposed','confirmed','cancelled','done')),
  preferred_time_text  TEXT,
  calendar_event_ref   TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_lead      ON appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dealer_dt ON appointments(dealer_id, starts_at);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_dealer_select" ON appointments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dealers d
    WHERE d.id = appointments.dealer_id AND d.profile_id = auth.uid()
  ));

CREATE POLICY "appointments_service_all" ON appointments FOR ALL
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_appointments_updated_at();

-- ─── showroom_assistant_config ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS showroom_assistant_config (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  dealer_id         UUID        REFERENCES dealers(id) ON DELETE CASCADE NOT NULL UNIQUE,
  calendar_provider TEXT,
  calendar_ref      TEXT,
  visit_hours       JSONB       DEFAULT '{}',
  languages         TEXT[]      DEFAULT '{es}',
  whatsapp_number   TEXT,
  webhook_url       TEXT,
  enabled           BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE showroom_assistant_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assistant_config_dealer_all" ON showroom_assistant_config FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dealers d
    WHERE d.id = showroom_assistant_config.dealer_id AND d.profile_id = auth.uid()
  ));

CREATE POLICY "assistant_config_service_all" ON showroom_assistant_config FOR ALL
  USING (auth.role() = 'service_role');
