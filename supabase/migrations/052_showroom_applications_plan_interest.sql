-- El plan de interés de la solicitud solo se guardaba dentro del texto de
-- `message` ("Plan de interés: professional"), lo que obliga a parsear texto
-- libre en la aprobación. Lo pasamos a columna propia para que `approveApplication`
-- pueda dar al dealer en trial el plan que pidió, de forma fiable.

ALTER TABLE public.showroom_applications
  ADD COLUMN IF NOT EXISTS plan_interest text;
