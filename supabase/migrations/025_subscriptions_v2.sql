-- Migration 025: Subscriptions v2 + founding_memberships
-- Nueva tabla subscriptions desacoplada de dealers.
-- dealers.subscription_plan se mantiene como campo legacy (sincronizado por webhook).

CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  plan_id                UUID REFERENCES plans(id) NOT NULL,
  billing_cycle          TEXT NOT NULL DEFAULT 'monthly'
                         CHECK (billing_cycle IN ('monthly','annual')),
  is_founding            BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id     TEXT,
  status                 TEXT NOT NULL DEFAULT 'trialing'
                         CHECK (status IN (
                           'trialing','active','past_due','canceled',
                           'unpaid','paused','incomplete'
                         )),
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at            TIMESTAMPTZ,
  trial_end              TIMESTAMPTZ,
  metadata               JSONB DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founding_memberships (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_slug          TEXT NOT NULL,
  conditions_status  TEXT NOT NULL DEFAULT 'active'
                     CHECK (conditions_status IN ('active','revoked')),
  granted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at         TIMESTAMPTZ,
  revoked_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revocation_reason  TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_org    ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- RLS
ALTER TABLE subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE founding_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_own_read" ON subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "founding_own_read" ON founding_memberships FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
