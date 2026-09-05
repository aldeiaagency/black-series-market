# Keyword research manual — marca+modelo(+versión)

> Complementa `docs/seo-geo-backlog.md` (clusters cualitativos) y el addendum "Instrucciones para la próxima
> sesión: análisis con MCP Semrush" de `agency/02_growth_marketing.md` §S13 Punto 1. **Cambio de método**:
> el MCP de Semrush en su plan gratuito no permite ejecutar análisis — se sustituye por descarga manual desde
> la extensión gratuita de Surfer SEO, usando este listado como input. Más laborioso, pero ejecutable ya.

## Qué es esto

`keyword-research-manual-modelos.csv` (mismo directorio): listado de marca+modelo+versiones a buscar,
organizado por los mismos clusters de `seo-geo-backlog.md` (1, 2, 3, 4, 5 — los clusters 6 B2B y 7 a la
carta no aplican, no son búsquedas de modelo). Prioridad **Alta** = clusters "oro" (3 y 4, motos premium y
clásicos/youngtimers) — empezar por ahí.

**Origen del listado:** conocimiento del sector + los clusters/brand editorials ya escritos en el proyecto
(Mercedes-Benz, Audi, Bugatti, Triumph, Harley-Davidson, MV Agusta). **No** está extraído de la tabla `models`
real de Supabase (~785 modelos, 76 marcas) — si se quiere alinear el 100% con el catálogo/stock real, hay
que cruzar este listado contra esa tabla antes de dar por definitiva la priorización.

## Palabras modificadoras (combinar con cada marca+modelo)

**Núcleo — combinar siempre primero, son las de mayor intención transaccional:**
- segunda mano
- de segunda mano
- ocasión
- de ocasión

**Secundarias — combinar en una segunda pasada si hay tiempo:**
- usado / usados
- en venta
- venta
- comprar
- precio

**Específicas de clásicos/youngtimers (solo clusters 3):**
- clásico / clásico en venta
- restaurado
- para restaurar
- importación
- coleccionista

**Cualificadores de alta intención (opcional, tercera pasada — long-tail más específico):**
- manual / cambio manual (relevante en deportivos y clásicos, el comprador de este segmento lo busca)
- pocos kilómetros
- km0 (solo relevante en supercars/deportivos actuales, no en clásicos)
- matriculado en España

**Geográficos (opcional, solo si sobra tiempo — no prioritario):**
- España
- Madrid / Barcelona (las 2 plazas de mayor volumen esperable)

## Cómo combinar (orden de trabajo recomendado)

1. Empezar por cluster 4 (motos premium) y cluster 3 (clásicos/youngtimers), prioridad Alta — son los
   "oro" ya identificados (baja competencia, alta oportunidad).
2. Por cada fila del CSV: buscar primero `[marca] [modelo] segunda mano` y `[marca] [modelo] ocasión` en el
   volumen agregado (Surfer SEO) — son las 2 combinaciones obligatorias mínimas por modelo.
3. Si el modelo muestra volumen relevante, ampliar con las versiones de la columna `versiones_relevantes`
   (ej. no solo "Porsche 911", también "Porsche 911 GT3 RS segunda mano").
4. Registrar el dato crudo (volumen, dificultad si la herramienta la da) en una columna nueva del propio CSV
   o en una copia — no descartar los "sin dato"/volumen bajo, son señal también (ver "qué NO hacer" abajo).
5. Repetir con clusters 1, 2 y 5 (supercars/hypercars, deportivos premium, luxury) solo después de cerrar 3
   y 4 — son de prioridad media/baja, ya con más competencia conocida.

## Qué NO hacer

- No inventar volumen donde la herramienta no dé dato — anotar `sin dato`, nunca estimarlo a ojo (regla ya
  vigente en todo el proyecto).
- No ampliar el listado a marcas/modelos fuera de este CSV sin verificar antes que existen o pueden existir
  en el catálogo real (evita construir sobre demanda de un vehículo que BLM nunca va a tener).
- No tratar un volumen bajo individual como descarte automático — en automoción el long-tail (marca+modelo+
  versión) domina en conjunto aunque cada keyword suelta tenga poco volumen (ver addendum de
  `02_growth_marketing.md`, hallazgo del `seo-geo-specialist`).

## Qué hacer con el resultado

Una vez recogidos los datos: volver a `agency/02_growth_marketing.md` §S13 (Punto 1, addendums al final,
antes de "Punto 2") y añadir un addendum nuevo con la tabla de volumen real por cluster/modelo, y la lista
priorizada de con qué modelos concretos arrancar el piloto de landings de modelo (Objetivo 2 del addendum
"Resultado de la pasada seo-geo-specialist"). Si el volumen lo justifica, invocar de nuevo la skill
`seo-geo-specialist` para interpretar los datos con el mismo criterio de impacto/esfuerzo/riesgo ya usado.
