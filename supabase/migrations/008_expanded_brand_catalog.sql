-- ─────────────────────────────────────────────────────────────────────────────
-- Catálogo ampliado de marcas — coches y motos
-- ON CONFLICT DO NOTHING: seguro de re-ejecutar; no toca marcas existentes
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Marcas de coches nuevas ───────────────────────────────────────────────────
INSERT INTO brands (name, slug, country, sort_order) VALUES
  ('Abarth',      'abarth',      'IT', 31),
  ('Alpine',      'alpine',      'FR', 32),
  ('Ariel',       'ariel',       'GB', 33),
  ('Brabus',      'brabus',      'DE', 34),
  ('Caterham',    'caterham',    'GB', 35),
  ('Cupra',       'cupra',       'ES', 36),
  ('Fiat',        'fiat',        'IT', 37),
  ('Genesis',     'genesis',     'KR', 38),
  ('Honda',       'honda',       'JP', 39),
  ('Hyundai',     'hyundai',     'KR', 40),
  ('Jaguar',      'jaguar',      'GB', 41),
  ('Kia',         'kia',         'KR', 42),
  ('Lancia',      'lancia',      'IT', 43),
  ('Land Rover',  'land-rover',  'GB', 44),
  ('Lotus',       'lotus',       'GB', 45),
  ('Maybach',     'maybach',     'DE', 46),
  ('Mazda',       'mazda',       'JP', 47),
  ('Mini',        'mini',        'GB', 48),
  ('Mitsubishi',  'mitsubishi',  'JP', 49),
  ('Morgan',      'morgan',      'GB', 50),
  ('Opel',        'opel',        'DE', 51),
  ('Peugeot',     'peugeot',     'FR', 52),
  ('Polestar',    'polestar',    'SE', 53),
  ('Renault',     'renault',     'FR', 54),
  ('Seat',        'seat',        'ES', 55),
  ('Subaru',      'subaru',      'JP', 56),
  ('Tesla',       'tesla',       'US', 57),
  ('Toyota',      'toyota',      'JP', 58),
  ('Volkswagen',  'volkswagen',  'DE', 59),
  ('Volvo',       'volvo',       'SE', 60)
ON CONFLICT (slug) DO NOTHING;

-- ── Marcas de motos nuevas ────────────────────────────────────────────────────
-- Honda ya se añadió arriba (aparece en ambas secciones según inventario)
INSERT INTO brands (name, slug, country, sort_order) VALUES
  ('Benelli',        'benelli',        'IT', 61),
  ('Cagiva',         'cagiva',         'IT', 62),
  ('Can-Am',         'can-am',         'CA', 63),
  ('Energica',       'energica',       'IT', 64),
  ('Husqvarna',      'husqvarna',      'AT', 65),
  ('Kawasaki',       'kawasaki',       'JP', 66),
  ('LiveWire',       'livewire',       'US', 67),
  ('Moto Guzzi',     'moto-guzzi',     'IT', 68),
  ('Piaggio',        'piaggio',        'IT', 69),
  ('Royal Enfield',  'royal-enfield',  'IN', 70),
  ('Suzuki',         'suzuki',         'JP', 71),
  ('Vespa',          'vespa',          'IT', 72),
  ('Yamaha',         'yamaha',         'JP', 73),
  ('Zero Motorcycles','zero-motorcycles','US', 74)
ON CONFLICT (slug) DO NOTHING;
