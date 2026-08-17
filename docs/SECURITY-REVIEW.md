# Security review — Phase 5 (2026-08-16)

## CT-SEC-002: SECURITY DEFINER functions callable by `authenticated`

Supabase's advisor flags four functions as `SECURITY DEFINER` and reachable via
`/rest/v1/rpc/...` by any signed-in user. This is expected — each one needs to run with
elevated privilege to do its job, and each independently re-checks authorization inside
the function body rather than relying on the caller's row-level grants. Read directly from
`pg_get_functiondef` on 2026-08-16 to confirm current behavior (not just past review notes):

- **`admin_user_id_by_email(_email text)`** — looks up a user's ID by email in `auth.users`
  (not directly queryable by clients). Opens with
  `IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'`.
  Non-admins get a hard error before any lookup happens.
- **`admin_emails_for_users(_user_ids uuid[])`** — same admin-only guard, used by the admin
  panel to resolve emails for a batch of user IDs.
- **`redeem_reward(_reward_id uuid)`** — requires `auth.uid() IS NOT NULL`. Locks the
  caller's own `profiles` row with `FOR UPDATE` before checking/deducting points, so
  concurrent redemption requests can't race past the balance check. Only ever touches the
  calling user's own data — no cross-user parameter.
- **`has_role(_user_id uuid, _role app_role)`** — a plain `SELECT EXISTS(...)` helper. Needs
  `SECURITY DEFINER` because it's called from inside RLS policies on other tables and by the
  three functions above; without it, those callers would need direct `SELECT` on
  `user_roles`, which is a bigger surface than the boolean answer itself.

**Note for future review:** `has_role` takes an arbitrary `_user_id`, so any authenticated
user who already knows (or guesses) another user's UUID can ask "is this specific person an
admin?" and get a true/false answer. Low severity — it doesn't reveal identity beyond a UUID
someone already has — but worth tightening (e.g. restrict to `auth.uid() = _user_id` unless
the caller is already an admin) if this function's usage ever expands beyond its current
internal call sites.

**Required work:** none. Re-review this doc whenever backend logic changes near these four
functions, per the original CT-SEC-002 ticket.

## Storage — public bucket listing (fixed 2026-08-16)

`storage.objects` had broad `SELECT` policies (`Public read charity-assets`,
`Public read food-images`) that let any client call `.list()`/`.download()` and enumerate
every file in those buckets. Both buckets are marked `public` in `storage.buckets`, so object
serving via `getPublicUrl()` already bypasses RLS entirely and never depended on these
policies — confirmed the app's client code doesn't call `.list()` or `.download()` on either
bucket. Both policies were dropped; public URL access is unaffected, listing is now closed.
`chat-attachments` and `profile-images` are private buckets with per-user-folder policies
already scoped to `auth.uid()` — no change needed there.

## Auth — leaked password protection (still deferred, CT-SEC-003)

Confirmed via Supabase docs (2026-08-16): still Pro-plan-and-above only. Free-tier projects
can't enable this regardless of dashboard config. Stays deferred until/unless the project
moves to a paid plan — this is a plan decision, not a code fix.

## Dependency scan — js-yaml quadratic-DoS advisories (no action needed)

`@tanstack/start-plugin-core` → `xmlbuilder2` → `js-yaml@4.3.1` carries three known
quadratic-complexity DoS advisories (GHSA-h67p-54hq-rp68, GHSA-52cp-r559-cp3m,
GHSA-5p4m-2wfm-xmqj). The fix only exists in js-yaml 5.2.1+; TanStack hasn't picked it up
yet, and this isn't something we can patch from our side without forking a transitive dep.

Checked actual exposure before deciding this was low priority: `start-plugin-core` is a Vite
build plugin, not a server runtime dependency. Built the production bundle and grepped
`.output/server` for `js-yaml`/`xmlbuilder2`/`resolveYamlOmap` — none present. The vulnerable
code never ships to the deployed server, and nothing in this app parses user-supplied YAML at
request time, so there's no live attack surface today. Worth re-checking next time
`@tanstack/react-start` is upgraded, in case a future release drops the xmlbuilder2 dependency
or bumps it past js-yaml 5.x.

## Performance advisories (informational, matches CT-PERF-001 / CT-PERF-002 — no action per those tickets)

Live advisor scope is broader than the original ticket descriptions suggested, noting here
for completeness:

- **`auth_rls_initplan`** (CT-PERF-001): affects RLS policies on `profiles`, `orders`,
  `user_roles`, `loyalty_points_ledger`, `reward_redemptions`, `chat_conversations`,
  `chat_messages`, `inquiries`, and `audit_log` — not just "a handful," effectively every
  policy that calls `auth.<function>()` directly instead of `(select auth.<function>())`.
  Fine at current traffic per the original ticket; revisit before scaling.
- **`unindexed_foreign_keys`** (CT-PERF-002): 7 FKs lack covering indexes —
  `audit_log.actor_id`, `loyalty_points_ledger.created_by`, `loyalty_points_ledger.order_id`,
  `orders.created_by`, `orders.user_id`, `reward_redemptions.honored_by`,
  `reward_redemptions.reward_id`. Same call as the ticket: not urgent at current scale.
- **`multiple_permissive_policies`** (new finding, not in an existing ticket): several tables
  (`profiles`, `orders`, `user_roles`, `loyalty_points_ledger`, `reward_redemptions`,
  `chat_conversations`, `chat_messages`) have separate "Admins read all X" and "Users read own
  X" `SELECT` policies for the same role/action, so Postgres evaluates both on every query
  instead of one combined policy. Same category and urgency as CT-PERF-001 — flagging for
  awareness, no action taken without a ticket.
