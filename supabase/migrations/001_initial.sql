-- Black Series Market — Initial Schema
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE dealer_status AS ENUM ('pending', 'active', 'suspended', 'trial');
CREATE TYPE subscription_plan AS ENUM ('essential', 'professional', 'elite');
CREATE TYPE vehicle_type AS ENUM ('car', 'motorcycle');
CREATE TYPE vehicle_status AS ENUM ('draft', 'pending_review', 'active', 'paused', 'sold', 'expired');
CREATE TYPE fuel_type AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'hydrogen', 'other');
CREATE TYPE transmission_type AS ENUM ('manual', 'automatic', 'semi_automatic', 'dct', 'cvt');
CREATE TYPE drive_type AS ENUM ('rwd', 'fwd', 'awd', '4wd');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'negotiating', 'closed', 'discarded');

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'dealer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dealers
CREATE TABLE dealers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT DEFAULT 'ES',
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  years_in_business INTEGER,
  status dealer_status NOT NULL DEFAULT 'pending',
  subscription_plan subscription_plan,
  subscription_start_at TIMESTAMPTZ,
  subscription_end_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  vehicle_slots INTEGER NOT NULL DEFAULT 10,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  certifications TEXT[],
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brands
CREATE TABLE brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  country TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Models
CREATE TABLE models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  vehicle_type vehicle_type NOT NULL DEFAULT 'car',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  vehicle_type vehicle_type NOT NULL DEFAULT 'car',
  status vehicle_status NOT NULL DEFAULT 'draft',

  -- Identity
  brand_id UUID REFERENCES brands(id),
  model_id UUID REFERENCES models(id),
  brand_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  version TEXT,
  year INTEGER NOT NULL,
  vin TEXT,

  -- Engine & Performance
  displacement_cc INTEGER,
  power_hp INTEGER,
  power_kw INTEGER,
  torque_nm INTEGER,
  fuel_type fuel_type,
  cylinders INTEGER,
  engine_config TEXT,
  zero_to_hundred DECIMAL(4,2),
  top_speed_kmh INTEGER,

  -- Transmission
  transmission transmission_type,
  drive_type drive_type,
  weight_kg INTEGER,

  -- Exterior & Interior
  color_exterior TEXT,
  color_interior TEXT,
  upholstery TEXT,
  body_type TEXT,

  -- Condition
  mileage_km INTEGER NOT NULL,
  registration_year INTEGER,
  registration_country TEXT DEFAULT 'ES',
  itv_valid_until DATE,
  has_carfax BOOLEAN DEFAULT FALSE,
  has_service_history BOOLEAN DEFAULT FALSE,

  -- Pricing
  price DECIMAL(12,2),
  price_on_request BOOLEAN NOT NULL DEFAULT FALSE,
  is_negotiable BOOLEAN DEFAULT FALSE,
  accepts_trade_in BOOLEAN DEFAULT FALSE,
  financing_available BOOLEAN DEFAULT FALSE,
  currency TEXT NOT NULL DEFAULT 'EUR',

  -- Content
  title TEXT,
  description TEXT,
  equipment TEXT[],

  -- Media
  images JSONB DEFAULT '[]',
  video_url TEXT,

  -- Metadata
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_editors_pick BOOLEAN NOT NULL DEFAULT FALSE,
  is_exclusive BOOLEAN NOT NULL DEFAULT FALSE,
  badge TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  leads_count INTEGER NOT NULL DEFAULT 0,
  favorites_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  admin_notes TEXT,
  rejection_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE NOT NULL,
  buyer_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  buyer_whatsapp TEXT,
  message TEXT NOT NULL,
  status lead_status NOT NULL DEFAULT 'new',
  dealer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, vehicle_id)
);

