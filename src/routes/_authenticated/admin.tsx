import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ShieldCheck, Loader2, Plus, ArrowUpDown, Check } from "lucide-react";
import {
  adminAddOrder, adminAdjustPoints, adminHonorRedemption, getAdminOverview,
} from "@/lib/loyalty.functions";
import { ORDER_SOURCES } from "@/lib/loyalty";
import { verifyAdminCode } from "@/lib/admin-code.functions";
import { getAdminToken, setAdminToken, clearAdminToken } from "@/lib/admin-token";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Chef Tye" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminCodeGate({ onVerified }: { onVerified: () => void }) {
  const verify = useServerFn(verifyAdminCode);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await verify({ data: { code } });
      setAdminToken(res.token);
      setCode("");
      onVerified();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Incorrect admin code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-6 py-24">
        <div className="rounded-3xl border-2 border-charcoal bg-card p-8">
          <div className="flex items-center gap-2 text-brand">
            <ShieldCheck size={18} /><h1 className="text-display text-3xl">Admin code</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the shared admin access code to unlock Kitchen HQ for this session.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <input
              type="password" required autoFocus value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="Admin access code" autoComplete="one-time-code"
              className="w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm"
            />
            <button disabled={busy || !code} className="btn-primary w-full justify-center disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={14} /> : null} Unlock
            </button>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
}

function AdminPage() {
  const [verified, setVerified] = useState(() => Boolean(getAdminToken()));
  if (!verified) return <AdminCodeGate onVerified={() => setVerified(true)} />;
  return <AdminConsole onCodeExpired={() => { clearAdminToken(); setVerified(false); }} />;
}

