-- Migration 038: Clasificación definitiva de features por plan
-- Decisión (2026-06-16): el acceso se decide por plan_features.included por plan.
-- availability_status es SOLO informativo (operative = backend conectado;
-- future = pendiente de enganche externo, ver docs/pendientes-configuracion-externa.md).
-- Todo lo que el plan incluye es público/visible (public_visible = TRUE): nada de "Próximamente".

-- ── Features internas YA construidas → operative ──────────────────────────────
-- (el seed 029 las dejó como 'partial'; el código las gateaba por status y por eso
--  un perfil Elite caía a básico en analíticas).

WITH p AS (SELECT id, slug FROM plans)
UPDATE plan_features pf
SET availability_status = 'operative', public_visible = TRUE
FROM p
WHERE pf.plan_id = p.id
  AND pf.included = TRUE
  AND pf.feature_key IN (
    'pipeline',
    'analytics_advanced',
    'analytics_extended_compare'
  );

-- ── Essential NO incluye vehículos a la carta (decisión de cierre) ────────────
WITH p AS (SELECT id, slug FROM plans WHERE slug = 'essential')
UPDATE plan_features pf
SET included = FALSE, public_visible = TRUE
FROM p
WHERE pf.plan_id = p.id
  AND pf.feature_key = 'vehicles_on_request';

-- ── Features dependientes de herramientas externas: VISIBLES y concedidas por ──
--    plan, pero status = 'future' (pendiente de enganche). NO ocultar.
--    feed_sync, vehicles_on_request_priority, lead_qualification_assistant,
--    appointment_booking.

-- feed_sync: incluido en Elite (en Essential/Professional es add-on, no feature de plan)
WITH p AS (SELECT id, slug FROM plans WHERE slug = 'elite')
UPDATE plan_features pf
SET included = TRUE, public_visible = TRUE, availability_status = 'future'
FROM p
WHERE pf.plan_id = p.id
  AND pf.feature_key = 'feed_sync';

-- vehicles_on_request_priority (ventana 24h): incluido en Elite, visible, pendiente matcher
WITH p AS (SELECT id, slug FROM plans WHERE slug = 'elite')
UPDATE plan_features pf
SET included = TRUE, public_visible = TRUE, availability_status = 'future'
FROM p
WHERE pf.plan_id = p.id
  AND pf.feature_key = 'vehicles_on_request_priority';

-- Agente de cualificación: Professional + Elite, visible, pendiente IA
WITH p AS (SELECT id, slug FROM plans WHERE slug IN ('professional','elite'))
UPDATE plan_features pf
SET included = TRUE, public_visible = TRUE, availability_status = 'future'
FROM p
WHERE pf.plan_id = p.id
  AND pf.feature_key = 'lead_qualification_assistant';

-- Reserva de cita: solo Elite, visible, pendiente OAuth Google Calendar
WITH p AS (SELECT id, slug FROM plans WHERE slug = 'elite')
UPDATE plan_features pf
SET included = TRUE, public_visible = TRUE, availability_status = 'future'
FROM p
WHERE pf.plan_id = p.id
  AND pf.feature_key = 'appointment_booking';
