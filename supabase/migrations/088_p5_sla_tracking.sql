-- 088: P5 punto 4 — columnas de seguimiento del SLA de acuse sobre lead_handoffs (P3a, 086)

BEGIN;

ALTER TABLE lead_handoffs
  ADD COLUMN IF NOT EXISTS sla_reminder_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_escalated_at TIMESTAMPTZ;

-- Handoffs con entrega confirmada pero sin acuse — la consulta que recorre el cron cada hora.
CREATE INDEX IF NOT EXISTS idx_lead_handoffs_pending_ack
  ON lead_handoffs(delivery_confirmed_at)
  WHERE delivery_confirmed_at IS NOT NULL AND acknowledged_at IS NULL;

COMMIT;
