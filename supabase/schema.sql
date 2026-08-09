-- =================================================================
-- Chef Tye — Complete initial migration for a fresh Supabase project
-- Idempotent. Safe to run once on an empty database.
-- =================================================================

-- 1) ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2) PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  display_name text,
  phone text,
  points integer NOT NULL DEFAULT 0,
  lifetime_points integer NOT NULL DEFAULT 0,
  highest_points integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.profiles_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bypass text;
BEGIN
  bypass := current_setting('app.bypass_profiles_guard', true);
  IF TG_OP = 'UPDATE' THEN
    IF bypass IS DISTINCT FROM 'on' AND current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
      NEW.points := OLD.points;
      NEW.lifetime_points := OLD.lifetime_points;
      NEW.highest_points := OLD.highest_points;
    END IF;
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS profiles_guard_trigger ON public.profiles;
CREATE TRIGGER profiles_guard_trigger BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_guard();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'online',
  external_ref text,
  subtotal_ngn integer NOT NULL CHECK (subtotal_ngn >= 0),
  delivery_fee_ngn integer NOT NULL DEFAULT 0 CHECK (delivery_fee_ngn >= 0),
  total_ngn integer NOT NULL CHECK (total_ngn >= 0),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'completed',
  note text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read all orders" ON public.orders;
CREATE POLICY "Admins read all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4) LOYALTY LEDGER
CREATE TABLE IF NOT EXISTS public.loyalty_points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  redemption_id uuid,
  note text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS loyalty_points_ledger_user_created_idx ON public.loyalty_points_ledger (user_id, created_at DESC);
GRANT SELECT ON public.loyalty_points_ledger TO authenticated;
GRANT ALL ON public.loyalty_points_ledger TO service_role;
ALTER TABLE public.loyalty_points_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own ledger" ON public.loyalty_points_ledger;
CREATE POLICY "Users read own ledger" ON public.loyalty_points_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read all ledger" ON public.loyalty_points_ledger;
CREATE POLICY "Admins read all ledger" ON public.loyalty_points_ledger FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5) REWARDS
CREATE TABLE IF NOT EXISTS public.rewards_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  points_cost integer NOT NULL CHECK (points_cost > 0),
  tier_required text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rewards_catalog TO anon, authenticated;
GRANT ALL ON public.rewards_catalog TO service_role;
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.rewards_catalog;
CREATE POLICY "Anyone can view active rewards" ON public.rewards_catalog FOR SELECT TO anon, authenticated USING (active = true);

CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES public.rewards_catalog(id),
  points_cost integer NOT NULL,
  status text NOT NULL DEFAULT 'available',
  requested_at timestamptz NOT NULL DEFAULT now(),
  honored_at timestamptz,
  honored_by uuid REFERENCES auth.users(id),
  note text
);
CREATE INDEX IF NOT EXISTS reward_redemptions_user_idx ON public.reward_redemptions (user_id, requested_at DESC);
GRANT SELECT ON public.reward_redemptions TO authenticated;
GRANT ALL ON public.reward_redemptions TO service_role;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own redemptions" ON public.reward_redemptions;
CREATE POLICY "Users read own redemptions" ON public.reward_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read all redemptions" ON public.reward_redemptions;
CREATE POLICY "Admins read all redemptions" ON public.reward_redemptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6) CHAT
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_id text,
  status text NOT NULL DEFAULT 'open',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_conversations_user_idx ON public.chat_conversations (user_id, last_message_at DESC);
GRANT SELECT ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own conversations" ON public.chat_conversations;
CREATE POLICY "Users read own conversations" ON public.chat_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read all conversations" ON public.chat_conversations;
CREATE POLICY "Admins read all conversations" ON public.chat_conversations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  tool_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_conv_idx ON public.chat_messages (conversation_id, created_at);
GRANT SELECT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own conversation messages" ON public.chat_messages;
CREATE POLICY "Users read own conversation messages" ON public.chat_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins read all messages" ON public.chat_messages;
CREATE POLICY "Admins read all messages" ON public.chat_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7) INQUIRIES (contact form + donations pledges)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('contact','donation','catering')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  amount_ngn INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit an inquiry" ON public.inquiries FOR INSERT TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 120
  AND length(email) BETWEEN 3 AND 255
  AND length(message) BETWEEN 1 AND 5000
);
DROP POLICY IF EXISTS "Admins read all inquiries" ON public.inquiries;
CREATE POLICY "Admins read all inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8) AUDIT
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_table text,
  target_id text,
  before jsonb,
  after jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON public.audit_log (created_at DESC);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read audit log" ON public.audit_log;
