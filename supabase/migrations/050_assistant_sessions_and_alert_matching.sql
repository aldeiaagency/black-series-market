-- 050: assistant_sessions table + alert matching columns
-- ─────────────────────────────────────────────────────

-- ── search_alerts: tracking de matches ───────────────────────────────────────
ALTER TABLE search_alerts
  ADD COLUMN IF NOT EXISTS last_matched_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS matched_vehicle_ids  UUID[]  DEFAULT '{}';

-- ── assistant_sessions: historial de conversación por sesión ─────────────────
CREATE TABLE IF NOT EXISTS assistant_sessions (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    TEXT        UNIQUE NOT NULL,
  dealer_id     UUID        REFERENCES dealers(id)  ON DELETE CASCADE,
  vehicle_id    UUID        REFERENCES vehicles(id) ON DELETE SET NULL,
  messages      JSONB       NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE assistant_sessions ENABLE ROW LEVEL SECURITY;

-- Solo service_role (n8n) puede leer/escribir sesiones
CREATE POLICY "assistant_sessions_service_all" ON assistant_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Índice para búsqueda por session_id
CREATE INDEX IF NOT EXISTS idx_assistant_sessions_session_id
  ON assistant_sessions (session_id);

-- Índice para limpiezas periódicas por antigüedad
CREATE INDEX IF NOT EXISTS idx_assistant_sessions_created_at
  ON assistant_sessions (created_at);

-- Trigger updated_at (define function inline if it doesn't exist)
CREATE OR REPLACE FUNCTION set_updated_at_assistant_sessions_fn()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_assistant_sessions'
      AND tgrelid = 'assistant_sessions'::regclass
  ) THEN
    CREATE TRIGGER set_updated_at_assistant_sessions
      BEFORE UPDATE ON assistant_sessions
      FOR EACH ROW EXECUTE FUNCTION set_updated_at_assistant_sessions_fn();
  END IF;
END $$;
