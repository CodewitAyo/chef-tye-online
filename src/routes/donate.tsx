import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Heart, CheckCircle2, ArrowRight, Users, Loader2 } from "lucide-react";
import { submitInquiry } from "@/lib/inquiries.functions";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, isValidPhone, sanitizePhoneInput } from "@/lib/constants";

const searchSchema = z.object({
  amount: z.number().int().min(0).max(1_000_000_000).optional(),
});

export const Route = createFileRoute("/donate")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Donate — Feed The Streets Campaign | Chef Tye" },
      { name: "description", content: "Pledge a donation to Chef Tye's Feed The Streets Campaign. Hot meals for vulnerable children across Lagos every December." },
      { property: "og:title", content: "Donate — Feed The Streets" },
      { property: "og:description", content: "Every ₦5,000 pledged = 5 hot meals for kids in Lagos." },
    ],
  }),
  component: DonatePage,
});

const presets = [5000, 15000, 50000, 100000];

const formSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional(),
  amount: z.number().int().min(1000).max(50_000_000),
  message: z.string().trim().max(2000).optional(),
});

function DonatePage() {
  const search = useSearch({ from: "/donate" });
  const submit = useServerFn(submitInquiry);
  const [amount, setAmount] = useState<number>(search.amount ?? 15000);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const meals = Math.max(0, Math.floor((effectiveAmount || 0) / 1000));

  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: () => {
      setDone(true);
      toast.success("Your pledge has been received. Please check your email for transfer details.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (e: Error) => toast.error(e.message || "Something went wrong."),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (phone.trim() && !isValidPhone(phone)) {
      toast.error("That phone number doesn't look right. Use digits, spaces, +, or ( ) only, or leave it blank.");
      return;
    }
    try {
      const parsed = formSchema.parse({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        amount: effectiveAmount,
        message: message.trim() || undefined,
      });
      mutation.mutate({
        data: {
          type: "donation",
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          subject: "Feed The Streets Pledge",
          message: parsed.message ?? `Pledge for Feed The Streets: ₦${parsed.amount.toLocaleString()}`,
          amount_ngn: parsed.amount,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.issues[0]?.message ?? "Please check the form.");
    }
  }

  if (done) {
    return (
      <SiteLayout>
        <section className="min-h-[70vh] bg-charcoal py-20 text-cream">
          <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
            <CheckCircle2 className="mx-auto text-brand" size={64} />
            <h1 className="mt-6 text-display text-5xl leading-tight sm:text-6xl">Thank you, {name.split(" ")[0] || "friend"}.</h1>
            <p className="mt-4 text-lg text-cream/80">Your pledge has been received. Please check your email for transfer details.</p>
            <p className="mt-3 text-sm text-cream/70">
              Pledge: <span className="font-bold text-brand">₦{effectiveAmount.toLocaleString()}</span> ({meals} meals) · Confirmation sent to <span className="font-bold text-cream">{email || "your email"}</span>.
            </p>
            <p className="mt-3 text-sm text-cream/70">
              For urgent questions: <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-brand">{CONTACT_EMAIL}</a> · {CONTACT_PHONE_DISPLAY}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/charity" className="btn-primary">Back to the campaign</Link>
              <button type="button" onClick={() => { setDone(false); setName(""); setEmail(""); setPhone(""); setMessage(""); setCustomAmount(""); }} className="btn-ghost-cream">
                Pledge again
              </button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-brand py-16 text-brand-foreground">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-charcoal/25 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <Heart size={14} /> Feed The Streets · Every December
          </div>
          <h1 className="mt-4 text-display text-6xl leading-[0.95] sm:text-7xl">Pledge a plate.</h1>
          <p className="mt-4 max-w-2xl text-lg opacity-90">
            Every ₦1,000 = one hot, hand-prepared meal for a child in Lagos.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr]">
        <form onSubmit={onSubmit} className="rounded-3xl border-2 border-charcoal bg-card p-6 sm:p-8">
          <h2 className="text-display text-3xl">Your pledge</h2>

          <div className="mt-5">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Choose an amount</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setAmount(p); setCustomAmount(""); }}
                  className={`rounded-2xl border-2 px-3 py-3 text-sm font-black uppercase tracking-widest transition-colors ${!customAmount && amount === p ? "border-brand bg-brand text-brand-foreground" : "border-border hover:border-brand"}`}
                >
                  ₦{p.toLocaleString()}
                </button>
              ))}
            </div>
            <label className="mt-3 block">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Or enter a custom amount (₦)</span>
              <input
                type="number" inputMode="numeric" min={1000} max={50_000_000}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))}
                className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
                placeholder="e.g. 25000"
              />
            </label>
            {effectiveAmount > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-brand/10 px-4 py-3 text-sm">
                <Users size={16} className="text-brand" />
                <span><strong>{meals}</strong> {meals === 1 ? "meal" : "meals"} for kids in Lagos.</span>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full name</span>
              <input type="text" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</span>
              <input type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone (optional)</span>
              <input type="tel" inputMode="tel" maxLength={40} value={phone} onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))} className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand" placeholder="+234…" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Note (optional)</span>
              <textarea maxLength={2000} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand" placeholder="Anything Chef Tye should know?" />
            </label>
          </div>

          <button type="submit" disabled={mutation.isPending || !effectiveAmount} className="btn-primary mt-6 w-full justify-center disabled:opacity-60">
            {mutation.isPending ? (<><Loader2 size={16} className="animate-spin" /> Submitting…</>) : (<>Submit Pledge <ArrowRight size={16} /></>)}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            No card is charged on this page. We'll email you transfer details within 24 hours.
          </p>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-charcoal p-6 text-cream sm:p-8">
            <h3 className="text-display text-3xl">Where it goes</h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/85">
              <li className="flex items-start gap-2"><Heart size={14} className="mt-1 text-brand" /> Ingredients & packaging for December feedings.</li>
              <li className="flex items-start gap-2"><Heart size={14} className="mt-1 text-brand" /> Transport to feeding sites across Lagos.</li>
              <li className="flex items-start gap-2"><Heart size={14} className="mt-1 text-brand" /> Every plate hand-prepared by Chef Tye himself.</li>
            </ul>
          </div>
          <div className="rounded-3xl border-2 border-charcoal bg-card p-6 sm:p-8">
            <h3 className="text-display text-2xl">Partner as a brand?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Sponsor a full feeding day or send in-kind supplies.</p>
            <Link to="/contact" className="btn-outline mt-4 w-full justify-center">Get in touch</Link>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}
