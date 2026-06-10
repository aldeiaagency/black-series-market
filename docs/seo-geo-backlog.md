# SEO / GEO — Backlog de trabajo (referencia viva)

> **Documento canónico y consolidado.** Funde tres fuentes en una sola referencia ejecutable:
> 1. El **informe SEO/GEO original** (`AUDITORIA SEO_GEO (CLAUDE CODE).md`) — auditoría completa por lectura de código.
> 2. El **backlog CSV** (`seo-geo-backlog.csv`, T01-T39) — histórico del 5-jun.
> 3. La **auditoría de esta sesión** + el **estado real del código hoy** (reconciliación de qué está ya hecho).
>
> Aquí está, punto por punto, qué está hecho, qué falta y **cómo** hacerlo. Se actualiza el `Estado` a medida que se ejecuta. Al final hay un **anexo estratégico** (personas, keyword clusters, link building, qué NO hacer) traído del informe original.

## Estado general y *gate* de lanzamiento

⛔ **La web está en `noindex` + `robots: disallow /`** (modo pre-lanzamiento). **Nada posiciona hasta que se quite** (ver `G01`). Por eso el orden es: completar Ola 1 + Ola 2 → quitar noindex → enviar sitemap a Search Console → captar autoridad. Todo lo demás *prepara* el terreno.

**Leyenda de estado:** ✅ Hecho · 🟡 Parcial · ⬜ Pendiente · 🔒 Bloqueado (depende de otro)
**Quién:** 💻 código (lo hago yo) · ✍️ copy/contenido · ⚙️ dashboard externo (tú) · 📈 marketing

---

## ✅ Ya completado (no repetir)

- **T01** — Variable de URL de producción unificada. `NEXT_PUBLIC_APP_URL=https://blacklabelmarket.es` en Vercel; `sitemap.ts` y `robots.ts` con ese fallback. *(También: dominio canónico apex + www→308, `metadataBase` en layout.)*
- **T02 (parcial)** — `Organization` JSON-LD en `app/layout.tsx` con `creator.url` (Black Series). *(Falta `WebSite`+SearchAction y `sameAs` → ver O1-04 / G-sameAs.)*
- **T03 (parcial)** — `metadata` + `canonical` en `/coches`, `/motos`, `/marcas`, `/dealers`. *(Faltan `/contacto`, `/precios`, `/buscar`, `/mis-favoritos` → ver O1-02.)*
- **T05 (parcial)** — Canonical base en `/coches` y `/motos` (`alternates.canonical`). *(Falta canonical consciente de `?page=` → O2-05.)*
- **T14** — La home **sí** tiene `<h1>` semántico real ("Selección exclusiva de coches y motos premium"). Cerrado.
- **Fix marca→sección** — CTA type-aware en `/marcas/[brand]` vacío (no es SEO puro pero mejora UX/rastreo).

---

## 📋 Registro de ejecución

