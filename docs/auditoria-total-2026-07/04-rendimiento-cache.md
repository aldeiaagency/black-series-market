# 04 — Rendimiento y Cache — Black Label Market

> Auditoría DESDE CERO contra el código real y el producto en producción (2026-07-02).
> No se apoya en auditorías anteriores. Stack: Next.js 14.2.25 (App Router) + Supabase + Vercel.
> Agente: Performance Benchmarker. Alcance: renderizado/cache, imágenes, bundle, queries, CWV esperables.

---

## Resumen ejecutivo

El market **funciona pero hoy no está cacheado en absoluto**: todo el sitio público se renderiza dinámicamente (SSR) en cada request, sin ISR, sin cache de CDN y sin `revalidate`. Verificado en producción con `curl`:

```
GET https://blacklabelmarket.es/        → Cache-Control: private, no-cache, no-store, must-revalidate · X-Vercel-Cache: MISS
GET https://blacklabelmarket.es/coches  → Cache-Control: private, no-cache, no-store, must-revalidate · X-Vercel-Cache: MISS
```

Causa raíz: `lib/supabase/server.ts` usa `cookies()` de `next/headers`; **cualquier página que llama `createClient()` queda marcada como dinámica** por Next. Como todas las páginas públicas (home, `/coches`, `/coches/[slug]`, `/motos`, categorías, `/dealers`, `/marcas`, `/buscar`) usan `createClient()` para leer datos que son **idénticos para todos los visitantes anónimos**, se están re-ejecutando 3-6 queries a Supabase por visita, sin ningún beneficio de CDN. Con tráfico real de compradores esto castiga TTFB/LCP y dispara el coste (invocación serverless + lecturas Supabase por cada visita, incluidos bots).

Segundo foco: **la imagen hero (elemento LCP de la home) se sirve a `quality={100}`** → medido en producción **215.838 bytes vs 70.366 bytes a q=75** (mismo ancho): ~3× el peso, ~145 KB tirados en el LCP. Y la variante hero **móvil no lleva `priority`**, así que en móvil el LCP se carga en lazy.

No hay hallazgos **bloqueantes** de rendimiento (nada rompe funcionalidad ni datos), pero sí varios **Altos** que hay que cerrar antes de abrir a tráfico real, porque afectan directamente a CWV y a la factura. La buena noticia: el bundle está sano (framer-motion y recharts están confinados al dashboard, no entran en el catálogo) y las quick wins de cache son de bajo riesgo y alto retorno.

**CWV esperables (por análisis de código, sin correr Lighthouse en campo):**
- **LCP**: en riesgo. Hero q=100 + SSR sin cache (TTFB alto) + hero móvil lazy. Estimado móvil > 3 s hasta corregir.
- **CLS**: bien controlado. Casi todas las imágenes usan `next/image` con `fill`/dimensiones y `aspect-[16/10]`/`aspect-[16/9]`; fuentes con `display: 'swap'`. Riesgo bajo.
- **INP**: aceptable, pero el `Header` (client, en todas las páginas) dispara 2 llamadas a Supabase Auth tras hidratar y `VehicleCard` hidrata como client component ×24-48 por listado; margen de mejora.

---

## Tabla de hallazgos

