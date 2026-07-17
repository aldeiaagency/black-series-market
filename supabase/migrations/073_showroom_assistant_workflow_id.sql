-- Migración 073 — columna para referenciar el workflow de n8n clonado por dealer.
--
-- Contexto: hasta ahora todos los dealers Professional/Elite comparten el mismo workflow
-- de n8n (WF7) — `showroom_assistant_config.webhook_url` ya era por-dealer en el esquema
-- pero siempre se escribía la misma URL. A partir de ahora cada dealer puede tener su propio
-- workflow clonado; esta columna guarda su id para poder gestionarlo (activar/desactivar,
-- enlazar desde el admin) vía la API de n8n. NULL significa "usando el workflow compartido"
-- (fallback si el clonado falla o el dealer no tiene plan Professional/Elite).

alter table showroom_assistant_config
  add column if not exists n8n_workflow_id text;

comment on column showroom_assistant_config.n8n_workflow_id is
  'Id del workflow de n8n clonado específicamente para este dealer. NULL = usando el workflow compartido (WF7) como fallback.';