| Fecha | Ola | Ítems | Acciones | Commit |
|---|---|---|---|---|
| 9-jun | **Ola 1 — Schema + metadatos core** | 7/7 ✅ | `Car`/`Motorcycle` schema · `Offer` completo · `AutoDealer` completo · canonical+twitter en fichas · descripciones con specs · quitar `keywords` · OG image+twitter globales | `b7b090c` |
| 9-jun | **Ola 2 — Rich results + GEO/AEO** | 9/10 ✅ | `WebSite`+`SearchAction` · `BreadcrumbList` fichas/dealers/marcas · `FAQPage` precios+como-funciona · `ItemList` coches+motos · canonical paginación · `llms.txt` · sitemap completo · noindex thin pages · `img`→`next/image` | `aed40f2` |
| 9-jun | **Ola 3 — Contenido + arquitectura** | 7/8 ✅ | 5 category landings (`/coches/clasicos`, `/coches/deportivos`, `/coches/lujo`, `/motos/deportivas`, `/motos/clasicas`) · `/para-profesionales` B2B · `/glosario` 18 términos (DefinedTermSet) · intro text `/coches`+`/motos` · alt text `VehicleCard` · editorial de marcas top · sitemap +9 rutas | `cc40ccc` |
| 9-jun | **Ola 4 — Activos de contenido + autoridad** | 4/4 ✅ | Guía compradores `/guias/como-comprar-supercar-segunda-mano` (Article) · Guía vendedores B2B `/guias/como-vender-coche-premium-profesionales` (Article) · Landings programáticas `/marcas/[brand]/coches` + `/marcas/[brand]/motos` (ItemList, noindex si vacío) · GA4+GTM wiring en layout desde `platform_config` | `d4a24a9` |
| 9-jun | **Ola 5 — Autoridad + arquitectura de enlazado** | 6/6 ✅ | 4 category landings (`/coches/suv`, `/motos/naked`, `/motos/touring`, `/motos/trail`) · `contacto/layout.tsx` con metadata/canonical · `llms.txt` reescrito completo · `robots.ts` con reglas post-G01 comentadas · sitemap +4 categories +17 brand×tipo · enlazado interno guías↔category pages | `4be8781` |
| 9-jun | **Ola 6 — Cobertura completa + autoridad editorial** | 5/5 ✅ | 3 category landings restantes (`/coches/especiales`, `/motos/custom`, `/motos/scooter`) · `HowTo` schema en `/como-funciona` (2 tipos: comprador + profesional) · 6 brand editorials (mercedes-benz, audi, bugatti, triumph, harley-davidson, mv-agusta) · 2 guías nuevas (`/guias/motos-premium-segunda-mano`, `/guias/coches-clasicos-youngtimers-como-invertir`) · `/marcas` index CollectionPage schema + metadata + breadcrumb | `71e2b0f` |
| 10-jun | **Ola 7 — Cierre de arquitectura + distribución de autoridad** | 5/5 ✅ | `/guias` hub CollectionPage · 2 últimas motos (`/motos/ediciones-especiales`, `/motos/entusiastas`) — 100% cobertura DB · `llms.txt` actualizado (+4 cats motos, +1 cat coches, +6 marcas, +3 guías, +3 schemas) · `/vehiculos-a-la-carta` canonical + WebPage schema · 6 motos category pages → link guía motos | `cfd4ab1` |
| 10-jun | **Ola 8 — Schema transaccional + enlazado guías + openGraph** | 4/4 ✅ | `SearchResultsPage`+`BreadcrumbList`+`openGraph` en `/dealers` · `WebPage`+`openGraph` en `/precios` · `ContactPage`+`openGraph` en `/contacto` · sección "Guías del mercado" en home → `/guias` · `llms.txt` +2 schema types | `bab4999` |

**Acciones acumuladas de código: 73.** · Pre-lanzamiento pendiente: P01-P09 · Analítica: AN01-AN19 · Gate: G01.
Ver secciones **PRE-LANZAMIENTO** y **ANALÍTICA Y TRACKING** para checklist completo al 100%.

---

## OLA 1 — Schema + metadatos core (P0) · ✅ COMPLETADA

> Objetivo: que cada ficha sea un *hecho estructurado* perfecto para Google y para que los LLMs la citen.
> **Ejecutada en sesión 9-jun (commit `b7b090c`).** 7/7 ítems. Archivos: `coches/[slug]`, `motos/[slug]`, `dealers/[slug]`, `app/layout.tsx`. Build ✓ + lint ✓.

- ✅ **O1-01 · T04 · 💻 — `Product` → `Car`/`MotorVehicle` en fichas.**
  Archivos: `app/(public)/coches/[slug]/page.tsx` y `motos/[slug]/page.tsx` (bloque `jsonLd`).
  Cómo: `@type: 'Car'` (coches) / `'Motorcycle'` (motos). Añadir `fuelType`, `bodyType`, `vehicleTransmission`, `driveWheelConfiguration`, `color`, `numberOfDoors`, `vehicleSeatingCapacity`, `itemCondition` (mapear `condition_type`→`schema.org/UsedCondition|NewCondition`), `vehicleModelDate`, `vehicleEngine` (ya parcial), `vehicleIdentificationNumber` (VIN si existe).

- ✅ **O1-02 · T38 · 💻 — Completar `Offer` en fichas.**
  Cómo: añadir a `offers`: `url` (canónica de la ficha), `itemCondition`, `priceValidUntil`, `seller.url` (URL del dealer), `availability` (ya está), `priceCurrency` (ya está). Si `price_on_request` → omitir `price` y usar `availability: InStock`.

