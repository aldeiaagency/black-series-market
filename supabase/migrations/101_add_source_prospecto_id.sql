-- Traza el origen de una alta hasta su Prospecto de Airtable (agencia). Sin esto, una vez
-- creada la fila en showroom_applications no hay forma de enlazarla de vuelta al pipeline
-- comercial de la agencia (hallazgo de auditoria 2026-08-17, sin cerrar hasta ahora).
alter table public.showroom_applications
  add column if not exists source_prospecto_id text;

comment on column public.showroom_applications.source_prospecto_id is
  'Record ID de Airtable (tabla Prospectos, base BSA) cuando source=visita_agencia. Enviado por el workflow n8n "BSA - Watcher. Disparo checklist visita". NULL para altas market_directo (sin Prospecto de origen).';

alter table public.dealers
  add column if not exists source_prospecto_id text;

comment on column public.dealers.source_prospecto_id is
  'Copiado de showroom_applications.source_prospecto_id en la aprobacion. Permite cerrar el ciclo agencia -> market -> agencia (ej. WF-P3 onboarding fundador referenciando el Prospecto original).';
