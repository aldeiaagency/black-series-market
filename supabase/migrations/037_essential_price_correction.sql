-- Migration 037: Corrección de precio Essential
-- docs/planes-suscripcion-definitivos.md cerró Essential en 197 €/mes + IVA
-- (el seed 029 todavía tenía el precio de la propuesta anterior, 179 €).

UPDATE plans SET monthly_price = 197, updated_at = NOW() WHERE slug = 'essential';
