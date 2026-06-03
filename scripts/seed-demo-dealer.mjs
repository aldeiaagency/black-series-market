/**
 * Crea el concesionario demo "Black Series Premium Cars" con:
 * - Auth user + perfil dealer
 * - Logo generado con Sharp
 * - 10 vehículos premium con imágenes Unsplash y fichas completas
 *
 * Run: node scripts/seed-demo-dealer.mjs
 */

import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Uso: node --env-file=.env.local scripts/seed-demo-dealer.mjs
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY')
  console.error('Ejecuta con: node --env-file=.env.local scripts/seed-demo-dealer.mjs')
  process.exit(1)
}

const DEALER_EMAIL    = process.env.SEED_DEALER_EMAIL    ?? 'info@blackseriespremiumcars.es'
const DEALER_PASSWORD = process.env.SEED_DEALER_PASSWORD ?? 'ChangeMe_BeforeRun!'

const headers = {
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
  'apikey':        SERVICE_KEY,
}

function api(path, opts = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    headers,
    signal: AbortSignal.timeout(20000),
    ...opts,
  })
}

// ─── 1. GENERAR LOGO SVG DEL CONCESIONARIO ─────────────────────────────────

function makeDealerLogo() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0E0E0E"/>
      <stop offset="100%" stop-color="#1A1410"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#E8C96A"/>
      <stop offset="50%"  stop-color="#C6A64B"/>
      <stop offset="100%" stop-color="#9E7E30"/>
    </linearGradient>
    <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#E8E8E8"/>
      <stop offset="100%" stop-color="#A0A0A0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="400" fill="url(#bg)"/>

  <!-- Outer border -->
  <rect x="12" y="12" width="376" height="376" fill="none" stroke="#C6A64B" stroke-width="0.8" opacity="0.5"/>
  <rect x="18" y="18" width="364" height="364" fill="none" stroke="#C6A64B" stroke-width="0.3" opacity="0.25"/>

  <!-- Diamond ornament top -->
  <polygon points="200,32 210,42 200,52 190,42" fill="#C6A64B" opacity="0.6"/>

  <!-- BS Monogram -->
  <text x="200" y="205"
    text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="128" font-weight="400" letter-spacing="-6"
    fill="url(#gold)">BS</text>

  <!-- Thin rule -->
  <line x1="80" y1="248" x2="320" y2="248" stroke="#C6A64B" stroke-width="0.5" opacity="0.5"/>

  <!-- BLACK SERIES -->
  <text x="200" y="278"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="22" font-weight="400" letter-spacing="9"
    fill="url(#silver)">BLACK SERIES</text>

  <!-- PREMIUM CARS -->
  <text x="200" y="306"
    text-anchor="middle"
    font-family="'Arial Narrow', Arial, sans-serif"
    font-size="11" font-weight="400" letter-spacing="7"
    fill="#C6A64B" opacity="0.85">PREMIUM CARS</text>

  <!-- Bottom rule + location -->
  <line x1="80" y1="328" x2="320" y2="328" stroke="#C6A64B" stroke-width="0.5" opacity="0.3"/>
  <text x="200" y="348"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    font-size="9" letter-spacing="4"
    fill="#666">MADRID · ESPAÑA</text>

  <!-- Diamond ornament bottom -->
  <polygon points="200,368 207,375 200,382 193,375" fill="#C6A64B" opacity="0.4"/>
</svg>`)
}

// ─── 2. SUBIR LOGO A SUPABASE STORAGE ──────────────────────────────────────

async function ensureBucket(name) {
  // List buckets
  const r = await api('/storage/v1/bucket')
  const buckets = await r.json()
  const exists  = Array.isArray(buckets) && buckets.some(b => b.name === name)
  if (!exists) {
    const cr = await api('/storage/v1/bucket', {
      method: 'POST',
      body: JSON.stringify({ id: name, name, public: true }),
    })
    const res = await cr.json()
    if (cr.status >= 400) throw new Error(`Bucket creation failed: ${JSON.stringify(res)}`)
    console.log(`  Bucket '${name}' creado`)
  }
}

async function uploadLogo(webpBuf, filename) {
  const bucket = 'dealer-logos'
  await ensureBucket(bucket)

  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey':        SERVICE_KEY,
      'Content-Type':  'image/webp',
      'x-upsert':      'true',
    },
    body: webpBuf,
    signal: AbortSignal.timeout(20000),
  })
  if (r.status >= 400) {
    const txt = await r.text()
    throw new Error(`Upload failed ${r.status}: ${txt}`)
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`
}

// ─── 3. HELPER REST ─────────────────────────────────────────────────────────

async function rpc(table, body, method = 'POST') {
  const r = await api(`/rest/v1/${table}`, {
    method,
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  })
  const json = await r.json()
  if (r.status >= 400) throw new Error(`${method} ${table} failed: ${JSON.stringify(json)}`)
  return Array.isArray(json) ? json[0] : json
}

