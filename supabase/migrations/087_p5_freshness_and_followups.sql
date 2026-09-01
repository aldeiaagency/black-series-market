-- 087: P5 foundations — frescura de stock por unidad + seguimiento automatizado por origen
-- ────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── vehicles: seguimiento de frescura por unidad ─────────────────────────────
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS last_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS freshness_auto_paused BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: las unidades existentes se tratan como confirmadas al publicarse
-- (o al crearse, si nunca se publicaron) — no se fabrica una confirmación real inexistente.
UPDATE vehicles SET last_confirmed_at = COALESCE(published_at, created_at)
WHERE last_confirmed_at IS NULL;

ALTER TABLE vehicles ALTER COLUMN last_confirmed_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_freshness
  ON vehicles(last_confirmed_at) WHERE status = 'active';

-- ── opportunity_followups: seguimiento automatizado por origen (P5 punto 3) ──
CREATE TABLE IF NOT EXISTS opportunity_followups (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id           UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  vehicle_id          UUID REFERENCES vehicles(id) ON DELETE SET NULL,

  -- 2 de los 3 casos de origen del diseño son construibles hoy: 'lead_persisted' (hay
  -- contacto real del comprador) y 'external_contact' (WhatsApp/teléfono, solo showroom).
  -- 'declared_no_origin' (oportunidad declarada a mano por el showroom) NO se incluye — no
  -- existe todavía ningún punto de captura para que un showroom declare una oportunidad
  -- offline; requiere su propio formulario en el dashboard antes de poder darle seguimiento.
  origin_case         TEXT NOT NULL CHECK (origin_case IN ('lead_persisted', 'external_contact')),
  lead_id             UUID REFERENCES leads(id) ON DELETE CASCADE,
  analytics_event_id  UUID REFERENCES analytics_events(id) ON DELETE CASCADE,

  target              TEXT NOT NULL CHECK (target IN ('buyer', 'dealer')),
  contact_email       TEXT NOT NULL,
  reference_note      TEXT, -- p.ej. "Porsche 911 GT3 RS — Ref: BLM-8F3A2C", se cita en el email

  response_token      TEXT NOT NULL UNIQUE DEFAULT (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  attempts_sent       INTEGER NOT NULL DEFAULT 0,
  last_sent_at        TIMESTAMPTZ,
  next_attempt_due_at TIMESTAMPTZ NOT NULL,
  exhausted_at        TIMESTAMPTZ, -- fin de la ventana de 30 días, no un resultado negativo

  responded_at        TIMESTAMPTZ,
  response            TEXT CHECK (response IS NULL OR response IN ('closed_won', 'still_deciding', 'not_interested')),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'exhausted')),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT opportunity_followups_origin_source CHECK (
    (origin_case = 'lead_persisted' AND lead_id IS NOT NULL AND analytics_event_id IS NULL)
    OR (origin_case = 'external_contact' AND analytics_event_id IS NOT NULL AND lead_id IS NULL)
  ),
  CONSTRAINT opportunity_followups_response_requires_status CHECK (
    (response IS NULL AND responded_at IS NULL) OR (response IS NOT NULL AND responded_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunity_followups_unique_lead
  ON opportunity_followups(lead_id) WHERE lead_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunity_followups_unique_event
  ON opportunity_followups(analytics_event_id) WHERE analytics_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_opportunity_followups_due
  ON opportunity_followups(next_attempt_due_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_opportunity_followups_dealer
  ON opportunity_followups(dealer_id, created_at DESC);

ALTER TABLE opportunity_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opportunity_followups_service_all" ON opportunity_followups
  FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION set_updated_at_opportunity_followups_fn()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_opportunity_followups ON opportunity_followups;
CREATE TRIGGER set_updated_at_opportunity_followups
  BEFORE UPDATE ON opportunity_followups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_opportunity_followups_fn();

-- ── record_followup_response: registra la respuesta de un clic (token opaco, sin login) ──
-- SECURITY DEFINER + solo service_role para que la ruta pública del "un clic" pase siempre
-- por el cliente admin (mismo patrón que record_lead_handoff_event de P3a, migración 086) —
-- nunca una escritura directa de un cliente anónimo a la tabla.
CREATE OR REPLACE FUNCTION record_followup_response(
  p_token TEXT,
  p_response TEXT
) RETURNS TABLE(ok BOOLEAN, already_responded BOOLEAN) AS $$
DECLARE
  v_row opportunity_followups%ROWTYPE;
BEGIN
  IF p_response NOT IN ('closed_won', 'still_deciding', 'not_interested') THEN
    RETURN QUERY SELECT FALSE, FALSE;
    RETURN;
  END IF;

  SELECT * INTO v_row FROM opportunity_followups WHERE response_token = p_token FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, FALSE;
    RETURN;
  END IF;

  IF v_row.status = 'responded' THEN
    RETURN QUERY SELECT TRUE, TRUE;
    RETURN;
  END IF;

  UPDATE opportunity_followups
  SET responded_at = NOW(), response = p_response, status = 'responded'
  WHERE id = v_row.id;

  RETURN QUERY SELECT TRUE, FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION record_followup_response(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_followup_response(TEXT, TEXT) TO service_role;

-- ── confirm_vehicle_freshness: botón "sigue disponible" del dashboard ──
CREATE OR REPLACE FUNCTION confirm_vehicle_freshness(
  p_vehicle_id UUID,
  p_dealer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE vehicles
  SET last_confirmed_at = NOW(),
      freshness_auto_paused = FALSE,
      status = CASE WHEN freshness_auto_paused THEN 'active'::vehicle_status ELSE status END
  WHERE id = p_vehicle_id AND dealer_id = p_dealer_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION confirm_vehicle_freshness(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION confirm_vehicle_freshness(UUID, UUID) TO service_role;

COMMIT;
