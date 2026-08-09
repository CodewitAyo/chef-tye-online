
-- Atomic redemption RPC (replaces service-role ledger insert)
CREATE OR REPLACE FUNCTION public.redeem_reward(_reward_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _name text;
  _cost integer;
  _active boolean;
  _bal integer;
  _red_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT name, points_cost, active INTO _name, _cost, _active
  FROM public.rewards_catalog WHERE id = _reward_id;
  IF NOT FOUND OR NOT _active THEN
    RAISE EXCEPTION 'Reward unavailable';
  END IF;

  SELECT points INTO _bal FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF _bal IS NULL OR _bal < _cost THEN
    RAISE EXCEPTION 'Not enough points';
  END IF;

  INSERT INTO public.reward_redemptions (user_id, reward_id, points_cost, status)
  VALUES (_uid, _reward_id, _cost, 'available')
  RETURNING id INTO _red_id;

  INSERT INTO public.loyalty_points_ledger (user_id, delta, reason, redemption_id, note, created_by)
  VALUES (_uid, -_cost, 'redeem', _red_id, 'Redeemed: ' || _name, _uid);

  INSERT INTO public.audit_log (actor_id, action, target_table, target_id, after)
  VALUES (_uid, 'reward.redeem', 'reward_redemptions', _red_id::text,
          jsonb_build_object('reward_id', _reward_id, 'points_cost', _cost));

  RETURN _red_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid) TO authenticated;

-- Chat: allow authenticated + anonymous writes under RLS
GRANT INSERT, UPDATE ON public.chat_conversations TO anon, authenticated;
GRANT SELECT ON public.chat_conversations TO anon;
GRANT INSERT ON public.chat_messages TO anon, authenticated;

DROP POLICY IF EXISTS "Users insert own conversations" ON public.chat_conversations;
CREATE POLICY "Users insert own conversations" ON public.chat_conversations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anon insert guest conversations" ON public.chat_conversations;
CREATE POLICY "Anon insert guest conversations" ON public.chat_conversations
FOR INSERT TO anon
WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Users update own conversations" ON public.chat_conversations;
CREATE POLICY "Users update own conversations" ON public.chat_conversations
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anon update guest conversations" ON public.chat_conversations;
CREATE POLICY "Anon update guest conversations" ON public.chat_conversations
FOR UPDATE TO anon
USING (user_id IS NULL)
WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Anon read guest conversations" ON public.chat_conversations;
CREATE POLICY "Anon read guest conversations" ON public.chat_conversations
FOR SELECT TO anon
USING (user_id IS NULL);

DROP POLICY IF EXISTS "Users insert own conversation messages" ON public.chat_messages;
CREATE POLICY "Users insert own conversation messages" ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chat_conversations c
  WHERE c.id = conversation_id AND c.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Anon insert guest conversation messages" ON public.chat_messages;
CREATE POLICY "Anon insert guest conversation messages" ON public.chat_messages
FOR INSERT TO anon
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chat_conversations c
  WHERE c.id = conversation_id AND c.user_id IS NULL
));
