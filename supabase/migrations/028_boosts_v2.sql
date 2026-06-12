-- Migration 028: Boost credits + activations v2
-- Reemplaza el campo featured_until con un sistema de créditos y activaciones.
-- featured_until en vehicles se mantiene por compatibilidad legacy.

CREATE TABLE IF NOT EXISTS boost_credits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  source          TEXT NOT NULL CHECK (source IN ('plan','pack','welcome')),
  quantity        INT NOT NULL DEFAULT 1,
  used            INT NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,     -- NULL = sin caducidad (créditos de plan mensual no caducan; se resetean)
  plan_cycle_start TIMESTAMPTZ,    -- para créditos source='plan': inicio del ciclo de facturación
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boost_activations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  credit_id       UUID REFERENCES boost_credits(id) ON DELETE SET NULL,
  starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at         TIMESTAMPTZ NOT NULL,    -- starts_at + 7 días
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','completed','canceled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_boost_credits_org     ON boost_credits(organization_id);
CREATE INDEX IF NOT EXISTS idx_boost_activations_org ON boost_activations(organization_id);
CREATE INDEX IF NOT EXISTS idx_boost_activations_veh ON boost_activations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_boost_activations_active
  ON boost_activations(status, ends_at) WHERE status = 'active';

-- RLS
ALTER TABLE boost_credits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boost_credits_own" ON boost_credits FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "boost_activations_own" ON boost_activations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
