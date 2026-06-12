-- Migration 027: Elite capacity rules (scarcity governance)

CREATE TABLE IF NOT EXISTS elite_capacity_rules (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geographic_scope_type TEXT NOT NULL CHECK (geographic_scope_type IN ('province','country','custom')),
  geographic_scope_id   TEXT NOT NULL,  -- código provincia 'M','B','V' o 'ES' para país
  category              TEXT NOT NULL DEFAULT '*',
  max_elite_showrooms   INT,            -- orientativo inicial: 3
  max_elite_share       NUMERIC,        -- orientativo inicial: 0.20 (20%)
  current_elite_showrooms INT NOT NULL DEFAULT 0,
  availability_status   TEXT NOT NULL DEFAULT 'available'
                        CHECK (availability_status IN (
                          'available','low_availability','waitlist','closed'
                        )),
  manual_override       BOOLEAN NOT NULL DEFAULT FALSE,
  notes                 TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS elite_waitlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  rule_id         UUID REFERENCES elite_capacity_rules(id) ON DELETE CASCADE NOT NULL,
  position        INT,
  status          TEXT NOT NULL DEFAULT 'waiting'
                  CHECK (status IN ('waiting','offered','accepted','declined','expired')),
  offered_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, rule_id)
);

-- Index for fast province lookups
CREATE INDEX IF NOT EXISTS idx_elite_cap_scope
  ON elite_capacity_rules(geographic_scope_type, geographic_scope_id, category);

-- RLS: solo admins leen; el servidor usa service role
ALTER TABLE elite_capacity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE elite_waitlist        ENABLE ROW LEVEL SECURITY;

-- Los detalles internos de capacidad nunca son públicos (§6: número interno nunca visible)
-- Solo el servidor (service role) consulta estas tablas
