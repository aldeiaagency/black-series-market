-- 079 - Verificacion fail-closed de las piezas creadas al aprobar un showroom.

ALTER TABLE showroom_applications
  DROP CONSTRAINT IF EXISTS showroom_applications_status_check;

ALTER TABLE showroom_applications
  ADD CONSTRAINT showroom_applications_status_check
  CHECK (status IN ('new', 'in_review', 'pending_info', 'approved', 'approval_failed', 'rejected'));

ALTER TABLE showroom_applications
  ADD COLUMN IF NOT EXISTS approval_missing_pieces TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN showroom_applications.approval_missing_pieces IS
  'Claves estables de las piezas que faltan tras verificar el alta (auth_user, profile, dealer, organization, organization_owner, showroom_assistant_config, password_setup_url o application_status). Vacio cuando la aprobacion esta completa.';

DROP INDEX IF EXISTS idx_showroom_applications_pending_email;

CREATE UNIQUE INDEX idx_showroom_applications_pending_email
  ON showroom_applications (LOWER(email))
  WHERE status IN ('new', 'in_review', 'pending_info', 'approval_failed');
