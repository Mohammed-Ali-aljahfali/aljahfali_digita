-- Al-Jahfali Digital: additive, transactional store upgrade.
-- Apply to an isolated Supabase project first. Back up schema AND data before production.
-- Existing products/prices/orders are retained. No catalogue, customers or payment accounts are seeded.
BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text, full_name text, phone text, avatar_url text,
  role text DEFAULT 'customer' CHECK (role IN ('customer','admin','moderator')),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY, raw_name text, title text NOT NULL, service_key text, service_name text,
  category text, brand_color text, brand_gradient text, brand_label text, icon text,
  is_guaranteed boolean DEFAULT true, warranty_text text, warranty_policy text, duration text,
  stock integer DEFAULT 0, sold integer DEFAULT 0, in_stock boolean DEFAULT true,
  prices jsonb NOT NULL, card_desc text, modal_data jsonb, is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.store_settings (
  key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL, customer_phone text NOT NULL, customer_email text,
  items jsonb NOT NULL, total_usd numeric, total_sar numeric, total_yer_sanaa numeric,
  total_yer_aden numeric, payment_method text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','cancelled')),
  delivery_details text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

-- Fail closed if the deployed schema has policies not inspected in this upgrade.
-- An operator must inspect such policies instead of silently retaining an OR-based bypass.
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT tablename, policyname FROM pg_policies
    WHERE schemaname='public' AND tablename IN ('profiles','products','store_settings','orders')
  LOOP
    IF p.policyname NOT IN (
      'Users can read own profile','Users can update own profile','Admins can view all profiles',
      'Public can view active products','Allow product modifications','Public can view store settings',
      'Allow settings modifications','Users can view own orders','Allow insert orders','Allow order management'
    ) AND p.policyname NOT LIKE 'store_%' THEN
      RAISE EXCEPTION 'UNREVIEWED_POLICY: %.% — review before migration', p.tablename, p.policyname;
    END IF;
    EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,p.tablename);
  END LOOP;
