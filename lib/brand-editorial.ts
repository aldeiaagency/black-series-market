// Texto editorial por marca para las páginas /marcas/[brand].
// Importante para SEO: contenido único por marca (esencia, modelos icónicos y el
// valor diferencial de Black Label Market). Clave = slug de la marca.

export const BRAND_EDITORIAL: Record<string, string> = {
  // ─────────────────────────── COCHES ───────────────────────────
  ferrari:
    'Ferrari representa el punto más alto de la ingeniería deportiva italiana. Cada Ferrari en el mercado de segunda mano es una pieza de historia del motor: rendimiento sin concesiones, líneas que no pasan de moda y un valor que el tiempo tiende a respetar. Los Ferrari publicados en Black Label Market provienen de especialistas que conocen cada modelo a fondo, con historial verificado y documentación en orden.',
  porsche:
    'Pocos fabricantes logran combinar usabilidad diaria con prestaciones puras como Porsche. El 911, el Cayman, el Taycan o el Panamera son referencias absolutas en sus segmentos. Los Porsche publicados aquí provienen de profesionales especializados: kilometraje verificado, mantenimientos al día y configuraciones originales documentadas.',
  lamborghini:
    'Lamborghini es emoción en estado puro: diseño extremo, sonido inconfundible y una exclusividad que se cotiza. Un Lamborghini bien documentado y con historial trazable es uno de los activos más demandados del mercado premium. Los vendedores especializados en Black Label Market aportan la confianza necesaria para este tipo de operación.',
  mclaren:
    'McLaren lleva la tecnología de la Fórmula 1 a la carretera. Sus modelos —720S, Artura, Senna, P1— son máquinas de referencia absoluta en el segmento superdeportivo. Encontrar un McLaren con historial documentado y en manos de un especialista de confianza es exactamente lo que hace Black Label Market.',
  bugatti:
    'Bugatti produce los hipercars más exclusivos del mundo. Cada Veyron, Chiron o Divo es una obra de ingeniería sin parangón: más de 1.000 CV, producción medida en decenas de unidades y un proceso de fabricación artesanal en Molsheim. Una operación Bugatti exige el máximo rigor en documentación, trazabilidad y especialización: exactamente lo que ofrecen los vendedores de Black Label Market.',
  koenigsegg:
    'Koenigsegg lleva la ingeniería sueca al extremo: hipercars como el Jesko, el Regera o el Agera RS han batido récords mundiales de velocidad con soluciones técnicas que no existen en ningún otro fabricante. Producción de apenas unas unidades al año y una exclusividad absoluta. Una operación Koenigsegg exige trazabilidad total y la máxima especialización, exactamente lo que ofrecen los vendedores de Black Label Market.',
  pagani:
    'Pagani fabrica auténticas obras de arte rodantes. El Zonda, el Huayra y el Utopia combinan fibra de carbono, motores AMG y una artesanía italiana medida al milímetro, en tiradas de muy pocas unidades. Cada Pagani es una pieza de coleccionista cuya documentación e historial determinan su valor. En Black Label Market encontrarás especialistas capaces de manejar este nivel de exclusividad con el rigor que merece.',
  rimac:
    'Rimac ha redefinido el hipercar eléctrico. El Nevera, con más de 1.900 CV y récords de aceleración, sitúa a la marca croata en la cúspide tecnológica del sector. Producción mínima y tecnología puntera convierten cada unidad en un activo singular. Los Rimac publicados en Black Label Market provienen de especialistas que entienden el valor de un coche de esta categoría.',
  'aston-martin':
    'Aston Martin es la esencia del gran turismo británico: elegancia, prestaciones y un carácter inconfundible en modelos como el DB11, el Vantage, el DBS o el icónico DB5. Una mezcla de deportividad y refinamiento que pocos fabricantes logran. Los Aston Martin publicados en Black Label Market son seleccionados por especialistas con historial verificado y presentación a la altura de la marca.',
  bentley:
    'Bentley combina artesanía british con prestaciones deportivas reales. El Continental GT, el Bentayga o el Flying Spur son elecciones de quienes no quieren elegir entre lujo y dinámicas. Los vendedores especializados en Black Label Market son los únicos en los que merece confiar para este tipo de adquisición.',
  'rolls-royce':
    'Rolls-Royce define el lujo sin compromiso. Cada unidad es prácticamente única: materiales de primera calidad, personalización a medida y una presencia en carretera inigualable. Los Rolls-Royce disponibles en Black Label Market son ofrecidos por los pocos especialistas que manejan este tipo de producto con el cuidado que merece.',
  maserati:
    'Maserati combina deportividad italiana y lujo con un sello propio. El MC20, el GranTurismo, el Quattroporte o el clásico Bora son ejemplos de una marca con más de un siglo de competición y carácter. Los Maserati publicados en Black Label Market provienen de profesionales especializados, con historial documentado y configuraciones cuidadas.',
  bmw:
    'La gama M de BMW y los modelos más exclusivos de BMW Motorrad son referentes para quienes buscan prestaciones reales con refinamiento diario. Los vehículos BMW publicados en Black Label Market son seleccionados por profesionales con inventario especializado, historial documentado y exigencia en la presentación.',
  'mercedes-benz':
    'Mercedes-Benz define el estándar de lo que significa el lujo alemán en movimiento. Desde el SL clásico hasta el AMG GT, la Clase S o el G63, cada modelo combina ingeniería de vanguardia con un refinamiento que ningún otro fabricante iguala en volumen. Los vehículos Mercedes-Benz publicados en Black Label Market son seleccionados por profesionales con historial documentado, mantenimiento en red oficial y configuraciones de alto equipamiento.',
  audi:
    'Audi lleva décadas estableciendo referencias en tecnología, diseño y tracción quattro. La gama RS, el A8 o el e-tron GT son ejemplos de un fabricante que no necesita elevar el tono para ser premium. Los vehículos Audi publicados en Black Label Market son seleccionados por concesionarios especializados con historial verificado y presentación a la altura de la marca.',
  'alfa-romeo':
    'Alfa Romeo despierta pasión como pocas marcas: deportividad, diseño y un sonido inconfundible en modelos como el Giulia GTA, el 4C, el 8C Competizione o los clásicos GTV y Montreal. Más de un siglo de historia deportiva avala cada unidad. Los Alfa Romeo publicados en Black Label Market son ofrecidos por especialistas que valoran el carácter y el historial de cada modelo.',
  lexus:
    'Lexus es el lujo japonés llevado a la perfección: fiabilidad legendaria, refinamiento y joyas como el LFA o el LC 500. Una marca que combina tecnología híbrida puntera con un acabado impecable. Los Lexus publicados en Black Label Market son seleccionados por profesionales con historial verificado y mantenimiento al día.',
  nissan:
    'Nissan firma algunos de los deportivos japoneses más míticos: el GT-R, los Skyline GT-R, el 370Z o el clásico 240Z. Máquinas con un seguimiento de culto y un potencial de revalorización notable. Los Nissan deportivos publicados en Black Label Market provienen de especialistas que conocen estos modelos a fondo, con historial claro y unidades cuidadas.',
  corvette:
    'Corvette es el deportivo americano por excelencia: motores V8 de carácter, prestaciones de superdeportivo y un precio que siempre ha desafiado a la competencia europea. Del clásico C2 Stingray al actual C8 de motor central, cada generación tiene su público. Los Corvette publicados en Black Label Market son ofrecidos por especialistas con historial documentado y unidades en su configuración original.',
  dodge:
    'Dodge encarna el músculo americano sin complejos: el Viper, el Challenger y el Charger Hellcat ofrecen cilindradas y potencias que no tienen equivalente en Europa. Sonido, presencia y carácter en estado puro. Los Dodge publicados en Black Label Market provienen de especialistas que entienden el atractivo de estos modelos, con documentación e historial verificados.',
  ford:
    'Ford tiene un lugar reservado en el mundo del coche de carácter: del Mustang al GT, pasando por iconos del rally como el Sierra RS Cosworth o el Escort RS. Modelos con un seguimiento apasionado y un valor de coleccionista creciente. Los Ford premium y enthusiast publicados en Black Label Market son seleccionados por especialistas con historial trazable y presentación cuidada.',
  abarth:
    'Abarth es la deportividad italiana en formato compacto: el 595, el 695 y el 124 Spider concentran carácter, sonido y diversión en cada kilómetro. Una marca con un legado de competición que se nota en cada detalle. Los Abarth publicados en Black Label Market provienen de especialistas que valoran estas unidades por su carácter y su estado.',
  alpine:
    'Alpine es la pureza deportiva francesa: ligereza, agilidad y un diseño atemporal que va del clásico A110 berlinette al moderno A110 de motor central. Una marca de culto para los amantes de la conducción. Los Alpine publicados en Black Label Market son ofrecidos por especialistas que conocen y cuidan estos modelos.',
  ariel:
    'Ariel fabrica máquinas de conducción en estado puro. El Atom y el Nomad prescinden de todo lo superfluo para ofrecer una relación peso-potencia extrema y una experiencia visceral. Producción artesanal británica y unidades muy contadas. Los Ariel publicados en Black Label Market provienen de especialistas que entienden este tipo de producto.',
  brabus:
    'Brabus eleva los Mercedes-Benz a otra dimensión: potencias extremas, acabados exclusivos y una personalización que convierte cada unidad en única. Más que un preparador, una marca con identidad propia. Los Brabus publicados en Black Label Market son ofrecidos por especialistas que documentan cada modificación y cuidan la presentación al detalle.',
  caterham:
    'Caterham mantiene viva la esencia del Lotus Seven: un deportivo minimalista, ligero y centrado al cien por cien en la conducción. Décadas perfeccionando una fórmula irrepetible. Los Caterham publicados en Black Label Market provienen de especialistas que valoran estas máquinas por lo que son: pura emoción al volante.',
  cupra:
    'Cupra ha pasado de sello deportivo a marca con identidad propia: el León, el Formentor o el Born combinan prestaciones, diseño y tecnología con un carácter joven y dinámico. Los Cupra publicados en Black Label Market son seleccionados por profesionales con historial verificado y unidades bien cuidadas.',
  fiat:
    'Fiat firma algunos de los coches más entrañables y deseados de la historia: del 124 Spider al Coupé, pasando por joyas clásicas como el 8V o el Dino. Diseño italiano y carácter en cada modelo. Los Fiat premium y clásicos publicados en Black Label Market provienen de especialistas que valoran su historia y su estado.',
  genesis:
    'Genesis es el lujo coreano que ha sorprendido al mundo: modelos como el G70, el GV80 o el G90 ofrecen refinamiento, equipamiento y diseño a la altura de las marcas premium establecidas. Los Genesis publicados en Black Label Market son seleccionados por profesionales con historial verificado y configuraciones de alto equipamiento.',
  honda:
    'Honda es sinónimo de ingeniería brillante sobre cuatro y dos ruedas: del NSX, el Civic Type R o el S2000 a motos legendarias como la Fireblade o la Africa Twin. Fiabilidad, tecnología y un carácter deportivo reconocido en todo el mundo. Los Honda publicados en Black Label Market son ofrecidos por especialistas con historial documentado y unidades en su configuración original.',
  hyundai:
    'Hyundai ha irrumpido en el mundo deportivo con la gama N: el i30 N, el i20 N o el Ioniq 5 N demuestran que la marca coreana sabe divertir al volante. Tecnología, prestaciones y garantía a partes iguales. Los Hyundai N publicados en Black Label Market son seleccionados por profesionales con historial verificado.',
  jaguar:
    'Jaguar combina elegancia británica y deportividad con un linaje irrepetible: del mítico E-Type al F-Type, pasando por berlinas como el XJ. Diseño, carácter y un sonido inconfundible. Los Jaguar publicados en Black Label Market provienen de especialistas con historial documentado y unidades cuidadas, clásicas y modernas.',
  kia:
    'Kia ha dado el salto al terreno deportivo y premium con modelos como el Stinger GT o el EV6 GT: diseño, prestaciones y tecnología que rivalizan con marcas consolidadas. Los Kia publicados en Black Label Market son seleccionados por profesionales con historial verificado y unidades bien presentadas.',
  lancia:
    'Lancia es leyenda del automovilismo: el Delta HF Integrale, el Stratos o el 037 escribieron páginas doradas del rally mundial, y modelos como el Fulvia o el Aurelia son iconos del diseño italiano. Cada Lancia clásica es una pieza de coleccionista. Los Lancia publicados en Black Label Market provienen de especialistas que conocen su valor e historial.',
  'land-rover':
    'Land Rover define el todoterreno de lujo: el Range Rover, el Defender o el Velar combinan capacidad off-road real con refinamiento y presencia. Iconos que han marcado generaciones. Los Land Rover publicados en Black Label Market son seleccionados por profesionales con historial documentado y unidades de alto equipamiento.',
  lotus:
    'Lotus vive por una máxima: añadir ligereza. El Elise, el Exige, el Emira o el clásico Esprit son deportivos puros, centrados en la conducción por encima de todo. Una marca de culto para los entusiastas. Los Lotus publicados en Black Label Market provienen de especialistas que valoran y cuidan estos modelos.',
  maybach:
    'Maybach representa la cima del lujo dentro del universo Mercedes-Benz: confort, materiales y presencia llevados al máximo en modelos como el Clase S Maybach o el histórico 57 y 62. Exclusividad sin concesiones. Los Maybach publicados en Black Label Market son ofrecidos por los pocos especialistas que manejan este nivel de producto.',
  mazda:
    'Mazda ha creado deportivos irrepetibles: el MX-5, el roadster más vendido de la historia, o los míticos RX-7 y RX-8 de motor rotativo. Ingeniería original y carácter propio. Los Mazda deportivos publicados en Black Label Market provienen de especialistas que conocen estos modelos y cuidan su historial.',
  mini:
    'Mini combina carácter, diseño icónico y diversión al volante: del clásico Mini original a los John Cooper Works más radicales. Una marca con personalidad inconfundible. Los Mini publicados en Black Label Market son seleccionados por profesionales con historial verificado, clásicos y modernos.',
  mitsubishi:
    'Mitsubishi firma leyendas del rally y la cultura tuner: el Lancer Evolution, el 3000GT o el GTO son objetos de deseo con un seguimiento de culto. Los Mitsubishi deportivos publicados en Black Label Market provienen de especialistas que valoran estas unidades por su historial y su estado original.',
  morgan:
    'Morgan fabrica deportivos artesanales que parecen detenidos en el tiempo: líneas clásicas, construcción a mano y una experiencia de conducción única en modelos como el Plus Four o el Plus Six. Los Morgan publicados en Black Label Market provienen de especialistas que entienden su singularidad y cuidan cada detalle.',
  opel:
    'Opel guarda joyas para el entusiasta: del Manta al Calibra, pasando por las versiones OPC o el clásico Kadett GSi. Modelos con carácter y un valor de culto creciente. Los Opel deportivos y clásicos publicados en Black Label Market son ofrecidos por especialistas que valoran su historia.',
  peugeot:
    'Peugeot tiene un lugar de honor entre los compactos deportivos: el 205 GTI es referencia absoluta, y modelos como el 208 GTI, el RCZ o el 205 T16 mantienen viva esa herencia. Los Peugeot premium y clásicos publicados en Black Label Market provienen de especialistas con historial verificado.',
  polestar:
    'Polestar es deportividad eléctrica de diseño escandinavo: modelos como el Polestar 1 o el Polestar 2 combinan prestaciones, tecnología y una estética minimalista muy reconocible. Los Polestar publicados en Black Label Market son seleccionados por profesionales con historial verificado y unidades bien cuidadas.',
  renault:
    'Renault Sport ha creado algunos de los compactos más afilados del mercado: el Mégane RS, el Clio Williams o el mítico 5 Turbo son referencia para los amantes de la conducción. Los Renault deportivos y clásicos publicados en Black Label Market provienen de especialistas que conocen su valor e historial.',
  seat:
    'Seat tiene su propio panteón de coches con carácter: del León Cupra al clásico 600, pasando por el 124 Sport. Deportividad y nostalgia a partes iguales. Los Seat deportivos y clásicos publicados en Black Label Market son ofrecidos por especialistas que valoran su historia y su estado.',
  subaru:
    'Subaru es leyenda del rally y la tracción total: el Impreza WRX STI o el BRZ son iconos con un seguimiento apasionado. Mecánica bóxer, carácter y diversión. Los Subaru deportivos publicados en Black Label Market provienen de especialistas que cuidan el historial y la originalidad de cada unidad.',
  tesla:
    'Tesla revolucionó el coche eléctrico: el Model S Plaid, el Model 3 o el Roadster combinan prestaciones de superdeportivo con tecnología puntera. Los Tesla publicados en Black Label Market son seleccionados por profesionales con historial verificado y unidades en óptimo estado.',
  toyota:
    'Toyota firma deportivos de culto: el Supra, el GR Yaris, el GT86 o el mítico 2000GT son objetos de deseo para los entusiastas. Fiabilidad e ingeniería con carácter. Los Toyota deportivos publicados en Black Label Market provienen de especialistas que conocen estos modelos y cuidan su historial.',
  volkswagen:
    'Volkswagen ha creado iconos para el entusiasta: el Golf GTI inauguró un segmento, y modelos como el Golf R, el Scirocco o el clásico Karmann Ghia mantienen viva esa pasión. Los Volkswagen deportivos y clásicos publicados en Black Label Market son seleccionados por especialistas con historial verificado.',
  volvo:
    'Volvo combina seguridad, diseño escandinavo y joyas para el coleccionista como el P1800 o las deportivas 850 R y V70 R. Carácter propio y fiabilidad legendaria. Los Volvo premium y clásicos publicados en Black Label Market provienen de especialistas que valoran su historia y su estado.',
  cadillac:
    'Cadillac es el lujo americano por excelencia: del clásico Eldorado a las versiones V de altas prestaciones, pasando por el imponente Escalade. Presencia y carácter sin complejos. Los Cadillac publicados en Black Label Market son ofrecidos por especialistas con historial documentado y unidades cuidadas.',
  ds:
    'DS Automobiles es la propuesta premium francesa: confort, diseño vanguardista y un enfoque en el detalle que remite a la tradición de los grandes Citroën. Los DS publicados en Black Label Market son seleccionados por profesionales con historial verificado y configuraciones de alto equipamiento.',

  // ─────────────────────────── MOTOS ───────────────────────────
  ducati:
    'Ducati es sinónimo de pasión, precisión y carácter italiano. Desde la Panigale V4 hasta la Scrambler, cada modelo tiene una personalidad definida y un seguimiento de culto. En Black Label Market encontrarás Ducati de especialistas que entienden el producto: motos con historial claro, mantenimiento oficial y presentación a la altura.',
  'mv-agusta':
    'MV Agusta produce algunas de las motos más hermosas del mundo. La Brutale, la F4, la Superveloce... piezas de orfebrería sobre dos ruedas que combinan rendimiento superlativo con un diseño inimitable. Encontrar una MV Agusta con historial claro y en manos de un especialista de confianza es el tipo de operación que hace Black Label Market.',
  aprilia:
    'Aprilia es ingeniería deportiva italiana con ADN de competición: la RSV4 y la Tuono V4 son referencia en el mundo de las superbikes, con un palmarés en MotoGP y Superbike que avala cada modelo. Las Aprilia publicadas en Black Label Market provienen de especialistas con mantenimiento documentado y unidades en su configuración original.',
  bimota:
    'Bimota es exclusividad y artesanía sobre dos ruedas: chasis innovadores, producción mínima y soluciones técnicas únicas en modelos como la Tesi o la KB4. Cada Bimota es una pieza de coleccionista. Las Bimota publicadas en Black Label Market son ofrecidas por especialistas que entienden su rareza e historial.',
  'bmw-motorrad':
    'BMW Motorrad combina tecnología, prestaciones y polivalencia: de la deportiva S 1000 RR a la legendaria R 1250 GS o la elegante R nineT. Décadas de ingeniería alemana sobre dos ruedas. Las BMW Motorrad publicadas en Black Label Market provienen de especialistas con historial documentado y mantenimiento al día.',
  'harley-davidson':
    'Harley-Davidson no es solo una moto, es una cultura de conducción. Desde el Sportster hasta el Road King o el Fat Bob, cada modelo carga con décadas de historia y una comunidad que valora la autenticidad por encima de todo. Los Harley-Davidson publicados en Black Label Market son ofrecidos por especialistas que entienden el valor de una moto bien mantenida, documentada y en su configuración original.',
  indian:
    'Indian es la marca de motos más antigua de Estados Unidos, sinónimo de tradición y carácter: la Scout, la Chief o la Roadmaster combinan estética clásica con tecnología moderna. Las Indian publicadas en Black Label Market son ofrecidas por especialistas que valoran la autenticidad y el buen estado de cada unidad.',
  ktm:
    'KTM es pura adrenalina naranja: la 1290 Super Duke R, las Duke o las RC llevan el espíritu Ready to Race a la carretera con un carácter afilado e inconfundible. Las KTM publicadas en Black Label Market provienen de especialistas con historial claro y mantenimiento documentado.',
  triumph:
    'Triumph es la esencia de la moto británica de carácter: desde la Speed Triple hasta la Bonneville o la Tiger 900, cada modelo tiene una identidad definida y un legado de décadas. Los Triumph publicados en Black Label Market provienen de especialistas con inventario bien seleccionado, mantenimiento documentado y conocimiento real del producto.',
  benelli:
    'Benelli es historia y renacimiento de la moto italiana: de los clásicos de seis cilindros a la actual gama TNT y Leoncino. Carácter y diseño con sello propio. Las Benelli publicadas en Black Label Market son ofrecidas por especialistas que cuidan su historial y presentación.',
  cagiva:
    'Cagiva es nostalgia y carácter italiano: la mítica Mito 125 o la Raptor marcaron a toda una generación de aficionados. Modelos de culto con un seguimiento apasionado. Las Cagiva publicadas en Black Label Market provienen de especialistas que valoran estas unidades por su originalidad e historia.',
  'can-am':
    'Can-Am rompe los esquemas con sus vehículos de tres ruedas: el Spyder y el Ryker ofrecen una experiencia de conducción única, estable y llena de carácter. Las Can-Am publicadas en Black Label Market son ofrecidas por especialistas con historial verificado y unidades bien cuidadas.',
  energica:
    'Energica lidera la moto eléctrica de altas prestaciones: la Ego, la Eva o la Experia ofrecen par instantáneo y autonomía real con sello italiano y tecnología proveniente de la competición. Las Energica publicadas en Black Label Market provienen de especialistas que entienden esta nueva generación de motos.',
  husqvarna:
    'Husqvarna combina herencia sueca y diseño escandinavo con motos de carácter: la Svartpilen, la Vitpilen o las 701 destacan por su estética minimalista y su agilidad. Las Husqvarna publicadas en Black Label Market son ofrecidas por especialistas con mantenimiento documentado y unidades cuidadas.',
  kawasaki:
    'Kawasaki es potencia verde sin complejos: de la radical Ninja H2 sobrealimentada a las ZX-10R, las Z o la clásica Z1. Décadas de motos que han marcado época. Las Kawasaki publicadas en Black Label Market provienen de especialistas con historial claro y unidades en su configuración original.',
  livewire:
    'LiveWire es la marca eléctrica nacida de Harley-Davidson: la One y la S2 Del Mar ofrecen prestaciones, par instantáneo y un diseño moderno con vocación urbana. Las LiveWire publicadas en Black Label Market son ofrecidas por especialistas que entienden esta nueva categoría de moto.',
  'moto-guzzi':
    'Moto Guzzi es historia viva de la moto italiana: su característico motor bicilíndrico en V transversal define modelos como la V7, la V85 TT o la V100 Mandello. Más de un siglo de tradición de Mandello del Lario. Las Moto Guzzi publicadas en Black Label Market provienen de especialistas que valoran su carácter e historial.',
  piaggio:
    'Piaggio es movilidad italiana con carácter: del innovador MP3 de tres ruedas a sus scooters de gran cilindrada. Diseño y practicidad con sello propio. Las Piaggio publicadas en Black Label Market son ofrecidas por especialistas con historial verificado y unidades bien mantenidas.',
  'royal-enfield':
    'Royal Enfield es la marca de motos en producción continua más antigua del mundo: la Continental GT, la Interceptor 650 o la Himalayan combinan estética clásica, mecánica accesible y un encanto inconfundible. Las Royal Enfield publicadas en Black Label Market provienen de especialistas que cuidan su autenticidad y estado.',
  suzuki:
    'Suzuki firma algunas de las motos más icónicas: la Hayabusa, las GSX-R o la Katana son referencia en prestaciones y carácter. Décadas de victorias y modelos de culto. Las Suzuki publicadas en Black Label Market provienen de especialistas con historial documentado y unidades originales.',
  vespa:
    'Vespa es un icono mundial del diseño: más de 75 años definiendo el scooter con estilo, de la clásica PX a la moderna GTS o la exclusiva 946. Cada Vespa, clásica o actual, tiene un encanto atemporal. Las Vespa publicadas en Black Label Market son ofrecidas por especialistas que valoran su estética e historial.',
  yamaha:
    'Yamaha combina deportividad y versatilidad: la YZF-R1, la MT-09 o la clásica RD500 son referencia en sus segmentos, con un legado de competición que avala la marca. Las Yamaha publicadas en Black Label Market provienen de especialistas con historial claro y mantenimiento al día.',
  'zero-motorcycles':
    'Zero Motorcycles es pionera de la moto eléctrica: la SR/F, la SR/S o la DSR/X ofrecen prestaciones, par instantáneo y tecnología puntera con cero emisiones. Las Zero publicadas en Black Label Market son ofrecidas por especialistas que entienden esta nueva generación de motos.',
}