| # | Sev | Archivo:línea / página | Descripción | Impacto | Fix |
|---|-----|------------------------|-------------|---------|-----|
| 1 | **Alto** | `lib/supabase/server.ts:6` (afecta a todas las `app/(public)/**`) | `createClient()` llama `cookies()` → Next marca cada página como **dinámica**. Ninguna page pública tiene `revalidate`/ISR. Verificado: `X-Vercel-Cache: MISS`, `no-store` en `/` y `/coches`. Catálogo/ficha muestran datos públicos iguales para todos pero se re-renderizan de cero por request. | TTFB alto en cada visita, sin CDN, coste serverless + lecturas Supabase por visita (incl. bots). No escala con tráfico real. Es el mayor problema de rendimiento y coste. | Servir catálogo/ficha con un cliente Supabase **sin cookies** (anon) + `export const revalidate = N` (ISR) o `unstable_cache` con tags. Invalidar con `revalidateTag`/`revalidatePath` al aprobar/editar/vender/despublicar (ya existen acciones admin y webhooks WF donde engancharlo). |
| 2 | **Alto** | `app/(public)/coches/[slug]/page.tsx:58-65` (idéntico en `motos/[slug]`) | La ficha **escribe en BD en cada render**: `insert analytics_events` + `update vehicles.views+1`, fire-and-forget con `.then()` en un Server Component. Además impide cachear la ficha. | En Vercel serverless, promesas no-`await` pueden cortarse al enviar la respuesta (pérdida de eventos) o alargar la función. `views = views+1` es read-modify-write → condición de carrera. Y ata la ficha a render dinámico. | Mover el tracking a beacon/endpoint del lado cliente (o `waitUntil`/`after`). Incrementar vistas con RPC atómico (`rpc('increment_views', {id})`). Así la ficha puede ser ISR. |
| 3 | **Alto** | `app/(public)/page.tsx:63-72` y `:134-142` | **Hero (LCP) a `quality={100}`**. Medido en prod: `q=100` = **215.838 B** vs `q=75` = **70.366 B** (mismo `w=1200`). Las 2 imágenes hero secundarias (`:423`, `:466`) también van a `object-cover` correctas pero el patrón de calidad es el mismo problema en la principal. | ~145 KB extra descargados en el elemento LCP de la home. Empeora LCP directamente, sobre todo en móvil/4G. | Quitar `quality={100}` (usar default 75, máx 80-82 si se quiere margen). |
| 4 | **Alto** | `app/(public)/page.tsx:134-145` | **Hero móvil sin `priority`**. El hero desktop (`:68`) sí lo tiene; la variante móvil (`hidden` en desktop, visible en móvil) carga en **lazy** por defecto → en móvil el LCP es diferido. | LCP móvil peor de lo necesario; el navegador no prioriza el recurso más importante en la vista móvil. | Añadir `priority` (o `fetchPriority="high"`) a la variante móvil y quitar `quality={100}`. |
| 5 | **Medio** | `app/layout.tsx:99-108` | El **root layout hace una query a Supabase en cada request** (`createAdminClient()` → `platform_config` para `gtm_id`), sin cache. Se ejecuta en TODAS las rutas del sitio. | Round-trip extra bloqueando el render del layout en cada navegación (incluidas rutas que no lo necesitan). | Cachear con `unstable_cache`/React `cache` (revalidate ~1 h) o leer de env var. El valor es casi estático. |
| 6 | **Medio** | `next.config.js:16-24` | `images` **sin `formats`** → producción sirve `image/webp` aunque el `Accept` del cliente incluye AVIF (verificado). Sin `minimumCacheTTL`: las imágenes optimizadas responden `Cache-Control: max-age=0, must-revalidate`. | Se pierde ~20-30% de peso adicional que daría AVIF en todas las fotos de vehículos y hero. Revalidación innecesaria de imágenes ya inmutables. | `images.formats = ['image/avif','image/webp']` y `images.minimumCacheTTL = 2678400` (31 d) para assets estáticos. |
| 7 | **Medio** | `app/(public)/coches/berlinas/page.tsx:10-15` + `:26-34` (y las 6 categorías coche + 9 moto; mismo patrón en `coches/page.tsx:118` y `motos`) | **`count: 'exact'` duplicado**: `generateMetadata` hace un count exact y el componente hace otro count exact por render. En `/coches` y `/motos` también hay count en la page + otro dentro de `VehicleList`. `count:'exact'` escanea todas las filas que cumplen el filtro. | 2 conteos O(n) por render de categoría. Barato con catálogo piloto; a escala degrada. | Reutilizar un único count; usar `count:'estimated'`/`'planned'` para el número de cabecera, o eliminarlo donde no se muestra. |
| 8 | **Medio** | `components/marketplace/VehicleCard.tsx:1` | El card, la unidad **más repetida** (24-48 por listado), es `'use client'` completo solo por `useState(imgError)` y por alojar `FavoriteButton`/`CompareButton`. Todo el árbol del card se hidrata en cliente. | Más JS a hidratar y árbol client mayor en cada listado → afecta INP/TBT en catálogo. | Convertir el card en Server Component y dejar como islas client solo Favorito/Comparar (ya lo son) y un mini-wrapper para el `onError` de la imagen (o placeholder CSS). |
| 9 | **Medio** | `components/layout/Header.tsx:68-89` | El `Header` (client, presente en todas las páginas) hace **2 llamadas a Supabase tras hidratar** en cada page: `auth.getUser()` + `checkDealer` (query `dealers`). | Trabajo/red post-carga en todas las vistas; latencia extra y coste Auth por navegación. | Pasar `user`/`isDealer` desde el layout server (la sesión ya se resuelve en middleware) vía prop/contexto; evitar el fetch cliente universal. |
| 10 | **Medio** | `app/(public)/page.tsx:43`, `coches/page.tsx:46`, `buscar/page.tsx:23`, `coches/berlinas/page.tsx:28` (todos los listados) | **Over-fetch `select('*')`** + join dealer en listados: se traen todas las columnas (`description` larga, `equipment[]`, todos los specs) cuando `VehicleCard` usa ~15 campos. | Payload RSC y serialización mayores, más memoria/tiempo por cada 24-48 filas. | `select` explícito con solo los campos que consume el card. |
| 11 | **Medio** | `lib/vehicle-query.ts:28-34, 36-48, 84-86` | El filtro por marca dispara una query extra (`resolveBrandNameFromSlug`) por request filtrado; múltiples `ilike '%term%'` (marca, modelo, versión, color, búsqueda `.or`) **no usan índice** → full scan a escala. | Con catálogo grande y filtros concurrentes, degradación de latencia de listado. | Índices: trigram/GIN para los `ilike`, btree compuesto `status+vehicle_type+published_at` y sobre los filtros frecuentes (price, year, brand_name). Cachear el mapa slug→marca. |
| 12 | **Bajo** | `app/(public)/comparar/page.tsx:143` | Página pública usa `<img>` crudo en lugar de `next/image`. | Sin optimización de formato/tamaño ni lazy nativo en el comparador. | Sustituir por `next/image` con `sizes` adecuado. |
| 13 | **Bajo** | `app/(public)/coches/[slug]/page.tsx:67-92` | En la ficha, `resolveContactMode`, `similarVehicles` y `dealerVehicles` son round-trips adicionales; `contactMode` se `await` en serie antes de las similares. | Suma latencia secuencial en la ficha (menor). | Paralelizar con `Promise.all` lo que no dependa entre sí. |
| 14 | Info/OK | `components/dashboard/**`, `app/(dashboard)/dashboard/analiticas/page.tsx` | **framer-motion y recharts están confinados al dashboard** (grep confirma: ninguna page `(public)` los importa). App Router hace code-split por ruta → no entran en catálogo/ficha. | Bundle público sano; nada que corregir. | Mantener la disciplina: no importar estas libs desde componentes compartidos con rutas públicas. |

