<!-- Auditoría producida por la dirección black-series-ceo (Claude Opus 5) + Codex GPT-5.6 Sol, 2026-08-10.
     Fase 1 = auditoría en modo lectura. NADA ejecutado sobre BD ni repo. Plan pendiente de aprobación. -->

# Auditoría ejecutiva de perfiles ficticios de Black Label Market

**Fecha de análisis:** 10 de agosto de 2026  
**Alcance:** repositorio, `out-dealers.json` y `out-vehiculos.json`, en modo lectura. No se ha modificado nada.

## Estándar derivado

Black Label Market no se presenta como un clasificado de volumen, sino como una selección de vehículos excepcionales de profesionales verificados (`docs/guia-copy-black-label.md:7-14`). Su comprador tiene poca tolerancia al riesgo y al ruido; busca una unidad correcta, información precisa y un profesional responsable (`docs/guia-copy-black-label.md:22-30`).

La prueba de ese posicionamiento debe ser visible: criterios de selección, historial, estado, fotografía cuidada y un vendedor identificable (`docs/guia-copy-black-label.md:61-71`). La guía prohíbe el relleno, la urgencia artificial, el foco en precio y la apariencia generalista (`docs/guia-copy-black-label.md:75-81`, `docs/guia-copy-black-label.md:101-107`).

Los planes no justifican una calidad menor:

- Essential incluye perfil verificado, activación premium e inventario inicial; permite hasta 15 vehículos (`docs/planes-suscripcion-definitivos.md:19-36`).
- Professional permite hasta 50 vehículos (`docs/planes-suscripcion-definitivos.md:47-64`).
- Elite permite hasta 100, pero la propia regla interna indica un máximo guía de 20 % de showrooms activos (`docs/planes-suscripcion-definitivos.md:70-90`).
- Grupo se plantea para cuatro o más sedes y sigue pendiente de confirmación (`docs/planes-suscripcion-definitivos.md:140-142`).

### Qué considera el repo premium o publicable

`lib/vehicle-categories.ts:1-37` admite deportivos, superdeportivos, berlinas/compactos/familiares, SUV premium, lujo, clásicos y unidades especiales. El perímetro no es solo supercars: incluye Audi A3, BMW Serie 3, Mercedes Clase C o Tesla Model 3.

`lib/brands.ts:3-25` no define una lista de marcas premium ni bloquea publicaciones: solo resuelve el nombre canónico de una marca desde la tabla `brands`. Por tanto, no es una barrera editorial.

`lib/vehicle-query.ts:26-94` solo aplica filtros opcionales solicitados por el comprador. No valida imágenes, calidad de copy, equipamiento, marca, estado del dealer ni completitud.

### Criterio operativo de aceptación

El repo no establece mínimos numéricos. Para auditar, el estándar operativo derivado es:

Un showroom pasa por real si:

1. Nombre, ciudad, especialidad y antigüedad son coherentes y no contienen QA, TEST, “ficticia” ni errores de codificación.
2. Está verificado y cuenta con logo, portada, descripción editorial, teléfono y canales públicos utilizables.
3. Las URLs no son dominios reservados, perfiles inexistentes ni enlaces falsos.
4. El stock encaja con la especialidad y el plan; una boutique demo creíble tiene normalmente 4-8 unidades activas, no el límite exacto del plan.
5. Elite no supera el 20 % de activos; Grupo solo existe si representa varias sedes reales.

Una ficha pasa por real si:

1. Marca, modelo, versión, año y precio son defendibles y usan nomenclatura real.
2. La descripción explica procedencia, historial, mantenimiento, estado, configuración y motivo de selección; no basta con 100-200 caracteres.
3. El equipamiento es específico y las señales de confianza no se aplican masivamente sin evidencia.
4. Tiene cinco imágenes inequívocas del mismo vehículo o, en demo, del mismo modelo: frontal, trasera, lateral, interior y detalle; sin reutilización entre marcas.
5. Su categoría coincide con la taxonomía pública.

Con este estándar, el resultado es **0 perfiles `OK`**. `Black Series Premium Cars` es la mejor referencia editorial, pero no supera el control fotográfico.

## Verificación del catálogo público

### Conclusión

