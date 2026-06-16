-- Solicitudes de alta de showrooms.
-- El alta publica no crea cuenta ni perfil operativo; solo deja una solicitud
-- para revision manual desde el panel de administracion.

CREATE TABLE IF NOT EXISTS showroom_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  dealer_name TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_region TEXT,
  phone TEXT NOT NULL,
  website TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_review', 'approved', 'rejected')),
  admin_notes TEXT,
  dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_showroom_applications_status ON showroom_applications(status);
CREATE INDEX IF NOT EXISTS idx_showroom_applications_created_at ON showroom_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_showroom_applications_email ON showroom_applications(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_showroom_applications_pending_email
  ON showroom_applications (LOWER(email))
  WHERE status IN ('new', 'in_review');

ALTER TABLE showroom_applications ENABLE ROW LEVEL SECURITY;
