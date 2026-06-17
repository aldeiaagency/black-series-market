-- Migration 042: Backfill de organizations/locations/members para dealers existentes
--
-- Contexto: las migraciones 023-028 crearon el sistema de planes/organizaciones,
-- pero NO migraron los dealers ya existentes a la nueva estructura. Resultado:
-- 21 dealers reales sin fila en `organizations` → getOrganizationIdForUser() devuelve
-- NULL → getEntitlements() devuelve NULL → el dashboard cae a tier 'basic' aunque el
-- dealer sea Elite (subscription_plan = 'elite' en la tabla dealers).
--
-- Este backfill crea, por cada dealer:
--   1. Una organization (dealer_id, name, slug heredados del dealer).
--   2. Una location primaria.
--   3. Un organization_member 'owner' con el profile_id del dealer.
--
-- NO crea subscriptions: getEntitlements cae de vuelta a dealers.subscription_plan
-- (legacy) cuando no hay suscripción real de Stripe. Ese fallback es justo para
-- estos dealers manuales. Las suscripciones reales llegarán vía webhook de Stripe.
--
-- Idempotente: cada paso usa WHERE NOT EXISTS → seguro de re-ejecutar.

-- ── 1. Organizations ─────────────────────────────────────────────────────────
INSERT INTO organizations (dealer_id, name, slug, is_verified, is_featured, status)
SELECT
  d.id,
  d.name,
  d.slug,
  COALESCE(d.is_verified, FALSE),
  COALESCE(d.is_featured, FALSE),
  CASE
    WHEN d.status::text = 'active'    THEN 'active'
    WHEN d.status::text = 'suspended' THEN 'suspended'
    ELSE 'pending'
  END
FROM dealers d
WHERE NOT EXISTS (
  SELECT 1 FROM organizations o WHERE o.dealer_id = d.id
);

-- ── 2. Locations primarias ───────────────────────────────────────────────────
INSERT INTO locations (organization_id, name, city, region, country, is_primary)
SELECT
  o.id,
  d.name,
  d.location_city,
  d.location_region,
  COALESCE(d.location_country, 'ES'),
  TRUE
FROM organizations o
JOIN dealers d ON d.id = o.dealer_id
WHERE o.dealer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM locations l
    WHERE l.organization_id = o.id AND l.is_primary = TRUE
  );

-- ── 3. Organization members (owner) ──────────────────────────────────────────
INSERT INTO organization_members (organization_id, user_id, role)
SELECT
  o.id,
  d.profile_id,
  'owner'
FROM organizations o
JOIN dealers d ON d.id = o.dealer_id
WHERE o.dealer_id IS NOT NULL
  AND d.profile_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM organization_members m
    WHERE m.organization_id = o.id AND m.user_id = d.profile_id
  );