**Sí: los 165 vehículos activos de `TEST-VerifTier` son visibles en el catálogo público. Es el fuego a apagar primero.**

No puedo afirmar cuáles entran en la primera página sin consultar `is_featured` y `published_at`, pero sí que son elegibles para resultados paginados, contadores y filtros.

### Traza exacta

1. `/coches` consulta `vehicles`, selecciona el dealer como relación y exige únicamente `status='active'` y `vehicle_type='car'`: `app/(public)/coches/page.tsx:72-80`.

2. `/motos` hace lo mismo para motos: `app/(public)/motos/page.tsx:71-79`.

3. `applyVehicleFilters` solo añade filtros opcionales; no existe exclusión por nombre del dealer, QA, TEST, imágenes, descripción, equipamiento o completitud: `lib/vehicle-query.ts:26-94`.

4. La paginación recupera 24 resultados; el reordenado por plan ocurre después de obtener esa página y no elimina QA: `app/(public)/coches/page.tsx:82-94`, `app/(public)/motos/page.tsx:81-93`.

5. Las landings temáticas repiten el mismo patrón. Deportivos: `app/(public)/coches/deportivos/page.tsx:27-37`. Motos deportivas: `app/(public)/motos/deportivas/page.tsx:27-37`.

6. Las fichas individuales permiten vehículos cuyo dealer esté en `trial` o `active`: `app/(public)/coches/[slug]/page.tsx:58-68` y `app/(public)/motos/[slug]/page.tsx:58-68`.

El directorio de showrooms agrava el problema: incluye dealers `trial` y `active`, sin eliminar los que tienen cero vehículos (`app/(public)/dealers/page.tsx:41-45`, `app/(public)/dealers/page.tsx:67-95`). La ficha individual de dealer también admite ambos estados (`app/(public)/dealers/[slug]/page.tsx:75-87`).

### Magnitud y discrepancia de control

Los tres testers aportan:

- Elite: 100 públicos.
- Professional: 50 públicos.
- Essential: 15 públicos.

Total: **165 vehículos públicos**, todos sin fotos, descripción ni equipamiento.

El export suma **279 vehículos totales y 271 públicos**, mientras que el brief indica 278. `out-vehiculos.json` contiene 111 no-QA, coherente con 279 - 168 vehículos de los tres testers. Los QA son el 59,1 % del total y el 60,9 % del catálogo público.

Antes de limpiar, debe repetirse una consulta de control: el brief y el export discrepan en una unidad.

## Tabla de veredictos por dealer

