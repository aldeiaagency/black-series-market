-- 077 - Condicion fundador persistente, independiente del trial comercial.
--
-- El programa fundador no caduca en una fecha individual: permanece sin coste
-- hasta un gate global de monetizacion y exige 30 dias de preaviso. Este flag
-- evita inferir esa condicion desde status='trial' o desde trial_ends_at.

ALTER TABLE dealers
  ADD COLUMN IF NOT EXISTS is_founder BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN dealers.is_founder IS
  'TRUE para altas del programa fundador (source=visita_agencia). Condicion persistente y sin fecha individual de expiracion; el cobro depende del gate global de monetizacion.';
