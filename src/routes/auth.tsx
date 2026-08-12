import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat, Loader2, Sparkles, ArrowLeft } from "lucide-react";

const searchSchema = z.object({
  next: z.string().optional(),
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign In / Join The Elites — Chef Tye" },
      { name: "description", content: "Sign in to your Chef Tye elites account, track loyalty points and unlock perks." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "At least 8 characters").max(72, "Too long");
const nameSchema = z.string().trim().min(1, "Name required").max(120);

function sanitizeNext(raw: string | undefined): string {
  if (!raw) return "/account";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/account";
}

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const next = sanitizeNext(search.next);
  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: next, replace: true });
    });
  }, [navigate, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const parsedEmail = emailSchema.parse(email);
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Check your email for a reset link.");
        setMode("signin");
      } else if (mode === "signup") {
        const parsedName = nameSchema.parse(name);
        const parsedPassword = passwordSchema.parse(password);
        const { error } = await supabase.auth.signUp({
          email: parsedEmail,
          password: parsedPassword,
          options: { data: { full_name: parsedName }, emailRedirectTo: window.location.origin + "/account" },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const parsedPassword = passwordSchema.parse(password);
        // Decide where the session gets stored BEFORE Supabase writes it.
        setAuthPersistMode(keepSignedIn ? "local" : "session");
        clearAdminToken(); // a fresh sign-in always re-prompts for the admin code
        const { error } = await supabase.auth.signInWithPassword({ email: parsedEmail, password: parsedPassword });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: next, replace: true });
      }
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.issues[0]?.message ?? "Invalid input");
      else if (err instanceof Error) toast.error(err.message);
      else toast.error("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const headline = mode === "signup" ? "Join the elites." : mode === "forgot" ? "Reset your password." : "Welcome back.";

  return (
    <SiteLayout>
      <section className="min-h-[80vh] bg-charcoal py-16 text-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cream/80">
              <Sparkles size={14} className="text-brand" /> Chef Tye Elites
            </div>
            <h1 className="mt-5 text-display text-6xl leading-[0.9] sm:text-7xl">{headline}</h1>
            <p className="mt-5 max-w-lg text-lg text-cream/80">
              One account. Track your loyalty points, unlock member perks. Earn <span className="font-bold text-brand">1 point for every ₦1,000</span> on your meal subtotal.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-cream/80">
              <li className="flex items-start gap-2"><ChefHat size={16} className="mt-0.5 text-brand" /> Every meal hand-prepared by Chef Tye himself.</li>
              <li className="flex items-start gap-2"><ChefHat size={16} className="mt-0.5 text-brand" /> Free plantain & drinks from your very first tier.</li>
              <li className="flex items-start gap-2"><ChefHat size={16} className="mt-0.5 text-brand" /> VIP birthday gifts, priority orders, end-of-year prize.</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-cream p-6 text-charcoal shadow-2xl sm:p-8">
            {mode !== "forgot" ? (
              <div className="flex gap-2 rounded-full bg-charcoal/5 p-1">
                <button type="button" onClick={() => setMode("signin")} className={`flex-1 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${mode === "signin" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>Sign In</button>
                <button type="button" onClick={() => setMode("signup")} className={`flex-1 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${mode === "signup" ? "bg-charcoal text-cream" : "text-charcoal/60"}`}>Sign Up</button>
              </div>
            ) : (
              <button type="button" onClick={() => setMode("signin")} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal/70 hover:text-brand">
                <ArrowLeft size={14} /> Back to sign in
              </button>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              {mode === "signup" && (
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-charcoal/70">Full name</span>
                  <input type="text" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand" placeholder="How should we greet you?" autoComplete="name" />
                </label>
              )}
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-charcoal/70">Email</span>
                <input type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand" placeholder="you@email.com" autoComplete="email" />
              </label>
              {mode !== "forgot" && (
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-charcoal/70">Password</span>
                  <input type="password" required minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand" placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                </label>
              )}

              {mode === "signin" && (
                <button type="button" onClick={() => setMode("forgot")} className="block w-full text-right text-xs font-bold uppercase tracking-widest text-brand hover:underline">
                  Forgot password?
                </button>
              )}

              <button type="submit" disabled={busy} className="btn-primary mt-2 w-full justify-center disabled:opacity-60">
                {busy ? <Loader2 className="animate-spin" size={16} /> : null}
                {mode === "signup" ? "Create Account" : mode === "forgot" ? "Send reset link" : "Sign In"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-charcoal/60">
              By continuing you agree to be a good egg. No spam, ever. <Link to="/" className="font-bold text-brand">Back home</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
