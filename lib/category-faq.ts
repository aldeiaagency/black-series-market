import type { SupabaseClient } from '@supabase/supabase-js'
import type { FaqItem } from '@/components/marketplace/FaqSection'

// FAQ dinámica por categoría (coches/motos). Contenido cualitativo escrito a mano,
// revisado con Codex (2026-08-31): sin comparativas no defendibles con terceros, sin
// prometer stock en categorías con poco o ningún inventario activo hoy (scooter y
// entusiastas están a 0 unidades en el momento de escribir esto), y con el A2 de moto
// referido a potencia/relación potencia-peso, no solo a cilindrada.

const MIN_UNITS_FOR_RANGE = 3 // mínimo para mostrar rango de precio + nº de unidades
const MIN_UNITS_FOR_AVG = 5   // mínimo, más estricto, para mostrar la media (con 3-4 unidades una media es poco representativa, sobre todo en categorías con precios muy dispares como "deportivos")

export interface CategoryStats {
  totalCount: number   // unidades activas totales (con o sin precio)
  pricedCount: number  // subconjunto con precio real (excluye price_on_request)
  avgPrice: number | null
  minPrice: number | null
  maxPrice: number | null
}

export async function getCategoryStats(
  supabase: SupabaseClient,
  vehicleType: 'car' | 'motorcycle',
  categoryValues: string[],
): Promise<CategoryStats> {
  const { data, count } = await supabase
    .from('vehicles')
    .select('price, price_on_request, dealer:dealers!inner(profile_status)', { count: 'exact' })
    .eq('status', 'active')
    .eq('dealer.profile_status', 'published')
    .eq('vehicle_type', vehicleType)
    .in('category', categoryValues)

  const priced = (data ?? []).filter((v: any) => !v.price_on_request && v.price != null)
  if (priced.length === 0) {
    return { totalCount: count ?? 0, pricedCount: 0, avgPrice: null, minPrice: null, maxPrice: null }
  }
  const prices = priced.map((v: any) => v.price as number)
  return {
    totalCount: count ?? 0,
    pricedCount: priced.length,
    avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  }
}

function dynamicFaqItems(stats: CategoryStats, esGroupThousands: (n: number) => string): FaqItem[] {
  if (stats.pricedCount < MIN_UNITS_FOR_RANGE) return []
  const items: FaqItem[] = [
    {
      q: '¿Cuál es el rango de precios?',
      a: `Entre ${esGroupThousands(stats.minPrice!)} € y ${esGroupThousands(stats.maxPrice!)} €, entre las unidades con precio publicado disponibles ahora mismo en Black Label Market.`,
    },
    {
      q: '¿Cuántas unidades hay disponibles ahora?',
      a: `${stats.totalCount} unidad${stats.totalCount !== 1 ? 'es' : ''} activa${stats.totalCount !== 1 ? 's' : ''} en este momento, publicadas por concesionarios y especialistas verificados.`,
    },
  ]
  if (stats.pricedCount >= MIN_UNITS_FOR_AVG) {
    items.unshift({
      q: '¿Cuál es el precio medio ahora mismo?',
      a: `El precio medio de las unidades con precio publicado en Black Label Market ahora mismo es de ${esGroupThousands(stats.avgPrice!)} €. Esto describe el inventario disponible en este momento, no una media de mercado.`,
    })
  }
  return items
}

export function buildCategoryFaqItems(
  qualitative: FaqItem[],
  stats: CategoryStats,
  esGroupThousands: (n: number) => string,
): FaqItem[] {
  return [...dynamicFaqItems(stats, esGroupThousands), ...qualitative]
}

// ─── Contenido cualitativo — Coches ────────────────────────────────────────────

