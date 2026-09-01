-- 084 - Stripe checkout for paid add-ons.
--
-- addon_orders is the durable source for add-on purchases created by Stripe
-- Checkout. It covers one-time purchases, recurring add-on subscriptions, and
-- manual activation tasks for the admin team.

ALTER TABLE public.subscription_addons
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS current_period_start timestamptz,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_addons_stripe_subscription
  ON public.subscription_addons(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

ALTER TABLE public.boost_credits
  ADD COLUMN IF NOT EXISTS source_ref text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_boost_credits_source_ref
  ON public.boost_credits(source_ref)
  WHERE source_ref IS NOT NULL;
CREATE TABLE IF NOT EXISTS public.addon_orders (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  dealer_id                uuid NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  addon_id                 uuid NOT NULL REFERENCES public.addons(id),
  checkout_session_id      text UNIQUE,
  stripe_subscription_id   text,
  stripe_payment_intent_id text,
  stripe_customer_id       text,
  quantity                 integer NOT NULL DEFAULT 1,
  amount_cents             integer,
  currency                 text NOT NULL DEFAULT 'eur',
  status                   text NOT NULL DEFAULT 'pending_payment'
                           CHECK (status IN (
                             'pending_payment',
                             'pending_activation',
                             'active',
                             'delivered',
                             'canceled',
                             'payment_failed'
                           )),
  activation_mode          text NOT NULL DEFAULT 'automatic'
                           CHECK (activation_mode IN ('automatic', 'manual')),
  manual_activation_type   text,
  feed_url                 text,
  admin_notes              text,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean NOT NULL DEFAULT false,
  approved_at              timestamptz,
  approved_by              uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  delivered_at             timestamptz,
  delivered_by             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addon_orders_org ON public.addon_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_addon_orders_dealer ON public.addon_orders(dealer_id);
CREATE INDEX IF NOT EXISTS idx_addon_orders_status ON public.addon_orders(status);
CREATE INDEX IF NOT EXISTS idx_addon_orders_stripe_subscription
  ON public.addon_orders(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.organization_feature_overrides (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  feature_key           text NOT NULL,
  included              boolean NOT NULL DEFAULT true,
  availability_status   text NOT NULL DEFAULT 'operative'
                        CHECK (availability_status IN ('operative', 'partial', 'future')),
  display_label         text,
  status                text NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'canceled')),
  source_addon_order_id uuid REFERENCES public.addon_orders(id) ON DELETE SET NULL,
  starts_at             timestamptz NOT NULL DEFAULT now(),
  ends_at               timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_feature_overrides_one_active
  ON public.organization_feature_overrides(organization_id, feature_key)
  WHERE status = 'active';

ALTER TABLE public.addon_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_feature_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addon_orders_own_read" ON public.addon_orders FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_feature_overrides_own_read" ON public.organization_feature_overrides FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

