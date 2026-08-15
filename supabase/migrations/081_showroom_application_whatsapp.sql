-- 081 - Conserva el WhatsApp publico investigado durante la pre-visita
-- para copiarlo al perfil del dealer cuando se aprueba el alta.

ALTER TABLE showroom_applications
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;
