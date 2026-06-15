-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 035: Catálogo curado de modelos premium (coches + motos)
--
-- Criterio de inclusión ("premium" NO es un umbral de precio ni de potencia):
--   • Marcas íntegramente premium (Ferrari, Lamborghini, Porsche…) → todos sus modelos.
--   • Marcas generalistas → SOLO los modelos que cualifican por prestaciones,
--     condición clásica/youngtimer, carácter enthusiast o unidad especial.
--   • Un modelo entra aunque NO todas sus eras/versiones sean premium (p. ej. Audi A3:
--     el modelo se incluye; el año/versión/estado de la UNIDAD se filtra en la
--     aprobación manual). El catálogo se cura a nivel de MODELO; la VERSIÓN/acabado
--     sigue siendo texto libre en la publicación.
--
-- El slug se calcula en SQL desde el nombre (sin acentos, kebab-case).
-- Idempotente: ON CONFLICT (brand_id, name) DO NOTHING — seguro de re-ejecutar.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO models (brand_id, name, slug, vehicle_type)
SELECT
  b.id,
  m.name,
  regexp_replace(
    regexp_replace(
      lower(translate(m.name,
        'áàâäãéèêëíìîïóòôöõúùûüñç',
        'aaaaaeeeeiiiiooooouuuunc')),
      '[^a-z0-9]+', '-', 'g'),
    '(^-+|-+$)', '', 'g') AS slug,
  m.vtype::vehicle_type
