-- Migración 075 — registro de aceptación de las Condiciones para Profesionales.
--
-- Contexto: hasta ahora el alta de un showroom solo enlazaba a un documento legal publicado
-- (browsewrap) sin checkbox ni registro de aceptación. Tras revisión (docs/legal-pending-data.md,
-- sección "Revisión preparatoria — alta de profesionales"), se pasa a un modelo clickwrap:
-- checkbox obligatorio en el alta + versión/fecha de aceptación persistida.
--
-- Dos sitios distintos porque una solicitud (showroom_applications) puede venir del formulario
-- público (con checkbox) o de la visita presencial de la agencia (source='visita_agencia', sin
-- checkbox — en ese caso queda NULL aquí y se resuelve más tarde en el primer acceso al dashboard,
-- ver app/(auth)/aceptar-condiciones/). dealers guarda el registro definitivo y duradero de la
-- cuenta ya aprobada, copiado desde la solicitud si existía.

alter table showroom_applications
  add column if not exists terms_accepted_version text,
  add column if not exists terms_accepted_at      timestamptz;

alter table dealers
  add column if not exists terms_accepted_version text,
  add column if not exists terms_accepted_at      timestamptz;

comment on column dealers.terms_accepted_at is
  'NULL = pendiente de aceptar las Condiciones para Profesionales (ver app/(auth)/aceptar-condiciones). El layout del dashboard redirige ahí mientras sea NULL.';
