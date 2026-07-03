# 06 · Auditoría SEO / GEO — Black Label Market

> Auditoría **desde cero** contra el código real (App Router, Next.js 14.2). Fecha: 2026-07-03.
> Verificada también contra producción en solo lectura: `robots.txt` (`Disallow: /`) y `sitemap.xml` (173 URLs) en `blacklabelmarket.es`.
> Alcance: SEO técnico + on-page + datos estructurados + arquitectura/silo + GEO (citabilidad por motores de IA).
> **No** cubre seguridad, rendimiento ni UX (ver informes hermanos en `docs/auditoria-total-2026-07/`).
> Estado del sitio: **EN PRODUCCIÓN con `noindex` global activo** hasta tener stock real.

---

## Resumen ejecutivo

La base SEO/GEO del proyecto es **sólida y muy por encima de la media** de un marketplace en esta fase:

- **Datos estructurados excelentes y variados**: `Organization` + `WebSite` (con `SearchAction`) globales; `Car` / `Motorcycle` + `Offer` en fichas; `AutoDealer` en showrooms; `ItemList` en listados y categorías; `BreadcrumbList` en casi todo; `Article` + `FAQPage` en guías; `HowTo` (x2) + `FAQPage` en "Cómo funciona"; `DefinedTermSet` en el glosario; `AboutPage`, `CollectionPage`, `WebPage`. Todo con `@id` y referencias cruzadas (`isPartOf`, `#organization`, `#website`) — muy buen grafo de entidades para GEO.
- **Metadata por tipo de página**: títulos, descripciones y `canonical` bien resueltos en home indirecta, coches, motos, categorías, marcas, fichas, dealers, guías y páginas estáticas. Facetas (`?marca=`, `?categoria=`, `sort`, `zona`) consolidadas vía `canonical` a la URL limpia — bien resuelto.
- **Gate `noindex` coherente**: `robots: { index:false, follow:false }` en `app/layout.tsx` + `Disallow: /` en `app/robots.ts`, con bloque post-lanzamiento ya redactado en comentarios. Páginas thin (`/buscar`, `/comparar`, 404) con `noindex` propio; categorías y marca/tipo con `noindex` automático cuando `count === 0`.
- **GEO**: contenido citable y directo (guías largas con respuestas concretas, FAQs reales, glosario, HowTo). Es material muy apto para ser citado por buscadores de IA.

Los problemas que quedan son de **coordinación de lanzamiento**, **canibalización dentro de silos** (marca-tipo y clúster de guías), **enlazado interno que no alimenta las páginas dinero**, y algunos **huecos puntuales** de metadata/schema. Ninguno es un fallo de "sitio roto", pero varios degradarán el arranque orgánico si se levanta el `noindex` sin corregirlos.

**Conteo de hallazgos:** 5 Altos · 6 Medios · 8 Bajos (19 total).

---

## Tabla de hallazgos

