-- P7 Etapa 0 (B+E): vistas de reporting para el calendario de contenidos.
-- No materializadas: volumen bajo hoy, evita el coste de tener que refrescarlas.
BEGIN;

-- B. Rendimiento por pieza (utm_campaign) y variante de canal/formato (utm_content).
-- Grano = (utm_campaign, utm_content) porque una misma pieza puede tener varias variantes
-- (feed/story/espejo) con utm_content distinto bajo el mismo utm_campaign. Cada fuente se
-- agrega en su propia CTE antes de unir — un JOIN directo analytics_events+leads duplicaría
-- filas.
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
campaigns AS (
  SELECT utm_campaign, utm_content FROM events_agg
  UNION
  SELECT utm_campaign, utm_content FROM leads_agg
  UNION
  SELECT utm_campaign, utm_content FROM alerts_agg
  UNION
  SELECT utm_campaign, utm_content FROM requests_agg
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
  COALESCE(h.first_contacts, 0)      AS first_contacts
FROM campaigns c
LEFT JOIN events_agg   e ON e.utm_campaign = c.utm_campaign AND e.utm_content IS NOT DISTINCT FROM c.utm_content
LEFT JOIN leads_agg    l ON l.utm_campaign = c.utm_campaign AND l.utm_content IS NOT DISTINCT FROM c.utm_content
LEFT JOIN alerts_agg   a ON a.utm_campaign = c.utm_campaign AND a.utm_content IS NOT DISTINCT FROM c.utm_content
LEFT JOIN requests_agg r ON r.utm_campaign = c.utm_campaign AND r.utm_content IS NOT DISTINCT FROM c.utm_content
LEFT JOIN handoffs_agg h ON h.utm_campaign = c.utm_campaign AND h.utm_content IS NOT DISTINCT FROM c.utm_content
ORDER BY e.first_seen DESC NULLS LAST;

-- E. content_readiness_score: si una ficha tiene material suficiente para producir contenido
-- (no es una nota de calidad del vehículo en sí). Video es bonus, no requisito: no hay
-- capacidad de grabar vídeo nativo (restricción ya cerrada en P7 S5.1).
CREATE OR REPLACE VIEW public.vehicle_content_readiness AS
SELECT
  id AS vehicle_id,
  dealer_id,
  status,
  LEAST(
    (CASE WHEN jsonb_array_length(COALESCE(images, '[]'::jsonb)) >= 8 THEN 1 ELSE 0 END)
    + (CASE WHEN length(COALESCE(description, '')) >= 300 THEN 1 ELSE 0 END)
    + (CASE WHEN has_carfax OR has_service_history OR num_owners IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN COALESCE(array_length(equipment, 1), 0) >= 5
              OR COALESCE(equipment_extra, '') <> '' THEN 1 ELSE 0 END)
    + (CASE WHEN has_warranty OR itv_valid_until IS NOT NULL
              OR (last_confirmed_at IS NOT NULL AND last_confirmed_at > NOW() - INTERVAL '30 days')
         THEN 1 ELSE 0 END)
    + (CASE WHEN video_url IS NOT NULL AND video_url <> '' THEN 0.5 ELSE 0 END),
    5
  ) AS content_readiness_score,
  jsonb_array_length(COALESCE(images, '[]'::jsonb)) AS images_count,
  length(COALESCE(description, '')) AS description_length,
  (video_url IS NOT NULL AND video_url <> '') AS has_video
FROM public.vehicles
WHERE status = 'active';

COMMIT;