- ✅ **O1-03 · T43(nuevo) · 💻 — Canonical + Twitter card en fichas de vehículo.**
  Archivos: `generateMetadata` de coches/motos `[slug]`.
  Cómo: `alternates: { canonical: '/coches/' + slug }`, `openGraph.type` + dimensiones, y bloque `twitter: { card: 'summary_large_image', title, description, images }`. Idéntico en dealer `[slug]`.

- ✅ **O1-04 · T15 + T30 · 💻 — Meta description de fichas enriquecida con specs.**
  Cómo: en `generateMetadata`, construir desc con datos reales: `"{Marca Modelo Año} · {km} km · {combustible} · {CV} CV · {provincia} · {precio} € — Vendedor profesional verificado."`. Replicar en `description` del JSON-LD y `og:description` explícita.

- ✅ **O1-05 · T42(nuevo) · 💻 — Schema base `AutoDealer`/`LocalBusiness` en fichas de dealer.**
  Archivo: `app/(public)/dealers/[slug]/page.tsx` (hoy **sin** JSON-LD).
  Cómo: `@type: 'AutoDealer'` con `name`, `address` (PostalAddress: ciudad/región/CP/país), `geo` si hay, `telephone`, `email`, `url`, `image` (cover/logo), `priceRange`, `sameAs` (redes del dealer). *(Completar con T18; `aggregateRating` va aparte en T34.)*

- ✅ **O1-06 · T13 · 💻 — Eliminar `keywords` del metadata global.**
  Archivo: `app/layout.tsx`. Quitar el array `keywords` (Google lo ignora; ruido).

- ✅ **O1-07 · T08 + T09 + T39 · 💻+🎨 — OG image global + Twitter cards globales + fallback dealer.**
  Hecho: `openGraph.images` + `twitter` (summary_large_image) por defecto en `app/layout.tsx`; dealers sin imagen heredan el OG global. **Interino:** se usa la hero `black-label-hero-gt3rs-ducati.webp` (ratio ~1.9:1) como OG por defecto.
  ⬜ **Refinamiento pendiente (R01 · 🎨):** crear una **OG 1200×630 de marca dedicada** (JPG/PNG, máxima compatibilidad LinkedIn) y sustituir la hero webp.

---

## OLA 2 — Rich results + GEO/AEO (P1) · ✅ COMPLETADA

> **Ejecutada en sesión 9-jun (commit `aed40f2`).** 9/10 ítems (O2-07 bloqueado por input). Build ✓. Archivos: `layout.tsx`, `sitemap.ts`, `coches/`, `motos/`, `coches/[slug]`, `motos/[slug]`, `dealers/[slug]`, `marcas/[brand]`, `como-funciona`, `precios`, `buscar`, `comparar`, `mis-favoritos`, `DealerInlineCard`, `home page`, `public/llms.txt`.

- ✅ **O2-01 · T02b · 💻 — `WebSite` + `SearchAction` (Sitelinks Searchbox).**
  `app/layout.tsx`: `WebSite` JSON-LD con `potentialAction: SearchAction` apuntando a `/buscar?q={search_term_string}`. Renderizado junto al `Organization` ya existente.

- ✅ **O2-02 · T06 + T19 · 💻 — `BreadcrumbList` (schema + migas visibles).**
  JSON-LD en `coches/[slug]`, `motos/[slug]`, `dealers/[slug]`, `marcas/[brand]`. `<nav aria-label="breadcrumb">` visible en dealers y marcas. VehicleDetailContent ya tenía nav visible (añadido JSON-LD).

- ✅ **O2-03 · T07 + T36 · 💻+✍️ — `FAQPage` schema.**
  `/precios`: FAQPage JSON-LD con las 5 FAQ existentes + metadata+canonical. `/como-funciona`: FAQPage JSON-LD (6 Q&A) + sección visible "Preguntas frecuentes" + metadata canonical mejorado.

- ✅ **O2-04 · T17 · 💻 — `ItemList` en `/coches` y `/motos`.**
  Los 10 vehículos más recientes/destacados → `ItemList` JSON-LD en cada página.

- ✅ **O2-05 · T05b · 💻 — Canonical consciente de paginación.**
  `/coches` y `/motos`: convertido de `metadata` estático a `generateMetadata` → canonical self-referencial `/coches?page=N` a partir de página 2.

- ✅ **O2-06 · T41(nuevo) · 💻 — `llms.txt` en la raíz.**
  `public/llms.txt`: índice markdown completo (qué es BLM, propuesta, categorías, URLs, modelo de negocio, criterios).

