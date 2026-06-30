-- 055 — Evitar doble reserva del mismo hueco en un showroom.
-- Un showroom no puede tener dos citas activas (proposed/confirmed) a la misma hora.
CREATE UNIQUE INDEX IF NOT EXISTS appointments_dealer_slot_uniq
  ON appointments (dealer_id, starts_at)
  WHERE status IN ('proposed', 'confirmed') AND starts_at IS NOT NULL;
