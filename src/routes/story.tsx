import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowRight, Quote, Heart, ShoppingBag } from "lucide-react";
import portraitAsset from "@/assets/chef-portrait.png.asset.json";
import utensilsAsset from "@/assets/chef-utensils.png.asset.json";
import round2Asset from "@/assets/round-2.png.asset.json";
import { ORDER_URL } from "@/lib/constants";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "The Story — Chef Tye | Thank You Earth" },
      { name: "description", content: "How Chef Tye built a Lagos private-chef business from a university kitchen. The meaning behind TYE — Thank You Earth." },
      { property: "og:title", content: "The Story — Chef Tye" },
      { property: "og:description", content: "From university side-hustle to a Lagos kitchen with a loyal following." },
    ],
    links: [{ rel: "canonical", href: "https://chef-tye-online.vercel.app/story" }],
  }),
  component: StoryPage,
});

function StoryPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">The Story</div>
            <h1 className="mt-3 text-display text-6xl leading-[0.9] sm:text-7xl md:text-[6rem]">
              Thank <span className="text-brand">You</span> Earth.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/80">
              TYE isn't just a name. It's a posture. Gratitude for every small break, every friend who ate the first plate, every customer who came back for round 2.
            </p>
          </div>
          <div className="relative mx-auto max-w-md">
            <div className="overflow-hidden rounded-3xl ring-2 ring-brand">
              <img src={portraitAsset.url} alt="Chef Tye seated portrait in whites" className="aspect-[3/4] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8 md:py-24">
        <div className="prose prose-lg mx-auto max-w-none">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Chapter One</div>
          <h2 className="mt-2 text-display text-5xl">A university kitchen. A stubborn dream.</h2>
          <p className="mt-6 text-lg leading-relaxed text-foreground/85">
            Chef Tye's kitchen didn't start in a restaurant. It started in a small university flat, over a single pan, cooking for classmates who'd chip in for the ingredients.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-foreground/85">
            Word travelled. The pasta hit different. Orders stacked up between lectures. What started as help-with-rent turned into a waitlist, then a brand, then a business.
          </p>

          <figure className="my-12 rounded-3xl bg-cream/70 p-8 shadow-sm ring-1 ring-border">
            <Quote className="text-brand" size={32} />
            <blockquote className="mt-4 text-2xl font-semibold leading-snug text-foreground">
              "I named it TYE because everything I do is a thank you. To God, to my family, to the people who ate my food before anyone knew my name."
            </blockquote>
            <figcaption className="mt-4 text-sm font-bold uppercase tracking-widest text-brand">— Chef Tye</figcaption>
          </figure>

          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Chapter Two</div>
          <h2 className="mt-2 text-display text-5xl">The grind, plated.</h2>
          <p className="mt-6 text-lg leading-relaxed text-foreground/85">
            Every plate has a rhythm. Chop, sear, season, taste, plate. Chef Tye believes hard work is the seasoning you can't buy.
          </p>
        </div>
      </section>

      <section className="bg-brand py-16 text-brand-foreground md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 md:grid-cols-[1fr_1.2fr]">
          <div className="mx-auto max-w-sm overflow-hidden rounded-3xl">
            <img src={round2Asset.url} alt="There'll be Round 2 — Chef Tye poster" className="aspect-[3/4] w-full object-cover" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Round 2</div>
            <h2 className="mt-2 text-display text-5xl sm:text-6xl">We don't do one-hit meals.</h2>
            <p className="mt-4 text-lg leading-relaxed opacity-90">
              "There'll be Round 2" is more than a poster. It's the promise. Come hungry, leave planning your next order.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1.2fr_1fr] md:py-24">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Chapter Three</div>
          <h2 className="mt-2 text-display text-5xl">Giving back. On purpose.</h2>
          <p className="mt-6 text-lg leading-relaxed text-foreground/85">
            Every December, Chef Tye runs the <strong>Feed The Streets Campaign</strong>. Free meals for vulnerable and impoverished children across Lagos. TYE. Thank You Earth.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/charity" className="btn-primary"><Heart size={16} /> Support The Campaign</Link>
            <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <ShoppingBag size={16} /> Order Now <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-3xl">
            <img src={utensilsAsset.url} alt="Chef Tye standing with utensils" className="aspect-[3/4] w-full object-cover" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
