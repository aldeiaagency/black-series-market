# Limpieza del catálogo demo — 2026-08-10

> Ejecución del plan derivado de [`auditoria-perfiles-demo-2026-08-10.md`](auditoria-perfiles-demo-2026-08-10.md).
> Objetivo: dejar el market presentable para enseñarlo en visitas comerciales a concesionarios reales.
> Dirección: Claude (Opus 5) orquestando · Codex GPT-5.6 (Sol para copy, Terra para datos e imágenes).

## Resultado medido

| Indicador | Antes | Después |
|---|---:|---:|
| Vehículos públicos | 271 | 61 |
| Públicos **sin ninguna foto** | 166 (61,3 %) | **0** |
| Públicos sin descripción | 165 | **0** |
| Con categoría pública válida | **0** | **61** |
| Longitud media de descripción | 293 car. | ~775 car. |
| Fotos genéricas de Unsplash | 270 refs, 114 URLs únicas | **0** |
| Showrooms visibles | 31 | 12 |
| Showrooms con logo | 2 | 12 |
| Equipamiento sin tildes | 35 de 61 | **0** |
| Dominios `.example` visibles | 10 perfiles | **0** |

## Qué se hizo, por fases

**Fase 0 — Contención.** Despublicados los 165 vehículos de los tres dealers `TEST-VerifTier-*`
(ciudad "QA Test", cero fotos y cero descripción) y retirados 8 perfiles de prueba, incluido uno llamado
literalmente `RS PRUEBA FICTICIA` que estaba **activo**. Nada se borró: solo cambios de estado
(`vehicles → draft`, `dealers → suspended`), reversibles.

**Fase 1 — Perímetro.** 12 showrooms de escaparate con 61 vehículos, en lugar de 31 perfiles desiguales.
Los 10 restantes quedan ocultos hasta reconstruir contenido y fotografía.

**Fase 2A — Normalización.** Los 61 vehículos tenían valores de `category` inexistentes en la taxonomía
pública (`supercar`, `moto_sport`…), de modo que **ninguna ficha aparecía en las páginas de categoría ni en
los filtros**: estaba roto para el 100 % del catálogo. Corregido uno a uno. Además: par, 0-100 y velocidad
punta completados con cifras reales del modelo; nomenclatura corregida (`430 Scuderia`, `488 Pista Spider`,
`5 Turbo 2`, `Huracán`); precio del Porsche Carrera GT ajustado a mercado.

**Fase 2B/2D — Copy.** Descripciones reescritas a 500-900 caracteres con datos concretos de cada unidad.
Perfiles de showroom completados (servicios, certificaciones, código postal, nota de atención, canales).
Los tres escaparates usan **todos** los campos disponibles.

**Fase 3 — Imágenes.** 100+ fotografías generadas por modelo concreto, con notas de fidelidad por unidad
(que el M3 sea Touring y no berlina, que el 488 Pista sea Spider, que el 430 Scuderia sea coupé). Subidas a
Supabase Storage en WebP (~80 KB frente a ~2 MB en PNG), con `alt` descriptivo por vista. Más instalaciones
de showroom, portadas propias y 12 logotipos.

## Decisiones de criterio

- **Menos perfiles completos antes que muchos vacíos.** 12 showrooms bien terminados en vez de 31 desiguales.
- **1-2 fotos correctas valen más que 5 equivocadas.** Lo que destruye credibilidad no es una ficha con
  pocas fotos, sino una ficha con la foto de otro coche. 40 vehículos conservan su única imagen correcta.
- **Fotografía generada, no de stock.** Se descartó Wikimedia Commons: acierta el modelo pero entrega fotos
  de circuito o salón, con público, quitamiedos y hasta la marca de otro concesionario en la puerta.
- **Enlaces web ficticios permitidos** (decisión del dueño), pero con dominios `.es` verosímiles en lugar de
  `.example`, que se lee como relleno en el propio texto del enlace.

## Fallos detectados en QA que no llegaron a producción

Estos se pararon antes de aplicarse, y conviene recordarlos porque volverán a pasar:

1. **Acentos destruidos.** Un fichero SQL generado traía 639 acentos convertidos en `?` literales
   (`a?o`, `adem?s`): el script intermedio escribió con la codificación por defecto de Windows (cp1252).
   No es mojibake recuperable, es pérdida de información. **Siempre escribir UTF-8 explícito.**
2. **Valores de enum en el texto visible.** Se coló `semi_automatic` dentro de una descripción.
3. **Etiqueta DGT inválida.** Se usó `'Sin etiqueta'` para clásicos: correcto de hecho, pero ese valor no
   existe en el filtro (solo `0`, `ECO`, `C`, `B`) y habría roto la búsqueda. Se dejó a `NULL`.
4. **Especialidades incoherentes.** Se asignaron las 8 especialidades a un showroom que solo vende coches,
   incluidas `motorcycle` y `custom`. Un especialista en todo no es especialista en nada.
5. **Copy de plantilla.** Las 61 descripciones compartían estructura ("se ofrece como…", "Se incorpora a…").
   Reescritas con límite duro de 6 apariciones por construcción.

## Trampa operativa a recordar

**Los filtros de `status = 'active'` no bastan.** La ficha pública de showroom muestra también vehículos en
`paused` y `sold` (`app/(public)/dealers/[slug]/page.tsx`). Varias unidades con fotos incorrectas —y un
`Porsche 911 Carrera S (QA)`— seguían visibles precisamente por eso. Cualquier limpieza futura debe barrer
`paused` y `sold`, no solo `active`.

**La caché ISR es de 5 minutos** (`revalidate = 300`) en catálogo, categorías, fichas y showrooms. Tras
cualquier cambio en base de datos, la web tarda hasta 5 minutos en reflejarlo. No es un fallo.

## Pendiente

- Reconstruir los 10 showrooms que quedaron fuera del perímetro, si se quiere ampliar el escaparate.
- Los dos GT3 RS 992 Weissach de dealers distintos siguen siendo un patrón poco natural (colores distintos
  ya, pero misma unidad y año).
- Densidad de stock aún algo uniforme entre perfiles.