| # | Sev. | Archivo / Página | Descripción | Fix |
|---|------|------------------|-------------|-----|
| H1 | **Alta** | `app/robots.ts` + `app/layout.tsx` | **Doble gate acoplado.** Levantar `noindex` exige DOS cambios simultáneos: (a) sustituir el bloque de `robots.ts` por el post-lanzamiento y (b) quitar `robots:{index:false,follow:false}` de `layout.tsx`. Si solo se hace uno, el sitio queda invisible (layout sigue en `noindex`) o inaccesible (robots sigue `Disallow: /`). Además, mientras `robots.txt` bloquea todo, Google no puede *leer* el meta `noindex` (conflicto clásico crawl-vs-index): con enlaces externos podría indexar URLs "a ciegas". | Convertir en un único paso atómico documentado en el checklist. Al flip: quitar el objeto `robots` completo del layout (no solo `index`), cambiar `robots.ts` al bloque post-lanzamiento y validar con "Inspección de URL" en Search Console antes de dar por bueno. |
| H2 | **Alta** | `app/sitemap.ts:35` + `next.config.js:10-14` | **El sitemap publica `/precios`, que es un 301 permanente** hacia `/profesionales/precios`. Un sitemap debe listar solo URLs 200 canónicas; las redirigidas se marcan como error/aviso en Search Console. Además la página real de precios (`/profesionales/precios`) **no está en el sitemap**. | En `sitemap.ts` cambiar `/precios` por `/profesionales/precios`. Revisar que ninguna otra ruta del sitemap redirija (`/busqueda-privada` no está, correcto). |
| H3 | **Alta** | `app/(public)/marcas/[brand]/page.tsx` vs `.../[brand]/coches/page.tsx` (y `/motos`) | **Canibalización marca-tipo.** Para marcas de un solo tipo (Ferrari, Lamborghini, McLaren, Bugatti, Rolls-Royce, Bentley…), `/marcas/ferrari` ("Ferrari en venta en España") y `/marcas/ferrari/coches` ("Coches Ferrari en venta en España") listan **el mismo stock** con títulos casi idénticos, y ambas están en el sitemap (`brandTypeRoutes` para top brands) e indexables. Compiten por la misma query. | Para marcas mono-tipo: (a) canonicalizar la subpágina de tipo hacia la marca padre, o (b) `noindex` en la subpágina cuando la marca solo tiene ese tipo (derivable de `models`), o (c) fusionar. Reservar `/marcas/{b}/coches` y `/motos` solo para marcas mixtas reales (BMW, Honda…). |
| H4 | **Alta** | `app/(public)/marcas/[brand]/page.tsx` + `app/sitemap.ts:102-107` | **Páginas de marca sin guard de vacío + todas en el sitemap.** A diferencia de las categorías y de `marca/coches` (que hacen `noindex` si `count===0`), `/marcas/[brand]` **no** tiene ese guard. El sitemap incluye TODAS las marcas activas (`is_active=true`, potencialmente ~76), la mayoría sin stock al arrancar. Resultado: decenas de páginas de marca casi vacías ("0 vehículos disponibles") indexables y enviadas en el sitemap → thin content masivo el día del lanzamiento. | Añadir a `/marcas/[brand]` el mismo patrón `...(sinStock && sinEditorial ? { robots:{index:false} } : {})`. En `sitemap.ts`, filtrar `brandRoutes` a marcas con ≥1 vehículo activo (o con editorial propia) hasta que haya inventario. |
| H5 | **Alta** | `components/layout/Header.tsx:21-29` + `app/(public)/page.tsx:196-203` | **El enlazado interno no alimenta las páginas dinero.** El desplegable "Marcas" del header y el showcase de marcas del home enlazan a `/coches?marca=ferrari` (filtro que **canonicaliza a `/coches`**), no a `/marcas/ferrari`. Las landing de marca (las que deben rankear) solo reciben enlaces del footer y del índice `/marcas`. Se diluye el link-equity interno hacia el silo de marcas. | Apuntar el desplegable del header y los chips del home a `/marcas/{slug}`. Mantener los filtros `?marca=` solo dentro de la UI de filtros del listado. |
| M1 | Media | `app/(public)/contacto/page.tsx` | **`/contacto` no tiene metadata propia.** Es `'use client'` y no exporta `metadata`, así que hereda el título/descr. por defecto del layout raíz ("Black Label Market \| Coches y motos premium…") y **no tiene `canonical`**. Está en el sitemap (prioridad 0.4) → post-lanzamiento indexaría con título genérico de home. | Extraer un `layout.tsx` server en `contacto/` (o convertir el form en subcomponente cliente y hacer la page server) que exporte `title`, `description` y `alternates.canonical: '/contacto'`. |
| M2 | Media | `app/layout.tsx:23-44` + `app/(public)/page.tsx` | **La home no declara `canonical` propio.** Ni el layout raíz ni `page.tsx` fijan `alternates.canonical`. `/` queda sin canónico autorreferencial (vulnerable a variantes con parámetros/UTM al indexar). | Añadir `alternates: { canonical: '/' }` en la metadata del home (crear `metadata` en la page o en un layout del grupo `(public)`). |
| M3 | Media | `app/(public)/profesionales/precios/page.tsx:178-211` | **FAQ visible sin `FAQPage` schema.** La página de precios renderiza 6 preguntas/respuestas reales en HTML pero no emite JSON-LD `FAQPage` (a diferencia de guías y "Cómo funciona"). Se pierde elegibilidad de rich result y citabilidad GEO en una página comercial clave. | Emitir `FAQPage` con esas 6 Q&A (reusar el patrón de `como-funciona`). |
| M4 | Media | `app/(public)/guias/_data/commercialGuides.ts` + `guias/*` | **Solape temático en el clúster de guías.** Guía editorial `/guias/motos-premium-segunda-mano` vs comercial `/guias/motos-premium-segunda-mano-espana-ducati-bmw-harley-mv-agusta`; `/guias/como-comprar-supercar-segunda-mano` vs `/guias/superdeportivos-segunda-mano-ferrari-lamborghini-mclaren-porsche`; `/guias/coches-clasicos-youngtimers-como-invertir` vs `/guias/coches-clasicos-premium-venta-porsche-ferrari-mercedes-bmw`. Varios pares apuntan al mismo head term ("motos premium segunda mano", "supercar/superdeportivos segunda mano", "clásicos"). | Mapear un dueño por keyword: la editorial como *how-to* (query informacional "cómo comprar…") y la comercial como *catálogo/comparativa* (query "…en España / marcas"). Diferenciar títulos, reforzar enlaces cruzados con anchors distintos y evitar duplicar el primary keyword en ambos `title`. |
| M5 | Media | `guias/*` (todas) + `_components/GuideSeoBlocks.tsx:62-76` | **E-E-A-T: autoría solo `Organization`.** Todas las guías declaran `author: Organization` y el box de autor dice "equipo editorial" sin persona. En compras de alto valor (señal YMYL-adyacente) un autor nombrado con credenciales mejora confianza y citación por IA. | Introducir una entidad `Person` (autor/revisor real) con `sameAs` y bio, referenciada en `author`/`reviewedBy` del `Article`. |
| M6 | Media | `app/sitemap.ts:29-86` | **`lastModified: new Date()` en TODAS las rutas estáticas y `brandTypeRoutes`.** Cada fetch del sitemap marca todas las páginas estáticas como "modificadas ahora", lo que entrena a Google a ignorar el `lastmod`. Solo vehicles/dealers/guías usan fecha real. | Usar fechas reales de contenido (constante por página o fecha de despliegue) o omitir `lastModified` en estáticas. |
| L1 | Baja | `app/(public)/dealers/page.tsx:103` | El índice de showrooms usa `@type: 'SearchResultsPage'`. Google desaconseja indexar resultados de búsqueda; para un directorio curado indexable el tipo correcto es `CollectionPage`. Señal mixta menor. | Cambiar a `CollectionPage`. |
| L2 | Baja | `app/(public)/motos/[slug]/page.tsx:131` | `@type: 'Motorcycle'` es schema.org válido (subtipo de `Vehicle`) pero los rich results de vehículos de Google están documentados para `Car`/`Vehicle`; la elegibilidad de rich result para `Motorcycle` es menos segura. | Mantener `Motorcycle` pero considerar `["Motorcycle","Product"]` o `Vehicle` y monitorizar en Rich Results Test tras el lanzamiento. |
| L3 | Baja | `app/(public)/glosario/page.tsx:138-148` | `<dt>`/`<dd>` se renderizan dentro de `<div>`, no dentro de un `<dl>`. HTML semánticamente inválido (los términos deberían ir en una lista de definición). El schema `DefinedTermSet` sí es correcto. | Envolver la lista en `<dl>` y quitar los `<div>` intermedios (o usar `role`). |
| L4 | Baja | `app/(public)/coches/[slug]/page.tsx:148` y `motos/[slug]:153` | `Offer.availability` solo mapea `sold` → `SoldOut`; los vehículos `paused` (que la ficha muestra) quedan como `InStock`. Falta `priceValidUntil` cuando `price_on_request` (aceptable). | Mapear `paused` → `https://schema.org/InStoreOnly` u ocultar oferta; opcional. |
| L5 | Baja | `app/layout.tsx:83-90` | El `SearchAction` de `WebSite` apunta a `/buscar?q=…`, que es `noindex` y quedará en el `Disallow` post-lanzamiento. El sitelinks searchbox no necesita crawl, pero es una incoherencia menor. | Correcto funcionalmente; documentar que `/buscar` debe seguir accesible (no bloquear el patrón de búsqueda si se activa el searchbox). |
| L6 | Baja | `app/robots.ts` (bloque post-lanzamiento) + `profesionales/solicitar-acceso` | Páginas de formulario/thin como `/profesionales/solicitar-acceso` (enlazada desde precios) no están en el `Disallow` post-lanzamiento ni marcadas `noindex`. Podrían indexarse thin. | Verificar y añadir `noindex` (o al `Disallow`) las páginas de formulario/cuenta no aptas para indexación. |
| L7 | Baja | `app/(public)/coches/[slug]/page.tsx:58-65` (y motos) | Las fichas hacen escritura en BD (incrementar `views` + insert `analytics_events`) en cada render GET. Cada crawl de bot inflará vistas/analítica. (Impacto SEO indirecto; solaparía con el informe de rendimiento/datos.) | Filtrar user-agents de bots o mover el tracking a evento cliente. Fuera del núcleo SEO. |
| L8 | Baja | `app/sitemap.ts` | `changeFrequency`/`priority` en el sitemap son ignorados por Google desde hace años; añaden ruido. No dañan, pero no aportan. | Opcional: simplificar. Cosmético. |

