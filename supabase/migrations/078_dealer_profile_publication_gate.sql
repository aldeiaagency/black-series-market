-- 078 - Separa cuenta aprobada de perfil publico.
--
-- Los perfiles existentes conservan su visibilidad al aplicar la migracion. Las
-- altas nuevas escriben draft de forma explicita y, desde ese momento, el gate
-- se recalcula ante cambios de logo o inventario.

ALTER TABLE dealers
  ADD COLUMN IF NOT EXISTS profile_status TEXT NOT NULL DEFAULT 'published';

ALTER TABLE dealers
  DROP CONSTRAINT IF EXISTS dealers_profile_status_check;

ALTER TABLE dealers
  ADD CONSTRAINT dealers_profile_status_check
  CHECK (profile_status IN ('draft', 'published'));

COMMENT ON COLUMN dealers.profile_status IS
  'draft: cuenta operativa pero perfil publico oculto. published: cumple el gate minimo (logo + al menos un vehiculo active con una foto URL).';

CREATE OR REPLACE FUNCTION public.sync_dealer_profile_publication(p_dealer_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_logo          BOOLEAN;
  v_has_active_photos BOOLEAN;
  v_status            TEXT;
BEGIN
  IF p_dealer_id IS NULL THEN
    RETURN 'draft';
  END IF;

  SELECT NULLIF(BTRIM(logo_url), '') IS NOT NULL
  INTO v_has_logo
  FROM dealers
  WHERE id = p_dealer_id;

  IF NOT FOUND THEN
    RETURN 'draft';
  END IF;

  -- Gate minimo explicito: logo presente + al menos un vehiculo activo con
  -- al menos una foto util. El array JSON usa objetos { url, order }.
  SELECT EXISTS (
    SELECT 1
    FROM vehicles v
    WHERE v.dealer_id = p_dealer_id
      AND v.status = 'active'
      AND jsonb_typeof(COALESCE(v.images, '[]'::jsonb)) = 'array'
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(
          CASE
            WHEN jsonb_typeof(COALESCE(v.images, '[]'::jsonb)) = 'array' THEN COALESCE(v.images, '[]'::jsonb)
            ELSE '[]'::jsonb
          END
        ) image
        WHERE NULLIF(BTRIM(image ->> 'url'), '') IS NOT NULL
      )
  ) INTO v_has_active_photos;

  v_status := CASE
    WHEN COALESCE(v_has_logo, FALSE) AND v_has_active_photos THEN 'published'
    ELSE 'draft'
  END;

  UPDATE dealers
  SET profile_status = v_status,
      updated_at = NOW()
  WHERE id = p_dealer_id
    AND profile_status IS DISTINCT FROM v_status;

  RETURN v_status;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_publication_from_dealer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.sync_dealer_profile_publication(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_publication_from_dealer ON dealers;
CREATE TRIGGER trg_sync_profile_publication_from_dealer
  AFTER INSERT OR UPDATE OF logo_url ON dealers
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_publication_from_dealer();

CREATE OR REPLACE FUNCTION public.sync_profile_publication_from_vehicle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.sync_dealer_profile_publication(OLD.dealer_id);
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.dealer_id IS DISTINCT FROM NEW.dealer_id THEN
    PERFORM public.sync_dealer_profile_publication(OLD.dealer_id);
  END IF;

  PERFORM public.sync_dealer_profile_publication(NEW.dealer_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_publication_from_vehicle ON vehicles;
CREATE TRIGGER trg_sync_profile_publication_from_vehicle
  AFTER INSERT OR DELETE OR UPDATE OF dealer_id, status, images ON vehicles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_publication_from_vehicle();

REVOKE ALL ON FUNCTION public.sync_dealer_profile_publication(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_dealer_profile_publication(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.sync_dealer_profile_publication(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.sync_dealer_profile_publication(UUID) TO service_role;
