-- Campos de perfil capturables en automático por la investigación pre-visita (skill informe-previsita)
-- desde señales públicas (Google Business Profile, web propia) — se copian a dealers en la aprobación,
-- igual que ya hacen logo_url/website/profile_description.
alter table showroom_applications
  add column if not exists address text,
  add column if not exists years_in_business integer,
  add column if not exists facebook_url text,
  add column if not exists youtube_url text,
  add column if not exists tiktok_url text,
  add column if not exists linkedin_url text,
  add column if not exists specialties text[],
  add column if not exists services text[];

comment on column showroom_applications.address is
  'Dirección observada en Google Business Profile — solo si hay evidencia pública, nunca inventada.';
comment on column showroom_applications.specialties is
  'Valores del enum de dealers.certifications (sport, classic, premium, motorcycle, import, suv, supercar, custom) inferidos con evidencia observable (p. ej. stock de deportivos → sport).';
comment on column showroom_applications.services is
  'Valores del enum de dealers.services (financing, trade_in, warranty, transport_nat, transport_intl, own_workshop, detailing, home_delivery) inferidos con evidencia observable (p. ej. mención de taller propio → own_workshop).';
