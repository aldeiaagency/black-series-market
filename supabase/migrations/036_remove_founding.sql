-- Migration 036: Eliminar el programa Founding
-- Decisión de cierre (2026-06-16, docs/planes-suscripcion-definitivos.md):
-- los primeros showrooms se captan con visita presencial, no con descuento
-- Founding. Se retiran las columnas y la tabla asociadas; no se tocan las
-- migraciones 023/025/029 (ya aplicadas) para no romper el historial.

-- Tabla dedicada al programa Founding (miembros, alta/revocación)
DROP TABLE IF EXISTS founding_memberships CASCADE;

-- Columna de marca de suscripción Founding
ALTER TABLE subscriptions DROP COLUMN IF EXISTS is_founding;

-- Precio e ID de Stripe Founding por plan
ALTER TABLE plans DROP COLUMN IF EXISTS founding_monthly_price;
ALTER TABLE plans DROP COLUMN IF EXISTS stripe_founding_price_id;
