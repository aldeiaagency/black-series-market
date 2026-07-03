# Veredicto consolidado — Auditoría total de Black Label Market

Fecha: 2026-07-03 · Cobertura: 6 de 7 capas (código/arquitectura pendiente de integrar; solapa con 01/03).
Método: auditoría desde cero (código real + producción), agentes especialistas + hilo principal.

## Veredicto ejecutivo

**¿Puede el market recibir showrooms y compradores reales tal cual está hoy? NO.**
Existen **escaladas de privilegio explotables** con una simple cuenta gratuita: cualquiera se convierte
en administrador y cualquier dealer se auto-concede plan Elite y verificación (RLS de Supabase sin
guardia de columnas). Además, los emails de todos los usuarios son públicos (RGPD).

**¿Después de cerrar el GATE, se puede arrancar con fundadores en modo white-glove? SÍ.**
El núcleo funcional (alta → aprobación → publicar → leads/alertas) funciona. Corregidos los críticos de
seguridad, se puede onboardar a los primeros showrooms publicando su stock nosotros. El autoservicio
pleno y el tráfico público de compradores requieren la segunda y tercera ola.

La base es **mejor de lo que estos titulares sugieren**: aislamiento multi-tenant correcto en las rutas
de dashboard, datos estructurados SEO ricos, buen control de CLS, source maps no expuestos, SSL y CSRF
de server actions configurados. El riesgo está concentrado y es corregible.

## Conteo unificado (6 capas, normalizado a Crítico/Alto/Medio/Bajo)

| Capa | Crít | Alto | Medio | Bajo | Total |
|------|------|------|-------|------|-------|
| 01 Seguridad | 3 | 5 | 3 | 0 | 11 |
| 03 API | 0 | 4 | 8 | 7 | 19 |
| 04 Rendimiento/cache | 0 | 4 | 7 | 2 | 13 |
| 05 UX/accesibilidad | 3 | 7 | 8 | 6 | 24 |
| 06 SEO/GEO | 0 | 5 | 6 | 8 | 19 |
| 07 Funcional por rol | 0 | 4 | 3 | 1 | 8 |
| **Total** | **6** | **29** | **35** | **24** | **94** |
| 02 Código/arquitectura | — | — | — | — | pendiente |

## GATE — bloqueantes absolutos (antes de que NINGÚN dealer/comprador real entre)

Todo lo demás puede esperar; esto no. Son datos y privilegios.

1. **RLS `profiles`: quitar `role` del alcance del usuario** (auto-promoción a admin). `01` CRÍT-1.
2. **RLS `dealers`: congelar columnas de plan/verificación/estado** (auto-Elite/verificado). `01` CRÍT-2.
3. **`assertAdmin()` en las server actions de admin** (defense-in-depth; `middleware.ts` ya gatea `/admin/*`, así que es endurecimiento, no un agujero abierto). `01` ALTA.
4. **Verificar y rotar el posible `service_role` de `scripts/*.mjs`** + sacarlo a env. `01` CRÍT-4.
5. **RLS `profiles` SELECT: dejar de exponer email/rol de todos** (RGPD). `01` ALTA-7.
6. **Webhooks entrantes fail-closed** (HMAC obligatorio). `01`/`03`.
7. **Barrido RLS del resto de tablas** (organizations, subscriptions, boosts…): muy probable que compartan el defecto de "own sin guardia de columna". `01` (fila pendiente).

Estimación: 1-2 días de trabajo enfocado. Todo es migración SQL + guardas de servidor; bajo riesgo si se hace con migración + verificación.

## SEGUNDA OLA — Alto (antes de abrir tráfico público de compradores)

- **Mass-assignment de vehículos**: forzar `pending_review` y bloquear `is_featured` sin boost activo (trigger). `01`/`03`.
- **Buscador roto para el valor**: indexar `version` y `title` (hoy "GT3"/"Weissach" dan 0). `07`.
- **Rendimiento**: ISR/cache en catálogo y ficha (hoy 100% SSR sin cache) + hero sin `quality=100` + AVIF. `04`.
- **Rate limit** en `leads`, `search-alerts`, `assistant/*`, altas. `03`.
- **Cadena de dinero** (solo relevante al monetizar): idempotencia Stripe + `subscriptions` que se rellene + boosts. `03` (+`02` cuando llegue).
- **Accesibilidad crítica**: labels de formularios, kanban operable por teclado, foco en modales. `05`.
- **Coordinación de lanzamiento SEO**: desacoplar el `noindex` y sanear el sitemap antes de levantarlo. `06`.

## TERCERA OLA — Calidad, pulido y escala

- Resto de accesibilidad (contraste, unificar los 3 dorados, tipografía). `05`.
- SEO fino: canibalización marca-tipo, enlazado interno a páginas de marca, thin pages con guard de vacío. `06`.
- UX de fricción: wizard de publicar (autoguardado, menos campos), unificar favoritos, rutas muertas. `05`/`07`.
- Onboarding automático del showroom (perfil vivo + activación del asistente IA). `07` (= F4 del roadmap).
- Rendimiento medio/bajo: `select` explícito, índices, header sin fetch cliente. `04`.

## Mapa al roadmap cero-a-100

- El **GATE** sustituye y amplía el bloque "SEC-1..5" de la Fase 1 (F1-10..14). Es más grande y más grave de lo estimado (los RLS criticals son nuevos).
- La **segunda ola** se reparte entre Fase 1 (buscador, rate limit, seguridad restante) y el momento previo a quitar `noindex` (Fase 3: rendimiento + SEO de lanzamiento).
- La **tercera ola** cae en Fase 3-4 (calidad + onboarding automático + monetización).
- **No cobrar** hasta arreglar la cadena de dinero (coherente con la estrategia value-first: se difiere sin bloquear la captación).

## Recomendación de ejecución

Abrir un **Sprint 0 de seguridad** (los 7 puntos del GATE) como primer trabajo técnico, con aprobación
explícita por ser cambios en producción (RLS de la BD real). Migración + verificación tabla por tabla
(`SELECT * FROM pg_policies`). Hasta cerrarlo, no cargar datos de dealers/compradores reales.

## Estado de la auditoría

6/7 capas cerradas y guardadas en esta carpeta. Falta integrar `02-codigo-arquitectura.md` (en curso;
solapa con la cadena de dinero ya cubierta en 01/03 — no cambiará el GATE). Este veredicto se actualizará
al integrarla.
