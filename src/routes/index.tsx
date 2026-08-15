import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Instagram, ShoppingBag, Heart, Star, ChefHat, Users,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import portraitAsset from "@/assets/chef-utensils.png.asset.json";
import round2Asset from "@/assets/round-2.png.asset.json";
import superstarAsset from "@/assets/superstar-meal.png.asset.json";
import meal2Asset from "@/assets/meal-2.png.asset.json";
import chowdeckAsset from "@/assets/chowdeck.png.asset.json";
import lustAsset from "@/assets/lust.png.asset.json";
import { ORDER_URL, INSTAGRAM_PRIMARY, INSTAGRAM_HANDLE_PRIMARY } from "@/lib/constants";
import { findMenuItem } from "@/lib/menu-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chef Tye — Private Chef in Lagos" },
      { name: "description", content: "Chef Tye is a Lagos private chef known for the Holy Grail pasta. Order on Chowdeck, book catering, and support Feed The Streets." },
      { property: "og:title", content: "Chef Tye — Private Chef in Lagos" },
      { property: "og:description", content: "Chef Tye is a Lagos private chef known for the Holy Grail pasta. Order on Chowdeck, book catering, and support Feed The Streets." },
    ],
  }),
  component: HomePage,
});

type Slide = {
  src: string;
  alt: string;
  label: string;
  tag: string;
  itemId?: string;
};

const carouselSlides: Slide[] = [
  { src: meal2Asset.url, alt: "Chef Tye Holy Grail pasta", label: "Holy Grail Pasta", tag: "Signature", itemId: "holy-grail" },
  { src: superstarAsset.url, alt: "ASAP asun-style pasta", label: "ASAP", tag: "Fan Favourite", itemId: "asap" },
  { src: round2Asset.url, alt: "There'll be Round 2 poster", label: "There'll Be Round 2", tag: "The Promise" },
  { src: lustAsset.url, alt: "Lust chicken potato stir-fry", label: "Lust", tag: "Potato Stir-Fry", itemId: "lust" },
  { src: chowdeckAsset.url, alt: "Chef Tye is now on Chowdeck", label: "Now on Chowdeck", tag: "Order Online" },
];

function MealCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 22,
    dragThreshold: 6,
    skipSnaps: false,
    containScroll: false,
    watchDrag: true,
  });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    let paused = false;
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    emblaApi.on("pointerDown", pause);
    emblaApi.on("pointerUp", resume);
    emblaApi.on("settle", resume);

    const id = setInterval(() => { if (!paused) emblaApi.scrollNext(); }, 4500);
    return () => {
      clearInterval(id);
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", pause);
      emblaApi.off("pointerUp", resume);
      emblaApi.off("settle", resume);
    };
  }, [emblaApi]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-3xl bg-charcoal shadow-2xl [touch-action:pan-y_pinch-zoom] [-webkit-tap-highlight-color:transparent]"
        ref={emblaRef}
      >
        <div className="flex [backface-visibility:hidden] [touch-action:pan-y_pinch-zoom]">
          {carouselSlides.map((s) => (
            <div key={s.label} className="relative min-w-0 flex-[0_0_100%] [transform:translate3d(0,0,0)]">
              <div className="aspect-[3/4] w-full overflow-hidden">
                <img src={s.src} alt={s.alt} draggable={false} className="h-full w-full select-none object-cover" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent p-5 text-cream">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand">{s.tag}</div>
                  <div className="text-display text-2xl leading-tight">{s.label}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                aria-label="Previous slide"
                className="absolute inset-y-0 left-0 w-1/2 cursor-default"
              />
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                aria-label="Next slide"
                className="absolute inset-y-0 right-0 w-1/2 cursor-default"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {carouselSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`h-2 cursor-pointer rounded-full transition-all ${selected === i ? "w-8 bg-brand" : "w-2 bg-cream/40 hover:bg-cream/70"}`}
          />
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const galleryItems: {
    src: string; alt: string; label: string; itemId?: string; price?: string; short?: string;
  }[] = [
    { src: superstarAsset.url, alt: "ASAP asun-style pasta", label: "ASAP", itemId: "asap" },
    { src: meal2Asset.url, alt: "Holy Grail pasta", label: "Holy Grail", itemId: "holy-grail" },
    { src: portraitAsset.url, alt: "Chef Tye portrait", label: "The Chef" },
    { src: lustAsset.url, alt: "Lust chicken potato stir-fry", label: "Lust", itemId: "lust" },
    { src: round2Asset.url, alt: "There'll be Round 2 poster", label: "Round 2" },
    { src: chowdeckAsset.url, alt: "Chef Tye is now on Chowdeck", label: "Now on Chowdeck" },
  ].map((it) => {
    const m = findMenuItem(it.itemId);
    return m ? { ...it, price: m.price, short: m.short } : it;
  });

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-brand/60 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div>
            <h1 className="text-display text-5xl leading-[0.9] sm:text-7xl md:text-[6.5rem]">
              LET'S SEE WHAT THE<br /><span className="text-brand">HYPE IS ALL ABOUT.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
              I'm <span className="font-bold text-cream">Chef Tye</span>, a private chef in Lagos. Bold pastas, rice bowls and stir-fries, <span className="font-bold text-brand">every plate cooked by me personally</span>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <ShoppingBag size={16} /> Order on Chowdeck
              </a>
              <Link to="/menu" className="btn-ghost-cream">See The Menu <ArrowRight size={16} /></Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-cream/70">
              <div className="flex items-center gap-1 text-brand">
                {Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={16} fill="currentColor" />))}
              </div>
              <span>Loved on Chowdeck and Instagram</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <MealCarousel />
            <div className="absolute -bottom-6 -left-6 hidden rotate-[-6deg] rounded-2xl bg-cream px-5 py-3 text-charcoal shadow-xl sm:block">
              <div className="text-script text-2xl leading-none text-brand">Chef Tye.</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em]">Hand-made. Every plate.</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden border-y border-cream/10 bg-charcoal/60 py-4">
          <div className="animate-marquee flex w-max gap-12 whitespace-nowrap text-display text-3xl text-cream/70">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-12">
                <span>HOLY GRAIL PASTA</span><span className="text-brand">★</span>
                <span>ASAP</span><span className="text-brand">★</span>
                <span>OBIAGELI</span><span className="text-brand">★</span>
                <span>RICH FLEX</span><span className="text-brand">★</span>
                <span>LUST</span><span className="text-brand">★</span>
                <span>ECSTASY</span><span className="text-brand">★</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 px-5 py-4 text-center text-sm font-black uppercase tracking-widest sm:px-8">
          <ChefHat size={18} /> Every meal is hand-prepared by Chef Tye himself. No shortcuts.
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 md:grid-cols-2 md:py-20">
        <Link
          to="/menu"
          search={{ item: "holy-grail" }}
          className="group relative cursor-pointer"
          aria-label="See Holy Grail on the menu"
        >
          <div className="card-lift overflow-hidden rounded-3xl">
            <img src={meal2Asset.url} alt="Chef Tye's signature Holy Grail pasta" className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          </div>
          <div className="absolute -right-4 -top-4 rounded-full bg-brand px-5 py-2 text-xs font-black uppercase tracking-widest text-brand-foreground shadow-lg sm:-right-8 sm:-top-8">Signature</div>
        </Link>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">The Signature</div>
          <h2 className="mt-3 text-display text-4xl sm:text-6xl">The Holy Grail Pasta</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            The plate that built the name. Stir-fry pasta with layered spices, a punchy sauce, and unreasonable amounts of love.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-foreground/80">
            <li className="flex items-center gap-2"><ChefHat size={16} className="text-brand" /> Holy Grail, ₦5,700</li>
            <li className="flex items-center gap-2"><ChefHat size={16} className="text-brand" /> Holy Grail Pro (with a full piece of chicken), ₦6,700</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/menu" className="btn-primary">View Full Menu <ArrowRight size={16} /></Link>
            <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">Order Now</a>
          </div>
        </div>
      </section>

      <section className="bg-cream/60 py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-8 md:grid-cols-[1.4fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-brand">
              <Users size={14} /> Loyalty and Rewards
            </div>
            <h2 className="mt-3 text-display text-4xl leading-[0.95] sm:text-6xl">
              Join the elites. <span className="text-brand">Earn on every plate.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Free account, <strong>1 point for every ₦1,000</strong> you spend. Free sides, VIP perks, and a year-end prize.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/join" className="btn-primary">See the perks</Link>
            <Link to="/auth" search={{ mode: "signup", next: "/account" }} className="btn-outline">Sign up free <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">The Kitchen</div>
              <h2 className="mt-2 text-display text-4xl sm:text-6xl">Plated with soul.</h2>
            </div>
            <a href={INSTAGRAM_PRIMARY} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <Instagram size={16} /> {INSTAGRAM_HANDLE_PRIMARY}
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:mt-8 lg:grid-cols-3">
            {galleryItems.map((it) => {
              const inner = (
                <>
                  <div className="overflow-hidden">
                    <img src={it.src} alt={it.alt} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-display text-2xl leading-none text-foreground">{it.label}</h3>
                      {it.price && (
                        <div className="mt-1.5 text-display text-2xl leading-none text-brand">{it.price}</div>
                      )}
                      {it.short && (
                        <p className="mt-1.5 truncate text-xs text-muted-foreground">{it.short}</p>
                      )}
                    </div>
                    <ArrowRight size={16} className="mt-1 shrink-0 translate-x-[-6px] text-brand opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </div>
                </>
              );
              return it.itemId ? (
                <Link
                  key={it.label}
                  to="/menu"
                  search={{ item: it.itemId }}
                  className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-border"
                  aria-label={`See ${it.label} on the menu`}
                >
                  {inner}
                </Link>
              ) : (
                <div key={it.label} className="group overflow-hidden rounded-2xl bg-card ring-1 ring-border">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-charcoal text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1fr_1.1fr] md:py-20">
          <div className="relative order-2 md:order-1">
            <div className="overflow-hidden rounded-3xl">
              <img src={portraitAsset.url} alt="Chef Tye in whites with utensils" className="aspect-[3/4] w-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-2xl bg-brand px-5 py-3 text-brand-foreground shadow-xl">
              <div className="text-display text-2xl leading-none">Chef Tye</div>
              <div className="text-[10px] font-bold uppercase tracking-widest">Every plate, by hand</div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">The Story</div>
            <h2 className="mt-2 text-display text-4xl sm:text-6xl">Built from the grind.</h2>
            <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg">
              Chef Tye started in a university kitchen with one goal: build something of his own and lift some weight off his family. Every meal is still cooked by him personally.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/story" className="btn-primary">Read the story <ArrowRight size={16} /></Link>
              <Link to="/charity" className="btn-ghost-cream"><Heart size={16} /> Feed The Streets</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand text-brand-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-10 sm:px-8 md:grid-cols-[1.5fr_auto] md:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-charcoal/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
              <Heart size={14} /> Every December
            </div>
            <h2 className="mt-4 text-display text-4xl leading-[0.95] sm:text-6xl">Feed The Streets Campaign</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-brand-foreground/90 sm:text-lg">
              Free hot meals for children across Lagos every December. Your donation puts a plate in a small hand.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/donate" className="rounded-full bg-charcoal px-7 py-3.5 text-sm font-black uppercase tracking-widest text-cream shadow-lg transition-all hover:-translate-y-0.5 hover:bg-charcoal/90">
              Donate Now
            </Link>
            <Link to="/charity" className="btn-outline" style={{ borderColor: "var(--cream)", color: "var(--cream)" }}>Learn More</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
