
-- Admin write policies (RLS insert/update via has_role)
GRANT INSERT, UPDATE ON public.orders TO authenticated;
GRANT INSERT, UPDATE ON public.loyalty_points_ledger TO authenticated;
GRANT INSERT, UPDATE ON public.reward_redemptions TO authenticated;
GRANT INSERT ON public.audit_log TO authenticated;

DROP POLICY IF EXISTS "Admins insert orders" ON public.orders;
CREATE POLICY "Admins insert orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users insert own redemption" ON public.reward_redemptions;
CREATE POLICY "Users insert own redemption" ON public.reward_redemptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins update redemptions" ON public.reward_redemptions;
CREATE POLICY "Admins update redemptions" ON public.reward_redemptions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins insert ledger" ON public.loyalty_points_ledger;
CREATE POLICY "Admins insert ledger" ON public.loyalty_points_ledger FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated insert audit" ON public.audit_log;
CREATE POLICY "Authenticated insert audit" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- Admin email lookup (bypasses auth schema RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.admin_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  RETURN uid;
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_user_id_by_email(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_user_id_by_email(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_emails_for_users(_user_ids uuid[])
RETURNS TABLE(id uuid, email text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY SELECT u.id, u.email::text FROM auth.users u WHERE u.id = ANY(_user_ids);
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_emails_for_users(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_emails_for_users(uuid[]) TO authenticated;
