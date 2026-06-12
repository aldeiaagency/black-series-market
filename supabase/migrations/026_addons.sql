-- Migration 026: Addons catalog + compatibility + subscription_addons

CREATE TABLE IF NOT EXISTS addons (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  price               NUMERIC(10,2),
  price_max           NUMERIC(10,2),       -- para rangos (editorial_slot: 150-300)
  recurrence          TEXT NOT NULL DEFAULT 'one_time'
                      CHECK (recurrence IN ('one_time','recurring')),
  billing_unit        TEXT,                -- 'month' | 'seat' | 'block'
  stripe_price_id     TEXT,
  status              TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','future','archived')),
  is_consultive       BOOLEAN NOT NULL DEFAULT FALSE,
  public_visible      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order          INT NOT NULL DEFAULT 0,
  rules               JSONB DEFAULT '{}'::jsonb  -- e.g. {"max_blocks": 2, "expiry_days": 180}
);

CREATE TABLE IF NOT EXISTS addon_plan_compatibility (
  addon_id  UUID REFERENCES addons(id) ON DELETE CASCADE,
  plan_id   UUID REFERENCES plans(id) ON DELETE CASCADE,
  PRIMARY KEY (addon_id, plan_id)
);

CREATE TABLE IF NOT EXISTS subscription_addons (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id         UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  addon_id                UUID REFERENCES addons(id) NOT NULL,
  quantity                INT NOT NULL DEFAULT 1,
  stripe_subscription_item_id TEXT,
  status                  TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','canceled','pending')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE addons                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_plan_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_addons      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addons_public_read" ON addons FOR SELECT USING (true);
CREATE POLICY "addon_compat_public_read" ON addon_plan_compatibility FOR SELECT USING (true);

CREATE POLICY "sub_addons_own_read" ON subscription_addons FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM subscriptions
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );
