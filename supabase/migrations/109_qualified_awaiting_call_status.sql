-- Migration 109 — Nuevo embudo de acceso profesional (precios ocultos + llamada de admisión).
--
-- El proceso de alta pasa a tener un paso intermedio: una solicitud que ya cumple los criterios
-- del market (auditoría de reputación de WF1 + criterio del admin) NO recibe acceso directo —
-- primero se le invita a agendar una llamada (auto-agenda, Google Calendar, a conectar aparte) en
-- la que se explican precios y condiciones reales. Solo tras esa llamada el admin ejecuta la
-- aprobación real (creación de usuario/dealer/organización), como ya hacía `approveApplication`.
--
-- Aplica solo a `source = 'market_directo'` (altas que llegan por la web). `visita_agencia` no
-- necesita este paso: la visita presencial de la agencia ya cumple ese rol (ahí se presenta
-- precio y condiciones cara a cara antes de generar la solicitud).

ALTER TABLE showroom_applications
  DROP CONSTRAINT IF EXISTS showroom_applications_status_check;

ALTER TABLE showroom_applications
  ADD CONSTRAINT showroom_applications_status_check
  CHECK (status IN ('new', 'in_review', 'pending_info', 'qualified_awaiting_call', 'approved', 'approval_failed', 'rejected'));

DROP INDEX IF EXISTS idx_showroom_applications_pending_email;

CREATE UNIQUE INDEX idx_showroom_applications_pending_email
  ON showroom_applications (LOWER(email))
  WHERE status IN ('new', 'in_review', 'pending_info', 'qualified_awaiting_call', 'approval_failed');

-- Modalidad acordada en la llamada — no reutilizar `plan_interest` (lo escribe el propio
-- solicitante antes de conocer precios, ya no representa una decisión informada).
ALTER TABLE showroom_applications
  ADD COLUMN IF NOT EXISTS agreed_plan TEXT
    CHECK (agreed_plan IS NULL OR agreed_plan IN ('essential', 'professional', 'elite', 'grupo'));

COMMENT ON COLUMN showroom_applications.agreed_plan IS
  'Modalidad confirmada verbalmente en la llamada de admisión (source=market_directo) o acordada en la visita presencial (source=visita_agencia). Distinto de plan_interest, que es la preferencia declarada por el solicitante antes de conocer precio y condiciones reales.';
