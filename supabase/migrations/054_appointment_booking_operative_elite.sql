-- 054 — Activar la reserva de cita del agente (Fase B: ventanas + .ics/links)
--
-- El agente cualificador de Elite/Grupo incluye "reserva de cita", que estaba
-- marcada `future`. La Fase B (huecos de disponibilidad manual + email con enlaces
-- "Añadir a calendario", sin OAuth) ya está construida, así que se pone operativa.
-- `calendar_integration` (sincronización real vía Google OAuth) sigue en `future`
-- hasta construir la Fase A.

UPDATE plan_features pf
SET included = true, availability_status = 'operative'
FROM plans p
WHERE pf.plan_id = p.id
  AND p.slug IN ('elite', 'grupo')
  AND pf.feature_key = 'appointment_booking';
