import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ChefHat, Gift, Trophy, Crown, ArrowRight, Sparkles } from "lucide-react";
import loyaltyAsset from "@/assets/loyalty.png.asset.json";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join The Chef Tye Family — Loyalty & Rewards" },
      { name: "description", content: "Join the Chef Tye family. Earn 1 point per ₦1,000, unlock free sides, VIP perks and end-of-year prizes." },
      { property: "og:title", content: "Join The Chef Tye Family" },
      { property: "og:description", content: "Chef Tye's loyalty & rewards program. 1 point per ₦1,000 spent, tiers with real perks." },
    ],
  }),
  component: JoinPage,
});

const tiers = [
  { name: "Member", range: "0 – 99 pts", icon: Gift, color: "bg-cream", text: "text-charcoal", perks: ["Free plantain with every order", "Complimentary drinks on select meals", "Member-only discount codes"] },
  { name: "VIP", range: "100 – 199 pts", icon: Trophy, color: "bg-brand", text: "text-brand-foreground", featured: true, perks: ["Everything in Member", "Free main meals at milestones", "Birthday gift from the kitchen", "Priority order queue"] },
  { name: "Elite Circle", range: "200+ pts", icon: Crown, color: "bg-charcoal", text: "text-cream", perks: ["Everything in VIP", "Custom meal requests", "Exclusive tasting invites", "End-of-year top-customer prize"] },
];

function JoinPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-brand blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cream/80">
              <Sparkles size={14} className="text-brand" /> Loyalty & Rewards
            </div>
            <h1 className="mt-5 text-display text-6xl leading-[0.9] sm:text-7xl md:text-[6.5rem]">
              JOIN THE <span className="text-brand">FAMILY.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cream/80">
              One free account. Earn <span className="font-bold text-brand">1 point for every ₦1,000</span> you spend with Chef Tye.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand">
              <ChefHat size={14} /> Every meal hand-prepared by Chef Tye himself
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup", next: "/account" }} className="btn-primary">
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link to="/auth" search={{ mode: "signin", next: "/account" }} className="btn-ghost-cream">
                Already family? Sign in
              </Link>
            </div>
          </div>
          <div className="mx-auto max-w-md overflow-hidden rounded-3xl bg-charcoal p-2">
            <img src={loyaltyAsset.url} alt="Chef Tye loyalty & rewards program" className="w-full rounded-2xl object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="text-center">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Tiers</div>
          <h2 className="mt-2 text-display text-5xl sm:text-6xl">Eat more, earn more.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`card-lift rounded-3xl p-8 shadow-lg ${t.color} ${t.text} ${t.featured ? "md:-translate-y-3" : ""}`}>
              <t.icon size={28} />
              <div className="mt-4 text-display text-4xl">{t.name}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest opacity-80">{t.range}</div>
              <ul className="mt-6 space-y-2 text-sm">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <ChefHat size={14} className="mt-0.5 shrink-0 opacity-70" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream/60 py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">How It Works</div>
          <h2 className="mt-2 text-display text-5xl">Simple. Honest. Rewarding.</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { n: "1", t: "Create your account", d: "Sign up with email in 30 seconds. No card needed." },
              { n: "2", t: "Order & eat", d: "Every ₦1,000 you spend = 1 point after the order clears." },
              { n: "3", t: "Redeem perks", d: "Points unlock free sides, VIP meals, birthday gifts and the year-end prize." },
            ].map((s) => (
              <li key={s.n} className="rounded-3xl border-2 border-charcoal bg-card p-6">
                <div className="text-display text-6xl text-brand">{s.n}</div>
                <div className="mt-2 text-display text-2xl">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link to="/auth" search={{ mode: "signup", next: "/account" }} className="btn-primary">
              Join The Family — Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