| Dealer | Veredicto | Justificación breve |
|---|---|---|
| `[TEST E2E] RS Black Cars Premium Verificación` | **BORRAR** | Trial, nombre E2E, cero vehículos y texto de prueba. El logo y las certificaciones no rescatan una identidad explícitamente técnica. |
| Atlantic Collectors Garage | **COMPLETAR** | Buena base: 5 públicos, perfil de 217 caracteres, fichas de media 189, 7 elementos de equipamiento y canales completos. Falta logo, hay 1 foto por vehículo y la web es `.example`. |
| Barcelona Grand Touring | **COMPLETAR** | 5 públicos, perfil de 238 caracteres, fichas de 194 y equipamiento 7. Falta logo, hay 1 foto por unidad y enlaces demo. |
| Bilbao Heritage Motorcycles | **COMPLETAR** | 5 motos, perfil de 197 caracteres, fichas de 179, equipamiento 7, antigüedad coherente y canales completos. Falta logo, fotos adicionales y enlaces reales. |
| Black Series Premium Cars | **COMPLETAR** | Referencia editorial: perfil 646, logo, portada, canales, fichas de media 1.019 caracteres, 13 elementos de equipamiento y 3 fotos. No es OK: usa Unsplash genérico y fotos repetidas entre modelos. |
| Clasicos Sevilla | **RECONSTRUIR** | Concepto válido, pero perfil de 123, sin logo, WhatsApp, web ni Instagram. Sus 3 fichas tienen fotos Unsplash cruzadas, copy de media 135 y equipamiento cero. |
| Costa Blanca Classics | **COMPLETAR** | Essential creíble: 5 públicos, perfil 233, fichas de 198, equipamiento 7 y canales completos. Falta logo, fotos adicionales y sustituir `.example`. |
| Dubai Wheels | **RECONSTRUIR** | “Dubai” en Marbella es incoherente. Perfil 115, sin logo ni presencia digital; 3 coches con copy de media 116, equipamiento cero y fotos repetidas entre Bentley y Rolls-Royce. |
| Ducati Barcelona Corse | **COMPLETAR** | Perfil coherente, logo, 5 motos, fichas de media 183 y equipamiento 7. Solo 1 foto por moto; la web y redes requieren sustitución o retirada. |
| Elektro Motion | **RECONSTRUIR** | Solo 2 coches, 2 años, no verificado, perfil 125 y sin logo ni presencia digital. Fotos genéricas, copy 129 y equipamiento cero. El concepto eléctrico premium sí sirve. |
| `espinacas motors` | **BORRAR** | Suspendido, ciudad “juarez”, nombre impropio, sin plan, descripción, branding ni stock. No hay concepto recuperable. |
| Gran Turismo Barcelona | **RECONSTRUIR** | Nombre válido, pero perfil 123, sin logo ni canales; 3 vehículos, copy de media 137, equipamiento vacío y fotografía cruzada entre marcas. |
| Harley & Custom Valencia | **RECONSTRUIR** | Concepto útil y 6 motos, pero perfil 144, sin logo ni canales; fichas de 141 caracteres, equipamiento cero y 30 referencias Unsplash repetidas. |
| `heavy metal cars and motos` | **BORRAR** | Trial, ciudad en minúsculas, sin plan, descripción, branding ni stock. No encaja con el posicionamiento premium. |
| KTM Adventure Madrid | **RECONSTRUIR** | 7 motos y nicho defendible, pero no verificado, perfil 118, sin logo ni presencia digital. Equipamiento vacío, fotos cruzadas y una ZXR 750 con versión errónea. |
| Marbella Adventure Moto | **COMPLETAR** | 5 motos, perfil 208, fichas de 177, equipamiento 7 y canales completos. Falta logo, más fotos y enlaces públicos reales. |
| Motorrad Haus | **RECONSTRUIR** | 9 motos, perfil 138, sin logo ni canales; copy 151, equipamiento vacío y 45 referencias Unsplash repetidas. Stock demasiado heterogéneo para un especialista BMW. |
| Motos Barcelona | **RECONSTRUIR** | Nombre genérico, perfil 109, sin logo ni canales; 8 motos, copy 144, equipamiento vacío y 40 referencias Unsplash repetidas. |
| Nero Madrid Performance | **COMPLETAR** | 5 coches, perfil 250, fichas de 207 caracteres, 7-8 elementos de equipamiento y canales completos. Falta logo, más fotos, reemplazar `.example` y revisar Elite. |
| OrgFix Motors QA | **BORRAR** | Trial, nombre QA, cero descripción, branding y stock. Artefacto técnico. |
| RS PRUEBA FICTICIA | **BORRAR** | Está activo y el nombre declara que es ficticio. Tiene perfil trabajado, pero cero stock y riesgo comercial inmediato. |
| Scuderia Madrid | **RECONSTRUIR** | Concepto válido, pero perfil 118, sin logo, web ni Instagram; 3 coches, equipamiento cero y fotografías cruzadas. El SF90 a 680.000 € requiere revisión. |
| Sevilla Custom & Icons | **COMPLETAR** | 5 motos, perfil 210, fichas de 177, equipamiento 7 y canales completos. Falta logo, fotos adicionales y enlaces reales. |
| Sierra Norte 4x4 Premium | **COMPLETAR** | 5 SUV, perfil 225, fichas de 191, equipamiento 7 y canales completos. Falta logo, fotos adicionales y sustituir `.example`. |
| SuperCars BCN | **RECONSTRUIR** | Solo 3 vehículos, 3 años, no verificado, perfil 126 y sin logo ni canales. El plan Grupo no es creíble sin cuatro sedes reales. |
| Taragoña premium cars | **RECONSTRUIR** | Trial, sin plan, descripción, branding ni stock. Puede conservar cobertura gallega, pero debe rehacerse desde cero; si no es estratégica, borrar. |
| TEST-VerifTier-Elite | **BORRAR** | 101 vehículos, 100 públicos, cero fotos/descripciones/equipamiento, ciudad “QA Test” y exactamente el límite Elite. Además está destacado. |
| TEST-VerifTier-Essential | **BORRAR** | 16 vehículos, 15 públicos, cero fotos/descripciones/equipamiento y exactamente el límite Essential. |
| TEST-VerifTier-Professional | **BORRAR** | 51 vehículos, 50 públicos, cero fotos/descripciones/equipamiento y exactamente el límite Professional. |
| Valencia Track Bikes | **COMPLETAR** | 5 motos, perfil 206, fichas de 193, equipamiento 7 y canales completos. Falta logo, ampliar fotografía y sustituir `.example`. |
| Velvet Motors Madrid | **RECONSTRUIR** | Buena carcasa de perfil —logo, portada, web e Instagram—, pero solo 1 de 4 vehículos está activo; dos no tienen fotos, tres tienen copy pobre, todos equipamiento vacío y dos versiones contienen `(QA)`. |

