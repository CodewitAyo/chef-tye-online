import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — Chef Tye" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

const passwordSchema = z.string().min(8, "At least 8 characters").max(72);

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const parsed = passwordSchema.parse(password);
      if (parsed !== confirm) throw new Error("Passwords don't match.");
      const { error } = await supabase.auth.updateUser({ password: parsed });
      if (error) throw error;
      toast.success("Password updated. Signing you in.");
      navigate({ to: "/account", replace: true });
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.issues[0]?.message ?? "Invalid password");
      else if (err instanceof Error) toast.error(err.message);
      else toast.error("Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="min-h-[70vh] bg-charcoal py-16 text-cream">
        <div className="mx-auto max-w-md rounded-3xl bg-cream p-8 text-charcoal shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand">
            <KeyRound size={14} /> Password reset
          </div>
          <h1 className="mt-3 text-display text-4xl">Set a new password</h1>
          <p className="mt-2 text-sm text-charcoal/70">
            {ready ? "Enter your new password below." : "Verifying your reset link…"}
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-charcoal/70">New password</span>
              <input type="password" required minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} disabled={!ready} className="mt-1 w-full rounded-xl border-2 border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand disabled:opacity-50" autoComplete="new-password" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-charcoal/70">Confirm password</span>
              <input type="password" required minLength={8} maxLength={72} value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={!ready} className="mt-1 w-full rounded-xl border-2 border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand disabled:opacity-50" autoComplete="new-password" />
            </label>
            <button type="submit" disabled={busy || !ready} className="btn-primary mt-3 w-full justify-center disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={16} /> : null} Update password
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
