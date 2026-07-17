import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Instagram, ShoppingBag, Heart, Star, ChefHat, MapPin, Users,
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
import { ORDER_URL, INSTAGRAM_PRIMARY, INSTAGRAM_HANDLE_PRIMARY, MAPS_URL } from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chef Tye — Private Chef in Lagos" },
      { name: "description", content: "Chef Tye, a Lagos private chef known for the Holy Grail pasta. Order on Chowdeck, book catering, and support Feed The Streets." },
      { property: "og:title", content: "Chef Tye — Private Chef in Lagos" },
      { property: "og:description", content: "Chef Tye, a Lagos private chef known for the Holy Grail pasta. Order on Chowdeck, book catering, and support Feed The Streets." },
    ],
  }),
  component: HomePage,
});

const carouselSlides = [
  { src: meal2Asset.url, alt: "Chef Tye Holy Grail pasta", label: "Holy Grail Pasta", tag: "Signature" },
  { src: superstarAsset.url, alt: "ASAP asun-style pasta", label: "ASAP", tag: "Fan Favourite" },
  { src: round2Asset.url, alt: "There'll be Round 2 poster", label: "There'll Be Round 2", tag: "The Promise" },
  { src: lustAsset.url, alt: "Lust chicken potato stir-fry", label: "Lust", tag: "Potato Stir-Fry" },
  { src: chowdeckAsset.url, alt: "Chef Tye is now on Chowdeck", label: "Now on Chowdeck", tag: "Order Online" },
];

function MealCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    const id = setInterval(() => emblaApi?.scrollNext(), 4000);
    return () => { clearInterval(id); emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl bg-charcoal shadow-2xl" ref={emblaRef}>
        <div className="flex">
          {carouselSlides.map((s) => (
            <div key={s.label} className="relative min-w-0 flex-[0_0_100%]">
              <div className="aspect-[3/4] w-full overflow-hidden">
                <img src={s.src} alt={s.alt} className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent p-5 text-cream">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand">{s.tag}</div>
                  <div className="text-display text-2xl leading-tight">{s.label}</div>
                </div>
              </div>
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
            className={`h-2 rounded-full transition-all ${selected === i ? "w-8 bg-brand" : "w-2 bg-cream/40 hover:bg-cream/70"}`}
          />
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-brand/60 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.15fr_1fr] md:py-24">
          <div>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cream/80 backdrop-blur transition-colors hover:border-brand hover:text-brand">
              <MapPin size={14} className="text-brand" /> Private Chef · Lagos, NG
            </a>
            <h1 className="mt-6 text-display text-6xl leading-[0.9] sm:text-7xl md:text-[6.5rem]">
              THERE'LL BE<br /><span className="text-brand">ROUND 2.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/80">
              I'm <span className="font-bold text-cream">Chef Tye</span>, a Lagos private chef cooking the kind of food you go back for.
              Bold pastas, stir-fries and rice bowls, <span className="font-bold text-brand">every plate hand-prepared by me</span>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <ShoppingBag size={16} /> Order on Chowdeck
              </a>
              <Link to="/menu" className="btn-ghost-cream">See The Menu <ArrowRight size={16} /></Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-cream/70">
              <div className="flex items-center gap-1 text-brand">
                {Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={16} fill="currentColor" />))}
              </div>
              <span>Loved on Chowdeck & Instagram</span>
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

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
        <div className="relative">
          <div className="card-lift overflow-hidden rounded-3xl">
            <img src={meal2Asset.url} alt="Chef Tye's signature Holy Grail pasta" className="aspect-square w-full object-cover" />
          </div>
          <div className="absolute -right-4 -top-4 rounded-full bg-brand px-5 py-2 text-xs font-black uppercase tracking-widest text-brand-foreground shadow-lg sm:-right-8 sm:-top-8">Signature</div>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">The Signature</div>
          <h2 className="mt-3 text-display text-5xl sm:text-6xl">The Holy Grail Pasta</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            The plate that built the name. A stir-fry pasta so loud with flavour it'll make you send a voice note. Layered spices, punchy sauce, unfair amounts of love.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-foreground/80">
            <li className="flex items-center gap-2"><ChefHat size={16} className="text-brand" /> Holy Grail, ₦5,700</li>
            <li className="flex items-center gap-2"><ChefHat size={16} className="text-brand" /> Holy Grail Pro (with a full piece of chicken), ₦6,700</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/menu" className="btn-primary">View Full Menu <ArrowRight size={16} /></Link>
            <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">Order Now</a>
          </div>
        </div>
      </section>

      <section className="bg-cream/60 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-8 md:grid-cols-[1.4fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-brand">
              <Users size={14} /> Loyalty & Rewards
            </div>
            <h2 className="mt-3 text-display text-5xl leading-[0.95] sm:text-6xl">
              Join the family — <span className="text-brand">earn on every plate</span>.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Create a free Chef Tye account and earn <strong>1 point per ₦1,000</strong> you spend. Unlock free sides, VIP perks, and a year-end prize.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/join" className="btn-primary">See the perks</Link>
            <Link to="/auth" search={{ mode: "signup", next: "/account" }} className="btn-outline">Sign up free <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">The Kitchen</div>
              <h2 className="mt-2 text-display text-5xl sm:text-6xl">Plated with soul.</h2>
            </div>
            <a href={INSTAGRAM_PRIMARY} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <Instagram size={16} /> {INSTAGRAM_HANDLE_PRIMARY}
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { src: superstarAsset.url, alt: "ASAP asun-style pasta", label: "ASAP" },
              { src: meal2Asset.url, alt: "Holy Grail pasta", label: "Holy Grail" },
              { src: portraitAsset.url, alt: "Chef Tye portrait", label: "The Chef" },
              { src: lustAsset.url, alt: "Lust chicken potato stir-fry", label: "Lust" },
              { src: round2Asset.url, alt: "There'll be Round 2 poster", label: "Round 2" },
              { src: chowdeckAsset.url, alt: "Chef Tye is now on Chowdeck", label: "Now on Chowdeck" },
            ].map((it) => (
              <div key={it.label} className="group relative overflow-hidden rounded-2xl bg-charcoal">
                <img src={it.src} alt={it.alt} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-charcoal/90 to-transparent p-4 pt-10 text-cream">
                  <span className="text-sm font-bold uppercase tracking-widest">{it.label}</span>
                  <ArrowRight size={16} className="translate-x-[-6px] text-brand opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1fr_1.1fr] md:py-24">
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
            <h2 className="mt-2 text-display text-5xl sm:text-6xl">Built from the grind.</h2>
            <p className="mt-5 text-lg leading-relaxed text-cream/80">
              Chef Tye started in a university kitchen with one goal: build something for himself and lift some weight off the family that carried him. Every meal on the menu today is still hand-prepared by him personally.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/story" className="btn-primary">Read the story <ArrowRight size={16} /></Link>
              <Link to="/charity" className="btn-ghost-cream"><Heart size={16} /> Feed The Streets</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand text-brand-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_auto] md:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-charcoal/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
              <Heart size={14} /> Every December
            </div>
            <h2 className="mt-4 text-display text-5xl leading-[0.95] sm:text-6xl">Feed The Streets Campaign</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-foreground/90">
              Chef Tye's annual charity run. Free hot meals for vulnerable and impoverished children across Lagos. Your donation puts a plate in a small hand this December.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/donate" className="rounded-full bg-charcoal px-7 py-3.5 text-sm font-black uppercase tracking-widest text-cream shadow-lg transition-all hover:-translate-y-0.5 hover:bg-charcoal/90">
              Donate Now
            </Link>
            <Link to="/charity" className="btn-outline" style={{ borderColor: "var(--charcoal)", color: "var(--charcoal)" }}>Learn More</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
