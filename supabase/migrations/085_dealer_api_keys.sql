-- 085 - Scoped import API keys per dealer.
--
-- Keys are stored as sha256:<salt>:<digest>. The salt is per key and the
-- plaintext token is shown only once by the admin action that creates it.

CREATE TABLE IF NOT EXISTS public.dealer_api_keys (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id    uuid NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  key_hash     text NOT NULL,
  label        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at   timestamptz
);

CREATE INDEX IF NOT EXISTS idx_dealer_api_keys_dealer
  ON public.dealer_api_keys(dealer_id);

CREATE INDEX IF NOT EXISTS idx_dealer_api_keys_active
  ON public.dealer_api_keys(dealer_id, revoked_at)
  WHERE revoked_at IS NULL;

ALTER TABLE public.dealer_api_keys ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.dealer_api_keys IS
  'Internal dealer-scoped import API keys. RLS has no user policies; access is service_role/admin only.';

COMMENT ON COLUMN public.dealer_api_keys.key_hash IS
  'Salted SHA-256 hash formatted as sha256:<salt>:<digest>; plaintext keys are never stored.';