- ⬜ **O2-07 · T37 · 💻 — `sameAs` en Organization.**
  ⚠️ **Bloqueado** — necesito las URLs reales de redes de Black Label Market (Instagram, TikTok, YouTube, LinkedIn…).

- ✅ **O2-08 · T10 + T22 · 💻 — Completar sitemap.**
  Añadidas: `/vehiculos-a-la-carta`, `/como-funciona`, `/sobre-nosotros`, `/legal/criterios-publicacion`, `/legal/condiciones-profesionales`.

- ✅ **O2-09 · T11 · 💻 — `noindex` en páginas sin valor SEO.**
  `/buscar`: metadata + noindex. `/comparar`: noindex añadido. `/mis-favoritos`: `layout.tsx` creado con noindex (client component sin metadata propio).

- ✅ **O2-10 · T44(nuevo) · 💻 — `<img>` crudas → `next/image` (Core Web Vitals).**
  Home (bloques a-la-carta y profesional → `fill` + `sizes`), `DealerInlineCard` (card logo 28×28, sidebar cover `fill`, sidebar logo 40×40), `marcas/[brand]` (logo 96×96).

---

## OLA 3 — Contenido + arquitectura (P1-P2) · ✅ COMPLETADA (7/8)

> **Ejecutada en sesión 9-jun (commit `cc40ccc`).** 7/8 ítems (O3-01 bloqueado por input de marca). Build ✓.

- ⬜ **O3-01 · T12 · 💻+✍️ — Página `/sobre-nosotros` (E-E-A-T).**
  Quién está detrás (Black Series), propósito, proceso de verificación, criterios de selección. Schema `AboutPage`. ⚠️ **Bloqueado** — necesito tu input de marca.

- ✅ **O3-02 · T16 · 💻+✍️ — Landing `/para-profesionales` (B2B).**
  Hero "Llega a compradores que saben exactamente lo que buscan", grid de 6 beneficios, bloque de criterios, CTA a `/precios` y `/registro`. Schema `WebPage`.

- ✅ **O3-03 · T21 · ✍️ — Texto introductorio en `/coches` y `/motos`.**
  Párrafo introductorio con keywords naturales antes del grid.

- ✅ **O3-04 · T20 · 💻 — Title de páginas de marca.**
  `'{Marca} en venta en España | Black Label Market'` implementado en `/marcas/[brand]`.

- ✅ **O3-05 · T31 · 💻 — Alt text contextual en `VehicleCard`.**
  `'{Marca Modelo Año} {color} en venta en {ciudad} — Black Label Market'`.

- ✅ **O3-06 · T24 + T25 + T26 · 💻+✍️ — Landings de categoría indexables.**
  `/coches/clasicos`, `/coches/deportivos`, `/coches/lujo`, `/motos/deportivas`, `/motos/clasicas`. Cada una con BreadcrumbList + ItemList JSON-LD, H1, intro, grid VehicleCard, noindex si count=0, CTA a filtros.

- ✅ **O3-07 · T23 · ✍️ — Contenido editorial en marcas top.**
  Map `BRAND_EDITORIAL` para Ferrari, Porsche, Lamborghini, BMW, Ducati, McLaren, Rolls-Royce, Bentley en `/marcas/[brand]`.

- ✅ **O3-08 · T32 · ✍️ — Glosario del sector** (`/glosario`). 18 términos con `DefinedTermSet`+`DefinedTerm` schema, anchor links, breadcrumb. SEO informacional + entidades GEO.

---

## OLA 4 — Activos de contenido + autoridad · ✅ COMPLETADA (4/4 código)

> **Ejecutada en sesión 9-jun (commit `d4a24a9`).** 4 ítems de código completados. Resto son acciones de usuario.

