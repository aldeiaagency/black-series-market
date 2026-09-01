-- P3a: measurement foundations for lead persistence, handoff fulfillment,
-- acquisition context, consent-safe analytics and canonical event names.
BEGIN;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS acquisition_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE public.search_alerts
  ADD COLUMN IF NOT EXISTS field_provenance JSONB NOT NULL DEFAULT '{}'::jsonb;
UPDATE public.analytics_events SET metadata = '{}'::jsonb WHERE metadata IS NULL;
ALTER TABLE public.analytics_events
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb,
  ALTER COLUMN metadata SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_created
  ON public.analytics_events(session_id, created_at DESC) WHERE session_id IS NOT NULL;

-- One opportunity has exactly one handoff in Wave 1. Generalising later only
-- requires dropping the UNIQUE constraint on lead_id.
CREATE TABLE IF NOT EXISTS public.lead_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  delivery_confirmed_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  decision TEXT CHECK (decision IS NULL OR decision IN ('accepted', 'rejected')),
  decision_at TIMESTAMPTZ,
  first_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lead_handoffs_ack_requires_delivery CHECK (
    acknowledged_at IS NULL OR delivery_confirmed_at IS NOT NULL
  ),
  CONSTRAINT lead_handoffs_decision_requires_ack CHECK (
    decision IS NULL OR acknowledged_at IS NOT NULL
  ),
  CONSTRAINT lead_handoffs_decision_timestamp CHECK (
    (decision IS NULL AND decision_at IS NULL)
    OR (decision IS NOT NULL AND decision_at IS NOT NULL)
  ),
  CONSTRAINT lead_handoffs_rejection_is_terminal CHECK (
    decision IS DISTINCT FROM 'rejected' OR first_contact_at IS NULL
  )
);
CREATE INDEX IF NOT EXISTS idx_lead_handoffs_dealer_created
  ON public.lead_handoffs(dealer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_handoffs_recovery
  ON public.lead_handoffs(dealer_id, created_at DESC) WHERE decision = 'rejected';
ALTER TABLE public.lead_handoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY lead_handoffs_dealer_select ON public.lead_handoffs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.dealers d
    WHERE d.id = lead_handoffs.dealer_id AND d.profile_id = auth.uid()
  ));
CREATE POLICY lead_handoffs_service_all ON public.lead_handoffs FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE public.lead_events ADD COLUMN IF NOT EXISTS handoff_id UUID
  REFERENCES public.lead_handoffs(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_lead_events_handoff_dt
  ON public.lead_events(handoff_id, created_at DESC) WHERE handoff_id IS NOT NULL;

-- Preserve the complete vocabulary introduced through migration 046.
ALTER TABLE public.lead_events DROP CONSTRAINT IF EXISTS lead_events_type_check;
ALTER TABLE public.lead_events ADD CONSTRAINT lead_events_type_check CHECK (type IN (
  'form_submitted','assistant_started','assistant_message',
  'assistant_completed','assistant_abandoned','whatsapp_handoff',
  'whatsapp_click','phone_click','appointment_proposed',
  'appointment_confirmed','appointment_cancelled','appointment_rescheduled',
  'lead_scored','hot_lead_alert_created','hot_lead_alert_resolved',
  'calendar_connected','calendar_disconnected','status_changed','note_added',
  'lead_persisted','handoff_delivery_confirmed','handoff_acknowledged',
  'handoff_accepted','handoff_rejected','handoff_first_contact'
));

CREATE OR REPLACE FUNCTION public.fn_lead_handoffs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_lead_handoffs_updated_at ON public.lead_handoffs;
CREATE TRIGGER trg_lead_handoffs_updated_at BEFORE UPDATE ON public.lead_handoffs
  FOR EACH ROW EXECUTE FUNCTION public.fn_lead_handoffs_updated_at();

-- Backfill only facts directly evidenced by existing records.
INSERT INTO public.lead_handoffs (lead_id, dealer_id, created_at, updated_at)
SELECT id, dealer_id, created_at, created_at FROM public.leads
ON CONFLICT (lead_id) DO NOTHING;
INSERT INTO public.lead_events (lead_id, dealer_id, handoff_id, type, payload, created_at)
SELECT l.id, l.dealer_id, h.id, 'lead_persisted',
       jsonb_build_object('scope','opportunity','backfilled',true,'initial_status',l.status),
       l.created_at
FROM public.leads l JOIN public.lead_handoffs h ON h.lead_id = l.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.lead_events e
  WHERE e.lead_id = l.id AND e.type = 'lead_persisted'
);

