-- Hallazgo 2026-09-05: una solicitud market_directo que pasa el gate "Cumple criterios ·
-- invitar a llamada" (markQualifiedAwaitingCall, app/(admin)/admin/altas-showroom/actions.ts)
-- entra en status = 'qualified_awaiting_call' y se queda ahí hasta que un admin la aprueba o la
-- rechaza tras la llamada de admisión — pero hasta ahora no había ningún registro de CUÁNDO entró
-- en ese estado. Un admin mirando /admin/altas-showroom no tenía forma de distinguir una
-- solicitud que lleva 2 días esperando llamada de una que lleva 2 meses olvidada sin que nadie la
-- agende: gap operativo documentado en docs/PENDIENTES.md sobre la falta de visibilidad del
-- embudo de llamada de admisión. Columna nullable: las solicitudes que nunca pasaron por este
-- estado (visita_agencia, o market_directo todavía sin cualificar) quedan en NULL sin necesidad
-- de backfill.
alter table public.showroom_applications
  add column if not exists qualified_at timestamptz;

comment on column public.showroom_applications.qualified_at is
  'Momento en que markQualifiedAwaitingCall() marcó la solicitud como qualified_awaiting_call (invitada a la llamada de admisión). NULL si nunca pasó por ese estado. Se usa en el admin para mostrar cuánto lleva esperando la llamada.';