function AdminConsole({ onCodeExpired }: { onCodeExpired: () => void }) {
  const qc = useQueryClient();
  const fetchOverview = useServerFn(getAdminOverview);
  const addOrder = useServerFn(adminAddOrder);
  const adjust = useServerFn(adminAdjustPoints);
  const honor = useServerFn(adminHonorRedemption);

  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: () => fetchOverview(), retry: false });

  const [orderForm, setOrderForm] = useState({
    userEmail: "", source: "online" as (typeof ORDER_SOURCES)[number]["value"],
    subtotalNgn: "", deliveryFeeNgn: "", externalRef: "", occurredAt: "", note: "",
  });
  const [adjForm, setAdjForm] = useState({ userEmail: "", delta: "", reason: "" });
  const [busy, setBusy] = useState<string | null>(null);

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    setBusy("order");
    try {
      await addOrder({
        data: {
          userEmail: orderForm.userEmail.trim(),
          source: orderForm.source,
          subtotalNgn: parseInt(orderForm.subtotalNgn || "0", 10),
          deliveryFeeNgn: parseInt(orderForm.deliveryFeeNgn || "0", 10),
          externalRef: orderForm.externalRef.trim() || undefined,
          occurredAt: orderForm.occurredAt ? new Date(orderForm.occurredAt).toISOString() : undefined,
          note: orderForm.note.trim() || undefined,
        },
      });
      toast.success("Order added. Points awarded.");
      setOrderForm({ ...orderForm, subtotalNgn: "", deliveryFeeNgn: "", externalRef: "", note: "" });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setBusy(null); }
  }

  async function submitAdjustment(e: React.FormEvent) {
    e.preventDefault();
    setBusy("adjust");
    try {
      await adjust({ data: { userEmail: adjForm.userEmail.trim(), delta: parseInt(adjForm.delta, 10), reason: adjForm.reason.trim() } });
      toast.success("Points adjusted.");
      setAdjForm({ userEmail: "", delta: "", reason: "" });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setBusy(null); }
  }

  async function markHonored(id: string) {
    setBusy(id);
    try {
      await honor({ data: { redemptionId: id } });
      toast.success("Marked as honored.");
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setBusy(null); }
  }

  const overviewErrorMessage = overview.error instanceof Error ? overview.error.message : "";
  const needsCode = /admin code required/i.test(overviewErrorMessage);
  useEffect(() => {
    if (needsCode) onCodeExpired();
  }, [needsCode, onCodeExpired]);

  if (overview.isLoading) {
    return (<SiteLayout><div className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin" /></div></SiteLayout>);
  }

  if (overview.error) {
    const message = overview.error instanceof Error ? overview.error.message : "";
    if (/admin code required/i.test(message)) {
      onCodeExpired();
      return (<SiteLayout><div className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin" /></div></SiteLayout>);
    }
    const isPermissionError = /admin only|forbidden|unauthorized/i.test(message);
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <h1 className="text-display text-3xl">{isPermissionError ? "Admins only" : "Admin dashboard unavailable"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isPermissionError ? "You don't have permission to view this page." : message || "The admin data could not be loaded."}
          </p>
        </div>
      </SiteLayout>
    );
  }

  const data = overview.data!;

  return (
    <SiteLayout>
      <section className="bg-charcoal py-12 text-cream">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cream/80">
            <ShieldCheck size={14} className="text-brand" /> Admin console
          </div>
          <h1 className="mt-4 text-display text-5xl">Kitchen HQ</h1>
          <p className="mt-2 text-sm text-cream/70">Log offline orders, adjust points, honor rewards. Every action is audited.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8 md:grid-cols-2">
        <form onSubmit={submitOrder} className="rounded-3xl border-2 border-charcoal bg-card p-6">
          <div className="flex items-center gap-2 text-brand">
            <Plus size={16} /><h2 className="text-display text-2xl">Add order</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Log a past / offline / WhatsApp / Instagram order. Points auto-award on the subtotal.</p>
          <div className="mt-4 space-y-3 text-sm">
            <input required type="email" placeholder="Member email" value={orderForm.userEmail} onChange={(e) => setOrderForm({ ...orderForm, userEmail: e.target.value })} className="w-full rounded-xl border-2 border-border bg-background px-3 py-2" />
            <select value={orderForm.source} onChange={(e) => setOrderForm({ ...orderForm, source: e.target.value as typeof orderForm.source })} className="w-full rounded-xl border-2 border-border bg-background px-3 py-2">
              {ORDER_SOURCES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input required type="number" min={0} placeholder="Subtotal ₦" value={orderForm.subtotalNgn} onChange={(e) => setOrderForm({ ...orderForm, subtotalNgn: e.target.value })} className="rounded-xl border-2 border-border bg-background px-3 py-2" />
              <input type="number" min={0} placeholder="Delivery ₦" value={orderForm.deliveryFeeNgn} onChange={(e) => setOrderForm({ ...orderForm, deliveryFeeNgn: e.target.value })} className="rounded-xl border-2 border-border bg-background px-3 py-2" />
            </div>
            <input type="datetime-local" value={orderForm.occurredAt} onChange={(e) => setOrderForm({ ...orderForm, occurredAt: e.target.value })} className="w-full rounded-xl border-2 border-border bg-background px-3 py-2" />
            <input placeholder="External ref (Chowdeck ID, WA thread…)" value={orderForm.externalRef} onChange={(e) => setOrderForm({ ...orderForm, externalRef: e.target.value })} className="w-full rounded-xl border-2 border-border bg-background px-3 py-2" />
            <textarea placeholder="Note / reason (visible in audit log)" value={orderForm.note} onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })} className="min-h-[70px] w-full rounded-xl border-2 border-border bg-background px-3 py-2" />
            <button disabled={busy === "order"} className="btn-primary w-full justify-center disabled:opacity-60">
              {busy === "order" ? <Loader2 className="animate-spin" size={14} /> : null} Add order
            </button>
          </div>
        </form>

        <form onSubmit={submitAdjustment} className="rounded-3xl border-2 border-charcoal bg-card p-6">
          <div className="flex items-center gap-2 text-brand">
            <ArrowUpDown size={16} /><h2 className="text-display text-2xl">Adjust points</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Positive to add, negative to subtract. Every adjustment is logged.</p>
          <div className="mt-4 space-y-3 text-sm">
            <input required type="email" placeholder="Member email" value={adjForm.userEmail} onChange={(e) => setAdjForm({ ...adjForm, userEmail: e.target.value })} className="w-full rounded-xl border-2 border-border bg-background px-3 py-2" />
            <input required type="number" placeholder="Delta (e.g. 10 or -5)" value={adjForm.delta} onChange={(e) => setAdjForm({ ...adjForm, delta: e.target.value })} className="w-full rounded-xl border-2 border-border bg-background px-3 py-2" />
            <textarea required placeholder="Reason (required)" value={adjForm.reason} onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })} className="min-h-[70px] w-full rounded-xl border-2 border-border bg-background px-3 py-2" />
            <button disabled={busy === "adjust"} className="btn-primary w-full justify-center disabled:opacity-60">
              {busy === "adjust" ? <Loader2 className="animate-spin" size={14} /> : null} Apply adjustment
            </button>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <h2 className="text-display text-3xl">Pending redemptions</h2>
        {data.pendingRedemptions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing to honor.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {data.pendingRedemptions.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <div className="font-bold">{p.reward_name}</div>
                  <div className="text-xs text-muted-foreground">{p.email} · {p.points_cost} pts · {new Date(p.requested_at).toLocaleString()}</div>
                </div>
                <button disabled={busy === p.id} onClick={() => markHonored(p.id)} className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-foreground disabled:opacity-60">
                  {busy === p.id ? <Loader2 className="animate-spin" size={12} /> : <Check size={12} />} Mark honored
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <h2 className="text-display text-3xl">Members</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-cream/30 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-right">Points</th>
                <th className="px-4 py-2 text-right">Lifetime</th>
                <th className="px-4 py-2 text-right">Highest</th>
              </tr>
            </thead>
            <tbody>
              {data.members.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-4 py-2">{m.email}</td>
                  <td className="px-4 py-2">{m.display_name ?? m.full_name ?? "—"}</td>
                  <td className="px-4 py-2 text-right font-bold">{m.points}</td>
                  <td className="px-4 py-2 text-right">{m.lifetime_points}</td>
                  <td className="px-4 py-2 text-right">{m.highest_points}</td>
                </tr>
              ))}
              {data.members.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No members yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <h2 className="text-display text-3xl">Audit log</h2>
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border text-sm">
          {data.audit.map((a) => (
            <li key={a.id} className="p-4">
              <div className="font-bold">{a.action}</div>
              <div className="text-xs text-muted-foreground">{a.target_table}/{a.target_id ?? "—"} · {new Date(a.created_at).toLocaleString()}</div>
              {a.note && <div className="mt-1 text-xs">{a.note}</div>}
            </li>
          ))}
          {data.audit.length === 0 && (<li className="p-4 text-center text-muted-foreground">No activity yet.</li>)}
        </ul>
      </section>
    </SiteLayout>
  );
}
