import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Sparkles, Trophy, Gift, Crown, ChefHat, ShieldCheck, Loader2 } from "lucide-react";
import { ORDER_URL, isValidPhone } from "@/lib/constants";
import { tierFor, type TierName } from "@/lib/loyalty";
import { getDashboard, redeemReward } from "@/lib/loyalty.functions";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My Account — Chef Tye" }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

const tierIcon: Record<TierName, typeof Gift> = { Member: Gift, VIP: Trophy, "Elite Circle": Crown };

function AccountPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchDashboard = useServerFn(getDashboard);
  const redeem = useServerFn(redeemReward);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [original, setOriginal] = useState({ fullName: "", displayName: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDashboard() });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => {
    if (dashboard.data?.profile) {
      const p = dashboard.data.profile;
      setFullName(p.full_name ?? "");
      setDisplayName(p.display_name ?? "");
      setPhone(p.phone ?? "");
      setOriginal({ fullName: p.full_name ?? "", displayName: p.display_name ?? "", phone: p.phone ?? "" });
    }
  }, [dashboard.data?.profile]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!dashboard.data?.profile) return;
    const trimmedFullName = fullName.trim().slice(0, 120);
    const trimmedDisplayName = displayName.trim().slice(0, 60);
    const trimmedPhone = phone.trim().slice(0, 40);
    const unchanged =
      trimmedFullName === original.fullName &&
      trimmedDisplayName === original.displayName &&
      trimmedPhone === original.phone;
    if (unchanged) {
      toast.info("Nothing to save — no changes made.");
      return;
    }
    if (!isValidPhone(trimmedPhone)) {
      toast.error("That phone number doesn't look right. Use digits, spaces, +, or ( ) only.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: trimmedFullName || null,
      display_name: trimmedDisplayName || null,
      phone: trimmedPhone || null,
    }).eq("id", dashboard.data.profile.id);
    setSaving(false);
    if (error) return toast.error("Couldn't save. Try again.");
    toast.success("Profile updated.");
    setOriginal({ fullName: trimmedFullName, displayName: trimmedDisplayName, phone: trimmedPhone });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  async function handleRedeem(rewardId: string, name: string) {
    setRedeeming(rewardId);
    try {
      await redeem({ data: { rewardId } });
      toast.success(`Redeemed: ${name}.`);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Redemption failed.");
    } finally {
      setRedeeming(null);
    }
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out. Come back hungry.");
    navigate({ to: "/", replace: true });
  }

  const profile = dashboard.data?.profile;
  const points = profile?.points ?? 0;
  const lifetime = profile?.lifetime_points ?? 0;
  const highest = profile?.highest_points ?? 0;
  const tier = tierFor(points);
  const highestTier = tierFor(highest);
  const TierIcon = tierIcon[tier.name];
  const HighestIcon = tierIcon[highestTier.name];
  const progressPct = tier.next ? Math.min(100, Math.round((points / tier.next) * 100)) : 100;

  const availableRewards = useMemo(() => (dashboard.data?.rewards ?? []).filter((r) => points >= r.points_cost), [dashboard.data?.rewards, points]);
  const lockedRewards = useMemo(() => (dashboard.data?.rewards ?? []).filter((r) => points < r.points_cost), [dashboard.data?.rewards, points]);

  if (dashboard.isLoading) {
    return (
      <SiteLayout>
        <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
          <div className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading your kitchen…</div>
        </div>
      </SiteLayout>
    );
  }

  if (dashboard.error) {
    return (
      <SiteLayout>
        <div className="grid min-h-[60vh] place-items-center px-6 text-center">
          <div>
            <p className="text-lg text-foreground">We couldn't load your dashboard.</p>
            <button className="btn-primary mt-4" onClick={() => dashboard.refetch()}>Try again</button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-charcoal py-14 text-cream">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cream/80">
                <Sparkles size={14} className="text-brand" /> Chef Tye Elites
              </div>
              <h1 className="mt-4 text-display text-5xl leading-tight sm:text-6xl">
                Hey, {displayName || fullName || email.split("@")[0]}.
              </h1>
              <p className="mt-2 text-sm text-cream/70">Signed in as {email}</p>
              <p className="mt-1 text-xs text-cream/50">
                Highest tier reached:{" "}
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-cream/10 px-2 py-0.5 font-bold text-cream">
                  <HighestIcon size={12} className="text-brand" /> {highestTier.name} ({highest} pts)
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              {dashboard.data?.isAdmin && (
                <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border-2 border-brand bg-brand/10 px-4 py-2 text-sm font-bold uppercase tracking-widest text-brand hover:bg-brand hover:text-brand-foreground">
                  <ShieldCheck size={14} /> Admin
                </Link>
              )}
              <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border-2 border-cream/40 px-4 py-2 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:border-brand hover:text-brand">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-10 sm:px-8 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl bg-brand p-8 text-brand-foreground shadow-lg">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] opacity-90">
            <TierIcon size={14} /> {tier.name}
          </div>
          <div className="mt-3 text-display text-7xl leading-none">{points} <span className="text-2xl">pts</span></div>
          <p className="mt-2 text-sm opacity-90">{tier.benefit}</p>

          {tier.next && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                <span>Next: {tier.next === 100 ? "VIP" : "Elite Circle"}</span>
                <span>{points} / {tier.next}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-charcoal/25">
                <div className="h-full rounded-full bg-charcoal" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-charcoal/20 p-4">
              <div className="text-xs font-black uppercase tracking-widest opacity-80">Lifetime</div>
              <div className="mt-1 text-2xl font-black">{lifetime} pts</div>
            </div>
            <div className="rounded-2xl bg-charcoal/20 p-4">
              <div className="text-xs font-black uppercase tracking-widest opacity-80">Highest tier</div>
              <div className="mt-1 text-lg font-black">{highestTier.name}</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-black uppercase tracking-widest text-cream">Order Now</a>
            <Link to="/menu" className="rounded-full border-2 border-charcoal px-5 py-2.5 text-sm font-black uppercase tracking-widest text-charcoal">See the menu</Link>
          </div>
        </div>

        <form onSubmit={saveProfile} className="rounded-3xl border-2 border-charcoal bg-card p-6 sm:p-8">
          <h2 className="text-display text-3xl">Your details</h2>
          <p className="mt-1 text-sm text-muted-foreground">Keep these fresh so we can send perks.</p>
          <label className="mt-5 block">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full name</span>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand" />
          </label>
          <label className="mt-3 block">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display name</span>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} placeholder="What we call you" className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand" />
          </label>
          <label className="mt-3 block">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone (optional)</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} placeholder="+234…" className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand" />
          </label>
          <button type="submit" disabled={saving || (fullName.trim().slice(0, 120) === original.fullName && displayName.trim().slice(0, 60) === original.displayName && phone.trim().slice(0, 40) === original.phone)} className="btn-primary mt-5 w-full justify-center disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>

          <div className="mt-6 rounded-2xl bg-brand/10 p-4 text-sm text-foreground">
            <div className="flex items-center gap-2 font-bold text-brand"><ChefHat size={14} /> Member since</div>
            <p className="mt-1 text-muted-foreground">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</p>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-10 sm:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-display text-3xl">Rewards</h2>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{availableRewards.length} available</div>
        </div>

        {availableRewards.length === 0 && lockedRewards.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No rewards yet — keep eating!</p>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {availableRewards.map((r) => (
            <div key={r.id} className="rounded-2xl border-2 border-brand bg-brand/5 p-5">
              <div className="text-xs font-black uppercase tracking-widest text-brand">{r.points_cost} pts · {r.tier_required ?? "Any tier"}</div>
              <div className="mt-1 text-lg font-bold">{r.name}</div>
              <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              <button onClick={() => handleRedeem(r.id, r.name)} disabled={redeeming === r.id} className="btn-primary mt-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
                {redeeming === r.id ? <Loader2 className="animate-spin" size={14} /> : null} Redeem
              </button>
            </div>
          ))}
          {lockedRewards.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-background p-5 opacity-70">
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">{r.points_cost} pts · {r.tier_required ?? "Any tier"}</div>
              <div className="mt-1 text-lg font-bold">{r.name}</div>
              <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              <div className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{r.points_cost - points} pts to unlock</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-10 sm:px-8">
        <h2 className="text-display text-3xl">Redemption history</h2>
        {dashboard.data && dashboard.data.redemptions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No redemptions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {dashboard.data?.redemptions.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <div className="font-bold">{r.points_cost} pts</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.requested_at).toLocaleString()}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${r.status === "honored" ? "bg-green-100 text-green-800" : r.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-brand/20 text-brand"}`}>
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 pb-16 sm:px-8 md:grid-cols-2">
        <div>
          <h2 className="text-display text-3xl">Order history</h2>
          {dashboard.data && dashboard.data.orders.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No orders logged yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
              {dashboard.data?.orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                  <div>
                    <div className="font-bold">₦{o.subtotal_ngn.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{o.source} · {new Date(o.occurred_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{o.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-display text-3xl">Recent activity</h2>
          {dashboard.data && dashboard.data.ledger.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
              {dashboard.data?.ledger.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                  <div>
                    <div className="font-bold">{l.reason}</div>
                    <div className="text-xs text-muted-foreground">{l.note ?? "—"} · {new Date(l.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className={`font-black ${l.delta >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {l.delta > 0 ? "+" : ""}{l.delta}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