CREATE POLICY "Admins read audit log" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9) TRIGGERS: ledger -> profile aggregation
CREATE OR REPLACE FUNCTION public.apply_ledger_to_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_balance integer; new_lifetime integer; new_highest integer;
BEGIN
  PERFORM set_config('app.bypass_profiles_guard', 'on', true);
  IF TG_OP = 'INSERT' THEN
    SELECT points + NEW.delta, lifetime_points + GREATEST(NEW.delta, 0), GREATEST(highest_points, points + NEW.delta)
      INTO new_balance, new_lifetime, new_highest
      FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
    IF new_balance IS NULL THEN
      INSERT INTO public.profiles (id, points, lifetime_points, highest_points)
      VALUES (NEW.user_id, GREATEST(NEW.delta,0), GREATEST(NEW.delta,0), GREATEST(NEW.delta,0))
      ON CONFLICT (id) DO NOTHING;
    ELSE
      UPDATE public.profiles SET points = new_balance, lifetime_points = new_lifetime, highest_points = new_highest WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS ledger_apply_to_profile ON public.loyalty_points_ledger;
CREATE TRIGGER ledger_apply_to_profile AFTER INSERT ON public.loyalty_points_ledger
  FOR EACH ROW EXECUTE FUNCTION public.apply_ledger_to_profile();

CREATE OR REPLACE FUNCTION public.orders_award_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pts integer;
BEGIN
  IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    pts := FLOOR(NEW.subtotal_ngn / 1000.0)::int;
    IF pts > 0 THEN
      INSERT INTO public.loyalty_points_ledger (user_id, delta, reason, order_id, note, created_by)
      VALUES (NEW.user_id, pts, 'earn', NEW.id, 'Earned from ' || NEW.source || ' order', NEW.created_by);
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS orders_award ON public.orders;
CREATE TRIGGER orders_award AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_award_points();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 10) FUNCTION GRANTS
REVOKE EXECUTE ON FUNCTION public.apply_ledger_to_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.orders_award_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.profiles_guard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 11) STORAGE BUCKETS (create if missing) — user-managed content
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('food-images',      'food-images',      true),
  ('profile-images',   'profile-images',   false),
  ('chat-attachments', 'chat-attachments', false),
  ('charity-assets',   'charity-assets',   true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read food-images" ON storage.objects;
CREATE POLICY "Public read food-images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'food-images');

DROP POLICY IF EXISTS "Public read charity-assets" ON storage.objects;
CREATE POLICY "Public read charity-assets" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'charity-assets');

DROP POLICY IF EXISTS "Users read own profile images" ON storage.objects;
CREATE POLICY "Users read own profile images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users write own profile images" ON storage.objects;
CREATE POLICY "Users write own profile images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own profile images" ON storage.objects;
CREATE POLICY "Users update own profile images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users delete own profile images" ON storage.objects;
CREATE POLICY "Users delete own profile images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users read own chat attachments" ON storage.objects;
CREATE POLICY "Users read own chat attachments" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users write own chat attachments" ON storage.objects;
CREATE POLICY "Users write own chat attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 12) SEED REWARDS
INSERT INTO public.rewards_catalog (code, name, description, points_cost, tier_required) VALUES
  ('free_plantain_drink',     'Free plantain or drink',        'Complimentary side of plantain OR a drink on your next order.', 20, 'Member'),
  ('ngn3000_off',              '₦3,000 off next order',         'Discount applied on your next order.',                          60, 'Member'),
  ('free_main_meal_upgrade',   'Free main meal + VIP upgrade',  'Free main meal & instant upgrade to VIP status.',              100, 'Member'),
  ('vip_free_main_meal',       'Free main meal (VIP)',          'Complimentary main meal for VIP members.',                     150, 'VIP'),
  ('vip_premium_reward',       'Premium reward: meal + side',   'Main meal with a premium side, on the house.',                 200, 'VIP'),
  ('elite_big_reward',         'Elite big reward',              'The house-special Elite reward — surprise from Chef Tye.',     300, 'Elite Circle')
ON CONFLICT (code) DO NOTHING;

-- =================================================================
-- 13) SERVICE-ROLE-FREE OPERATIONS
-- Everything below lets the app run entirely on the publishable key.
-- =================================================================

