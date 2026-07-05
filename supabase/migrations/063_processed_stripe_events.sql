-- Migration 063 — Idempotencia de webhooks de Stripe.
--
-- Stripe reintenta la entrega de webhooks. Sin registro de eventos procesados, invoice.paid
-- re-provisionaría créditos de boost y un checkout de boost podría activarse dos veces.
-- El webhook inserta el event.id aquí antes de procesar; un unique-violation (PK) significa
-- "ya procesado" y corta el reprocesamiento. Solo lo usa el service_role.

CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  event_id     text PRIMARY KEY,
  type         text,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- Sin políticas RLS: solo el service_role (el webhook) accede; anon/authenticated no.
ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;