-- Dealer Reviews
CREATE TABLE dealer_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscription Plans
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  vehicle_slots INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Analytics Events
CREATE TABLE analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  session_id TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vehicles_dealer_id ON vehicles(dealer_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_vehicle_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_brand_name ON vehicles(brand_name);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_is_featured ON vehicles(is_featured);
CREATE INDEX idx_vehicles_published_at ON vehicles(published_at DESC);
CREATE INDEX idx_leads_dealer_id ON leads(dealer_id);
CREATE INDEX idx_analytics_vehicle_id ON analytics_events(vehicle_id);
CREATE INDEX idx_analytics_dealer_id ON analytics_events(dealer_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Active dealers viewable" ON dealers FOR SELECT USING (status = 'active' OR auth.uid() = profile_id);
CREATE POLICY "Dealers update own record" ON dealers FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Active vehicles viewable" ON vehicles FOR SELECT
  USING (status = 'active' OR EXISTS(SELECT 1 FROM dealers d WHERE d.id = vehicles.dealer_id AND d.profile_id = auth.uid()));
CREATE POLICY "Dealers manage own vehicles" ON vehicles FOR ALL
  USING (EXISTS(SELECT 1 FROM dealers d WHERE d.id = vehicles.dealer_id AND d.profile_id = auth.uid()));

CREATE POLICY "Anyone can create lead" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Dealers view own leads" ON leads FOR SELECT
  USING (EXISTS(SELECT 1 FROM dealers d WHERE d.id = leads.dealer_id AND d.profile_id = auth.uid()));
CREATE POLICY "Dealers update own leads" ON leads FOR UPDATE
  USING (EXISTS(SELECT 1 FROM dealers d WHERE d.id = leads.dealer_id AND d.profile_id = auth.uid()));

CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = profile_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Seed subscription plans
INSERT INTO subscription_plans (id, name, description, price_monthly, vehicle_slots, sort_order, features) VALUES
  ('essential', 'Essential', 'Para concesionarios que empiezan', 149.00, 10, 1,
    '["Hasta 10 vehículos activos","Perfil de concesionario","Gestión de leads","Analíticas básicas"]'),
  ('professional', 'Professional', 'El plan más popular', 349.00, 30, 2,
    '["Hasta 30 vehículos activos","Perfil destacado en búsquedas","Badge verificado","Analíticas avanzadas","Soporte prioritario"]'),
  ('elite', 'Elite', 'Para los mejores concesionarios', 699.00, 9999, 3,
    '["Vehículos ilimitados","Aparición en homepage","Badge Elite","Analíticas premium","Account manager dedicado"]');

-- Seed brands
INSERT INTO brands (name, slug, country, sort_order) VALUES
  ('Ferrari', 'ferrari', 'IT', 1),
  ('Lamborghini', 'lamborghini', 'IT', 2),
  ('McLaren', 'mclaren', 'GB', 3),
  ('Bugatti', 'bugatti', 'FR', 4),
  ('Koenigsegg', 'koenigsegg', 'SE', 5),
  ('Pagani', 'pagani', 'IT', 6),
  ('Rimac', 'rimac', 'HR', 7),
  ('Aston Martin', 'aston-martin', 'GB', 8),
  ('Bentley', 'bentley', 'GB', 9),
  ('Rolls-Royce', 'rolls-royce', 'GB', 10),
  ('Maserati', 'maserati', 'IT', 11),
  ('Porsche', 'porsche', 'DE', 12),
  ('BMW', 'bmw', 'DE', 13),
  ('Mercedes-Benz', 'mercedes-benz', 'DE', 14),
  ('Audi', 'audi', 'DE', 15),
  ('Alfa Romeo', 'alfa-romeo', 'IT', 16),
  ('Lexus', 'lexus', 'JP', 17),
  ('Nissan', 'nissan', 'JP', 18),
  ('Corvette', 'corvette', 'US', 19),
  ('Dodge', 'dodge', 'US', 20),
  ('Ford', 'ford', 'US', 21),
  ('Ducati', 'ducati', 'IT', 22),
  ('MV Agusta', 'mv-agusta', 'IT', 23),
  ('Aprilia', 'aprilia', 'IT', 24),
  ('Bimota', 'bimota', 'IT', 25),
  ('BMW Motorrad', 'bmw-motorrad', 'DE', 26),
  ('Harley-Davidson', 'harley-davidson', 'US', 27),
  ('Indian', 'indian', 'US', 28),
  ('KTM', 'ktm', 'AT', 29),
  ('Triumph', 'triumph', 'GB', 30);
