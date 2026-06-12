-- Migration 023: Plan catalog v2
-- Tablas de planes, límites y features desacopladas de dealers.
-- Coexiste con dealers.subscription_plan (enum legacy) sin romperlo.

CREATE TABLE IF NOT EXISTS plans (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     TEXT UNIQUE NOT NULL,  -- essential | professional | elite | grupo
  name                     TEXT NOT NULL,
  monthly_price            NUMERIC(10,2),
  annual_price             NUMERIC(10,2),
  founding_monthly_price   NUMERIC(10,2),
  stripe_product_id        TEXT,
  stripe_monthly_price_id  TEXT,
  stripe_annual_price_id   TEXT,
  stripe_founding_price_id TEXT,
  status                   TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','hidden','archived')),
  sort_order               INT NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_limits (
  plan_id      UUID REFERENCES plans(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,
  value_number NUMERIC,
  value_text   TEXT,
  PRIMARY KEY (plan_id, key)
);

CREATE TABLE IF NOT EXISTS plan_features (
  plan_id             UUID REFERENCES plans(id) ON DELETE CASCADE,
  feature_key         TEXT NOT NULL,
  availability_status TEXT NOT NULL DEFAULT 'operative'
                      CHECK (availability_status IN ('operative','partial','future')),
  included            BOOLEAN NOT NULL DEFAULT FALSE,
  public_visible      BOOLEAN NOT NULL DEFAULT TRUE,
  display_label       TEXT,
  PRIMARY KEY (plan_id, feature_key)
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Public read (pricing page reads these)
CREATE POLICY "plans_public_read" ON plans FOR SELECT USING (true);
CREATE POLICY "plan_limits_public_read" ON plan_limits FOR SELECT USING (true);
CREATE POLICY "plan_features_public_read" ON plan_features FOR SELECT USING (true);
