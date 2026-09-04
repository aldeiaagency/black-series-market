-- Hallazgo Codex 2026-09-04 (simulación E2E alta online, market_directo): el email de confirmación
-- de WF1 decía a todo solicitante que quedaba registrado en una "lista de comunicaciones para
-- recibir novedades y contenido de interés", pero el único checkbox del formulario público solo
-- autorizaba "valorar la solicitud y contactar conmigo" — sin consentimiento específico para
-- comunicaciones comerciales, como exige la propia política de privacidad del market
-- (/legal/privacidad §"Comunicaciones comerciales"). Se separa en un checkbox propio, opt-in,
-- no marcado por defecto.
alter table public.showroom_applications
  add column if not exists marketing_opt_in boolean not null default false;

comment on column public.showroom_applications.marketing_opt_in is
  'Consentimiento explícito y separado para comunicaciones comerciales (newsletter/novedades), distinto de la aceptación de privacidad/condiciones profesionales. No marcado por defecto.';
