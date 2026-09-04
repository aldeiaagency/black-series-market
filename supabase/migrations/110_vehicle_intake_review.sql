-- 110 - Intake unico de vehiculos: trazabilidad de la revision de calidad por IA y
-- deduplicacion del sync de feed/DMS.
--
-- Contexto: hasta ahora habia 3 vias de alta con logica de IA duplicada/inconsistente
-- (wizard sin IA, CSV con relleno de descripcion vacia, feed con el mismo relleno mas
-- un boton manual de "stock inicial"). Se unifican en un pipeline compartido
-- (lib/vehicle-intake/) cuya salida se audita aqui.

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS vin_normalized TEXT,
  ADD COLUMN IF NOT EXISTS external_ref TEXT,
  ADD COLUMN IF NOT EXISTS original_description TEXT,
  ADD COLUMN IF NOT EXISTS ai_suggested_description TEXT,
  ADD COLUMN IF NOT EXISTS ai_review_json JSONB,
  ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS ai_review_model TEXT,
  ADD COLUMN IF NOT EXISTS ai_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_applied_mode TEXT CHECK (ai_applied_mode IN ('none', 'dealer_accepted', 'auto_safe')),
  ADD COLUMN IF NOT EXISTS ai_applied_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS intake_source TEXT CHECK (intake_source IN ('wizard', 'csv_dashboard', 'csv_onboarding', 'feed_sync', 'vehicle_by_vehicle'));

COMMENT ON COLUMN vehicles.vin_normalized IS
  'VIN en mayusculas sin espacios, cuando se conoce. Clave de deduplicacion preferente del sync de feed/DMS.';
COMMENT ON COLUMN vehicles.external_ref IS
  'Identificador de anuncio propio del feed/DMS del dealer, cuando lo ofrece. Segunda clave de deduplicacion, antes de caer a la aproximacion por marca+modelo+año+km.';
COMMENT ON COLUMN vehicles.original_description IS
  'Descripcion tal como la escribio el dealer o llego en la fila, antes de cualquier sugerencia de IA. Nunca se sobreescribe.';
COMMENT ON COLUMN vehicles.ai_review_json IS
  'Salida completa de reviewVehicleIntake(): quality_score, decision, issues[], confidence. Auditoria, no se muestra al comprador.';
COMMENT ON COLUMN vehicles.ai_applied_mode IS
  'none: no se aplico ninguna sugerencia. dealer_accepted: el dealer acepto explicitamente la sugerencia. auto_safe: se aplico sin confirmacion porque el canal lo permite (CSV/feed) y el cambio no afirma ningun dato no presente en la entrada.';

-- Deduplicacion: un VIN normalizado no puede repetirse dos veces para el mismo dealer
-- (si aparece en otro dealer no es objeto de esta constraint - eso seria fraude/duplicado
-- cruzado, fuera de alcance de esta migracion).
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_dealer_vin_unique
  ON vehicles (dealer_id, vin_normalized)
  WHERE vin_normalized IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_dealer_external_ref_unique
  ON vehicles (dealer_id, external_ref)
  WHERE external_ref IS NOT NULL;

-- Lote de importacion: trazabilidad de cada corrida de CSV/feed (quien, cuando, cuantas
-- filas, cuantas fallaron y por que). No se crea vehiculo a medias por una fila con datos
-- obligatorios ausentes (ej. sin año) - queda registrada aqui, no en `vehicles`.
CREATE TABLE IF NOT EXISTS vehicle_import_batches (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id     UUID        NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  source        TEXT        NOT NULL CHECK (source IN ('csv_dashboard', 'csv_onboarding', 'feed_sync')),
  total_rows    INT         NOT NULL DEFAULT 0,
  inserted      INT         NOT NULL DEFAULT 0,
  updated       INT         NOT NULL DEFAULT 0,
  draft_count   INT         NOT NULL DEFAULT 0,
  pending_count INT         NOT NULL DEFAULT 0,
  failed_rows   JSONB       NOT NULL DEFAULT '[]'::jsonb,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at   TIMESTAMPTZ
);

COMMENT ON TABLE vehicle_import_batches IS
  'Un registro por corrida de CSV/feed. failed_rows guarda {row, reason} para filas que no llegaron a crear ni actualizar un vehiculo (dato obligatorio ausente).';

ALTER TABLE vehicle_import_batches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE vehicle_import_batches FROM anon;
REVOKE ALL ON TABLE vehicle_import_batches FROM authenticated;
GRANT ALL ON TABLE vehicle_import_batches TO service_role;

CREATE POLICY "dealers ven sus propios lotes"
  ON vehicle_import_batches FOR SELECT
  TO authenticated
  USING (dealer_id IN (SELECT id FROM dealers WHERE profile_id = auth.uid()));
