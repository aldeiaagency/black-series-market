// Texto editorial por marca para las páginas /marcas/[brand].
// Importante para SEO: contenido único por marca, centrado en la propia marca
// (historia, carácter, modelos icónicos). Clave = slug de la marca.

export const BRAND_EDITORIAL: Record<string, string> = {
  // ─────────────────────────── COCHES ───────────────────────────
  ferrari:
    'Ferrari representa el punto más alto de la ingeniería deportiva italiana. Desde el 250 GT clásico hasta el SF90 o el 296 GTB, cada modelo combina rendimiento sin concesiones, líneas que no pasan de moda y un valor que el tiempo tiende a respetar. Pocas marcas concentran tanta historia, palmarés y deseo en cada unidad.',
  porsche:
    'Pocos fabricantes logran combinar usabilidad diaria con prestaciones puras como Porsche. El 911 lleva más de seis décadas evolucionando sin perder su esencia, mientras el Cayman, el Taycan o el Panamera son referencias absolutas en sus segmentos. Ingeniería alemana, fiabilidad y un valor de reventa que es la envidia del sector.',
  lamborghini:
    'Lamborghini es emoción en estado puro: diseño extremo, sonido inconfundible y una exclusividad que se cotiza. Del mítico Miura y el Countach que definieron el superdeportivo al Revuelto y el Huracán actuales, cada modelo es una declaración de intenciones. Un Lamborghini bien documentado es uno de los activos más codiciados del mundo del motor.',
  mclaren:
    'McLaren lleva la tecnología de la Fórmula 1 a la carretera. Heredera del legendario F1, su gama —720S, Artura, Senna, P1— destaca por chasis de fibra de carbono, una ligereza obsesiva y prestaciones de referencia absoluta en el segmento superdeportivo. Ingeniería británica sin concesiones.',
  bugatti:
    'Bugatti produce los hipercars más exclusivos del mundo. Cada Veyron, Chiron o Divo es una obra de ingeniería sin parangón: más de 1.000 CV, velocidades récord y un proceso de fabricación artesanal en Molsheim con producción medida en decenas de unidades. El nombre Bugatti es, desde hace un siglo, sinónimo de lo extraordinario.',
  koenigsegg:
    'Koenigsegg lleva la ingeniería sueca al extremo. Hipercars como el Jesko, el Regera o el Agera RS han batido récords mundiales de velocidad con soluciones técnicas que no existen en ningún otro fabricante. Producción de apenas unas unidades al año y una exclusividad absoluta convierten cada Koenigsegg en una rareza de coleccionista.',
  pagani:
    'Pagani fabrica auténticas obras de arte rodantes. El Zonda, el Huayra y el Utopia combinan fibra de carbono, motores AMG y una artesanía italiana medida al milímetro, en tiradas de muy pocas unidades. Cada Pagani es una pieza de coleccionista donde la mecánica y el detalle se elevan a la categoría de arte.',
  rimac:
    'Rimac ha redefinido el hipercar eléctrico. El Nevera, con más de 1.900 CV y récords de aceleración, sitúa a la marca croata en la cúspide tecnológica del sector. Producción mínima y tecnología puntera —hoy referencia para gigantes de la automoción— convierten cada unidad en un activo singular.',
  'aston-martin':
    'Aston Martin es la esencia del gran turismo británico: elegancia, prestaciones y un carácter inconfundible en modelos como el DB11, el Vantage, el DBS o el icónico DB5. Una marca con más de un siglo de historia que ha sabido combinar deportividad y refinamiento como pocas, con un aura cinematográfica que la hace única.',
  bentley:
    'Bentley combina artesanía británica con prestaciones deportivas reales. El Continental GT, el Bentayga o el Flying Spur son la elección de quienes no quieren renunciar ni al lujo ni a las dinámicas. Madera, cuero y motores W12 o V8 ensamblados a mano en Crewe definen una marca centenaria sin equivalente.',
  'rolls-royce':
    'Rolls-Royce define el lujo sin compromiso. Cada unidad es prácticamente única: materiales de primera calidad, personalización a medida y una presencia en carretera inigualable. Del Phantom al Cullinan, la marca británica es, desde 1904, el patrón con el que se mide la excelencia automovilística.',
  maserati:
    'Maserati combina deportividad italiana y lujo con un sello propio. El MC20, el GranTurismo, el Quattroporte o el clásico Bora son ejemplos de una marca con más de un siglo de competición, un sonido inconfundible y un tridente que evoca elegancia y carácter a partes iguales.',
  bmw:
    'BMW es la referencia del placer de conducir. De la gama M —M3, M5, el mítico M1— a clásicos como el 2002 turbo o el 507, la marca de Múnich combina prestaciones reales, propulsión trasera y un refinamiento diario que ha definido el segmento premium alemán durante décadas.',
  'mercedes-benz':
    'Mercedes-Benz define el estándar del lujo alemán en movimiento. Desde el 300 SL Gullwing y el SL clásico hasta el AMG GT, la Clase S o el G63, cada modelo combina ingeniería de vanguardia con un refinamiento que ningún otro fabricante iguala en volumen. La marca de la estrella es, desde el origen del automóvil, sinónimo de prestigio.',
  audi:
    'Audi lleva décadas estableciendo referencias en tecnología, diseño y tracción quattro. Del Ur-quattro que revolucionó el rally a la gama RS, el R8 o el e-tron GT, la marca de los cuatro aros demuestra que no necesita elevar el tono para ser premium. Refinamiento, calidad de construcción y deportividad contenida.',
  'alfa-romeo':
    'Alfa Romeo despierta pasión como pocas marcas: deportividad, diseño y un sonido inconfundible en modelos como el Giulia GTA, el 4C, el 8C Competizione o los clásicos GTV y Montreal. Más de un siglo de historia deportiva y un carácter latino que sus seguidores defienden como ninguno.',
  lexus:
    'Lexus es el lujo japonés llevado a la perfección: fiabilidad legendaria, refinamiento silencioso y joyas como el LFA, uno de los superdeportivos más especiales jamás fabricados, o el elegante LC 500. La marca premium de Toyota combina tecnología híbrida puntera con un acabado impecable.',
  nissan:
    'Nissan firma algunos de los deportivos japoneses más míticos. El GT-R, apodado Godzilla, y los Skyline GT-R que lo precedieron son leyendas con un seguimiento de culto; el 370Z, el 300ZX o el clásico 240Z completan un linaje deportivo con un enorme potencial de revalorización.',
  corvette:
    'Corvette es el deportivo americano por excelencia: motores V8 de carácter, prestaciones de superdeportivo y un precio que siempre ha desafiado a la competencia europea. Del clásico C2 Stingray al actual C8 de motor central, cada generación tiene un público fiel y una identidad inconfundible.',
  dodge:
    'Dodge encarna el músculo americano sin complejos. El Viper, con su descomunal V10, y los Challenger y Charger Hellcat ofrecen cilindradas y potencias que no tienen equivalente en Europa. Sonido atronador, presencia descomunal y un carácter que celebra el exceso como virtud.',
  ford:
    'Ford tiene un lugar reservado en el mundo del coche de carácter. Del Mustang —el pony car original— al GT heredero de Le Mans, pasando por iconos del rally como el Sierra RS Cosworth o el Escort RS, la marca del óvalo azul ha creado algunos de los deportivos con más seguimiento y valor de coleccionista.',
  abarth:
    'Abarth es la deportividad italiana en formato compacto. El 595, el 695 y el 124 Spider concentran carácter, sonido y diversión en cada kilómetro, herederos de un escorpión con un intenso legado de competición. La prueba de que el tamaño no está reñido con la emoción.',
  alpine:
    'Alpine es la pureza deportiva francesa: ligereza, agilidad y un diseño atemporal que va del clásico A110 berlinette, héroe de los rallies, al moderno A110 de motor central. Una marca de culto construida sobre la idea de que menos peso siempre es más diversión.',
  ariel:
    'Ariel fabrica máquinas de conducción en estado puro. El Atom y el Nomad prescinden de todo lo superfluo —carrocería incluida— para ofrecer una relación peso-potencia extrema y una experiencia visceral. Producción artesanal británica y unidades muy contadas.',
  brabus:
    'Brabus eleva los Mercedes-Benz a otra dimensión. Potencias extremas, acabados exclusivos y una personalización integral convierten cada unidad en única, hasta el punto de ser reconocida como fabricante por derecho propio. Cuando un Mercedes ya no es suficiente, aparece Brabus.',
  caterham:
    'Caterham mantiene viva la esencia del Lotus Seven: un deportivo minimalista, ligero y centrado al cien por cien en la conducción. Décadas perfeccionando una fórmula irrepetible que convierte cualquier carretera en un circuito y cada trayecto en una experiencia sin filtros.',
  cupra:
    'Cupra ha pasado de sello deportivo de Seat a marca con identidad propia. El León, el Formentor o el Born combinan prestaciones, diseño afilado y tecnología con un carácter joven y mediterráneo que la ha hecho destacar rápidamente en el segmento de las deportivas accesibles.',
  fiat:
    'Fiat firma algunos de los coches más entrañables y deseados de la historia. Del 124 Spider al Coupé de los noventa, pasando por joyas clásicas como el 8V o el Dino, la marca de Turín ha demostrado que el diseño y el carácter italianos no entienden de categorías.',
  genesis:
    'Genesis es el lujo coreano que ha sorprendido al mundo. Modelos como el G70, el GV80 o el G90 ofrecen refinamiento, equipamiento y un diseño propio a la altura de las marcas premium establecidas, con una relación calidad-precio que ha sacudido al segmento.',
  honda:
    'Honda es sinónimo de ingeniería brillante sobre cuatro y dos ruedas. Del NSX, el Civic Type R o el S2000 a motos legendarias como la Fireblade o la Africa Twin, la marca japonesa combina fiabilidad, tecnología puntera y un ADN deportivo forjado en la competición.',
  hyundai:
    'Hyundai ha irrumpido en el mundo deportivo con la gama N. El i30 N, el i20 N o el radical Ioniq 5 N demuestran que la marca coreana sabe divertir al volante, con un desarrollo nacido en Nürburgring y un nivel de prestaciones que rivaliza con referentes establecidos.',
  jaguar:
    'Jaguar combina elegancia británica y deportividad con un linaje irrepetible. Del mítico E-Type —llamado el coche más bello de la historia— al F-Type, pasando por berlinas como el XJ, la marca de Coventry destila carácter, diseño y un sonido inconfundible.',
  kia:
    'Kia ha dado el salto al terreno deportivo y premium con modelos como el Stinger GT o el EV6 GT. Diseño firmado por exresponsables de marcas alemanas, prestaciones reales y tecnología puntera han transformado por completo la percepción de la marca coreana.',
  lancia:
    'Lancia es leyenda del automovilismo. El Delta HF Integrale, el Stratos o el 037 escribieron páginas doradas del rally mundial, mientras modelos como el Fulvia o el Aurelia son iconos del diseño y la innovación italiana. Pocas marcas atesoran tanto palmarés y romanticismo.',
  'land-rover':
    'Land Rover define el todoterreno de lujo. El Range Rover, el Defender o el Velar combinan capacidad off-road real con refinamiento y presencia, una dualidad que ninguna otra marca ha sabido dominar igual desde 1948. Iconos que han marcado generaciones dentro y fuera del asfalto.',
  lotus:
    'Lotus vive por una máxima de su fundador: añadir ligereza. El Elise, el Exige, el Emira o el clásico Esprit son deportivos puros, centrados en la conducción por encima de todo, con un ADN de competición que convierte a la marca británica en objeto de culto para los entusiastas.',
  maybach:
    'Maybach representa la cima del lujo dentro del universo Mercedes-Benz. Confort, materiales y presencia llevados al máximo en el Clase S Maybach o los históricos 57 y 62. Un nombre reservado para quienes buscan exclusividad sin concesiones, por encima incluso de la estrella.',
  mazda:
    'Mazda ha creado deportivos irrepetibles. El MX-5 es el roadster más vendido de la historia y un manual de cómo divertirse al volante; los míticos RX-7 y RX-8 de motor rotativo demuestran una vocación por la ingeniería original que ninguna otra marca ha mantenido igual.',
  mini:
    'Mini combina carácter, diseño icónico y diversión al volante. Del clásico Mini original —ícono de los sesenta y leyenda del rally— a los John Cooper Works más radicales, la marca británica ha hecho de la agilidad y la personalidad inconfundible su seña de identidad.',
  mitsubishi:
    'Mitsubishi firma leyendas del rally y la cultura tuner. El Lancer Evolution, nacido para dominar los tramos, el 3000GT o el GTO son objetos de deseo con un seguimiento de culto y un potencial de revalorización que crece año tras año.',
  morgan:
    'Morgan fabrica deportivos artesanales que parecen detenidos en el tiempo. Líneas clásicas, construcción a mano y una experiencia de conducción única en modelos como el Plus Four o el Plus Six. Una marca británica que lleva más de un siglo fiel a su filosofía, casi a contracorriente.',
  opel:
    'Opel guarda auténticas joyas para el entusiasta. Del coupé Manta al Calibra, pasando por las versiones OPC o el clásico Kadett GSi, la marca alemana ha creado deportivos con carácter y un valor de culto que no deja de crecer entre los aficionados.',
  peugeot:
    'Peugeot tiene un lugar de honor entre los compactos deportivos. El 205 GTI es referencia absoluta del segmento, y modelos como el 208 GTI, el RCZ o el radical 205 T16 de rally mantienen viva una herencia deportiva que la marca del león defiende desde hace décadas.',
  polestar:
    'Polestar es deportividad eléctrica de diseño escandinavo. Nacida del brazo deportivo de Volvo, modelos como el exclusivo Polestar 1 o el Polestar 2 combinan prestaciones, tecnología y una estética minimalista muy reconocible que la diferencia en el panorama eléctrico.',
  renault:
    'Renault Sport ha creado algunos de los compactos más afilados del mercado. El Mégane RS, el Clio Williams o el mítico 5 Turbo de motor central son referencia para los amantes de la conducción, fruto de una marca con un enorme palmarés en Fórmula 1 y rally.',
  seat:
    'Seat tiene su propio panteón de coches con carácter. Del León Cupra al entrañable 600 que motorizó España, pasando por el 124 Sport, la marca combina deportividad y nostalgia a partes iguales, con un vínculo emocional difícil de igualar en su mercado.',
  subaru:
    'Subaru es leyenda del rally y la tracción total. El Impreza WRX STI, campeón del mundo, y el ágil BRZ son iconos con un seguimiento apasionado. Mecánica bóxer, tracción a las cuatro ruedas y un carácter inconfundible definen a la marca japonesa.',
  tesla:
    'Tesla revolucionó el coche eléctrico. El Model S Plaid, el Model 3 o el futuro Roadster combinan prestaciones de superdeportivo con una tecnología y un software que han marcado el rumbo de toda la industria. Una marca que convirtió lo eléctrico en deseable.',
  toyota:
    'Toyota firma deportivos de culto. El Supra, el ágil GR Yaris, el GT86 o exóticos como el 2000GT demuestran que detrás de la fiabilidad legendaria de la marca japonesa late un ADN deportivo capaz de crear auténticos iconos.',
  volkswagen:
    'Volkswagen ha creado iconos para el entusiasta. El Golf GTI inauguró el segmento del compacto deportivo y sigue siendo su referencia; modelos como el Golf R, el Scirocco o los clásicos Karmann Ghia y Escarabajo mantienen viva una pasión transversal y atemporal.',
  volvo:
    'Volvo combina seguridad, diseño escandinavo y auténticas joyas para el coleccionista como el elegante P1800 o las inesperadas deportivas 850 R y V70 R. Carácter propio, solidez legendaria y un giro reciente hacia el premium que ha redefinido la marca sueca.',
  cadillac:
    'Cadillac es el lujo americano por excelencia. Del clásico Eldorado, símbolo de toda una época, a las explosivas versiones V de altas prestaciones y el imponente Escalade, la marca estadounidense combina presencia, confort y carácter sin complejos.',
  ds:
    'DS Automobiles es la propuesta premium francesa. Confort, diseño vanguardista y un mimo por el detalle que remite a la tradición de los grandes Citroën como el legendario DS original. Una marca joven que reivindica el savoir-faire y la elegancia gala.',

  // ─────────────────────────── MOTOS ───────────────────────────
  ducati:
    'Ducati es sinónimo de pasión, precisión y carácter italiano. Desde la Panigale V4, heredera directa de la MotoGP, hasta la Monster o la Scrambler, cada modelo tiene una personalidad definida, un sonido inconfundible y un seguimiento de culto en todo el mundo.',
  'mv-agusta':
    'MV Agusta produce algunas de las motos más hermosas del mundo. La Brutale, la F4 o la Superveloce son piezas de orfebrería sobre dos ruedas que combinan un rendimiento superlativo con un diseño inimitable, respaldadas por un palmarés histórico irrepetible en competición.',
  aprilia:
    'Aprilia es ingeniería deportiva italiana con ADN de competición. La RSV4 y la Tuono V4 son referencia en el mundo de las superbikes, avaladas por un extenso palmarés en MotoGP y Superbike. Pocas marcas trasladan la pista a la calle con tanta fidelidad.',
  bimota:
    'Bimota es exclusividad y artesanía sobre dos ruedas. Chasis innovadores, producción mínima y soluciones técnicas únicas —como el sistema de dirección de la Tesi— hacen de cada modelo una pieza de coleccionista para los conocedores más exigentes.',
  'bmw-motorrad':
    'BMW Motorrad combina tecnología, prestaciones y polivalencia. De la deportiva S 1000 RR a la legendaria R 1250 GS, reina de las trail, o la elegante R nineT, la división de motos de BMW lleva décadas marcando el camino con su ingeniería alemana.',
  'harley-davidson':
    'Harley-Davidson no es solo una moto, es una cultura. Desde el Sportster hasta el Road King o el Fat Boy, cada modelo carga con más de un siglo de historia, un sonido inconfundible y una comunidad que valora la autenticidad por encima de todo.',
  indian:
    'Indian es la marca de motos más antigua de Estados Unidos, sinónimo de tradición y carácter. La Scout, la Chief o la Roadmaster combinan una estética clásica inconfundible con tecnología moderna, manteniendo viva una rivalidad histórica que forma parte de la leyenda del motociclismo americano.',
  ktm:
    'KTM es pura adrenalina naranja. La 1290 Super Duke R, las Duke o las RC llevan el espíritu Ready to Race a la calle con un carácter afilado e inconfundible, fruto de la marca austriaca más laureada del mundo en competición off-road.',
  triumph:
    'Triumph es la esencia de la moto británica de carácter. Desde la Speed Triple hasta la Bonneville —icono atemporal— o la Tiger, cada modelo tiene una identidad definida y un legado de más de un siglo que combina tradición y modernidad como ninguna.',
  benelli:
    'Benelli es historia y renacimiento de la moto italiana. De los espectaculares seis cilindros de los setenta a la actual gama TNT y Leoncino, la marca de Pésaro mantiene un carácter y un diseño con sello propio y más de un siglo de trayectoria.',
  cagiva:
    'Cagiva es nostalgia y carácter italiano. La mítica Mito 125, que soñaba con ser una Ducati en miniatura, o la Raptor marcaron a toda una generación de aficionados. Modelos de culto con un seguimiento que el tiempo no ha hecho más que aumentar.',
  'can-am':
    'Can-Am rompe los esquemas con sus vehículos de tres ruedas. El Spyder y el Ryker ofrecen una experiencia de conducción única, estable y llena de carácter, una propuesta diferente que ha creado su propia categoría dentro del mundo de las dos —y tres— ruedas.',
  energica:
    'Energica lidera la moto eléctrica de altas prestaciones. La Ego, la Eva o la Experia ofrecen par instantáneo y autonomía real con sello italiano y tecnología derivada de la competición, donde la marca fue pionera como suministrador único del Mundial eléctrico.',
  husqvarna:
    'Husqvarna combina herencia sueca y diseño escandinavo con motos de carácter. La Svartpilen, la Vitpilen o las 701 destacan por su estética minimalista, su agilidad y una personalidad muy diferenciada, respaldadas por más de un siglo de historia en competición.',
  kawasaki:
    'Kawasaki es potencia verde sin complejos. De la radical Ninja H2 sobrealimentada a las ZX-10R de circuito, las Z o la clásica Z1, la marca japonesa lleva décadas creando motos extremas que han marcado época en prestaciones y carácter.',
  livewire:
    'LiveWire es la marca eléctrica nacida de Harley-Davidson. La One y la S2 Del Mar ofrecen prestaciones, par instantáneo y un diseño moderno con vocación urbana, una apuesta por el futuro de la movilidad sobre dos ruedas con el respaldo de un fabricante legendario.',
  'moto-guzzi':
    'Moto Guzzi es historia viva de la moto italiana. Su característico motor bicilíndrico en V transversal define modelos como la V7, la V85 TT o la V100 Mandello. Más de un siglo de tradición desde su fábrica a orillas del lago de Como, en Mandello del Lario.',
  piaggio:
    'Piaggio es movilidad italiana con carácter. Del innovador MP3 de tres ruedas a sus scooters de gran cilindrada, la marca —matriz de Vespa, Gilera o Aprilia— combina diseño, practicidad e ingeniería con un sello inconfundible.',
  'royal-enfield':
    'Royal Enfield es la marca de motos en producción continua más antigua del mundo. La Continental GT, la Interceptor 650 o la Himalayan combinan estética clásica, mecánica accesible y un encanto atemporal que ha conquistado a una nueva generación de moteros.',
  suzuki:
    'Suzuki firma algunas de las motos más icónicas. La Hayabusa, leyenda de la velocidad, las GSX-R que definieron la deportiva moderna o la angular Katana son referencia en prestaciones y carácter, con décadas de victorias a sus espaldas.',
  vespa:
    'Vespa es un icono mundial del diseño. Más de 75 años definiendo el scooter con estilo, de la clásica PX a la moderna GTS o la exclusiva 946. Un símbolo de la dolce vita italiana cuyo encanto atemporal trasciende generaciones y modas.',
  yamaha:
    'Yamaha combina deportividad y versatilidad. La YZF-R1, la polivalente MT-09 o la mítica RD500 de dos tiempos son referencia en sus segmentos, fruto de una marca con un enorme palmarés en competición y una filosofía centrada en las emociones del piloto.',
  'zero-motorcycles':
    'Zero Motorcycles es pionera de la moto eléctrica. La SR/F, la SR/S o la trail DSR/X ofrecen prestaciones, par instantáneo y tecnología puntera con cero emisiones, liderando desde California una nueva generación de motos que redefine la experiencia de conducción.',
}