Conteo: **Bloqueante 0 · Alto 4 · Medio 7 · Bajo 2 · Info 1**.

---

## Quick wins de cache priorizados

Ordenadas por (impacto ÷ esfuerzo). Todas de bajo riesgo salvo QW1, que requiere una decisión de arquitectura.

1. **QW1 — ISR en catálogo y ficha (mayor impacto).**
   Introducir un cliente Supabase de solo-lectura **sin `cookies()`** para los datos públicos y añadir `export const revalidate = 300` (5 min, ajustable) en `home`, `/coches`, `/motos`, categorías, `/coches/[slug]`, `/motos/[slug]`, `/dealers`, `/marcas`. Invalidar bajo demanda con `revalidateTag`/`revalidatePath` desde las acciones admin de aprobación/edición/venta y desde los webhooks WF. Convierte `X-Vercel-Cache: MISS` (SSR) en `HIT` (CDN) → TTFB casi cero, menos lecturas Supabase, mejor LCP. Prerrequisito en la ficha: hacer QW4 (sacar los writes del render).

2. **QW2 — Quitar `quality={100}` del hero y poner `priority` en el hero móvil (1-2 líneas, impacto LCP inmediato).**
   `app/(public)/page.tsx`: eliminar `quality={100}` en las 3 imágenes hero; añadir `priority` a la variante móvil (`:134`). Ahorro medido ~145 KB en el LCP de la home.

3. **QW3 — Activar AVIF + `minimumCacheTTL` en `next.config.js`.**
   `images.formats = ['image/avif','image/webp']` y `images.minimumCacheTTL`. ~20-30% menos peso en todas las fotos de vehículos y hero, más cache de navegador de assets ya inmutables. Cero cambios de código de página.

4. **QW4 — Sacar el tracking de vistas del render de la ficha.**
   Reemplazar `insert analytics_events` + `update views+1` (server, fire-and-forget) por un beacon cliente o `waitUntil`, y `views` con RPC atómico. Evita pérdida de eventos, la carrera del contador y **habilita cachear la ficha** (desbloquea QW1 en `/coches/[slug]`).

5. **QW5 — Cachear el `gtm_id` del root layout.**
   Envolver la query de `platform_config` en `unstable_cache` con revalidate ~1 h (o env var). Elimina un round-trip a Supabase en **cada** request del sitio, incluidas rutas que hoy no lo necesitan.

6. **QW6 — `select` explícito en listados + `count` único.**
   Reemplazar `select('*')` por la lista de campos que usa `VehicleCard`, y consolidar el `count:'exact'` duplicado (o pasar a `estimated`). Reduce payload RSC y carga de BD por listado; complementa QW1.

---

### Notas de método

- Cache de producción verificada con `curl -D -` sobre `https://blacklabelmarket.es/` y `/coches`.
- Peso del hero verificado contra el optimizador real de Vercel: `/_next/image?...&w=1200&q=100` (215.838 B, `image/webp`) vs `&q=75` (70.366 B), con `Accept: image/avif,image/webp` (confirmando que AVIF no se está sirviendo).
- CWV estimados por análisis estático del código de home, `/buscar`, `/coches` y `/coches/[slug]`; no se ejecutó Lighthouse de campo (RUM) en esta pasada. Recomendado validar LCP/INP reales con datos de campo tras aplicar QW1-QW4.
- No se modificó código (auditoría de solo lectura).
</content>
</invoke>
