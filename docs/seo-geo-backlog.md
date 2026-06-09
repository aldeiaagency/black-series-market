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

**Acciones acumuladas: 16.** · Pendiente: O2-07 `sameAs` (bloqueado por URLs redes). R01: OG 1200×630 dedicada.
Próxima: **Ola 3** (contenido + arquitectura). Bloqueos de input: `sameAs` (URLs redes BLM), "Sobre nosotros" (contenido de marca).

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

## OLA 3 — Contenido + arquitectura (P1-P2)

- ⬜ **O3-01 · T12 · 💻+✍️ — Página `/sobre-nosotros` (E-E-A-T).**
  Quién está detrás (Black Series), propósito, proceso de verificación, criterios de selección. Schema `AboutPage`. ⚠️ Necesito tu input de marca.

- ⬜ **O3-02 · T16 · 💻+✍️ — Landing `/para-profesionales` (B2B).**
  Intención: "anunciar coche de lujo", "marketplace coches premium profesionales". CTA a `/registro`. *(Usa la voz B2B de la guía de copy.)*

- ⬜ **O3-03 · T21 · ✍️ — Texto introductorio en `/coches` y `/motos`.**
  2-3 frases con keywords naturales antes del grid (contexto para Google y LLMs).

- ⬜ **O3-04 · T20 · 💻 — Title de páginas de marca.**
  `'{Marca} en venta en España | Black Label Market'` en `/marcas/[brand]`.

- ⬜ **O3-05 · T31 · 💻 — Alt text contextual en `VehicleCard`.**
  `'{Marca Modelo Año} {color} en venta en {ciudad} — Black Label Market'`.

- ⬜ **O3-06 · T24 + T25 + T26 · 💻+✍️ — Landings de categoría indexables.**
  `/coches/clasicos`, `/coches/deportivos`, `/coches/lujo` (y motos) con H1, intro editorial única y grid filtrado. **Mayor palanca de tráfico head-term.** Regla: `noindex` automático si quedan vacías.

- ⬜ **O3-07 · T23 · ✍️ — Contenido editorial en marcas top (Ferrari, Porsche, Ducati, BMW, Lamborghini).**
  100-200 palabras por marca (hoy son thin content).

- ⬜ **O3-08 · T32 · ✍️ — Glosario del sector** (`/glosario`: youngtimer, servicebook, GT…). SEO informacional + entidades GEO.

---

## OLA 4 — Activos de contenido + autoridad (P2 · 60-90 días)

- ⬜ **T27 · ✍️ — Guía: "Cómo comprar un supercar de segunda mano en España"** (activo linkable).
- ⬜ **T28 · ✍️ — Guía B2B: "Cómo vender tu coche premium con compradores cualificados".**
- ⬜ **T29 · 📈 — PR digital** (Motor1, CarAndDriver, TopGear España) → backlinks editoriales.
- ⬜ **T33 · 📈 — Google Business Profile** (si hay dirección registrable).
- ⬜ **T46(nuevo) · 💻+✍️ — Programático marca+categoría / marca+provincia / modelo** (T35). Solo donde haya stock; `noindex` si vacío.

---

## Fase 3+ (cuando haya tracción/datos)

- ⬜ **T34 · 💻 — Reseñas verificadas + `AggregateRating`.** ⚠️ Solo con reviews reales, nunca antes.
- ⬜ **T35 · 💻+✍️ — Landings por modelo** (Porsche 911, Ferrari 488, Ducati Panigale). Cuando haya inventario suficiente.

---

## Medición (transversal — montar pronto)

- ⬜ **M01 · ⚙️+💻 — Google Search Console + Bing Webmaster Tools.**
  Verificar dominio, enviar sitemap (tras quitar noindex). Sin GSC no hay datos de keywords ni indexación.
- ⬜ **M02 · 💻 — Inyectar GA4 / GTM.** La UI de config existe en admin pero **no está cableado**. Conectar el ID y renderizar el tag.
- ⬜ **M03 · ⚙️ — Validar schema** (Rich Results Test / Schema.org validator) tras cada ola.

---

## 🚦 EL GATE — abrir a indexación

- 🔒 **G01 · 💻 — Quitar `noindex` y abrir el sitio.**
  Cuando Ola 1 + Ola 2 estén ✅: en `app/layout.tsx` `robots: { index: true, follow: true }` y en `app/robots.ts` `allow: '/'` (con los `disallow` de `/admin`, `/dashboard`, `/api`, y las páginas `noindex`). Luego **enviar sitemap en GSC** (M01).
  *Esto activa todo lo anterior. Son ~2 líneas; me lo pides cuando estés listo.*

---

### Cómo lo ejecuto
Voy ola por ola, valido `next build` en cada una, commit + push, y voy marcando el `Estado` aquí. Empiezo por la **Ola 1** salvo que prefieras otro orden. Lo único que me bloquea hoy: las **URLs de redes** (O2-07) y tu **input para "Sobre nosotros"** (O3-01).

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
