import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ShoppingBag, Flame, Star } from "lucide-react";
import { MENU_ITEMS } from "@/lib/menu-data";
import { ORDER_URL } from "@/lib/constants";

const searchSchema = z.object({
  item: z.string().max(60).optional(),
});

export const Route = createFileRoute("/menu")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "The Menu — Chef Tye | Lagos Private Chef" },
      { name: "description", content: "Chef Tye's menu: Holy Grail pasta, ASAP, Obiageli, Rich Flex, Lust, Ecstasy. Tap any dish to see the full details. Order on Chowdeck." },
      { property: "og:title", content: "The Menu — Chef Tye" },
      { property: "og:description", content: "Holy Grail, ASAP, Obiageli, Rich Flex, Lust, Ecstasy. The full Chef Tye menu." },
    ],
  }),
  component: MenuPage,
});

const sections = ["Chef Tye Pasta", "Mains", "Extras"] as const;

function MenuPage() {
  const featured = MENU_ITEMS.filter((m) => ["holy-grail", "asap", "lust"].includes(m.id));

  return (
    <SiteLayout>
      <section className="bg-charcoal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">The Menu</div>
          <h1 className="mt-2 text-display text-6xl sm:text-7xl md:text-8xl">
            EAT WELL. <span className="text-brand">RUN IT BACK.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Prices in Nigerian Naira. Available on Chowdeck (Chef Tye) or direct for catering. The menu shifts a little from time to time.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream/70">
            <Flame size={14} className="text-brand" /> Every meal hand-prepared by Chef Tye himself
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <ShoppingBag size={16} /> Order on Chowdeck
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 md:grid-cols-2">
        {featured.map((c) => (
          <div
            key={c.id}
            className="group relative overflow-hidden rounded-3xl bg-card text-left shadow-sm ring-1 ring-border"
          >
            <div className="aspect-[16/10] w-full overflow-hidden">
              <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand">
                {c.tag === "Signature" ? <Flame size={12} /> : <Star size={12} />}
                {c.tag ?? "On The Menu"}
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-4">
                <h3 className="min-w-0 truncate text-display text-3xl">{c.name}</h3>
                <span className="shrink-0 text-display text-3xl font-bold text-brand">{c.price}</span>
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">{c.short}</p>
              <a
                href={ORDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-charcoal px-4 py-2 text-xs font-black uppercase tracking-widest text-foreground transition-colors hover:bg-brand hover:border-brand hover:text-brand-foreground"
              >
                <ShoppingBag size={14} /> Order
              </a>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          {sections.map((secName) => {
            const items = MENU_ITEMS.filter((m) => m.section === secName);
            return (
              <div key={secName} className="rounded-3xl border-2 border-charcoal bg-card p-6 sm:p-8">
                <h2 className="text-display text-4xl text-brand">{secName}</h2>
                <ul className="mt-6 divide-y divide-border">
                  {items.map((it) => (
                    <li key={it.id}>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 py-4 text-left">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-display text-2xl text-foreground">{it.name}</h3>
                            {it.tag && (
                              <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-brand-foreground">{it.tag}</span>
                            )}
                          </div>
                          {it.short && <p className="mt-1 text-sm text-muted-foreground">{it.short}</p>}
                          <a
                            href={ORDER_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-2 rounded-full border border-charcoal/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
                          >
                            <ShoppingBag size={12} /> Order
                          </a>
                        </div>
                        <span className="text-display text-xl text-brand">{it.price}</span>
                      </div>
                    </li>

                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-14 rounded-3xl bg-charcoal p-8 text-cream sm:p-12">
          <div className="grid items-center gap-6 md:grid-cols-[1.4fr_auto]">
            <div>
              <h3 className="text-display text-4xl">Big order? Private event?</h3>
              <p className="mt-2 max-w-xl text-cream/80">
                Chef Tye caters intimate dinners, birthdays and corporate lunches around Lagos. Tell us what you need and we'll build a plate list around it.
              </p>
            </div>
            <a href="/contact?type=catering" className="btn-primary">Request Catering</a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
