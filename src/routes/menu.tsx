import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ShoppingBag, Flame, Star } from "lucide-react";
import superstarAsset from "@/assets/superstar-meal.png.asset.json";
import meal2Asset from "@/assets/meal-2.png.asset.json";
import lustAsset from "@/assets/lust.png.asset.json";
import menuFlyerAsset from "@/assets/menu-flyer.png.asset.json";
import { ORDER_URL } from "@/lib/constants";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "The Menu — Chef Tye | Lagos Private Chef" },
      { name: "description", content: "Chef Tye's menu — Holy Grail pasta, ASAP, Obiageli, Rich Flex, Lust, Ecstasy. Order on Chowdeck." },
      { property: "og:title", content: "The Menu — Chef Tye" },
      { property: "og:description", content: "Holy Grail pasta, ASAP, Obiageli, Rich Flex, Lust, Ecstasy — the full Chef Tye menu." },
    ],
  }),
  component: MenuPage,
});

type Item = { name: string; price: string; desc?: string; tag?: string };
type Section = { title: string; items: Item[] };

const sections: Section[] = [
  {
    title: "Chef Tye Pasta",
    items: [
      { name: "Holy Grail", price: "₦5,700", desc: "Chef Tye's signature stir-fry pasta with chicken.", tag: "Signature" },
      { name: "Holy Grail Pro", price: "₦6,700", desc: "Stir-fry pasta with shredded chicken plus a full piece of chicken." },
      { name: "ASAP", price: "₦8,000", desc: "Chef Tye's goat-meat pasta, asun-style. Bold, smoky, spicy." },
      { name: "Obiageli", price: "₦6,500", desc: "Native pasta with smoked fish, egg and ponmo." },
    ],
  },
  {
    title: "Mains",
    items: [
      { name: "Rich Flex", price: "₦6,000", desc: "Chef Tye's 4-layered chicken sandwich." },
      { name: "Lust", price: "₦6,000", desc: "Chicken potato stir-fry with vegetables in a rich brown sauce." },
      { name: "Ecstasy", price: "₦15,000", desc: "Chef Tye's special chicken. Whole, slow-roasted, unreasonable." },
    ],
  },
  {
    title: "Extras",
    items: [
      { name: "Extra Chicken", price: "₦2,700" },
    ],
  },
];

function MenuPage() {
  return (
    <SiteLayout>
      <section className="bg-charcoal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">The Menu</div>
          <h1 className="mt-2 text-display text-6xl sm:text-7xl md:text-8xl">
            EAT WELL. <span className="text-brand">RUN IT BACK.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Prices in Nigerian Naira. Available for delivery on Chowdeck Chef Tye and direct order for catering. Menu updates from time to time. DM for daily specials.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-foreground">
            <Flame size={14} /> Every meal hand-prepared by Chef Tye himself
          </div>
          <div className="mt-6">
            <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <ShoppingBag size={16} /> Order on Chowdeck
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 md:grid-cols-2">
        {[
          { img: meal2Asset.url, title: "Holy Grail Pasta", price: "₦5,700", tag: "Signature",
            desc: "The plate that built the name. Stir-fry pasta, chicken, unfair amounts of flavour." },
          { img: superstarAsset.url, title: "ASAP", price: "₦8,000", tag: "Fan Favourite",
            desc: "Chef Tye's asun-style goat pasta — smoky, spicy, unforgettable." },
          { img: lustAsset.url, title: "Lust", price: "₦6,000", tag: "Comfort Plate",
            desc: "Chef Tye's chicken potato stir-fry with sweet potato, veggies, and house sauce." },
          { img: menuFlyerAsset.url, title: "Full Menu", price: "", tag: "Menu Flyer",
            desc: "The uploaded Chef Tye menu image with the full pasta, mains, and add-ons list." },
        ].map((c) => (
          <article key={c.title} className="card-lift group relative overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
            <div className="aspect-[16/10] w-full overflow-hidden">
              <img src={c.img} alt={c.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand">
                {c.tag === "Signature" ? <Flame size={12} /> : <Star size={12} />}
                {c.tag}
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-4">
                <h3 className="text-display text-3xl">{c.title}</h3>
                <span className="text-display text-2xl text-brand">{c.price}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          {sections.map((sec) => (
            <div key={sec.title} className="rounded-3xl border-2 border-charcoal bg-card p-6 sm:p-8">
              <h2 className="text-display text-4xl text-brand">{sec.title}</h2>
              <ul className="mt-6 divide-y divide-border">
                {sec.items.map((it) => (
                  <li key={it.name} className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 py-4 transition-colors hover:bg-brand/5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-display text-2xl text-foreground transition-colors group-hover:text-brand">{it.name}</h3>
                        {it.tag && (
                          <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-brand-foreground">{it.tag}</span>
                        )}
                      </div>
                      {it.desc && <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>}
                    </div>
                    <span className="text-display text-xl text-brand">{it.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-charcoal p-8 text-cream sm:p-12">
          <div className="grid items-center gap-6 md:grid-cols-[1.4fr_auto]">
            <div>
              <h3 className="text-display text-4xl">Big order? Private event?</h3>
              <p className="mt-2 max-w-xl text-cream/80">
                Chef Tye caters intimate dinners, birthdays and corporate lunches around Lagos. Tell us what you need and we'll build a plate list around it.
              </p>
            </div>
            <a href="/contact" className="btn-primary">Request Catering</a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
