-- Ciclo de vida trial→conversión: hoy no existe ningún reloj de tiempo para el trial (solo
-- el evento "primer vehículo activo" de la migración 065). Sin fecha de fin no se puede
-- mostrar un banner "Trial activo hasta X" ni programar la secuencia de emails de trial.

ALTER TABLE dealers ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Etapa de la secuencia de emails de trial ya enviada (0=ninguna, 1=día3, 2=día10, 3=día21,
-- 4=día28/conversión) — evita reenviar el mismo email, mismo patrón que Visitas.FU etapa.
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS trial_email_stage INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN dealers.trial_ends_at IS 'Fecha de fin del periodo de prueba (30 días desde la aprobación). NULL si nunca ha estado en trial o si ya es cliente de pago desde el alta.';
COMMENT ON COLUMN dealers.trial_email_stage IS '0=ninguno enviado, 1=día3, 2=día10, 3=día21, 4=día28 (conversión). Lo escribe el workflow de trial drip.';