---

## Arquitectura / silo e internal linking

- **Silo coches/motos bien separado**: `/coches` y `/motos` como hubs, con subcategorías dedicadas (`/coches/{clasicos,deportivos,lujo,berlinas,suv,especiales}`, `/motos/{deportivas,clasicas,naked,touring,trail,custom,scooter,ediciones-especiales,entusiastas}`), cada una con `H1` único, texto propio, `ItemList` + `BreadcrumbList` y `noindex` si están vacías. Todas las rutas del sitemap verificadas como existentes (patrón consistente). Buen diseño.
- **Breadcrumbs** presentes tanto en JSON-LD como en HTML (`<nav aria-label="breadcrumb">`) en categorías, marcas, fichas, dealers y guías. Coherentes.
- **Fugas de link-equity** (H5): la navegación principal empuja a facetas `/coches?marca=` en lugar de a `/marcas/{slug}`. Corregir para que el silo de marcas reciba enlaces internos reales.
- **Canonicalización de facetas**: `/coches`, `/motos` y `/dealers` fijan `canonical` a la URL limpia ignorando `marca/categoria/sort/zona/page>1`. Bien para evitar índice de facetas. (`page>1` sí mantiene su propio canónico paginado — correcto.)
- **Enlaces a redirecciones**: el footer y `para-profesionales` enlazan a `/precios` (301 → `/profesionales/precios`). No es crítico, pero añade un salto en cada página; alinear con la URL final.

