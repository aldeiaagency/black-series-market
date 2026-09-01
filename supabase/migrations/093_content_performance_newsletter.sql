-- P7: content_piece_performance no contaba conversiones a newsletter — el ledger de
-- 092 también guarda acquisition_context, así que una pieza que convierta a alta de
-- newsletter debía aparecer en el reporting de contenido igual que leads/alertas/a
-- la carta. Hallazgo de la auditoría de Codex sobre la implementación de la newsletter.
BEGIN;

CREATE OR REPLACE VIEW public.content_piece_performance AS
WITH events_agg AS (
  SELECT
    metadata->'acquisition_context'->>'utm_campaign' AS utm_campaign,
    metadata->'acquisition_context'->>'utm_content'  AS utm_content,
    MAX(metadata->'acquisition_context'->>'utm_source') AS utm_source,
    MAX(metadata->'acquisition_context'->>'utm_medium') AS utm_medium,
    MIN(created_at) AS first_seen,
    MAX(created_at) AS last_seen,
    COUNT(DISTINCT session_id) AS sessions_distinct,
    COUNT(*) FILTER (WHERE event_type = 'vehicle_view') AS vehicle_views,
    COUNT(*) FILTER (WHERE event_type IN ('favorite_added', 'vehicle_saved')) AS favorites,
    COUNT(*) FILTER (WHERE event_type = 'vehicle_whatsapp_click') AS whatsapp_clicks,
    COUNT(*) FILTER (WHERE event_type = 'vehicle_phone_click') AS phone_clicks
  FROM public.analytics_events
  WHERE metadata->'acquisition_context'->>'utm_campaign' IS NOT NULL
  GROUP BY 1, 2
),
leads_agg AS (
  SELECT
    acquisition_context->>'utm_campaign' AS utm_campaign,
    acquisition_context->>'utm_content'  AS utm_content,
    COUNT(*) AS persisted_leads
  FROM public.leads
  WHERE acquisition_context->>'utm_campaign' IS NOT NULL
  GROUP BY 1, 2
),
alerts_agg AS (
  SELECT
    acquisition_context->>'utm_campaign' AS utm_campaign,
    acquisition_context->>'utm_content'  AS utm_content,
    COUNT(*) AS search_alerts_created
  FROM public.search_alerts
  WHERE acquisition_context->>'utm_campaign' IS NOT NULL
  GROUP BY 1, 2
),
requests_agg AS (
  SELECT
    metadata->'acquisition_context'->>'utm_campaign' AS utm_campaign,
    metadata->'acquisition_context'->>'utm_content'  AS utm_content,
    COUNT(*) AS custom_requests_created
  FROM public.custom_requests
  WHERE metadata->'acquisition_context'->>'utm_campaign' IS NOT NULL
  GROUP BY 1, 2
),
handoffs_agg AS (
  SELECT
    l.acquisition_context->>'utm_campaign' AS utm_campaign,
    l.acquisition_context->>'utm_content'  AS utm_content,
    COUNT(h.id) FILTER (WHERE h.delivery_confirmed_at IS NOT NULL) AS handoffs_delivered,
    COUNT(h.id) FILTER (WHERE h.decision = 'accepted') AS handoffs_accepted,
    COUNT(h.id) FILTER (WHERE h.first_contact_at IS NOT NULL) AS first_contacts
  FROM public.lead_handoffs h
  JOIN public.leads l ON l.id = h.lead_id
  WHERE l.acquisition_context->>'utm_campaign' IS NOT NULL
  GROUP BY 1, 2
),
newsletter_agg AS (
  SELECT
    acquisition_context->>'utm_campaign' AS utm_campaign,
    acquisition_context->>'utm_content'  AS utm_content,
    COUNT(*) AS newsletter_requested,
    COUNT(*) FILTER (WHERE status = 'confirmed') AS newsletter_confirmed
  FROM public.newsletter_subscriptions
  WHERE acquisition_context->>'utm_campaign' IS NOT NULL
  GROUP BY 1, 2
),
campaigns AS (
  SELECT utm_campaign, utm_content FROM events_agg
  UNION
  SELECT utm_campaign, utm_content FROM leads_agg
  UNION
  SELECT utm_campaign, utm_content FROM alerts_agg
  UNION
  SELECT utm_campaign, utm_content FROM requests_agg
  UNION
  SELECT utm_campaign, utm_content FROM newsletter_agg
)
SELECT
  c.utm_campaign,
  c.utm_content,
  e.utm_source,
  e.utm_medium,
  e.first_seen,
  e.last_seen,
  COALESCE(e.sessions_distinct, 0)   AS sessions_distinct,
  COALESCE(e.vehicle_views, 0)       AS vehicle_views,
  COALESCE(e.favorites, 0)           AS favorites,
  COALESCE(e.whatsapp_clicks, 0)     AS whatsapp_clicks,
  COALESCE(e.phone_clicks, 0)        AS phone_clicks,
  COALESCE(a.search_alerts_created, 0)   AS search_alerts_created,
  COALESCE(r.custom_requests_created, 0) AS custom_requests_created,
  COALESCE(l.persisted_leads, 0)     AS persisted_leads,
  COALESCE(h.handoffs_delivered, 0)  AS handoffs_delivered,
  COALESCE(h.handoffs_accepted, 0)   AS handoffs_accepted,
  COALESCE(h.first_contacts, 0)      AS first_contacts,
  COALESCE(n.newsletter_requested, 0) AS newsletter_requested,
  COALESCE(n.newsletter_confirmed, 0) AS newsletter_confirmed
FROM campaigns c
LEFT JOIN events_agg     e ON e.utm_campaign = c.utm_campaign AND e.utm_content IS NOT DISTINCT FROM c.utm_content
LEFT JOIN leads_agg      l ON l.utm_campaign = c.utm_campaign AND l.utm_content IS NOT DISTINCT FROM c.utm_content
LEFT JOIN alerts_agg     a ON a.utm_campaign = c.utm_campaign AND a.utm_content IS NOT DISTINCT FROM c.utm_content
LEFT JOIN requests_agg   r ON r.utm_campaign = c.utm_campaign AND r.utm_content IS NOT DISTINCT FROM c.utm_content
LEFT JOIN handoffs_agg   h ON h.utm_campaign = c.utm_campaign AND h.utm_content IS NOT DISTINCT FROM c.utm_content
LEFT JOIN newsletter_agg n ON n.utm_campaign = c.utm_campaign AND n.utm_content IS NOT DISTINCT FROM c.utm_content
ORDER BY e.first_seen DESC NULLS LAST;

-- Hallazgo de seguridad real de la auditoría de Codex, verificado empíricamente antes de
-- corregir: ambas vistas de reporting (creadas en 091) eran legibles vía PostgREST con la
-- clave anon pública — comprobado con una petición real, `content_piece_performance` y
-- `vehicle_content_readiness` devolvían 200. Postgres resuelve las vistas con los permisos
-- del propietario salvo que se revoquen explícitamente — el RLS de las tablas base
-- (newsletter_subscriptions, leads, etc.) no protegía nada una vez expuestas por la vista.
REVOKE ALL ON public.content_piece_performance FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.vehicle_content_readiness FROM PUBLIC, anon, authenticated;

COMMIT;
