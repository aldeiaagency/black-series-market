-- Migration 047: Lead data retention policy (12 months)
-- GDPR compliance: automatically delete leads older than 12 months.
-- Dealers can also delete individual leads manually at any time.

-- pg_cron is available on Supabase Pro/Team. The job runs daily at 03:00 UTC
-- and hard-deletes every lead created more than 12 months ago, regardless of
-- status. lead_events and lead_alerts cascade-delete with the parent lead.

SELECT cron.schedule(
  'cleanup-leads-12months',
  '0 3 * * *',
  $$
    DELETE FROM leads
    WHERE created_at < NOW() - INTERVAL '12 months';
  $$
);
