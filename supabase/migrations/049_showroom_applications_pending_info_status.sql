-- Migration 049: allow pending_info in showroom application flow
-- Keeps database constraints aligned with the admin action "Solicitar mas informacion".

ALTER TABLE showroom_applications
  DROP CONSTRAINT IF EXISTS showroom_applications_status_check;

ALTER TABLE showroom_applications
  ADD CONSTRAINT showroom_applications_status_check
  CHECK (status IN ('new', 'in_review', 'pending_info', 'approved', 'rejected'));

DROP INDEX IF EXISTS idx_showroom_applications_pending_email;

CREATE UNIQUE INDEX idx_showroom_applications_pending_email
  ON showroom_applications (LOWER(email))
  WHERE status IN ('new', 'in_review', 'pending_info');
