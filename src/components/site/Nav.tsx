import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, User as UserIcon } from "lucide-react";
import logoAsset from "@/assets/chef-tye-logo.png.asset.json";
import { ORDER_URL } from "@/lib/constants";
import { useAuth } from "@/lib/use-auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/story", label: "Story" },
  { to: "/menu", label: "Menu" },
  { to: "/join", label: "Join The Elites" },
  { to: "/charity", label: "Feed The Streets" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-charcoal/95 backdrop-blur-md shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]" : "bg-charcoal"
      }`}
      style={{ backgroundColor: scrolled ? undefined : "var(--charcoal)" }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3 group" onClick={() => setOpen(false)}>
          <img
            src={logoAsset.url}
            alt="Chef Tye logo"
            className="h-11 w-11 shrink-0 rounded-full bg-cream object-cover ring-2 ring-brand/60 transition-transform group-hover:scale-105"
          />
          <div className="min-w-0 leading-tight">
            <div className="text-display text-xl text-cream sm:text-2xl">CHEF TYE</div>
            <div className="truncate text-[10px] font-semibold uppercase tracking-[0.25em] text-brand">
              Private Chef · Lagos
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-brand" }}
              inactiveProps={{ className: "text-cream/85" }}
              className="relative rounded-full px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors hover:text-brand"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <Link
              to="/account"
              className="ml-2 inline-flex items-center gap-2 rounded-full border-2 border-cream/40 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:border-brand hover:text-brand"
            >
              <UserIcon size={14} /> Account
            </Link>
          ) : (
            <Link
              to="/auth"
              className="ml-2 inline-flex items-center gap-2 rounded-full border-2 border-cream/40 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:border-brand hover:text-brand"
            >
              Sign In
            </Link>
          )}
          <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className="btn-primary ml-2">
            Order Now
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-cream/40 text-cream transition-colors hover:border-brand hover:text-brand lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-cream/10 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "bg-brand/15 text-brand" }}
                inactiveProps={{ className: "text-cream/90" }}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-cream/10"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wider text-cream/90 transition-colors hover:bg-cream/10"
              >
                My Account
              </Link>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wider text-cream/90 transition-colors hover:bg-cream/10"
              >
                Sign In / Sign Up
              </Link>
            )}
            <a
              href={ORDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 w-full"
            >
              Order Now
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
