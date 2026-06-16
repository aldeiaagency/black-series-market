import type { FaqItem, TocItem } from '../_components/GuideSeoBlocks'

export type CommercialGuideSection = {
  id: string
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

export type CommercialGuideLink = {
  href: string
  label: string
}

export type CommercialGuide = {
  slug: string
  title: string
  h1: string
  description: string
  tag: string
  intro: string[]
  image: string
  imageAlt: string
  datePublished: string
  dateModified: string
  sections: CommercialGuideSection[]
  faq: FaqItem[]
  catalogLinks: CommercialGuideLink[]
  relatedLinks: CommercialGuideLink[]
}

const TODAY = '2026-06-16'

export const commercialGuides: CommercialGuide[] = [
  {
    slug: 'coches-premium-segunda-mano-espana',
    title: 'Coches premium de segunda mano en España: marcas, modelos y precios',
    h1: 'Coches premium de segunda mano en España',
    description: 'Guía comercial para comprar coches premium de segunda mano en España: marcas clave, segmentos, rangos de precio, documentación y cómo encontrar unidades verificadas.',
    tag: 'Coches premium',
    image: '/images/hero/black-label-hero-gt3rs-ducati.webp',
    imageAlt: 'Coche premium deportivo en Black Label Market',
    datePublished: TODAY,
    dateModified: TODAY,
    intro: [
      'Buscar coches premium de segunda mano en España no consiste solo en filtrar por marca y precio. En este segmento importan la procedencia, el historial de mantenimiento, la configuración, la reputación del vendedor y la liquidez futura del modelo.',
      'Esta guía está pensada para compradores que quieren comparar opciones reales de catálogo antes de contactar: deportivos, berlinas, SUV premium, coches de lujo, clásicos y unidades especiales.',
    ],
    sections: [
      {
        id: 'que-es-coche-premium',
        title: 'Qué se considera un coche premium de segunda mano',
        paragraphs: [
          'Un coche premium de segunda mano es una unidad usada de una marca aspiracional o de alta gama, normalmente con mejor construcción, tecnología, prestaciones, acabados y valor de marca que un vehículo generalista. En España, este grupo suele incluir Porsche, BMW, Mercedes-Benz, Audi, Range Rover, Lexus, Maserati, Ferrari, Bentley o Aston Martin, entre otras.',
          'No todos los coches de una marca premium tienen el mismo interés. Un Porsche 911, un BMW M, un Mercedes-AMG o un Audi RS tienen una demanda distinta a la de una versión básica con mucho kilometraje. El valor depende del modelo, la motorización, el equipamiento y la trazabilidad.',
        ],
      },
      {
        id: 'segmentos',
        title: 'Segmentos con más demanda en un market premium',
        bullets: [
          'Deportivos premium: Porsche 911, Cayman, BMW M, Mercedes-AMG, Audi RS y variantes GT.',
          'SUV premium: Range Rover, Porsche Cayenne, Mercedes Clase G, BMW X5, Audi Q8 y Bentley Bentayga.',
          'Lujo y representación: Bentley, Rolls-Royce, Mercedes-Maybach, Maserati y Aston Martin.',
          'Clásicos y youngtimers: Porsche 911 clásicos, BMW M históricos, Mercedes SL, Ferrari modernos de colección.',
          'Unidades especiales: ediciones limitadas, configuraciones raras, bajo kilometraje o historial especialmente documentado.',
        ],
      },
      {
        id: 'precio',
        title: 'Cómo interpretar el precio de un coche premium usado',
        paragraphs: [
          'En coches premium, el precio anunciado debe leerse junto al historial. Dos unidades del mismo modelo y año pueden separarse mucho en valor si una tiene mantenimiento oficial completo, neumáticos y frenos recientes, configuración buscada y vendedor verificado.',
          'También conviene comparar con unidades equivalentes en España y Europa, pero evitando una trampa habitual: no todos los precios publicados son precios de cierre. El precio real depende de demanda, color, opciones, kilometraje, garantía y urgencia comercial del vendedor.',
        ],
      },
      {
        id: 'documentacion',
        title: 'Documentación que debería acompañar a una buena unidad',
        bullets: [
          'Libro de mantenimiento y facturas de revisiones.',
          'Historial de ITV y coherencia de kilometraje.',
          'Ficha técnica, permiso de circulación y ausencia de cargas.',
          'Detalle de equipamiento y configuración original.',
          'Garantía o condiciones comerciales si compra a profesional.',
        ],
      },
      {
        id: 'donde-buscar',
        title: 'Dónde buscar coches premium en venta',
        paragraphs: [
          'Un marketplace premium debe ayudarte a reducir ruido: menos anuncios irrelevantes, más trazabilidad y vendedores especializados. Para este tipo de compra, es mejor comparar unidades por calidad de información que ordenar únicamente por precio.',
          'En Black Label Market, el objetivo es conectar compradores con concesionarios, compraventas y especialistas verificados del mercado de coches premium en España.',
        ],
      },
    ],
    faq: [
      { question: '¿Qué marcas se consideran premium en coches de segunda mano?', answer: 'Depende del segmento, pero Porsche, Mercedes-Benz, BMW, Audi, Range Rover, Lexus, Maserati, Bentley, Aston Martin, Ferrari, Lamborghini y McLaren suelen formar parte del mercado premium o de lujo.' },
      { question: '¿Es mejor comprar un coche premium a un profesional?', answer: 'Para importes altos suele ser recomendable porque aporta trazabilidad, garantía comercial, documentación ordenada y una interlocución más clara si aparece cualquier incidencia.' },
      { question: '¿Qué es más importante: kilometraje o historial?', answer: 'El kilometraje importa, pero en un coche premium el historial pesa tanto o más. Una unidad con más kilómetros y mantenimiento impecable puede ser mejor compra que otra con pocos kilómetros y documentación débil.' },
    ],
    catalogLinks: [
      { href: '/coches', label: 'Ver coches premium' },
      { href: '/coches/deportivos', label: 'Deportivos premium' },
      { href: '/coches/lujo', label: 'Coches de lujo' },
      { href: '/coches/suv', label: 'SUV premium' },
    ],
    relatedLinks: [
      { href: '/guias/como-comprar-supercar-segunda-mano', label: 'Cómo comprar un supercar de segunda mano' },
      { href: '/guias/coches-clasicos-youngtimers-como-invertir', label: 'Clásicos y youngtimers como inversión' },
    ],
  },
  {
    slug: 'coches-lujo-segunda-mano-marcas-modelos',
    title: 'Coches de lujo de segunda mano: marcas, modelos y qué revisar',
    h1: 'Coches de lujo de segunda mano',
    description: 'Guía para comprar coches de lujo de segunda mano: Bentley, Rolls-Royce, Mercedes-Maybach, Aston Martin, Maserati y otros modelos premium en España.',
    tag: 'Coches de lujo',
    image: '/images/hero/professional-showroom-black-label.webp',
    imageAlt: 'Showroom de coches de lujo y alta gama',
    datePublished: TODAY,
    dateModified: TODAY,
    intro: [
      'Los coches de lujo de segunda mano responden a una lógica distinta a la de los deportivos. Aquí importan el confort, el estado interior, el historial de propietarios, la configuración, el mantenimiento preventivo y la imagen que proyecta el vehículo.',
      'Para un comprador de Bentley, Rolls-Royce, Mercedes-Maybach, Maserati o Aston Martin, una unidad bien documentada y presentada puede justificar una diferencia de precio considerable.',
    ],
    sections: [
      {
        id: 'marcas-lujo',
        title: 'Marcas habituales en el mercado de lujo usado',
        bullets: [
          'Bentley: Continental GT, Flying Spur y Bentayga.',
          'Rolls-Royce: Ghost, Wraith, Dawn, Cullinan y Phantom.',
          'Mercedes-Maybach y Clase S: berlinas de representación con alta tecnología.',
          'Aston Martin: DB11, Vantage, DBS y Rapide.',
          'Maserati: GranTurismo, Quattroporte y Levante Trofeo.',
        ],
      },
      {
        id: 'estado-interior',
        title: 'Por qué el interior pesa tanto en el precio',
        paragraphs: [
          'En coches de lujo, el desgaste interior es una señal muy relevante. Cuero, maderas, pantallas, mandos, asientos eléctricos, climatización trasera y sistemas multimedia deben funcionar y conservarse a la altura del posicionamiento del coche.',
          'Una unidad con pintura correcta pero interior descuidado puede perder atractivo frente a otra con más kilómetros y mejor conservación. El comprador de lujo evalúa experiencia, silencio, tacto y presencia.',
        ],
      },
      {
        id: 'mantenimiento',
        title: 'Mantenimiento y costes que conviene anticipar',
        paragraphs: [
          'Neumáticos de gran medida, suspensión neumática, frenos, electrónica de confort, baterías auxiliares y revisiones oficiales pueden elevar el coste de propiedad. No es un problema si está previsto, pero sí si el precio de compra oculta mantenimiento pendiente.',
          'Antes de reservar, conviene pedir facturas recientes y revisar si la unidad ha seguido intervalos de mantenimiento recomendados por el fabricante.',
        ],
      },
      {
        id: 'configuracion',
        title: 'Configuración, color y liquidez',
        paragraphs: [
          'En coches de lujo, una configuración elegante y coherente suele vender mejor que combinaciones excesivamente personalizadas. Colores clásicos, interiores bien conservados y opcionales de confort aumentan liquidez.',
          'Las configuraciones raras pueden ser valiosas cuando tienen demanda real; si no, reducen el número de compradores potenciales.',
        ],
      },
      {
        id: 'vendedor',
        title: 'El papel del vendedor especializado',
        paragraphs: [
          'Un vendedor especializado debe saber explicar procedencia, historial, estado y equipamiento sin obligar al comprador a reconstruir la historia de la unidad. En coches de lujo, esa transparencia forma parte de la propuesta de valor.',
        ],
      },
    ],
    faq: [
      { question: '¿Qué coche de lujo usado conserva mejor valor?', answer: 'Depende del modelo, pero las unidades con demanda estable, historial completo, configuración sobria y mantenimiento oficial suelen conservar mejor valor que coches muy personalizados o con documentación incompleta.' },
      { question: '¿Qué debo revisar en un Bentley o Rolls-Royce usado?', answer: 'Además de motor y caja, revisa suspensión, electrónica interior, climatización, estado del cuero, historial oficial, neumáticos, frenos y coherencia de kilometraje.' },
      { question: '¿Conviene financiar un coche de lujo de segunda mano?', answer: 'Puede tener sentido si el coste total está claro, pero hay que considerar mantenimiento, seguro, impuestos y posible depreciación, no solo la cuota mensual.' },
    ],
    catalogLinks: [
      { href: '/coches/lujo', label: 'Ver coches de lujo' },
      { href: '/marcas/bentley', label: 'Bentley' },
      { href: '/marcas/rolls-royce', label: 'Rolls-Royce' },
      { href: '/marcas/aston-martin', label: 'Aston Martin' },
    ],
    relatedLinks: [
      { href: '/guias/coches-premium-segunda-mano-espana', label: 'Coches premium de segunda mano' },
      { href: '/guias/suv-premium-segunda-mano-range-rover-cayenne-clase-g-x5', label: 'SUV premium de segunda mano' },
    ],
  },
  {
    slug: 'superdeportivos-segunda-mano-ferrari-lamborghini-mclaren-porsche',
    title: 'Superdeportivos de segunda mano: Ferrari, Lamborghini, McLaren y Porsche GT',
    h1: 'Superdeportivos de segunda mano en España',
    description: 'Guía comercial para comparar superdeportivos de segunda mano: Ferrari, Lamborghini, McLaren y Porsche GT usados, con claves de precio, historial y compra.',
    tag: 'Superdeportivos',
    image: '/images/hero/black-label-hero-gt3rs-ducati.webp',
    imageAlt: 'Superdeportivo premium en Black Label Market',
    datePublished: TODAY,
    dateModified: TODAY,
    intro: [
      'Los superdeportivos de segunda mano son uno de los segmentos más sensibles a documentación, estado y configuración. Un Ferrari, Lamborghini, McLaren o Porsche GT no se compra solo por potencia: se compra por historia, mantenimiento y confianza.',
      'Esta guía ayuda a comparar marcas y criterios antes de explorar unidades en venta.',
    ],
    sections: [
      {
        id: 'marcas',
        title: 'Ferrari, Lamborghini, McLaren y Porsche GT: perfiles de compra',
        bullets: [
          'Ferrari: fuerte valor de marca, sensibilidad alta a historial oficial, configuración y originalidad.',
          'Lamborghini: presencia visual, demanda aspiracional y especial atención a embrague, frenos, neumáticos y uso intensivo.',
          'McLaren: prestaciones muy altas, peso bajo y necesidad de revisar mantenimiento, garantía y actualizaciones.',
          'Porsche GT: GT3, GT3 RS y GT4 combinan uso deportivo, liquidez y una comunidad de compradores muy informada.',
        ],
      },
      {
        id: 'precio-real',
        title: 'Por qué el precio real no es solo el precio anunciado',
        paragraphs: [
          'En superdeportivos, una diferencia de precio puede esconder neumáticos al límite, frenos carbono-cerámicos próximos a sustitución, revisiones pendientes o historial incompleto. El comprador debe mirar coste de puesta a punto, no solo precio de entrada.',
          'También importan el color, los opcionales de carbono, el kilometraje coherente, el número de propietarios y si la unidad conserva piezas originales.',
        ],
      },
      {
        id: 'documentacion',
        title: 'Documentación mínima antes de contactar',
        bullets: [
          'Historial de mantenimiento completo.',
          'Facturas de revisiones y piezas importantes.',
          'Informe de siniestros o daños si existe.',
          'Número de propietarios y procedencia.',
          'Detalle de opcionales y configuración de fábrica.',
        ],
      },
      {
        id: 'uso-circuito',
        title: 'Uso en circuito: no siempre es malo, pero debe estar claro',
        paragraphs: [
          'Un superdeportivo puede haber hecho tandas y seguir siendo una gran compra si el mantenimiento acompaña. Lo peligroso es que el uso intensivo no esté declarado o no haya inspección técnica que lo respalde.',
          'Frenos, neumáticos, suspensión, geometrías y bajos del coche deben revisarse con más detalle en cualquier unidad con perfil de track day.',
        ],
      },
      {
        id: 'marketplace',
        title: 'Por qué buscar en un marketplace especializado',
        paragraphs: [
          'El comprador de superdeportivos necesita filtrar por confianza, no por volumen. Un entorno especializado permite comparar unidades con mayor calidad de presentación, vendedores más relevantes y menos ruido de anuncios genéricos.',
        ],
      },
    ],
    faq: [
      { question: '¿Qué superdeportivo de segunda mano es más fácil de revender?', answer: 'Suelen tener mejor liquidez las unidades reconocibles, con historial completo, configuración demandada y comunidad fuerte, como ciertos Porsche GT, Ferrari V8 o Lamborghini Huracán. Aun así, depende del precio de entrada y del estado.' },
      { question: '¿Ferrari o Lamborghini de segunda mano?', answer: 'Ferrari suele atraer a compradores sensibles a historial, originalidad y tradición de marca; Lamborghini destaca por diseño, presencia y experiencia emocional. La mejor elección depende de uso, presupuesto y tolerancia a costes.' },
      { question: '¿Es obligatorio hacer inspección pre-compra?', answer: 'No es obligatorio, pero en superdeportivos es muy recomendable. Una inspección independiente puede detectar costes ocultos que cambian por completo la operación.' },
    ],
    catalogLinks: [
      { href: '/coches/deportivos', label: 'Ver superdeportivos' },
      { href: '/marcas/ferrari', label: 'Ferrari' },
      { href: '/marcas/lamborghini', label: 'Lamborghini' },
      { href: '/marcas/mclaren', label: 'McLaren' },
      { href: '/marcas/porsche', label: 'Porsche' },
    ],
    relatedLinks: [
      { href: '/guias/como-comprar-supercar-segunda-mano', label: 'Cómo comprar un supercar' },
      { href: '/guias/coches-premium-segunda-mano-espana', label: 'Coches premium de segunda mano' },
    ],
  },
  {
    slug: 'suv-premium-segunda-mano-range-rover-cayenne-clase-g-x5',
    title: 'SUV premium de segunda mano: Range Rover, Cayenne, Clase G y BMW X5',
    h1: 'SUV premium de segunda mano',
    description: 'Guía para comprar SUV premium de segunda mano: Range Rover, Porsche Cayenne, Mercedes Clase G, BMW X5, Audi Q8 y otros SUV de lujo.',
    tag: 'SUV premium',
    image: '/images/hero/professional-showroom-black-label.webp',
    imageAlt: 'SUV y coches premium en showroom profesional',
    datePublished: TODAY,
    dateModified: TODAY,
    intro: [
      'Los SUV premium de segunda mano concentran una parte muy importante de la demanda: combinan imagen, comodidad, tecnología, espacio y prestaciones. Pero también pueden esconder costes altos si no se revisa bien la unidad.',
      'Range Rover, Porsche Cayenne, Mercedes Clase G, BMW X5 o Audi Q8 compiten en un mercado donde la configuración y el historial pesan tanto como el kilometraje.',
    ],
    sections: [
      {
        id: 'modelos',
        title: 'Modelos más buscados en SUV premium usados',
        bullets: [
          'Range Rover y Range Rover Sport: lujo, capacidad y fuerte imagen de marca.',
          'Porsche Cayenne y Macan: enfoque dinámico, buena demanda y versiones muy prestacionales.',
          'Mercedes Clase G y GLE: presencia, confort y alto valor aspiracional.',
          'BMW X5, X6 y XM: tecnología, motores potentes y tacto deportivo.',
          'Audi Q7, Q8 y RS Q8: calidad interior, tracción quattro y versiones deportivas.',
        ],
      },
      {
        id: 'costes',
        title: 'Costes ocultos en SUV de alta gama',
        paragraphs: [
          'Los SUV premium pesan más, montan neumáticos grandes, sistemas de suspensión complejos y mucha electrónica de confort. Antes de comprar, hay que revisar neumáticos, frenos, suspensión, historial de averías y campañas del fabricante.',
          'En híbridos enchufables o eléctricos premium, también conviene revisar batería, cargador, garantía y uso real del sistema eléctrico.',
        ],
      },
      {
        id: 'equipamiento',
        title: 'Equipamiento que mejora valor y liquidez',
        bullets: [
          'Paquetes deportivos o de lujo originales.',
          'Asientos ventilados, masaje, cuero ampliado y sonido premium.',
          'Sistemas de asistencia y cámaras 360.',
          'Techo panorámico y llantas originales en buen estado.',
          'Historial oficial y garantía comercial vigente.',
        ],
      },
      {
        id: 'uso',
        title: 'Uso familiar, ejecutivo o todoterreno',
        paragraphs: [
          'No todos los SUV premium han tenido el mismo uso. Una unidad ejecutiva de carretera, un coche familiar urbano y un todoterreno con uso real fuera de asfalto tienen desgastes diferentes. Las fotos y la descripción deben permitir entender ese historial.',
        ],
      },
      {
        id: 'compra',
        title: 'Cómo comparar unidades en venta',
        paragraphs: [
          'El mejor SUV premium no siempre es el más barato. Busca coherencia entre precio, kilómetros, estado, equipamiento, vendedor y mantenimiento. Si una unidad parece muy por debajo del mercado, normalmente hay una razón que merece investigarse.',
        ],
      },
    ],
    faq: [
      { question: '¿Cuál es el mejor SUV premium de segunda mano?', answer: 'No hay uno universal. Porsche Cayenne destaca por conducción, Range Rover por lujo y presencia, Clase G por valor aspiracional, BMW X5 por equilibrio y Audi Q8 por calidad interior. La mejor compra depende del uso y presupuesto.' },
      { question: '¿Qué revisar en un Range Rover usado?', answer: 'Suspensión, electrónica, historial de mantenimiento, neumáticos, frenos, posibles fugas, campañas de marca y funcionamiento de todos los sistemas de confort.' },
      { question: '¿Un SUV premium diésel sigue teniendo sentido?', answer: 'Puede tener sentido para muchos kilómetros y viajes largos, siempre que cumpla normativa ambiental y tenga buen historial. Para uso urbano, gasolina, híbrido o eléctrico puede encajar mejor.' },
    ],
    catalogLinks: [
      { href: '/coches/suv', label: 'Ver SUV premium' },
      { href: '/marcas/land-rover', label: 'Range Rover' },
      { href: '/marcas/porsche', label: 'Porsche Cayenne' },
      { href: '/marcas/mercedes-benz', label: 'Mercedes-Benz' },
      { href: '/marcas/bmw', label: 'BMW' },
    ],
    relatedLinks: [
      { href: '/guias/coches-premium-segunda-mano-espana', label: 'Coches premium de segunda mano' },
      { href: '/guias/coches-lujo-segunda-mano-marcas-modelos', label: 'Coches de lujo de segunda mano' },
    ],
  },
  {
    slug: 'coches-clasicos-premium-venta-porsche-ferrari-mercedes-bmw',
    title: 'Coches clásicos premium en venta: Porsche, Ferrari, Mercedes y BMW',
    h1: 'Coches clásicos premium en venta',
    description: 'Guía comercial para buscar coches clásicos premium en venta: Porsche 911, Ferrari clásicos, Mercedes SL, BMW M y youngtimers de colección.',
    tag: 'Clásicos premium',
    image: '/images/hero/vehicle-concierge-black-label.webp',
    imageAlt: 'Búsqueda editorial de coches clásicos premium',
    datePublished: TODAY,
    dateModified: TODAY,
    intro: [
      'Los coches clásicos premium en venta atraen a compradores que buscan algo más que transporte: historia, diseño, escasez, disfrute y potencial de conservación de valor. Porsche, Ferrari, Mercedes-Benz y BMW concentran buena parte de esa demanda.',
      'La clave es separar una unidad coleccionable de un coche viejo con estética atractiva. El mercado premia originalidad, documentación y estado real.',
    ],
    sections: [
      {
        id: 'marcas',
        title: 'Marcas con mayor interés en clásicos premium',
        bullets: [
          'Porsche: 911 clásicos, 964, 993, 996 especiales y Cayman/Boxster de interés creciente.',
          'Ferrari: V8 modernos, berlinettas clásicas y unidades con historial completo.',
          'Mercedes-Benz: SL, AMG, Clase S y coupés de representación.',
          'BMW: M3, M5, Z8, Z3 M, Serie 8 y youngtimers deportivos.',
          'Lancia, Alfa Romeo, Jaguar o Aston Martin: alternativas con fuerte personalidad y oferta más selectiva.',
        ],
      },
      {
        id: 'originalidad',
        title: 'Originalidad y documentación',
        paragraphs: [
          'Un clásico premium vale por lo que es y por lo que puede demostrar. Manuales, facturas, certificados, historial de propietarios, matching numbers y configuración original son activos de confianza.',
          'Las modificaciones no siempre son negativas, pero deben estar documentadas, ser reversibles o tener sentido dentro de la cultura del modelo.',
        ],
      },
      {
        id: 'estado',
        title: 'Estado, restauración y patina',
        paragraphs: [
          'En clásicos, una restauración sin facturas puede generar más dudas que una unidad original con desgaste honesto. El comprador debe valorar corrosión, pintura, interiores, motor, caja, suspensión y disponibilidad de piezas.',
        ],
      },
      {
        id: 'youngtimers',
        title: 'Youngtimers premium: el puente entre usado y clásico',
        paragraphs: [
          'Los youngtimers de los años 80, 90 y 2000 conectan con una generación de compradores que ahora busca los coches de su adolescencia. BMW M, Porsche 993/996, Mercedes AMG y Ferrari modernos pueden tener buena demanda si conservan configuración e historial.',
        ],
      },
      {
        id: 'buscar',
        title: 'Cómo buscar clásicos premium en un market',
        paragraphs: [
          'La búsqueda debe priorizar confianza: vendedores especializados, fotos detalladas, documentación clara y descripciones que expliquen procedencia. En este segmento, una buena ficha ahorra llamadas improductivas y mejora la calidad de la decisión.',
        ],
      },
    ],
    faq: [
      { question: '¿Qué coche clásico premium comprar?', answer: 'Depende del presupuesto, uso y gusto personal. Porsche 911, Mercedes SL, BMW M y ciertos Ferrari son opciones frecuentes por comunidad, demanda y disponibilidad de información.' },
      { question: '¿Qué es más importante en un clásico: kilómetros o estado?', answer: 'El estado y la documentación suelen pesar más que el kilometraje aislado. En clásicos, el mantenimiento, la originalidad y la ausencia de corrosión son críticos.' },
      { question: '¿Un youngtimer puede ser buena compra?', answer: 'Puede serlo si el modelo tiene demanda real, está bien conservado y el precio no descuenta una revalorización futura que aún no se ha producido.' },
    ],
    catalogLinks: [
      { href: '/coches/clasicos', label: 'Ver coches clásicos' },
      { href: '/marcas/porsche', label: 'Porsche' },
      { href: '/marcas/ferrari', label: 'Ferrari' },
      { href: '/marcas/mercedes-benz', label: 'Mercedes-Benz' },
      { href: '/marcas/bmw', label: 'BMW' },
    ],
    relatedLinks: [
      { href: '/guias/coches-clasicos-youngtimers-como-invertir', label: 'Clásicos y youngtimers como inversión' },
      { href: '/guias/coches-premium-segunda-mano-espana', label: 'Coches premium de segunda mano' },
    ],
  },
  {
    slug: 'motos-premium-segunda-mano-espana-ducati-bmw-harley-mv-agusta',
    title: 'Motos premium de segunda mano en España: Ducati, BMW, Harley y MV Agusta',
    h1: 'Motos premium de segunda mano en España',
    description: 'Guía comercial para buscar motos premium de segunda mano en España: Ducati, BMW Motorrad, Harley-Davidson, MV Agusta, Triumph y motos especiales.',
    tag: 'Motos premium',
    image: '/images/hero/black-label-hero-gt3rs-ducati.webp',
    imageAlt: 'Moto premium Ducati en Black Label Market',
    datePublished: TODAY,
    dateModified: TODAY,
    intro: [
      'Las motos premium de segunda mano combinan marca, prestaciones, diseño, tecnología y emoción. Ducati, BMW Motorrad, Harley-Davidson, MV Agusta o Triumph no se comparan solo por cilindrada: se comparan por uso, historial, equipamiento y estado real.',
      'Esta guía está pensada para encontrar motos premium en venta y entender qué tipo de unidad encaja con cada comprador.',
    ],
    sections: [
      {
        id: 'marcas',
        title: 'Marcas clave en motos premium usadas',
        bullets: [
          'Ducati: Panigale, Streetfighter, Multistrada y Diavel.',
          'BMW Motorrad: GS, S1000RR, M1000RR, R nineT y K1600.',
          'Harley-Davidson e Indian: custom, cruiser y touring de alto valor aspiracional.',
          'MV Agusta y Aprilia: deportivas y naked exclusivas con fuerte carácter.',
          'Triumph, KTM y Moto Guzzi: alternativas premium con personalidad propia.',
        ],
      },
      {
        id: 'segmentos',
        title: 'Qué segmento de moto premium buscar',
        paragraphs: [
          'Una deportiva premium exige revisar uso en circuito, neumáticos, frenos y mantenimiento. Una touring premium requiere comprobar electrónica, maletas, suspensiones y confort. Una custom premium depende mucho de estado estético, accesorios y originalidad.',
        ],
      },
      {
        id: 'historial',
        title: 'Historial y mantenimiento',
        paragraphs: [
          'En motos premium, el historial es especialmente importante porque el desgaste por uso intensivo puede no verse en una foto. Libro de revisiones, facturas, ITV, neumáticos y estado de transmisión ayudan a entender el valor real.',
        ],
      },
      {
        id: 'precio',
        title: 'Cómo comparar precios de motos premium',
        paragraphs: [
          'El precio debe ajustarse por versión, año, kilometraje, accesorios homologados, garantías, estado de consumibles y reputación del vendedor. Una unidad aparentemente cara puede ser mejor compra si evita mantenimiento inmediato.',
        ],
      },
    ],
    faq: [
      { question: '¿Qué marcas de moto premium tienen más demanda?', answer: 'Ducati, BMW Motorrad, Harley-Davidson, Triumph, MV Agusta, Aprilia, KTM e Indian suelen concentrar mucha demanda en el mercado premium y de alta gama.' },
      { question: '¿Qué moto premium comprar de segunda mano?', answer: 'Depende del uso. Para carretera deportiva, Ducati o BMW RR; para viajar, BMW GS o Triumph Tiger; para custom, Harley-Davidson o Indian; para exclusividad, MV Agusta o Aprilia.' },
      { question: '¿Qué revisar antes de comprar una moto premium usada?', answer: 'Historial de mantenimiento, ITV, neumáticos, frenos, transmisión, suspensiones, caídas, accesorios homologados, cargas y coherencia del kilometraje.' },
    ],
    catalogLinks: [
      { href: '/motos', label: 'Ver motos premium' },
      { href: '/motos/deportivas', label: 'Motos deportivas' },
      { href: '/motos/touring', label: 'Motos touring' },
      { href: '/motos/custom', label: 'Motos custom' },
    ],
    relatedLinks: [
      { href: '/guias/motos-premium-segunda-mano', label: 'Cómo comprar una moto premium' },
      { href: '/guias/motos-deportivas-premium-segunda-mano-ducati-bmw-aprilia', label: 'Motos deportivas premium' },
    ],
  },
  {
    slug: 'motos-deportivas-premium-segunda-mano-ducati-bmw-aprilia',
    title: 'Motos deportivas premium de segunda mano: Ducati, BMW, Aprilia y MV Agusta',
    h1: 'Motos deportivas premium de segunda mano',
    description: 'Guía para buscar motos deportivas premium de segunda mano: Ducati Panigale, BMW S1000RR, Aprilia RSV4, MV Agusta y superbikes usadas.',
    tag: 'Motos deportivas',
    image: '/images/hero/black-label-hero-gt3rs-ducati.webp',
    imageAlt: 'Moto deportiva premium Ducati junto a un superdeportivo',
    datePublished: TODAY,
    dateModified: TODAY,
    intro: [
      'Las motos deportivas premium de segunda mano son compras muy emocionales, pero también muy técnicas. Una Ducati Panigale, BMW S1000RR, Aprilia RSV4 o MV Agusta puede ofrecer prestaciones de circuito con costes y desgaste acordes.',
      'El objetivo no es encontrar la unidad más barata, sino la más coherente entre precio, estado, historial y uso previo.',
    ],
    sections: [
      {
        id: 'modelos',
        title: 'Modelos habituales en superbikes usadas',
        bullets: [
          'Ducati Panigale V2, V4 y Streetfighter V4.',
          'BMW S1000RR y M1000RR.',
          'Aprilia RSV4 y Tuono V4.',
          'MV Agusta F3, F4, Brutale y Superveloce.',
          'Yamaha R1M, Honda Fireblade SP y Kawasaki Ninja H2 como alternativas de alto rendimiento.',
        ],
      },
      {
        id: 'circuito',
        title: 'Uso en circuito y desgaste real',
        paragraphs: [
          'El uso en circuito no debe asustar si está declarado y mantenido, pero cambia la evaluación. Hay que revisar frenos, neumáticos, suspensiones, embrague, carenados, estriberas, topes anticaída y cualquier reparación previa.',
        ],
      },
      {
        id: 'electronica',
        title: 'Electrónica, mapas y mantenimiento',
        paragraphs: [
          'Las deportivas modernas dependen mucho de electrónica: control de tracción, ABS en curva, quickshifter, modos de motor y suspensiones semiactivas. Todo debe funcionar correctamente y conviene comprobar actualizaciones oficiales.',
        ],
      },
      {
        id: 'valor',
        title: 'Qué aumenta el valor de una deportiva premium',
        bullets: [
          'Historial oficial o especialista reconocido.',
          'Accesorios originales o piezas premium documentadas.',
          'Neumáticos y frenos en buen estado.',
          'Carenados originales conservados.',
          'Ausencia de caídas estructurales o reparaciones dudosas.',
        ],
      },
    ],
    faq: [
      { question: '¿Qué deportiva premium usada es más recomendable?', answer: 'Ducati Panigale, BMW S1000RR, Aprilia RSV4 y MV Agusta son opciones habituales. La mejor depende de ergonomía, uso, presupuesto de mantenimiento y disponibilidad de servicio especializado.' },
      { question: '¿Es malo comprar una moto que ha entrado en circuito?', answer: 'No necesariamente. Lo importante es que esté declarado, que el mantenimiento acompañe y que una revisión descarte daños estructurales o desgaste excesivo.' },
      { question: '¿Qué mirar en una Ducati Panigale usada?', answer: 'Historial, campañas, embrague, frenos, neumáticos, temperatura de trabajo, electrónica, posibles caídas y si conserva piezas originales.' },
    ],
    catalogLinks: [
      { href: '/motos/deportivas', label: 'Ver motos deportivas' },
      { href: '/marcas/ducati', label: 'Ducati' },
      { href: '/marcas/bmw-motorrad', label: 'BMW Motorrad' },
      { href: '/marcas/aprilia', label: 'Aprilia' },
      { href: '/marcas/mv-agusta', label: 'MV Agusta' },
    ],
    relatedLinks: [
      { href: '/guias/motos-premium-segunda-mano-espana-ducati-bmw-harley-mv-agusta', label: 'Motos premium de segunda mano' },
      { href: '/guias/motos-touring-trail-premium-segunda-mano-bmw-ducati-triumph', label: 'Motos touring y trail premium' },
    ],
  },
  {
    slug: 'motos-touring-trail-premium-segunda-mano-bmw-ducati-triumph',
    title: 'Motos touring y trail premium de segunda mano: BMW GS, Ducati Multistrada y Triumph',
    h1: 'Motos touring y trail premium de segunda mano',
    description: 'Guía para comprar motos touring y trail premium de segunda mano: BMW GS, Ducati Multistrada, Triumph Tiger, KTM Adventure y motos viajeras usadas.',
    tag: 'Touring y trail',
    image: '/images/hero/vehicle-concierge-black-label.webp',
    imageAlt: 'Búsqueda de motos touring y trail premium',
    datePublished: TODAY,
    dateModified: TODAY,
    intro: [
      'Las motos touring y trail premium de segunda mano son una de las búsquedas más fuertes del mercado moto de alta gama. BMW GS, Ducati Multistrada, Triumph Tiger o KTM Adventure combinan tecnología, viajes largos y uso diario.',
      'La compra exige revisar equipamiento, historial, suspensiones, electrónica y si la moto ha tenido uso intensivo de viaje o fuera de asfalto.',
    ],
    sections: [
      {
        id: 'modelos',
        title: 'Modelos premium más buscados',
        bullets: [
          'BMW R1250GS, R1300GS y Adventure.',
          'Ducati Multistrada V4 y V2.',
          'Triumph Tiger 900, 1200 y Explorer.',
          'KTM 1290 Super Adventure y 890 Adventure R.',
          'Moto Guzzi V100 Mandello y Stelvio como alternativas con carácter.',
        ],
      },
      {
        id: 'equipamiento',
        title: 'Equipamiento que marca diferencias',
        paragraphs: [
          'Maletas originales, defensas, puños calefactables, pantalla touring, control de crucero, suspensiones electrónicas, quickshifter y modos de conducción pueden justificar diferencia de precio si están bien instalados y documentados.',
        ],
      },
      {
        id: 'uso-viaje',
        title: 'Uso de viaje y desgaste',
        paragraphs: [
          'Una touring con muchos kilómetros puede ser buena compra si ha tenido mantenimiento regular. Revisa neumáticos, discos, pastillas, transmisión, suspensiones, rodamientos, historial de caídas en parado y estado de maletas.',
        ],
      },
      {
        id: 'trail',
        title: 'Uso trail real: qué comprobar',
        paragraphs: [
          'Si la moto ha salido de asfalto, conviene revisar bajos, llantas, radios, defensas, suspensión, manillar, estriberas y posibles golpes. El uso off-road ligero no es un problema si está bien mantenido y reflejado en el precio.',
        ],
      },
    ],
    faq: [
      { question: '¿Qué trail premium de segunda mano comprar?', answer: 'BMW GS es la referencia de mercado, Ducati Multistrada destaca por prestaciones, Triumph Tiger por equilibrio y KTM Adventure por enfoque más off-road. La mejor depende del tipo de viaje y uso.' },
      { question: '¿Son malos muchos kilómetros en una touring premium?', answer: 'No necesariamente. En motos viajeras, un kilometraje alto con mantenimiento completo puede ser más fiable que una unidad parada durante años sin revisiones.' },
      { question: '¿Qué equipamiento merece pagar en una trail premium usada?', answer: 'Maletas originales, suspensiones electrónicas, control de crucero, puños calefactables, defensas y mantenimiento documentado suelen aportar valor real.' },
    ],
    catalogLinks: [
      { href: '/motos/touring', label: 'Ver motos touring' },
      { href: '/motos/trail', label: 'Ver motos trail' },
      { href: '/marcas/bmw-motorrad', label: 'BMW Motorrad' },
      { href: '/marcas/ducati', label: 'Ducati' },
      { href: '/marcas/triumph', label: 'Triumph' },
    ],
    relatedLinks: [
      { href: '/guias/motos-premium-segunda-mano-espana-ducati-bmw-harley-mv-agusta', label: 'Motos premium de segunda mano' },
      { href: '/guias/motos-deportivas-premium-segunda-mano-ducati-bmw-aprilia', label: 'Motos deportivas premium' },
    ],
  },
]

export function getCommercialGuide(slug: string) {
  return commercialGuides.find((guide) => guide.slug === slug)
}

export function guideTocItems(guide: CommercialGuide): TocItem[] {
  return [
    ...guide.sections.map((section) => ({ href: `#${section.id}`, label: section.title })),
    { href: '#faq', label: 'Preguntas frecuentes' },
  ]
}
