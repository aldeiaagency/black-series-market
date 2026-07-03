# 02 — Código y arquitectura — Black Label Market

> Auditoría DESDE CERO (2026-07-03, hilo principal). Complementa 01 (seguridad) y 03 (API) sin
> duplicarlos: aquí, correctness de la cadena de dinero desde `lib/`, atomicidad, deriva de
> migraciones y calidad de código. Los bugs de seguridad/API viven en 01/03.

## Resumen ejecutivo

El código es competente y legible, pero la **lógica de negocio con dinero (boosts + suscripciones)
tiene bugs de correctness y de concurrencia**, y hay una **deriva real entre las migraciones del repo
y el estado de la BD en producción** que es, por sí sola, un riesgo de proceso. Nada de esto bloquea
el modelo white-glove (no se cobra aún), pero **debe cerrarse antes de activar la monetización**.

## Hallazgos

| Sev | Ubicación | Descripción | Impacto | Fix |
|-----|-----------|-------------|---------|-----|
| **Alto** | `lib/boosts.ts:130-134` (`activateBoost`) | El boost pagado **no pone `is_featured=true`**; solo escribe `featured_until`. Pero el listado de destacados filtra `is_featured=true AND featured_until>now` (`lib/vehicle-query.ts:60-63`). | El cliente paga €49 y su vehículo **no aparece destacado**. Feature de pago rota. | En `activateBoost` (y al cancelar) actualizar también `is_featured` (true/false) junto a `featured_until`. |
| **Alto** | `lib/boosts.ts:81` y `:180` | Queries con `.lt('used', admin.rpc as never)` y `.update({ used: admin.rpc as never })`: `admin.rpc` es una **referencia a función** casteada a `never` y enviada como valor → peticiones malformadas a PostgREST. Son **código muerto** (justo debajo se rehace correctamente), pero se ejecutan igual. | Requests inútiles/erróneas a Postgres en la ruta de boost; señal de un patrón copiado sin querer. Fragilidad. | Eliminar ambas líneas muertas. Confirmar que no hay más `admin.rpc as never` en el repo. |
| **Alto** | `lib/boosts.ts:36-58, 97, 125-128` | **Sin atomicidad.** El chequeo de cupo global (paso 2), la búsqueda de crédito (paso 4) y el consumo `used: availableCredit.used + 1` (paso 5, read-modify-write) son operaciones separadas y no transaccionales. | Dos activaciones concurrentes pueden superar el `max_boosted_share` y/o **consumir dos veces el mismo crédito** (carrera). Con volumen real, sobre-cupo y descuadres de créditos. | Mover a una función Postgres transaccional (RPC) o usar `UPDATE boost_credits SET used=used+1 WHERE id=? AND used<quantity RETURNING` (consumo atómico) y contar el cupo dentro de la transacción. |
| **Alto** (ver 03) | `app/api/stripe/create-checkout` → `lib/stripe.ts` + webhook | Cadena de suscripción rota: la `metadata` no lleva `organization_id`/`billing_cycle` → `subscriptions` no se rellena y `provisionPlanBoostCredits` (`lib/boosts.ts:167`) no recibe datos correctos. | Planes Pro/Elite no reciben sus boosts incluidos. Detalle y fix en `03-api.md`. | Firma nueva de checkout con `organization_id`. |
| **Medio** | Migraciones (56) vs estado real de prod | **Deriva confirmada**: `021_analytics_events_rls.sql` declara RLS en `analytics_events`, pero en producción estaba DESACTIVADO (detectado en el barrido; corregido en 059). Es decir, **el repo de migraciones no refleja el estado real de la BD**. | No se puede confiar en "está en la migración N" para saber qué hay en prod. Riesgo de asumir protecciones que no existen (justo lo que pasó con la RLS). | Adoptar una fuente de verdad: verificar el estado real (`pg_policies`, `pg_class.relrowsecurity`) tras cada deploy, o un runner de migraciones idempotente y auditado. Reconciliar el resto del esquema. |
| **Medio** | `lib/boosts.ts:125-134, 156-159` | Escrituras sin comprobación de error tras crear la activación: `update used`, `update featured_until` no verifican `error`. | Fallo parcial silencioso: boost creado pero crédito no consumido, o `featured_until` no reflejado → estados incoherentes. | Comprobar errores y compensar (o transacción única). |
| **Medio** | Arquitectura general | Lógica de negocio y efectos secundarios en Server Components/páginas (p. ej. escritura de analytics + `views+1` en el render de la ficha, ver `04`); mezcla de responsabilidades render/negocio. | Dificulta el cacheo (ver 04) y el testeo; efectos colaterales en el render. | Extraer efectos a rutas/acciones dedicadas; páginas que solo lean. |
| Bajo | `lib/boosts.ts:77-97` | La primera query de crédito (77-86) se descarta entera y se rehace (89-97); el `find` posterior es el que vale. Código muerto + comentarios "handled below". | Ruido y confusión de mantenimiento. | Dejar solo la query buena. |
| Bajo | Varios | `as never`, `capConfig?.value?.max_boosted_share` sin tipar, respuestas de API heterogéneas (ver 03). | Erosión de la seguridad de tipos. | Tipar los config JSONB y unificar contratos. |

## Conteo por severidad
| Severidad | Nº |
|-----------|----|
| Alto | 4 |
| Medio | 3 |
| Bajo | 2 |
| **Total** | **9** |

## Notas de contexto (no hallazgos)
- El aislamiento multi-tenant en rutas de dashboard está bien resuelto (ver 03).
- `activateBoost` está bien pensado en cuanto a reglas de negocio (cupo, FIFO de créditos, no doble boost); el problema es la **ejecución no atómica**, no el diseño.
- Migraciones defensivas correctas: `040` (límite de activos, fail-open) es un buen patrón.

## Lo más importante de esta capa
1. El **boost pagado no destaca** (is_featured) — rompe la promesa de pago.
2. **Concurrencia sin transacciones** en boosts — descuadres con volumen.
3. **Deriva migraciones↔producción** — no fiarse del repo para saber qué protege la BD (motivo por el que la RLS estaba abierta). Verificar siempre el estado real.