UPDATE public.lead_handoffs h SET
  delivery_confirmed_at = evidence.confirmed_at,
  updated_at = GREATEST(h.updated_at, evidence.confirmed_at)
FROM (
  SELECT entity_id AS lead_id, MIN(COALESCE(sent_at, created_at)) AS confirmed_at
  FROM public.integration_events
  WHERE event_type = 'lead.created' AND entity_type = 'lead'
    AND status = 'sent' AND entity_id IS NOT NULL GROUP BY entity_id
) evidence
WHERE h.lead_id = evidence.lead_id AND h.delivery_confirmed_at IS NULL;
INSERT INTO public.lead_events (lead_id, dealer_id, handoff_id, type, payload, created_at)
SELECT i.entity_id, h.dealer_id, h.id, 'handoff_delivery_confirmed',
       jsonb_build_object('scope','handoff','integration_event_id',i.id,
                          'evidence','integration_events.status=sent','backfilled',true),
       COALESCE(i.sent_at, i.created_at)
FROM public.integration_events i JOIN public.lead_handoffs h ON h.lead_id = i.entity_id
WHERE i.event_type = 'lead.created' AND i.entity_type = 'lead' AND i.status = 'sent'
  AND NOT EXISTS (
    SELECT 1 FROM public.lead_events e
    WHERE e.type = 'handoff_delivery_confirmed'
      AND e.payload->>'integration_event_id' = i.id::text
  );

CREATE OR REPLACE FUNCTION public.fn_lead_created_measurement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_handoff_id UUID;
BEGIN
  INSERT INTO public.lead_handoffs (lead_id, dealer_id)
  VALUES (NEW.id, NEW.dealer_id) RETURNING id INTO v_handoff_id;
  INSERT INTO public.lead_events (lead_id, dealer_id, handoff_id, type, payload)
  VALUES (NEW.id, NEW.dealer_id, v_handoff_id, 'lead_persisted',
          jsonb_build_object('scope','opportunity','initial_status',NEW.status,
                             'source_channel',NEW.source_channel));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_lead_created_measurement ON public.leads;
CREATE TRIGGER trg_lead_created_measurement AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.fn_lead_created_measurement();

CREATE OR REPLACE FUNCTION public.fn_lead_status_history()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_handoff_id UUID;
BEGIN
  SELECT id INTO v_handoff_id FROM public.lead_handoffs WHERE lead_id = NEW.id;
  INSERT INTO public.lead_events (lead_id, dealer_id, handoff_id, type, payload)
  VALUES (NEW.id, NEW.dealer_id, v_handoff_id, 'status_changed',
          jsonb_build_object('scope','opportunity','from',OLD.status,'to',NEW.status));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_lead_status_history ON public.leads;
CREATE TRIGGER trg_lead_status_history AFTER UPDATE OF status ON public.leads
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.fn_lead_status_history();