- ✅ **T27 · ✍️ — Guía compradores:** `/guias/como-comprar-supercar-segunda-mano` — ~1.500 palabras, 7 secciones, Article schema, breadcrumb, CTAs a `/coches/deportivos` y `/vehiculos-a-la-carta`.
- ✅ **T28 · ✍️ — Guía vendedores B2B:** `/guias/como-vender-coche-premium-profesionales` — ~1.200 palabras, 7 secciones, Article schema, CTAs a `/para-profesionales` y `/precios`.
- ⬜ **T29 · 📈 — PR digital** (Motor1, CarAndDriver, TopGear España) → backlinks editoriales. *(Acción de usuario)*
- ⬜ **T33 · 📈 — Google Business Profile** (si hay dirección registrable). *(Acción de usuario)*
- ✅ **T46(nuevo) · 💻 — Programático marca×tipo:** `/marcas/[brand]/coches` + `/marcas/[brand]/motos`. ItemList JSON-LD, noindex si vacío, breadcrumb 4 niveles, tab-nav entre tipos.

---

## Fase 3+ (cuando haya tracción/datos)

- ⬜ **T34 · 💻 — Reseñas verificadas + `AggregateRating`.** ⚠️ Solo con reviews reales, nunca antes.
- ⬜ **T35 · 💻+✍️ — Landings por modelo** (Porsche 911, Ferrari 488, Ducati Panigale). Cuando haya inventario suficiente por modelo.
- ⬜ **T36 · ✍️ — Guía "cómo vender moto premium".** Cluster informacional incompleto: existe guía de venta de coches y 2 de compra de motos, falta la simétrica de venta. URL: `/guias/como-vender-moto-premium-profesionales`. Article schema, ~1.200 palabras.
- ⬜ **T37 · 💻+✍️ — Landings geográficas** ("Coches premium en Madrid / Barcelona"). Solo cuando haya masa crítica de dealers por ciudad.

---

## 🚀 PRE-LANZAMIENTO — Checklist completo (antes de G01)

> Todo lo que debe estar listo antes de quitar el noindex. Ejecutar en este orden.
> **Leyenda:** 💻 código · ✍️ copy (input tuyo) · 🎨 asset (diseño) · ⚙️ dashboard (acción tuya)

### Código — ejecutable sin input

- ⬜ **P01 · 💻 — `@id` + `logo` en Organization schema.**
  `app/layout.tsx` → `organizationJsonLd`: añadir `'@id': \`${SITE_URL}/#organization\`` y `logo: { '@type': 'ImageObject', url: \`${SITE_URL}/images/logo/black-label-market-logo.png\` }`. Permite que Google y los LLMs construyan un grafo de conocimiento inequívoco de la marca.

- ⬜ **P02 · 💻 — `author` en las 4 guías Article.**
  Archivos: `guias/como-comprar-supercar-segunda-mano`, `motos-premium-segunda-mano`, `coches-clasicos-youngtimers-como-invertir`, `como-vender-coche-premium-profesionales`.
  Añadir en cada `articleJsonLd`: `author: { '@type': 'Organization', name: 'Black Label Market', url: SITE_URL }`. Señal E-E-A-T imprescindible en contenido YMYL (vehículos de alto valor).

- ⬜ **P03 · 💻 — Verificar/crear `app/not-found.tsx`.**
  Página 404 personalizada con H1 descriptivo, enlaces a home/coches/motos/dealers y CTA a vehículos a la carta. Sin 404 útil los errores de rastreo no tienen salida.

- ⬜ **P04 · 💻 — Verificar footer con enlaces completos.**
  Footer debe enlazar: Inicio · Coches · Motos · Marcas · Dealers · Guías · Glosario · Para profesionales · Precios · Sobre nosotros · Contacto · Aviso legal · Privacidad · Cookies. Evita páginas huérfanas y da señales de sitio completo a Googlebot.

### Requiere input o asset tuyo

- ⬜ **P05 · 🎨 — OG image JPG 1200×630 dedicada (R01).**
  La imagen actual (`black-label-hero-gt3rs-ducati.webp`, 1365×716) no es JPG/PNG ni el ratio correcto. LinkedIn, Telegram, WhatsApp no procesan WebP de forma fiable.
  **Lo que necesito:** imagen JPG o PNG 1200×630 con marca. Yo actualizo 1 línea en `layout.tsx`.

- ⬜ **P06 · ✍️ — Página `/sobre-nosotros` con `AboutPage` schema (O3-01).**
  ⚠️ **CRÍTICO:** la URL está en el sitemap pero la página no existe → Google encontrará una 404 nada más rastrear el sitemap.
  **Lo que necesito:** quién hay detrás (Black Series / KAZAWEB S.L.U.), año de fundación, misión, proceso de verificación de dealers, criterios de selección de vehículos, figura editorial.
  Schema: `AboutPage` + `Organization` con `@id`.

