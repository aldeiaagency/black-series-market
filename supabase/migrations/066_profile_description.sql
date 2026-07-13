-- Descripción del perfil del dealer, redactada por la skill informe-previsita a partir de datos
-- observados (nunca inventados) — se copia a dealers.description en la aprobación, igual que logo_url.
ALTER TABLE showroom_applications ADD COLUMN IF NOT EXISTS profile_description TEXT;