## GEO (citabilidad por motores de IA)

- **Fortalezas**: respuestas directas y estructuradas en guías (intro + secciones H2 + FAQ), `FAQPage`/`HowTo`/`DefinedTermSet` reales, grafo de entidades con `@id` (`#organization`, `#website`) y `sameAs` a redes. Contenido en español España, tono experto, cifras concretas (rangos de precio, costes de mantenimiento, aranceles). Muy apto para ser citado.
- **Mejoras GEO**: (1) añadir `FAQPage` en `/profesionales/precios` (M3); (2) reforzar E-E-A-T con autor `Person` real (M5); (3) resolver el solape de guías (M4) para que cada respuesta canónica tenga una única URL dueña; (4) opcional: `speakable` en FAQs y datos clave de fichas.

---

## Checklist "listo para quitar noindex"

Marcar todo antes del flip. Requiere **aprobación humana explícita** (regla del proyecto: quitar `noindex` está en la lista de aprobación).

**Bloqueantes (hacer sí o sí):**
- [ ] **H1** — Flip atómico coordinado: quitar el objeto `robots` completo de `app/layout.tsx` **y** cambiar `app/robots.ts` al bloque post-lanzamiento en el mismo deploy.
- [ ] **H2** — `sitemap.ts`: sustituir `/precios` por `/profesionales/precios`; confirmar 0 URLs con redirección en el sitemap.
- [ ] **H4** — `sitemap.ts`: filtrar `brandRoutes` a marcas con stock (o editorial); añadir guard `noindex` de vacío a `/marcas/[brand]`.
- [ ] **H3** — Resolver canibalización marca-tipo (canonical o `noindex` en subpáginas de tipo para marcas mono-tipo).
- [ ] **H5** — Repuntar enlaces internos de marcas del header/home hacia `/marcas/{slug}`.
- [ ] Verificar en Search Console (Inspección de URL) que home, un listado, una categoría, una marca, una ficha coche, una ficha moto, un dealer y una guía devuelven "Indexable" tras el flip.
- [ ] Confirmar que `/admin`, `/dashboard`, `/api/`, `/cuenta/`, `/login`, `/registro*`, `/buscar`, `/comparar`, `/mis-favoritos`, `/profesionales/solicitar-acceso` quedan fuera de índice (robots + meta) — ver L6.

**Recomendados antes del flip:**
- [ ] **M1** — Metadata propia para `/contacto` (title/description/canonical).
- [ ] **M2** — `canonical` autorreferencial en la home.
- [ ] **M3** — `FAQPage` en `/profesionales/precios`.
- [ ] **M6** — `lastModified` real (no `new Date()`) en rutas estáticas del sitemap.

**Post-flip (primeras 2 semanas):**
- [ ] **M4** — Mapa de dueños de keyword del clúster de guías (GSC página+query) y desconflictar títulos.
- [ ] **M5** — Entidad autor `Person` para E-E-A-T.
- [ ] **L1/L2/L3** — `CollectionPage` en dealers; revisar `Motorcycle` en Rich Results Test; `<dl>` en glosario.
- [ ] Enviar `sitemap.xml` en GSC, revisar cobertura, Core Web Vitals (campo) y validez de datos estructurados (Car/Offer, FAQ, Article, Breadcrumb).
- [ ] Vigilar indexación de facetas (`?marca=`, `?categoria=`, `?zona=`): deben consolidar a la URL limpia por canonical.

---

## Notas de validación

- Producción confirmada en solo lectura: `robots.txt` = `User-Agent: * / Disallow: / / Sitemap: …` (gate activo, coherente con `app/robots.ts`). `sitemap.xml` sirve 173 URLs.
- `<html lang="es">` correcto; sitio mono-idioma es-ES → **no** requiere `hreflang` (correcto que no lo tenga).
- `metadataBase` fijado al apex; `www`→apex en Vercel; canónicos relativos resuelven bien.
- OG/Twitter: `opengraph-image.tsx` global (1200×630) + `summary_large_image`; fichas y dealers aportan su propia imagen OG (primera foto). Correcto.