**Resumen:** 8 `BORRAR`, 12 `RECONSTRUIR`, 11 `COMPLETAR`, 0 `OK`.

## Incoherencias detectadas

### Perfiles de trial visibles y vacíos

`/dealers` muestra dealers en `trial` y `active` sin exigir stock activo (`app/(public)/dealers/page.tsx:67-95`). Esto hace visibles perfiles vacíos y de prueba como `[TEST E2E]`, `OrgFix Motors QA`, `heavy metal cars and motos` o `Taragoña premium cars`.

### Enlaces `.example` visibles

La migración de los perfiles mejor construidos usa webs como:

- `nero-madrid-performance.example`
- `costa-blanca-classics.example`
- `barcelona-grand-touring.example`
- `sierra-norte-4x4.example`
- `atlantic-collectors.example`

Aparecen en `supabase/migrations/041_seed_demo_showrooms.sql:25-205`. La ficha pública renderiza los enlaces sociales y de web (`app/(public)/dealers/[slug]/page.tsx:405-416`).

Un profesional que pulse uno de esos enlaces detectará el relleno inmediatamente. Deben retirarse o sustituirse antes de cualquier visita.

### Taxonomía incompatible con las categorías públicas

Los 50 vehículos con imagen local usan categorías como:

- `supercar`
- `sport_performance`
- `classic`
- `luxury_gt`
- `luxury_suv`
- `moto_sport`
- `moto_adventure`
- `moto_touring`

La migración los inserta sin normalización (`supabase/migrations/041_seed_demo_showrooms.sql:398-466`, `supabase/migrations/041_seed_demo_showrooms.sql:469-510`).

Sin embargo, las páginas públicas esperan valores como:

- `deportivos`
- `superdeportivos`
- `clasicos`
- `lujo_alta_gama`
- `suv_premium`
- `deportivas`
- `trail_premium`

Por ejemplo: `app/(public)/coches/deportivos/page.tsx:14-18` y `app/(public)/motos/deportivas/page.tsx:14-18`.

Consecuencia: esos vehículos pueden aparecer en el listado general, pero desaparecer de landings y filtros por categoría.

### Distribución de planes

Hay 13 Elite entre 31 dealers y 10 Elite entre los 26 activos: **38,5 %**. La propia regla interna recomienda un máximo de 20 % (`docs/planes-suscripcion-definitivos.md:70-90`).

Incluso eliminando los nombres claramente de QA, quedan 8 Elite entre 22 activos: 36,4 %.

Además, los tres testers llenan exactamente los límites de 15, 50 y 100 vehículos públicos. Es una huella inequívoca de QA, no una densidad de stock real.

### Patrón de inventario artificial

Diez dealers tienen exactamente 5 unidades activas; cinco tienen exactamente 3. Individualmente es plausible, pero en conjunto resulta sintético.

La selección final debería tener variación:

- Boutiques pequeñas: 3-5 unidades.
- Especialistas: 5-8 unidades.
- Perfil de referencia: 6-10 unidades.
- Alguna unidad reservada, pausada o recién incorporada, bien señalizada.

### Afirmaciones de confianza aplicadas masivamente

Los 50 vehículos de la migración local reciben sistemáticamente:

- `has_carfax=true`
- `has_service_history=true`
- garantía
- financiación
- aceptación de vehículo

