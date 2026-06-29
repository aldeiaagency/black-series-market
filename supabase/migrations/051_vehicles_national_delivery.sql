-- El asistente de publicación (wizard) envía el campo `national_delivery`
-- (checkbox "Transporte nacional incluido") pero la columna no existía en
-- `vehicles`, así que CUALQUIER publicación vía wizard fallaba con 500
-- ("Could not find the 'national_delivery' column ... in the schema cache").
-- Añadimos la columna (booleano, mismo estilo que financing_available, etc.).
-- Aplicado en producción el 2026-06-29; este archivo lo deja versionado.

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS national_delivery boolean NOT NULL DEFAULT false;