async function patch(table, filter, body) {
  const r = await api(`/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  })
  const json = await r.json()
  if (r.status >= 400) throw new Error(`PATCH ${table} failed: ${JSON.stringify(json)}`)
  return Array.isArray(json) ? json[0] : json
}

// Imágenes Unsplash — luxury cars
const IMG = {
  porsche:    'photo-1503736334956-4c8f8e4f2be4',
  ferrari:    'photo-1583121274602-3e2422c46f28',
  lamborghini:'photo-1544636331-e26879cd4d9b',
  mclaren:    'photo-1559416523-140ddc3d238c',
  bentley:    'photo-1609521263047-f8f205293f24',
  rollsroyce: 'photo-1563720223185-11003d516935',
  bmwm:       'photo-1555626906-fcf10d6851b4',
  mercedesamg:'photo-1617531636872-6bb8a3460d54',
  astonmartin:'photo-1560046758-d60e4d0b6dca',
  ducati:     'photo-1558618666-fcd25c85cd64',
  carinterior:'photo-1547245324-d777c6f05e80',
  black911:   'photo-1492144534655-ae79c964c9d7',
}

function img(id, w = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`
}

// ─── 4. DEFINICIÓN DE VEHÍCULOS ─────────────────────────────────────────────

function buildVehicles(dealerId) {
  return [
    // ── 1. Porsche 911 GT3 RS ──────────────────────────────────────────────
    {
      dealer_id:      dealerId,
      slug:           'porsche-911-gt3-rs-992-2024-shark-blue',
      vehicle_type:   'car',
      status:         'active',
      brand_name:     'Porsche',
      model_name:     '911 GT3 RS',
      version:        '(992) Weissach Package',
      year:           2024,
      mileage_km:     1200,
      condition_type: 'seminuevo',
      fuel_type:      'gasoline',
      displacement_cc:4000,
      cylinders:      6,
      engine_config:  'Boxer 6 atmosférico',
      power_hp:       525,
      power_kw:       386,
      torque_nm:      465,
      zero_to_hundred:3.2,
      top_speed_kmh:  296,
      transmission:   'dct',
      drive_type:     'rwd',
      weight_kg:      1450,
      color_exterior: 'Shark Blue Metallic',
      color_interior: 'Black/Guards Red Full Alcantara',
      upholstery:     'Alcantara',
      body_type:      'Coupé',
      price:          329800,
      currency:       'EUR',
      is_negotiable:  false,
      is_featured:    true,
      is_exclusive:   true,
      has_service_history: true,
      has_carfax:     false,
      financing_available: true,
      accepts_trade_in:    true,
      registration_country: 'ES',
      registration_year:   2024,
      location_province:   'Madrid',
      iva_deducible:   false,
      title: 'Porsche 911 GT3 RS (992) Weissach — Shark Blue — 1.200 km',
      description: `El 911 GT3 RS (992) representa el pico absoluto de la ingeniería Porsche en circuito. Con el exclusivo paquete Weissach que reduce 35 kg gracias a elementos de fibra de carbono-titanio, este ejemplar en Shark Blue Metallic es la definición de exclusividad funcional.

El motor bóxer de 4.0 litros atmosférico —idéntico en arquitectura al del RSR de competición— desarrolla 525 cv a 9.000 rpm sin recurrir a turbocompresor alguno, ofreciendo una respuesta lineal y un sonido inconfundible. El cambio PDK de 7 velocidades ejecuta cada marcha en 80 milisegundos.

Este vehículo ha completado apenas 1.200 km desde su entrega en concesionario oficial Porsche. El interior en Alcantara negro con costuras Guards Red y el volante GT en Sport-Tex denotan la vocación puramente deportiva de la configuración elegida.

Incluye el Paquete Clubsport (extintor, jaula trasera preparada, arnés de 6 puntos), cámara trasera, y el innovador sistema de aerodinámica activa DRS que maximiza la carga o minimiza la resistencia según la situación.`,
      equipment: [
        'Paquete Weissach (–35 kg)',
        'Sistema de aerodinámica activa DRS',
        'Suspensión PCCB (frenos cerámicos)',
        'Llantas magnesio forjado 21/20"',
        'Interior completo Alcantara',
        'Paquete Clubsport (extintor/arnés)',
        'Cámara de marcha atrás',
        'Park Assist',
        'Porsche Communication Management',
        'SportChrono con Lap Trigger',
        'Alzado de morro hidráulico',
        'Climatizador bizona',
        'Certificado Porsche Approved',
      ],
      images: [
        { url: img(IMG.black911),   alt: 'Porsche 911 GT3 RS 992 Shark Blue frontal', order: 0 },
        { url: img(IMG.porsche),    alt: 'Porsche 911 GT3 RS 992 lateral dinámico',   order: 1 },
        { url: img(IMG.carinterior),alt: 'Interior GT3 RS Alcantara negro/rojo',      order: 2 },
      ],
      published_at: new Date().toISOString(),
      badge: 'Exclusivo',
    },

    // ── 2. Ferrari 488 Pista ───────────────────────────────────────────────
    {
      dealer_id:      dealerId,
      slug:           'ferrari-488-pista-2019-rosso-corsa',
      vehicle_type:   'car',
      status:         'active',
      brand_name:     'Ferrari',
      model_name:     '488 Pista',
      version:        'Pista Spider Package',
      year:           2019,
      mileage_km:     4800,
      condition_type: 'ocasion',
      fuel_type:      'gasoline',
      displacement_cc:3902,
      cylinders:      8,
      engine_config:  'V8 90° biturbo',
      power_hp:       720,
      power_kw:       530,
      torque_nm:      770,
      zero_to_hundred:2.85,
      top_speed_kmh:  340,
      transmission:   'dct',
      drive_type:     'rwd',
      weight_kg:      1385,
      color_exterior: 'Rosso Corsa',
      color_interior: 'Nero Leather con detalles en Rosso',
      upholstery:     'Piel de napa',
      body_type:      'Coupé',
      price:          429000,
      currency:       'EUR',
      is_negotiable:  false,
      is_featured:    true,
      is_exclusive:   true,
      has_service_history: true,
      has_carfax:     false,
      financing_available: true,
      accepts_trade_in:    true,
      registration_country: 'ES',
      registration_year:   2019,
      location_province:   'Madrid',
      iva_deducible:   false,
      title: 'Ferrari 488 Pista — Rosso Corsa — 4.800 km — Historial Ferrari',
      description: `El 488 Pista es el Ferrari de calle más extremo de su generación, desarrollado directamente a partir de la experiencia en el campeonato Ferrari Challenge. "Pista" —que en italiano significa "circuito"— resume perfectamente la filosofía de este vehículo.

El motor V8 de 3.9 litros biturbo produce 720 cv, convirtiéndole en el V8 más potente jamás instalado en un Ferrari de serie en aquel momento. Con un peso en vacío de apenas 1.385 kg, la relación potencia/peso de 520 cv/tonelada justifica el 0-100 en 2,85 segundos.

Este ejemplar en Rosso Corsa cuenta con el historial de revisiones completo en concesionario Ferrari oficial, con los 4.800 km que marcan un vehículo prácticamente atesorado. Incluye el Spider Package que incorpora aerodinámica de competición adaptada.

La electrónica de último nivel —Ferrari Dynamic Enhancer (FDE), Side Slip Control 6.0, sistema de vectorización de par— permiten explotar el potencial en circuito con una seguridad y progresividad difícilmente igualables.`,
      equipment: [
        'Spider Package aerodinámico',
        'Frenos cerámicos CCM-R',
        'Llantas forjadas diamantadas 20"',
        'Escape Inconel titanio',
        'Volante F1 en carbono/alcantara',
        'Asientos Pista en fibra de carbono',
        'Ferrari Dynamic Enhancer (FDE+)',
        'Side Slip Control 6.0 (SSC6)',
        'Cámara frontal + parking sensors',
        'Sistema HiFi premium',
        'Maneta cambio aluminio',
        'Certificado Ferrari Genuine',
        'Historial oficial Ferrari completo',
      ],
      images: [
        { url: img(IMG.ferrari),    alt: 'Ferrari 488 Pista Rosso Corsa frontal',     order: 0 },
        { url: img(IMG.carinterior),alt: 'Interior Ferrari 488 Pista cuero negro',    order: 1 },
        { url: img(IMG.porsche),    alt: 'Ferrari 488 Pista detalle motor V8',        order: 2 },
      ],
      published_at: new Date().toISOString(),
      badge: 'Exclusivo',
    },

    // ── 3. Lamborghini Huracán EVO ─────────────────────────────────────────
    {
      dealer_id:      dealerId,
      slug:           'lamborghini-huracan-evo-2021-giallo-inti',
      vehicle_type:   'car',
      status:         'active',
      brand_name:     'Lamborghini',
      model_name:     'Huracán EVO',
      version:        'Coupé AWD',
      year:           2021,
      mileage_km:     8200,
      condition_type: 'ocasion',
      fuel_type:      'gasoline',
      displacement_cc:5204,
      cylinders:      10,
      engine_config:  'V10 90° atmosférico',
      power_hp:       640,
      power_kw:       470,
      torque_nm:      600,
      zero_to_hundred:2.9,
      top_speed_kmh:  325,
      transmission:   'dct',
      drive_type:     'awd',
      weight_kg:      1422,
      color_exterior: 'Giallo Inti',
      color_interior: 'Nero Ade Alcantara con costuras Giallo',
      upholstery:     'Alcantara',
      body_type:      'Coupé',
      price:          289000,
      currency:       'EUR',
      is_negotiable:  true,
      is_featured:    false,
      is_exclusive:   false,
      has_service_history: true,
      financing_available: true,
      accepts_trade_in:    true,
      registration_country: 'ES',
      registration_year:   2021,
      location_province:   'Madrid',
      iva_deducible:   false,
      title: 'Lamborghini Huracán EVO Coupé AWD — Giallo Inti — 8.200 km',
      description: `El Huracán EVO representa la evolución definitiva de la plataforma LP610-4, con mejoras radicales en la integración electrónica y aerodinámica respecto al modelo original. El motor V10 atmosférico de 5.2 litros sigue siendo la referencia absoluta en sonoridad y progresión de potencia.

El sistema LDVI (Lamborghini Dinamica Veicolo Integrata) anticipa las demandas del conductor gracias a un algoritmo predictivo que conecta la tracción integral, el vectorizado de par y la aerodinámica activa en una respuesta holística al estado dinámico del vehículo.

Este ejemplar en Giallo Inti —el color más icónico de la marca Sant'Agata— cuenta con el interior en Alcantara Nero Ade con costuras amarillas, una combinación que enfatiza el carácter visual del vehículo sin renunciar al confort en rodaje abierto.

Con solo 8.200 km desde su matriculación en 2021, se presenta en estado concours con historial de mantenimiento completo en Lamborghini Madrid.`,
      equipment: [
        'Sistema LDVI (dinámica integrada)',
        'Tracción integral AWD permanente',
        'Frenos cerámicos CCB de serie',
        'Aerodinámica activa delantera y trasera',
        'Llantas Giano bicolor 20"',
        'Sistema Lamborghini Infotainment LIS',
        'Cámara de marcha atrás + PDC',
        'Lift front hidráulico',
        'Sistema de escape deportivo',
        'Interior Sport completo Alcantara',
        'Techo cristal panorámico',
        'Climatizador automático bizona',
        'Certificado Lamborghini Approved',
      ],
      images: [
        { url: img(IMG.lamborghini), alt: 'Lamborghini Huracán EVO Giallo Inti frontal',  order: 0 },
        { url: img(IMG.ferrari),     alt: 'Huracán EVO detalle toma de aire lateral',     order: 1 },
        { url: img(IMG.carinterior), alt: 'Interior Huracán EVO Alcantara negro/amarillo', order: 2 },
      ],
      published_at: new Date().toISOString(),
    },

    // ── 4. McLaren 720S Spider ─────────────────────────────────────────────
    {
      dealer_id:      dealerId,
      slug:           'mclaren-720s-spider-2022-papaya-spark',
      vehicle_type:   'car',
      status:         'active',
      brand_name:     'McLaren',
      model_name:     '720S Spider',
      version:        'Performance Package',
      year:           2022,
      mileage_km:     5600,
      condition_type: 'ocasion',
      fuel_type:      'gasoline',
      displacement_cc:3994,
      cylinders:      8,
      engine_config:  'V8 twin-turbo M840T',
      power_hp:       720,
      power_kw:       530,
      torque_nm:      770,
      zero_to_hundred:2.9,
      top_speed_kmh:  341,
      transmission:   'automatic',
      drive_type:     'rwd',
      weight_kg:      1332,
      color_exterior: 'Papaya Spark',
      color_interior: 'Carbon Black Nappa Leather',
      upholstery:     'Piel Nappa',
      body_type:      'Spider Descapotable',
      price:          379000,
      currency:       'EUR',
      is_negotiable:  false,
      is_featured:    true,
      is_exclusive:   true,
      has_service_history: true,
      financing_available: true,
      accepts_trade_in:    true,
      registration_country: 'ES',
      registration_year:   2022,
      location_province:   'Madrid',
      iva_deducible:   false,
      title: 'McLaren 720S Spider Performance — Papaya Spark — 5.600 km',
      description: `El 720S Spider lleva la arquitectura MonoCell II-T de McLaren —una célula de supervivencia en carbono que combina rigidez extrema con peso mínimo— a su expresión más deseable: un roadster sin techo que reduce el peso total en solo 49 kg respecto al coupé gracias a la eliminación de los pilares B y el techo retráctil de policarbonato.

El motor M840T de 3.994 cc twin-turbo desarrolla 720 cv con un torque de 770 Nm disponible ya desde 5.500 rpm, y la tracción trasera exclusiva convierte cada aceleración en un ejercicio de confianza progresiva. El 0-200 km/h en 7,9 segundos y la velocidad punta de 341 km/h se alcanzan sin la ayuda de ningún sistema de tracción a las cuatro ruedas.

Este ejemplar del paquete Performance incorpora frenos de carbono-cerámica (CCM) y asientos superhidráulicos ultraligeros en carbono como elementos diferenciadores. Con 5.600 km y servicio oficial McLaren, representa la oportunidad de acceder al 720S en su versión más completa.`,
      equipment: [
        'Paquete Performance',
        'Frenos carbono-cerámica CCM',
        'Asientos superhidráulicos en carbono',
        'Techo retráctil electrohidráulico (11 seg)',
        'Llantas ultraligeras 10 radios 20"',
        'Sistema de escape activo variable',
        'Suspensión Proactive Chassis Control II',
        'Cámaras 360° + Park Assist',
        'McLaren Track Telemetry (MTT)',
        'Sistema de audio Bowers & Wilkins',
        'Climatizador bizona con ventilación',
        'Sensores de lluvia/crepuscular',
        'Certificado McLaren Approved',
      ],
      images: [
        { url: img(IMG.mclaren),     alt: 'McLaren 720S Spider Papaya Spark abierto',   order: 0 },
        { url: img(IMG.lamborghini), alt: 'McLaren 720S Spider perfil dinámico',         order: 1 },
        { url: img(IMG.carinterior), alt: 'Interior McLaren 720S cuero negro carbono',   order: 2 },
      ],
      published_at: new Date().toISOString(),
      badge: 'Exclusivo',
    },

    // ── 5. Bentley Continental GT Speed ───────────────────────────────────
    {
      dealer_id:      dealerId,
      slug:           'bentley-continental-gt-speed-2023-beluga',
      vehicle_type:   'car',
      status:         'active',
      brand_name:     'Bentley',
      model_name:     'Continental GT Speed',
      version:        'W12 Mulliner Spec',
      year:           2023,
      mileage_km:     3100,
      condition_type: 'seminuevo',
      fuel_type:      'gasoline',
      displacement_cc:5950,
      cylinders:      12,
      engine_config:  'W12 TSI twin-turbo',
      power_hp:       659,
      power_kw:       485,
      torque_nm:      900,
      zero_to_hundred:3.6,
      top_speed_kmh:  335,
      transmission:   'automatic',
      drive_type:     'awd',
      weight_kg:      2244,
      color_exterior: 'Beluga Black',
      color_interior: 'Linen/Cognac Mulliner Quilted',
      upholstery:     'Cuero Bentley Mulliner',
      body_type:      'Coupé GT',
      price:          289000,
      currency:       'EUR',
      is_negotiable:  false,
      is_featured:    false,
      is_exclusive:   false,
      has_service_history: true,
      financing_available: true,
      accepts_trade_in:    true,
      registration_country: 'ES',
      registration_year:   2023,
      location_province:   'Madrid',
      iva_deducible:   false,
      title: 'Bentley Continental GT Speed W12 — Beluga Black — Mulliner Spec — 3.100 km',
      description: `El Continental GT Speed W12 representa la cumbre del continuum de lujo y rendimiento que Bentley ha perfeccionado durante décadas. "Speed" no es solo una denominación: el motor W12 de 6.0 litros biturbo con 659 cv convierte este gran turismo de 2.244 kg en un vehículo capaz de despacharse el 0-100 en 3,6 segundos camino de los 335 km/h.

La especificación Mulliner de este ejemplar eleva el interior a una artesanía casi insuperable: los cueros Linen y Cognac en configuración quilted (acolchado diamante) han sido cosidos a mano en la planta de Crewe por artesanos que dedican más de cien horas a cada habitáculo. El salpicadero en chapa de Nogal oscuro veteado añade calidez orgánica al conjunto.

La tecnología de conducción es igualmente sofisticada: la tracción integral activa, el diferencial trasero electrónico y la suspensión neumática de 48 voltios permiten que el conductor pueda elegir entre el modo Grand Touring para viajes intercontinentales o el modo Sport que endurece el chasis y aguza la dirección.`,
      equipment: [
        'Motor W12 6.0L twin-turbo 659 cv',
        'Especificación Mulliner interior',
        'Cuero Quilted Diamond Linen/Cognac',
        'Chapa Nogal veteado salpicadero',
        'Tracción integral activa',
        'Suspensión neumática 48V electrónica',
        'Frenos cerámicos carbono-silicio',
        'Llantas forjadas 22" Black',
        'Sistema Naim Audio 1.100W',
        'Techo panorámico de cristal',
        'Head-up display',
        'Cámara 360° + aparcamiento autónomo',
        'Certificado Bentley Approved',
      ],
      images: [
        { url: img(IMG.bentley),     alt: 'Bentley Continental GT Speed Beluga Black',   order: 0 },
        { url: img(IMG.black911),    alt: 'Bentley Continental GT Speed perfil lateral',  order: 1 },
        { url: img(IMG.carinterior), alt: 'Interior Bentley Mulliner cuero Linen/Cognac', order: 2 },
      ],
      published_at: new Date().toISOString(),
    },

    // ── 6. Rolls-Royce Ghost ──────────────────────────────────────────────
    {
      dealer_id:      dealerId,
      slug:           'rolls-royce-ghost-2022-andalusian-white',
      vehicle_type:   'car',
      status:         'active',
      brand_name:     'Rolls-Royce',
      model_name:     'Ghost',
      version:        'Extended Wheelbase Black Badge',
      year:           2022,
      mileage_km:     6200,
      condition_type: 'ocasion',
      fuel_type:      'gasoline',
      displacement_cc:6749,
      cylinders:      12,
      engine_config:  'V12 twin-turbo',
      power_hp:       592,
      power_kw:       435,
      torque_nm:      900,
      zero_to_hundred:4.5,
      top_speed_kmh:  250,
      transmission:   'automatic',
      drive_type:     'awd',
      weight_kg:      2560,
      color_exterior: 'Andalusian White Pearl',
      color_interior: 'Navy Blue Leather / Silver Phantom finish',
      upholstery:     'Cuero Coach Lines Bespoke',
      body_type:      'Saloon 4 puertas',
      price:          439000,
      currency:       'EUR',
      is_negotiable:  false,
      is_featured:    true,
      is_exclusive:   true,
      has_service_history: true,
      financing_available: true,
      accepts_trade_in:    true,
      registration_country: 'ES',
      registration_year:   2022,
      location_province:   'Madrid',
      iva_deducible:   false,
      title: 'Rolls-Royce Ghost Black Badge EWB — Andalusian White — 6.200 km',
      description: `La séptima generación del Ghost es la expresión más avanzada del concepto de "lujo post-opulento" que Rolls-Royce ha articulado con acierto: la magnificencia en los materiales y la construcción es total, pero el lenguaje visual resulta medido y contemporáneo frente al exceso ornamental de generaciones previas.

Este Black Badge Extended Wheelbase —el más largo de la gama Ghost, con 358 cm de distancia entre ejes— eleva la experiencia en la parte trasera a un nivel comparable al de un jet privado. Los pasajeros traseros disponen de butacas reclinables eléctricamente, pantallas de entretenimiento independientes, mesita plegable en cuero y una bodega de bebidas climatizada.

El motor V12 de 6.75 litros en configuración Black Badge recibe modificaciones específicas de software que elevan la respuesta hasta el límite aceptable para el confort absoluto del habitáculo. La plataforma Space Saver —aluminio extrusionado soldado— genera uno de los habitáculos más silenciosos jamás construidos: 19 kg de lana aislante y una doble cámara de vidrio laminado reducen el ruido interior a 49 dB a 100 km/h.`,
      equipment: [
        'Especificación Black Badge',
        'Carrocería Extended Wheelbase (+17 cm)',
        'Techo Starlight 1.344 fibras ópticas',
        'Asientos traseros reclinables eléctrico',
        'Bodega bebidas climatizada trasera',
        'Pantallas entretenimiento pasajeros',
        'Sistema audio bespoke 18 altavoces',
        'Suspensión neumática auto-nivelante',
        'Plataforma space-saver aluminio',
        'Llantas Black Badge 21" dark chrome',
        'Paraguas Rolls-Royce integrado',
        'Sensor de lluvia + Head-up Display',
        'Cámaras 360° + asistente aparcamiento',
      ],
      images: [
        { url: img(IMG.rollsroyce),  alt: 'Rolls-Royce Ghost Black Badge Andalusian White', order: 0 },
        { url: img(IMG.bentley),     alt: 'Rolls-Royce Ghost EWB perfil',                   order: 1 },
        { url: img(IMG.carinterior), alt: 'Interior Rolls-Royce Ghost Navy Blue Bespoke',   order: 2 },
      ],
      published_at: new Date().toISOString(),
      badge: 'Exclusivo',
    },

    // ── 7. BMW M3 Competition xDrive Touring ──────────────────────────────
    {
      dealer_id:      dealerId,
      slug:           'bmw-m3-competition-xdrive-touring-2023-iman-green',
      vehicle_type:   'car',
      status:         'active',
      brand_name:     'BMW',
      model_name:     'M3 Competition xDrive Touring',
      version:        'M Carbon Package',
      year:           2023,
      mileage_km:     11400,
      condition_type: 'ocasion',
      fuel_type:      'gasoline',
      displacement_cc:2993,
      cylinders:      6,
      engine_config:  'I6 M TwinPower Turbo',
      power_hp:       510,
      power_kw:       375,
      torque_nm:      650,
      zero_to_hundred:3.5,
      top_speed_kmh:  290,
      transmission:   'automatic',
      drive_type:     'awd',
      weight_kg:      1870,
      color_exterior: 'Isle of Man Green Metallic',
      color_interior: 'Merino Black Full / Carbon Interior',
      upholstery:     'Merino Full',
      body_type:      'Touring (Familiar)',
      price:          118900,
      currency:       'EUR',
      is_negotiable:  true,
      is_featured:    false,
      is_exclusive:   false,
      has_service_history: true,
      financing_available: true,
      accepts_trade_in:    true,
      registration_country: 'ES',
      registration_year:   2023,
      location_province:   'Madrid',
      iva_deducible:   true,
      title: 'BMW M3 Competition xDrive Touring — Isle of Man Green — M Carbon — 11.400 km',
      description: `El M3 Competition xDrive Touring inauguró una categoría propia al combinar la practicidad de un familiar con 500 litros de maletero con el rendimiento de un superdeportivo. BMW M GmbH tardó tres generaciones en aprobar la versión Touring —anticipando que no era viable dinámicamente— y el resultado desmiente completamente ese escepticismo.

El motor S58 de 3.0 litros I6 biturbo con 510 cv es el bloque de seis cilindros de producción más potente que BMW ha fabricado, capaz de girar con libertad hasta las 7.200 rpm con una progresión de torque que hace la tracción integral xDrive imprescindible para gestionar los 650 Nm.

En Isle of Man Green Metallic con el paquete M Carbon Interior —cubierta de salpicadero y consola en fibra de carbono M visible— este ejemplar combina discreción visual exterior con exclusividad cromática real. La especificación permite IVA deducible para uso profesional.

Con 11.400 km y servicio oficial BMW M, incluye la garantía BMW M Premium hasta 2026.`,
      equipment: [
        'Motor S58 I6 510 cv M TwinPower',
        'Tracción integral M xDrive activa',
        'M Carbon Interior Package',
        'Frenos M compuestos 380mm delantera',
        'Suspensión adaptativa M Adaptive',
        'Diferencial activo M trasero',
        'Llantas M forjadas bicolor 20/21"',
        'Asientos M Race full Merino Black',
        'Sistema de escape M activo',
        'BMW M HUD color Head-Up Display',
        'Cámaras 360° Surround View',
        'Maletero 500L + parrilla retráctil',
        'IVA DEDUCIBLE — Garantía M 2026',
      ],
      images: [
        { url: img(IMG.bmwm),        alt: 'BMW M3 Competition Touring Isle of Man Green', order: 0 },
        { url: img(IMG.black911),    alt: 'BMW M3 Touring perfil lateral dinámico',       order: 1 },
        { url: img(IMG.carinterior), alt: 'Interior BMW M3 Merino Black carbono',          order: 2 },
      ],
      published_at: new Date().toISOString(),
    },

    // ── 8. Mercedes-AMG GT 63 S E Performance ────────────────────────────
    {
      dealer_id:      dealerId,
      slug:           'mercedes-amg-gt63s-e-performance-2024-obsidian',
      vehicle_type:   'car',
      status:         'active',
      brand_name:     'Mercedes-Benz',
      model_name:     'AMG GT 63 S E Performance',
      version:        '4 puertas Coupé — Paquete Aerodynamics',
      year:           2024,
      mileage_km:     2800,
      condition_type: 'seminuevo',
      fuel_type:      'plugin_hybrid',
      displacement_cc:3982,
      cylinders:      8,
      engine_config:  'V8 AMG biturbo + eMotor eje trasero',
      power_hp:       843,
      power_kw:       620,
      torque_nm:      1470,
      zero_to_hundred:2.9,
      top_speed_kmh:  316,
      transmission:   'automatic',
      drive_type:     'awd',
      weight_kg:      2360,
      color_exterior: 'Obsidian Black Metallic',
      color_interior: 'Nappa Leather Magma Grey/Black AMG Performance',
      upholstery:     'Nappa AMG Performance',
      body_type:      'Gran Turismo 4 puertas',
      price:          249800,
      currency:       'EUR',
      is_negotiable:  false,
      is_featured:    false,
      is_exclusive:   false,
      has_service_history: true,
      financing_available: true,
      accepts_trade_in:    true,
      registration_country: 'ES',
      registration_year:   2024,
      location_province:   'Madrid',
      iva_deducible:   false,
      title: 'Mercedes-AMG GT 63 S E Performance — Obsidian Black — 843 cv — 2.800 km',
      description: `El AMG GT 63 S E Performance encarna la visión de AMG sobre la hibridación de alta prestaciones: ninguna concesión al rendimiento, ninguna compromiso en la experiencia, simplemente más potencia. Con 843 cv totales —el V8 de 630 cv más el motor eléctrico de 204 cv en el eje trasero— y 1.470 Nm de torque disponible instantáneamente, el 0-100 en 2,9 segundos cataloga este gran turismo de cuatro plazas en la misma categoría de rendimiento que los hipercars puros.

La arquitectura PHEV de AMG es radicalmente distinta a los sistemas convencionales: el motor eléctrico no actúa sobre el mismo eje que el combustión sino de forma independiente sobre el eje trasero, generando un vectorizado de par eléctrico que mejora la agilidad en curva más allá de lo posible con mecánica convencional.

En Obsidian Black con el interior AMG Performance en Nappa bicolor Magma Grey/Black, este ejemplar de 2.800 km representa el acceso a la tecnología más avanzada del grupo Daimler en formato usable diariamente.`,
      equipment: [
        'Motor V8 AMG 4.0L 630 cv',
        'Motor eléctrico eje trasero 204 cv',
        'Batería AMG HPB 6.1 kWh',
        'Paquete Aerodynamics AMG',
        'Frenos cerámicos AMG carbono-cerámica',
        'Suspensión activa AMG ABC hidráulica',
        'Diferencial AMG RACE trasero activo',
        'Llantas AMG forjadas 21" Black Chrome',
        'Asientos AMG Performance Nappa',
        'Sistema Burmester 3D Surround 1.400W',
        'AMG Track Pace telemetría circuito',
        'Head-up Display AMG específico',
        'Cámaras 360° + Park Pilot Activo',
      ],
      images: [
        { url: img(IMG.mercedesamg), alt: 'Mercedes-AMG GT 63 S E Performance Obsidian', order: 0 },
        { url: img(IMG.bmwm),        alt: 'AMG GT 63 S perfil trasero dinámico',          order: 1 },
        { url: img(IMG.carinterior), alt: 'Interior AMG GT 63 Nappa Magma Grey/Black',    order: 2 },
      ],
      published_at: new Date().toISOString(),
    },

    // ── 9. Aston Martin DB11 Volante ──────────────────────────────────────
    {
      dealer_id:      dealerId,
      slug:           'aston-martin-db11-volante-2021-china-grey',
      vehicle_type:   'car',
      status:         'active',
      brand_name:     'Aston Martin',
      model_name:     'DB11 Volante',
      version:        'V8 AMG — Especificación Q by Aston Martin',
      year:           2021,
      mileage_km:     9800,
      condition_type: 'ocasion',
      fuel_type:      'gasoline',
      displacement_cc:3982,
      cylinders:      8,
      engine_config:  'V8 AMG biturbo (colaboración Daimler)',
      power_hp:       510,
      power_kw:       375,
      torque_nm:      675,
      zero_to_hundred:4.1,
      top_speed_kmh:  301,
      transmission:   'automatic',
      drive_type:     'rwd',
      weight_kg:      1870,
      color_exterior: 'China Grey',
      color_interior: 'Chestnut/Ivory Semi-Aniline Specification Q',
      upholstery:     'Semi-Aniline Q Bespoke',
      body_type:      'Volante (Cabrio Gran Turismo)',
      price:          199000,
      currency:       'EUR',
      is_negotiable:  true,
      is_featured:    false,
      is_exclusive:   false,
      has_service_history: true,
      financing_available: true,
      accepts_trade_in:    true,
      registration_country: 'ES',
      registration_year:   2021,
      location_province:   'Madrid',
      iva_deducible:   false,
      title: 'Aston Martin DB11 Volante V8 — China Grey — Q Specification — 9.800 km',
      description: `El DB11 Volante es el gran turismo descapotable que confirma la vigencia del concepto clásico del roadster de larga distancia en la era moderna. A diferencia de los roadsters de prestaciones puras, el Volante está diseñado para cruzar continentes con la capota bajada bajo el sol del Mediterráneo, con el mismo nivel de refinamiento que el coupé y sin la penalización típica de torsión que afecta a la mayoría de los convertibles.

El motor V8 AMG de 4.0 litros biturbo —fruto de la alianza estratégica entre Aston Martin y Daimler— entrega sus 510 cv con una curva de par plana y generosa que facilita la progresión a cualquier régimen. La tracción trasera exclusiva y la transmisión ZF de 8 velocidades conectan al conductor con la carretera de manera genuina.

La especificación Q by Aston Martin —el departamento de personalización de la casa— ha dotado a este ejemplar del exclusivo interior bicolor en cuero semi-anilina Chestnut y Ivory con alfombra Morland contrast. La capota eléctrica en tela acústica de triple capa opera en 14 segundos hasta 50 km/h.`,
      equipment: [
        'Motor V8 AMG 4.0L biturbo 510 cv',
        'Especificación Q by Aston Martin',
        'Interior semi-anilina Chestnut/Ivory',
        'Capota triple capa silenciada',
        'Tracción trasera RWD pura',
        'Transmisión ZF 8 velocidades',
        'Frenos carbono-cerámica (opcional)',
        'Suspensión adaptativa Skyhook',
        'Llantas forjadas 20" Galería',
        'Sistema audio Bang & Olufsen 1.000W',
        'Navegación con pantalla 10"',
        'Calefacción de asientos + cuello',
        'Certificado Aston Martin Approved',
      ],
      images: [
        { url: img(IMG.astonmartin), alt: 'Aston Martin DB11 Volante China Grey abierto', order: 0 },
        { url: img(IMG.black911),    alt: 'DB11 Volante lateral perfil',                  order: 1 },
        { url: img(IMG.carinterior), alt: 'Interior DB11 Q Chestnut/Ivory',               order: 2 },
      ],
      published_at: new Date().toISOString(),
    },

    // ── 10. Ducati Panigale V4 S ──────────────────────────────────────────
    {
      dealer_id:      dealerId,
      slug:           'ducati-panigale-v4s-2023-tricolor',
      vehicle_type:   'motorcycle',
      status:         'active',
      brand_name:     'Ducati',
      model_name:     'Panigale V4 S',
      version:        'Tricolor — Paquete Racing',
      year:           2023,
      mileage_km:     1800,
      condition_type: 'seminuevo',
      fuel_type:      'gasoline',
      displacement_cc:1103,
      cylinders:      4,
      engine_config:  'V4 90° Desmosedici Stradale (Desmodrómica)',
      power_hp:       214,
      power_kw:       157,
      torque_nm:      124,
      zero_to_hundred:2.8,
      top_speed_kmh:  299,
      transmission:   'manual',
      drive_type:     'rwd',
      weight_kg:      198,
      color_exterior: 'Tricolor (Bianco/Rosso/Verde) — Edición Italia',
      color_interior: null,
      upholstery:     null,
      body_type:      'Superbike',
      price:          34990,
      currency:       'EUR',
      is_negotiable:  false,
      is_featured:    false,
      is_exclusive:   false,
      has_service_history: true,
      financing_available: true,
      accepts_trade_in:    true,
      registration_country: 'ES',
      registration_year:   2023,
      location_province:   'Madrid',
      iva_deducible:   false,
      title: 'Ducati Panigale V4 S Tricolor 2023 — 214 cv — 1.800 km — Paquete Racing',
      description: `La Ducati Panigale V4 S representa el punto de convergencia entre la tecnología de las Desmosedici GP22 de MotoGP y una motocicleta homologada para circular. El motor Desmosedici Stradale de 1.103 cc V4 90° con distribución desmodrómica —el sistema que elimina los muelles de válvulas usando levas de apertura y cierre independientes— desarrolla 214 cv a 13.000 rpm con una progresión que no tiene equivalente entre las cuatro ruedas a ningún precio.

La edición Tricolor en los colores de la bandera italiana —Bianco Rosso Verde— reservada a los mercados europeos en tirada limitada añade un valor emocional y estético al rendimiento puro. El cuadro monocasco en aluminio bipartito, heredero directo del de las 1299 Panigale, contribuye a la cifra de peso en vacío de tan solo 198 kg.

El paquete Racing incluye quickshifter bidireccional DQS Evo, suspensión Öhlins NIX30 delantera y TTX36 trasera con amortiguador de dirección Öhlins, control de tracción Ducati Traction Control EVO 2, control de caballito, y el modo Race con Launch Control para salidas controladas al límite.`,
      equipment: [
        'Motor Desmosedici Stradale 1103cc V4',
        'Paquete Racing completo',
        'Suspensión Öhlins NIX30/TTX36',
        'Quickshifter bidireccional DQS Evo',
        'Control de tracción DTC EVO 2',
        'Control de caballito DWC EVO',
        'Launch Control LC EVO',
        'Frenos Brembo Stylema monobloc',
        'Edición Tricolor (Italia)',
        'Display TFT 5" full color',
        'Modo EBC Cornering ABS',
        'Cornering DTC vectorización par',
        'Historial oficial Ducati Madrid',
      ],
      images: [
        { url: img(IMG.ducati),     alt: 'Ducati Panigale V4 S Tricolor 2023 lateral',   order: 0 },
        { url: img(IMG.ferrari),    alt: 'Panigale V4 S detalle motor Desmosedici V4',   order: 1 },
        { url: img(IMG.lamborghini),alt: 'Ducati Panigale V4 S cockpit TFT',             order: 2 },
      ],
      published_at: new Date().toISOString(),
    },
  ]
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════')
console.log('  Black Series Premium Cars — Seed Script')
console.log('══════════════════════════════════════════════\n')

// Step 1: Crear auth user
console.log('1/7  Creando auth user…')
const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email:          DEALER_EMAIL,
    password:       DEALER_PASSWORD,
    email_confirm:  true,
    user_metadata:  { full_name: 'Black Series Premium Cars' },
  }),
  signal: AbortSignal.timeout(20000),
})
const authData = await authRes.json()
if (authRes.status >= 400) {
  if (authData?.message?.includes('already registered') || authData?.code === 'email_exists') {
    console.log('     ⚠  Usuario ya existía — recuperando ID…')
    // List users and find by email
    const listRes  = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, {
      headers, signal: AbortSignal.timeout(20000),
    })
    const listData = await listRes.json()
    const existing = (listData?.users || []).find(u => u.email === DEALER_EMAIL)
    if (!existing) throw new Error('No se pudo recuperar el usuario existente')
    authData.id = existing.id
    console.log(`     ✓  ID recuperado: ${existing.id}`)
  } else {
    throw new Error(`Auth failed: ${JSON.stringify(authData)}`)
  }
} else {
  console.log(`     ✓  User creado: ${authData.id}`)
}
const userId = authData.id