Esto ocurre en `supabase/migrations/041_seed_demo_showrooms.sql:503-527`.

Que todos los clásicos, supercars y motos de diez dealers compartan idénticas garantías y señales de confianza no es creíble. La guía exige demostración, no badges decorativos.

### Errores de nomenclatura de modelo

- `Ferrari 488 Pista` con versión `Pista Spider Package`: el 488 Pista Spider es un modelo propio, no un paquete del coupé. [Ferrari 488 Pista Spider](https://www.ferrari.com/es-ES/auto/ferrari-488-pista-spider)

- `Ferrari F8 Tributo` con versión `Spider`: Ferrari diferencia F8 Tributo y F8 Spider; el catálogo interno también los separa (`supabase/migrations/035_seed_models_catalog.sql:35`). [Comunicado oficial F8 Spider](https://www.ferrari.com/content/dam/ferrari-fcom/old/pdf/pr_ferrari_f8_spider_gbr.pdf)

- `Ducati Panigale V4 S`, año 2023, versión `Tricolor`: la denominación oficial Panigale V4 Tricolore se vincula a los éxitos de 2024; esa combinación requiere corrección. [Ducati Panigale V4 Tricolore](https://www.ducati.com/ww/en/stories/bikes-and-beyond/panigale-v4-tricolore-a-tribute-to-italian-excellence)

- `Kawasaki ZXR 750`, año 1994, versión `H2`: el catálogo Kawasaki identifica la ZXR750 de 1994 como `ZX750-L2`; H2 corresponde a una generación anterior. [Catálogo Kawasaki ZXR750 1994](https://www.pieces-kawa.com/kawasaki-moto/750-MOTOS/1994/ZXR750)

- `Renault 5 Turbo`, versión `Copa`: mezcla denominaciones con valores y arquitectura distintos. Debe validarse como Turbo, Turbo 2, Maxi o Copa Turbo con documentación. [Museo Renault 5 Turbo](https://theoriginals.renault.com/r5-turbo)

- Hay inconsistencias de canon como `F430` + `Scuderia` frente a `430 Scuderia`, que sí aparece como modelo separado en el catálogo interno (`supabase/migrations/035_seed_models_catalog.sql:43`), además de `Huracan` y `Huracán`.

### Precios

No hay precios ausentes y la mayoría son plausibles a primera vista, pero hay dos outliers claros que deben revisarse:

- Ferrari SF90 Stradale Assetto Fiorano 2023, 1.200 km, 680.000 €. Referencias públicas recientes de unidades 2022-2023 de bajo kilometraje se sitúan aproximadamente entre 369.900 y 479.900 €. No es una tasación, pero el valor demo parece sobredimensionado. [Muestra de mercado](https://gebrauchtwagen.autobild.de/a-z/ferrari/ferrari-sf90-stradale/), [unidad 2023](https://www.willhaben.at/iad/gebrauchtwagen/d/auto/ferrari-sf90-stradale-assetto-fiorano-atelier-viola-ho-1490620151/)

- Porsche Carrera GT 2005, 18.500 km, 1.190.000 €. Una referencia contemporánea para un Carrera GT 2005 aparece en 2.775.000 €. Una sola oferta no fija mercado, pero la diferencia obliga a revisar precio, procedencia y kilometraje. [mobile.de Carrera GT 2005](https://suchen.mobile.de/auto/porsche-carrera-gt-2005.html)

También parece artificial que dos Porsche 911 GT3 RS 2024 de dealers distintos estén a 329.800 y 329.900 €, con kilometrajes igualmente bajos. Cada ficha debe justificar precio mediante configuración, IVA, origen, historial y estado, conforme a `docs/guia-copy-black-label.md:80-81`.

### Kilometraje y encaje premium

No hay kilometrajes matemáticamente imposibles. El problema es documental:

- Concentración de unidades 2023-2024 en 320, 450, 800, 900, 1.200 o 1.800 km.
- Clásicos con cifras redondas como 45.000, 62.000, 89.000 o 98.000 km sin explicar lectura de odómetro, trazabilidad o reconstrucción.

Golf R 20 Years, Cupra Formentor VZ5, Royal Enfield 650, Cagiva Mito o Honda VFR 800 pueden encajar porque la plataforma admite futuros clásicos, ediciones especiales y motos de entusiasta. Lo que no encaja es publicarlos con fotografía genérica, copy corto y equipamiento vacío: así parecen inventario generalista.

### Fotografía

De 330 referencias:

- 270 son Unsplash: 81,8 %.
- 50 son locales: 15,2 %.
- 10 son Supabase Storage: 3,0 %.
- Solo existen 114 URL únicas.
- Hay 40 grupos de URL duplicadas, que suman 256 de las 330 referencias.
- Una misma foto de moto llega a aparecer en 21 fichas de marcas distintas.
- Hay 10 `alt` vacíos; muchos otros son genéricos, como `BMW Motorrad - foto 1`.

El problema no es solo de variedad: las galerías afirman visualmente que vehículos diferentes son la misma unidad.

## Recomendación sobre fotos

### Decisión

**Recomiendo ampliar la biblioteca local con sets específicos por modelo y trazabilidad de licencia; reducir temporalmente el catálogo a las unidades con imagen correcta. No recomiendo seguir con Unsplash como solución de demostración.**

La secuencia recomendada:

1. Ocultar cualquier vehículo sin imagen inequívocamente correcta.
2. Conservar como base los 50 vehículos con `/images/demo/vehicles/*.webp`, tras verificar origen y licencia.
3. Crear cinco imágenes por vehículo: frontal 3/4, trasera 3/4, lateral, interior y detalle.
4. Mantener un manifiesto: modelo, fuente, autor/proveedor, URL original, licencia, fecha, restricciones y responsable de validación.
5. Si no hay cinco imágenes válidas, reducir catálogo antes que rellenar con fotos de otra marca.

| Opción | Coste | Credibilidad | Riesgo legal/comercial | Veredicto |
|---|---:|---:|---:|---|
| Biblioteca local específica por modelo | Alto: 5-10 jornadas para 250-300 recursos visuales | Alta | Controlable solo con licencia documentada; guardar local no crea derechos | **Recomendada** |
| Unsplash único por vehículo | Bajo: 0,5-1 jornada | Baja | La licencia de copyright permite uso comercial, pero no limpia automáticamente marcas, logos, personas o propiedad | **Descartar** |
| Reducir a imágenes correctas existentes | Muy bajo | Media-alta en tarjetas; insuficiente para ficha si solo hay 1 foto | Bajo únicamente si la licencia actual está documentada | **Contención inmediata** |

Unsplash permite usos comerciales de sus imágenes, pero sus términos excluyen automáticamente derechos sobre marcas, logos, personas y obras visibles. [Licencia](https://unsplash.com/license), [términos](https://unsplash.com/terms), [releases y marcas](https://help.unsplash.com/en/articles/2612329-releases-and-trademarks).

No recomiendo descargar imágenes de fabricantes o anuncios reales sin permiso. Tampoco usar IA sin validación experta: puede inventar faros, llantas, interiores o generaciones. Si se usa IA para demo, debe validarse modelo por modelo y no presentarse como fotografía de la unidad física ofertada.

## Plan por fases con esfuerzo

### Tamaño objetivo

La hipótesis es correcta: menos perfiles completos es mejor que muchos vacíos.

- **Objetivo publicable:** 12 showrooms y 60 vehículos activos.
- **Mínimo para una visita urgente:** 10 showrooms y 36 vehículos completos.
- **Distribución para 12 perfiles:** 2 Elite, 7 Professional y 3 Essential.
- **Grupo:** 0 hasta que existan cuatro o más sedes reales.

Si solo se consiguen fotografías correctas para 36 unidades, deben publicarse 36. No mantener 60 con relleno.

### Fase 0. Contención inmediata

**Esfuerzo:** 2-4 horas.  
**Antes de la primera visita:** imprescindible.

- Repetir conteos y resolver la discrepancia 278/279.
- Despublicar los 165 vehículos `TEST-VerifTier`.
- Sacar del directorio los 8 dealers `BORRAR`.
- Ocultar temporalmente perfiles `RECONSTRUIR` y fichas sin imagen correcta.
- Retirar `.example`, handles falsos y datos de contacto que fallen al probarse.
- Invalidar la caché pública de cinco minutos; el catálogo usa ISR (`app/(public)/coches/page.tsx:6-7`, `app/(public)/motos/page.tsx:6-7`).

**Criterio de salida:** buscar TEST, QA, PRUEBA o “QA Test” devuelve cero; `/dealers` no muestra perfiles vacíos.

### Fase 1. Selección del perímetro demo

**Esfuerzo:** 0,5-1 jornada.  
**Antes de la primera visita:** imprescindible.

Base recomendada:

- Black Series Premium Cars
- Atlantic Collectors Garage
- Barcelona Grand Touring
- Bilbao Heritage Motorcycles
- Costa Blanca Classics
- Ducati Barcelona Corse
- Marbella Adventure Moto
- Nero Madrid Performance
- Sevilla Custom & Icons
- Sierra Norte 4x4 Premium
- Valencia Track Bikes
- Clasicos Sevilla, reconstruido

Seleccionar cinco vehículos defendibles por perfil, con variación razonable de stock y cobertura de coches, motos, clásicos, SUV, supercars y especialidades.

### Fase 2. Normalización de datos y categorías

**Esfuerzo:** 1-2 jornadas.  
**Antes de la primera visita:** imprescindible.

- Mapear categorías internas a taxonomía pública.
- Corregir modelos, versiones, años, tildes y `(QA)`.
- Validar precios con dos referencias de mercado por unidad crítica.
- Individualizar historial, garantía, IVA, financiación, propietarios y kilometraje.
- Corregir URLs y `alt`.

**Criterio de salida:** cada ficha aparece en listado general, landing de categoría y búsqueda correcta.

### Fase 3. Identidad y copy

**Esfuerzo:** 4-6 jornadas para 12 perfiles y 60 fichas.  
**Antes de la primera visita:** imprescindible al menos para el mínimo 10/36.

- Completar logo, portada, descripción, especialidad y contacto verificable.
- Redactar fichas de 500-900 caracteres.
- Añadir 7-12 elementos de equipamiento específicos.
- Variar el stock entre 3 y 8 unidades por showroom.
- Revisar tono contra `docs/guia-copy-black-label.md`.

**Criterio de salida:** ningún perfil depende de frases genéricas para parecer profesional.

### Fase 4. Biblioteca fotográfica

**Esfuerzo:** 5-10 jornadas para 60 sets.  
**Antes de la primera visita:** imprescindible para toda ficha visible.

- Crear o licenciar cinco imágenes coherentes por unidad.
- Validar visualmente carrocería, versión, interior y detalles.
- Impedir reutilización de una URL o hash entre vehículos distintos.
- Completar `alt` con modelo, versión y vista.
- Registrar licencia y procedencia.

**Criterio de salida:** cero fotografías cruzadas, cero fichas con menos de cinco vistas y cero licencias desconocidas.

### Fase 5. Ensayo comercial y QA final

**Esfuerzo:** 0,5-1 jornada.  
**Antes de la primera visita:** imprescindible.

- Recorrer en móvil y escritorio la portada, `/coches`, `/motos`, filtros, landings, directorio, 12 perfiles y una ficha de cada uno.
- Pulsar web, Instagram, teléfono y WhatsApp.
- Buscar TEST, QA, precios extremos, vehículos sin imagen y dealers sin stock.
- Navegar páginas 2-4 para confirmar que no reaparece QA.
- Congelar un checklist de aprobación antes de cada importación.

**Criterio de salida:** una persona ajena al proyecto puede navegar 15 minutos sin encontrar una señal inequívoca de relleno.

### Qué puede esperar

Puede esperar:

- Reconstruir los 12 dealers descartados del escaparate.
- Ampliar el inventario más allá de 60 unidades.
- Automatizar feeds.
- Crear perfiles Grupo.
- Completar redes sociales secundarias.

No puede esperar:

- Retirar QA.
- Quitar enlaces `.example`.
- Corregir categorías incompatibles.
- Corregir modelos y precios críticos.
- Resolver fotografía de las fichas que se mostrarán.
- Ocultar perfiles vacíos de trial.

**Estimación total para 12 showrooms y 60 vehículos:** 11-20 jornadas-persona, dominadas por fotografía y revisión editorial.  
**Mínimo 10/36 para una visita urgente:** 6-10 jornadas-persona si ya se dispone de derechos sobre las imágenes.