- ⬜ **P07 · ⚙️ — `sameAs` en Organization (O2-07).**
  **Lo que necesito:** URLs de redes sociales reales de Black Label Market (Instagram, TikTok, LinkedIn, Facebook, YouTube — las que existan). Son 5 min de código.

### Validación (acción tuya)

- ⬜ **P08 · ⚙️ — Confirmar que páginas legales existen en producción.**
  Verificar en el navegador que devuelven 200: `/legal/aviso-legal`, `/legal/privacidad`, `/legal/cookies`, `/legal/terminos`, `/legal/criterios-publicacion`, `/legal/condiciones-profesionales`.

- ⬜ **P09 · ⚙️ — Validar schema con Rich Results Test (M03).**
  Probar: `/coches/[slug]`, `/motos/[slug]`, `/dealers/[slug]`, `/como-funciona`, `/precios`, `/guias/como-comprar-supercar-segunda-mano`.

---

## 📊 ANALÍTICA Y TRACKING

> Stack completo de medición: analytics, heatmaps, paid media pixels, eventos clave y consent.

### Analytics base — ya cableado en código, solo necesita IDs

- ⬜ **AN01 · ⚙️ — GA4 Measurement ID.**
  `/admin/configuracion` → SEO y analíticas → campo GA4. Formato: `G-XXXXXXXXXX`.
  Activa automáticamente: pageviews, sesiones, engagement rate, scroll depth, clics salientes.

- ⬜ **AN02 · ⚙️ — GTM Container ID.**
  Mismo panel. Formato: `GTM-XXXXXXX`.
  ✅ Recomendado: instalar todos los demás tags (AN05-AN10) vía GTM para control centralizado y Consent Mode correcto.

### Search analytics

- ⬜ **AN03 · ⚙️ — Google Search Console.**
  Verificar dominio `blacklabelmarket.es` (método DNS preferido — añadir registro TXT en Vercel Domains).
  Enviar sitemap: `https://blacklabelmarket.es/sitemap.xml`.
  Activa: queries, posiciones, CTR, cobertura de índice, CWV field data, URL Inspection Tool.

- ⬜ **AN04 · ⚙️ — Bing Webmaster Tools.**
  Verificar dominio. Enviar sitemap.
  Importante para GEO: Bing alimenta ChatGPT (Copilot) y Perplexity. Sin indexación en Bing, no hay citas en esas IAs.

### Heatmaps y CRO

- ⬜ **AN05 · 💻 — Microsoft Clarity** (gratuito, GDPR-ready, recomendado para fase piloto).
  Instalar vía GTM → tag Custom HTML con snippet de Clarity. Requiere: Project ID de clarity.microsoft.com.
  Activa: session recordings, heatmaps de clics y scroll, rage clicks, dead clicks, filtros por página.
  Funnels a revisar: `/vehiculos-a-la-carta`, ficha vehículo → botón "Contactar", `/precios` → botón CTA plan.

- ⬜ **AN06 · 💻 — Hotjar** (alternativa de pago con más features: encuestas, NPS, funnels).
  Instalar vía GTM o script directo. No necesario en fase piloto — evaluar si Clarity no es suficiente.

### Paid media pixels (instalar antes de activar cada canal de pago)

- ⬜ **AN07 · 💻 — Meta Pixel (Facebook/Instagram Ads).**
  Instalar vía GTM → template "Facebook Pixel". Requiere: Pixel ID (Meta Events Manager).
  Eventos a configurar:
  - `PageView` — automático en cada página
  - `ViewContent` — en fichas de vehículo (`/coches/[slug]`, `/motos/[slug]`) con parámetros: content_type, content_ids, value, currency
  - `Lead` — en envío de formulario a-la-carta + clic en "Contactar" dealer
  - `InitiateCheckout` — en clic en botones de plan en `/precios`
  Audiencias: visitantes de `/coches/deportivos`, `/coches/clasicos`, `/motos/deportivas`; retargeting de fichas vistas.

- ⬜ **AN08 · 💻 — TikTok Pixel.**
  Instalar vía GTM → Custom HTML. Requiere: Pixel ID (TikTok Ads Manager).
  Eventos: `ViewContent` (fichas), `SubmitForm` (formulario a-la-carta).

