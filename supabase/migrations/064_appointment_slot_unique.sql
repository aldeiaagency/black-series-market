-- Migration 064 — Índice único parcial anti doble-reserva de citas (BUG-9).
--
-- getBookedStarts() considera un hueco ocupado si hay una cita con status 'proposed' o
-- 'confirmed'. La ruta /api/assistant/book validaba el hueco (check) y luego insertaba
-- (insert) — un check-then-insert con carrera: dos reservas concurrentes del mismo hueco
-- pasaban la validación y ambas se insertaban (doble-reserva).
--
-- Con este índice único parcial, la BD garantiza como máximo UNA cita activa (proposed|
-- confirmed) por (dealer_id, starts_at). La segunda inserción falla con unique_violation
-- (23505), que la ruta traduce a 409 slot_unavailable. Las citas canceladas/completadas no
-- bloquean el hueco (no entran en el WHERE), por lo que se puede reprogramar sin problema.

CREATE UNIQUE INDEX IF NOT EXISTS uniq_appointment_dealer_slot
  ON public.appointments (dealer_id, starts_at)
  WHERE status IN ('proposed', 'confirmed');
