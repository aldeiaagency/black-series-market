-- Ciclo de vida trial: un dealer en 'trial' debe poder ser visible públicamente desde el
-- momento de la aprobación (perfil compartible, vehículos indexables), no solo cuando el
-- trigger de auto-activación (065) lo pasa a 'active' al publicar su primer vehículo.
-- Sin esto, un fundador recién aprobado no tiene NADA que enseñar durante todo el onboarding
-- de stock, lo que rompe la promesa de "os dejamos el perfil vivo".
--
-- 'pending' (solicitud sin aprobar) y 'suspended' (pago fallido / baja) siguen sin ser
-- visibles — la distinción real no es "paga o no paga", es "es un dealer activo del programa
-- o no lo es".

DROP POLICY IF EXISTS "Active dealers viewable" ON dealers;
CREATE POLICY "Active dealers viewable" ON dealers
  FOR SELECT USING (status IN ('trial', 'active') OR auth.uid() = profile_id);

DROP POLICY IF EXISTS "gallery_select_active_dealers" ON dealer_gallery_images;
CREATE POLICY "gallery_select_active_dealers"
  ON dealer_gallery_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dealers d
      WHERE d.id = dealer_gallery_images.dealer_id
        AND d.status IN ('trial', 'active')
    )
  );

-- Hueco encontrado de paso: la policy de vehicles nunca comprobaba el estado del dealer
-- propietario, así que un dealer 'suspended' (pago fallido / baja) seguía teniendo sus
-- vehículos públicamente visibles y buscables. Se cierra aquí: visible solo si el dealer
-- está 'trial' o 'active' (o es el propio dealer viendo su borrador).
DROP POLICY IF EXISTS "Active vehicles viewable" ON vehicles;
CREATE POLICY "Active vehicles viewable" ON vehicles
  FOR SELECT USING (
    (status = 'active' AND EXISTS(
      SELECT 1 FROM dealers d WHERE d.id = vehicles.dealer_id AND d.status IN ('trial', 'active')
    ))
    OR EXISTS(SELECT 1 FROM dealers d WHERE d.id = vehicles.dealer_id AND d.profile_id = auth.uid())
  );