END $$;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pricing_mode text NOT NULL DEFAULT 'manual';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS previous_prices jsonb NOT NULL DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS duration_days integer;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS activation_type text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS allow_quantity boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS max_quantity integer NOT NULL DEFAULT 1;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_status text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unverified';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS exchange_rate numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS exchange_rates_snapshot jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rate_updated_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method_snapshot jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS request_fingerprint text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS inventory_released boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY, name text NOT NULL, description text,
  sort_order integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.product_plans (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  name text NOT NULL, duration text, duration_days integer CHECK (duration_days > 0),
  activation_type text, delivery_method text NOT NULL DEFAULT 'whatsapp', requirements text,
  warranty text, features jsonb NOT NULL DEFAULT '[]', devices jsonb NOT NULL DEFAULT '[]',
  activation_steps jsonb NOT NULL DEFAULT '[]', prices jsonb NOT NULL DEFAULT '{}',
  pricing_mode text NOT NULL DEFAULT 'manual' CHECK (pricing_mode IN ('manual','auto')),
  previous_prices jsonb NOT NULL DEFAULT '{}', stock integer CHECK (stock >= 0),
  in_stock boolean NOT NULL DEFAULT true, allow_quantity boolean NOT NULL DEFAULT false,
  max_quantity integer NOT NULL DEFAULT 1 CHECK (max_quantity BETWEEN 1 AND 100),
  is_active boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text, name text NOT NULL, logo text,
  type text NOT NULL DEFAULT 'bank_transfer', recipient_name text NOT NULL,
  account_number text NOT NULL, currencies text[] NOT NULL,
  instructions text, is_active boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (cardinality(currencies)>0 AND currencies <@ ARRAY['usd','sar','yer_sanaa','yer_aden'])
);
CREATE TABLE IF NOT EXISTS public.coupons (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code text UNIQUE NOT NULL CHECK (code=upper(trim(code)) AND length(code) BETWEEN 2 AND 40),
  discount_type text NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value numeric NOT NULL CHECK (discount_value>0),
  currency text CHECK (currency IN ('usd','sar','yer_sanaa','yer_aden')),
  min_total numeric NOT NULL DEFAULT 0 CHECK (min_total>=0),
  max_discount numeric CHECK (max_discount>0), starts_at timestamptz, ends_at timestamptz,
  max_uses integer CHECK (max_uses>0), uses_count integer NOT NULL DEFAULT 0 CHECK (uses_count>=0),
  is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (discount_type <> 'percent' OR discount_value<=100),
  CHECK (discount_type <> 'fixed' OR currency IS NOT NULL),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at>starts_at)
);
CREATE TABLE IF NOT EXISTS public.order_items (
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  item_no integer NOT NULL, product_id text NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  plan_id text REFERENCES public.product_plans(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity>0), snapshot jsonb NOT NULL,
  PRIMARY KEY(order_id,item_no)
);
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id text NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  payment_method_id text, currency text NOT NULL, amount numeric NOT NULL CHECK (amount>=0),
  reference text, receipt_path text, status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','verified','rejected','refunded')),
  admin_note text, reviewed_by uuid REFERENCES auth.users(id), reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), CHECK (nullif(trim(reference),'') IS NOT NULL OR receipt_path IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS public.receipt_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT, path text UNIQUE NOT NULL,
  mime_type text NOT NULL CHECK(mime_type IN ('image/jpeg','image/png','image/webp')),
  size_bytes integer NOT NULL CHECK(size_bytes BETWEEN 1 AND 5242880),
  status text NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','uploaded','failed')),
  created_at timestamptz NOT NULL DEFAULT now(), uploaded_at timestamptz
);
CREATE TABLE IF NOT EXISTS public.order_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id text NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  from_status text, to_status text NOT NULL, actor_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  plan_id text REFERENCES public.product_plans(id) ON DELETE RESTRICT,
  item_no integer NOT NULL, seat_no integer NOT NULL DEFAULT 1,
  product_title text NOT NULL, plan_name text, starts_at timestamptz NOT NULL, expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','expired','cancelled')),
  activation_type text, warranty text, delivery_notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(order_id,item_no,seat_no), CHECK(expires_at>starts_at)
);
CREATE TABLE IF NOT EXISTS public.renewals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','processing','completed','cancelled')),
  order_id text REFERENCES public.orders(id), note text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL, body text NOT NULL, link text, is_read boolean NOT NULL DEFAULT false,
  dedupe_key text UNIQUE, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  subject text NOT NULL CHECK(length(subject) BETWEEN 3 AND 160),
  message text NOT NULL CHECK(length(message) BETWEEN 5 AND 5000),
  order_id text REFERENCES public.orders(id), status text NOT NULL DEFAULT 'open'
    CHECK(status IN ('open','in_progress','resolved','closed')), admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.product_costs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text, product_id text NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  plan_id text REFERENCES public.product_plans(id) ON DELETE RESTRICT,
  cost numeric NOT NULL CHECK(cost>=0), currency text NOT NULL CHECK(currency IN ('usd','sar','yer_sanaa','yer_aden')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS product_costs_item_unique ON public.product_costs(product_id,coalesce(plan_id,''));
CREATE TABLE IF NOT EXISTS public.order_cost_snapshots (
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT, item_no integer NOT NULL,
  unit_cost numeric, currency text NOT NULL, source_cost numeric, source_currency text,
  PRIMARY KEY(order_id,item_no)
);
CREATE TABLE IF NOT EXISTS public.store_policies (
  id text PRIMARY KEY, title text NOT NULL, body text NOT NULL,
  published boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid, action text NOT NULL,
  entity_type text NOT NULL, entity_id text, detail jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.notification_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL, payload jsonb NOT NULL, consent_required boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sent','failed','cancelled')),
  dedupe_key text UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz
);
CREATE TABLE IF NOT EXISTS public.store_schema_migrations (
  version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_products_active_category ON public.products(is_active,category);
CREATE INDEX IF NOT EXISTS store_plans_product ON public.product_plans(product_id,is_active);
CREATE INDEX IF NOT EXISTS store_orders_user_created ON public.orders(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS store_orders_state_created ON public.orders(order_status,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS store_order_idempotency ON public.orders(user_id,idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS store_items_product ON public.order_items(product_id,order_id);
CREATE INDEX IF NOT EXISTS store_payments_order ON public.payments(order_id,created_at DESC);
CREATE INDEX IF NOT EXISTS store_receipt_uploads_user ON public.receipt_uploads(user_id,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS store_payment_receipt_unique ON public.payments(receipt_path) WHERE receipt_path IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS store_payment_pending_unique ON public.payments(order_id) WHERE status='submitted';
CREATE INDEX IF NOT EXISTS store_history_order ON public.order_history(order_id,created_at);
CREATE INDEX IF NOT EXISTS store_subscriptions_user_expiry ON public.subscriptions(user_id,expires_at);
CREATE INDEX IF NOT EXISTS store_renewals_user ON public.renewals(user_id,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS store_renewal_open_unique ON public.renewals(subscription_id) WHERE status IN ('requested','processing');
CREATE INDEX IF NOT EXISTS store_notifications_user ON public.notifications(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS store_tickets_user ON public.support_tickets(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS store_audit_created ON public.audit_logs(created_at DESC);

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=(SELECT auth.uid()) AND role='admin');
$$;
CREATE OR REPLACE FUNCTION public.store_require_admin() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'ADMIN_REQUIRED' USING ERRCODE='42501'; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO public.profiles(id,email,full_name,phone,avatar_url,role)
  VALUES(NEW.id,NEW.email,coalesce(NEW.raw_user_meta_data->>'full_name',NEW.raw_user_meta_data->>'name',split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'phone',NEW.raw_user_meta_data->>'avatar_url','customer')
  ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email,updated_at=now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.store_touch_and_audit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_id text;
BEGIN
  IF TG_OP='UPDATE' THEN NEW.updated_at=now(); END IF;
  v_id=coalesce(to_jsonb(NEW)->>'id',to_jsonb(NEW)->>'key',to_jsonb(OLD)->>'id',to_jsonb(OLD)->>'key');
  INSERT INTO public.audit_logs(actor_id,action,entity_type,entity_id,detail)
  VALUES(auth.uid(),lower(TG_OP),TG_TABLE_NAME,v_id,jsonb_build_object('before',CASE WHEN TG_OP<>'INSERT' THEN to_jsonb(OLD) END,
    'after',CASE WHEN TG_OP<>'DELETE' THEN to_jsonb(NEW) END));
  IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;

-- Revoke broad default grants. RLS plus column privileges prevent self-promotion.
DO $$
DECLARE t text; p record; columns text;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','products','store_settings','orders','categories','product_plans','payment_methods','coupons',
    'order_items','payments','receipt_uploads','order_history','subscriptions','renewals','notifications','support_tickets','product_costs',
    'order_cost_snapshots','store_policies','audit_logs','notification_outbox','store_schema_migrations']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon,authenticated,PUBLIC',t);
    SELECT string_agg(quote_ident(column_name),',') INTO columns FROM information_schema.columns WHERE table_schema='public' AND table_name=t;
    EXECUTE format('REVOKE ALL (%s) ON public.%I FROM anon,authenticated,PUBLIC',columns,t);
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      IF p.policyname NOT LIKE 'store_%' THEN RAISE EXCEPTION 'UNREVIEWED_POLICY: %.%',t,p.policyname; END IF;
      EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,t);
    END LOOP;
  END LOOP;
END $$;

GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE(full_name,phone,avatar_url) ON public.profiles TO authenticated;
CREATE POLICY store_profile_read ON public.profiles FOR SELECT TO authenticated USING(id=(SELECT auth.uid()) OR public.is_admin());
CREATE POLICY store_profile_update ON public.profiles FOR UPDATE TO authenticated USING(id=(SELECT auth.uid())) WITH CHECK(id=(SELECT auth.uid()));

GRANT SELECT ON public.products,public.categories,public.product_plans,public.payment_methods,public.store_settings,public.store_policies TO anon,authenticated;
GRANT INSERT,UPDATE ON public.products,public.categories,public.product_plans,public.payment_methods,public.store_settings,public.store_policies TO authenticated;
CREATE POLICY store_product_read ON public.products FOR SELECT TO anon,authenticated USING(is_active OR public.is_admin());
CREATE POLICY store_category_read ON public.categories FOR SELECT TO anon,authenticated USING(is_active OR public.is_admin());
CREATE POLICY store_plan_read ON public.product_plans FOR SELECT TO anon,authenticated USING(public.is_admin() OR (is_active AND EXISTS(SELECT 1 FROM public.products p WHERE p.id=product_id AND p.is_active)));
CREATE POLICY store_method_read ON public.payment_methods FOR SELECT TO anon,authenticated USING(is_active OR public.is_admin());
CREATE POLICY store_settings_read ON public.store_settings FOR SELECT TO anon,authenticated USING(key IN ('exchange_rates','store_profile','auth_options') OR public.is_admin());
CREATE POLICY store_policy_read ON public.store_policies FOR SELECT TO anon,authenticated USING(published OR public.is_admin());
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['products','categories','product_plans','payment_methods','store_settings','store_policies'] LOOP
    EXECUTE format('CREATE POLICY store_admin_insert ON public.%I FOR INSERT TO authenticated WITH CHECK(public.is_admin())',t);
    EXECUTE format('CREATE POLICY store_admin_update ON public.%I FOR UPDATE TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin())',t);
  END LOOP;
END $$;

GRANT SELECT ON public.coupons,public.product_costs,public.audit_logs,public.notification_outbox,public.order_cost_snapshots TO authenticated;
GRANT INSERT(id,code,discount_type,discount_value,currency,min_total,max_discount,starts_at,ends_at,max_uses,is_active),
  UPDATE(code,discount_type,discount_value,currency,min_total,max_discount,starts_at,ends_at,max_uses,is_active) ON public.coupons TO authenticated;
GRANT INSERT,UPDATE ON public.product_costs TO authenticated;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['coupons','product_costs','audit_logs','notification_outbox','order_cost_snapshots'] LOOP
    EXECUTE format('CREATE POLICY store_admin_read ON public.%I FOR SELECT TO authenticated USING(public.is_admin())',t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['coupons','product_costs'] LOOP
    EXECUTE format('CREATE POLICY store_admin_insert ON public.%I FOR INSERT TO authenticated WITH CHECK(public.is_admin())',t);
    EXECUTE format('CREATE POLICY store_admin_update ON public.%I FOR UPDATE TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin())',t);
  END LOOP;
END $$;

GRANT SELECT ON public.orders,public.order_items,public.payments,public.order_history,public.subscriptions,public.renewals,public.notifications,public.support_tickets TO authenticated;
GRANT SELECT ON public.receipt_uploads TO authenticated;
GRANT ALL ON public.receipt_uploads TO service_role;
CREATE POLICY store_order_read ON public.orders FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()) OR public.is_admin());
CREATE POLICY store_item_read ON public.order_items FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.orders o WHERE o.id=order_id AND (o.user_id=(SELECT auth.uid()) OR public.is_admin())));
CREATE POLICY store_history_read ON public.order_history FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.orders o WHERE o.id=order_id AND (o.user_id=(SELECT auth.uid()) OR public.is_admin())));
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['payments','receipt_uploads','subscriptions','renewals','notifications','support_tickets'] LOOP
    EXECUTE format('CREATE POLICY store_owner_read ON public.%I FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()) OR public.is_admin())',t);
  END LOOP;
END $$;
GRANT UPDATE(is_read) ON public.notifications TO authenticated;
CREATE POLICY store_notification_update ON public.notifications FOR UPDATE TO authenticated USING(user_id=(SELECT auth.uid())) WITH CHECK(user_id=(SELECT auth.uid()));
GRANT INSERT(user_id,subject,message,order_id) ON public.support_tickets TO authenticated;
GRANT UPDATE(status,admin_reply) ON public.support_tickets TO authenticated;
CREATE POLICY store_ticket_insert ON public.support_tickets FOR INSERT TO authenticated WITH CHECK(
  user_id=(SELECT auth.uid()) AND status='open' AND admin_reply IS NULL AND
  (order_id IS NULL OR EXISTS(SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.user_id=(SELECT auth.uid())))
);
CREATE POLICY store_ticket_admin_update ON public.support_tickets FOR UPDATE TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin());
GRANT UPDATE(status,order_id,note) ON public.renewals TO authenticated;
CREATE POLICY store_renewal_admin_update ON public.renewals FOR UPDATE TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin());
GRANT UPDATE(status,expires_at,warranty,delivery_notes) ON public.subscriptions TO authenticated;
CREATE POLICY store_subscription_admin_update ON public.subscriptions FOR UPDATE TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin());

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['products','categories','product_plans','payment_methods','store_settings','store_policies','coupons','product_costs','subscriptions','renewals','support_tickets','profiles'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS store_audit_change ON public.%I',t);
    EXECUTE format('CREATE TRIGGER store_audit_change BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.store_touch_and_audit()',t);
  END LOOP;
END $$;

-- No live exchange-rate API is invented. Existing settings are interpreted without rewriting them.
CREATE OR REPLACE FUNCTION public.store_exchange_rates() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.store_settings; r jsonb; k text; n numeric; precision_value integer;
BEGIN
  SELECT * INTO s FROM public.store_settings WHERE key='exchange_rates';
  IF NOT FOUND THEN RETURN jsonb_build_object('rates',jsonb_build_object('usd',1),'rounding',jsonb_build_object('usd',2,'sar',2,'yer_sanaa',0,'yer_aden',0),'updated_at',NULL); END IF;
  IF jsonb_typeof(s.value->'rates')='object' THEN r=s.value->'rates';
  ELSE
    r=jsonb_build_object('usd',1);
    IF (s.value->>'sanaa') ~ '^[0-9]+([.][0-9]+)?$' THEN r=r||jsonb_build_object('yer_sanaa',(s.value->>'sanaa')::numeric); END IF;
    IF (s.value->>'aden') ~ '^[0-9]+([.][0-9]+)?$' THEN r=r||jsonb_build_object('yer_aden',(s.value->>'aden')::numeric); END IF;
    IF (s.value->>'sar') ~ '^[0-9]+([.][0-9]+)?$' AND (s.value->>'sar')::numeric>0 AND r ? 'yer_sanaa' THEN
      r=r||jsonb_build_object('sar',(r->>'yer_sanaa')::numeric/(s.value->>'sar')::numeric);
    END IF;
  END IF;
  r=r||jsonb_build_object('usd',1);
  FOREACH k IN ARRAY ARRAY['usd','sar','yer_sanaa','yer_aden'] LOOP
    IF r ? k THEN
      IF coalesce(r->>k,'') !~ '^[0-9]+([.][0-9]+)?$' THEN RAISE EXCEPTION 'INVALID_EXCHANGE_RATES'; END IF;
      n=(r->>k)::numeric; IF n<=0 OR n>1000000 THEN RAISE EXCEPTION 'INVALID_EXCHANGE_RATES'; END IF;
    END IF;
    IF s.value->'rounding' ? k THEN
      IF coalesce(s.value->'rounding'->>k,'') !~ '^[0-4]$' THEN RAISE EXCEPTION 'INVALID_ROUNDING'; END IF;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('rates',r,'rounding',jsonb_build_object('usd',2,'sar',2,'yer_sanaa',0,'yer_aden',0)||coalesce(s.value->'rounding','{}'),'updated_at',s.updated_at);
END $$;

CREATE OR REPLACE FUNCTION public.store_price(p_prices jsonb,p_mode text,p_currency text,p_rates jsonb) RETURNS numeric
LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
DECLARE amount numeric; places integer;
BEGIN
  places=coalesce((p_rates->'rounding'->>p_currency)::integer,CASE WHEN p_currency LIKE 'yer_%' THEN 0 ELSE 2 END);
  IF p_mode='auto' THEN
    IF coalesce(p_prices->>'usd','') !~ '^[0-9]+([.][0-9]+)?$' OR NOT(p_rates->'rates' ? p_currency) THEN RAISE EXCEPTION 'PRICE_UNAVAILABLE'; END IF;
    amount=(p_prices->>'usd')::numeric*(p_rates->'rates'->>p_currency)::numeric;
  ELSE
    IF coalesce(p_prices->>p_currency,'') !~ '^[0-9]+([.][0-9]+)?$' THEN RAISE EXCEPTION 'PRICE_UNAVAILABLE'; END IF;
    amount=(p_prices->>p_currency)::numeric;
  END IF;
  IF amount<0 OR amount>1000000000 THEN RAISE EXCEPTION 'PRICE_UNAVAILABLE'; END IF;
  RETURN round(amount,places);
END $$;

CREATE OR REPLACE FUNCTION public.store_quote(p_items jsonb,p_currency text,p_coupon text,p_lock boolean) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE x jsonb; p public.products; plan public.product_plans; c public.coupons; rates jsonb;
  result_items jsonb='[]'; prices jsonb; price numeric; quantity integer; max_qty integer;
  subtotal numeric=0; discount numeric=0; places integer; plan_id text; item_key text; seen text[]='{}';
  plan_name text; duration text; duration_days integer; activation text; warranty text; mode text;
  available boolean; inventory integer; allow_qty boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
  IF p_currency IS NULL OR p_currency NOT IN ('usd','sar','yer_sanaa','yer_aden') THEN RAISE EXCEPTION 'INVALID_CURRENCY'; END IF;
  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'INVALID_CART'; END IF;
  rates=public.store_exchange_rates();
  places=coalesce((rates->'rounding'->>p_currency)::integer,2);
  FOR x IN SELECT value FROM jsonb_array_elements(p_items) ORDER BY value->>'product_id',value->>'plan_id' LOOP
    IF coalesce(x->>'quantity','') !~ '^[1-9][0-9]{0,2}$' OR length(coalesce(x->>'product_id','')) NOT BETWEEN 1 AND 160 THEN RAISE EXCEPTION 'INVALID_CART_ITEM'; END IF;
    quantity=(x->>'quantity')::integer; plan_id=nullif(x->>'plan_id','');
    item_key=(x->>'product_id')||'/'||coalesce(plan_id,'');
    IF item_key=ANY(seen) THEN RAISE EXCEPTION 'DUPLICATE_CART_ITEM'; END IF; seen=array_append(seen,item_key);
    IF p_lock THEN SELECT * INTO p FROM public.products WHERE id=x->>'product_id' FOR UPDATE;
    ELSE SELECT * INTO p FROM public.products WHERE id=x->>'product_id'; END IF;
    IF NOT FOUND OR p.is_active IS NOT TRUE OR p.in_stock IS NOT TRUE THEN RAISE EXCEPTION 'PRODUCT_UNAVAILABLE'; END IF;
    IF plan_id IS NOT NULL THEN
      IF p_lock THEN SELECT * INTO plan FROM public.product_plans WHERE id=plan_id AND product_id=p.id FOR UPDATE;
      ELSE SELECT * INTO plan FROM public.product_plans WHERE id=plan_id AND product_id=p.id; END IF;
      IF NOT FOUND OR NOT plan.is_active OR NOT plan.in_stock THEN RAISE EXCEPTION 'PLAN_UNAVAILABLE'; END IF;
      prices=plan.prices; mode=plan.pricing_mode; inventory=plan.stock; allow_qty=plan.allow_quantity; max_qty=plan.max_quantity;
      plan_name=plan.name; duration=plan.duration; duration_days=plan.duration_days; activation=plan.activation_type; warranty=plan.warranty;
    ELSE
      IF EXISTS(SELECT 1 FROM public.product_plans pp WHERE pp.product_id=p.id) THEN RAISE EXCEPTION 'PLAN_REQUIRED'; END IF;
      prices=p.prices; mode=p.pricing_mode; inventory=p.stock; allow_qty=p.allow_quantity; max_qty=p.max_quantity;
      plan_name=coalesce(p.brand_label,p.title); duration=p.duration; duration_days=p.duration_days;
      activation=coalesce(p.activation_type,p.modal_data->>'account_type'); warranty=coalesce(p.warranty_policy,p.warranty_text);
    END IF;
    IF quantity>100 OR quantity>max_qty OR (NOT allow_qty AND quantity<>1) THEN RAISE EXCEPTION 'QUANTITY_NOT_ALLOWED'; END IF;
    IF inventory IS NOT NULL AND inventory<quantity THEN RAISE EXCEPTION 'OUT_OF_STOCK'; END IF;
    price=public.store_price(prices,mode,p_currency,rates); subtotal=subtotal+price*quantity;
    result_items=result_items||jsonb_build_array(jsonb_build_object('product_id',p.id,'plan_id',plan_id,'quantity',quantity,
      'title',p.title,'plan_name',plan_name,'unit_price',price,'line_total',price*quantity,'prices',prices,
      'duration',duration,'duration_days',duration_days,'activation_type',activation,'warranty',warranty));
  END LOOP;
  p_coupon=upper(nullif(trim(p_coupon),''));
  IF p_coupon IS NOT NULL THEN
    IF p_lock THEN SELECT * INTO c FROM public.coupons WHERE code=p_coupon FOR UPDATE;
    ELSE SELECT * INTO c FROM public.coupons WHERE code=p_coupon; END IF;
    IF NOT FOUND OR NOT c.is_active OR (c.starts_at IS NOT NULL AND c.starts_at>now()) OR (c.ends_at IS NOT NULL AND c.ends_at<=now())
      OR (c.max_uses IS NOT NULL AND c.uses_count>=c.max_uses) OR (c.currency IS NOT NULL AND c.currency<>p_currency) OR subtotal<c.min_total THEN
      RAISE EXCEPTION 'COUPON_UNAVAILABLE';
    END IF;
    discount=CASE WHEN c.discount_type='percent' THEN subtotal*c.discount_value/100 ELSE c.discount_value END;
    IF c.max_discount IS NOT NULL THEN discount=least(discount,c.max_discount); END IF;
    discount=least(subtotal,round(discount,places));
  END IF;
  RETURN jsonb_build_object('items',result_items,'subtotal',subtotal,'discount',discount,'total',subtotal-discount,
    'currency',p_currency,'exchange_rate',rates->'rates'->p_currency,'exchange_rates_snapshot',rates,
    'rate_updated_at',rates->'updated_at','coupon_code',p_coupon);
END $$;

CREATE OR REPLACE FUNCTION public.quote_order(p_items jsonb,p_currency text,p_coupon text DEFAULT NULL) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$ SELECT public.store_quote(p_items,p_currency,p_coupon,false); $$;

CREATE OR REPLACE FUNCTION public.store_order_event(p_order public.orders,p_from text,p_to text,p_note text DEFAULT '') RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO public.order_history(order_id,from_status,to_status,actor_id) VALUES(p_order.id,p_from,p_to,auth.uid());
  INSERT INTO public.audit_logs(actor_id,action,entity_type,entity_id,detail)
    VALUES(auth.uid(),'order_status','orders',p_order.id,jsonb_build_object('from',p_from,'to',p_to,'note',left(p_note,5000)));
  IF p_order.user_id IS NOT NULL THEN
    INSERT INTO public.notifications(user_id,title,body,link) VALUES(p_order.user_id,'تحديث حالة الطلب',
      'تم تحديث حالة طلبك '||p_order.id||'. يمكنك الاطلاع على التفاصيل من حسابك.','account.html#orders');
    INSERT INTO public.notification_outbox(user_id,event_type,payload) VALUES(p_order.user_id,'order.'||p_to,jsonb_build_object('order_id',p_order.id,'status',p_to));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.create_order(p_request jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid=auth.uid(); key text; fingerprint text; existing public.orders; o public.orders; q jsonb;
  pm public.payment_methods; x jsonb; item_no integer=0; costs public.product_costs; unit_cost numeric;
  phone text; name text; expected numeric; currency text; settings jsonb;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
  SELECT ss.value INTO settings FROM public.store_settings ss WHERE ss.key='checkout_control';
  IF settings->>'enabled'='false' THEN RAISE EXCEPTION 'CHECKOUT_DISABLED'; END IF;
  IF jsonb_typeof(p_request) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'INVALID_REQUEST'; END IF;
  key=p_request->>'idempotency_key';
  IF coalesce(key,'') !~ '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$' THEN RAISE EXCEPTION 'INVALID_IDEMPOTENCY_KEY'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,0));
  fingerprint=md5(p_request::text);
  SELECT * INTO existing FROM public.orders WHERE user_id=uid AND idempotency_key=key;
  IF FOUND THEN
    IF existing.request_fingerprint IS DISTINCT FROM fingerprint THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF;
    RETURN to_jsonb(existing);
  END IF;
  IF (SELECT count(*) FROM public.orders WHERE user_id=uid AND created_at>now()-interval '1 hour')>=10 THEN RAISE EXCEPTION 'ORDER_RATE_LIMIT'; END IF;
  IF (SELECT count(*) FROM public.orders WHERE user_id=uid AND order_status IN ('awaiting_payment','payment_review'))>=5 THEN RAISE EXCEPTION 'TOO_MANY_PENDING_ORDERS'; END IF;
  name=trim(p_request->>'customer_name'); phone=trim(p_request->>'customer_phone'); currency=p_request->>'currency';
  IF name IS NULL OR length(name) NOT BETWEEN 2 AND 160 OR phone IS NULL OR phone !~ '^\+?[0-9 ()-]{7,25}$' THEN RAISE EXCEPTION 'INVALID_CUSTOMER'; END IF;
  IF coalesce(p_request->>'expected_total','') !~ '^[0-9]+([.][0-9]+)?$' THEN RAISE EXCEPTION 'EXPECTED_TOTAL_REQUIRED'; END IF;
  expected=(p_request->>'expected_total')::numeric;
  SELECT * INTO pm FROM public.payment_methods WHERE id=p_request->>'payment_method_id' AND is_active FOR SHARE;
  IF NOT FOUND OR NOT(currency=ANY(pm.currencies)) THEN RAISE EXCEPTION 'PAYMENT_METHOD_UNAVAILABLE'; END IF;
  q=public.store_quote(p_request->'items',currency,p_request->>'coupon_code',true);
  IF (q->>'total')::numeric<>expected THEN RAISE EXCEPTION 'PRICE_CHANGED'; END IF;
  INSERT INTO public.orders(id,user_id,customer_name,customer_phone,customer_email,items,total_usd,total_sar,total_yer_sanaa,total_yer_aden,
    payment_method,status,order_status,payment_status,delivery_status,currency,subtotal,discount,total,exchange_rate,exchange_rates_snapshot,
    rate_updated_at,payment_method_id,payment_method_snapshot,coupon_code,idempotency_key,request_fingerprint,expires_at)
  VALUES('ORD-'||upper(replace(gen_random_uuid()::text,'-','')),uid,name,phone,(SELECT email FROM auth.users WHERE id=uid),q->'items',
    CASE WHEN currency='usd' THEN expected END,CASE WHEN currency='sar' THEN expected END,
    CASE WHEN currency='yer_sanaa' THEN expected END,CASE WHEN currency='yer_aden' THEN expected END,
    pm.name,'pending','awaiting_payment','awaiting','pending',currency,(q->>'subtotal')::numeric,(q->>'discount')::numeric,expected,
    (q->>'exchange_rate')::numeric,q->'exchange_rates_snapshot',(q->>'rate_updated_at')::timestamptz,pm.id,to_jsonb(pm),q->>'coupon_code',key,fingerprint,now()+interval '24 hours')
  RETURNING * INTO o;
  FOR x IN SELECT value FROM jsonb_array_elements(q->'items') LOOP
    item_no=item_no+1;
    INSERT INTO public.order_items(order_id,item_no,product_id,plan_id,quantity,snapshot)
      VALUES(o.id,item_no,x->>'product_id',x->>'plan_id',(x->>'quantity')::integer,x);
    IF x->>'plan_id' IS NOT NULL THEN
      UPDATE public.product_plans SET stock=stock-(x->>'quantity')::integer WHERE id=x->>'plan_id' AND stock IS NOT NULL;
    ELSE UPDATE public.products SET stock=stock-(x->>'quantity')::integer WHERE id=x->>'product_id' AND stock IS NOT NULL; END IF;
    SELECT * INTO costs FROM public.product_costs WHERE product_id=x->>'product_id' AND plan_id IS NOT DISTINCT FROM x->>'plan_id';
    unit_cost=NULL;
    IF FOUND THEN
      IF costs.currency=currency THEN unit_cost=costs.cost;
      ELSIF q->'exchange_rates_snapshot'->'rates' ? costs.currency AND q->'exchange_rates_snapshot'->'rates' ? currency THEN
        unit_cost=costs.cost*(q->'exchange_rates_snapshot'->'rates'->>currency)::numeric/(q->'exchange_rates_snapshot'->'rates'->>costs.currency)::numeric;
      END IF;
    END IF;
    INSERT INTO public.order_cost_snapshots(order_id,item_no,unit_cost,currency,source_cost,source_currency)
      VALUES(o.id,item_no,unit_cost,currency,costs.cost,costs.currency);
  END LOOP;
  IF o.coupon_code IS NOT NULL THEN UPDATE public.coupons SET uses_count=uses_count+1 WHERE code=o.coupon_code; END IF;
  PERFORM public.store_order_event(o,NULL,'awaiting_payment');
  RETURN to_jsonb(o);