export const CAR_CATEGORY_FAQ: Record<string, FaqItem[]> = {
  berlinas: [
    {
      q: '¿Qué diferencia hay entre comprar una berlina premium aquí y en un portal generalista?',
      a: 'En Black Label Market solo publican concesionarios y especialistas verificados, no particulares. Cada ficha indica el historial de mantenimiento, el número de propietarios anteriores y si el vendedor ofrece financiación o acepta tu vehículo actual como parte de pago — datos que ayudan a comparar unidades con más contexto antes de contactar.',
    },
    {
      q: '¿Estas berlinas y compactos premium tienen garantía?',
      a: 'Depende de cada unidad y de cada vendedor: en la ficha se indica si el vehículo incluye garantía y, si es así, cuántos meses. Muchos concesionarios especializados en marcas como Audi, BMW o Mercedes-Benz pueden ofrecer garantía profesional o ampliaciones específicas según la unidad; confírmalo directamente con el vendedor antes de reservar.',
    },
  ],
  clasicos: [
    {
      q: '¿Qué diferencia hay entre un coche clásico y un youngtimer?',
      a: 'En el uso habitual del sector, se suele llamar clásico a un vehículo con varias décadas de antigüedad y un valor reconocido por su historia, diseño o rareza. Un youngtimer es más reciente pero ya despierta el mismo interés coleccionista — modelos como un BMW E30, un Porsche 993 o un Mercedes W124 son youngtimers de referencia. En Black Label Market conviven ambos porque el criterio de selección es el interés real del vehículo, no solo su antigüedad.',
    },
    {
      q: '¿Qué antigüedad debe tener un coche para optar a matrícula histórica en España?',
      a: 'Según la normativa vigente de la DGT, un vehículo puede optar a matrícula histórica a partir de los 30 años desde su fabricación o primera matriculación, siempre que conserve su estado original sin modificaciones sustanciales en el motor, los frenos u otros componentes principales. Los vehículos de más de 60 años quedan además exentos de la ITV periódica. Consulta con el vendedor si la unidad que te interesa ya cuenta con esta matrícula.',
    },
    {
      q: '¿Los coches clásicos y youngtimers de Black Label Market incluyen documentación de procedencia?',
      a: 'Cada ficha muestra si el vendedor ha aportado historial de mantenimiento y el número de propietarios anteriores, cuando esa información está disponible. Para clásicos y youngtimers recomendamos siempre pedir al vendedor el libro de mantenimiento, factura de compra y, si es posible, un informe de coincidencia de números de bastidor y motor antes de cerrar la operación.',
    },
  ],
  deportivos: [
    {
      q: '¿Qué diferencia hay entre un deportivo y un superdeportivo en Black Label Market?',
      a: 'Un deportivo prioriza la conducción y las prestaciones dentro de un uso más versátil — un Porsche 911 Carrera o un BMW M3, por ejemplo. Un superdeportivo suele llevar ese enfoque al extremo, con cifras de potencia, aceleración y velocidad punta reservadas normalmente a marcas como Ferrari, Lamborghini o McLaren. Ambos conviven en esta categoría porque comparten comprador: alguien que busca una experiencia de conducción por encima de la practicidad diaria.',
    },
    {
      q: '¿Los deportivos y superdeportivos incluyen historial de mantenimiento?',
      a: 'La ficha de cada deportivo indica si el vendedor ha aportado historial de mantenimiento, y muestra datos técnicos como potencia, aceleración de 0 a 100 km/h y velocidad máxima cuando el fabricante o el propio vendedor los facilita. Para unidades de alto rendimiento, recomendamos siempre pedir el historial de revisiones del motor y, si aplica, del sistema de escape o la suspensión antes de cerrar la compra.',
    },
    {
      q: '¿Puedo financiar un deportivo o superdeportivo en Black Label Market?',
      a: 'Depende del vendedor: en la ficha se indica si el profesional ofrece financiación y si acepta tu vehículo actual como parte de pago. En vehículos de alta gama, muchos concesionarios especializados trabajan con financieras propias adaptadas a este segmento; confirma las condiciones directamente con el vendedor.',
    },
  ],
  especiales: [
    {
      q: '¿Qué hace que un coche entre en "unidades especiales"?',
      a: 'Agrupa vehículos que destacan por su versión, su configuración de fábrica o su historia particular — series limitadas, ediciones especiales, unidades con un equipamiento poco habitual o modelos con una procedencia documentada relevante. No es una categoría de marca ni de tipo de carrocería, sino de singularidad documentable del vehículo.',
    },
    {
      q: '¿Cómo verifico que una unidad especial es realmente lo que dice ser?',
      a: 'Pide siempre al vendedor la documentación que acredite la particularidad del vehículo: certificado del fabricante para series limitadas, factura de compra original o historial que confirme la configuración de fábrica. En la ficha se indica el número de propietarios anteriores y si hay historial de mantenimiento disponible, dos datos que ayudan a contrastar la procedencia.',
    },
  ],
  lujo: [
    {
      q: '¿Qué marcas encuentro en la categoría de lujo y alta gama?',
      a: 'Puede incluir berlinas y todoterrenos de máxima gama de marcas como Rolls-Royce, Bentley, Mercedes-Benz Clase S o Maybach, además de versiones de alta gama de otras marcas premium. El criterio es el nivel de equipamiento, materiales y presencia, no solo el precio; el inventario concreto disponible varía en cada momento.',
    },
    {
      q: '¿Los vehículos de lujo de Black Label Market permiten IVA deducible?',
      a: 'Algunas unidades están marcadas en la ficha como "IVA deducible", lo que suele indicar una venta a empresa. Si necesitas esta condición fiscal, filtra por esa opción en el buscador y confirma el detalle exacto de la operación directamente con el vendedor, ya que la fiscalidad final depende de cada caso.',
    },
  ],
  suv: [
    {
      q: '¿Qué diferencia un SUV premium de un SUV convencional en este marketplace?',
      a: 'Los SUV premium de esta categoría son de marcas y gamas altas — como Porsche Cayenne, Range Rover, BMW X5/X7 o Mercedes GLE/GLS — con equipamiento, materiales y prestaciones por encima del segmento generalista, y siempre a través de concesionarios o especialistas verificados.',
    },
    {
      q: '¿Puedo entregar mi vehículo actual como parte de pago al comprar un SUV premium?',
      a: 'Depende de cada vendedor: la ficha indica si el profesional acepta vehículos como parte de pago. Es una práctica habitual en concesionarios de SUV premium, pero las condiciones de tasación las fija cada uno directamente contigo.',
    },
  ],
}

