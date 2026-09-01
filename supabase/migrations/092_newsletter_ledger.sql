-- P7: ledger propio de la newsletter (captura + doble opt-in con Brevo).
-- Brevo es la fuente de verdad operativa (envíos, listas, DOI); esta tabla es
-- la prueba probatoria propia — nunca guarda el email en claro, solo su hash.
BEGIN;

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash          TEXT NOT NULL UNIQUE,
  brevo_contact_id    TEXT,
  topics              TEXT[] NOT NULL,
  brevo_list_ids      INTEGER[] NOT NULL,
  consent_version     TEXT NOT NULL,
  consent_snapshot    TEXT NOT NULL,
  acquisition_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  landing_path        TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','unsubscribed','bounced','spam','deleted')),
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at        TIMESTAMPTZ,
  unsubscribed_at     TIMESTAMPTZ,
  last_webhook_event  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- email_hash ya es UNIQUE (índice implícito); status se consulta aparte por el webhook.
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status
  ON public.newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_brevo_contact
  ON public.newsletter_subscriptions(brevo_contact_id) WHERE brevo_contact_id IS NOT NULL;

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
-- Sin políticas para anon/authenticated a propósito: no hay concepto de "dueño"
-- (no es un dato de un dealer ni de un comprador logueado) — solo la tocan las
-- rutas API con service_role, igual que el resto de tablas de solo-backend del proyecto.

CREATE OR REPLACE FUNCTION public.fn_newsletter_subscriptions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_newsletter_subscriptions_updated_at ON public.newsletter_subscriptions;
CREATE TRIGGER trg_newsletter_subscriptions_updated_at BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.fn_newsletter_subscriptions_updated_at();

COMMIT;