-- Admin-only email lookups (auth.users is not readable under RLS)
CREATE OR REPLACE FUNCTION public.admin_user_id_by_email(_email text)
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  RETURN uid;
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_user_id_by_email(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_user_id_by_email(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_emails_for_users(_user_ids uuid[])
RETURNS TABLE (id uuid, email text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN QUERY SELECT u.id, u.email::text FROM auth.users u WHERE u.id = ANY(_user_ids);
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_emails_for_users(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_emails_for_users(uuid[]) TO authenticated;

-- Admin writes under RLS (no service role)
GRANT INSERT, UPDATE ON public.orders TO authenticated;
GRANT INSERT ON public.loyalty_points_ledger TO authenticated;
GRANT UPDATE ON public.reward_redemptions TO authenticated;
GRANT INSERT ON public.audit_log TO authenticated;

DROP POLICY IF EXISTS "Admins insert orders" ON public.orders;
CREATE POLICY "Admins insert orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins insert ledger" ON public.loyalty_points_ledger;
CREATE POLICY "Admins insert ledger" ON public.loyalty_points_ledger FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update redemptions" ON public.reward_redemptions;
CREATE POLICY "Admins update redemptions" ON public.reward_redemptions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Authenticated insert audit" ON public.audit_log;
CREATE POLICY "Authenticated insert audit" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- Atomic reward redemption (balance check + redemption + ledger + audit)
CREATE OR REPLACE FUNCTION public.redeem_reward(_reward_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _name text; _cost integer; _active boolean; _bal integer; _red_id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501'; END IF;
  SELECT name, points_cost, active INTO _name, _cost, _active FROM public.rewards_catalog WHERE id = _reward_id;
  IF NOT FOUND OR NOT _active THEN RAISE EXCEPTION 'Reward unavailable'; END IF;
  SELECT points INTO _bal FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF _bal IS NULL OR _bal < _cost THEN RAISE EXCEPTION 'Not enough points'; END IF;
  INSERT INTO public.reward_redemptions (user_id, reward_id, points_cost, status)
  VALUES (_uid, _reward_id, _cost, 'available') RETURNING id INTO _red_id;
  INSERT INTO public.loyalty_points_ledger (user_id, delta, reason, redemption_id, note, created_by)
  VALUES (_uid, -_cost, 'redeem', _red_id, 'Redeemed: ' || _name, _uid);
  INSERT INTO public.audit_log (actor_id, action, target_table, target_id, after)
  VALUES (_uid, 'reward.redeem', 'reward_redemptions', _red_id::text,
          jsonb_build_object('reward_id', _reward_id, 'points_cost', _cost));
  RETURN _red_id;
END; $$;
REVOKE EXECUTE ON FUNCTION public.redeem_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid) TO authenticated;

-- Chat writes for members and anonymous visitors (publishable key only)
GRANT INSERT, UPDATE ON public.chat_conversations TO anon, authenticated;
GRANT SELECT ON public.chat_conversations TO anon;
GRANT INSERT ON public.chat_messages TO anon, authenticated;

DROP POLICY IF EXISTS "Users insert own conversations" ON public.chat_conversations;
CREATE POLICY "Users insert own conversations" ON public.chat_conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anon insert guest conversations" ON public.chat_conversations;
CREATE POLICY "Anon insert guest conversations" ON public.chat_conversations FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
DROP POLICY IF EXISTS "Users update own conversations" ON public.chat_conversations;
CREATE POLICY "Users update own conversations" ON public.chat_conversations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anon update guest conversations" ON public.chat_conversations;
CREATE POLICY "Anon update guest conversations" ON public.chat_conversations FOR UPDATE TO anon
  USING (user_id IS NULL) WITH CHECK (user_id IS NULL);
DROP POLICY IF EXISTS "Anon read guest conversations" ON public.chat_conversations;
CREATE POLICY "Anon read guest conversations" ON public.chat_conversations FOR SELECT TO anon
  USING (user_id IS NULL);

DROP POLICY IF EXISTS "Users insert own conversation messages" ON public.chat_messages;
CREATE POLICY "Users insert own conversation messages" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));
DROP POLICY IF EXISTS "Anon insert guest conversation messages" ON public.chat_messages;
CREATE POLICY "Anon insert guest conversation messages" ON public.chat_messages FOR INSERT TO anon
  WITH CHECK (EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND c.user_id IS NULL));