// Step 2: Esperar profile trigger y actualizar role
console.log('2/7  Configurando perfil…')
await new Promise(r => setTimeout(r, 1500)) // dar tiempo al trigger

// Upsert profile
const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
  method: 'PATCH',
  headers: { ...headers, 'Prefer': 'return=representation' },
  body: JSON.stringify({ role: 'dealer', full_name: 'Black Series Premium Cars', email: DEALER_EMAIL }),
  signal: AbortSignal.timeout(20000),
})
const profileData = await profileRes.json()
if (profileRes.status >= 400 || (Array.isArray(profileData) && profileData.length === 0)) {
  // Profile might not exist yet — insert
  await rpc('profiles', { id: userId, email: DEALER_EMAIL, full_name: 'Black Series Premium Cars', role: 'dealer' })
}
console.log('     ✓  Perfil configurado con role=dealer')

// Step 3: Generar logo
console.log('3/7  Generando logo del concesionario…')
const logoSvg = makeDealerLogo()
const logoWebp = await sharp(logoSvg)
  .resize(400, 400)
  .webp({ quality: 92 })
  .toBuffer()
console.log(`     ✓  Logo generado (${Math.round(logoWebp.length/1024)} KB)`)

// Step 4: Subir logo
console.log('4/7  Subiendo logo a Supabase Storage…')
const logoUrl = await uploadLogo(logoWebp, 'black-series-premium-cars.webp')
console.log(`     ✓  Logo URL: ${logoUrl}`)

