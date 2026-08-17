-- 082 - Sala tokenizada de configuracion para showrooms fundadores.
--
-- El token en claro solo vive en el enlace enviado por email. La base guarda
-- su hash SHA-256, con expiracion y un solo uso. Todo acceso pasa por API
-- routes con service_role.

CREATE TABLE IF NOT EXISTS dealer_setup_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id   UUID        NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dealer_setup_tokens_token_hash
  ON dealer_setup_tokens (token_hash);

ALTER TABLE dealer_setup_tokens ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE dealer_setup_tokens FROM anon;
REVOKE ALL ON TABLE dealer_setup_tokens FROM authenticated;
GRANT ALL ON TABLE dealer_setup_tokens TO service_role;

COMMENT ON TABLE dealer_setup_tokens IS
  'Tokens hashados de un solo uso para la sala publica de configuracion del showroom.';
COMMENT ON COLUMN dealer_setup_tokens.token_hash IS
  'SHA-256 base64url del token en claro. El token en claro nunca se persiste.';

ALTER TABLE showroom_assistant_config
  ADD COLUMN IF NOT EXISTS context JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN showroom_assistant_config.context IS
  'Contexto operativo confirmado durante la sala de configuracion: financiacion, servicios, horario de atencion, negociacion, documentos y stock.';

ALTER TABLE dealers
  DROP CONSTRAINT IF EXISTS dealers_profile_status_check;

ALTER TABLE dealers
  ADD CONSTRAINT dealers_profile_status_check
  CHECK (profile_status IN ('draft', 'pending_review', 'published'));

COMMENT ON COLUMN dealers.profile_status IS
  'draft: perfil publico oculto. pending_review: cumple gate minimo y espera revision humana inicial. published: publicado tras revision humana.';

CREATE OR REPLACE FUNCTION public.sync_dealer_profile_publication(p_dealer_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_logo          BOOLEAN;
  v_has_active_photos BOOLEAN;
  v_current_status    TEXT;
  v_next_status       TEXT;
BEGIN
  IF p_dealer_id IS NULL THEN
    RETURN 'draft';
  END IF;

  SELECT
    NULLIF(BTRIM(logo_url), '') IS NOT NULL,
    profile_status
  INTO v_has_logo, v_current_status
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

  IF COALESCE(v_has_logo, FALSE) AND v_has_active_photos THEN
    v_next_status := CASE
      WHEN v_current_status = 'published' THEN 'published'
      WHEN v_current_status = 'pending_review' THEN 'pending_review'
      ELSE 'pending_review'
    END;
  ELSE
    v_next_status := 'draft';
  END IF;

  UPDATE dealers
  SET profile_status = v_next_status,
      updated_at = NOW()
  WHERE id = p_dealer_id
    AND profile_status IS DISTINCT FROM v_next_status;

  RETURN v_next_status;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_dealer_profile_publication(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_dealer_profile_publication(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.sync_dealer_profile_publication(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.sync_dealer_profile_publication(UUID) TO service_role;