END $$;

-- Private receipts: paths are <authenticated-user-id>/<order-id>/<random-name>.<image-extension>.
-- Supabase Storage performs content type/size checks; SQL rechecks persisted metadata at submission.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('payment-receipts','payment-receipts',false,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=5242880,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp'];
CREATE OR REPLACE FUNCTION public.store_receipt_access(p_name text,p_upload boolean DEFAULT false) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT auth.uid() IS NOT NULL AND (NOT p_upload AND public.is_admin() OR
    (split_part(p_name,'/',1)=auth.uid()::text AND array_length(string_to_array(p_name,'/'),1)=3
      AND p_name ~ '[.](jpg|jpeg|png|webp)$'
      AND EXISTS(SELECT 1 FROM public.orders o WHERE o.id=split_part(p_name,'/',2) AND o.user_id=auth.uid()
        AND (NOT p_upload OR o.order_status='awaiting_payment'))));
$$;
DROP POLICY IF EXISTS store_receipt_read ON storage.objects;
DROP POLICY IF EXISTS store_receipt_insert ON storage.objects;
DROP POLICY IF EXISTS store_receipt_read_boundary ON storage.objects;
DROP POLICY IF EXISTS store_receipt_insert_boundary ON storage.objects;
DROP POLICY IF EXISTS store_receipt_update_boundary ON storage.objects;
DROP POLICY IF EXISTS store_receipt_delete_boundary ON storage.objects;
-- Restrictive boundaries keep unrelated pre-existing permissive Storage policies
-- from accidentally making payment receipts public or replaceable.
CREATE POLICY store_receipt_read_boundary ON storage.objects AS RESTRICTIVE FOR SELECT TO public USING(
  bucket_id<>'payment-receipts' OR public.store_receipt_access(name,false)
);
CREATE POLICY store_receipt_insert_boundary ON storage.objects AS RESTRICTIVE FOR INSERT TO public WITH CHECK(
  bucket_id<>'payment-receipts'
);
CREATE POLICY store_receipt_update_boundary ON storage.objects AS RESTRICTIVE FOR UPDATE TO public USING(bucket_id<>'payment-receipts') WITH CHECK(bucket_id<>'payment-receipts');
CREATE POLICY store_receipt_delete_boundary ON storage.objects AS RESTRICTIVE FOR DELETE TO public USING(bucket_id<>'payment-receipts');
CREATE POLICY store_receipt_read ON storage.objects FOR SELECT TO authenticated USING(
  bucket_id='payment-receipts' AND public.store_receipt_access(name,false)
);
-- Receipt INSERT/UPDATE/DELETE are service-only. The edge function validates bytes before upload.

CREATE OR REPLACE FUNCTION public.reserve_receipt_upload(p_order_id text,p_mime_type text,p_size_bytes integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE upload public.receipt_uploads; uid uuid=auth.uid(); upload_id uuid=gen_random_uuid(); ext text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('receipt:'||uid::text,0));
  IF NOT EXISTS(SELECT 1 FROM public.orders WHERE id=p_order_id AND user_id=uid AND order_status='awaiting_payment') THEN RAISE EXCEPTION 'ORDER_NOT_PAYABLE'; END IF;
  IF p_mime_type IS NULL OR p_mime_type NOT IN ('image/jpeg','image/png','image/webp') OR p_size_bytes IS NULL OR p_size_bytes NOT BETWEEN 1 AND 5242880 THEN RAISE EXCEPTION 'INVALID_RECEIPT_FILE'; END IF;
  IF (SELECT count(*) FROM public.receipt_uploads WHERE user_id=uid AND created_at>now()-interval '1 hour')>=10 THEN RAISE EXCEPTION 'UPLOAD_RATE_LIMIT'; END IF;
  ext=CASE p_mime_type WHEN 'image/jpeg' THEN 'jpg' WHEN 'image/png' THEN 'png' ELSE 'webp' END;
  INSERT INTO public.receipt_uploads(id,user_id,order_id,path,mime_type,size_bytes)
    VALUES(upload_id,uid,p_order_id,uid::text||'/'||p_order_id||'/'||upload_id::text||'.'||ext,p_mime_type,p_size_bytes) RETURNING * INTO upload;
  RETURN to_jsonb(upload);
END $$;

CREATE OR REPLACE FUNCTION public.submit_payment(p_order_id text,p_reference text,p_receipt_path text DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.orders; payment public.payments; metadata jsonb; previous text; upload public.receipt_uploads;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE='42501'; END IF;
  SELECT * INTO o FROM public.orders WHERE id=p_order_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
  p_reference=nullif(trim(p_reference),''); p_receipt_path=nullif(trim(p_receipt_path),'');
  SELECT * INTO payment FROM public.payments WHERE order_id=o.id AND status='submitted';
  IF FOUND AND payment.reference IS NOT DISTINCT FROM p_reference AND payment.receipt_path IS NOT DISTINCT FROM p_receipt_path THEN RETURN to_jsonb(payment); END IF;
  IF o.order_status IS DISTINCT FROM 'awaiting_payment' THEN RAISE EXCEPTION 'PAYMENT_NOT_ALLOWED'; END IF;
  IF p_reference IS NULL AND p_receipt_path IS NULL THEN RAISE EXCEPTION 'PAYMENT_EVIDENCE_REQUIRED'; END IF;
  IF length(p_reference)>160 OR length(p_receipt_path)>400 THEN RAISE EXCEPTION 'INVALID_PAYMENT_EVIDENCE'; END IF;
  IF (SELECT count(*) FROM public.payments WHERE user_id=auth.uid() AND created_at>now()-interval '1 hour')>=10 THEN RAISE EXCEPTION 'PAYMENT_RATE_LIMIT'; END IF;
  IF p_receipt_path IS NOT NULL THEN
    IF split_part(p_receipt_path,'/',1)<>auth.uid()::text OR split_part(p_receipt_path,'/',2)<>o.id OR
      array_length(string_to_array(p_receipt_path,'/'),1)<>3 OR p_receipt_path !~ '[.](jpg|jpeg|png|webp)$' THEN RAISE EXCEPTION 'INVALID_RECEIPT_PATH'; END IF;
    SELECT * INTO upload FROM public.receipt_uploads WHERE path=p_receipt_path AND user_id=auth.uid() AND order_id=o.id AND status='uploaded';
    IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_RECEIPT_FILE'; END IF;
    SELECT s.metadata INTO metadata FROM storage.objects s WHERE bucket_id='payment-receipts' AND name=p_receipt_path;
    IF NOT FOUND OR coalesce(metadata->>'mimetype','')<>upload.mime_type
      OR coalesce(metadata->>'size','') !~ '^[0-9]+$' THEN RAISE EXCEPTION 'INVALID_RECEIPT_FILE'; END IF;
    IF (metadata->>'size')::numeric<>upload.size_bytes THEN RAISE EXCEPTION 'INVALID_RECEIPT_SIZE'; END IF;
  END IF;
  INSERT INTO public.payments(order_id,user_id,payment_method_id,currency,amount,reference,receipt_path)
    VALUES(o.id,o.user_id,o.payment_method_id,o.currency,o.total,p_reference,p_receipt_path) RETURNING * INTO payment;
  previous=o.order_status;
  UPDATE public.orders SET order_status='payment_review',payment_status='review',updated_at=now() WHERE id=o.id RETURNING * INTO o;
  PERFORM public.store_order_event(o,previous,'payment_review');
  RETURN to_jsonb(payment);
END $$;

CREATE OR REPLACE FUNCTION public.admin_review_payment(p_payment_id uuid,p_approved boolean,p_note text DEFAULT '') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE payment public.payments; o public.orders; previous text; target text;
BEGIN
  PERFORM public.store_require_admin();
  -- Lock orders before payments everywhere, avoiding inconsistent lock ordering.
  SELECT * INTO payment FROM public.payments WHERE id=p_payment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'PAYMENT_NOT_FOUND'; END IF;
  SELECT * INTO o FROM public.orders WHERE id=payment.order_id FOR UPDATE;
  SELECT * INTO payment FROM public.payments WHERE id=p_payment_id FOR UPDATE;
  IF p_approved IS NULL OR payment.status IS DISTINCT FROM 'submitted' OR o.order_status IS DISTINCT FROM 'payment_review' THEN RAISE EXCEPTION 'PAYMENT_ALREADY_REVIEWED'; END IF;
  IF NOT p_approved AND length(trim(coalesce(p_note,'')))<3 THEN RAISE EXCEPTION 'REVIEW_REASON_REQUIRED'; END IF;
  UPDATE public.payments SET status=CASE WHEN p_approved THEN 'verified' ELSE 'rejected' END,
    admin_note=left(p_note,5000),reviewed_by=auth.uid(),reviewed_at=now() WHERE id=p_payment_id RETURNING * INTO payment;
  previous=o.order_status; target=CASE WHEN p_approved THEN 'paid' ELSE 'awaiting_payment' END;
  UPDATE public.orders SET order_status=target,payment_status=CASE WHEN p_approved THEN 'verified' ELSE 'rejected' END,
    status=CASE WHEN p_approved THEN 'processing' ELSE 'pending' END,updated_at=now() WHERE id=o.id RETURNING * INTO o;
  PERFORM public.store_order_event(o,previous,target,p_note);
  RETURN to_jsonb(payment);
END $$;

CREATE OR REPLACE FUNCTION public.store_release_inventory(p_order public.orders) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE i public.order_items;
BEGIN
  IF p_order.inventory_released THEN RETURN; END IF;
  FOR i IN SELECT * FROM public.order_items WHERE order_id=p_order.id ORDER BY product_id,plan_id LOOP
    IF i.plan_id IS NULL THEN UPDATE public.products SET stock=stock+i.quantity WHERE id=i.product_id AND stock IS NOT NULL;
    ELSE UPDATE public.product_plans SET stock=stock+i.quantity WHERE id=i.plan_id AND stock IS NOT NULL; END IF;
  END LOOP;
  IF p_order.coupon_code IS NOT NULL THEN UPDATE public.coupons SET uses_count=greatest(uses_count-1,0) WHERE code=p_order.coupon_code; END IF;
  UPDATE public.orders SET inventory_released=true WHERE id=p_order.id;
END $$;

CREATE OR REPLACE FUNCTION public.admin_transition_order(p_order_id text,p_status text,p_note text DEFAULT '') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.orders; previous text; permitted boolean=false;
BEGIN
  PERFORM public.store_require_admin();
  SELECT * INTO o FROM public.orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
  previous=o.order_status;
  IF previous IS NULL THEN RAISE EXCEPTION 'LEGACY_ORDER_REQUIRES_RECONCILIATION'; END IF;
  IF previous=p_status THEN RETURN to_jsonb(o); END IF;
  permitted=(previous IN ('awaiting_payment','payment_review') AND p_status IN ('rejected','cancelled'))
    OR (previous='paid' AND p_status='preparing') OR (previous='preparing' AND p_status IN ('activating','completed'))
    OR (previous='activating' AND p_status='completed') OR (previous IN ('paid','preparing','activating','completed') AND p_status='refunded');
  IF NOT coalesce(permitted,false) THEN RAISE EXCEPTION 'INVALID_ORDER_TRANSITION'; END IF;
  IF p_status IN ('preparing','activating','completed','refunded') AND o.payment_status IS DISTINCT FROM 'verified' THEN RAISE EXCEPTION 'PAYMENT_NOT_VERIFIED'; END IF;
  IF p_status IN ('rejected','cancelled','refunded') AND length(trim(coalesce(p_note,'')))<3 THEN RAISE EXCEPTION 'STATUS_REASON_REQUIRED'; END IF;
  IF p_status IN ('cancelled','rejected') THEN
    PERFORM public.store_release_inventory(o);
    UPDATE public.payments SET status='rejected',admin_note=left(p_note,5000),reviewed_by=auth.uid(),reviewed_at=now() WHERE order_id=o.id AND status='submitted';
  END IF;
  IF p_status='refunded' THEN
    UPDATE public.payments SET status='refunded' WHERE order_id=o.id AND status='verified';
    UPDATE public.subscriptions SET status='cancelled' WHERE order_id=o.id;
  END IF;
  UPDATE public.orders SET order_status=p_status,
    status=CASE WHEN p_status='completed' THEN 'completed' WHEN p_status IN ('rejected','cancelled','refunded') THEN 'cancelled' ELSE 'processing' END,
    payment_status=CASE WHEN p_status='refunded' THEN 'refunded' WHEN p_status IN ('rejected','cancelled') THEN 'rejected' ELSE payment_status END,
    delivery_status=CASE WHEN p_status='completed' THEN 'delivered' WHEN p_status IN ('rejected','cancelled','refunded') THEN 'cancelled' ELSE p_status END,
    updated_at=now() WHERE id=o.id RETURNING * INTO o;
  PERFORM public.store_order_event(o,previous,p_status,p_note);
  RETURN to_jsonb(o);
END $$;

CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.orders;
BEGIN
  SELECT * INTO o FROM public.orders WHERE id=p_order_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
  IF o.order_status='cancelled' THEN RETURN to_jsonb(o); END IF;
  IF o.order_status IS DISTINCT FROM 'awaiting_payment' THEN RAISE EXCEPTION 'CANCELLATION_NOT_ALLOWED'; END IF;
  PERFORM public.store_release_inventory(o);
  UPDATE public.orders SET order_status='cancelled',status='cancelled',delivery_status='cancelled',updated_at=now() WHERE id=o.id RETURNING * INTO o;
  PERFORM public.store_order_event(o,'awaiting_payment','cancelled','Customer cancelled');
  RETURN to_jsonb(o);
END $$;

CREATE OR REPLACE FUNCTION public.admin_activate_subscription(p_data jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.orders; i public.order_items; s public.subscriptions; starts timestamptz; expires timestamptz; seat integer;
BEGIN
  PERFORM public.store_require_admin();
  SELECT * INTO o FROM public.orders WHERE id=p_data->>'order_id' FOR UPDATE;
  IF NOT FOUND OR o.payment_status IS DISTINCT FROM 'verified' OR o.order_status IS NULL OR o.order_status NOT IN ('paid','preparing','activating','completed') THEN RAISE EXCEPTION 'PAID_ORDER_REQUIRED'; END IF;
  SELECT * INTO i FROM public.order_items WHERE order_id=o.id AND product_id=p_data->>'product_id' AND plan_id IS NOT DISTINCT FROM nullif(p_data->>'plan_id','');
  IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_ITEM_NOT_FOUND'; END IF;
  seat=coalesce((p_data->>'seat_no')::integer,1);
  IF seat NOT BETWEEN 1 AND i.quantity THEN RAISE EXCEPTION 'INVALID_SUBSCRIPTION_QUANTITY'; END IF;
  SELECT * INTO s FROM public.subscriptions WHERE order_id=o.id AND item_no=i.item_no AND seat_no=seat;
  IF FOUND THEN RETURN to_jsonb(s); END IF;
  starts=coalesce((p_data->>'starts_at')::timestamptz,now()); expires=(p_data->>'expires_at')::timestamptz;
  IF expires IS NULL AND i.snapshot->>'duration_days' IS NOT NULL THEN expires=starts+make_interval(days=>(i.snapshot->>'duration_days')::integer); END IF;
  IF expires IS NULL OR expires<=starts THEN RAISE EXCEPTION 'EXPIRY_REQUIRED'; END IF;
  INSERT INTO public.subscriptions(user_id,order_id,product_id,plan_id,item_no,seat_no,product_title,plan_name,starts_at,expires_at,activation_type,warranty,delivery_notes)
    VALUES(o.user_id,o.id,i.product_id,i.plan_id,i.item_no,seat,i.snapshot->>'title',i.snapshot->>'plan_name',starts,expires,
      coalesce(p_data->>'activation_type',i.snapshot->>'activation_type'),coalesce(p_data->>'warranty',i.snapshot->>'warranty'),left(p_data->>'delivery_notes',2000)) RETURNING * INTO s;
  INSERT INTO public.notifications(user_id,title,body,link) VALUES(o.user_id,'تم تفعيل الاشتراك','تم تسجيل تفعيل اشتراكك. راجع تاريخ الانتهاء من حسابك.','account.html#subscriptions');
  INSERT INTO public.notification_outbox(user_id,event_type,payload) VALUES(o.user_id,'subscription.activated',jsonb_build_object('subscription_id',s.id,'order_id',o.id));
  RETURN to_jsonb(s);
END $$;

CREATE OR REPLACE FUNCTION public.request_renewal(p_subscription_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.subscriptions; r public.renewals;
BEGIN
  SELECT * INTO s FROM public.subscriptions WHERE id=p_subscription_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND OR s.status='cancelled' THEN RAISE EXCEPTION 'SUBSCRIPTION_NOT_FOUND'; END IF;
  SELECT * INTO r FROM public.renewals WHERE subscription_id=s.id AND status IN ('requested','processing');
  IF FOUND THEN RETURN to_jsonb(r); END IF;
  INSERT INTO public.renewals(subscription_id,user_id) VALUES(s.id,s.user_id) RETURNING * INTO r;
  INSERT INTO public.notifications(user_id,title,body,link) VALUES(s.user_id,'تم استلام طلب التجديد','طلب التجديد محفوظ، ويحتاج طلب شراء ودفع جديد قبل التمديد.','account.html#subscriptions');
  RETURN to_jsonb(r);
END $$;

-- Renewals are tracked manually, but cannot claim completion against somebody
-- else's purchase, the original purchase, an unrelated item, or unpaid evidence.
CREATE OR REPLACE FUNCTION public.store_validate_renewal() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.subscriptions; o public.orders;
BEGIN
  SELECT * INTO s FROM public.subscriptions WHERE id=NEW.subscription_id;
  IF NOT FOUND OR NEW.user_id IS DISTINCT FROM s.user_id THEN RAISE EXCEPTION 'INVALID_RENEWAL_ORDER'; END IF;
  IF NEW.order_id IS NOT NULL THEN
    SELECT * INTO o FROM public.orders WHERE id=NEW.order_id FOR SHARE;
    IF NOT FOUND OR o.user_id IS DISTINCT FROM s.user_id OR o.id=s.order_id
      OR NOT EXISTS(SELECT 1 FROM public.order_items i WHERE i.order_id=o.id AND i.product_id=s.product_id
        AND i.plan_id IS NOT DISTINCT FROM s.plan_id) THEN RAISE EXCEPTION 'INVALID_RENEWAL_ORDER'; END IF;
  END IF;
  IF NEW.status='completed' AND (NEW.order_id IS NULL OR o.payment_status IS DISTINCT FROM 'verified'
      OR o.order_status IS NULL OR o.order_status NOT IN ('paid','preparing','activating','completed')) THEN
    RAISE EXCEPTION 'RENEWAL_PAYMENT_REQUIRED';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS store_validate_renewal ON public.renewals;
CREATE TRIGGER store_validate_renewal BEFORE INSERT OR UPDATE ON public.renewals
  FOR EACH ROW EXECUTE FUNCTION public.store_validate_renewal();

CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id uuid,p_role text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.profiles;
BEGIN
  PERFORM public.store_require_admin();
  PERFORM pg_advisory_xact_lock(119118221);
  IF p_role IS NULL OR p_role NOT IN ('customer','admin','moderator') THEN RAISE EXCEPTION 'INVALID_ROLE'; END IF;
  SELECT * INTO p FROM public.profiles WHERE id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PROFILE_NOT_FOUND'; END IF;
  IF p.role='admin' AND p_role<>'admin' AND (SELECT count(*) FROM public.profiles WHERE role='admin')<=1 THEN RAISE EXCEPTION 'LAST_ADMIN_REQUIRED'; END IF;
  UPDATE public.profiles SET role=p_role WHERE id=p_user_id RETURNING * INTO p;
  RETURN to_jsonb(p);
END $$;

CREATE OR REPLACE FUNCTION public.catalog_sales() RETURNS TABLE(product_id text,quantity bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT i.product_id,sum(i.quantity)::bigint FROM public.order_items i JOIN public.orders o ON o.id=i.order_id
  WHERE o.payment_status='verified' AND o.order_status IN ('paid','preparing','activating','completed') GROUP BY i.product_id;
$$;

CREATE OR REPLACE FUNCTION public.admin_financial_report(p_from timestamptz DEFAULT NULL,p_to timestamptz DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
  PERFORM public.store_require_admin();
  SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') INTO result FROM (
    SELECT o.currency,count(*) AS orders,sum(o.total) AS revenue,
      sum(CASE WHEN c.known_count=c.item_count THEN c.total_cost END) AS known_cost,
      sum(CASE WHEN c.known_count=c.item_count THEN o.total-c.total_cost END) AS profit_on_costed_orders,
      count(*) FILTER(WHERE c.known_count=c.item_count) AS costed_orders
    FROM public.orders o LEFT JOIN LATERAL (
      SELECT count(*) AS item_count,count(cs.unit_cost) AS known_count,sum(cs.unit_cost*i.quantity) AS total_cost
      FROM public.order_items i LEFT JOIN public.order_cost_snapshots cs ON cs.order_id=i.order_id AND cs.item_no=i.item_no WHERE i.order_id=o.id
    ) c ON true
    WHERE o.payment_status='verified' AND (p_from IS NULL OR o.created_at>=p_from) AND (p_to IS NULL OR o.created_at<p_to)
    GROUP BY o.currency
  ) t;
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.admin_run_maintenance() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.orders; s public.subscriptions; cancelled integer=0; reminded integer=0;
BEGIN
  PERFORM public.store_require_admin();
  FOR o IN SELECT * FROM public.orders WHERE order_status='awaiting_payment' AND expires_at<now() FOR UPDATE SKIP LOCKED LOOP
    PERFORM public.admin_transition_order(o.id,'cancelled','Expired unpaid reservation'); cancelled=cancelled+1;
  END LOOP;
  UPDATE public.subscriptions SET status='expired' WHERE status='active' AND expires_at<=now();
  FOR s IN SELECT * FROM public.subscriptions WHERE status='active' AND expires_at>now() AND expires_at<=now()+interval '7 days' LOOP
    INSERT INTO public.notifications(user_id,title,body,link,dedupe_key)
      VALUES(s.user_id,'اقترب انتهاء اشتراكك',s.product_title||' — راجع تاريخ الانتهاء واطلب التجديد من حسابك.','account.html#subscriptions','expiry:'||s.id||':'||s.expires_at::text)
      ON CONFLICT(dedupe_key) DO NOTHING;
    IF FOUND THEN reminded=reminded+1; END IF;
    INSERT INTO public.notification_outbox(user_id,event_type,payload,dedupe_key)
      VALUES(s.user_id,'subscription.expiring',jsonb_build_object('subscription_id',s.id,'expires_at',s.expires_at),'expiry:'||s.id||':'||s.expires_at::text)
      ON CONFLICT(dedupe_key) DO NOTHING;
  END LOOP;
  RETURN jsonb_build_object('cancelled_orders',cancelled,'expiry_notifications',reminded);
END $$;

CREATE OR REPLACE FUNCTION public.admin_send_notification(p_data jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE notification public.notifications; uid uuid; title text; body text; link text;
BEGIN
  PERFORM public.store_require_admin();
  uid=(p_data->>'user_id')::uuid; title=trim(p_data->>'title'); body=trim(p_data->>'body'); link=nullif(trim(p_data->>'link'),'');
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=uid) OR title IS NULL OR length(title) NOT BETWEEN 2 AND 160
    OR body IS NULL OR length(body) NOT BETWEEN 2 AND 5000 THEN RAISE EXCEPTION 'INVALID_NOTIFICATION'; END IF;
  IF link IS NOT NULL AND (length(link)>400 OR link !~ '^[a-zA-Z0-9_-]+[.]html([?#][a-zA-Z0-9_=&%#.?/-]*)?$') THEN RAISE EXCEPTION 'INVALID_NOTIFICATION_LINK'; END IF;
  INSERT INTO public.notifications(user_id,title,body,link) VALUES(uid,title,body,link) RETURNING * INTO notification;
  INSERT INTO public.audit_logs(actor_id,action,entity_type,entity_id,detail)
    VALUES(auth.uid(),'send_notification','notifications',notification.id::text,jsonb_build_object('user_id',uid,'title',title));
  RETURN to_jsonb(notification);
END $$;

-- All callable entry points use an explicit grant. Internal definer functions cannot be invoked through PostgREST.
DO $$
DECLARE f record;
BEGIN
  FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND (p.proname LIKE 'store_%' OR p.proname IN ('is_admin','handle_new_user','quote_order','create_order','submit_payment',
      'admin_review_payment','admin_transition_order','cancel_order','admin_activate_subscription','request_renewal','admin_set_user_role','catalog_sales','admin_financial_report','admin_run_maintenance','admin_send_notification','reserve_receipt_upload'))
  LOOP EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon,authenticated',f.signature); END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.is_admin(),public.catalog_sales(),public.store_receipt_access(text,boolean) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.quote_order(jsonb,text,text),public.create_order(jsonb),public.submit_payment(text,text,text),
  public.admin_review_payment(uuid,boolean,text),public.admin_transition_order(text,text,text),public.cancel_order(text),
  public.admin_activate_subscription(jsonb),public.request_renewal(uuid),public.admin_set_user_role(uuid,text),
  public.admin_financial_report(timestamptz,timestamptz),public.admin_run_maintenance(),public.admin_send_notification(jsonb),public.reserve_receipt_upload(text,text,integer) TO authenticated;
INSERT INTO public.store_schema_migrations(version) VALUES('202611250001_secure_store') ON CONFLICT DO NOTHING;
COMMIT;
