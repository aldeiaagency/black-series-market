-- Demo premium showrooms and inventory for Black Label Market.
-- Idempotent seed: safe to run more than once. Demo dealer password: BlackLabelDemo2026!

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  demo_ns UUID := '7b870b30-3e24-4cf7-8f54-4eecf1882058';
  demo_password TEXT := 'BlackLabelDemo2026!';
BEGIN
  WITH showrooms AS (
    SELECT * FROM jsonb_to_recordset($showrooms$
    [
      {
        "slug": "nero-madrid-performance",
        "name": "Nero Madrid Performance",
        "owner": "Claudia Martin",
        "email": "demo+nero-madrid@blacklabelmarket.es",
        "city": "Madrid",
        "region": "Comunidad de Madrid",
        "address": "Calle de Joaquin Costa 41",
        "postal_code": "28002",
        "phone": "+34 910 482 117",
        "website": "https://nero-madrid-performance.example",
        "instagram": "https://instagram.com/neromadridperformance",
        "years": 11,
        "plan": "elite",
        "featured": true,
        "cover": "/images/demo/vehicles/porsche-911-gt3-rs-992.webp",
        "certifications": ["supercar", "sport", "premium"],
        "services": ["financing", "trade_in", "warranty", "transport_nat", "detailing", "home_delivery"],
        "description": "Showroom madrileno especializado en supercars modernos, unidades con bajo kilometraje y configuraciones verificadas. Su criterio se centra en historiales limpios, mantenimiento trazable y preparacion de entrega al nivel de un comprador internacional."
      },
      {
        "slug": "costa-blanca-classics",
        "name": "Costa Blanca Classics",
        "owner": "Javier Alcaraz",
        "email": "demo+costa-blanca@blacklabelmarket.es",
        "city": "Alicante",
        "region": "Comunitat Valenciana",
        "address": "Avenida de las Naciones 12",
        "postal_code": "03540",
        "phone": "+34 965 214 809",
        "website": "https://costa-blanca-classics.example",
        "instagram": "https://instagram.com/costablancaclassics",
        "years": 18,
        "plan": "professional",
        "featured": false,
        "cover": "/images/demo/vehicles/porsche-911-turbo-964.webp",
        "certifications": ["classic", "sport", "import"],
        "services": ["warranty", "transport_nat", "transport_intl", "own_workshop", "detailing"],
        "description": "Boutique de clasicos y youngtimers de coleccion con foco en homologation cars, deportivos analogicos y piezas de inversion. Cada unidad se documenta con historial, inspeccion de pintura y dossier fotografico antes de entrar en stock."
      },
      {
        "slug": "barcelona-grand-touring",
        "name": "Barcelona Grand Touring",
        "owner": "Marc Vidal",
        "email": "demo+barcelona-gt@blacklabelmarket.es",
        "city": "Barcelona",
        "region": "Cataluna",
        "address": "Carrer de Tuset 19",
        "postal_code": "08006",
        "phone": "+34 935 720 441",
        "website": "https://barcelona-grand-touring.example",
        "instagram": "https://instagram.com/barcelonagrandtouring",
        "years": 9,
        "plan": "professional",
        "featured": false,
        "cover": "/images/demo/vehicles/aston-martin-db11-amr.webp",
        "certifications": ["premium", "sport"],
        "services": ["financing", "trade_in", "warranty", "transport_nat", "home_delivery"],
        "description": "Showroom centrado en gran turismo premium: coupes de largo recorrido, berlinas deportivas y configuraciones elegantes para uso diario exigente. Seleccionan unidades con buena especificacion, kilometraje razonable y mantenimiento de marca."
      },
      {
        "slug": "sierra-norte-4x4-premium",
        "name": "Sierra Norte 4x4 Premium",
        "owner": "Alvaro Sanz",
        "email": "demo+sierra-norte@blacklabelmarket.es",
        "city": "San Agustin del Guadalix",
        "region": "Comunidad de Madrid",
        "address": "Carretera de Burgos km 34",
        "postal_code": "28750",
        "phone": "+34 918 743 202",
        "website": "https://sierra-norte-4x4.example",
        "instagram": "https://instagram.com/sierranorte4x4premium",
        "years": 14,
        "plan": "professional",
        "featured": false,
        "cover": "/images/demo/vehicles/range-rover-sv.webp",
        "certifications": ["suv", "premium"],
        "services": ["financing", "trade_in", "warranty", "transport_nat", "own_workshop"],
        "description": "Especialistas en SUV premium y todoterrenos de altas prestaciones, con inspeccion mecanica propia y preparacion estetica antes de entrega. Su stock prioriza versiones altas, historiales claros y capacidad de entrega nacional."
      },
      {
        "slug": "atlantic-collectors-garage",
        "name": "Atlantic Collectors Garage",
        "owner": "Nuria Lago",
        "email": "demo+atlantic-collectors@blacklabelmarket.es",
        "city": "Pontevedra",
        "region": "Galicia",
        "address": "Rua Marques de Riestra 28",
        "postal_code": "36001",
        "phone": "+34 986 118 774",
        "website": "https://atlantic-collectors.example",
        "instagram": "https://instagram.com/atlanticcollectorsgarage",
        "years": 16,
        "plan": "elite",
        "featured": true,
        "cover": "/images/demo/vehicles/porsche-carrera-gt.webp",
        "certifications": ["supercar", "classic", "sport"],
        "services": ["trade_in", "warranty", "transport_nat", "transport_intl", "detailing"],
        "description": "Garage privado orientado a piezas especiales, tiradas limitadas y deportivos con relato coleccionista. Trabajan pocas unidades a la vez y preparan cada ficha con trazabilidad, contexto de mercado y criterio editorial."
      },
      {
        "slug": "ducati-barcelona-corse",
        "name": "Ducati Barcelona Corse",
        "owner": "Sergi Puig",
        "email": "demo+ducati-corse@blacklabelmarket.es",
        "city": "Barcelona",
        "region": "Cataluna",
        "address": "Carrer de Pallars 101",
        "postal_code": "08018",
        "phone": "+34 936 402 818",
        "website": "https://ducati-barcelona-corse.example",
        "instagram": "https://instagram.com/ducatibarcelonacorse",
        "years": 12,
        "plan": "professional",
        "featured": false,
        "cover": "/images/demo/vehicles/ducati-panigale-v4-s.webp",
        "certifications": ["motorcycle", "sport"],
        "services": ["financing", "trade_in", "warranty", "transport_nat", "own_workshop"],
        "description": "Showroom de motos premium centrado en Ducati y unidades deportivas de alta especificacion. Verifican revisiones, campanas, estado de consumibles y electronica antes de publicar cada moto."
      },
      {
        "slug": "bilbao-heritage-motorcycles",
        "name": "Bilbao Heritage Motorcycles",
        "owner": "Iker Etxeberria",
        "email": "demo+bilbao-heritage@blacklabelmarket.es",
        "city": "Bilbao",
        "region": "Pais Vasco",
        "address": "Alameda de Recalde 36",
        "postal_code": "48009",
        "phone": "+34 944 180 662",
        "website": "https://bilbao-heritage-motorcycles.example",
        "instagram": "https://instagram.com/bilbaoheritagemoto",
        "years": 20,
        "plan": "professional",
        "featured": false,
        "cover": "/images/demo/vehicles/harley-davidson-cvo-road-glide.webp",
        "certifications": ["motorcycle", "custom"],
        "services": ["financing", "trade_in", "warranty", "transport_nat", "detailing"],
        "description": "Boutique para touring, custom y motos de caracter, con especial cuidado en kilometraje real, extras homologados y estado cosmetico. Su presentacion combina fotografia cuidada y notas claras de uso."
      },
      {
        "slug": "valencia-track-bikes",
        "name": "Valencia Track Bikes",
        "owner": "Laura Ferrer",
        "email": "demo+valencia-track@blacklabelmarket.es",
        "city": "Valencia",
        "region": "Comunitat Valenciana",
        "address": "Avenida de Francia 55",
        "postal_code": "46023",
        "phone": "+34 960 771 430",
        "website": "https://valencia-track-bikes.example",
        "instagram": "https://instagram.com/valenciatrackbikes",
        "years": 8,
        "plan": "elite",
        "featured": true,
        "cover": "/images/demo/vehicles/aprilia-rsv4-factory.webp",
        "certifications": ["motorcycle", "sport"],
        "services": ["warranty", "transport_nat", "own_workshop", "detailing"],
        "description": "Especialistas en superbikes, motos de circuito matriculadas y unidades con electronica avanzada. Cada ficha separa uso real, historial de mantenimiento, estado de neumaticos y configuracion de suspensiones."
      },
      {
        "slug": "marbella-adventure-moto",
        "name": "Marbella Adventure Moto",
        "owner": "Hugo Benitez",
        "email": "demo+marbella-adventure@blacklabelmarket.es",
        "city": "Marbella",
        "region": "Andalucia",
        "address": "Bulevar Principe Alfonso de Hohenlohe 178",
        "postal_code": "29602",
        "phone": "+34 951 228 904",
        "website": "https://marbella-adventure-moto.example",
        "instagram": "https://instagram.com/marbellaadventuremoto",
        "years": 10,
        "plan": "professional",
        "featured": false,
        "cover": "/images/demo/vehicles/bmw-r-1300-gs-option-719.webp",
        "certifications": ["motorcycle", "premium"],
        "services": ["financing", "trade_in", "warranty", "transport_nat", "home_delivery"],
        "description": "Showroom especializado en trail y touring premium preparadas para viaje. Revisan suspensiones, maletas, protecciones, electronica de ruta y documentacion para compradores que buscan una moto lista para salir."
      },
      {
        "slug": "sevilla-custom-icons",
        "name": "Sevilla Custom & Icons",
        "owner": "Manuel Rueda",
        "email": "demo+sevilla-custom@blacklabelmarket.es",
        "city": "Sevilla",
        "region": "Andalucia",
        "address": "Calle Luis Montoto 139",
        "postal_code": "41007",
        "phone": "+34 955 096 341",
        "website": "https://sevilla-custom-icons.example",
        "instagram": "https://instagram.com/sevillacustomicons",
        "years": 13,
        "plan": "professional",
        "featured": false,
        "cover": "/images/demo/vehicles/harley-davidson-fat-boy-114.webp",
        "certifications": ["motorcycle", "custom"],
        "services": ["financing", "trade_in", "warranty", "transport_nat", "detailing"],
        "description": "Seleccion de motos custom, neo-retro e iconos modernos con atencion al detalle estetico. Publican unidades limpias, con extras coherentes y fichas pensadas para compradores que valoran presencia y autenticidad."
      }
    ]
    $showrooms$::jsonb) AS s(
      slug TEXT, name TEXT, owner TEXT, email TEXT, city TEXT, region TEXT, address TEXT,
      postal_code TEXT, phone TEXT, website TEXT, instagram TEXT, years INT, plan TEXT,
      featured BOOLEAN, cover TEXT, certifications TEXT[], services TEXT[], description TEXT
    )
  )
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  SELECT
    uuid_generate_v5(demo_ns, 'user:' || email),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    email,
    crypt(demo_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', owner),
    NOW(),
    NOW()
  FROM showrooms
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();

  WITH showrooms AS (
    SELECT * FROM jsonb_to_recordset($showrooms$
    [
      {"slug":"nero-madrid-performance","name":"Nero Madrid Performance","owner":"Claudia Martin","email":"demo+nero-madrid@blacklabelmarket.es","city":"Madrid","region":"Comunidad de Madrid","address":"Calle de Joaquin Costa 41","postal_code":"28002","phone":"+34 910 482 117","website":"https://nero-madrid-performance.example","instagram":"https://instagram.com/neromadridperformance","years":11,"plan":"elite","featured":true,"cover":"/images/demo/vehicles/porsche-911-gt3-rs-992.webp","certifications":["supercar","sport","premium"],"services":["financing","trade_in","warranty","transport_nat","detailing","home_delivery"],"description":"Showroom madrileno especializado en supercars modernos, unidades con bajo kilometraje y configuraciones verificadas. Su criterio se centra en historiales limpios, mantenimiento trazable y preparacion de entrega al nivel de un comprador internacional."},
      {"slug":"costa-blanca-classics","name":"Costa Blanca Classics","owner":"Javier Alcaraz","email":"demo+costa-blanca@blacklabelmarket.es","city":"Alicante","region":"Comunitat Valenciana","address":"Avenida de las Naciones 12","postal_code":"03540","phone":"+34 965 214 809","website":"https://costa-blanca-classics.example","instagram":"https://instagram.com/costablancaclassics","years":18,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/porsche-911-turbo-964.webp","certifications":["classic","sport","import"],"services":["warranty","transport_nat","transport_intl","own_workshop","detailing"],"description":"Boutique de clasicos y youngtimers de coleccion con foco en homologation cars, deportivos analogicos y piezas de inversion. Cada unidad se documenta con historial, inspeccion de pintura y dossier fotografico antes de entrar en stock."},
      {"slug":"barcelona-grand-touring","name":"Barcelona Grand Touring","owner":"Marc Vidal","email":"demo+barcelona-gt@blacklabelmarket.es","city":"Barcelona","region":"Cataluna","address":"Carrer de Tuset 19","postal_code":"08006","phone":"+34 935 720 441","website":"https://barcelona-grand-touring.example","instagram":"https://instagram.com/barcelonagrandtouring","years":9,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/aston-martin-db11-amr.webp","certifications":["premium","sport"],"services":["financing","trade_in","warranty","transport_nat","home_delivery"],"description":"Showroom centrado en gran turismo premium: coupes de largo recorrido, berlinas deportivas y configuraciones elegantes para uso diario exigente. Seleccionan unidades con buena especificacion, kilometraje razonable y mantenimiento de marca."},
      {"slug":"sierra-norte-4x4-premium","name":"Sierra Norte 4x4 Premium","owner":"Alvaro Sanz","email":"demo+sierra-norte@blacklabelmarket.es","city":"San Agustin del Guadalix","region":"Comunidad de Madrid","address":"Carretera de Burgos km 34","postal_code":"28750","phone":"+34 918 743 202","website":"https://sierra-norte-4x4.example","instagram":"https://instagram.com/sierranorte4x4premium","years":14,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/range-rover-sv.webp","certifications":["suv","premium"],"services":["financing","trade_in","warranty","transport_nat","own_workshop"],"description":"Especialistas en SUV premium y todoterrenos de altas prestaciones, con inspeccion mecanica propia y preparacion estetica antes de entrega. Su stock prioriza versiones altas, historiales claros y capacidad de entrega nacional."},
      {"slug":"atlantic-collectors-garage","name":"Atlantic Collectors Garage","owner":"Nuria Lago","email":"demo+atlantic-collectors@blacklabelmarket.es","city":"Pontevedra","region":"Galicia","address":"Rua Marques de Riestra 28","postal_code":"36001","phone":"+34 986 118 774","website":"https://atlantic-collectors.example","instagram":"https://instagram.com/atlanticcollectorsgarage","years":16,"plan":"elite","featured":true,"cover":"/images/demo/vehicles/porsche-carrera-gt.webp","certifications":["supercar","classic","sport"],"services":["trade_in","warranty","transport_nat","transport_intl","detailing"],"description":"Garage privado orientado a piezas especiales, tiradas limitadas y deportivos con relato coleccionista. Trabajan pocas unidades a la vez y preparan cada ficha con trazabilidad, contexto de mercado y criterio editorial."},
      {"slug":"ducati-barcelona-corse","name":"Ducati Barcelona Corse","owner":"Sergi Puig","email":"demo+ducati-corse@blacklabelmarket.es","city":"Barcelona","region":"Cataluna","address":"Carrer de Pallars 101","postal_code":"08018","phone":"+34 936 402 818","website":"https://ducati-barcelona-corse.example","instagram":"https://instagram.com/ducatibarcelonacorse","years":12,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/ducati-panigale-v4-s.webp","certifications":["motorcycle","sport"],"services":["financing","trade_in","warranty","transport_nat","own_workshop"],"description":"Showroom de motos premium centrado en Ducati y unidades deportivas de alta especificacion. Verifican revisiones, campanas, estado de consumibles y electronica antes de publicar cada moto."},
      {"slug":"bilbao-heritage-motorcycles","name":"Bilbao Heritage Motorcycles","owner":"Iker Etxeberria","email":"demo+bilbao-heritage@blacklabelmarket.es","city":"Bilbao","region":"Pais Vasco","address":"Alameda de Recalde 36","postal_code":"48009","phone":"+34 944 180 662","website":"https://bilbao-heritage-motorcycles.example","instagram":"https://instagram.com/bilbaoheritagemoto","years":20,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/harley-davidson-cvo-road-glide.webp","certifications":["motorcycle","custom"],"services":["financing","trade_in","warranty","transport_nat","detailing"],"description":"Boutique para touring, custom y motos de caracter, con especial cuidado en kilometraje real, extras homologados y estado cosmetico. Su presentacion combina fotografia cuidada y notas claras de uso."},
      {"slug":"valencia-track-bikes","name":"Valencia Track Bikes","owner":"Laura Ferrer","email":"demo+valencia-track@blacklabelmarket.es","city":"Valencia","region":"Comunitat Valenciana","address":"Avenida de Francia 55","postal_code":"46023","phone":"+34 960 771 430","website":"https://valencia-track-bikes.example","instagram":"https://instagram.com/valenciatrackbikes","years":8,"plan":"elite","featured":true,"cover":"/images/demo/vehicles/aprilia-rsv4-factory.webp","certifications":["motorcycle","sport"],"services":["warranty","transport_nat","own_workshop","detailing"],"description":"Especialistas en superbikes, motos de circuito matriculadas y unidades con electronica avanzada. Cada ficha separa uso real, historial de mantenimiento, estado de neumaticos y configuracion de suspensiones."},
      {"slug":"marbella-adventure-moto","name":"Marbella Adventure Moto","owner":"Hugo Benitez","email":"demo+marbella-adventure@blacklabelmarket.es","city":"Marbella","region":"Andalucia","address":"Bulevar Principe Alfonso de Hohenlohe 178","postal_code":"29602","phone":"+34 951 228 904","website":"https://marbella-adventure-moto.example","instagram":"https://instagram.com/marbellaadventuremoto","years":10,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/bmw-r-1300-gs-option-719.webp","certifications":["motorcycle","premium"],"services":["financing","trade_in","warranty","transport_nat","home_delivery"],"description":"Showroom especializado en trail y touring premium preparadas para viaje. Revisan suspensiones, maletas, protecciones, electronica de ruta y documentacion para compradores que buscan una moto lista para salir."},
      {"slug":"sevilla-custom-icons","name":"Sevilla Custom & Icons","owner":"Manuel Rueda","email":"demo+sevilla-custom@blacklabelmarket.es","city":"Sevilla","region":"Andalucia","address":"Calle Luis Montoto 139","postal_code":"41007","phone":"+34 955 096 341","website":"https://sevilla-custom-icons.example","instagram":"https://instagram.com/sevillacustomicons","years":13,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/harley-davidson-fat-boy-114.webp","certifications":["motorcycle","custom"],"services":["financing","trade_in","warranty","transport_nat","detailing"],"description":"Seleccion de motos custom, neo-retro e iconos modernos con atencion al detalle estetico. Publican unidades limpias, con extras coherentes y fichas pensadas para compradores que valoran presencia y autenticidad."}
    ]
    $showrooms$::jsonb) AS s(slug TEXT, name TEXT, owner TEXT, email TEXT, city TEXT, region TEXT, address TEXT, postal_code TEXT, phone TEXT, website TEXT, instagram TEXT, years INT, plan TEXT, featured BOOLEAN, cover TEXT, certifications TEXT[], services TEXT[], description TEXT)
  )
  INSERT INTO profiles (id, email, full_name, role, updated_at)
  SELECT uuid_generate_v5(demo_ns, 'user:' || email), email, owner, 'dealer', NOW()
  FROM showrooms
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = 'dealer',
    updated_at = NOW();

  WITH showrooms AS (
    SELECT * FROM jsonb_to_recordset($showrooms$
    [
      {"slug":"nero-madrid-performance","name":"Nero Madrid Performance","owner":"Claudia Martin","email":"demo+nero-madrid@blacklabelmarket.es","city":"Madrid","region":"Comunidad de Madrid","address":"Calle de Joaquin Costa 41","postal_code":"28002","phone":"+34 910 482 117","website":"https://nero-madrid-performance.example","instagram":"https://instagram.com/neromadridperformance","years":11,"plan":"elite","featured":true,"cover":"/images/demo/vehicles/porsche-911-gt3-rs-992.webp","certifications":["supercar","sport","premium"],"services":["financing","trade_in","warranty","transport_nat","detailing","home_delivery"],"description":"Showroom madrileno especializado en supercars modernos, unidades con bajo kilometraje y configuraciones verificadas. Su criterio se centra en historiales limpios, mantenimiento trazable y preparacion de entrega al nivel de un comprador internacional."},
      {"slug":"costa-blanca-classics","name":"Costa Blanca Classics","owner":"Javier Alcaraz","email":"demo+costa-blanca@blacklabelmarket.es","city":"Alicante","region":"Comunitat Valenciana","address":"Avenida de las Naciones 12","postal_code":"03540","phone":"+34 965 214 809","website":"https://costa-blanca-classics.example","instagram":"https://instagram.com/costablancaclassics","years":18,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/porsche-911-turbo-964.webp","certifications":["classic","sport","import"],"services":["warranty","transport_nat","transport_intl","own_workshop","detailing"],"description":"Boutique de clasicos y youngtimers de coleccion con foco en homologation cars, deportivos analogicos y piezas de inversion. Cada unidad se documenta con historial, inspeccion de pintura y dossier fotografico antes de entrar en stock."},
      {"slug":"barcelona-grand-touring","name":"Barcelona Grand Touring","owner":"Marc Vidal","email":"demo+barcelona-gt@blacklabelmarket.es","city":"Barcelona","region":"Cataluna","address":"Carrer de Tuset 19","postal_code":"08006","phone":"+34 935 720 441","website":"https://barcelona-grand-touring.example","instagram":"https://instagram.com/barcelonagrandtouring","years":9,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/aston-martin-db11-amr.webp","certifications":["premium","sport"],"services":["financing","trade_in","warranty","transport_nat","home_delivery"],"description":"Showroom centrado en gran turismo premium: coupes de largo recorrido, berlinas deportivas y configuraciones elegantes para uso diario exigente. Seleccionan unidades con buena especificacion, kilometraje razonable y mantenimiento de marca."},
      {"slug":"sierra-norte-4x4-premium","name":"Sierra Norte 4x4 Premium","owner":"Alvaro Sanz","email":"demo+sierra-norte@blacklabelmarket.es","city":"San Agustin del Guadalix","region":"Comunidad de Madrid","address":"Carretera de Burgos km 34","postal_code":"28750","phone":"+34 918 743 202","website":"https://sierra-norte-4x4.example","instagram":"https://instagram.com/sierranorte4x4premium","years":14,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/range-rover-sv.webp","certifications":["suv","premium"],"services":["financing","trade_in","warranty","transport_nat","own_workshop"],"description":"Especialistas en SUV premium y todoterrenos de altas prestaciones, con inspeccion mecanica propia y preparacion estetica antes de entrega. Su stock prioriza versiones altas, historiales claros y capacidad de entrega nacional."},
      {"slug":"atlantic-collectors-garage","name":"Atlantic Collectors Garage","owner":"Nuria Lago","email":"demo+atlantic-collectors@blacklabelmarket.es","city":"Pontevedra","region":"Galicia","address":"Rua Marques de Riestra 28","postal_code":"36001","phone":"+34 986 118 774","website":"https://atlantic-collectors.example","instagram":"https://instagram.com/atlanticcollectorsgarage","years":16,"plan":"elite","featured":true,"cover":"/images/demo/vehicles/porsche-carrera-gt.webp","certifications":["supercar","classic","sport"],"services":["trade_in","warranty","transport_nat","transport_intl","detailing"],"description":"Garage privado orientado a piezas especiales, tiradas limitadas y deportivos con relato coleccionista. Trabajan pocas unidades a la vez y preparan cada ficha con trazabilidad, contexto de mercado y criterio editorial."},
      {"slug":"ducati-barcelona-corse","name":"Ducati Barcelona Corse","owner":"Sergi Puig","email":"demo+ducati-corse@blacklabelmarket.es","city":"Barcelona","region":"Cataluna","address":"Carrer de Pallars 101","postal_code":"08018","phone":"+34 936 402 818","website":"https://ducati-barcelona-corse.example","instagram":"https://instagram.com/ducatibarcelonacorse","years":12,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/ducati-panigale-v4-s.webp","certifications":["motorcycle","sport"],"services":["financing","trade_in","warranty","transport_nat","own_workshop"],"description":"Showroom de motos premium centrado en Ducati y unidades deportivas de alta especificacion. Verifican revisiones, campanas, estado de consumibles y electronica antes de publicar cada moto."},
      {"slug":"bilbao-heritage-motorcycles","name":"Bilbao Heritage Motorcycles","owner":"Iker Etxeberria","email":"demo+bilbao-heritage@blacklabelmarket.es","city":"Bilbao","region":"Pais Vasco","address":"Alameda de Recalde 36","postal_code":"48009","phone":"+34 944 180 662","website":"https://bilbao-heritage-motorcycles.example","instagram":"https://instagram.com/bilbaoheritagemoto","years":20,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/harley-davidson-cvo-road-glide.webp","certifications":["motorcycle","custom"],"services":["financing","trade_in","warranty","transport_nat","detailing"],"description":"Boutique para touring, custom y motos de caracter, con especial cuidado en kilometraje real, extras homologados y estado cosmetico. Su presentacion combina fotografia cuidada y notas claras de uso."},
      {"slug":"valencia-track-bikes","name":"Valencia Track Bikes","owner":"Laura Ferrer","email":"demo+valencia-track@blacklabelmarket.es","city":"Valencia","region":"Comunitat Valenciana","address":"Avenida de Francia 55","postal_code":"46023","phone":"+34 960 771 430","website":"https://valencia-track-bikes.example","instagram":"https://instagram.com/valenciatrackbikes","years":8,"plan":"elite","featured":true,"cover":"/images/demo/vehicles/aprilia-rsv4-factory.webp","certifications":["motorcycle","sport"],"services":["warranty","transport_nat","own_workshop","detailing"],"description":"Especialistas en superbikes, motos de circuito matriculadas y unidades con electronica avanzada. Cada ficha separa uso real, historial de mantenimiento, estado de neumaticos y configuracion de suspensiones."},
      {"slug":"marbella-adventure-moto","name":"Marbella Adventure Moto","owner":"Hugo Benitez","email":"demo+marbella-adventure@blacklabelmarket.es","city":"Marbella","region":"Andalucia","address":"Bulevar Principe Alfonso de Hohenlohe 178","postal_code":"29602","phone":"+34 951 228 904","website":"https://marbella-adventure-moto.example","instagram":"https://instagram.com/marbellaadventuremoto","years":10,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/bmw-r-1300-gs-option-719.webp","certifications":["motorcycle","premium"],"services":["financing","trade_in","warranty","transport_nat","home_delivery"],"description":"Showroom especializado en trail y touring premium preparadas para viaje. Revisan suspensiones, maletas, protecciones, electronica de ruta y documentacion para compradores que buscan una moto lista para salir."},
      {"slug":"sevilla-custom-icons","name":"Sevilla Custom & Icons","owner":"Manuel Rueda","email":"demo+sevilla-custom@blacklabelmarket.es","city":"Sevilla","region":"Andalucia","address":"Calle Luis Montoto 139","postal_code":"41007","phone":"+34 955 096 341","website":"https://sevilla-custom-icons.example","instagram":"https://instagram.com/sevillacustomicons","years":13,"plan":"professional","featured":false,"cover":"/images/demo/vehicles/harley-davidson-fat-boy-114.webp","certifications":["motorcycle","custom"],"services":["financing","trade_in","warranty","transport_nat","detailing"],"description":"Seleccion de motos custom, neo-retro e iconos modernos con atencion al detalle estetico. Publican unidades limpias, con extras coherentes y fichas pensadas para compradores que valoran presencia y autenticidad."}
    ]
    $showrooms$::jsonb) AS s(slug TEXT, name TEXT, owner TEXT, email TEXT, city TEXT, region TEXT, address TEXT, postal_code TEXT, phone TEXT, website TEXT, instagram TEXT, years INT, plan TEXT, featured BOOLEAN, cover TEXT, certifications TEXT[], services TEXT[], description TEXT)
  )
  INSERT INTO dealers (
    id, profile_id, slug, name, description, cover_url, location_city, location_region,
    address, postal_code, phone, whatsapp, email, website, instagram, years_in_business,
    status, subscription_plan, vehicle_slots, is_featured, is_verified, certifications,
    services, attention_note, admin_notes, updated_at
  )
  SELECT
    uuid_generate_v5(demo_ns, 'dealer:' || slug),
    uuid_generate_v5(demo_ns, 'user:' || email),
    slug,
    name,
    description,
    cover,
    city,
    region,
    address,
    postal_code,
    phone,
    phone,
    email,
    website,
    instagram,
    years,
    'active'::dealer_status,
    plan::subscription_plan,
    50,
    featured,
    true,
    certifications,
    services,
    'Atencion con cita previa. Inventario revisado y preparado antes de visita.',
    'Demo showroom seed. Password: BlackLabelDemo2026!',
    NOW()
  FROM showrooms
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    cover_url = EXCLUDED.cover_url,
    location_city = EXCLUDED.location_city,
    location_region = EXCLUDED.location_region,
    address = EXCLUDED.address,
    postal_code = EXCLUDED.postal_code,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    instagram = EXCLUDED.instagram,
    years_in_business = EXCLUDED.years_in_business,
    status = 'active'::dealer_status,
    subscription_plan = EXCLUDED.subscription_plan,
    vehicle_slots = EXCLUDED.vehicle_slots,
    is_featured = EXCLUDED.is_featured,
    is_verified = true,
    certifications = EXCLUDED.certifications,
    services = EXCLUDED.services,
    attention_note = EXCLUDED.attention_note,
    admin_notes = EXCLUDED.admin_notes,
    updated_at = NOW();

  -- Organization/subscription demo rows are intentionally omitted here.
  -- This seed targets the currently deployed public dealer/vehicle schema.

  WITH vehicles AS (
    SELECT * FROM jsonb_to_recordset($vehicles$
    [
      {"dealer":"nero-madrid-performance","slug":"porsche-911-gt3-rs-992-weissach-2024","type":"car","brand":"Porsche","model":"911","version":"GT3 RS Weissach","year":2024,"price":329900,"mileage":2400,"power":525,"cc":3996,"fuel":"gasoline","transmission":"dct","drive":"rwd","ext":"Negro Basalto","int":"Negro Race-Tex","upholstery":"Race-Tex","body":"Coupé","condition":"seminuevo","province":"Madrid","category":"supercar","owners":1,"warranty":24,"doors":2,"seats":2,"dgt":"C","badge":"Weissach","featured":true,"editors":true,"exclusive":true,"title":"Porsche 911 GT3 RS Weissach nacional","description":"Unidad nacional con paquete Weissach, historial Porsche completo y kilometraje muy bajo. Configuracion sobria en negro con frenos ceramicos, bucket seats y preparacion de entrega con medicion de pintura incluida.","equipment":["Paquete Weissach","Frenos ceramicos PCCB","Bucket seats carbono","Elevador eje delantero","PDK","Crono Sport","Escape deportivo","Carfax disponible"],"image":"/images/demo/vehicles/porsche-911-gt3-rs-992.webp"},
      {"dealer":"nero-madrid-performance","slug":"ferrari-296-gtb-assetto-fiorano-2023","type":"car","brand":"Ferrari","model":"296 GTB","version":"Assetto Fiorano","year":2023,"price":299500,"mileage":6100,"power":830,"cc":2992,"fuel":"plugin_hybrid","transmission":"dct","drive":"rwd","ext":"Rosso Corsa","int":"Nero Alcantara","upholstery":"Alcántara","body":"Coupé","condition":"seminuevo","province":"Madrid","category":"supercar","owners":1,"warranty":18,"doors":2,"seats":2,"dgt":"ECO","badge":"Assetto Fiorano","featured":true,"editors":false,"exclusive":true,"title":"Ferrari 296 GTB Assetto Fiorano","description":"296 GTB con paquete Assetto Fiorano y especificacion de alto valor para coleccionista conductor. Revisada en servicio oficial, con factura de mantenimiento reciente y configuracion Rosso Corsa sobre Alcantara Nero.","equipment":["Assetto Fiorano","Carbon racing seats","Suspension Multimatic","Frenos carboceramicos","Apple CarPlay","Lift delantero","Garantia Ferrari vigente"],"image":"/images/demo/vehicles/ferrari-296-gtb.webp"},
      {"dealer":"nero-madrid-performance","slug":"lamborghini-huracan-sto-2022","type":"car","brand":"Lamborghini","model":"Huracan","version":"STO","year":2022,"price":318000,"mileage":8900,"power":640,"cc":5204,"fuel":"gasoline","transmission":"dct","drive":"rwd","ext":"Grigio Lynx","int":"Nero Cosmus","upholstery":"Alcántara","body":"Coupé","condition":"ocasion","province":"Madrid","category":"supercar","owners":2,"warranty":12,"doors":2,"seats":2,"dgt":"C","badge":"STO","featured":true,"editors":false,"exclusive":true,"title":"Lamborghini Huracan STO con historial oficial","description":"STO con mantenimiento oficial, neumaticos recientes y PPF en frontal. Unidad muy cuidada, configurada en Grigio Lynx con detalles contrastados y perfecta para cliente que busca sensacion de circuito con matricula.","equipment":["Lamborghini Telemetry","Frenos CCM-R","Bucket seats","Paquete exterior carbono","Lift system","PPF frontal","Historial oficial"],"image":"/images/demo/vehicles/lamborghini-huracan-sto.webp"},
      {"dealer":"nero-madrid-performance","slug":"mclaren-720s-spider-performance-2021","type":"car","brand":"McLaren","model":"720S","version":"Spider Performance","year":2021,"price":249900,"mileage":12800,"power":720,"cc":3994,"fuel":"gasoline","transmission":"dct","drive":"rwd","ext":"Supernova Silver","int":"Carbon Black","upholstery":"Piel y Alcántara","body":"Cabrio / Roadster","condition":"ocasion","province":"Madrid","category":"supercar","owners":2,"warranty":12,"doors":2,"seats":2,"dgt":"C","badge":"Spider","featured":false,"editors":false,"exclusive":true,"title":"McLaren 720S Spider Performance","description":"720S Spider con fibra de carbono exterior, techo operativo revisado y mantenimiento sellado. Entrega con diagnosis McLaren, consumibles comprobados y dossier fotografico completo para compra a distancia.","equipment":["Exterior Carbon Pack","Suspension Proactive Chassis Control","Escape deportivo","Bowers & Wilkins","Lift delantero","Camara trasera","Historial McLaren"],"image":"/images/demo/vehicles/mclaren-720s-spider.webp"},
      {"dealer":"nero-madrid-performance","slug":"audi-r8-v10-performance-quattro-2022","type":"car","brand":"Audi","model":"R8","version":"V10 Performance quattro","year":2022,"price":174900,"mileage":9500,"power":620,"cc":5204,"fuel":"gasoline","transmission":"dct","drive":"awd","ext":"Daytona Grey","int":"Negro","upholstery":"Piel Nappa","body":"Coupé","condition":"seminuevo","province":"Madrid","category":"sport_performance","owners":1,"warranty":18,"doors":2,"seats":2,"dgt":"C","badge":"V10","featured":false,"editors":false,"exclusive":false,"title":"Audi R8 V10 Performance quattro","description":"Ultima generacion del R8 V10 atmosferico con configuracion discreta y kilometraje bajo. Unidad nacional con mantenimiento Audi Sport, frenos ceramicos y estado estetico muy por encima de mercado.","equipment":["Frenos ceramicos","Escape deportivo","Bang & Olufsen","Asientos deportivos Plus","Paquete carbono","Camara trasera","Historial Audi Sport"],"image":"/images/demo/vehicles/audi-r8-v10-performance.webp"},

      {"dealer":"costa-blanca-classics","slug":"porsche-911-turbo-964-1992","type":"car","brand":"Porsche","model":"911","version":"Turbo 3.3","year":1992,"price":229000,"mileage":72000,"power":320,"cc":3299,"fuel":"gasoline","transmission":"manual","drive":"rwd","ext":"Negro","int":"Negro","upholstery":"Piel","body":"Coupé","condition":"clasico","province":"Alicante","category":"classic","owners":3,"warranty":12,"doors":2,"seats":4,"dgt":"Sin etiqueta","badge":"964 Turbo","featured":true,"editors":true,"exclusive":true,"title":"Porsche 911 Turbo 964 con dossier completo","description":"964 Turbo europeo con historial documentado, matching numbers y revision mayor reciente. Pintura medida, interiores conservados y una conduccion analogica dificil de replicar en el mercado actual.","equipment":["Cambio manual","Matching numbers","Libro de mantenimiento","Revision mayor reciente","Medicion de pintura","Certificado de autenticidad","Llantas originales"],"image":"/images/demo/vehicles/porsche-911-turbo-964.webp"},
      {"dealer":"costa-blanca-classics","slug":"ferrari-f355-berlinetta-manual-1997","type":"car","brand":"Ferrari","model":"F355","version":"Berlinetta Manual","year":1997,"price":189500,"mileage":46500,"power":380,"cc":3496,"fuel":"gasoline","transmission":"manual","drive":"rwd","ext":"Rosso Corsa","int":"Cuoio","upholstery":"Piel","body":"Coupé","condition":"clasico","province":"Alicante","category":"classic","owners":4,"warranty":12,"doors":2,"seats":2,"dgt":"Sin etiqueta","badge":"Manual","featured":true,"editors":false,"exclusive":true,"title":"Ferrari F355 Berlinetta manual","description":"F355 manual con correa realizada, escapes revisados e historial europeo trazable. Una de las configuraciones mas buscadas por tacto, sonido y pureza mecanica, presentada con inspeccion previa independiente.","equipment":["Cambio manual gated","Correas realizadas","Escape revisado","Libro sellado","Herramientas originales","Interior Cuoio","Informe de compresion"],"image":"/images/demo/vehicles/ferrari-f355-berlinetta.webp"},
      {"dealer":"costa-blanca-classics","slug":"bmw-m3-e30-sport-evolution-1990","type":"car","brand":"BMW","model":"M3","version":"Sport Evolution","year":1990,"price":164900,"mileage":98000,"power":238,"cc":2467,"fuel":"gasoline","transmission":"manual","drive":"rwd","ext":"Brilliant Red","int":"Negro","upholstery":"Tela Motorsport","body":"Coupé","condition":"clasico","province":"Alicante","category":"classic","owners":3,"warranty":12,"doors":2,"seats":4,"dgt":"Sin etiqueta","badge":"Sport Evo","featured":false,"editors":true,"exclusive":true,"title":"BMW M3 E30 Sport Evolution documentado","description":"Sport Evolution con trazabilidad, componentes especificos conservados y puesta a punto reciente. Ficha pensada para comprador coleccionista: bajos fotografiados, pintura medida y documentacion de origen.","equipment":["Cambio manual","Diferencial autoblocante","Asientos Motorsport","Llantas originales","Dossier fotografico","Bajos inspeccionados","Historial documentado"],"image":"/images/demo/vehicles/bmw-m3-e30-sport-evolution.webp"},
      {"dealer":"costa-blanca-classics","slug":"mercedes-benz-190e-25-16-evo-ii-1990","type":"car","brand":"Mercedes-Benz","model":"190E","version":"2.5-16 Evolution II","year":1990,"price":289000,"mileage":54000,"power":235,"cc":2463,"fuel":"gasoline","transmission":"manual","drive":"rwd","ext":"Blue Black Metallic","int":"Negro","upholstery":"Piel","body":"Berlina","condition":"clasico","province":"Alicante","category":"classic","owners":2,"warranty":12,"doors":4,"seats":4,"dgt":"Sin etiqueta","badge":"Evo II","featured":true,"editors":true,"exclusive":true,"title":"Mercedes-Benz 190E 2.5-16 Evolution II","description":"Evolution II de coleccion, unidad europea con kilometraje contenido y mantenimiento documentado. Homologation car de referencia, conservado con criterio y preparado para auditoria previa a compra.","equipment":["Cambio manual","Aleron Evo II original","Suspension revisada","Libro de mantenimiento","Dossier fotografico","Interior original","Informe de pintura"],"image":"/images/demo/vehicles/mercedes-benz-190e-evo-ii.webp"},
      {"dealer":"costa-blanca-classics","slug":"lancia-delta-hf-integrale-evoluzione-1992","type":"car","brand":"Lancia","model":"Delta","version":"HF Integrale Evoluzione","year":1992,"price":118500,"mileage":89000,"power":210,"cc":1995,"fuel":"gasoline","transmission":"manual","drive":"awd","ext":"Rosso Monza","int":"Negro","upholstery":"Alcántara","body":"Compacto deportivo","condition":"clasico","province":"Alicante","category":"classic","owners":4,"warranty":12,"doors":5,"seats":5,"dgt":"Sin etiqueta","badge":"Evoluzione","featured":false,"editors":false,"exclusive":true,"title":"Lancia Delta HF Integrale Evoluzione","description":"Integrale Evoluzione con mantenimiento al dia, turbo revisado y carroceria inspeccionada en puntos criticos. Unidad con presencia, ideal para coleccion rally y uso ocasional sin sorpresas.","equipment":["Traccion integral","Turbo revisado","Asientos Recaro","Llantas originales","Historial de mantenimiento","Inspeccion de oxidos","Kit herramientas"],"image":"/images/demo/vehicles/lancia-delta-hf-integrale-evoluzione.webp"},

      {"dealer":"barcelona-grand-touring","slug":"aston-martin-db11-amr-2020","type":"car","brand":"Aston Martin","model":"DB11","version":"AMR V12","year":2020,"price":159900,"mileage":24500,"power":639,"cc":5204,"fuel":"gasoline","transmission":"automatic","drive":"rwd","ext":"British Racing Green","int":"Sahara Tan","upholstery":"Piel","body":"Coupé","condition":"ocasion","province":"Barcelona","category":"luxury_gt","owners":2,"warranty":12,"doors":2,"seats":4,"dgt":"C","badge":"AMR","featured":true,"editors":false,"exclusive":false,"title":"Aston Martin DB11 AMR V12","description":"DB11 AMR con combinacion clasica y kilometraje razonable, revisado en especialista Aston Martin. Gran turismo de largo recorrido con sonido V12 y presencia elegante sin caer en excesos.","equipment":["Motor V12 biturbo","Bang & Olufsen","Asientos ventilados","Camara 360","Suspension adaptativa","Libro sellado","Garantia 12 meses"],"image":"/images/demo/vehicles/aston-martin-db11-amr.webp"},
      {"dealer":"barcelona-grand-touring","slug":"bentley-continental-gt-speed-2022","type":"car","brand":"Bentley","model":"Continental GT","version":"Speed W12","year":2022,"price":238000,"mileage":17800,"power":659,"cc":5950,"fuel":"gasoline","transmission":"automatic","drive":"awd","ext":"Dark Sapphire","int":"Linen Beluga","upholstery":"Piel Nappa","body":"Coupé","condition":"seminuevo","province":"Barcelona","category":"luxury_gt","owners":1,"warranty":24,"doors":2,"seats":4,"dgt":"C","badge":"Speed","featured":true,"editors":false,"exclusive":false,"title":"Bentley Continental GT Speed W12","description":"Continental GT Speed con especificacion Mulliner, mantenimiento oficial y estado interior impecable. Unidad para cliente que busca viajar rapido, comodo y con una configuracion muy bien resuelta.","equipment":["Mulliner Driving Specification","Naim Audio","Asientos masaje","Camara 360","Direccional trasero","Frenos carboceramicos","Historial Bentley"],"image":"/images/demo/vehicles/bentley-continental-gt-speed.webp"},
      {"dealer":"barcelona-grand-touring","slug":"mercedes-amg-gt-r-2020","type":"car","brand":"Mercedes-Benz","model":"AMG GT","version":"R","year":2020,"price":159000,"mileage":21500,"power":585,"cc":3982,"fuel":"gasoline","transmission":"dct","drive":"rwd","ext":"AMG Green Hell Magno","int":"Negro","upholstery":"Dinamica","body":"Coupé","condition":"ocasion","province":"Barcelona","category":"sport_performance","owners":2,"warranty":12,"doors":2,"seats":2,"dgt":"C","badge":"AMG GT R","featured":false,"editors":false,"exclusive":false,"title":"Mercedes-AMG GT R Magno","description":"AMG GT R en color iconico, con mantenimiento Mercedes y neumaticos recientes. Deportivo serio, con eje trasero direccional y puesta a punto muy especial para comprador que valora tacto de circuito.","equipment":["AMG Ride Control","Eje trasero direccional","Bucket seats","Escape AMG Performance","Frenos ceramicos","Aerodinamica activa","Historial oficial"],"image":"/images/demo/vehicles/mercedes-amg-gt-r.webp"},
      {"dealer":"barcelona-grand-touring","slug":"maserati-granturismo-trofeo-2024","type":"car","brand":"Maserati","model":"GranTurismo","version":"Trofeo","year":2024,"price":219900,"mileage":3900,"power":550,"cc":2992,"fuel":"gasoline","transmission":"automatic","drive":"awd","ext":"Grigio Maratea","int":"Rosso","upholstery":"Piel","body":"Coupé","condition":"seminuevo","province":"Barcelona","category":"luxury_gt","owners":1,"warranty":30,"doors":2,"seats":4,"dgt":"C","badge":"Trofeo","featured":false,"editors":false,"exclusive":false,"title":"Maserati GranTurismo Trofeo Nettuno","description":"GranTurismo Trofeo practicamente nuevo, configurado con interior rojo y paquete de asistencia completo. GT italiano moderno, rapido y utilizable, con garantia oficial vigente y entrega inmediata.","equipment":["Motor Nettuno V6","Sonus Faber","Suspension adaptativa","Head-up display","Asientos ventilados","Camara 360","Garantia oficial"],"image":"/images/demo/vehicles/maserati-granturismo-trofeo.webp"},
      {"dealer":"barcelona-grand-touring","slug":"lexus-lc-500-performance-2021","type":"car","brand":"Lexus","model":"LC 500","version":"Performance Pack","year":2021,"price":89900,"mileage":28600,"power":464,"cc":4969,"fuel":"gasoline","transmission":"automatic","drive":"rwd","ext":"Structural Blue","int":"Ochre","upholstery":"Piel","body":"Coupé","condition":"ocasion","province":"Barcelona","category":"luxury_gt","owners":1,"warranty":18,"doors":2,"seats":4,"dgt":"C","badge":"V8","featured":false,"editors":true,"exclusive":false,"title":"Lexus LC 500 V8 Performance Pack","description":"LC 500 con motor V8 atmosferico, combinacion poco habitual y mantenimiento Lexus completo. Una alternativa elegante y fiable para quien busca gran turismo con personalidad y coste de uso razonable.","equipment":["Motor V8 atmosferico","Mark Levinson","Techo carbono","Diferencial Torsen","Eje trasero direccional","Asientos ventilados","Historial Lexus"],"image":"/images/demo/vehicles/lexus-lc-500.webp"},

      {"dealer":"sierra-norte-4x4-premium","slug":"land-rover-range-rover-sv-2023","type":"car","brand":"Land Rover","model":"Range Rover","version":"SV P530","year":2023,"price":219000,"mileage":14200,"power":530,"cc":4395,"fuel":"gasoline","transmission":"automatic","drive":"awd","ext":"Satin Black","int":"Caraway","upholstery":"Piel semi-anilina","body":"SUV","condition":"seminuevo","province":"Madrid","category":"luxury_suv","owners":1,"warranty":24,"doors":5,"seats":5,"dgt":"C","badge":"SV","featured":true,"editors":false,"exclusive":false,"title":"Range Rover SV P530 Satin Black","description":"Range Rover SV con configuracion executive, pintura satinada y mantenimiento oficial. Unidad ideal para representacion, viajes y uso diario premium, revisada mecanicamente y sin historial de campo duro.","equipment":["Executive Class Comfort","Meridian Signature","Asientos masaje","Nevera central","Suspension neumatica","Camara 360","Garantia oficial"],"image":"/images/demo/vehicles/range-rover-sv.webp"},
      {"dealer":"sierra-norte-4x4-premium","slug":"mercedes-amg-g-63-2022","type":"car","brand":"Mercedes-Benz","model":"Clase G","version":"AMG G 63","year":2022,"price":214900,"mileage":20500,"power":585,"cc":3982,"fuel":"gasoline","transmission":"automatic","drive":"4wd","ext":"Obsidian Black","int":"Bengal Red","upholstery":"Piel Nappa","body":"SUV","condition":"ocasion","province":"Madrid","category":"luxury_suv","owners":1,"warranty":18,"doors":5,"seats":5,"dgt":"C","badge":"AMG","featured":true,"editors":false,"exclusive":false,"title":"Mercedes-AMG G 63 Obsidian Black","description":"G 63 nacional con paquete Night, interior rojo y mantenimiento Mercedes. Preparado para entrega con revision completa, neumaticos en buen estado y todos los extras clave de confort y sonido.","equipment":["Paquete Night AMG","Burmester","Asientos multicontorno","Techo solar","Camara 360","Distronic","Historial oficial"],"image":"/images/demo/vehicles/mercedes-amg-g-63.webp"},
      {"dealer":"sierra-norte-4x4-premium","slug":"porsche-cayenne-turbo-gt-2023","type":"car","brand":"Porsche","model":"Cayenne","version":"Turbo GT","year":2023,"price":179900,"mileage":11800,"power":640,"cc":3996,"fuel":"gasoline","transmission":"automatic","drive":"awd","ext":"Arctic Grey","int":"Negro","upholstery":"Race-Tex","body":"SUV","condition":"seminuevo","province":"Madrid","category":"luxury_suv","owners":1,"warranty":24,"doors":5,"seats":4,"dgt":"C","badge":"Turbo GT","featured":false,"editors":true,"exclusive":false,"title":"Porsche Cayenne Turbo GT nacional","description":"Turbo GT con especificacion muy completa, frenos ceramicos y mantenimiento Porsche. SUV de altas prestaciones con comportamiento sorprendente y una ficha limpia para comprador exigente.","equipment":["PCCB","PDCC","Escape deportivo","Race-Tex","Bose","Eje trasero direccional","Garantia Porsche"],"image":"/images/demo/vehicles/porsche-cayenne-turbo-gt.webp"},
      {"dealer":"sierra-norte-4x4-premium","slug":"lamborghini-urus-performante-2023","type":"car","brand":"Lamborghini","model":"Urus","version":"Performante","year":2023,"price":309000,"mileage":7200,"power":666,"cc":3996,"fuel":"gasoline","transmission":"automatic","drive":"awd","ext":"Verde Mantis","int":"Nero Cosmus","upholstery":"Alcántara","body":"SUV","condition":"seminuevo","province":"Madrid","category":"luxury_suv","owners":1,"warranty":24,"doors":5,"seats":5,"dgt":"C","badge":"Performante","featured":true,"editors":false,"exclusive":true,"title":"Lamborghini Urus Performante Verde Mantis","description":"Urus Performante con color de alto impacto, carbono exterior y garantia oficial. Unidad muy poco rodada, enfocada a cliente que busca presencia, prestaciones y disponibilidad inmediata.","equipment":["Paquete carbono","Escape Akrapovic","Asientos deportivos","Lamborghini ANIMA","Camara 360","Frenos carboceramicos","Garantia oficial"],"image":"/images/demo/vehicles/lamborghini-urus-performante.webp"},
      {"dealer":"sierra-norte-4x4-premium","slug":"aston-martin-dbx707-2023","type":"car","brand":"Aston Martin","model":"DBX","version":"707","year":2023,"price":239900,"mileage":9900,"power":707,"cc":3982,"fuel":"gasoline","transmission":"automatic","drive":"awd","ext":"Xenon Grey","int":"Onyx Black","upholstery":"Piel","body":"SUV","condition":"seminuevo","province":"Madrid","category":"luxury_suv","owners":1,"warranty":24,"doors":5,"seats":5,"dgt":"C","badge":"707","featured":false,"editors":false,"exclusive":false,"title":"Aston Martin DBX707 Xenon Grey","description":"DBX707 con configuracion discreta y mantenimiento oficial. SUV premium con tacto mas deportivo de lo habitual, perfecto para quien quiere prestaciones de supercar sin renunciar a uso familiar.","equipment":["Frenos carboceramicos","Suspension adaptativa","Bowers & Wilkins","Asientos ventilados","Paquete carbono","Camara 360","Garantia Aston Martin"],"image":"/images/demo/vehicles/aston-martin-dbx707.webp"},

      {"dealer":"atlantic-collectors-garage","slug":"porsche-carrera-gt-2005","type":"car","brand":"Porsche","model":"Carrera GT","version":"V10 Manual","year":2005,"price":1190000,"mileage":18500,"power":612,"cc":5733,"fuel":"gasoline","transmission":"manual","drive":"rwd","ext":"GT Silver","int":"Ascot Brown","upholstery":"Piel","body":"Cabrio / Roadster","condition":"coleccion","province":"Pontevedra","category":"collector","owners":3,"warranty":12,"doors":2,"seats":2,"dgt":"C","badge":"Collector","featured":true,"editors":true,"exclusive":true,"title":"Porsche Carrera GT GT Silver","description":"Carrera GT europeo con historial de servicio, embrague medido y documentacion completa. Pieza central de coleccion, presentada con informe independiente y disponibilidad para inspeccion especializada.","equipment":["Cambio manual","Motor V10","Embrague medido","Maletas originales","Libro sellado","Informe independiente","Dossier fotografico completo"],"image":"/images/demo/vehicles/porsche-carrera-gt.webp"},
      {"dealer":"atlantic-collectors-garage","slug":"ferrari-430-scuderia-2008","type":"car","brand":"Ferrari","model":"F430","version":"Scuderia","year":2008,"price":285000,"mileage":31500,"power":510,"cc":4308,"fuel":"gasoline","transmission":"semi_automatic","drive":"rwd","ext":"Rosso Scuderia","int":"Negro","upholstery":"Alcántara","body":"Coupé","condition":"coleccion","province":"Pontevedra","category":"collector","owners":3,"warranty":12,"doors":2,"seats":2,"dgt":"C","badge":"Scuderia","featured":true,"editors":false,"exclusive":true,"title":"Ferrari 430 Scuderia con carbon pack","description":"430 Scuderia con historial Ferrari, embrague dentro de tolerancia y configuracion muy deseable. Unidad enfocada a coleccionista que busca sensacion analogica moderna y valor de serie especial.","equipment":["Carbon racing seats","F1 SuperFast2","Frenos carboceramicos","Escape Scuderia","Libro sellado","Medicion de embrague","Herramientas"],"image":"/images/demo/vehicles/ferrari-430-scuderia.webp"},
      {"dealer":"atlantic-collectors-garage","slug":"corvette-c8-z06-3lz-2024","type":"car","brand":"Corvette","model":"C8","version":"Z06 3LZ","year":2024,"price":169900,"mileage":3200,"power":670,"cc":5454,"fuel":"gasoline","transmission":"dct","drive":"rwd","ext":"Black","int":"Adrenaline Red","upholstery":"Piel","body":"Coupé","condition":"seminuevo","province":"Pontevedra","category":"sport_performance","owners":1,"warranty":24,"doors":2,"seats":2,"dgt":"C","badge":"Z06","featured":false,"editors":true,"exclusive":false,"title":"Corvette C8 Z06 3LZ europeo","description":"C8 Z06 con especificacion 3LZ, motor atmosferico de alto regimen y kilometraje testimonial. Unidad importada con documentacion completa, IVA deducible y preparacion de entrega nacional.","equipment":["Paquete 3LZ","Frenos carboceramicos","Lift delantero","Bose Performance","Asientos Competition","Camara PDR","IVA deducible"],"image":"/images/demo/vehicles/chevrolet-corvette-c8-z06.webp"},
      {"dealer":"atlantic-collectors-garage","slug":"nissan-gt-r-nismo-2021","type":"car","brand":"Nissan","model":"GT-R","version":"Nismo","year":2021,"price":219900,"mileage":9800,"power":600,"cc":3799,"fuel":"gasoline","transmission":"dct","drive":"awd","ext":"Pearl White","int":"Negro Rojo","upholstery":"Alcántara","body":"Coupé","condition":"ocasion","province":"Pontevedra","category":"sport_performance","owners":2,"warranty":12,"doors":2,"seats":4,"dgt":"C","badge":"Nismo","featured":false,"editors":false,"exclusive":true,"title":"Nissan GT-R Nismo Pearl White","description":"GT-R Nismo con uso muy cuidado, mantenimiento especialista y estado de carbono excelente. Una de las formas mas serias de comprar rendimiento japones con escasez real en mercado europeo.","equipment":["Paquete Nismo","Carbono exterior","Suspension Bilstein DampTronic","Frenos Brembo","Recaro carbono","Historial especialista","Neumaticos recientes"],"image":"/images/demo/vehicles/nissan-gt-r-nismo.webp"},
      {"dealer":"atlantic-collectors-garage","slug":"alpine-a110-r-2023","type":"car","brand":"Alpine","model":"A110","version":"R","year":2023,"price":89900,"mileage":7600,"power":300,"cc":1798,"fuel":"gasoline","transmission":"dct","drive":"rwd","ext":"Bleu Racing Mat","int":"Negro","upholstery":"Microfibra","body":"Coupé","condition":"seminuevo","province":"Pontevedra","category":"sport_performance","owners":1,"warranty":18,"doors":2,"seats":2,"dgt":"C","badge":"A110 R","featured":false,"editors":true,"exclusive":false,"title":"Alpine A110 R Bleu Racing Mat","description":"A110 R con llantas de carbono, buckets Sabelt y mantenimiento Alpine. Deportivo ligero, raro y muy disfrutable, perfecto para coleccionista que tambien quiere conducirlo en carretera.","equipment":["Llantas carbono","Buckets Sabelt","Escape deportivo","Aero kit R","Telemetria Alpine","Garantia oficial","Peso reducido"],"image":"/images/demo/vehicles/alpine-a110-r.webp"},

      {"dealer":"ducati-barcelona-corse","slug":"ducati-panigale-v4-s-2024","type":"motorcycle","brand":"Ducati","model":"Panigale V4","version":"S","year":2024,"price":31900,"mileage":1800,"power":215,"cc":1103,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Ducati Red","int":"Negro","upholstery":"Asiento deportivo","body":"Superbike","condition":"seminuevo","province":"Barcelona","category":"moto_sport","owners":1,"warranty":24,"doors":null,"seats":1,"dgt":"C","badge":"V4 S","featured":true,"editors":true,"exclusive":false,"title":"Ducati Panigale V4 S 2024","description":"Panigale V4 S con rodaje realizado, primera revision sellada y neumaticos practicamente nuevos. Unidad para cliente que busca superbike actual, con electronica completa y entrega revisada por especialista.","equipment":["Suspension Ohlins electronica","Frenos Brembo Stylema","Quickshifter","Riding modes","Control traccion","ABS cornering","Garantia oficial"],"image":"/images/demo/vehicles/ducati-panigale-v4-s.webp"},
      {"dealer":"ducati-barcelona-corse","slug":"ducati-streetfighter-v4-sp2-2023","type":"motorcycle","brand":"Ducati","model":"Streetfighter V4","version":"SP2","year":2023,"price":38900,"mileage":2600,"power":208,"cc":1103,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Winter Test","int":"Negro","upholstery":"Asiento deportivo","body":"Hypernaked","condition":"seminuevo","province":"Barcelona","category":"moto_sport","owners":1,"warranty":18,"doors":null,"seats":1,"dgt":"C","badge":"SP2","featured":true,"editors":false,"exclusive":true,"title":"Ducati Streetfighter V4 SP2 numerada","description":"SP2 con llantas de carbono, embrague seco y equipamiento de alto nivel. Moto de cupo limitado, revisada, sin circuito intensivo declarado y lista para comprador que busca una naked extrema.","equipment":["Llantas carbono","Embrague seco","Ohlins Smart EC","Brembo Stylema R","Quickshifter","Control wheelie","Edicion numerada"],"image":"/images/demo/vehicles/ducati-streetfighter-v4-sp2.webp"},
      {"dealer":"ducati-barcelona-corse","slug":"ducati-multistrada-v4-rally-2023","type":"motorcycle","brand":"Ducati","model":"Multistrada V4","version":"Rally","year":2023,"price":27900,"mileage":9400,"power":170,"cc":1158,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Iceberg White","int":"Negro","upholstery":"Confort","body":"Trail / Adventure","condition":"ocasion","province":"Barcelona","category":"moto_adventure","owners":1,"warranty":18,"doors":null,"seats":2,"dgt":"C","badge":"Rally","featured":false,"editors":false,"exclusive":false,"title":"Ducati Multistrada V4 Rally Travel Pack","description":"Multistrada V4 Rally con maletas, radar y mantenimiento al dia. Trail premium pensada para viaje largo, con consumibles revisados y electronica completa para touring exigente.","equipment":["Radar delantero y trasero","Maletas laterales","Suspension Skyhook","Quickshifter","Puños calefactables","ABS cornering","Control crucero adaptativo"],"image":"/images/demo/vehicles/ducati-multistrada-v4-rally.webp"},
      {"dealer":"ducati-barcelona-corse","slug":"ducati-diavel-v4-2024","type":"motorcycle","brand":"Ducati","model":"Diavel V4","version":"Black Roadster","year":2024,"price":26900,"mileage":2100,"power":168,"cc":1158,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Thrilling Black","int":"Negro","upholstery":"Confort","body":"Custom / Cruiser","condition":"seminuevo","province":"Barcelona","category":"moto_custom","owners":1,"warranty":24,"doors":null,"seats":2,"dgt":"C","badge":"V4","featured":false,"editors":false,"exclusive":false,"title":"Ducati Diavel V4 Thrilling Black","description":"Diavel V4 casi nueva, con configuracion oscura y primera revision completada. Moto con mucha presencia, motor V4 Granturismo y posicion comoda para uso real sin perder caracter.","equipment":["Motor V4 Granturismo","Quickshifter","Launch Control","Riding modes","Iluminacion full LED","Keyless","Garantia oficial"],"image":"/images/demo/vehicles/ducati-diavel-v4.webp"},
      {"dealer":"ducati-barcelona-corse","slug":"ducati-supersport-950-s-2022","type":"motorcycle","brand":"Ducati","model":"SuperSport","version":"950 S","year":2022,"price":14900,"mileage":8700,"power":110,"cc":937,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Arctic White Silk","int":"Negro","upholstery":"Asiento deportivo","body":"Sport Touring","condition":"ocasion","province":"Barcelona","category":"moto_sport_touring","owners":1,"warranty":12,"doors":null,"seats":2,"dgt":"C","badge":"950 S","featured":false,"editors":false,"exclusive":false,"title":"Ducati SuperSport 950 S muy cuidada","description":"SuperSport 950 S con suspensiones Ohlins y uso de carretera. Una Ducati equilibrada para disfrutar a diario y en rutas, revisada con neumaticos y frenos en buen estado.","equipment":["Suspension Ohlins","Quickshifter","ABS cornering","Control traccion","Riding modes","Cupula regulable","Libro sellado"],"image":"/images/demo/vehicles/ducati-supersport-950-s.webp"},

      {"dealer":"bilbao-heritage-motorcycles","slug":"harley-davidson-cvo-road-glide-2023","type":"motorcycle","brand":"Harley-Davidson","model":"CVO Road Glide","version":"121","year":2023,"price":49900,"mileage":5200,"power":115,"cc":1977,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Black Bronze","int":"Negro","upholstery":"Touring","body":"Turismo","condition":"ocasion","province":"Vizcaya","category":"moto_touring","owners":1,"warranty":18,"doors":null,"seats":2,"dgt":"C","badge":"CVO","featured":true,"editors":false,"exclusive":false,"title":"Harley-Davidson CVO Road Glide 121","description":"CVO Road Glide con equipamiento tope de gama, sonido premium y kilometraje contenido. Touring de lujo con revision reciente y estado cosmetico excelente para viajes largos.","equipment":["Motor Milwaukee-Eight VVT 121","Audio Rockford Fosgate","Pantalla Skyline OS","Maletas rigidas","Control crucero","ABS","Garantia oficial"],"image":"/images/demo/vehicles/harley-davidson-cvo-road-glide.webp"},
      {"dealer":"bilbao-heritage-motorcycles","slug":"indian-challenger-elite-2022","type":"motorcycle","brand":"Indian","model":"Challenger","version":"Elite","year":2022,"price":39900,"mileage":6900,"power":122,"cc":1768,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Red Black","int":"Negro","upholstery":"Touring","body":"Turismo","condition":"ocasion","province":"Vizcaya","category":"moto_touring","owners":1,"warranty":12,"doors":null,"seats":2,"dgt":"C","badge":"Elite","featured":true,"editors":false,"exclusive":true,"title":"Indian Challenger Elite numerada","description":"Challenger Elite de produccion limitada, con pintura especial y equipamiento completo. Revisada, con extras originales y estado muy cuidado para comprador que busca touring diferente.","equipment":["PowerPlus 108","Ride Command","Audio premium","Maletas rigidas","Pantalla electrica","Riding modes","Edicion limitada"],"image":"/images/demo/vehicles/indian-challenger-elite.webp"},
      {"dealer":"bilbao-heritage-motorcycles","slug":"bmw-r-18-transcontinental-2022","type":"motorcycle","brand":"BMW Motorrad","model":"R 18","version":"Transcontinental","year":2022,"price":28900,"mileage":11200,"power":91,"cc":1802,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Black Storm","int":"Negro","upholstery":"Touring","body":"Turismo","condition":"ocasion","province":"Vizcaya","category":"moto_touring","owners":1,"warranty":12,"doors":null,"seats":2,"dgt":"C","badge":"Big Boxer","featured":false,"editors":false,"exclusive":false,"title":"BMW R 18 Transcontinental full equip","description":"R 18 Transcontinental con configuracion touring completa, mantenimiento BMW y accesorios originales. Moto de gran presencia para viajes tranquilos, con confort y sonido muy cuidados.","equipment":["Marshall Gold Series","Maletas y top case","Marcha atras","Control crucero","Puños calefactables","Riding modes","Historial BMW"],"image":"/images/demo/vehicles/bmw-r-18-transcontinental.webp"},
      {"dealer":"bilbao-heritage-motorcycles","slug":"triumph-rocket-3-gt-2021","type":"motorcycle","brand":"Triumph","model":"Rocket 3","version":"GT","year":2021,"price":21900,"mileage":14500,"power":167,"cc":2458,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Silver Ice","int":"Negro","upholstery":"Confort","body":"Custom / Cruiser","condition":"ocasion","province":"Vizcaya","category":"moto_custom","owners":2,"warranty":12,"doors":null,"seats":2,"dgt":"C","badge":"Rocket 3","featured":false,"editors":true,"exclusive":false,"title":"Triumph Rocket 3 GT con extras touring","description":"Rocket 3 GT con respaldo, maletas blandas originales y revisiones al dia. Una moto unica por par motor y presencia, presentada con consumibles comprobados y prueba disponible con cita.","equipment":["Motor 2458 cc","Quickshifter","Control crucero","Puños calefactables","Respaldo pasajero","ABS cornering","Control traccion"],"image":"/images/demo/vehicles/triumph-rocket-3-gt.webp"},
      {"dealer":"bilbao-heritage-motorcycles","slug":"moto-guzzi-v100-mandello-s-2023","type":"motorcycle","brand":"Moto Guzzi","model":"V100 Mandello","version":"S","year":2023,"price":16900,"mileage":6800,"power":115,"cc":1042,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Verde 2121","int":"Negro","upholstery":"Confort","body":"Sport Touring","condition":"ocasion","province":"Vizcaya","category":"moto_sport_touring","owners":1,"warranty":18,"doors":null,"seats":2,"dgt":"C","badge":"S","featured":false,"editors":false,"exclusive":false,"title":"Moto Guzzi V100 Mandello S","description":"V100 Mandello S con suspension electronica y mantenimiento oficial. Sport touring con personalidad, cardan y una configuracion elegante para viajar sin renunciar a sensaciones.","equipment":["Ohlins Smart EC","Quickshifter","Deflectores activos","Puños calefactables","Control crucero","ABS cornering","Maletas opcionales"],"image":"/images/demo/vehicles/moto-guzzi-v100-mandello-s.webp"},

      {"dealer":"valencia-track-bikes","slug":"aprilia-rsv4-factory-2024","type":"motorcycle","brand":"Aprilia","model":"RSV4","version":"Factory","year":2024,"price":26900,"mileage":1200,"power":217,"cc":1099,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Time Attack","int":"Negro","upholstery":"Asiento deportivo","body":"Superbike","condition":"seminuevo","province":"Valencia","category":"moto_sport","owners":1,"warranty":24,"doors":null,"seats":1,"dgt":"C","badge":"Factory","featured":true,"editors":true,"exclusive":false,"title":"Aprilia RSV4 Factory 2024","description":"RSV4 Factory practicamente nueva, con primera revision realizada y electronica APRC completa. Se entrega con setup base de suspensiones y comprobacion de consumibles para uso deportivo responsable.","equipment":["APRC","Suspension Ohlins","Frenos Brembo Stylema","Quickshifter","Winglets","Riding modes","Garantia oficial"],"image":"/images/demo/vehicles/aprilia-rsv4-factory.webp"},
      {"dealer":"valencia-track-bikes","slug":"bmw-m-1000-rr-competition-2023","type":"motorcycle","brand":"BMW Motorrad","model":"M 1000 RR","version":"Competition","year":2023,"price":36900,"mileage":3400,"power":212,"cc":999,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Light White M","int":"Negro","upholstery":"M seat","body":"Superbike","condition":"ocasion","province":"Valencia","category":"moto_sport","owners":1,"warranty":18,"doors":null,"seats":1,"dgt":"C","badge":"M Competition","featured":true,"editors":false,"exclusive":true,"title":"BMW M 1000 RR Competition","description":"M 1000 RR Competition con paquete M, fibra de carbono y mantenimiento BMW. Unidad muy seria para cliente de tandas ocasionales que quiere una superbike matriculada sin preparar de forma irreversible.","equipment":["Paquete M Competition","Carbon wheels","Aero winglets","M GPS Laptrigger","Quickshifter Pro","ABS Pro","Control traccion"],"image":"/images/demo/vehicles/bmw-m-1000-rr-competition.webp"},
      {"dealer":"valencia-track-bikes","slug":"kawasaki-ninja-h2-carbon-2021","type":"motorcycle","brand":"Kawasaki","model":"Ninja H2","version":"Carbon","year":2021,"price":31900,"mileage":7600,"power":231,"cc":998,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Mirror Coated Black","int":"Negro","upholstery":"Deportivo","body":"Superbike","condition":"ocasion","province":"Valencia","category":"moto_sport","owners":2,"warranty":12,"doors":null,"seats":1,"dgt":"C","badge":"H2 Carbon","featured":false,"editors":true,"exclusive":true,"title":"Kawasaki Ninja H2 Carbon supercharged","description":"Ninja H2 Carbon con historial sellado, neumaticos recientes y estado de carenados excelente. Una moto exotica por compresor y presencia, revisada con especial atencion a transmision y frenos.","equipment":["Compresor Kawasaki","Carenado carbono","Brembo Stylema","Quickshifter","KTRC","Launch control","Suspension KYB"],"image":"/images/demo/vehicles/kawasaki-ninja-h2-carbon.webp"},
      {"dealer":"valencia-track-bikes","slug":"mv-agusta-superveloce-1000-serie-oro-2024","type":"motorcycle","brand":"MV Agusta","model":"Superveloce","version":"1000 Serie Oro","year":2024,"price":69900,"mileage":450,"power":208,"cc":998,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Rosso Ago","int":"Negro","upholstery":"Alcántara","body":"Superbike","condition":"coleccion","province":"Valencia","category":"moto_sport","owners":1,"warranty":24,"doors":null,"seats":1,"dgt":"C","badge":"Serie Oro","featured":true,"editors":true,"exclusive":true,"title":"MV Agusta Superveloce 1000 Serie Oro","description":"Serie Oro de cupo limitado con kilometraje de entrega y documentacion completa. Moto de coleccion, mas cercana a una pieza de diseno funcional que a una superbike convencional.","equipment":["Edicion limitada","Alerones carbono","Ohlins electronica","Brembo Stylema","Quickshifter","Control traccion","Certificado MV"],"image":"/images/demo/vehicles/mv-agusta-superveloce-1000-serie-oro.webp"},
      {"dealer":"valencia-track-bikes","slug":"yamaha-yzf-r1m-2022","type":"motorcycle","brand":"Yamaha","model":"YZF-R1M","version":"Carbon","year":2022,"price":23900,"mileage":8100,"power":200,"cc":998,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Carbon Blue","int":"Negro","upholstery":"Deportivo","body":"Superbike","condition":"ocasion","province":"Valencia","category":"moto_sport","owners":1,"warranty":12,"doors":null,"seats":1,"dgt":"C","badge":"R1M","featured":false,"editors":false,"exclusive":false,"title":"Yamaha YZF-R1M carbono","description":"R1M con suspension electronica, carenado carbono y uso de carretera documentado. Revisada por especialista, con pastillas y neumaticos en buen estado, lista para disfrutar sin puesta a punto pendiente.","equipment":["Ohlins ERS","Carenado carbono","Quickshifter","Slide control","Launch control","ABS","Telemetria Yamaha"],"image":"/images/demo/vehicles/yamaha-yzf-r1m.webp"},

      {"dealer":"marbella-adventure-moto","slug":"bmw-r-1300-gs-option-719-2024","type":"motorcycle","brand":"BMW Motorrad","model":"R 1300 GS","version":"Option 719","year":2024,"price":25900,"mileage":3900,"power":145,"cc":1300,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Aurelius Green","int":"Negro","upholstery":"Confort","body":"Trail / Adventure","condition":"seminuevo","province":"Malaga","category":"moto_adventure","owners":1,"warranty":24,"doors":null,"seats":2,"dgt":"C","badge":"Option 719","featured":true,"editors":false,"exclusive":false,"title":"BMW R 1300 GS Option 719 full equip","description":"R 1300 GS Option 719 con paquetes completos, radar y maletas. Unidad casi nueva, revisada para viaje, con neumaticos mixtos en buen estado y garantia oficial activa.","equipment":["Dynamic ESA","Radar ACC","Maletas Vario","Quickshifter Pro","Puños calefactables","ABS Pro","Luz adaptativa"],"image":"/images/demo/vehicles/bmw-r-1300-gs-option-719.webp"},
      {"dealer":"marbella-adventure-moto","slug":"ducati-desertx-rally-2024","type":"motorcycle","brand":"Ducati","model":"DesertX","version":"Rally","year":2024,"price":21900,"mileage":2700,"power":110,"cc":937,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Iron Giant","int":"Negro","upholstery":"Rally","body":"Trail / Adventure","condition":"seminuevo","province":"Malaga","category":"moto_adventure","owners":1,"warranty":24,"doors":null,"seats":2,"dgt":"C","badge":"Rally","featured":false,"editors":true,"exclusive":false,"title":"Ducati DesertX Rally con protecciones","description":"DesertX Rally con protecciones originales, suspension de largo recorrido y primera revision sellada. Moto muy capaz para off-road ligero y viajes, presentada sin golpes ni uso extremo declarado.","equipment":["Suspension KYB Rally","Llantas de radios","Protecciones motor","Quickshifter","Riding modes","ABS cornering","Garantia Ducati"],"image":"/images/demo/vehicles/ducati-desertx-rally.webp"},
      {"dealer":"marbella-adventure-moto","slug":"ktm-1290-super-adventure-r-2023","type":"motorcycle","brand":"KTM","model":"1290 Super Adventure","version":"R","year":2023,"price":18900,"mileage":10400,"power":160,"cc":1301,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Orange Black","int":"Negro","upholstery":"Rally","body":"Trail / Adventure","condition":"ocasion","province":"Malaga","category":"moto_adventure","owners":1,"warranty":12,"doors":null,"seats":2,"dgt":"C","badge":"R","featured":false,"editors":false,"exclusive":false,"title":"KTM 1290 Super Adventure R Tech Pack","description":"1290 Super Adventure R con Tech Pack, uso de ruta y revisiones al dia. Entrega con comprobacion de suspension, llantas y kit de transmision para comprador que quiere aventura real.","equipment":["Tech Pack","Rally mode","Quickshifter+","Suspension WP","Control crucero","ABS Offroad","Protecciones"],"image":"/images/demo/vehicles/ktm-1290-super-adventure-r.webp"},
      {"dealer":"marbella-adventure-moto","slug":"triumph-tiger-1200-rally-pro-2023","type":"motorcycle","brand":"Triumph","model":"Tiger 1200","version":"Rally Pro","year":2023,"price":17900,"mileage":11800,"power":150,"cc":1160,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Matte Khaki","int":"Negro","upholstery":"Confort","body":"Trail / Adventure","condition":"ocasion","province":"Malaga","category":"moto_adventure","owners":1,"warranty":12,"doors":null,"seats":2,"dgt":"C","badge":"Rally Pro","featured":false,"editors":false,"exclusive":false,"title":"Triumph Tiger 1200 Rally Pro","description":"Tiger 1200 Rally Pro con maletas, defensas y mantenimiento Triumph. Trail grande muy equilibrada, con cardan, electronica completa y estado cosmetico excelente para su kilometraje.","equipment":["Suspension semi-activa","Radar trasero","Quickshifter","Puños calefactables","Defensas","Maletas aluminio","ABS cornering"],"image":"/images/demo/vehicles/triumph-tiger-1200-rally-pro.webp"},
      {"dealer":"marbella-adventure-moto","slug":"honda-africa-twin-adventure-sports-2022","type":"motorcycle","brand":"Honda","model":"Africa Twin","version":"Adventure Sports DCT","year":2022,"price":15900,"mileage":16400,"power":102,"cc":1084,"fuel":"gasoline","transmission":"dct","drive":null,"ext":"Pearl Glare White","int":"Negro","upholstery":"Confort","body":"Trail / Adventure","condition":"ocasion","province":"Malaga","category":"moto_adventure","owners":1,"warranty":12,"doors":null,"seats":2,"dgt":"C","badge":"DCT","featured":false,"editors":false,"exclusive":false,"title":"Honda Africa Twin Adventure Sports DCT","description":"Africa Twin Adventure Sports con cambio DCT, maletas y mantenimiento Honda. Una unidad honesta, bien equipada y lista para viaje largo con bajo coste de uso relativo.","equipment":["Cambio DCT","Deposito grande","Apple CarPlay","Maletas","Puños calefactables","ABS cornering","Control traccion"],"image":"/images/demo/vehicles/honda-africa-twin-adventure-sports.webp"},

      {"dealer":"sevilla-custom-icons","slug":"harley-davidson-fat-boy-114-2022","type":"motorcycle","brand":"Harley-Davidson","model":"Fat Boy","version":"114","year":2022,"price":24900,"mileage":7600,"power":94,"cc":1868,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Vivid Black","int":"Negro","upholstery":"Custom","body":"Custom / Cruiser","condition":"ocasion","province":"Sevilla","category":"moto_custom","owners":1,"warranty":12,"doors":null,"seats":2,"dgt":"C","badge":"114","featured":true,"editors":false,"exclusive":false,"title":"Harley-Davidson Fat Boy 114 Vivid Black","description":"Fat Boy 114 con escapes homologados, asiento confort y mantenimiento Harley. Moto con presencia clasica, presentada en estado muy limpio y con accesorios bien integrados.","equipment":["Milwaukee-Eight 114","Escapes homologados","Asiento confort","ABS","Keyless","Libro sellado","Detailing incluido"],"image":"/images/demo/vehicles/harley-davidson-fat-boy-114.webp"},
      {"dealer":"sevilla-custom-icons","slug":"indian-ftr-r-carbon-2023","type":"motorcycle","brand":"Indian","model":"FTR","version":"R Carbon","year":2023,"price":17900,"mileage":4300,"power":123,"cc":1203,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Carbon Black","int":"Negro","upholstery":"Deportivo","body":"Naked deportiva","condition":"seminuevo","province":"Sevilla","category":"moto_custom","owners":1,"warranty":18,"doors":null,"seats":2,"dgt":"C","badge":"R Carbon","featured":false,"editors":true,"exclusive":false,"title":"Indian FTR R Carbon","description":"FTR R Carbon con poco kilometraje, fibra visible y revisiones al dia. Naked americana con tacto deportivo y estetica boutique, perfecta para quien busca algo fuera de lo habitual.","equipment":["Ohlins ajustable","Frenos Brembo","Escape Akrapovic","Pantalla TFT","Riding modes","Control traccion","Carbono exterior"],"image":"/images/demo/vehicles/indian-ftr-r-carbon.webp"},
      {"dealer":"sevilla-custom-icons","slug":"triumph-bonneville-bobber-chrome-2023","type":"motorcycle","brand":"Triumph","model":"Bonneville Bobber","version":"Chrome Edition","year":2023,"price":14900,"mileage":5100,"power":78,"cc":1200,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Jet Black Chrome","int":"Negro","upholstery":"Bobber","body":"Custom / Cruiser","condition":"ocasion","province":"Sevilla","category":"moto_classic","owners":1,"warranty":12,"doors":null,"seats":1,"dgt":"C","badge":"Chrome","featured":false,"editors":false,"exclusive":false,"title":"Triumph Bonneville Bobber Chrome Edition","description":"Bobber Chrome Edition con estetica impecable, revision Triumph y accesorios originales. Una moto minimalista, muy cuidada y lista para comprador que busca estilo sin complicaciones.","equipment":["Chrome Edition","ABS","Control traccion","Riding modes","Asiento flotante","LED","Historial Triumph"],"image":"/images/demo/vehicles/triumph-bonneville-bobber-chrome.webp"},
      {"dealer":"sevilla-custom-icons","slug":"royal-enfield-super-meteor-650-2024","type":"motorcycle","brand":"Royal Enfield","model":"Super Meteor","version":"650 Tourer","year":2024,"price":7900,"mileage":1800,"power":47,"cc":648,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Astral Black","int":"Negro","upholstery":"Touring","body":"Custom / Cruiser","condition":"seminuevo","province":"Sevilla","category":"moto_custom","owners":1,"warranty":24,"doors":null,"seats":2,"dgt":"C","badge":"Tourer","featured":false,"editors":false,"exclusive":false,"title":"Royal Enfield Super Meteor 650 Tourer","description":"Super Meteor 650 casi nueva, con respaldo, pantalla y garantia oficial. Una cruiser honesta y muy presentable, ideal para entrar en el universo custom premium con coste contenido.","equipment":["Respaldo pasajero","Pantalla touring","ABS","Tripper navigation","Garantia oficial","Revision inicial","Defensas motor"],"image":"/images/demo/vehicles/royal-enfield-super-meteor-650.webp"},
      {"dealer":"sevilla-custom-icons","slug":"husqvarna-svartpilen-801-2024","type":"motorcycle","brand":"Husqvarna","model":"Svartpilen","version":"801","year":2024,"price":10900,"mileage":900,"power":105,"cc":799,"fuel":"gasoline","transmission":"manual","drive":null,"ext":"Matte Black","int":"Negro","upholstery":"Urban","body":"Scrambler","condition":"seminuevo","province":"Sevilla","category":"moto_naked","owners":1,"warranty":24,"doors":null,"seats":2,"dgt":"C","badge":"801","featured":false,"editors":true,"exclusive":false,"title":"Husqvarna Svartpilen 801 lanzamiento","description":"Svartpilen 801 de primer propietario, practicamente nueva y con garantia vigente. Moto urbana de diseno limpio, ligera y con electronica moderna para uso diario con personalidad.","equipment":["Quickshifter Easy Shift","Riding modes","Control traccion","ABS cornering","Pantalla TFT","Iluminacion LED","Garantia oficial"],"image":"/images/demo/vehicles/husqvarna-svartpilen-801.webp"}
    ]
    $vehicles$::jsonb) AS v(
      dealer TEXT, slug TEXT, type TEXT, brand TEXT, model TEXT, version TEXT, year INT,
      price NUMERIC, mileage INT, power INT, cc INT, fuel TEXT, transmission TEXT, drive TEXT,
      ext TEXT, int TEXT, upholstery TEXT, body TEXT, condition TEXT, province TEXT, category TEXT,
      owners INT, warranty INT, doors INT, seats INT, dgt TEXT, badge TEXT, featured BOOLEAN,
      editors BOOLEAN, exclusive BOOLEAN, title TEXT, description TEXT, equipment TEXT[], image TEXT
    )
  )
  INSERT INTO vehicles (
    id, dealer_id, slug, vehicle_type, status, brand_id, model_id, brand_name, model_name,
    version, year, displacement_cc, power_hp, fuel_type, transmission, drive_type,
    color_exterior, color_interior, upholstery, body_type, mileage_km, registration_year,
    registration_country, has_carfax, has_service_history, condition_type, iva_deducible,
    location_province, category, num_owners, has_warranty, warranty_months, doors, seats,
    dgt_label, has_abs, has_traction_control, has_riding_modes, has_electronic_suspension,
    has_panniers, has_test_drive, price, price_on_request, is_negotiable,
    accepts_trade_in, financing_available, title, description, equipment, equipment_extra,
    images, is_featured, is_editors_pick, is_exclusive, badge, views, published_at, expires_at,
    updated_at
  )
  SELECT
    uuid_generate_v5(demo_ns, 'vehicle:' || v.slug),
    uuid_generate_v5(demo_ns, 'dealer:' || v.dealer),
    v.slug,
    v.type::vehicle_type,
    'active'::vehicle_status,
    b.id,
    m.id,
    v.brand,
    v.model,
    v.version,
    v.year,
    v.cc,
    v.power,
    v.fuel::fuel_type,
    v.transmission::transmission_type,
    CASE WHEN v.drive IS NULL THEN NULL ELSE v.drive::drive_type END,
    v.ext,
    v.int,
    v.upholstery,
    v.body,
    v.mileage,
    v.year,
    'ES',
    true,
    true,
    v.condition,
    v.type = 'car' AND v.year >= 2021,
    v.province,
    v.category,
    v.owners,
    true,
    v.warranty,
    v.doors,
    v.seats,
    v.dgt,
    true,
    v.type = 'motorcycle',
    v.type = 'motorcycle',
    v.type = 'motorcycle' AND v.category IN ('moto_adventure', 'moto_touring', 'moto_sport'),
    v.type = 'motorcycle' AND v.category IN ('moto_adventure', 'moto_touring'),
    v.type = 'motorcycle',
    v.price,
    false,
    false,
    true,
    true,
    v.title,
    v.description,
    v.equipment,
    'Ficha demo Black Label: unidad revisada editorialmente, fotografia generada para presentacion y datos preparados para demostracion comercial.',
    jsonb_build_array(jsonb_build_object('url', v.image, 'alt', v.title, 'order', 0)),
    v.featured,
    v.editors,
    v.exclusive,
    v.badge,
    650,
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '180 days',
    NOW()
  FROM vehicles v
  LEFT JOIN brands b ON b.name = v.brand
  LEFT JOIN models m ON m.brand_id = b.id AND m.name = v.model
  ON CONFLICT (slug) DO UPDATE SET
    dealer_id = EXCLUDED.dealer_id,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'active'::vehicle_status,
    brand_id = EXCLUDED.brand_id,
    model_id = EXCLUDED.model_id,
    brand_name = EXCLUDED.brand_name,
    model_name = EXCLUDED.model_name,
    version = EXCLUDED.version,
    year = EXCLUDED.year,
    displacement_cc = EXCLUDED.displacement_cc,
    power_hp = EXCLUDED.power_hp,
    fuel_type = EXCLUDED.fuel_type,
    transmission = EXCLUDED.transmission,
    drive_type = EXCLUDED.drive_type,
    color_exterior = EXCLUDED.color_exterior,
    color_interior = EXCLUDED.color_interior,
    upholstery = EXCLUDED.upholstery,
    body_type = EXCLUDED.body_type,
    mileage_km = EXCLUDED.mileage_km,
    registration_year = EXCLUDED.registration_year,
    has_carfax = EXCLUDED.has_carfax,
    has_service_history = EXCLUDED.has_service_history,
    condition_type = EXCLUDED.condition_type,
    iva_deducible = EXCLUDED.iva_deducible,
    location_province = EXCLUDED.location_province,
    category = EXCLUDED.category,
    num_owners = EXCLUDED.num_owners,
    has_warranty = EXCLUDED.has_warranty,
    warranty_months = EXCLUDED.warranty_months,
    doors = EXCLUDED.doors,
    seats = EXCLUDED.seats,
    dgt_label = EXCLUDED.dgt_label,
    has_abs = EXCLUDED.has_abs,
    has_traction_control = EXCLUDED.has_traction_control,
    has_riding_modes = EXCLUDED.has_riding_modes,
    has_electronic_suspension = EXCLUDED.has_electronic_suspension,
    has_panniers = EXCLUDED.has_panniers,
    has_test_drive = EXCLUDED.has_test_drive,
    price = EXCLUDED.price,
    price_on_request = false,
    is_negotiable = false,
    accepts_trade_in = true,
    financing_available = true,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    equipment = EXCLUDED.equipment,
    equipment_extra = EXCLUDED.equipment_extra,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_editors_pick = EXCLUDED.is_editors_pick,
    is_exclusive = EXCLUDED.is_exclusive,
    badge = EXCLUDED.badge,
    published_at = EXCLUDED.published_at,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();
END $$;