CREATE OR REPLACE FUNCTION public.fn_integration_event_delivery_confirmed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_handoff public.lead_handoffs%ROWTYPE; v_confirmed_at TIMESTAMPTZ;
BEGIN
  IF NEW.status <> 'sent' OR NEW.event_type <> 'lead.created'
     OR NEW.entity_type <> 'lead' OR NEW.entity_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'sent' THEN RETURN NEW; END IF;
  SELECT * INTO v_handoff FROM public.lead_handoffs
    WHERE lead_id = NEW.entity_id FOR UPDATE;
  IF NOT FOUND THEN RETURN NEW; END IF;
  v_confirmed_at := COALESCE(NEW.sent_at, NOW());
  UPDATE public.lead_handoffs
    SET delivery_confirmed_at = COALESCE(delivery_confirmed_at, v_confirmed_at)
    WHERE id = v_handoff.id;
  INSERT INTO public.lead_events (lead_id, dealer_id, handoff_id, type, payload, created_at)
  SELECT NEW.entity_id, v_handoff.dealer_id, v_handoff.id,
         'handoff_delivery_confirmed',
         jsonb_build_object('scope','handoff','integration_event_id',NEW.id,
                            'evidence','integration_events.status=sent'),
         v_confirmed_at
  WHERE NOT EXISTS (
    SELECT 1 FROM public.lead_events e
    WHERE e.type = 'handoff_delivery_confirmed'
      AND e.payload->>'integration_event_id' = NEW.id::text
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_integration_event_delivery_confirmed ON public.integration_events;
CREATE TRIGGER trg_integration_event_delivery_confirmed
  AFTER INSERT OR UPDATE OF status ON public.integration_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_integration_event_delivery_confirmed();

CREATE OR REPLACE FUNCTION public.record_lead_handoff_event(
  p_lead_id UUID, p_dealer_id UUID, p_event_type TEXT,
  p_payload JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_handoff public.lead_handoffs%ROWTYPE; v_now TIMESTAMPTZ := NOW();
BEGIN
  SELECT * INTO v_handoff FROM public.lead_handoffs
  WHERE lead_id = p_lead_id AND dealer_id = p_dealer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'handoff_not_found' USING ERRCODE = 'P0002'; END IF;

  CASE p_event_type
    WHEN 'handoff_acknowledged' THEN
      IF v_handoff.acknowledged_at IS NOT NULL THEN
        RETURN jsonb_build_object('ok',true,'idempotent',true);
      END IF;
      IF v_handoff.delivery_confirmed_at IS NULL OR v_handoff.first_contact_at IS NOT NULL THEN
        RAISE EXCEPTION 'invalid_handoff_transition' USING ERRCODE = '23514';
      END IF;
      UPDATE public.lead_handoffs SET acknowledged_at = v_now WHERE id = v_handoff.id;
    WHEN 'handoff_accepted' THEN
      IF v_handoff.decision = 'accepted' THEN
        RETURN jsonb_build_object('ok',true,'idempotent',true);
      END IF;
      IF v_handoff.acknowledged_at IS NULL OR v_handoff.decision IS NOT NULL
         OR v_handoff.first_contact_at IS NOT NULL THEN
        RAISE EXCEPTION 'invalid_handoff_transition' USING ERRCODE = '23514';
      END IF;
      UPDATE public.lead_handoffs SET decision = 'accepted', decision_at = v_now
      WHERE id = v_handoff.id;
    WHEN 'handoff_rejected' THEN
      IF v_handoff.decision = 'rejected' THEN
        RETURN jsonb_build_object('ok',true,'idempotent',true);
      END IF;
      IF v_handoff.acknowledged_at IS NULL OR v_handoff.decision IS NOT NULL
         OR v_handoff.first_contact_at IS NOT NULL THEN
        RAISE EXCEPTION 'invalid_handoff_transition' USING ERRCODE = '23514';
      END IF;
      UPDATE public.lead_handoffs SET decision = 'rejected', decision_at = v_now
      WHERE id = v_handoff.id;
    WHEN 'handoff_first_contact' THEN
      IF v_handoff.first_contact_at IS NOT NULL THEN
        RETURN jsonb_build_object('ok',true,'idempotent',true);
      END IF;
      IF v_handoff.decision = 'rejected' THEN
        RAISE EXCEPTION 'invalid_handoff_transition' USING ERRCODE = '23514';
      END IF;
      UPDATE public.lead_handoffs SET first_contact_at = v_now WHERE id = v_handoff.id;
    ELSE RAISE EXCEPTION 'invalid_handoff_event' USING ERRCODE = '22023';
  END CASE;

  INSERT INTO public.lead_events (lead_id, dealer_id, handoff_id, type, payload, created_at)
  VALUES (p_lead_id, p_dealer_id, v_handoff.id, p_event_type,
          COALESCE(p_payload,'{}'::jsonb) || jsonb_build_object('scope','handoff'), v_now);
  RETURN jsonb_build_object('ok',true,'idempotent',false,'handoff_id',v_handoff.id,
                            'event_type',p_event_type);
END;
$$;
REVOKE ALL ON FUNCTION public.record_lead_handoff_event(UUID,UUID,TEXT,JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_lead_handoff_event(UUID,UUID,TEXT,JSONB)
  TO service_role;

CREATE OR REPLACE FUNCTION public.update_lead_status_with_measurement(
  p_lead_id UUID, p_dealer_id UUID, p_status TEXT,
  p_mark_first_contact BOOLEAN DEFAULT FALSE,
  p_payload JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_current public.lead_status;
BEGIN
  SELECT status INTO v_current FROM public.leads
  WHERE id = p_lead_id AND dealer_id = p_dealer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'lead_not_found' USING ERRCODE = 'P0002'; END IF;
  IF p_mark_first_contact THEN
    PERFORM public.record_lead_handoff_event(
      p_lead_id, p_dealer_id, 'handoff_first_contact', p_payload
    );
  END IF;
  IF v_current IS DISTINCT FROM p_status::public.lead_status THEN
    UPDATE public.leads SET status = p_status::public.lead_status, updated_at = NOW()
    WHERE id = p_lead_id AND dealer_id = p_dealer_id;
  END IF;
  RETURN jsonb_build_object('ok',true,'status',p_status);
END;
$$;
REVOKE ALL ON FUNCTION public.update_lead_status_with_measurement(UUID,UUID,TEXT,BOOLEAN,JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_lead_status_with_measurement(UUID,UUID,TEXT,BOOLEAN,JSONB)
  TO service_role;

-- Canonical favorite_added and legacy vehicle_saved feed the same daily metric.
CREATE OR REPLACE FUNCTION public.fn_analytics_daily_upsert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.dealer_id IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.analytics_daily (date,dealer_id,views,contacts,saved,whatsapp,phone)
  VALUES (
    NEW.created_at::date, NEW.dealer_id,
    CASE WHEN NEW.event_type IN ('vehicle_view','view') THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type IN ('vehicle_contact_submit','contact') THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type IN ('favorite_added','vehicle_saved') THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'vehicle_whatsapp_click' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'vehicle_phone_click' THEN 1 ELSE 0 END
  ) ON CONFLICT (date,dealer_id) DO UPDATE SET
    views=analytics_daily.views+EXCLUDED.views,
    contacts=analytics_daily.contacts+EXCLUDED.contacts,
    saved=analytics_daily.saved+EXCLUDED.saved,
    whatsapp=analytics_daily.whatsapp+EXCLUDED.whatsapp,
    phone=analytics_daily.phone+EXCLUDED.phone;
  RETURN NEW;
END;
$$;

INSERT INTO public.analytics_daily (date,dealer_id,views,contacts,saved,whatsapp,phone)
SELECT created_at::date, dealer_id,
  COUNT(*) FILTER (WHERE event_type IN ('vehicle_view','view')),
  COUNT(*) FILTER (WHERE event_type IN ('vehicle_contact_submit','contact')),
  COUNT(*) FILTER (WHERE event_type IN ('favorite_added','vehicle_saved')),
  COUNT(*) FILTER (WHERE event_type = 'vehicle_whatsapp_click'),
  COUNT(*) FILTER (WHERE event_type = 'vehicle_phone_click')
FROM public.analytics_events WHERE dealer_id IS NOT NULL GROUP BY 1,2
ON CONFLICT (date,dealer_id) DO UPDATE SET
  views=EXCLUDED.views, contacts=EXCLUDED.contacts, saved=EXCLUDED.saved,
  whatsapp=EXCLUDED.whatsapp, phone=EXCLUDED.phone;

DO $policy$
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS %I ON public.analytics_events',
                 'Public can insert analytics');
END
$policy$;

COMMIT;
