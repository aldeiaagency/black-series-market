-- search_alerts: alertas de búsqueda de compradores (tabla estaba referenciada pero no creada)
CREATE TABLE IF NOT EXISTS search_alerts (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  phone        TEXT,
  vehicle_type TEXT,
  brand        TEXT,
  model        TEXT,
  budget_max   TEXT,
  year_min     INTEGER,
  km_max       TEXT,
  location     TEXT,
  timeline     TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own alerts"
  ON search_alerts FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id ON search_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_created_at ON search_alerts(created_at);
