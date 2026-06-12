-- Migration 024: Organizations, locations, members, audit_log
-- Estructura multi-sede para el modelo Grupo.
-- Un dealer existente se mapea a una organization con una location.

CREATE TABLE IF NOT EXISTS organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id       UUID REFERENCES dealers(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,  -- materializado desde entitlements
  featured_since  TIMESTAMPTZ,
  featured_rotation_score INT NOT NULL DEFAULT 0,  -- recalculado diariamente; menor = aparece antes
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','suspended','pending')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  city            TEXT,
  region          TEXT,
  country         TEXT NOT NULL DEFAULT 'ES',
  province_code   TEXT,               -- e.g. 'M', 'B', 'V' para capacidad Elite
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  location_id     UUID REFERENCES locations(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role            TEXT NOT NULL DEFAULT 'viewer'
                  CHECK (role IN (
                    'owner','admin','inventory_manager','sales','viewer',
                    'group_admin','location_manager'
                  )),
  invited_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  actor_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  entity_type     TEXT,
  entity_id       TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_members_user     ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org      ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_locations_org        ON locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org        ON audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created    ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orgs_is_featured     ON organizations(is_featured, featured_rotation_score)
  WHERE is_featured = TRUE;

-- RLS
ALTER TABLE organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orgs_public_read"    ON organizations FOR SELECT USING (status = 'active');
CREATE POLICY "locations_public_read" ON locations   FOR SELECT USING (true);

CREATE POLICY "members_own_read" ON organization_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "audit_own_read" ON audit_log FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