// Step 5: Crear dealer
console.log('5/7  Creando registro dealer…')
let dealer
try {
  dealer = await rpc('dealers', {
    profile_id:       userId,
    slug:             'black-series-premium-cars',
    name:             'Black Series Premium Cars',
    description:      'Concesionario especializado en vehículos premium, deportivos y de colección en Madrid. Seleccionamos cada unidad por su historia, configuración y valor real, ofreciendo un servicio personalizado a compradores con criterio.\n\nMás de 15 años de experiencia en el sector del automóvil de alta gama nos han enseñado que el comprador premium no busca simplemente un vehículo: busca la unidad correcta, con el historial adecuado, la configuración precisa y el servicio que merece.\n\nTodos nuestros vehículos disponen de historial verificado, revisión técnica completa y garantía de procedencia. Financiación premium y gestión de consignación disponibles.',
    logo_url:         logoUrl,
    location_city:    'Madrid',
    location_region:  'Comunidad de Madrid',
    location_country: 'ES',
    address:          'Paseo de la Castellana, 200, 28046 Madrid',
    phone:            '+34 91 555 00 00',
    whatsapp:         '+34 666 000 111',
    email:            DEALER_EMAIL,
    website:          'https://www.blackseriespremiumcars.es',
    instagram:        '@blackseriespremiumcars',
    years_in_business: 15,
    status:           'active',
    subscription_plan:'professional',
    subscription_start_at: new Date().toISOString(),
    subscription_end_at:   new Date(Date.now() + 365*24*60*60*1000).toISOString(),
    vehicle_slots:    20,
    is_featured:      true,
    is_verified:      true,
    certifications:   ['Dealer Premium Verificado', 'Historial Certificado', 'Garantía Posventa'],
    admin_notes:      'Concesionario demo creado por seed script',
  })
  console.log(`     ✓  Dealer creado: ${dealer.id}`)
} catch (e) {
  // Puede que ya exista — recuperar
  if (e.message?.includes('duplicate') || e.message?.includes('unique')) {
    console.log('     ⚠  Dealer ya existe — recuperando…')
    const dr = await fetch(`${SUPABASE_URL}/rest/v1/dealers?slug=eq.black-series-premium-cars&select=*`, {
      headers, signal: AbortSignal.timeout(20000),
    })
    const dd = await dr.json()
    dealer = dd[0]
    if (!dealer) throw e
    // Update logo
    await patch('dealers', `slug=eq.black-series-premium-cars`, { logo_url: logoUrl, status: 'active', is_featured: true, is_verified: true })
    console.log(`     ✓  Dealer recuperado: ${dealer.id}`)
  } else throw e
}