FROM brands b
JOIN (VALUES
  -- ═══════════════════════════ COCHES ═══════════════════════════

  -- Ferrari (marca 100% premium)
  ('ferrari','296 GTB','car'),('ferrari','296 GTS','car'),('ferrari','SF90 Stradale','car'),
  ('ferrari','SF90 Spider','car'),('ferrari','F8 Tributo','car'),('ferrari','F8 Spider','car'),
  ('ferrari','488 GTB','car'),('ferrari','488 Pista','car'),('ferrari','488 Spider','car'),
  ('ferrari','458 Italia','car'),('ferrari','458 Speciale','car'),('ferrari','458 Spider','car'),
  ('ferrari','812 Superfast','car'),('ferrari','812 GTS','car'),('ferrari','812 Competizione','car'),
  ('ferrari','Roma','car'),('ferrari','Portofino','car'),('ferrari','Portofino M','car'),
  ('ferrari','California T','car'),('ferrari','F12berlinetta','car'),('ferrari','GTC4Lusso','car'),
  ('ferrari','FF','car'),('ferrari','599 GTB Fiorano','car'),('ferrari','612 Scaglietti','car'),
  ('ferrari','575M Maranello','car'),('ferrari','550 Maranello','car'),('ferrari','F430','car'),
  ('ferrari','430 Scuderia','car'),('ferrari','360 Modena','car'),('ferrari','F355','car'),
  ('ferrari','348','car'),('ferrari','Testarossa','car'),('ferrari','512 TR','car'),
  ('ferrari','308 GTB','car'),('ferrari','328 GTB','car'),('ferrari','Mondial','car'),
  ('ferrari','Dino 246 GT','car'),('ferrari','250 GT','car'),('ferrari','275 GTB','car'),
  ('ferrari','365 Daytona','car'),('ferrari','F40','car'),('ferrari','F50','car'),
  ('ferrari','Enzo','car'),('ferrari','LaFerrari','car'),('ferrari','288 GTO','car'),
  ('ferrari','Purosangue','car'),('ferrari','12Cilindri','car'),

  -- Lamborghini (100% premium)
  ('lamborghini','Revuelto','car'),('lamborghini','Huracán','car'),('lamborghini','Aventador','car'),
  ('lamborghini','Urus','car'),('lamborghini','Gallardo','car'),('lamborghini','Murciélago','car'),
  ('lamborghini','Diablo','car'),('lamborghini','Countach','car'),('lamborghini','Miura','car'),
  ('lamborghini','Espada','car'),('lamborghini','Jarama','car'),('lamborghini','Jalpa','car'),
  ('lamborghini','Urraco','car'),('lamborghini','LM002','car'),('lamborghini','Reventón','car'),
  ('lamborghini','Sián','car'),('lamborghini','Centenario','car'),('lamborghini','Veneno','car'),

  -- McLaren (100% premium)
  ('mclaren','720S','car'),('mclaren','750S','car'),('mclaren','765LT','car'),('mclaren','600LT','car'),
  ('mclaren','570S','car'),('mclaren','570GT','car'),('mclaren','540C','car'),('mclaren','Artura','car'),
  ('mclaren','GT','car'),('mclaren','MP4-12C','car'),('mclaren','650S','car'),('mclaren','675LT','car'),
  ('mclaren','P1','car'),('mclaren','Senna','car'),('mclaren','Speedtail','car'),('mclaren','Elva','car'),
  ('mclaren','F1','car'),('mclaren','620R','car'),

  -- Bugatti (100% premium)
  ('bugatti','Chiron','car'),('bugatti','Veyron','car'),('bugatti','Divo','car'),
  ('bugatti','Centodieci','car'),('bugatti','Bolide','car'),('bugatti','Mistral','car'),
  ('bugatti','EB110','car'),('bugatti','Tourbillon','car'),

  -- Koenigsegg (100% premium)
  ('koenigsegg','Jesko','car'),('koenigsegg','Regera','car'),('koenigsegg','Agera','car'),
  ('koenigsegg','Gemera','car'),('koenigsegg','CCX','car'),('koenigsegg','CC8S','car'),
  ('koenigsegg','One:1','car'),('koenigsegg','CCR','car'),

  -- Pagani (100% premium)
  ('pagani','Huayra','car'),('pagani','Zonda','car'),('pagani','Utopia','car'),

  -- Rimac (100% premium)
  ('rimac','Nevera','car'),('rimac','Concept One','car'),

  -- Aston Martin (100% premium)
  ('aston-martin','DB11','car'),('aston-martin','DB12','car'),('aston-martin','DB9','car'),
  ('aston-martin','DBS','car'),('aston-martin','DBS Superleggera','car'),('aston-martin','Vantage','car'),
  ('aston-martin','V8 Vantage','car'),('aston-martin','V12 Vantage','car'),('aston-martin','DBX','car'),
  ('aston-martin','Vanquish','car'),('aston-martin','Rapide','car'),('aston-martin','Virage','car'),
  ('aston-martin','DB7','car'),('aston-martin','DB5','car'),('aston-martin','DB4','car'),
  ('aston-martin','Valkyrie','car'),('aston-martin','Valhalla','car'),('aston-martin','One-77','car'),
  ('aston-martin','Lagonda','car'),

  -- Bentley (100% premium)
  ('bentley','Continental GT','car'),('bentley','Continental GTC','car'),('bentley','Flying Spur','car'),
  ('bentley','Bentayga','car'),('bentley','Mulsanne','car'),('bentley','Arnage','car'),
  ('bentley','Azure','car'),('bentley','Brooklands','car'),('bentley','Bacalar','car'),
  ('bentley','Batur','car'),

  -- Rolls-Royce (100% premium)
  ('rolls-royce','Phantom','car'),('rolls-royce','Ghost','car'),('rolls-royce','Wraith','car'),
  ('rolls-royce','Dawn','car'),('rolls-royce','Cullinan','car'),('rolls-royce','Spectre','car'),
  ('rolls-royce','Silver Shadow','car'),('rolls-royce','Silver Spirit','car'),('rolls-royce','Corniche','car'),
  ('rolls-royce','Silver Seraph','car'),('rolls-royce','Camargue','car'),

  -- Maserati (100% premium)
  ('maserati','MC20','car'),('maserati','GranTurismo','car'),('maserati','GranCabrio','car'),
  ('maserati','Ghibli','car'),('maserati','Quattroporte','car'),('maserati','Levante','car'),
  ('maserati','Grecale','car'),('maserati','GranSport','car'),('maserati','Coupé','car'),
  ('maserati','Spyder','car'),('maserati','3200 GT','car'),('maserati','Bora','car'),
  ('maserati','Merak','car'),('maserati','Khamsin','car'),('maserati','Biturbo','car'),
  ('maserati','Shamal','car'),

  -- Porsche (100% premium)
  ('porsche','911','car'),('porsche','718 Cayman','car'),('porsche','718 Boxster','car'),
  ('porsche','Cayman','car'),('porsche','Boxster','car'),('porsche','Cayenne','car'),
  ('porsche','Macan','car'),('porsche','Panamera','car'),('porsche','Taycan','car'),
  ('porsche','944','car'),('porsche','928','car'),('porsche','968','car'),('porsche','924','car'),
  ('porsche','914','car'),('porsche','356','car'),('porsche','959','car'),
  ('porsche','Carrera GT','car'),('porsche','918 Spyder','car'),

  -- BMW (mixto: gama premium + M + clásicos)
  ('bmw','Serie 1','car'),('bmw','Serie 2','car'),('bmw','Serie 3','car'),('bmw','Serie 4','car'),
  ('bmw','Serie 5','car'),('bmw','Serie 6','car'),('bmw','Serie 7','car'),('bmw','Serie 8','car'),
  ('bmw','X3','car'),('bmw','X4','car'),('bmw','X5','car'),('bmw','X6','car'),('bmw','X7','car'),
  ('bmw','Z3','car'),('bmw','Z4','car'),('bmw','Z8','car'),('bmw','i4','car'),('bmw','i7','car'),
  ('bmw','i8','car'),('bmw','iX','car'),('bmw','M2','car'),('bmw','M3','car'),('bmw','M4','car'),
  ('bmw','M5','car'),('bmw','M6','car'),('bmw','M8','car'),('bmw','X5 M','car'),('bmw','X6 M','car'),
  ('bmw','XM','car'),('bmw','1M','car'),('bmw','M1','car'),('bmw','2002 turbo','car'),
  ('bmw','3.0 CSL','car'),('bmw','507','car'),('bmw','Z1','car'),('bmw','850i','car'),

  -- Mercedes-Benz (mixto)
  ('mercedes-benz','Clase A','car'),('mercedes-benz','Clase C','car'),('mercedes-benz','Clase E','car'),
  ('mercedes-benz','Clase S','car'),('mercedes-benz','CLA','car'),('mercedes-benz','CLS','car'),
  ('mercedes-benz','CLK','car'),('mercedes-benz','Clase G','car'),('mercedes-benz','GLA','car'),
  ('mercedes-benz','GLC','car'),('mercedes-benz','GLE','car'),('mercedes-benz','GLS','car'),
  ('mercedes-benz','SL','car'),('mercedes-benz','SLK','car'),('mercedes-benz','SLC','car'),
  ('mercedes-benz','SLR McLaren','car'),('mercedes-benz','SLS AMG','car'),('mercedes-benz','AMG GT','car'),
  ('mercedes-benz','AMG GT 4 Puertas','car'),('mercedes-benz','AMG One','car'),('mercedes-benz','C63 AMG','car'),
  ('mercedes-benz','E63 AMG','car'),('mercedes-benz','A45 AMG','car'),('mercedes-benz','G63 AMG','car'),
  ('mercedes-benz','190 E 2.3-16','car'),('mercedes-benz','300 SL','car'),('mercedes-benz','280 SL Pagoda','car'),
  ('mercedes-benz','500 E','car'),('mercedes-benz','EQS','car'),

  -- Maybach (100% premium)
  ('maybach','57','car'),('maybach','62','car'),('maybach','Clase S','car'),('maybach','GLS','car'),

  -- Audi (mixto)
  ('audi','A1','car'),('audi','A3','car'),('audi','A4','car'),('audi','A5','car'),('audi','A6','car'),
  ('audi','A7','car'),('audi','A8','car'),('audi','Q2','car'),('audi','Q3','car'),('audi','Q5','car'),
  ('audi','Q7','car'),('audi','Q8','car'),('audi','TT','car'),('audi','R8','car'),('audi','e-tron GT','car'),
  ('audi','S3','car'),('audi','S4','car'),('audi','S5','car'),('audi','RS3','car'),('audi','RS4','car'),
  ('audi','RS5','car'),('audi','RS6','car'),('audi','RS7','car'),('audi','RSQ8','car'),('audi','TT RS','car'),
  ('audi','Quattro','car'),('audi','Sport Quattro','car'),('audi','80','car'),('audi','Coupé quattro','car'),

  -- Alfa Romeo (premium / enthusiast)
  ('alfa-romeo','Giulia','car'),('alfa-romeo','Giulia GTA','car'),('alfa-romeo','Stelvio','car'),
  ('alfa-romeo','Tonale','car'),('alfa-romeo','4C','car'),('alfa-romeo','8C Competizione','car'),
  ('alfa-romeo','Giulietta','car'),('alfa-romeo','159','car'),('alfa-romeo','156','car'),
  ('alfa-romeo','147','car'),('alfa-romeo','Brera','car'),('alfa-romeo','Spider','car'),
  ('alfa-romeo','GTV','car'),('alfa-romeo','GT','car'),('alfa-romeo','75','car'),('alfa-romeo','155','car'),
  ('alfa-romeo','Montreal','car'),('alfa-romeo','SZ','car'),('alfa-romeo','Junior','car'),

  -- Lexus (premium)
  ('lexus','LC','car'),('lexus','LFA','car'),('lexus','RC','car'),('lexus','RC F','car'),
  ('lexus','IS','car'),('lexus','IS F','car'),('lexus','GS F','car'),('lexus','LS','car'),
  ('lexus','ES','car'),('lexus','NX','car'),('lexus','RX','car'),('lexus','UX','car'),
  ('lexus','RZ','car'),('lexus','LX','car'),('lexus','SC 430','car'),

  -- Nissan (selectivo)
  ('nissan','GT-R','car'),('nissan','Skyline GT-R','car'),('nissan','Z','car'),('nissan','370Z','car'),
  ('nissan','350Z','car'),('nissan','300ZX','car'),('nissan','280ZX','car'),('nissan','240Z','car'),
  ('nissan','Silvia','car'),('nissan','200SX','car'),('nissan','Pulsar GTI-R','car'),

  -- Corvette (deportivo, 100% premium)
  ('corvette','C1','car'),('corvette','C2','car'),('corvette','C3','car'),('corvette','C4','car'),
  ('corvette','C5','car'),('corvette','C6','car'),('corvette','C7','car'),('corvette','C8','car'),
  ('corvette','Stingray','car'),('corvette','Z06','car'),('corvette','ZR1','car'),('corvette','Grand Sport','car'),

  -- Dodge (selectivo)
  ('dodge','Viper','car'),('dodge','Challenger','car'),('dodge','Charger','car'),
  ('dodge','Challenger SRT Hellcat','car'),('dodge','Charger SRT Hellcat','car'),('dodge','Demon','car'),

  -- Ford (selectivo premium)
  ('ford','Mustang','car'),('ford','Mustang Shelby GT500','car'),('ford','Mustang Mach 1','car'),
  ('ford','GT','car'),('ford','GT40','car'),('ford','Focus RS','car'),('ford','Focus ST','car'),
  ('ford','Fiesta ST','car'),('ford','Puma ST','car'),('ford','Sierra RS Cosworth','car'),
  ('ford','Escort RS Cosworth','car'),('ford','Escort RS Turbo','car'),('ford','RS200','car'),
  ('ford','Capri','car'),

  -- Abarth (performance, 100% premium)
  ('abarth','595','car'),('abarth','695','car'),('abarth','124 Spider','car'),('abarth','500e','car'),
  ('abarth','750','car'),('abarth','1000','car'),('abarth','131 Rally','car'),

  -- Alpine (100% premium)
  ('alpine','A110','car'),('alpine','A310','car'),('alpine','A610','car'),('alpine','GTA','car'),
  ('alpine','A290','car'),

  -- Ariel (100% premium)
  ('ariel','Atom','car'),('ariel','Nomad','car'),

  -- Brabus (preparador premium)
  ('brabus','800','car'),('brabus','900','car'),('brabus','Rocket','car'),('brabus','G V12','car'),

  -- Caterham (100% premium)
  ('caterham','Seven','car'),('caterham','Super Seven','car'),('caterham','21','car'),

  -- Cupra (performance)
  ('cupra','León','car'),('cupra','Formentor','car'),('cupra','Ateca','car'),('cupra','Born','car'),
  ('cupra','Tavascan','car'),('cupra','Terramar','car'),

  -- Fiat (selectivo)
  ('fiat','124 Spider','car'),('fiat','Barchetta','car'),('fiat','Coupé','car'),('fiat','8V','car'),
  ('fiat','Dino','car'),('fiat','X1/9','car'),('fiat','130 Coupé','car'),

  -- Genesis (premium)
  ('genesis','G70','car'),('genesis','G80','car'),('genesis','G90','car'),('genesis','GV60','car'),
  ('genesis','GV70','car'),('genesis','GV80','car'),

  -- Honda (coches selectivos)
  ('honda','NSX','car'),('honda','Civic Type R','car'),('honda','Integra Type R','car'),
  ('honda','S2000','car'),('honda','S660','car'),('honda','CRX','car'),('honda','Prelude','car'),
  ('honda','Beat','car'),('honda','Honda e','car'),

  -- Hyundai (selectivo - gama N)
  ('hyundai','i30 N','car'),('hyundai','i20 N','car'),('hyundai','Ioniq 5 N','car'),
  ('hyundai','Veloster N','car'),('hyundai','Kona N','car'),

  -- Jaguar (premium)
  ('jaguar','F-Type','car'),('jaguar','F-Pace','car'),('jaguar','I-Pace','car'),('jaguar','XE','car'),
  ('jaguar','XF','car'),('jaguar','XJ','car'),('jaguar','XK','car'),('jaguar','XKR','car'),
  ('jaguar','E-Type','car'),('jaguar','XJS','car'),('jaguar','XK120','car'),('jaguar','Mk2','car'),
  ('jaguar','XJ220','car'),('jaguar','XJR','car'),

  -- Kia (selectivo)
  ('kia','Stinger','car'),('kia','EV6 GT','car'),('kia','Ceed GT','car'),('kia','ProCeed','car'),

  -- Lancia (clásico / enthusiast)
  ('lancia','Delta HF Integrale','car'),('lancia','Delta','car'),('lancia','Stratos','car'),
  ('lancia','037','car'),('lancia','Fulvia','car'),('lancia','Beta Montecarlo','car'),
  ('lancia','Thema 8.32','car'),('lancia','Aurelia','car'),('lancia','Flaminia','car'),
  ('lancia','Delta S4','car'),

  -- Land Rover (premium)
  ('land-rover','Range Rover','car'),('land-rover','Range Rover Sport','car'),('land-rover','Range Rover Velar','car'),
  ('land-rover','Range Rover Evoque','car'),('land-rover','Defender','car'),('land-rover','Discovery','car'),
  ('land-rover','Series','car'),

  -- Lotus (100% premium)
  ('lotus','Emira','car'),('lotus','Evora','car'),('lotus','Elise','car'),('lotus','Exige','car'),
  ('lotus','Esprit','car'),('lotus','Elan','car'),('lotus','Europa','car'),('lotus','Eletre','car'),
  ('lotus','Emeya','car'),('lotus','Elite','car'),

  -- Mazda (selectivo)
  ('mazda','MX-5','car'),('mazda','RX-7','car'),('mazda','RX-8','car'),('mazda','Cosmo','car'),
  ('mazda','RX-3','car'),('mazda','Mazda3 MPS','car'),('mazda','323 GT-R','car'),

  -- Mini (selectivo)
  ('mini','John Cooper Works','car'),('mini','Cooper S','car'),('mini','Mini Clásico','car'),
  ('mini','GP','car'),('mini','Cooper SE','car'),

  -- Mitsubishi (selectivo)
  ('mitsubishi','Lancer Evolution','car'),('mitsubishi','3000GT','car'),('mitsubishi','GTO','car'),
  ('mitsubishi','Eclipse','car'),('mitsubishi','Galant VR-4','car'),('mitsubishi','Starion','car'),
  ('mitsubishi','FTO','car'),

  -- Morgan (100% premium)
  ('morgan','Plus Four','car'),('morgan','Plus Six','car'),('morgan','Plus 8','car'),('morgan','4/4','car'),
  ('morgan','Aero 8','car'),('morgan','Roadster','car'),('morgan','Super 3','car'),

  -- Opel (selectivo)
  ('opel','Manta','car'),('opel','Kadett GSi','car'),('opel','Calibra','car'),('opel','Speedster','car'),
  ('opel','Corsa OPC','car'),('opel','Astra OPC','car'),('opel','GT','car'),('opel','Monza','car'),
  ('opel','Ascona','car'),

  -- Peugeot (selectivo)
  ('peugeot','205 GTI','car'),('peugeot','208 GTI','car'),('peugeot','306 GTI','car'),
  ('peugeot','309 GTI','car'),('peugeot','RCZ','car'),('peugeot','405 Mi16','car'),
  ('peugeot','504 Coupé','car'),('peugeot','205 T16','car'),('peugeot','508 PSE','car'),

  -- Polestar (premium EV)
  ('polestar','1','car'),('polestar','2','car'),('polestar','3','car'),('polestar','4','car'),

  -- Renault (selectivo)
  ('renault','Mégane RS','car'),('renault','Clio RS','car'),('renault','Clio Williams','car'),
  ('renault','5 Turbo','car'),('renault','5 GT Turbo','car'),('renault','Sport Spider','car'),
  ('renault','R8 Gordini','car'),('renault','Twingo RS','car'),

  -- Seat (selectivo)
  ('seat','León Cupra','car'),('seat','Ibiza Cupra','car'),('seat','León FR','car'),('seat','600','car'),
  ('seat','124 Sport','car'),('seat','1430','car'),('seat','Bocanegra','car'),

  -- Subaru (selectivo)
  ('subaru','Impreza WRX STI','car'),('subaru','Impreza WRX','car'),('subaru','BRZ','car'),
  ('subaru','SVX','car'),('subaru','Legacy GT','car'),('subaru','WRX','car'),('subaru','22B','car'),

  -- Tesla (premium EV)
  ('tesla','Model S','car'),('tesla','Model 3','car'),('tesla','Model X','car'),('tesla','Model Y','car'),
  ('tesla','Roadster','car'),('tesla','Cybertruck','car'),

  -- Toyota (selectivo)
  ('toyota','GR Supra','car'),('toyota','Supra','car'),('toyota','GR Yaris','car'),('toyota','GR Corolla','car'),
  ('toyota','GR86','car'),('toyota','GT86','car'),('toyota','MR2','car'),('toyota','Celica GT-Four','car'),
  ('toyota','Celica','car'),('toyota','Land Cruiser','car'),('toyota','2000GT','car'),('toyota','AE86','car'),

  -- Volkswagen (selectivo)
  ('volkswagen','Golf GTI','car'),('volkswagen','Golf R','car'),('volkswagen','Golf','car'),
  ('volkswagen','Scirocco','car'),('volkswagen','Corrado','car'),('volkswagen','Polo GTI','car'),
  ('volkswagen','Beetle','car'),('volkswagen','Karmann Ghia','car'),('volkswagen','T1','car'),
  ('volkswagen','T2','car'),('volkswagen','Lupo GTI','car'),

  -- Volvo (selectivo)
  ('volvo','P1800','car'),('volvo','850 R','car'),('volvo','V70 R','car'),('volvo','S60 R','car'),
  ('volvo','C30','car'),('volvo','240 Turbo','car'),('volvo','Amazon','car'),('volvo','PV544','car'),
  ('volvo','C70','car'),

  -- Cadillac (selectivo premium)
  ('cadillac','CTS-V','car'),('cadillac','Escalade','car'),('cadillac','Eldorado','car'),
  ('cadillac','DeVille','car'),('cadillac','Series 62','car'),('cadillac','ATS-V','car'),
  ('cadillac','CT5-V','car'),('cadillac','Fleetwood','car'),

  -- DS (premium)
  ('ds','DS 3','car'),('ds','DS 4','car'),('ds','DS 7','car'),('ds','DS 9','car'),

  -- ═══════════════════════════ MOTOS ═══════════════════════════

  -- Ducati (100% premium)
  ('ducati','Panigale V4','motorcycle'),('ducati','Panigale V2','motorcycle'),('ducati','Panigale 1299','motorcycle'),
  ('ducati','1098','motorcycle'),('ducati','1198','motorcycle'),('ducati','999','motorcycle'),
  ('ducati','996','motorcycle'),('ducati','916','motorcycle'),('ducati','748','motorcycle'),
  ('ducati','Streetfighter V4','motorcycle'),('ducati','Streetfighter V2','motorcycle'),('ducati','Monster','motorcycle'),
  ('ducati','Diavel','motorcycle'),('ducati','XDiavel','motorcycle'),('ducati','Multistrada V4','motorcycle'),
  ('ducati','Multistrada 1260','motorcycle'),('ducati','Hypermotard','motorcycle'),('ducati','Supersport','motorcycle'),
  ('ducati','Scrambler','motorcycle'),('ducati','Desmosedici RR','motorcycle'),('ducati','851','motorcycle'),
  ('ducati','888','motorcycle'),('ducati','SportClassic','motorcycle'),('ducati','900 SS','motorcycle'),

  -- MV Agusta (100% premium)
  ('mv-agusta','F4','motorcycle'),('mv-agusta','F3','motorcycle'),('mv-agusta','Brutale 1000','motorcycle'),
  ('mv-agusta','Brutale 800','motorcycle'),('mv-agusta','Dragster','motorcycle'),('mv-agusta','Superveloce','motorcycle'),
  ('mv-agusta','Turismo Veloce','motorcycle'),('mv-agusta','Rush','motorcycle'),

  -- Aprilia (sport premium)
  ('aprilia','RSV4','motorcycle'),('aprilia','RS 660','motorcycle'),('aprilia','Tuono V4','motorcycle'),
  ('aprilia','Tuono 660','motorcycle'),('aprilia','RS 250','motorcycle'),('aprilia','RS 125','motorcycle'),
  ('aprilia','Dorsoduro','motorcycle'),('aprilia','RSV Mille','motorcycle'),('aprilia','Tuareg 660','motorcycle'),

  -- Bimota (100% premium)
  ('bimota','Tesi','motorcycle'),('bimota','KB4','motorcycle'),('bimota','DB7','motorcycle'),
  ('bimota','SB8R','motorcycle'),('bimota','YB','motorcycle'),('bimota','Tesi 3D','motorcycle'),

  -- BMW Motorrad (gama premium)
  ('bmw-motorrad','S 1000 RR','motorcycle'),('bmw-motorrad','S 1000 R','motorcycle'),('bmw-motorrad','M 1000 RR','motorcycle'),
  ('bmw-motorrad','R 1250 GS','motorcycle'),('bmw-motorrad','R 1300 GS','motorcycle'),('bmw-motorrad','R nineT','motorcycle'),
  ('bmw-motorrad','R 18','motorcycle'),('bmw-motorrad','K 1600','motorcycle'),('bmw-motorrad','S 1000 XR','motorcycle'),
  ('bmw-motorrad','HP4','motorcycle'),('bmw-motorrad','R 90 S','motorcycle'),('bmw-motorrad','R 100 RS','motorcycle'),

  -- Harley-Davidson (100% premium)
  ('harley-davidson','Sportster','motorcycle'),('harley-davidson','Sportster S','motorcycle'),('harley-davidson','Iron 883','motorcycle'),
  ('harley-davidson','Forty-Eight','motorcycle'),('harley-davidson','Fat Boy','motorcycle'),('harley-davidson','Softail','motorcycle'),
  ('harley-davidson','Street Glide','motorcycle'),('harley-davidson','Road Glide','motorcycle'),('harley-davidson','Road King','motorcycle'),
  ('harley-davidson','Heritage Classic','motorcycle'),('harley-davidson','Breakout','motorcycle'),('harley-davidson','Fat Bob','motorcycle'),
  ('harley-davidson','Low Rider','motorcycle'),('harley-davidson','Pan America','motorcycle'),('harley-davidson','Nightster','motorcycle'),
  ('harley-davidson','V-Rod','motorcycle'),

  -- Indian (100% premium)
  ('indian','Scout','motorcycle'),('indian','Chief','motorcycle'),('indian','Chieftain','motorcycle'),
  ('indian','Roadmaster','motorcycle'),('indian','Springfield','motorcycle'),('indian','FTR','motorcycle'),
  ('indian','Challenger','motorcycle'),('indian','Pursuit','motorcycle'),

  -- KTM (gama sport)
  ('ktm','1290 Super Duke R','motorcycle'),('ktm','890 Duke','motorcycle'),('ktm','790 Duke','motorcycle'),
  ('ktm','690 Duke','motorcycle'),('ktm','390 Duke','motorcycle'),('ktm','RC 390','motorcycle'),
  ('ktm','RC8','motorcycle'),('ktm','1290 Super Adventure','motorcycle'),('ktm','890 Adventure','motorcycle'),

  -- Triumph (gama premium)
  ('triumph','Speed Triple','motorcycle'),('triumph','Street Triple','motorcycle'),('triumph','Daytona 675','motorcycle'),
  ('triumph','Daytona 765','motorcycle'),('triumph','Bonneville','motorcycle'),('triumph','Thruxton','motorcycle'),
  ('triumph','Scrambler','motorcycle'),('triumph','Rocket 3','motorcycle'),('triumph','Tiger','motorcycle'),
  ('triumph','Speed Twin','motorcycle'),('triumph','Trident','motorcycle'),

  -- Benelli (selectivo)
  ('benelli','Tornado','motorcycle'),('benelli','TNT','motorcycle'),('benelli','752S','motorcycle'),
  ('benelli','Leoncino','motorcycle'),('benelli','TRK 502','motorcycle'),('benelli','Imperiale','motorcycle'),

  -- Cagiva (clásico)
  ('cagiva','Mito','motorcycle'),('cagiva','Raptor','motorcycle'),('cagiva','Elefant','motorcycle'),
  ('cagiva','Planet','motorcycle'),

  -- Can-Am
  ('can-am','Spyder','motorcycle'),('can-am','Ryker','motorcycle'),

  -- Energica (100% premium eléctrica)
  ('energica','Ego','motorcycle'),('energica','Eva','motorcycle'),('energica','Experia','motorcycle'),
  ('energica','EsseEsse9','motorcycle'),

  -- Honda (motos selectivas)
  ('honda','CBR1000RR-R Fireblade','motorcycle'),('honda','CBR1000RR','motorcycle'),('honda','CBR600RR','motorcycle'),
  ('honda','CBR900RR Fireblade','motorcycle'),('honda','CB1000R','motorcycle'),('honda','CB650R','motorcycle'),
  ('honda','Africa Twin','motorcycle'),('honda','Gold Wing','motorcycle'),('honda','Rebel','motorcycle'),
  ('honda','Hornet','motorcycle'),('honda','CB750','motorcycle'),('honda','VFR750R RC30','motorcycle'),
  ('honda','RC45','motorcycle'),('honda','Monkey','motorcycle'),('honda','X-ADV','motorcycle'),

  -- Husqvarna (selectivo)
  ('husqvarna','Svartpilen','motorcycle'),('husqvarna','Vitpilen','motorcycle'),('husqvarna','701 Supermoto','motorcycle'),
  ('husqvarna','701 Enduro','motorcycle'),('husqvarna','Norden 901','motorcycle'),

  -- Kawasaki (selectivo)
  ('kawasaki','Ninja ZX-10R','motorcycle'),('kawasaki','Ninja ZX-6R','motorcycle'),('kawasaki','Ninja H2','motorcycle'),
  ('kawasaki','Ninja H2R','motorcycle'),('kawasaki','Ninja ZX-14R','motorcycle'),('kawasaki','Z900','motorcycle'),
  ('kawasaki','Z H2','motorcycle'),('kawasaki','Z900RS','motorcycle'),('kawasaki','W800','motorcycle'),
  ('kawasaki','ZZR1400','motorcycle'),('kawasaki','GPZ900R','motorcycle'),('kawasaki','Z1','motorcycle'),

  -- LiveWire (premium eléctrica)
  ('livewire','One','motorcycle'),('livewire','S2 Del Mar','motorcycle'),('livewire','S2 Mulholland','motorcycle'),

  -- Moto Guzzi (premium / clásico)
  ('moto-guzzi','V7','motorcycle'),('moto-guzzi','V9','motorcycle'),('moto-guzzi','V85 TT','motorcycle'),
  ('moto-guzzi','V100 Mandello','motorcycle'),('moto-guzzi','California','motorcycle'),('moto-guzzi','Le Mans','motorcycle'),
  ('moto-guzzi','Griso','motorcycle'),('moto-guzzi','Stelvio','motorcycle'),('moto-guzzi','V11','motorcycle'),

  -- Piaggio (scooter premium / selectivo)
  ('piaggio','MP3','motorcycle'),('piaggio','Beverly','motorcycle'),('piaggio','X10','motorcycle'),

  -- Royal Enfield (clásico / premium)
  ('royal-enfield','Continental GT 650','motorcycle'),('royal-enfield','Interceptor 650','motorcycle'),
  ('royal-enfield','Himalayan','motorcycle'),('royal-enfield','Bullet','motorcycle'),('royal-enfield','Classic 350','motorcycle'),
  ('royal-enfield','Super Meteor 650','motorcycle'),('royal-enfield','Shotgun 650','motorcycle'),

  -- Suzuki (selectivo)
  ('suzuki','GSX-R1000','motorcycle'),('suzuki','GSX-R750','motorcycle'),('suzuki','GSX-R600','motorcycle'),
  ('suzuki','Hayabusa','motorcycle'),('suzuki','Katana','motorcycle'),('suzuki','GSX-S1000','motorcycle'),
  ('suzuki','GSX-R1100','motorcycle'),('suzuki','RGV250','motorcycle'),('suzuki','TL1000R','motorcycle'),
  ('suzuki','V-Strom 1050','motorcycle'),

  -- Vespa (scooter clásico / premium)
  ('vespa','GTS','motorcycle'),('vespa','GTV','motorcycle'),('vespa','Primavera','motorcycle'),
  ('vespa','Sprint','motorcycle'),('vespa','PX','motorcycle'),('vespa','946','motorcycle'),
  ('vespa','Sei Giorni','motorcycle'),('vespa','Rally','motorcycle'),('vespa','50 Special','motorcycle'),
  ('vespa','Super','motorcycle'),

  -- Yamaha (selectivo)
  ('yamaha','YZF-R1','motorcycle'),('yamaha','YZF-R6','motorcycle'),('yamaha','YZF-R7','motorcycle'),
  ('yamaha','MT-09','motorcycle'),('yamaha','MT-07','motorcycle'),('yamaha','MT-10','motorcycle'),
  ('yamaha','XSR900','motorcycle'),('yamaha','XSR700','motorcycle'),('yamaha','Ténéré 700','motorcycle'),
  ('yamaha','V-Max','motorcycle'),('yamaha','RD350','motorcycle'),('yamaha','RD500','motorcycle'),
  ('yamaha','FZR1000','motorcycle'),('yamaha','R1M','motorcycle'),('yamaha','Niken','motorcycle'),

  -- Zero Motorcycles (premium eléctrica)
  ('zero-motorcycles','SR/F','motorcycle'),('zero-motorcycles','SR/S','motorcycle'),('zero-motorcycles','DSR/X','motorcycle'),
  ('zero-motorcycles','FX','motorcycle'),('zero-motorcycles','S','motorcycle')

) AS m(brand_slug, name, vtype)
  ON b.slug = m.brand_slug
ON CONFLICT (brand_id, name) DO NOTHING;
