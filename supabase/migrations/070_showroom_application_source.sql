-- Distingue el origen de una solicitud de alta de showroom: visita presencial (ya auditada
-- con la skill informe-previsita) vs alta directa desde el market (necesita auditoría online).
alter table showroom_applications
  add column if not exists source text not null default 'market_directo'
  check (source in ('market_directo', 'visita_agencia'));

comment on column showroom_applications.source is
  'market_directo: formulario público del market, requiere auditoría de reputación online (WF1). '
  'visita_agencia: alta disparada tras visita presencial con el checklist de la agencia — la reputación ya se auditó con la skill informe-previsita, WF1 salta la investigación.';
