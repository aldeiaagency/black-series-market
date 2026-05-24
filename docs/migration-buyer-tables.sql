-- Run this in the Supabase SQL editor before deploying buyer account features

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id   UUID REFERENCES vehicles(id)   ON DELETE CASCADE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Search alerts table
CREATE TABLE IF NOT EXISTS search_alerts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  phone        TEXT,
  vehicle_type TEXT NOT NULL DEFAULT 'any',
  brand        TEXT,
  model        TEXT,
  budget_max   TEXT,
  year_min     INTEGER,
  km_max       TEXT,
  location     TEXT,
  timeline     TEXT DEFAULT '1_3_months',
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alerts_select" ON search_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "alerts_insert" ON search_alerts FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "alerts_update" ON search_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "alerts_delete" ON search_alerts FOR DELETE USING (auth.uid() = user_id);
