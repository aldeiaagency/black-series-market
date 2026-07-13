-- Feed sync: URL de feed de stock por dealer (nullable, se rellena en onboarding si el showroom tiene DMS).
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS feed_url TEXT;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS feed_last_synced_at TIMESTAMPTZ;

-- logo_url capturado en la investigación pre-visita, para rellenar el perfil del dealer al aprobar el alta.
ALTER TABLE showroom_applications ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Auto-activación del dealer: en cuanto tiene su primer vehículo activo, sale de "trial" y su perfil público se hace visible.
-- Cubre TODAS las rutas de aprobación de vehículo (import por feed, import manual, aprobación admin) sin tener que
-- duplicar esta lógica en cada endpoint.
CREATE OR REPLACE FUNCTION activate_dealer_on_first_active_vehicle()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
    UPDATE dealers
    SET status = 'active'
    WHERE id = NEW.dealer_id AND status = 'trial';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_activate_dealer_on_first_active_vehicle ON vehicles;
CREATE TRIGGER trg_activate_dealer_on_first_active_vehicle
  AFTER INSERT OR UPDATE OF status ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION activate_dealer_on_first_active_vehicle();
