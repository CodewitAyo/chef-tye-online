import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Heart, Users, Gift, Sparkles, ArrowRight } from "lucide-react";
import loyaltyAsset from "@/assets/loyalty.png.asset.json";
import round2Asset from "@/assets/round-2.png.asset.json";

export const Route = createFileRoute("/charity")({
  head: () => ({
    meta: [
      { title: "Feed The Streets Campaign — Chef Tye Charity" },
      { name: "description", content: "Every December, Chef Tye's Feed The Streets Campaign serves free meals to vulnerable and impoverished children across Lagos." },
      { property: "og:title", content: "Feed The Streets — Chef Tye" },
      { property: "og:description", content: "Chef Tye's annual charity feeding vulnerable children across Lagos every December." },
    ],
  }),
  component: CharityPage,
});

function CharityPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-brand text-brand-foreground">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-charcoal blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28">
          <div className="inline-flex items-center gap-2 rounded-full bg-charcoal/25 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <Heart size={14} /> Every December · Lagos
          </div>
          <h1 className="mt-5 max-w-4xl text-display text-6xl leading-[0.9] sm:text-7xl md:text-[7rem]">FEED THE STREETS CAMPAIGN</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed opacity-90">
            One month, one mission. Hot, home-cooked meals for vulnerable and impoverished children across Lagos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#donate" className="rounded-full bg-charcoal px-7 py-3.5 text-sm font-black uppercase tracking-widest text-cream shadow-lg transition-all hover:-translate-y-0.5 hover:bg-charcoal/90">
              <Heart className="mr-2 inline" size={14} /> Donate Now
            </a>
            <Link to="/contact" className="btn-ghost-cream" style={{ borderColor: "var(--charcoal)", color: "var(--charcoal)" }}>
              Volunteer / Partner
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, k: "500+", v: "Kids fed each December" },
            { icon: Gift, k: "1", v: "Hot meal per plate, no shortcuts" },
            { icon: Sparkles, k: "100%", v: "Cooked by Chef Tye's kitchen" },
          ].map((s) => (
            <div key={s.v} className="card-lift rounded-2xl border-2 border-charcoal bg-card p-6 text-center">
              <s.icon className="mx-auto text-brand" size={28} />
              <div className="mt-3 text-display text-5xl text-foreground">{s.k}</div>
              <div className="mt-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1.2fr]">
        <div className="overflow-hidden rounded-3xl">
          <img src={round2Asset.url} alt="Chef Tye poster" className="aspect-[3/4] w-full object-cover" />
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Why We Do It</div>
          <h2 className="mt-2 text-display text-5xl">A plate is a promise.</h2>
          <p className="mt-5 text-lg leading-relaxed text-foreground/85">
            Chef Tye grew up understanding that a warm meal is more than calories. It's dignity, safety, a little bit of joy in a hard week.
          </p>
        </div>
      </section>

      <section id="donate" className="bg-charcoal text-cream">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 md:py-24">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Donate</div>
            <h2 className="mt-2 text-display text-5xl sm:text-6xl">Feed a child. Fuel the mission.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-cream/80">
              Pick a plate, or write your own amount. 100% of donations go toward ingredients, packaging, and getting hot food into kids' hands this December.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { amt: 5000, meals: "5 meals" },
              { amt: 15000, meals: "15 meals", featured: true },
              { amt: 50000, meals: "50 meals" },
            ].map((t) => (
              <Link
                key={t.amt}
                to="/donate"
                search={{ amount: t.amt }}
                className={`card-lift rounded-2xl p-6 text-center ring-1 transition-colors ${t.featured ? "bg-brand text-brand-foreground ring-brand" : "bg-cream/5 text-cream ring-cream/20 hover:bg-cream/10"}`}
              >
                <div className="text-display text-4xl">₦{t.amt.toLocaleString()}</div>
                <div className="mt-1 text-sm font-semibold uppercase tracking-widest opacity-90">{t.meals}</div>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-widest">
                  Donate <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/donate" className="btn-primary"><Heart size={16} /> Donate A Custom Amount</Link>
            <p className="mt-4 text-xs uppercase tracking-widest text-cream/60">
              Every meal hand-prepared by Chef Tye himself. Confirmation emailed within 24 hours.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1fr_1fr]">
        <div className="overflow-hidden rounded-3xl bg-charcoal p-2">
          <img src={loyaltyAsset.url} alt="Chef Tye Loyalty & Rewards Program" className="w-full rounded-2xl object-cover" />
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">While you're here</div>
          <h2 className="mt-2 text-display text-5xl">Every order earns points.</h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/85">
            Chef Tye's Loyalty &amp; Rewards Program stacks a point for every ₦1,000 spent. From free plantain and drinks to VIP perks and a year-end top-customer prize.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-foreground/85">
            <li><span className="font-bold text-brand">Member (0–99 pts):</span> Free plantain, drinks & discounts.</li>
            <li><span className="font-bold text-brand">VIP (100–199 pts):</span> Free main meals, birthday gift, priority orders.</li>
            <li><span className="font-bold text-brand">Elite Circle (200+ pts):</span> Custom meal requests, exclusive invites, end-of-year prize.</li>
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}