- ⬜ **AN09 · 💻 — LinkedIn Insight Tag (B2B — captación de dealers).**
  Instalar vía GTM → Custom HTML. Requiere: Partner ID (LinkedIn Campaign Manager).
  Audiencias clave: visitantes de `/para-profesionales`, `/precios`, `/dealers`.
  ⚠️ El Insight Tag identifica el perfil profesional de visitantes → muy útil para saber qué tipo de empresa visita la web.

- ⬜ **AN10 · 💻 — Google Ads Conversion Tag.**
  Instalar vía GTM → template "Google Ads Conversion Tracking". Requiere: Conversion ID + Label (Google Ads).
  Conversiones a registrar: formulario a-la-carta enviado, clic en "Contactar" dealer, registro completado.

### Eventos y conversiones clave en GTM

- ⬜ **AN11 · 💻 — Evento: `vehicle_detail_view`.**
  Trigger: pageview en `/coches/[slug]` y `/motos/[slug]`.
  Variables recomendadas: marca, modelo, año, categoría, precio, dealer_id.

- ⬜ **AN12 · 💻 — Evento: `dealer_contact_click`** ← macro-conversión B2C.
  Trigger: clic en botón "Contactar", "WhatsApp" o "Email" en ficha vehículo o perfil dealer.

- ⬜ **AN13 · 💻 — Evento: `vehiculo_carta_submit`** ← macro-conversión B2C.
  Trigger: envío exitoso del formulario `/vehiculos-a-la-carta`.

- ⬜ **AN14 · 💻 — Evento: `dealer_profile_view`.**
  Trigger: pageview en `/dealers/[slug]`.

- ⬜ **AN15 · ⚙️ — GA4: marcar macro-conversiones.**
  GA4 Admin → Events → marcar `dealer_contact_click` y `vehiculo_carta_submit` como conversiones.

- ⬜ **AN16 · 💻 — Consent Mode v2 (GDPR/LOPD) — verificar y configurar.**
  Verificar que `CookieConsentBanner` bloquea los tags AN05-AN10 antes del consentimiento.
  En GTM: configurar variables de consentimiento `ad_storage`, `analytics_storage`, `ad_personalization`, `analytics_storage`.
  ⚠️ Sin Consent Mode correcto: riesgo de sanción AEPD (hasta 20M€) + datos inválidos por ITP/bloqueo de navegadores.

### Monitorización post-lanzamiento

- ⬜ **AN17 · ⚙️ — Primera revisión de cobertura GSC** (7-14 días tras G01).
  Verificar: URLs indexadas vs. enviadas en sitemap, errores de cobertura, páginas excluidas involuntariamente.

- ⬜ **AN18 · ⚙️ — Core Web Vitals field data** (~28 días tras tráfico real).
  GSC → Core Web Vitals report. PageSpeed Insights → field data (CrUX). Umbrales: LCP < 2.5s · INP < 200ms · CLS < 0.1.

- ⬜ **AN19 · ⚙️ — Performance report: primeras queries** (30 días tras G01).
  GSC → Rendimiento → Queries. Identificar: keywords con impresiones reales, CTR por página, posición media.
  Usar para optimizar titles/descriptions de páginas con muchas impresiones y CTR bajo.

---

## 🚦 EL GATE — abrir a indexación

- 🔒 **G01 · 💻 — Quitar `noindex` y abrir el sitio.**
  Prerrequisitos: P01-P06 completados (especialmente `/sobre-nosotros` y OG image).
  Cambios: en `app/layout.tsx` → `robots: { index: true, follow: true }` y en `app/robots.ts` → sustituir el bloque de disallow por el bloque post-lanzamiento ya documentado en el archivo.
  Después: enviar sitemap en GSC (AN03) inmediatamente.
  *Son ~2 líneas de código. Me lo dices cuando estés listo.*

---

### Orden de ejecución recomendado
1. P01 + P02 + P03 + P04 (código, sin input) → commit
2. P05 (OG image — asset tuyo) → commit
3. P06 (sobre-nosotros — copy tuyo) → commit
4. P07 (sameAs — URLs tuyas) → commit
5. P08 + P09 (validación — acción tuya)
6. AN01 + AN02 (GA4 + GTM IDs en admin)
7. **G01 — abrir indexación** → enviar sitemap en GSC (AN03 + AN04)
8. AN05 (Clarity — instalar vía GTM)
9. AN11-AN16 (eventos GTM + Consent Mode)
10. AN07-AN10 (pixels — cuando actives cada canal de pago)
11. AN17-AN19 (monitorización — automático con el tiempo)

