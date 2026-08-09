
DROP POLICY IF EXISTS "Users insert own redemption" ON public.reward_redemptions;
REVOKE INSERT ON public.reward_redemptions FROM authenticated;
