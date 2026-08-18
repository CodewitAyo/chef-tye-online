import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Heart, Users, Gift, Sparkles, ArrowRight, Calendar, MapPin, Utensils, HandHeart } from "lucide-react";
const CHARITY_IMG_BASE =
  "https://fnopenwjlrrbhrisxrxa.supabase.co/storage/v1/object/public/charity-assets/";
const charityChildHighFive = `${CHARITY_IMG_BASE}Chef%20Tye%20Charity%20Event%20Child%20High%20Five%20Image.png`;
const charityEventImage1 = `${CHARITY_IMG_BASE}Chef%20Tye%20Charity%20Event%20Image%201.png`;
const charityLongLine = `${CHARITY_IMG_BASE}Chef%20Tye%20Charity%20Event%20Long%20Line%20Image.png`;
const charityIceCreamCart = `${CHARITY_IMG_BASE}Chef%20Tye%20Charity%20Event%20Long%20Ice%20Cream%20Cart%20Close.png`;

export const Route = createFileRoute("/charity")({
  head: () => ({
    meta: [
      { title: "Feed The Streets Campaign — Chef Tye Charity" },
      { name: "description", content: "Every December, Chef Tye's Feed The Streets Campaign serves free hot meals to vulnerable and impoverished children across Lagos. Learn how to donate, volunteer, or sponsor a feeding day." },
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
            One month. One mission. Hot, home-cooked meals for vulnerable and impoverished children across Lagos, cooked by the same hands that cook everything else on this menu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#donate" className="rounded-full bg-charcoal px-7 py-3.5 text-sm font-black uppercase tracking-widest text-cream shadow-lg transition-all hover:-translate-y-0.5 hover:bg-charcoal/90">
              <Heart className="mr-2 inline" size={14} /> Donate Now
            </a>
            <Link to="/contact" className="btn-ghost-cream" style={{ borderColor: "var(--charcoal)", color: "var(--charcoal)" }}>
              Volunteer or Partner
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, k: "500+", v: "Kids fed each December" },
            { icon: Gift, k: "1", v: "Hot meal per plate, no shortcuts" },
            { icon: Sparkles, k: "100%", v: "Cooked in Chef Tye's kitchen" },
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
          <img src={charityChildHighFive} alt="Chef Tye high-fiving a child at a Feed The Streets event" className="aspect-[3/4] w-full object-cover" />
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Why We Do It</div>
          <h2 className="mt-2 text-display text-5xl">A plate is a promise.</h2>
          <p className="mt-5 text-lg leading-relaxed text-foreground/85">
            Chef Tye grew up understanding that a warm meal is more than calories. It's dignity, safety, a little bit of joy in a hard week. This campaign started because one December he saw a kid stretch a single meal across a whole day, and decided that wasn't happening on his watch again.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-foreground/85">
            Feed The Streets isn't a photo-op. It's the same kitchen, the same ingredients, the same care that goes into every paying customer's plate, going out for free to kids who need it most.
          </p>
        </div>
      </section>

      <section className="bg-cream/60 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">How It Works</div>
          <h2 className="mt-2 text-display text-5xl">From your donation to their plate.</h2>

          <ol className="mt-8 grid gap-5 md:grid-cols-4">
            {[
              { icon: HandHeart, n: "1", t: "You pledge", d: "Pick an amount or a preset. You get transfer details by email within a day." },
              { icon: Utensils, n: "2", t: "We shop and cook", d: "100% of donations go to ingredients, packaging and fuel. No overheads, no salaries." },
              { icon: MapPin, n: "3", t: "We drive out", d: "Every December week we hit different neighbourhoods across Lagos with hot food." },
              { icon: Calendar, n: "4", t: "You see it", d: "We send updates, photos and totals so you know exactly what your money did." },
            ].map((s) => (
              <li key={s.n} className="rounded-3xl border-2 border-charcoal bg-card p-6">
                <s.icon size={22} className="text-brand" />
                <div className="mt-3 text-display text-5xl text-brand">{s.n}</div>
                <div className="mt-1 text-display text-2xl">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Where Your Money Actually Goes</div>
        <h2 className="mt-2 text-display text-5xl">Small amount. Real impact.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            { amt: "₦1,000", d: "One hot meal for one child. Rice, protein, sauce, love." },
            { amt: "₦5,000", d: "Feeds a family of five in one sitting, or five kids on the street." },
            { amt: "₦15,000", d: "Sponsors a full mini-run: 15 meals plus packaging and transport." },
            { amt: "₦50,000", d: "Underwrites a whole feeding day for a neighbourhood in Lagos." },
          ].map((b) => (
            <div key={b.amt} className="rounded-2xl border-2 border-charcoal bg-card p-5">
              <div className="text-display text-3xl text-brand">{b.amt}</div>
              <p className="mt-2 text-sm text-foreground/80">{b.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Every naira goes to food and getting it out. Chef Tye covers the labour himself, every year, no exceptions.
        </p>
      </section>

      <section className="bg-charcoal text-cream">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Straight From The Streets</div>
          <h2 className="mt-2 text-display text-5xl">Why it matters, in their words.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { q: "It was the first proper meal I had that week. I still remember the pasta.", a: "12 y/o, Yaba" },
              { q: "My little brother didn't stop smiling. That's the whole point for me.", a: "Volunteer, 2024 run" },
              { q: "Chef Tye came himself. Served us. That's not normal.", a: "16 y/o, Surulere" },
            ].map((t) => (
              <figure key={t.a} className="rounded-2xl bg-cream/5 p-6 ring-1 ring-cream/10">
                <blockquote className="text-lg leading-relaxed text-cream/90">"{t.q}"</blockquote>
                <figcaption className="mt-3 text-xs font-bold uppercase tracking-widest text-brand">— {t.a}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="donate" className="bg-charcoal text-cream">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 md:py-24">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Donate</div>
            <h2 className="mt-2 text-display text-5xl sm:text-6xl">Feed a child. Fuel the mission.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-cream/80">
              Pick a plate, or set your own amount. Every naira goes toward ingredients, packaging, and getting hot food into kids' hands this December.
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

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">On The Streets</div>
        <h2 className="mt-2 text-display text-5xl">What a feeding day looks like.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="overflow-hidden rounded-2xl sm:row-span-2">
            <img src={charityLongLine} alt="Long line of children waiting for a hot meal at a Chef Tye Feed The Streets event" className="h-full w-full object-cover aspect-[3/4] sm:aspect-auto" />
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img src={charityEventImage1} alt="Chef Tye Feed The Streets charity event" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img src={charityIceCreamCart} alt="Dessert cart serving kids at a Chef Tye charity event" className="aspect-[4/3] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">More Than Money</div>
        <h2 className="mt-2 text-display text-5xl">Other ways you can help.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-charcoal bg-card p-6">
            <div className="text-display text-2xl">Volunteer a day</div>
            <p className="mt-2 text-sm text-muted-foreground">Help pack, drive, or serve on a feeding day. Lagos residents only.</p>
            <Link to="/contact" className="btn-outline mt-4 inline-flex">Sign up</Link>
          </div>
          <div className="rounded-2xl border-2 border-charcoal bg-card p-6">
            <div className="text-display text-2xl">Sponsor a day</div>
            <p className="mt-2 text-sm text-muted-foreground">Brands and businesses can underwrite a full neighbourhood run and get proper coverage.</p>
            <Link to="/contact" className="btn-outline mt-4 inline-flex">Partner with us</Link>
          </div>
          <div className="rounded-2xl border-2 border-charcoal bg-card p-6">
            <div className="text-display text-2xl">Send supplies</div>
            <p className="mt-2 text-sm text-muted-foreground">In-kind donations of rice, oil, packaging or vehicles work just as well as cash.</p>
            <Link to="/contact" className="btn-outline mt-4 inline-flex">Get in touch</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