// ─── Contenido cualitativo — Motos ─────────────────────────────────────────────

export const MOTO_CATEGORY_FAQ: Record<string, FaqItem[]> = {
  naked: [
    {
      q: '¿Qué es una moto naked?',
      a: 'Una naked es una moto sin carenado (o con carenado mínimo) que expone el motor y el chasis, con una postura de conducción más erguida que una deportiva pura. Prioriza la agilidad y la conducción diaria sobre la aerodinámica de circuito — modelos como la Ducati Monster, la Triumph Street Triple o la KTM Duke son referencias del segmento.',
    },
    {
      q: '¿Qué carnet necesito para una naked de este catálogo?',
      a: 'Depende de la potencia y la relación potencia/peso de cada unidad (y de si está limitada de fábrica): las de menor potencia suelen circular con carnet A2, mientras que las de gama alta requieren carnet A. La ficha de cada moto indica el carnet necesario; si tienes dudas sobre tu carnet actual, consúltalo con el vendedor antes de reservar.',
    },
  ],
  scooter: [
    {
      q: '¿Qué diferencia un scooter premium de un scooter convencional?',
      a: 'Esta categoría está pensada para scooters de gama alta y gran cilindrada — como el Yamaha TMAX o modelos equivalentes de BMW y Piaggio — para uso interurbano y largas distancias, con un nivel de equipamiento, frenada y confort muy por encima del scooter urbano básico.',
    },
    {
      q: '¿Qué carnet necesito para un scooter premium de gran cilindrada?',
      a: 'Cuando se trata de scooters de mayor cilindrada y potencia, el carnet necesario suele ser A2 o A según el modelo concreto. La ficha de cada unidad indica el carnet necesario; confírmalo con el vendedor si tienes cualquier duda antes de la compra.',
    },
  ],
  'ediciones-especiales': [
    {
      q: '¿Qué hace que una moto entre en "ediciones especiales"?',
      a: 'Series limitadas, colaboraciones con pilotos o equipos de competición, aniversarios de marca o configuraciones de fábrica poco habituales. Es una categoría transversal: puede incluir naked, deportivas o custom, siempre que la unidad concreta tenga una singularidad documentable.',
    },
    {
      q: '¿Cómo sé que una edición especial es una unidad genuina?',
      a: 'Pide al vendedor el certificado de edición limitada del fabricante (cuando exista) o la documentación que acredite el número de serie de la tirada. La ficha indica si hay historial de mantenimiento disponible y el número de propietarios anteriores, dos datos adicionales que ayudan a contrastar la procedencia antes de comprar.',
    },
  ],
  trail: [
    {
      q: '¿Qué diferencia una trail de una maxitrail?',
      a: 'Ambas están pensadas para combinar carretera con pistas o uso fuera de asfalto ligero, pero la maxitrail eleva cilindrada, peso y equipamiento — modelos como la BMW R 1250 GS o la KTM 1290 Super Adventure son maxitrail de referencia, frente a trails más ligeras y accesibles de menor cilindrada. La capacidad off-road real varía según el modelo y los neumáticos montados.',
    },
    {
      q: '¿Las trail de este catálogo incluyen maletas o equipamiento de viaje?',
      a: 'Depende de cada unidad concreta: la ficha detalla el equipamiento incluido cuando el vendedor lo especifica, incluidas maletas y otros accesorios de viaje. Si buscas una configuración de viaje completa, confírmalo directamente con el vendedor antes de reservar.',
    },
  ],
  entusiastas: [
    {
      q: '¿Qué tipo de motos entran en la categoría "entusiastas"?',
      a: 'Motos con un carácter mecánico o histórico marcado que las hace especialmente valoradas por aficionados — motores singulares, palmarés en competición o una identidad de marca muy definida — más allá de su segmento de uso habitual (naked, deportiva, custom...).',
    },
    {
      q: '¿Este tipo de motos tiene buen potencial de revalorización?',
      a: 'Algunos modelos con producción limitada o fuerte identidad de marca han mostrado históricamente buena estabilidad de valor entre coleccionistas, pero no es una garantía y depende del estado, el historial y la demanda de cada modelo concreto. Recomendamos valorar cada unidad por su documentación y estado real, no solo por la reputación general del modelo.',
    },
  ],
  deportivas: [
    {
      q: '¿Qué carnet necesito para una moto deportiva de este catálogo?',
      a: 'Las deportivas de alta cilindrada (superbikes) requieren carnet A, mientras que algunas deportivas de acceso, según su potencia y relación potencia/peso, pueden circular con A2. La ficha de cada moto indica el carnet necesario según sus características concretas.',
    },
    {
      q: '¿Las deportivas incluyen historial de circuito o solo de carretera?',
      a: 'La ficha indica si el vendedor ha aportado historial de mantenimiento, pero no siempre distingue uso de circuito. Si el uso en pista es relevante para tu decisión, pregunta directamente al vendedor por el historial de neumáticos, frenos y posibles caídas antes de comprar.',
    },
  ],
  touring: [
    {
      q: '¿Qué diferencia una touring de una sport touring?',
      a: 'Una touring prioriza el confort para largas distancias — asiento, protección y capacidad de carga — mientras que una sport touring conserva ese enfoque de viaje pero con más prestaciones y agilidad, a costa de algo de confort. Modelos como la BMW R 1250 RT (touring) o la Kawasaki Ninja 1000SX (sport touring) ilustran bien la diferencia.',
    },
    {
      q: '¿Estas motos incluyen maletas y equipamiento de viaje en el precio?',
      a: 'Depende de cada unidad: la ficha detalla el equipamiento incluido cuando el vendedor lo especifica. Confirma con el vendedor si las maletas, el GPS u otros accesorios de viaje están incluidos en el precio publicado o se venden aparte.',
    },
  ],
  clasicas: [
    {
      q: '¿Qué antigüedad debe tener una moto para optar a matrícula histórica en España?',
      a: 'El criterio de la DGT es el mismo que para coches: al menos 30 años desde su fabricación o primera matriculación, y conservar su estado original sin modificaciones sustanciales en motor u otros componentes principales. Las motos de más de 60 años quedan exentas de ITV periódica. Consulta con el vendedor si la unidad concreta ya cuenta con esta matrícula.',
    },
    {
      q: '¿Qué diferencia una moto clásica de una youngtimer?',
      a: 'Una clásica suele superar las 2-3 décadas de antigüedad y tener un reconocimiento histórico o de diseño consolidado. Una youngtimer es más reciente pero ya despierta interés coleccionista — modelos de los años 90 y primeros 2000 de marcas como Ducati, Triumph o Moto Guzzi son youngtimers habituales en este catálogo.',
    },
  ],
  custom: [
    {
      q: '¿Qué diferencia una custom de una cruiser?',
      a: 'En España se suele usar "custom" para motos de estética cruiser, postura relajada y fuerte componente de personalización de fábrica o de taller, mientras que "cruiser" describe más específicamente el propio tipo de moto de serie con esa estética — Harley-Davidson e Indian son las marcas de referencia del segmento.',
    },
    {
      q: '¿Las motos custom personalizadas mantienen la garantía del fabricante?',
      a: 'Depende del alcance de la personalización y de si la ha realizado un taller oficial o un preparador independiente. La ficha indica si la unidad cuenta con garantía; para modificaciones sustanciales, confirma con el vendedor si afectan a la cobertura del fabricante antes de comprar.',
    },
  ],
}