---

# Anexo estratégico (del informe original)

> Contexto que guía las decisiones de contenido y arquitectura. No son tareas sueltas; alimentan las landings y el copy de las olas.

## Buyer personas

**Comprador (B2C):**
- Entusiasta 35-55 años, poder adquisitivo alto.
- Busca por **marca/modelo** ("Porsche 911 GT3 segunda mano"), por **categoría** ("coches deportivos de ocasión España") o por **rareza** ("Ferrari Testarossa en venta").

**Profesional / Showroom (B2B):**
- Concesionario o compraventa premium buscando un canal de venta cualificado.
- Busca: "vender coches premium online", "marketplace coches de lujo", "anunciar superdeportivos".
- **Brecha:** no hay landing B2B orientada a SEO (`/precios` existe pero sin copy de búsqueda) → **O3-02**.

## Keyword clusters (cualitativo, sin volumen inventado)

| # | Cluster | Intención | Competencia | Oportunidad BLM | Página objetivo |
|---|---|---|---|---|---|
| 1 | Supercars / hypercars (Ferrari, Lambo, McLaren) | Transaccional alta | Alta | Alta (diferenciación) | `/coches` + `/marcas/[brand]` |
| 2 | Deportivos premium (911, M3, AMG) | Transaccional | Media-Alta | Muy alta (más volumen) | `/coches/deportivos` + modelo |
| 3 | **Clásicos y youngtimers** | Comercial+transacc. | **Media (gap)** | **Muy alta — nicho desatendido** | `/coches/clasicos` |
| 4 | Motos premium (Ducati, MV Agusta) | Transaccional | Media | Muy alta (casi sin competencia) | `/motos` + `/marcas/[brand]` |
| 5 | Luxury / executive (Rolls, Bentley) | Transaccional | Media | Media | `/coches/lujo` + marca |
| 6 | **Marketplace B2B / concesionarios** | Informacional+comercial | **Baja** | **Alta (impacto negocio)** | `/para-profesionales` |
| 7 | Vehículos a la carta / encargo | Transacc.-comercial | **Muy baja** | Alta (keyword poco competida) | `/vehiculos-a-la-carta` |

**Dónde está el oro:** clusters **3 (clásicos)**, **4 (motos premium)** y **6 (B2B)** — baja competencia, alta intención, encaje natural con el posicionamiento.

## Link building (estrategia segura)

- **PR digital:** Motor1 España, CarAndDriver España, TopGear España, MotorTrend. Notas cuando entre un dealer notable o una unidad excepcional.
- **Directorios de calidad:** Google Business Profile (si hay dirección), directorios de automoción premium.
- **Activos linkables:** guías de compra, datos de mercado propios (cuando haya inventario), ranking de dealers verificados.
- **Comunidades:** participación auténtica en foros (ClubPorsche/ClubFerrari España) — menciones sin link forzado.
- **Partnerships:** co-branding con dealers ("Publicado en Black Label Market") → backlinks desde sus webs.
- **Evitar:** compra de enlaces, guest posting masivo, PBNs, intercambios sin relevancia temática.

## Qué NO hacer todavía

- `AggregateRating`/`Review` schema sin sistema real de reseñas (riesgo de penalización).
- Landings por ciudad sin dealers locales que las justifiquen.
- Blog genérico sin audiencia propia.
- Compra de enlaces / intercambios.
- `hreflang` / internacionalización (mercado español por ahora).

## Datos que faltan para una auditoría definitiva

Search Console (queries/cobertura), Analytics (comportamiento), CrUX (field data de CWV), inventario real para medir thin content, nº de dealers activos, listado de backlinks, competidores directos para análisis de gaps. → Ver **M01/M02** (montar medición pronto).

## Recomendación final (del informe)

Fase piloto: la prioridad **no** es contenido masivo, sino **sellar los gaps técnicos y de schema** (Olas 1-2) y **dejar montada la arquitectura de contenido** para escalar cuando haya inventario. Mayor potencial de diferenciación a medio plazo: **clásicos/youngtimers** y **marketplace B2B**.