// Step 6: Crear vehículos
console.log('6/7  Creando 10 vehículos premium…')
const vehicles = buildVehicles(dealer.id)
const results  = { ok: [], failed: [] }

for (const v of vehicles) {
  process.stdout.write(`     ${v.brand_name} ${v.model_name.padEnd(30)} `)
  try {
    await rpc('vehicles', v)
    results.ok.push(`${v.brand_name} ${v.model_name}`)
    console.log('✓')
  } catch (e) {
    if (e.message?.includes('duplicate') || e.message?.includes('unique')) {
      console.log('⚠ ya existe')
      results.ok.push(`${v.brand_name} ${v.model_name}`)
    } else {
      results.failed.push(`${v.brand_name} ${v.model_name}: ${e.message}`)
      console.log(`✗ ERROR: ${e.message.slice(0, 80)}`)
    }
  }
}

// Step 7: Resumen
console.log('\n══════════════════════════════════════════════')
console.log('  RESUMEN')
console.log('══════════════════════════════════════════════')
console.log(`\n  Vehículos creados: ${results.ok.length}/10`)
if (results.failed.length) {
  console.log(`  Fallidos:`)
  results.failed.forEach(f => console.log(`    ✗ ${f}`))
}
console.log(`
  ┌─────────────────────────────────────────────┐
  │  CREDENCIALES DE ACCESO AL DASHBOARD        │
  │                                             │
  │  URL:      https://black-series-market.     │
  │            vercel.app/login                 │
  │                                             │
  │  Email:    ${DEALER_EMAIL.padEnd(33)}│
  │  Password: ${DEALER_PASSWORD.padEnd(33)}│
  │                                             │
  │  Perfil:   /dealers/black-series-           │
  │            premium-cars                     │
  └─────────────────────────────────────────────┘
`)
