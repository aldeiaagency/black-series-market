-- Migration 043: Completar el enum lead_status con los estados del pipeline.
--
-- El selector de estados del dashboard (LeadStatusSelector) y el endpoint
-- /api/leads/[id] ya contemplan 8 estados, pero el enum en BD solo tenía 5
-- (new, contacted, negotiating, closed, discarded). Al pulsar "Cita/visita",
-- "Reservado" o "Perdido" el UPDATE fallaba con error de enum y el botón no se
-- marcaba. Aquí añadimos los 3 valores que faltan.
--
-- Nota: ALTER TYPE ... ADD VALUE no puede ir dentro de una transacción ni junto
-- a otras sentencias que lo usen. Por eso cada ADD VALUE va por separado y es
-- idempotente con IF NOT EXISTS.

ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'appointment';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'reserved';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'lost';
